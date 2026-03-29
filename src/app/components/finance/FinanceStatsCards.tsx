'use client';

import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import CardBox from '../shared/CardBox';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { format } from 'date-fns';

const FinanceStatsCards: React.FC = () => {
  const { getTotalIncome, getTotalExpenses, getBalance, debts, savingsGoals } = useFinance();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const totalDebt = debts.reduce((sum, d) => sum + d.currentAmount, 0);
  const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const stats = [
    {
      title: "Balance Total",
      value: formatCurrency(balance),
      change: balance >= 0 ? "+" : "",
      changeType: balance >= 0 ? "foreground" : "muted-foreground",
      icon: "solar:wallet-money-bold",
      bgColor: balance >= 0 ? "bg-muted" : "bg-muted",
      iconColor: balance >= 0 ? "text-foreground" : "text-muted-foreground",
    },
    {
      title: "Ingresos Totales",
      value: formatCurrency(totalIncome),
      change: "100%",
      changeType: "foreground",
      icon: "solar:money-bag-bold",
      bgColor: "bg-muted",
      iconColor: "text-foreground",
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(totalExpenses),
      change: "-",
      changeType: "muted-foreground",
      icon: "solar:card-send-bold",
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    {
      title: "Deudas Pendientes",
      value: formatCurrency(totalDebt),
      change: `${debts.filter((d) => d.status === "active").length} activas`,
      changeType: "muted-foreground",
      icon: "solar:document-text-bold",
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    {
      title: "Ahorros Acumulados",
      value: formatCurrency(totalSavings),
      change: `${savingsGoals.filter((g) => g.status === "completed").length} completadas`,
      changeType: "foreground",
      icon: "solar:hand-money-linear",
      bgColor: "bg-muted",
      iconColor: "text-foreground",
    },
  ];

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <CardBox key={index} className="hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-normal mb-1">{stat.title}</p>
              <h4 className="text-xl font-bold mb-1">{stat.value}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium text-${stat.changeType}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <Icon icon={stat.icon} className={`text-2xl ${stat.iconColor}`} />
            </div>
          </div>
        </CardBox>
      ))}
    </div>
  );
};

export default FinanceStatsCards;
