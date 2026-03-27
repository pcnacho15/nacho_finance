'use client';

import React from 'react';
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import ExpenseModule from '@/app/components/finance/ExpenseModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Gastos' },
];

export default function ExpensePage() {
  return (
    <FinanceProvider>
      <div className="space-y-6">
        <BreadcrumbComp title="Gastos" items={BCrumb} />
        <ExpenseModule />
      </div>
    </FinanceProvider>
  );
}
