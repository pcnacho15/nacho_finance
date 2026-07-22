'use client';

import React, { useMemo, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { toast } from 'sonner';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import CardBox from '../shared/CardBox';
import SendUsdtDialog from './SendUsdtDialog';
import ReceiveUsdtDialog from './ReceiveUsdtDialog';
import { useEvmAccount } from '@/hooks/use-evm-account';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  WalletType,
  WalletTransactionType,
  WALLET_TYPE_LABELS,
  WALLET_TX_TYPE_LABELS,
  walletBalance,
  isIncomingTx,
  toNum,
} from '@/app/(DashboardLayout)/types/finance/wallet';

const WALLETS_KEY = '/api/crypto/wallets';
const PRICE_KEY = '/api/crypto/usdt/price';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const fmtUsdt = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)} USDT` : '— USDT');
const fmtUsd = (n: number) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '$—');

// Local YYYY-MM-DD (avoids the UTC shift of toISOString() near midnight).
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

const WalletsModule: React.FC = () => {
  const { data: wallets = [], isLoading } = useSWR<Wallet[]>(WALLETS_KEY, fetcher);
  const { address: tronAddress } = useWallet();
  const evmAddress = useEvmAccount();
  const { data: live } = useSWR<{ price: number; fetchedAt: number }>(PRICE_KEY, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });
  const livePrice = toNum(live?.price);
  const usdtPrice = livePrice > 0 ? livePrice : 1;

  const [walletDialog, setWalletDialog] = useState<{ open: boolean; wallet?: Wallet }>({
    open: false,
  });
  const [txDialog, setTxDialog] = useState<{ open: boolean; wallet?: Wallet }>({ open: false });

  const summary = useMemo(() => {
    const active = wallets.filter((w) => !w.archivedAt);
    const totalUsdt = active.reduce((s, w) => s + walletBalance(w), 0);
    return {
      totalUsdt,
      totalUsd: totalUsdt * usdtPrice,
      count: active.length,
    };
  }, [wallets, usdtPrice]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Saldo total</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtUsdt(summary.totalUsdt)}</div>
        </CardBox>
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Valor en USD</div>
          <div className="text-2xl font-semibold tabular-nums">{fmtUsd(summary.totalUsd)}</div>
          {live && (
            <p className="text-xs text-muted-foreground mt-1">
              @ {fmtUsd(usdtPrice)} / USDT
            </p>
          )}
        </CardBox>
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Billeteras activas</div>
          <div className="text-2xl font-semibold tabular-nums">{summary.count}</div>
        </CardBox>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Billeteras</h2>
        <Button onClick={() => setWalletDialog({ open: true })}>
          <Icon icon="solar:add-circle-bold" className="size-4 mr-1" />
          Nueva billetera
        </Button>
      </div>

      {isLoading ? (
        <CardBox className="p-6 text-center text-sm text-muted-foreground">Cargando…</CardBox>
      ) : wallets.length === 0 ? (
        <CardBox className="p-8 text-center">
          <Icon
            icon="solar:wallet-money-bold"
            className="size-12 mx-auto text-muted-foreground mb-2"
          />
          <h3 className="font-medium">Aún no tienes billeteras</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Registra dónde guardas tu USDT (Binance, Trust Wallet, cold storage…).
          </p>
          <Button onClick={() => setWalletDialog({ open: true })}>Crear la primera</Button>
        </CardBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((w) => (
            <WalletCard
              key={w.id}
              wallet={w}
              usdtPrice={usdtPrice}
              tronAddress={tronAddress ?? null}
              evmAddress={evmAddress}
              onEdit={() => setWalletDialog({ open: true, wallet: w })}
              onAddTx={() => setTxDialog({ open: true, wallet: w })}
            />
          ))}
        </div>
      )}

      <WalletDialog
        open={walletDialog.open}
        wallet={walletDialog.wallet}
        onClose={() => setWalletDialog({ open: false })}
      />
      <TransactionDialog
        open={txDialog.open}
        wallet={txDialog.wallet}
        onClose={() => setTxDialog({ open: false })}
      />
    </div>
  );
};

interface WalletCardProps {
  wallet: Wallet;
  usdtPrice: number;
  tronAddress: string | null;
  evmAddress: string | null;
  onEdit: () => void;
  onAddTx: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  usdtPrice,
  tronAddress,
  evmAddress,
  onEdit,
  onAddTx,
}) => {
  const [showTx, setShowTx] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const onchain = wallet.source === 'onchain';
  const isEvm = wallet.chain === 'ethereum';
  // The wallet can send only if its chain's provider is connected to this address.
  const isConnectedWallet =
    onchain &&
    (isEvm
      ? !!evmAddress && evmAddress === wallet.address
      : !!tronAddress && tronAddress === wallet.address);
  const balance = walletBalance(wallet);
  const usdValue = balance * usdtPrice;
  const txs = wallet.transactions ?? [];

  const handleSync = async () => {
    setSyncing(true);
    const res = await fetch('/api/crypto/wallets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId: wallet.id }),
    });
    setSyncing(false);
    if (res.ok) {
      const info = (await res.json()) as { synced: number };
      toast.success(`Sincronizado · ${info.synced} movimiento(s) nuevo(s)`);
      globalMutate(WALLETS_KEY);
    } else {
      toast.error('No se pudo sincronizar');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la billetera "${wallet.name}" y sus movimientos?`)) return;
    const res = await fetch(`/api/crypto/wallets?id=${wallet.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Billetera eliminada');
      globalMutate(WALLETS_KEY);
    } else {
      toast.error('No se pudo eliminar');
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm('¿Eliminar este movimiento?')) return;
    const res = await fetch(`/api/crypto/wallets/transactions?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Movimiento eliminado');
      globalMutate(WALLETS_KEY);
    } else {
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <CardBox className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{wallet.name}</h3>
            {onchain ? (
              <Badge
                className={
                  isEvm
                    ? 'bg-indigo-600 hover:bg-indigo-600'
                    : 'bg-emerald-600 hover:bg-emerald-600'
                }
              >
                <Icon icon="solar:link-bold" className="size-3 mr-1" />
                {isEvm ? 'Ethereum' : 'TRON'}
              </Badge>
            ) : (
              <Badge variant="secondary">{WALLET_TYPE_LABELS[wallet.type]}</Badge>
            )}
            {wallet.network && <Badge variant="outline">{wallet.network}</Badge>}
            {wallet.archivedAt && <Badge variant="destructive">Archivada</Badge>}
          </div>
          {onchain && wallet.address && (
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
              {wallet.address}
            </p>
          )}
          {wallet.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{wallet.notes}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={onEdit} title="Editar">
            <Icon icon="solar:pen-bold" className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDelete} title="Eliminar">
            <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <div className="text-xs text-muted-foreground">Saldo</div>
          <div className="font-medium tabular-nums">{fmtUsdt(balance)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Valor</div>
          <div className="font-medium tabular-nums">{fmtUsd(usdValue)}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {onchain ? (
          <Button size="sm" onClick={handleSync} disabled={syncing} className="flex-1">
            <Icon
              icon="solar:refresh-bold"
              className={`size-4 mr-1 ${syncing ? 'animate-spin' : ''}`}
            />
            {syncing ? 'Sincronizando…' : 'Sincronizar'}
          </Button>
        ) : (
          <Button size="sm" onClick={onAddTx} className="flex-1">
            <Icon icon="solar:add-circle-bold" className="size-4 mr-1" />
            Movimiento
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowTx((v) => !v)}
          disabled={txs.length === 0}
        >
          {showTx ? 'Ocultar' : `Ver (${txs.length})`}
        </Button>
      </div>

      {onchain && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            disabled={!isConnectedWallet}
            onClick={() => setSendOpen(true)}
            title={isConnectedWallet ? '' : 'Conecta esta wallet en TronLink para enviar'}
          >
            <Icon icon="solar:arrow-up-bold" className="size-4 mr-1" />
            Enviar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => setReceiveOpen(true)}
          >
            <Icon icon="solar:arrow-down-bold" className="size-4 mr-1" />
            Recibir
          </Button>
        </div>
      )}

      {onchain && wallet.lastSyncedAt && (
        <p className="text-xs text-muted-foreground mt-2">
          Última sincronización: {new Date(wallet.lastSyncedAt).toLocaleString()}
        </p>
      )}

      {onchain && wallet.address && (
        <>
          <SendUsdtDialog
            open={sendOpen}
            wallet={wallet}
            balance={balance}
            onClose={() => setSendOpen(false)}
          />
          <ReceiveUsdtDialog
            open={receiveOpen}
            address={wallet.address}
            network={wallet.network}
            onClose={() => setReceiveOpen(false)}
          />
        </>
      )}

      {showTx && txs.length > 0 && (
        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto border-t border-border pt-2">
          {txs.map((tx) => {
            const incoming = isIncomingTx(tx.type);
            const amt = toNum(tx.amount);
            const price = tx.pricePerUnit != null ? toNum(tx.pricePerUnit) : null;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-2 text-sm py-1"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={incoming ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'}
                      className={`size-4 ${incoming ? 'text-emerald-500' : 'text-rose-500'}`}
                    />
                    <span className={`font-medium tabular-nums ${incoming ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {incoming ? '+' : '−'}{fmtUsdt(amt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {WALLET_TX_TYPE_LABELS[tx.type]}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                    {price != null && ` · @ ${fmtUsd(price)}`}
                    {tx.counterparty && ` · ${tx.counterparty}`}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteTx(tx.id)}
                  title="Eliminar"
                >
                  <Icon icon="solar:close-circle-bold" className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </CardBox>
  );
};

interface WalletDialogProps {
  open: boolean;
  wallet?: Wallet;
  onClose: () => void;
}

const WalletDialog: React.FC<WalletDialogProps> = ({ open, wallet, onClose }) => {
  const editing = !!wallet;
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('exchange');
  const [network, setNetwork] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setName(wallet?.name ?? '');
      setType((wallet?.type as WalletType) ?? 'exchange');
      setNetwork(wallet?.network ?? '');
      setNotes(wallet?.notes ?? '');
    }
  }, [open, wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...(editing ? { id: wallet!.id } : {}),
      name: name.trim(),
      type,
      network: network.trim() || null,
      notes: notes.trim() || null,
    };
    const res = await fetch('/api/crypto/wallets', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? 'Billetera actualizada' : 'Billetera creada');
      globalMutate(WALLETS_KEY);
      onClose();
    } else {
      toast.error('No se pudo guardar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar billetera' : 'Nueva billetera'}</DialogTitle>
          <DialogDescription>
            Registra dónde guardas tu USDT. No se conecta a blockchain — es solo tu registro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="wallet-name">Nombre</Label>
            <Input
              id="wallet-name"
              required
              placeholder="p.ej. Binance Main"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as WalletType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(WALLET_TYPE_LABELS) as WalletType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {WALLET_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="wallet-network">Red (opcional)</Label>
              <Input
                id="wallet-network"
                placeholder="TRC20, ERC20…"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="wallet-notes">Notas</Label>
            <Textarea
              id="wallet-notes"
              rows={2}
              placeholder="Cualquier detalle adicional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface TransactionDialogProps {
  open: boolean;
  wallet?: Wallet;
  onClose: () => void;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({ open, wallet, onClose }) => {
  const [type, setType] = useState<WalletTransactionType>('buy');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [date, setDate] = useState(todayLocal);
  const [counterparty, setCounterparty] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setType('buy');
      setAmount('');
      setPricePerUnit('');
      setDate(todayLocal());
      setCounterparty('');
      setNotes('');
    }
  }, [open]);

  if (!wallet) return null;

  const priceRequired = type === 'buy' || type === 'sell';
  const canSubmit =
    !!amount && Number(amount) > 0 && (!priceRequired || (!!pricePerUnit && Number(pricePerUnit) > 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      walletId: wallet.id,
      type,
      amount: Number(amount),
      pricePerUnit: pricePerUnit ? Number(pricePerUnit) : null,
      // Parse YYYY-MM-DD as local midnight (not UTC) so the date doesn't shift a day.
      date: new Date(`${date}T00:00:00`).toISOString(),
      counterparty: counterparty.trim() || null,
      notes: notes.trim() || null,
    };
    const res = await fetch('/api/crypto/wallets/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Movimiento registrado');
      globalMutate(WALLETS_KEY);
      onClose();
    } else {
      toast.error('No se pudo registrar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo movimiento · {wallet.name}</DialogTitle>
          <DialogDescription>
            Compra, venta, depósito o retiro. El precio es obligatorio en compras y ventas
            (lo usamos para calcular ganancias).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as WalletTransactionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(WALLET_TX_TYPE_LABELS) as WalletTransactionType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {WALLET_TX_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-date">Fecha</Label>
              <Input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="tx-amount">Cantidad (USDT)</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.00000001"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tx-price">
                Precio USD {priceRequired ? '' : '(opcional)'}
              </Label>
              <Input
                id="tx-price"
                type="number"
                step="0.000001"
                min="0"
                required={priceRequired}
                placeholder="p.ej. 1.0001"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tx-counterparty">Contraparte (opcional)</Label>
            <Input
              id="tx-counterparty"
              placeholder="p.ej. Bancolombia, vendedor P2P"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tx-notes">Notas</Label>
            <Textarea
              id="tx-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving ? 'Guardando…' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WalletsModule;
