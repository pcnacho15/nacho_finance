'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import DebtModule from '@/app/components/finance/DebtModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Deudas' },
];

export default function DebtPage() {
  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Deudas" items={BCrumb} />
      <DebtModule />
    </div>
  );
}
