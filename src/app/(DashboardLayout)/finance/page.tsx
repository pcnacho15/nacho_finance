'use client';

import React from 'react';
import { FinanceProvider } from '@/app/context/finance-context/FinanceContext';
import FinanceDashboard from '@/app/components/finance/FinanceDashboard';

export default function FinancePage() {
  return (
    <FinanceProvider>
      <FinanceDashboard />
    </FinanceProvider>
  );
}
