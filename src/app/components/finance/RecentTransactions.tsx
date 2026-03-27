'use client';

import React from 'react';
import CardBox from '../shared/CardBox';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { format } from 'date-fns';

const RecentTransactions: React.FC = () => {
  const { incomes, expenses } = useFinance();

  const allTransactions = [
    ...incomes.map(i => ({
      id: i.id,
      type: 'income' as const,
      description: i.description,
      amount: i.amount,
      categoryName: i.categoryName,
      categoryColor: i.categoryColor,
      date: new Date(i.date),
    })),
    ...expenses.map(e => ({
      id: e.id,
      type: 'expense' as const,
      description: e.description,
      amount: e.amount,
      categoryName: e.categoryName,
      categoryColor: e.categoryColor,
      date: new Date(e.date),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTransactions = allTransactions.slice(0, 8);

  return (
    <CardBox>
      <div className="flex items-center justify-between mb-6">
        <h5 className="card-title">Transacciones Recientes</h5>
        <a href="/finance/transactions" className="text-sm text-primary hover:underline">
          Ver todas
        </a>
      </div>
      
      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon icon="solar:receipt-linear" className="text-4xl mb-2 mx-auto opacity-50" />
          <p>No hay transacciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${transaction.categoryColor}20` }}
                >
                  <Icon
                    icon={transaction.type === 'income' ? 'solar:arrow-right-up-bold' : 'solar:arrow-right-down-bold'}
                    className="text-lg"
                    style={{ color: transaction.categoryColor }}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.categoryName} • {format(transaction.date, 'dd MMM')}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </CardBox>
  );
};

export default RecentTransactions;
