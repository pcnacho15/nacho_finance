'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CardBox from '../shared/CardBox';
import { ApexOptions } from 'apexcharts';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const IncomeExpenseChart: React.FC = () => {
  const { getMonthlyData, getTotalIncome, getTotalExpenses } = useFinance();
  const [period, setPeriod] = useState<'6m' | '12m'>('6m');
  
  const monthlyData = getMonthlyData();
  
  const chartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      type: "area",
      fontFamily: "inherit",
      height: 320,
      sparkline: { enabled: false },
    },
    colors: ["var(--color-primary)", "var(--color-secondary)"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "var(--text-muted-foreground)" },
    },
    xaxis: {
      categories: monthlyData.map((d) => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#7C8FAC" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${(val / 1000).toFixed(0)}K`,
        style: { colors: "#7C8FAC" },
      },
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      padding: { left: 10, right: 10 },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: number) => `$${val.toLocaleString()}` },
    },
  };

  const series = [
    {
      name: 'Ingresos',
      data: monthlyData.map(d => d.income),
    },
    {
      name: 'Gastos',
      data: monthlyData.map(d => d.expenses),
    },
  ];

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = totalIncome - totalExpenses;

  return (
    <CardBox className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="card-title">Ingresos vs Gastos</h5>
          <p className="text-sm text-muted-foreground font-normal">
            Últimos 6 meses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-success' : 'text-error'}`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <Chart options={chartOptions} series={series} type="area" height={280} width="100%" />
    </CardBox>
  );
};

export default IncomeExpenseChart;
