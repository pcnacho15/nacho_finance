'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import FixedExpenseModule from '@/app/components/finance/FixedExpenseModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Gastos Fijos' },
];

export default function FixedExpensePage() {
  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Gastos Fijos" items={BCrumb} />
      <FixedExpenseModule />
    </div>
  );
}
