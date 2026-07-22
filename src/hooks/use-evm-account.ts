'use client';

import { useSyncExternalStore } from 'react';
import { getEvmAccount, subscribeAccounts } from '@/lib/evm-client';

// Shared store for the connected MetaMask account (lowercased). A single module-level
// value is read by every useEvmAccount() consumer, so connect/switch/disconnect update
// the whole UI at once. MetaMask does NOT fire accountsChanged on the first connect,
// so EvmConnectButton also pushes the address via setEvmAccount().

let account: string | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setEvmAccount(next: string | null): void {
  if (next === account) return;
  account = next;
  emit();
}

export async function refreshEvmAccount(): Promise<void> {
  setEvmAccount(await getEvmAccount());
}

function init() {
  if (initialized) return;
  initialized = true;
  getEvmAccount().then(setEvmAccount);
  subscribeAccounts(setEvmAccount); // reacts to wallet-driven account changes
}

function subscribe(cb: () => void): () => void {
  init();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useEvmAccount(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => account,
    () => null, // SSR snapshot
  );
}
