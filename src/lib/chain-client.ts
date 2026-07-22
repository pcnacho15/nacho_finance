// Client-side chain dispatcher for send/validation, so UI stays chain-agnostic.
import { sendUsdt as sendUsdtTron, tronscanTxUrl } from './tron-client';
import { sendUsdtEvm, evmExplorerTxUrl } from './evm-client';

const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const EVM_RE = /^0x[0-9a-fA-F]{40}$/;

export function isValidAddress(chain: string, address: string): boolean {
  const a = address.trim();
  return chain === 'ethereum' ? EVM_RE.test(a) : TRON_RE.test(a);
}

export function addressPlaceholder(chain: string): string {
  return chain === 'ethereum' ? '0x…' : 'T…';
}

export function explorerTxUrl(chain: string, hash: string): string {
  return chain === 'ethereum' ? evmExplorerTxUrl(hash) : tronscanTxUrl(hash);
}

export async function sendUsdt(chain: string, to: string, amount: number): Promise<string> {
  return chain === 'ethereum' ? sendUsdtEvm(to, amount) : sendUsdtTron(to, amount);
}
