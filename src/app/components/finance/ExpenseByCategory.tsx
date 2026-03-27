'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CardBox from '../shared/CardBox';
import { ApexOptions } from 'apexcharts';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { Icon } from '@iconify/react/dist/iconify.js';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const ExpenseByCategory: React.FC = () => {
  const { expenses, categories } = useFinance();

  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.categoryId === expense.categoryId);
    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        categoryColor: expense.categoryColor,
        total: expense.amount,
        count: 1,
      });
    }
    return acc;
  }, [] as { categoryId: string; categoryName: string; categoryColor: string; total: number; count: number }[]);

  expensesByCategory.sort((a, b) => b.total - a.total);
  const topCategories = expensesByCategory.slice(0, 6);
  const totalExpenses = topCategories.reduce((sum, cat) => sum + cat.total, 0);

  const chartOptions: ApexOptions = {
    series: topCategories.map((cat) => cat.total),
    labels: topCategories.map((cat) => cat.categoryName),
    chart: {
      type: "donut",
      fontFamily: "inherit",
      height: 280,
    },
    colors: topCategories.map((cat) => cat.categoryColor),
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--muted-foreground)",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: "bold",
              color: "var(--foreground)",
              formatter: (val: string) =>
                `$${(parseInt(val) / 1000).toFixed(1)}K`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              color: "var(--muted-foreground)",
              formatter: () => `$${(totalExpenses / 1000).toFixed(1)}K`,
            },
          },
        },
      },
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: number) => `$${val.toLocaleString()}` },
    },
  };

  return (
    <CardBox>
      <h5 className="card-title mb-6">Gastos por Categoría</h5>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 flex justify-center">
          <Chart
            options={chartOptions}
            series={chartOptions.series as number[]}
            type="donut"
            height={280}
            width="100%"
          />
        </div>
        <div className="flex-1 space-y-3">
          {topCategories.map((cat, index) => {
            const percentage = ((cat.total / totalExpenses) * 100).toFixed(1);
            return (
              <div key={cat.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.categoryColor }}
                  />
                  <span className="text-sm font-medium">{cat.categoryName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">${cat.total.toLocaleString()}</span>
                  <span className="text-xs font-medium text-muted-foreground">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardBox>
  );
};

export default ExpenseByCategory;
