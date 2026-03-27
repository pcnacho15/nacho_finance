'use client';

import React from 'react';
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import CategoryModule from '@/app/components/finance/CategoryModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Categorías' },
];

export default function CategoriesPage() {
  return (
    <FinanceProvider>
      <div className="space-y-6">
        <BreadcrumbComp title="Categorías" items={BCrumb} />
        <CategoryModule />
      </div>
    </FinanceProvider>
  );
}
