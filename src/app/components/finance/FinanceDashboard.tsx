'use client';

import React from 'react';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';
import {
  FinanceStatsCards,
  IncomeExpenseChart,
  ExpenseByCategory,
  RecentTransactions,
  SavingsGoalsCard,
  DebtOverview
} from '@/app/components/finance';
import ProfileWelcome from '../dashboard/ProfileWelcome';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Finanzas' },
];

const FinanceDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* <BreadcrumbComp title="Dashboard de Finanzas" items={BCrumb} /> */}
      <ProfileWelcome />

      <FinanceStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart />
        <ExpenseByCategory />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions />
        <SavingsGoalsCard />
        <DebtOverview />
      </div>
    </div>
  );
};

export default FinanceDashboard;
