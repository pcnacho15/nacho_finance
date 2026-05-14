'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Icon } from '@iconify/react/dist/iconify.js';
import CardBox from '../shared/CardBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface P2POffer {
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

interface P2PResponse {
  side: 'buy' | 'sell';
  offers: P2POffer[];
  error?: string;
}

const REFRESH_MS = 45_000;

// Binance payType identifiers for Colombia (verified against the live endpoint).
const PAY_METHODS = [
  { value: 'all', label: 'Todos los métodos' },
  { value: 'Nequi', label: 'Nequi' },
  { value: 'BancolombiaSA', label: 'Bancolombia' },
  { value: 'BancodeBogota', label: 'Banco de Bogotá' },
  { value: 'DaviviendaSA', label: 'Davivienda' },
  { value: 'BBVABank', label: 'BBVA' },
];

const fetcher = async (url: string): Promise<P2PResponse> => {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed: ${res.status}`);
  return json;
};

const fmtCop = (n: number) =>
  Number.isFinite(n) ? `$${Math.round(n).toLocaleString('es-CO')}` : '—';
const fmtUsdt = (n: number) =>
  Number.isFinite(n) ? `${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })}` : '—';

const P2POffersModule: React.FC = () => {
  const [payType, setPayType] = useState('all');
  const [amount, setAmount] = useState('');

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (payType !== 'all') p.set('payType', payType);
    if (amount && Number(amount) > 0) p.set('amount', amount);
    return p.toString();
  }, [payType, amount]);

  const buyKey = `/api/crypto/p2p?side=buy${qs ? `&${qs}` : ''}`;
  const sellKey = `/api/crypto/p2p?side=sell${qs ? `&${qs}` : ''}`;

  const { data: buy, error: buyError, isLoading: buyLoading } = useSWR<P2PResponse>(
    buyKey,
    fetcher,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: false },
  );
  const { data: sell, error: sellError, isLoading: sellLoading } = useSWR<P2PResponse>(
    sellKey,
    fetcher,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: false },
  );

  const buyOffers = buy?.offers ?? [];
  const sellOffers = sell?.offers ?? [];

  // To buy USDT you want the lowest price; to sell you want the highest.
  const bestBuy = buyOffers.length ? Math.min(...buyOffers.map((o) => o.price)) : null;
  const bestSell = sellOffers.length ? Math.max(...sellOffers.map((o) => o.price)) : null;
  const spread = bestBuy != null && bestSell != null ? bestSell - bestBuy : null;
  const spreadPct = spread != null && bestBuy ? (spread / bestBuy) * 100 : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Mejor precio de compra</div>
          <div className="text-2xl font-semibold tabular-nums">
            {bestBuy != null ? fmtCop(bestBuy) : '—'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Lo más barato para comprar USDT</p>
        </CardBox>
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Mejor precio de venta</div>
          <div className="text-2xl font-semibold tabular-nums">
            {bestSell != null ? fmtCop(bestSell) : '—'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Lo más alto para vender USDT</p>
        </CardBox>
        <CardBox className="p-4">
          <div className="text-sm text-muted-foreground">Spread actual</div>
          <div
            className={`text-2xl font-semibold tabular-nums ${
              spread != null && spread > 0 ? 'text-emerald-500' : ''
            }`}
          >
            {spread != null ? fmtCop(spread) : '—'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {spreadPct != null ? `${spreadPct.toFixed(2)}% entre compra y venta` : 'Diferencia compra/venta'}
          </p>
        </CardBox>
      </div>

      <CardBox className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Método de pago</Label>
            <Select value={payType} onValueChange={setPayType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAY_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="p2p-amount">Monto en COP (opcional)</Label>
            <Input
              id="p2p-amount"
              type="number"
              min="0"
              placeholder="p.ej. 500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Datos de Binance P2P · se actualizan cada 45s · solo informativo, la app no ejecuta operaciones.
        </p>
      </CardBox>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <OffersTable
          title="Comprar USDT"
          icon="solar:arrow-down-bold"
          accent="emerald"
          offers={buyOffers}
          loading={buyLoading}
          error={buyError ? buyError.message : buy?.error}
        />
        <OffersTable
          title="Vender USDT"
          icon="solar:arrow-up-bold"
          accent="rose"
          offers={sellOffers}
          loading={sellLoading}
          error={sellError ? sellError.message : sell?.error}
        />
      </div>
    </div>
  );
};

interface OffersTableProps {
  title: string;
  icon: string;
  accent: 'emerald' | 'rose';
  offers: P2POffer[];
  loading: boolean;
  error?: string;
}

const OffersTable: React.FC<OffersTableProps> = ({ title, icon, accent, offers, loading, error }) => {
  const accentClass = accent === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
  return (
    <CardBox className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon={icon} className={`size-5 ${accentClass}`} />
        <h3 className="font-medium">{title}</h3>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-sm text-rose-500 py-8 justify-center">
          <Icon icon="solar:danger-circle-bold" className="size-4" />
          {error}
        </div>
      ) : loading && offers.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Cargando ofertas…</div>
      ) : offers.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No hay ofertas para los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comerciante</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead>Límites / Métodos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => (
                <TableRow key={o.advNo}>
                  <TableCell>
                    <div className="font-medium truncate max-w-[160px]">{o.merchant}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.monthOrders} órdenes · {(o.completionRate * 100).toFixed(0)}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {fmtCop(o.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtUsdt(o.available)} USDT
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {fmtCop(o.minAmount)} – {fmtCop(o.maxAmount)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {o.payMethods.slice(0, 3).map((m) => (
                        <Badge key={m} variant="secondary" className="text-[10px]">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardBox>
  );
};

export default P2POffersModule;
