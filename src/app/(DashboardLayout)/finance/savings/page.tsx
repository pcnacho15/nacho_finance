'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import SavingsModule from '@/app/components/finance/SavingsModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Metas de Ahorro' },
];

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Metas de Ahorro" items={BCrumb} />
      <SavingsModule />
    </div>
  );
}
