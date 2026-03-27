'use client';

import React from 'react';
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import IncomeModule from '@/app/components/finance/IncomeModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Ingresos' },
];

export default function IncomePage() {
  return (
    <FinanceProvider>
      <div className="space-y-6">
        <BreadcrumbComp title="Ingresos" items={BCrumb} />
        <IncomeModule />
      </div>
    </FinanceProvider>
  );
}
