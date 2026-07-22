// Browser-only TRON helpers for Fase 2 (send USDT). Non-custodial: the transaction
// is built, signed and broadcast through the TronLink-injected `window.tronWeb`, so
// no private key ever reaches our server. Receiving needs no code — just the address.

const USDT_CONTRACT = process.env.NEXT_PUBLIC_TRON_USDT_CONTRACT ?? '';
const NETWORK = (process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'nile').toLowerCase();
const USDT_DECIMALS = 6;
const FEE_LIMIT = 100_000_000; // 100 TRX cap for the TRC20 transfer's energy

interface TronContractCall {
  send: (opts: { feeLimit: number }) => Promise<string>;
}
interface TronContract {
  transfer: (to: string, value: string) => TronContractCall;
}
interface InjectedTronWeb {
  fullNode?: { host?: string };
  defaultAddress?: { base58?: string | false };
  contract: () => { at: (address: string) => Promise<TronContract> };
}

declare global {
  interface Window {
    tronWeb?: InjectedTronWeb;
    tronLink?: unknown;
  }
}

export function getInjectedTronWeb(): InjectedTronWeb {
  const tw = typeof window !== 'undefined' ? window.tronWeb : undefined;
  if (!tw || !tw.defaultAddress?.base58) {
    throw new Error('TronLink no está disponible o no está conectado');
  }
  return tw;
}

// Guards against broadcasting to the wrong chain if TronLink is on another network.
export function assertExpectedNetwork(tw: InjectedTronWeb): void {
  const host = (tw.fullNode?.host ?? '').toLowerCase();
  const isNile = host.includes('nile');
  const isShasta = host.includes('shasta');
  const isMainnet = host.includes('trongrid.io') && !isNile && !isShasta;
  const ok =
    NETWORK === 'nile' ? isNile : NETWORK === 'shasta' ? isShasta : isMainnet;
  if (!ok) {
    throw new Error(`TronLink está en otra red. Cambia a ${NETWORK.toUpperCase()} para continuar.`);
  }
}

export function tronscanTxUrl(txid: string): string {
  const sub =
    NETWORK === 'nile'
      ? 'nile.tronscan.org'
      : NETWORK === 'shasta'
        ? 'shasta.tronscan.org'
        : 'tronscan.org';
  return `https://${sub}/#/transaction/${txid}`;
}

/**
 * Builds, signs (via TronLink prompt) and broadcasts a USDT (TRC20) transfer.
 * `amount` is in human units (USDT); returns the broadcast txid.
 */
export async function sendUsdt(to: string, amount: number): Promise<string> {
  if (!USDT_CONTRACT) throw new Error('NEXT_PUBLIC_TRON_USDT_CONTRACT no configurado');
  const tw = getInjectedTronWeb();
  assertExpectedNetwork(tw);

  const value = BigInt(Math.round(amount * 10 ** USDT_DECIMALS)).toString();
  const contract = await tw.contract().at(USDT_CONTRACT);
  const txid = await contract.transfer(to, value).send({ feeLimit: FEE_LIMIT });
  return txid;
}
