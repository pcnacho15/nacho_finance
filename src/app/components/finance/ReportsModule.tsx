'use client';

import React, { useState } from 'react';
import { useFinance } from '@/app/context/finance-context/FinanceContext';
import CardBox from '../shared/CardBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react/dist/iconify.js';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const ReportsModule: React.FC = () => {
  const { incomes, expenses, categories, getMonthlyData } = useFinance();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6m');

  const monthlyData = getMonthlyData();
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.categoryId === expense.categoryId);
    if (existing) {
      existing.total += expense.amount;
    } else {
      acc.push({
        categoryId: expense.categoryId,
        categoryName: expense.categoryName,
        categoryColor: expense.categoryColor,
        total: expense.amount,
      });
    }
    return acc;
  }, [] as { categoryId: string; categoryName: string; categoryColor: string; total: number }[]);

  expensesByCategory.sort((a, b) => b.total - a.total);

  const topExpenseCategories = expensesByCategory.slice(0, 5);
  const totalExpenseByTop = topExpenseCategories.reduce((sum, cat) => sum + cat.total, 0);

  const recentIncomes = [...incomes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
          <p className="text-muted-foreground">Visualiza el resumen de tus finanzas</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Últimos 3 meses</SelectItem>
            <SelectItem value="6m">Últimos 6 meses</SelectItem>
            <SelectItem value="12m">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardBox className="bg-gradient-to-br from-muted to-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-2xl font-bold text-foreground">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-muted-foreground/20 rounded-full">
              <Icon icon="solar:money-bag-bold" className="text-2xl text-foreground" />
            </div>
          </div>
        </CardBox>
        <CardBox className="bg-gradient-to-br from-muted to-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gastos Totales</p>
              <p className="text-2xl font-bold text-muted-foreground">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-full">
              <Icon icon="solar:shopping-cart-bold" className="text-2xl text-muted-foreground" />
            </div>
          </div>
        </CardBox>
        <CardBox className={`bg-gradient-to-br ${balance >= 0 ? 'from-muted to-muted/50' : 'from-muted-foreground/10 to-muted-foreground/5'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Balance General</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                ${balance.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 ${balance >= 0 ? 'bg-foreground/20' : 'bg-muted-foreground/20'} rounded-full`}>
              <Icon icon="solar:wallet-money-bold" className={`text-2xl ${balance >= 0 ? 'text-foreground' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </CardBox>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <CardBox>
            <h4 className="font-semibold mb-4">Resumen de los últimos 6 meses</h4>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-success w-20">Ingresos</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full"
                          style={{ width: `${Math.min(100, (month.income / Math.max(...monthlyData.map(m => m.income))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-24 text-right">${month.income.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-error w-20">Gastos</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-error h-2 rounded-full"
                          style={{ width: `${Math.min(100, (month.expenses / Math.max(...monthlyData.map(m => m.expenses))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-24 text-right">${month.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <Badge variant={month.income - month.expenses >= 0 ? 'default' : 'destructive'} className="text-xs">
                      {month.income - month.expenses >= 0 ? '+' : ''}${(month.income - month.expenses).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardBox>
        </TabsContent>

        <TabsContent value="categories">
          <CardBox>
            <h4 className="font-semibold mb-4">Top 5 Categorías de Gastos</h4>
            <div className="space-y-4">
              {topExpenseCategories.map((cat, index) => {
                const percentage = ((cat.total / totalExpenseByTop) * 100).toFixed(1);
                return (
                  <div key={cat.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.categoryColor }} />
                        <span className="font-medium">{cat.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                        <span className="font-semibold">${cat.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: cat.categoryColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBox>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardBox>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Icon icon="solar:arrow-right-up-bold" className="text-success" />
                Últimos Ingresos
              </h4>
              {recentIncomes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay ingresos registrados</p>
              ) : (
                <div className="space-y-3">
                  {recentIncomes.map((income) => (
                    <div key={income.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${income.categoryColor}20` }}>
                          <Icon icon="solar:arrow-right-up-bold" style={{ color: income.categoryColor }} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{income.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(income.date), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-success">+${income.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>

            <CardBox>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Icon icon="solar:arrow-right-down-bold" className="text-error" />
                Últimos Gastos
              </h4>
              {recentExpenses.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay gastos registrados</p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${expense.categoryColor}20` }}>
                          <Icon icon="solar:arrow-right-down-bold" style={{ color: expense.categoryColor }} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-error">-${expense.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsModule;
