'use client';

import React, { useState } from 'react';
import { mutate as globalMutate } from 'swr';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import CardBox from '../shared/CardBox';
import { Button } from '@/components/ui/button';
import { connectEvm, switchEvmAccount, disconnectEvm } from '@/lib/evm-client';
import { useEvmAccount, setEvmAccount } from '@/hooks/use-evm-account';

const WALLETS_KEY = '/api/crypto/wallets';
const NETWORK = (process.env.NEXT_PUBLIC_EVM_NETWORK ?? 'sepolia').toUpperCase();

// Connects MetaMask, registers the address as an Ethereum on-chain wallet and runs
// an initial sync. Supports switching account and disconnecting (EIP-2255), matching
// the TRON adapter's UX. Independent of the TRON adapter (uses window.ethereum).
const EvmConnectButton: React.FC = () => {
  const account = useEvmAccount();
  const [busy, setBusy] = useState(false);

  const register = async (address: string) => {
    const res = await fetch('/api/crypto/wallets/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, chain: 'ethereum' }),
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
    return info;
  };

  const handleConnect = async () => {
    setBusy(true);
    try {
      const address = await connectEvm();
      setEvmAccount(address); // MetaMask won't fire accountsChanged on first connect
      const info = await register(address);
      toast.success(
        info
          ? `Wallet Ethereum conectada · ${info.synced} movimiento(s) nuevo(s)`
          : 'Wallet Ethereum conectada',
      );
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'No se pudo conectar MetaMask');
    } finally {
      setBusy(false);
    }
  };

  const handleSwitch = async () => {
    setBusy(true);
    try {
      const address = await switchEvmAccount();
      setEvmAccount(address);
      await register(address);
      toast.success('Cuenta cambiada y sincronizada');
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'No se pudo cambiar de cuenta');
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      const ok = await disconnectEvm();
      if (ok) {
        setEvmAccount(null);
        toast.success('MetaMask desconectada');
      } else {
        toast.message(
          'Desconéctala desde la extensión de MetaMask (tu wallet no permite hacerlo desde la dApp).',
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <CardBox className="p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium flex items-center gap-2">
            <Icon icon="solar:link-bold" className="size-4 text-indigo-500" />
            Conectar wallet Ethereum
            <span className="text-xs font-normal rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
              {NETWORK}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 break-all">
            {account
              ? `Conectada: ${account}`
              : 'Conecta MetaMask para sincronizar tu USDT (ERC20) automáticamente.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {account ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSwitch} disabled={busy}>
                <Icon icon="solar:refresh-bold" className={`size-4 mr-1 ${busy ? 'animate-spin' : ''}`} />
                Cambiar cuenta
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={busy}>
                <Icon icon="solar:logout-2-bold" className="size-4 mr-1" />
                Desconectar
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={busy}>
              {busy ? (
                <>
                  <Icon icon="solar:refresh-bold" className="size-4 mr-1 animate-spin" />
                  Conectando…
                </>
              ) : (
                <>
                  <Icon icon="solar:wallet-bold" className="size-4 mr-1" />
                  Conectar MetaMask
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </CardBox>
  );
};

export default EvmConnectButton;
