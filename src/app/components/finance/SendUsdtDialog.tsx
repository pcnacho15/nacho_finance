'use client';

import React, { useEffect, useState } from 'react';
import { mutate as globalMutate } from 'swr';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Wallet } from '@/app/(DashboardLayout)/types/finance/wallet';
import {
  sendUsdt,
  explorerTxUrl,
  isValidAddress,
  addressPlaceholder,
} from '@/lib/chain-client';

const WALLETS_KEY = '/api/crypto/wallets';

interface SendUsdtDialogProps {
  open: boolean;
  wallet: Wallet;
  balance: number;
  onClose: () => void;
}

const SendUsdtDialog: React.FC<SendUsdtDialogProps> = ({ open, wallet, balance, onClose }) => {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo('');
      setAmount('');
    }
  }, [open]);

  const chain = wallet.chain ?? 'tron';
  const amountNum = Number(amount);
  const validTo = isValidAddress(chain, to);
  const validAmount = amountNum > 0 && amountNum <= balance;
  const canSubmit = validTo && validAmount && !sending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const txid = await sendUsdt(chain, to.trim(), amountNum);
      toast.success('USDT enviado', {
        description: `${amountNum} USDT → ${to.trim().slice(0, 8)}…`,
        action: { label: 'Ver tx', onClick: () => window.open(explorerTxUrl(chain, txid), '_blank') },
      });
      onClose();
      // Give the network a few seconds to confirm + index, then reflect it locally.
      setTimeout(() => {
        fetch('/api/crypto/wallets/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletId: wallet.id }),
        })
          .then(() => globalMutate(WALLETS_KEY))
          .catch(() => undefined);
      }, 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar USDT</DialogTitle>
          <DialogDescription>
            Desde {wallet.name}. Firmarás la transacción en tu wallet
            {chain === 'ethereum' ? ' (MetaMask)' : ' (TronLink)'}; el envío es on-chain e
            irreversible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="send-to">Dirección destino</Label>
            <Input
              id="send-to"
              required
              placeholder={addressPlaceholder(chain)}
              className="font-mono"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {to.trim() !== '' && !validTo && (
              <p className="text-xs text-rose-600">
                Dirección {chain === 'ethereum' ? 'Ethereum' : 'TRON'} inválida.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="send-amount">Cantidad (USDT)</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setAmount(String(balance))}
              >
                Máx: {balance.toFixed(2)}
              </button>
            </div>
            <Input
              id="send-amount"
              type="number"
              step="0.000001"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {amount !== '' && amountNum > balance && (
              <p className="text-xs text-rose-600">Saldo insuficiente.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {sending ? (
                <>
                  <Icon icon="solar:refresh-bold" className="size-4 mr-1 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Icon icon="solar:arrow-up-bold" className="size-4 mr-1" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendUsdtDialog;
