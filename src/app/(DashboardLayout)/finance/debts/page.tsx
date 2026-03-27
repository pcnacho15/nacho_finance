'use client';

import React from 'react';
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import DebtModule from '@/app/components/finance/DebtModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Deudas' },
];

export default function DebtPage() {
  return (
    <FinanceProvider>
      <div className="space-y-6">
        <BreadcrumbComp title="Deudas" items={BCrumb} />
        <DebtModule />
      </div>
    </FinanceProvider>
  );
}
