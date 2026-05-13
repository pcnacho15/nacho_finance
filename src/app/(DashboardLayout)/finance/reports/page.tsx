'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import ReportsModule from '@/app/components/finance/ReportsModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Reportes' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Reportes" items={BCrumb} />
      <ReportsModule />
    </div>
  );
}
