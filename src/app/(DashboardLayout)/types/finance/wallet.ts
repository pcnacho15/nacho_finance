export type WalletType = 'exchange' | 'hot' | 'cold' | 'other';
export type WalletTransactionType = 'buy' | 'sell' | 'deposit' | 'withdrawal';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  pricePerUnit?: number | null;
  date: string | Date;
  counterparty?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  asset: string;
  network?: string | null;
  notes?: string | null;
  archivedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  transactions?: WalletTransaction[];
}

export interface WalletFormData {
  name: string;
  type: WalletType;
  asset?: string;
  network?: string | null;
  notes?: string | null;
}

export interface WalletTransactionFormData {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  pricePerUnit?: number | null;
  date: Date;
  counterparty?: string | null;
  notes?: string | null;
}

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  exchange: 'Exchange',
  hot: 'Hot wallet',
  cold: 'Cold wallet',
  other: 'Otro',
};

export const WALLET_TX_TYPE_LABELS: Record<WalletTransactionType, string> = {
  buy: 'Compra',
  sell: 'Venta',
  deposit: 'Depósito',
  withdrawal: 'Retiro',
};

// buy + deposit increase holdings; sell + withdrawal decrease them.
export function isIncomingTx(type: WalletTransactionType): boolean {
  return type === 'buy' || type === 'deposit';
}

export function toNum(value: unknown): number {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function walletBalance(wallet: Wallet): number {
  if (!Array.isArray(wallet.transactions)) return 0;
  return wallet.transactions.reduce((sum, tx) => {
    const amt = toNum(tx?.amount);
    return isIncomingTx(tx?.type) ? sum + amt : sum - amt;
  }, 0);
}
