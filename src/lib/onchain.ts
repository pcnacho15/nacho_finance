// Chain dispatcher: maps a wallet's `chain` to the right read-only adapter. Both
// adapters expose the same trio, so /connect and /sync stay chain-agnostic.
import type { OnchainTransfer } from './tron';
import * as tron from './tron';
import * as evm from './evm';

export type OnchainChain = 'tron' | 'ethereum';

export interface ChainAdapter {
  isValidAddress(address: string): boolean;
  getTransfers(address: string): Promise<OnchainTransfer[]>;
  getBalance(address: string): Promise<number>;
  /** Value stored in Wallet.network for display. */
  networkLabel: string;
}

const tronAdapter: ChainAdapter = {
  isValidAddress: tron.isTronAddress,
  getTransfers: tron.getOnchainTransfers,
  getBalance: tron.getUsdtBalance,
  networkLabel: 'TRC20',
};

const evmAdapter: ChainAdapter = {
  isValidAddress: evm.isEvmAddress,
  getTransfers: evm.getOnchainTransfers,
  getBalance: evm.getUsdtBalance,
  networkLabel: 'ERC20',
};

export function getChainAdapter(chain: string): ChainAdapter {
  return chain === 'ethereum' ? evmAdapter : tronAdapter;
}

// Normalizes an address for storage/dedup: EVM is case-insensitive → lowercase.
export function normalizeAddress(chain: string, address: string): string {
  return chain === 'ethereum' ? address.toLowerCase() : address.trim();
}
