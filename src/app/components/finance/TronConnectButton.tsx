'use client';

import React, { useEffect, useRef, useState } from 'react';
import { mutate as globalMutate } from 'swr';
import { toast } from 'sonner';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletActionButton } from '@tronweb3/tronwallet-adapter-react-ui';
import { Icon } from '@iconify/react/dist/iconify.js';
import CardBox from '../shared/CardBox';

const WALLETS_KEY = '/api/crypto/wallets';
const NETWORK = (process.env.NEXT_PUBLIC_TRON_NETWORK ?? 'nile').toUpperCase();

// When a TronLink wallet connects, register its address as an on-chain wallet and
// run an initial sync. Guarded so it runs once per connected address.
const TronConnectButton: React.FC = () => {
  const { address, connected } = useWallet();
  const registeredAddress = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!connected || !address) return;
    if (registeredAddress.current === address) return;
    registeredAddress.current = address;

    (async () => {
      setBusy(true);
      try {
        const res = await fetch('/api/crypto/wallets/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        if (!res.ok) throw new Error('connect failed');
        const wallet = (await res.json()) as { id: string };

        const syncRes = await fetch('/api/crypto/wallets/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletId: wallet.id }),
        });
        const info = syncRes.ok ? ((await syncRes.json()) as { synced: number }) : null;

        globalMutate(WALLETS_KEY);
        toast.success(
          info
            ? `Wallet conectada · ${info.synced} movimiento(s) nuevo(s)`
            : 'Wallet conectada',
        );
      } catch {
        registeredAddress.current = null; // allow retry
        toast.error('No se pudo vincular la wallet');
      } finally {
        setBusy(false);
      }
    })();
  }, [connected, address]);

  return (
    <CardBox className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium flex items-center gap-2">
            <Icon icon="solar:link-bold" className="size-4 text-primary" />
            Conectar wallet TRON
            <span className="text-xs font-normal rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
              {NETWORK}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 break-all">
            {connected && address
              ? `Conectada: ${address}`
              : 'Conecta TronLink para sincronizar tus USDT (TRC20) automáticamente.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {busy && (
            <Icon
              icon="solar:refresh-bold"
              className="size-4 animate-spin text-muted-foreground"
            />
          )}
          <WalletActionButton />
        </div>
      </div>
    </CardBox>
  );
};

export default TronConnectButton;
