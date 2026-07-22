// Server-side TRON layer for Fase 1 (read-only). Reads USDT (TRC20) transfers and
// balances from TronGrid's REST API. No signing, no private keys — solo lectura.
// TronGrid can rate-limit, so every network read goes through the in-memory cache
// below and degrades gracefully on failure (same pattern as binance-p2p.ts).

import { TronWeb } from 'tronweb';

const CACHE_TTL_MS = 30_000;
const DEFAULT_MAX_PAGES = 5; // 5 * 200 = 1000 transfers per sync — enough for Fase 1.
const PAGE_SIZE = 200;

export interface TronConfig {
  fullHost: string;
  apiKey: string;
  usdtContract: string;
  network: string;
}

export function getTronConfig(): TronConfig {
  const fullHost = process.env.TRON_FULLHOST;
  const usdtContract = process.env.TRON_USDT_CONTRACT;
  if (!fullHost) throw new Error('TRON_FULLHOST no configurado');
  if (!usdtContract) throw new Error('TRON_USDT_CONTRACT no configurado');
  return {
    fullHost: fullHost.replace(/\/$/, ''),
    apiKey: process.env.TRONGRID_API_KEY ?? '',
    usdtContract,
    network: process.env.TRON_NETWORK ?? 'nile',
  };
}

// Base58 TRON addresses are checksummed; TronWeb validates that. Cheap, offline call.
export function isTronAddress(address: string): boolean {
  try {
    return TronWeb.isAddress(address);
  } catch {
    return false;
  }
}

// --- Raw TronGrid shapes (only the fields we consume) ---

interface RawTrc20Transfer {
  transaction_id: string;
  from: string;
  to: string;
  value: string;
  type: string;
  block_timestamp: number;
  token_info?: { symbol?: string; address?: string; decimals?: number };
}

interface TransfersResponse {
  data?: RawTrc20Transfer[];
  success?: boolean;
  meta?: { links?: { next?: string } };
}

interface AccountResponse {
  data?: { trc20?: Record<string, string>[] }[];
}

// --- Domain shape ready for DB upsert ---

export type OnchainTxType = 'deposit' | 'withdrawal';

export interface OnchainTransfer {
  txHash: string;
  type: OnchainTxType;
  amount: number;
  fromAddress: string;
  toAddress: string;
  date: Date;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const transfersCache = new Map<string, CacheEntry<RawTrc20Transfer[]>>();
const balanceCache = new Map<string, CacheEntry<number>>();

function tronHeaders(apiKey: string): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (apiKey) headers['TRON-PRO-API-KEY'] = apiKey;
  return headers;
}

/**
 * Fetch USDT (TRC20) transfers for `address`, newest first, following TronGrid
 * pagination up to `maxPages`. `minTimestamp` (ms) enables incremental sync.
 */
export async function fetchUsdtTransfers(
  address: string,
  opts: { minTimestamp?: number; maxPages?: number } = {},
): Promise<RawTrc20Transfer[]> {
  const { minTimestamp, maxPages = DEFAULT_MAX_PAGES } = opts;
  const { fullHost, apiKey, usdtContract } = getTronConfig();

  const cacheKey = `${address}|${usdtContract}|${minTimestamp ?? ''}|${maxPages}`;
  const cached = transfersCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const base = `${fullHost}/v1/accounts/${address}/transactions/trc20`;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    only_confirmed: 'true',
    contract_address: usdtContract,
  });
  if (minTimestamp) params.set('min_timestamp', String(minTimestamp));

  let url: string | undefined = `${base}?${params.toString()}`;
  const all: RawTrc20Transfer[] = [];

  for (let page = 0; page < maxPages && url; page += 1) {
    const res: Response = await fetch(url, {
      headers: tronHeaders(apiKey),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`TronGrid respondió ${res.status}`);
    const json = (await res.json()) as TransfersResponse;
    if (json.success === false) throw new Error('Respuesta inválida de TronGrid');

    for (const t of json.data ?? []) {
      // Guard: only genuine USDT transfers on our contract.
      if (t.type === 'Transfer' && t.token_info?.address === usdtContract) all.push(t);
    }

    const next = json.meta?.links?.next;
    url = next && (json.data?.length ?? 0) === PAGE_SIZE ? next : undefined;
  }

  transfersCache.set(cacheKey, { data: all, expiresAt: Date.now() + CACHE_TTL_MS });
  return all;
}

/**
 * Convert raw transfers into DB-ready rows relative to `walletAddress`:
 * incoming (to === wallet) → deposit, outgoing (from === wallet) → withdrawal.
 */
export function mapTransfers(
  transfers: RawTrc20Transfer[],
  walletAddress: string,
): OnchainTransfer[] {
  const out: OnchainTransfer[] = [];
  for (const t of transfers) {
    const incoming = t.to === walletAddress;
    const outgoing = t.from === walletAddress;
    if (!incoming && !outgoing) continue; // unrelated transfer, skip

    const decimals = t.token_info?.decimals ?? 6;
    const amount = Number(t.value) / 10 ** decimals;
    if (!Number.isFinite(amount) || amount <= 0) continue;

    out.push({
      txHash: t.transaction_id,
      type: incoming ? 'deposit' : 'withdrawal',
      amount,
      fromAddress: t.from,
      toAddress: t.to,
      date: new Date(t.block_timestamp),
    });
  }
  return out;
}

/** Fetch + map in one step — the shape the chain dispatcher (onchain.ts) consumes. */
export async function getOnchainTransfers(address: string): Promise<OnchainTransfer[]> {
  const raw = await fetchUsdtTransfers(address);
  return mapTransfers(raw, address);
}

/** Current USDT balance (human units) via TronGrid's account endpoint. */
export async function getUsdtBalance(address: string): Promise<number> {
  const { fullHost, apiKey, usdtContract } = getTronConfig();

  const cacheKey = `${address}|${usdtContract}`;
  const cached = balanceCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const res = await fetch(`${fullHost}/v1/accounts/${address}`, {
    headers: tronHeaders(apiKey),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`TronGrid respondió ${res.status}`);
  const json = (await res.json()) as AccountResponse;

  const trc20 = json.data?.[0]?.trc20 ?? [];
  let raw = '0';
  for (const entry of trc20) {
    if (usdtContract in entry) {
      raw = entry[usdtContract];
      break;
    }
  }
  const balance = Number(raw) / 1e6; // USDT = 6 decimals
  const safe = Number.isFinite(balance) ? balance : 0;

  balanceCache.set(cacheKey, { data: safe, expiresAt: Date.now() + CACHE_TTL_MS });
  return safe;
}
