// Binance has no official public P2P API. This uses the same unofficial endpoint
// the P2P web UI calls. It can change or rate-limit without notice — always go
// through the in-memory cache below and degrade gracefully on failure.

const ENDPOINT = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
const CACHE_TTL_MS = 45_000;

export type P2PSide = 'buy' | 'sell';

export interface P2POffer {
  advNo: string;
  price: number;
  available: number;
  minAmount: number;
  maxAmount: number;
  payMethods: string[];
  merchant: string;
  monthOrders: number;
  completionRate: number;
  merchantType: string;
}

export interface P2PSearchOpts {
  side: P2PSide;
  payType?: string;
  amount?: number;
  rows?: number;
}

interface CacheEntry {
  data: P2POffer[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

interface BinanceAdv {
  advNo: string;
  price: string;
  surplusAmount: string;
  minSingleTransAmount: string;
  maxSingleTransAmount: string;
  tradeMethods?: { identifier?: string; tradeMethodName?: string }[];
}

interface BinanceAdvertiser {
  nickName: string;
  monthOrderCount?: number;
  monthFinishRate?: number;
  userType?: string;
}

interface BinanceP2PResponse {
  code: string;
  data?: { adv: BinanceAdv; advertiser: BinanceAdvertiser }[];
}

export async function fetchP2POffers(opts: P2PSearchOpts): Promise<P2POffer[]> {
  const { side, payType, amount, rows = 10 } = opts;
  const cacheKey = `${side}|${payType ?? ''}|${amount ?? ''}|${rows}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const body = {
    asset: 'USDT',
    fiat: 'COP',
    tradeType: side === 'buy' ? 'BUY' : 'SELL',
    page: 1,
    rows,
    payTypes: payType ? [payType] : [],
    publisherType: null,
    transAmount: amount ? String(amount) : '',
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Binance P2P respondió ${res.status}`);

  const json = (await res.json()) as BinanceP2PResponse;
  if (json.code !== '000000' || !Array.isArray(json.data)) {
    throw new Error('Respuesta inválida de Binance P2P');
  }

  const offers: P2POffer[] = json.data.map(({ adv, advertiser }) => ({
    advNo: adv.advNo,
    price: Number(adv.price),
    available: Number(adv.surplusAmount),
    minAmount: Number(adv.minSingleTransAmount),
    maxAmount: Number(adv.maxSingleTransAmount),
    payMethods: (adv.tradeMethods ?? [])
      .map((m) => m.tradeMethodName || m.identifier || '')
      .filter(Boolean),
    merchant: advertiser.nickName,
    monthOrders: advertiser.monthOrderCount ?? 0,
    completionRate: advertiser.monthFinishRate ?? 0,
    merchantType: advertiser.userType ?? 'user',
  }));

  cache.set(cacheKey, { data: offers, expiresAt: Date.now() + CACHE_TTL_MS });
  return offers;
}
