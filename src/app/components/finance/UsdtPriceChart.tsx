'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { ApexOptions } from 'apexcharts';
import CardBox from '../shared/CardBox';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react/dist/iconify.js';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type PricePoint = { t: number; price: number };

const RANGES = [
  { value: '1', label: '24h' },
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
  { value: '365', label: '1a' },
] as const;

type RangeValue = (typeof RANGES)[number]['value'];

const POLL_INTERVAL_MS = 10_000;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const UsdtPriceChart: React.FC = () => {
  const [days, setDays] = useState<RangeValue>('7');
  const [liveTrail, setLiveTrail] = useState<PricePoint[]>([]);
  const lastDaysRef = useRef<RangeValue>(days);

  const { data: history, isLoading: loadingHistory, error: historyError } = useSWR<{
    points: PricePoint[];
  }>(`/api/crypto/usdt/history?days=${days}`, fetcher, {
    revalidateOnFocus: false,
  });

  const { data: live, error: liveError } = useSWR<{ price: number; fetchedAt: number }>(
    '/api/crypto/usdt/price',
    fetcher,
    { refreshInterval: POLL_INTERVAL_MS, revalidateOnFocus: false },
  );

  useEffect(() => {
    if (lastDaysRef.current !== days) {
      lastDaysRef.current = days;
      setLiveTrail([]);
    }
  }, [days]);

  useEffect(() => {
    if (!live) return;
    setLiveTrail((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.t === live.fetchedAt) return prev;
      const next = [...prev, { t: live.fetchedAt, price: live.price }];
      return next.length > 600 ? next.slice(-600) : next;
    });
  }, [live]);

  const points = useMemo<PricePoint[]>(() => {
    const base = history?.points ?? [];
    if (liveTrail.length === 0) return base;
    const lastBaseT = base[base.length - 1]?.t ?? 0;
    const trail = liveTrail.filter((p) => p.t > lastBaseT);
    return [...base, ...trail];
  }, [history, liveTrail]);

  const stats = useMemo(() => {
    if (points.length === 0) return null;
    const first = points[0].price;
    const last = points[points.length - 1].price;
    const min = points.reduce((m, p) => Math.min(m, p.price), points[0].price);
    const max = points.reduce((m, p) => Math.max(m, p.price), points[0].price);
    const changeAbs = last - first;
    const changePct = first !== 0 ? (changeAbs / first) * 100 : 0;
    return { first, last, min, max, changeAbs, changePct };
  }, [points]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        fontFamily: 'inherit',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
        height: 360,
      },
      stroke: { curve: 'smooth', width: 2 },
      colors: ['#22c55e'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'datetime',
        labels: {
          // ApexCharts renders datetime axes in UTC by default — force local time.
          datetimeUTC: false,
          style: { colors: 'var(--muted-foreground)' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: 'var(--muted-foreground)' },
          formatter: (v: number) => `$${v.toFixed(4)}`,
        },
      },
      grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
      tooltip: {
        theme: 'dark',
        x: { format: 'dd MMM yyyy HH:mm', datetimeUTC: false },
        y: { formatter: (v: number) => `$${v.toFixed(6)} USD` },
      },
    }),
    [],
  );

  const series = useMemo(
    () => [
      {
        name: 'USDT/USD',
        data: points.map((p) => [p.t, p.price]),
      },
    ],
    [points],
  );

  const fmt = (n: number) => `${n.toFixed(4)} USD$`;
  const trendUp = (stats?.changeAbs ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <CardBox className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums">
              {live ? fmt(live.price) : '—'}
            </span>
            {stats && (
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  trendUp ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                <Icon
                  icon={trendUp ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
                  className="size-4"
                />
                {trendUp ? '+' : ''}
                {stats.changeAbs.toFixed(6)} ({stats.changePct.toFixed(2)}%)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                size="sm"
                variant={days === r.value ? 'default' : 'outline'}
                onClick={() => setDays(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
        {live && (
          <p className="mt-2 text-xs text-muted-foreground">
            Última actualización: {new Date(live.fetchedAt).toLocaleTimeString()} · refresco cada 10s
          </p>
        )}
      </CardBox>

      <CardBox className="p-4">
        {historyError ? (
          <div className="flex items-center gap-2 text-sm text-rose-500">
            <Icon icon="solar:danger-circle-bold" className="size-4" />
            No se pudo cargar el histórico.
          </div>
        ) : loadingHistory && points.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
            Cargando histórico…
          </div>
        ) : (
          <Chart options={chartOptions} series={series} type="area" height={360} />
        )}
        {liveError && (
          <p className="mt-2 text-xs text-amber-500">Polling en vivo pausado: {liveError.message}</p>
        )}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Mínimo" value={fmt(stats.min)} />
            <Stat label="Máximo" value={fmt(stats.max)} />
            <Stat label="Apertura rango" value={fmt(stats.first)} />
            <Stat label="Último" value={fmt(stats.last)} />
          </div>
        )}
      </CardBox>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-border p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-medium tabular-nums">{value}</div>
  </div>
);

export default UsdtPriceChart;
