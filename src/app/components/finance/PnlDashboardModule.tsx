'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { ApexOptions } from 'apexcharts';
import CardBox from '../shared/CardBox';
import { Icon } from '@iconify/react/dist/iconify.js';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PnlResult {
  holdings: number;
  avgCost: number;
  totalCost: number;
  realizedPnl: number;
  tradeCount: number;
  buyVolume: number;
  sellVolume: number;
  timeline: { date: string; realizedPnl: number; holdings: number; avgCost: number }[];
  monthlyPnl: { month: string; realized: number }[];
}

const DASHBOARD_KEY = '/api/crypto/dashboard';
const PRICE_KEY = '/api/crypto/usdt/price';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const fmtUsd = (n: number) => (Number.isFinite(n) ? `$${n.toFixed(2)}` : '$—');
const fmtUsdt = (n: number) =>
  Number.isFinite(n) ? `${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })} USDT` : '— USDT';
const fmtSigned = (n: number) =>
  `${n >= 0 ? '+' : '−'}$${Math.abs(n).toFixed(2)}`;

const PnlDashboardModule: React.FC = () => {
  const { data, isLoading, error } = useSWR<PnlResult>(DASHBOARD_KEY, fetcher);
  const { data: live } = useSWR<{ price: number; fetchedAt: number }>(PRICE_KEY, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const livePrice = num(live?.price) > 0 ? num(live?.price) : 1;

  const metrics = useMemo(() => {
    if (!data) return null;
    const holdings = num(data.holdings);
    const avgCost = num(data.avgCost);
    const realized = num(data.realizedPnl);
    const holdingsValue = holdings * livePrice;
    const unrealized = holdings * (livePrice - avgCost);
    return {
      holdings,
      avgCost,
      realized,
      unrealized,
      total: realized + unrealized,
      holdingsValue,
      tradeCount: num(data.tradeCount),
      buyVolume: num(data.buyVolume),
      sellVolume: num(data.sellVolume),
    };
  }, [data, livePrice]);

  const cumulativeOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, height: 300 },
      stroke: { curve: 'smooth', width: 2 },
      colors: ['#22c55e'],
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'datetime',
        labels: { datetimeUTC: false, style: { colors: 'var(--muted-foreground)' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--muted-foreground)' },
          formatter: (v: number) => `$${v.toFixed(0)}`,
        },
      },
      grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
      tooltip: {
        theme: 'dark',
        x: { format: 'dd MMM yyyy', datetimeUTC: false },
        y: { formatter: (v: number) => `$${v.toFixed(2)}` },
      },
    }),
    [],
  );

  const monthlyOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, height: 300 },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
      colors: ['#3b82f6'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: data?.monthlyPnl.map((m) => m.month) ?? [],
        labels: { style: { colors: 'var(--muted-foreground)' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--muted-foreground)' },
          formatter: (v: number) => `$${v.toFixed(0)}`,
        },
      },
      grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
      tooltip: { theme: 'dark', y: { formatter: (v: number) => `$${v.toFixed(2)}` } },
    }),
    [data],
  );

  const cumulativeSeries = useMemo(
    () => [
      {
        name: 'P&L realizado acumulado',
        data: (data?.timeline ?? []).map((p) => [
          new Date(p.date).getTime(),
          num(p.realizedPnl),
        ]),
      },
    ],
    [data],
  );

  const monthlySeries = useMemo(
    () => [{ name: 'Ganancia', data: (data?.monthlyPnl ?? []).map((m) => num(m.realized)) }],
    [data],
  );

  if (error) {
    return (
      <CardBox className="p-8 text-center">
        <Icon icon="solar:danger-circle-bold" className="size-10 mx-auto text-rose-500 mb-2" />
        <p className="text-sm text-muted-foreground">No se pudo cargar el dashboard.</p>
      </CardBox>
    );
  }

  if (isLoading || !metrics) {
    return (
      <CardBox className="p-8 text-center text-sm text-muted-foreground">
        Calculando tus ganancias…
      </CardBox>
    );
  }

  if (metrics.tradeCount === 0 && metrics.holdings === 0) {
    return (
      <CardBox className="p-8 text-center">
        <Icon icon="solar:chart-2-bold" className="size-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="font-medium">Aún no hay datos de trading</h3>
        <p className="text-sm text-muted-foreground">
          Registra compras y ventas de USDT en tus billeteras y aquí verás tus ganancias y pérdidas.
        </p>
      </CardBox>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="P&L total"
          value={fmtSigned(metrics.total)}
          tone={metrics.total >= 0 ? 'pos' : 'neg'}
          sub="Realizado + no realizado"
        />
        <StatCard
          label="P&L realizado"
          value={fmtSigned(metrics.realized)}
          tone={metrics.realized >= 0 ? 'pos' : 'neg'}
          sub="De ventas cerradas"
        />
        <StatCard
          label="P&L no realizado"
          value={fmtSigned(metrics.unrealized)}
          tone={metrics.unrealized >= 0 ? 'pos' : 'neg'}
          sub={`@ ${fmtUsd(livePrice)} / USDT`}
        />
        <StatCard
          label="Holdings actuales"
          value={fmtUsdt(metrics.holdings)}
          sub={`Valor ${fmtUsd(metrics.holdingsValue)}`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Costo promedio" value={fmtUsd(metrics.avgCost)} sub="Por USDT" />
        <StatCard label="Operaciones" value={String(metrics.tradeCount)} sub="Compras + ventas" />
        <StatCard label="Volumen comprado" value={fmtUsdt(metrics.buyVolume)} />
        <StatCard label="Volumen vendido" value={fmtUsdt(metrics.sellVolume)} />
      </div>

      <CardBox className="p-4">
        <h3 className="font-medium mb-3">P&L realizado acumulado</h3>
        {cumulativeSeries[0].data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            Sin operaciones registradas todavía.
          </div>
        ) : (
          <Chart options={cumulativeOptions} series={cumulativeSeries} type="area" height={300} />
        )}
      </CardBox>

      <CardBox className="p-4">
        <h3 className="font-medium mb-3">Ganancia por mes</h3>
        {monthlySeries[0].data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            Aún no hay ventas registradas.
          </div>
        ) : (
          <Chart options={monthlyOptions} series={monthlySeries} type="bar" height={300} />
        )}
      </CardBox>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'pos' | 'neg';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, tone }) => {
  const toneClass =
    tone === 'pos' ? 'text-emerald-500' : tone === 'neg' ? 'text-rose-500' : '';
  return (
    <CardBox className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardBox>
  );
};

export default PnlDashboardModule;
