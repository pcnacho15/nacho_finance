'use client';

import React from 'react';
import CardBox from '../shared/CardBox';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { Progress } from '@/components/ui/progress';
import { DEBT_TYPE_LABELS } from '@/app/(DashboardLayout)/types/finance';

const DebtOverview: React.FC = () => {
  const { debts } = useFinance();

  const activeDebts = debts.filter(d => d.status === 'active');
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.currentAmount, 0);
  const totalPaid = activeDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  const monthlyPayment = activeDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  return (
    <CardBox>
      <div className="flex items-center justify-between mb-6">
        <h5 className="card-title">Resumen de Deudas</h5>
        <a href="/finance/debts" className="text-sm text-foreground hover:underline">
          Gestionar
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-muted text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Pendiente</p>
          <p className="text-xl font-bold text-foreground">
            ${totalDebt.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Pagado</p>
          <p className="text-xl font-bold text-foreground">
            ${totalPaid.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progreso de pago</span>
          <span className="text-sm font-medium">
            {totalPaid > 0 ? Math.round((totalPaid / (totalDebt + totalPaid)) * 100) : 0}%
          </span>
        </div>
        <Progress
          value={totalPaid > 0 ? (totalPaid / (totalDebt + totalPaid)) * 100 : 0}
          className="h-3"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 mb-4">
        <div className="flex items-center gap-2">
          <Icon icon="solar:calendar-mark-bold" className="text-muted-foreground" />
          <span className="text-sm">Pago mensual estimado</span>
        </div>
        <span className="font-semibold">${monthlyPayment.toLocaleString()}</span>
      </div>

      {activeDebts.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          <Icon icon="solar:check-circle-bold" className="text-3xl mb-2 mx-auto text-foreground" />
          <p>¡No tienes deudas activas!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Deudas Activas</p>
          {activeDebts.slice(0, 3).map((debt) => {
            const percentage = Math.round((debt.paidAmount / (debt.paidAmount + debt.currentAmount)) * 100);
            return (
              <div key={debt.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:document-text-bold" className="text-error" />
                    <span className="font-medium text-sm">{debt.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {DEBT_TYPE_LABELS[debt.type]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>${debt.currentAmount.toLocaleString()} restante</span>
                  <span>{percentage}% pagado</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            );
          })}
        </div>
      )}
    </CardBox>
  );
};

export default DebtOverview;
