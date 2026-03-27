'use client';

import React from 'react';
import CardBox from '../shared/CardBox';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays } from 'date-fns';

const SavingsGoalsCard: React.FC = () => {
  const { savingsGoals } = useFinance();

  const activeGoals = savingsGoals.filter(g => g.status !== 'completed').slice(0, 4);

  return (
    <CardBox>
      <div className="flex items-center justify-between mb-6">
        <h5 className="card-title">Metas de Ahorro</h5>
        <a href="/finance/savings" className="text-sm text-primary hover:underline">
          Ver todas
        </a>
      </div>

      {activeGoals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon icon="solar:piggy-bank-linear" className="text-4xl mb-2 mx-auto opacity-50" />
          <p>No hay metas de ahorro activas</p>
          <a href="/finance/savings" className="text-sm text-primary hover:underline mt-2 inline-block">
            Crear una meta
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <div key={goal.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <Icon icon={goal.icon} className="text-xl" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Fecha límite'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: goal.color }}>
                    {percentage}%
                  </span>
                </div>
                <Progress value={percentage} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${goal.currentAmount.toLocaleString()} de ${goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="font-medium">
                    Faltan ${remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardBox>
  );
};

export default SavingsGoalsCard;
