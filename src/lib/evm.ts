// Server-side EVM layer for USDT (ERC20), read-only. Reads balances and Transfer
// history from a public JSON-RPC via viem — no API key needed. Public RPCs cap
// eth_getLogs block ranges, so history is scanned in windows with topic filters
// (from/to = address) so each window returns few logs. Same OnchainTransfer shape
// as tron.ts, so onchain.ts can dispatch by chain uniformly.

import {
  createPublicClient,
  http,
  defineChain,
  isAddress,
  getAddress,
  formatUnits,
  parseAbiItem,
  erc20Abi,
  type PublicClient,
} from 'viem';
import type { OnchainTransfer } from './tron';

const TRANSFER_EVENT = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);
const LOG_WINDOW = BigInt(9000); // stay under the common 10k-block getLogs cap
const ONE = BigInt(1);
const ZERO = BigInt(0);
const CACHE_TTL_MS = 30_000;

interface EvmConfig {
  rpcUrl: string;
  usdtContract: `0x${string}`;
  chainId: number;
  decimals: number;
  lookbackBlocks: bigint;
  network: string;
}

function getEvmConfig(): EvmConfig {
  const rpcUrl = process.env.EVM_RPC_URL;
  const usdtContract = process.env.EVM_USDT_CONTRACT;
  if (!rpcUrl) throw new Error('EVM_RPC_URL no configurado');
  if (!usdtContract) throw new Error('EVM_USDT_CONTRACT no configurado');
  return {
    rpcUrl,
    usdtContract: getAddress(usdtContract),
    chainId: Number(process.env.EVM_CHAIN_ID ?? '11155111'),
    decimals: Number(process.env.EVM_USDT_DECIMALS ?? '6'),
    lookbackBlocks: BigInt(process.env.EVM_SYNC_LOOKBACK_BLOCKS ?? '100000'),
    network: process.env.EVM_NETWORK ?? 'sepolia',
  };
}

let cachedClient: PublicClient | null = null;
function getClient(cfg: EvmConfig): PublicClient {
  if (cachedClient) return cachedClient;
  const chain = defineChain({
    id: cfg.chainId,
    name: cfg.network,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [cfg.rpcUrl] } },
  });
  cachedClient = createPublicClient({ chain, transport: http(cfg.rpcUrl) });
  return cachedClient;
}

export function isEvmAddress(address: string): boolean {
  return isAddress(address);
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const transfersCache = new Map<string, CacheEntry<OnchainTransfer[]>>();
const balanceCache = new Map<string, CacheEntry<number>>();

/** Current USDT (ERC20) balance in human units. */
export async function getUsdtBalance(address: string): Promise<number> {
  const cfg = getEvmConfig();
  const key = `${cfg.chainId}|${cfg.usdtContract}|${address}`;
  const cached = balanceCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const client = getClient(cfg);
  const raw = (await client.readContract({
    address: cfg.usdtContract,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [getAddress(address)],
  })) as bigint;
  const balance = Number(formatUnits(raw, cfg.decimals));
  const safe = Number.isFinite(balance) ? balance : 0;

  balanceCache.set(key, { data: safe, expiresAt: Date.now() + CACHE_TTL_MS });
  return safe;
}

/**
 * ERC20 USDT transfers involving `address`, scanned over the configured lookback in
 * getLogs-sized windows. Incoming (to === address) → deposit, outgoing → withdrawal.
 */
export async function getOnchainTransfers(address: string): Promise<OnchainTransfer[]> {
  const cfg = getEvmConfig();
  const target = getAddress(address);
  const key = `${cfg.chainId}|${cfg.usdtContract}|${target}`;
  const cached = transfersCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const client = getClient(cfg);
  const head = await client.getBlockNumber();
  const start = head > cfg.lookbackBlocks ? head - cfg.lookbackBlocks : ZERO;

  type RawLog = { transactionHash: `0x${string}`; blockNumber: bigint; args: { from?: `0x${string}`; to?: `0x${string}`; value?: bigint } };
  const collected = new Map<string, RawLog>();

  for (let from = start; from <= head; from += LOG_WINDOW + ONE) {
    const to = from + LOG_WINDOW > head ? head : from + LOG_WINDOW;
    // Two topic-filtered queries keep each window's result set tiny.
    const [incoming, outgoing] = await Promise.all([
      client.getLogs({ address: cfg.usdtContract, event: TRANSFER_EVENT, args: { to: target }, fromBlock: from, toBlock: to }),
      client.getLogs({ address: cfg.usdtContract, event: TRANSFER_EVENT, args: { from: target }, fromBlock: from, toBlock: to }),
    ]);
    for (const log of [...incoming, ...outgoing] as unknown as RawLog[]) {
      collected.set(log.transactionHash, log);
    }
  }

  // Resolve block timestamps once per unique block.
  const blockTimes = new Map<bigint, number>();
  await Promise.all(
    [...new Set([...collected.values()].map((l) => l.blockNumber))].map(async (bn) => {
      const block = await client.getBlock({ blockNumber: bn });
      blockTimes.set(bn, Number(block.timestamp) * 1000);
    }),
  );

  const result: OnchainTransfer[] = [];
  for (const log of collected.values()) {
    const value = log.args.value ?? ZERO;
    const amount = Number(formatUnits(value, cfg.decimals));
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const incoming = (log.args.to ?? '').toLowerCase() === target.toLowerCase();
    result.push({
      txHash: log.transactionHash,
      type: incoming ? 'deposit' : 'withdrawal',
      amount,
      fromAddress: log.args.from ?? '',
      toAddress: log.args.to ?? '',
      date: new Date(blockTimes.get(log.blockNumber) ?? Date.now()),
    });
  }

  transfersCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}
