'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import CategoryModule from '@/app/components/finance/CategoryModule';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { title: 'Categorías' },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Categorías" items={BCrumb} />
      <CategoryModule />
    </div>
  );
}
