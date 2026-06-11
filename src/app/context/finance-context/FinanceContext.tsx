'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Budget,
  BudgetFormData,
  Category,
  CategoryFormData,
  Debt,
  DebtFormData,
  Expense,
  ExpenseFormData,
  Income,
  IncomeFormData,
  SavingsGoal,
  SavingsGoalFormData,
} from '@/app/(DashboardLayout)/types/finance';

const ENDPOINTS = {
  categories: '/api/finance/categories',
  incomes: '/api/finance/incomes',
  expenses: '/api/finance/expenses',
  debts: '/api/finance/debts',
  savingsGoals: '/api/finance/savings-goals',
  budgets: '/api/finance/budgets',
  init: '/api/finance/init',
  debtPayments: '/api/finance/debts/payments',
  savingsContributions: '/api/finance/savings-goals/contributions',
} as const;

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Error ${res.status}`);
  }
  return res.json();
}

async function send<T>(method: 'POST' | 'PUT' | 'DELETE', url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return res.json();
}

interface FinanceContextType {
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];

  isLoading: boolean;

  addCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addIncome: (data: IncomeFormData) => Promise<void>;
  updateIncome: (id: string, data: IncomeFormData) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addExpense: (data: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, data: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addDebt: (data: DebtFormData) => Promise<void>;
  updateDebt: (id: string, data: DebtFormData) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addDebtPayment: (debtId: string, amount: number, notes?: string) => Promise<void>;

  addSavingsGoal: (data: SavingsGoalFormData) => Promise<void>;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoalFormData>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addSavingsContribution: (goalId: string, amount: number, notes?: string) => Promise<void>;

  addBudget: (data: BudgetFormData) => Promise<void>;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  getCategoryById: (id: string) => Category | undefined;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getMonthlyData: () => { month: string; income: number; expenses: number }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mutate } = useSWRConfig();

  const categoriesSwr = useSWR<Category[]>(ENDPOINTS.categories, fetcher);
  const incomesSwr = useSWR<Income[]>(ENDPOINTS.incomes, fetcher);
  const expensesSwr = useSWR<Expense[]>(ENDPOINTS.expenses, fetcher);
  const debtsSwr = useSWR<Debt[]>(ENDPOINTS.debts, fetcher);
  const savingsSwr = useSWR<SavingsGoal[]>(ENDPOINTS.savingsGoals, fetcher);
  const budgetsSwr = useSWR<Budget[]>(ENDPOINTS.budgets, fetcher);

  const categories = useMemo(() => categoriesSwr.data ?? [], [categoriesSwr.data]);
  const incomes = useMemo(() => incomesSwr.data ?? [], [incomesSwr.data]);
  const expenses = useMemo(() => expensesSwr.data ?? [], [expensesSwr.data]);
  const debts = useMemo(() => debtsSwr.data ?? [], [debtsSwr.data]);
  const savingsGoals = useMemo(() => savingsSwr.data ?? [], [savingsSwr.data]);
  const budgets = useMemo(() => budgetsSwr.data ?? [], [budgetsSwr.data]);

  useEffect(() => {
    if (categoriesSwr.data && categoriesSwr.data.length === 0) {
      fetch(ENDPOINTS.init)
        .then(() => mutate(ENDPOINTS.categories))
        .catch(() => undefined);
    }
  }, [categoriesSwr.data, mutate]);

  const runMutation = useCallback(
    async (fn: () => Promise<unknown>, successMsg: string, keys: string[]) => {
      try {
        await fn();
        await Promise.all(keys.map((k) => mutate(k)));
        toast.success(successMsg, {position: "top-center"});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error inesperado';
        toast.error(msg);
        throw err;
      }
    },
    [mutate],
  );

  const addCategory = useCallback(
    (data: CategoryFormData) =>
      runMutation(() => send('POST', ENDPOINTS.categories, data), 'Categoría creada', [
        ENDPOINTS.categories,
      ]),
    [runMutation],
  );

  const updateCategory = useCallback(
    (id: string, data: CategoryFormData) =>
      runMutation(
        () => send('PUT', ENDPOINTS.categories, { id, ...data }),
        'Categoría actualizada',
        [ENDPOINTS.categories, ENDPOINTS.incomes, ENDPOINTS.expenses, ENDPOINTS.budgets],
      ),
    [runMutation],
  );

  const deleteCategory = useCallback(
    (id: string) =>
      runMutation(
        () => send('DELETE', `${ENDPOINTS.categories}?id=${id}`),
        'Categoría eliminada',
        [ENDPOINTS.categories],
      ),
    [runMutation],
  );

  const addIncome = useCallback(
    (data: IncomeFormData) =>
      runMutation(() => send('POST', ENDPOINTS.incomes, data), 'Ingreso registrado', [
        ENDPOINTS.incomes,
      ]),
    [runMutation],
  );

  const updateIncome = useCallback(
    (id: string, data: IncomeFormData) =>
      runMutation(
        () => send('PUT', ENDPOINTS.incomes, { id, ...data }),
        'Ingreso actualizado',
        [ENDPOINTS.incomes],
      ),
    [runMutation],
  );

  const deleteIncome = useCallback(
    (id: string) =>
      runMutation(() => send('DELETE', `${ENDPOINTS.incomes}?id=${id}`), 'Ingreso eliminado', [
        ENDPOINTS.incomes,
      ]),
    [runMutation],
  );

  const addExpense = useCallback(
    (data: ExpenseFormData) =>
      runMutation(() => send('POST', ENDPOINTS.expenses, data), 'Gasto registrado', [
        ENDPOINTS.expenses,
      ]),
    [runMutation],
  );

  const updateExpense = useCallback(
    (id: string, data: ExpenseFormData) =>
      runMutation(
        () => send('PUT', ENDPOINTS.expenses, { id, ...data }),
        'Gasto actualizado',
        [ENDPOINTS.expenses],
      ),
    [runMutation],
  );

  const deleteExpense = useCallback(
    (id: string) =>
      runMutation(() => send('DELETE', `${ENDPOINTS.expenses}?id=${id}`), 'Gasto eliminado', [
        ENDPOINTS.expenses,
      ]),
    [runMutation],
  );

  const addDebt = useCallback(
    (data: DebtFormData) =>
      runMutation(() => send('POST', ENDPOINTS.debts, data), 'Deuda registrada', [ENDPOINTS.debts]),
    [runMutation],
  );

  const updateDebt = useCallback(
    (id: string, data: DebtFormData) =>
      runMutation(
        () => send('PUT', ENDPOINTS.debts, { id, ...data }),
        'Deuda actualizada',
        [ENDPOINTS.debts],
      ),
    [runMutation],
  );

  const deleteDebt = useCallback(
    (id: string) =>
      runMutation(() => send('DELETE', `${ENDPOINTS.debts}?id=${id}`), 'Deuda eliminada', [
        ENDPOINTS.debts,
      ]),
    [runMutation],
  );

  const addDebtPayment = useCallback(
    (debtId: string, amount: number, notes?: string) =>
      runMutation(
        () => send('POST', ENDPOINTS.debtPayments, { debtId, amount, notes }),
        'Pago registrado',
        [ENDPOINTS.debts],
      ),
    [runMutation],
  );

  const addSavingsGoal = useCallback(
    (data: SavingsGoalFormData) =>
      runMutation(() => send('POST', ENDPOINTS.savingsGoals, data), 'Meta creada', [
        ENDPOINTS.savingsGoals,
      ]),
    [runMutation],
  );

  const updateSavingsGoal = useCallback(
    (id: string, data: Partial<SavingsGoalFormData>) =>
      runMutation(
        () => send('PUT', ENDPOINTS.savingsGoals, { id, ...data }),
        'Meta actualizada',
        [ENDPOINTS.savingsGoals],
      ),
    [runMutation],
  );

  const deleteSavingsGoal = useCallback(
    (id: string) =>
      runMutation(
        () => send('DELETE', `${ENDPOINTS.savingsGoals}?id=${id}`),
        'Meta eliminada',
        [ENDPOINTS.savingsGoals],
      ),
    [runMutation],
  );

  const addSavingsContribution = useCallback(
    (goalId: string, amount: number, notes?: string) =>
      runMutation(
        () => send('POST', ENDPOINTS.savingsContributions, { goalId, amount, notes }),
        'Aportación registrada',
        [ENDPOINTS.savingsGoals],
      ),
    [runMutation],
  );

  const addBudget = useCallback(
    (data: BudgetFormData) =>
      runMutation(() => send('POST', ENDPOINTS.budgets, data), 'Presupuesto creado', [
        ENDPOINTS.budgets,
      ]),
    [runMutation],
  );

  const updateBudget = useCallback(
    (id: string, data: Partial<BudgetFormData>) =>
      runMutation(
        () => send('PUT', ENDPOINTS.budgets, { id, ...data }),
        'Presupuesto actualizado',
        [ENDPOINTS.budgets],
      ),
    [runMutation],
  );

  const deleteBudget = useCallback(
    (id: string) =>
      runMutation(() => send('DELETE', `${ENDPOINTS.budgets}?id=${id}`), 'Presupuesto eliminado', [
        ENDPOINTS.budgets,
      ]),
    [runMutation],
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const getTotalIncome = useCallback(
    () => incomes.reduce((sum, i) => sum + Number(i.amount), 0),
    [incomes],
  );

  const getTotalExpenses = useCallback(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses],
  );

  const getBalance = useCallback(
    () => getTotalIncome() - getTotalExpenses(),
    [getTotalIncome, getTotalExpenses],
  );

  const getMonthlyData = useCallback(() => {
    const data: Record<string, { income: number; expenses: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data[format(d, 'MMM')] = { income: 0, expenses: 0 };
    }
    for (const i of incomes) {
      const key = format(new Date(i.date), 'MMM');
      if (data[key]) data[key].income += Number(i.amount);
    }
    for (const e of expenses) {
      const key = format(new Date(e.date), 'MMM');
      if (data[key]) data[key].expenses += Number(e.amount);
    }
    return Object.entries(data).map(([month, v]) => ({ month, ...v }));
  }, [incomes, expenses]);

  const isLoading =
    categoriesSwr.isLoading ||
    incomesSwr.isLoading ||
    expensesSwr.isLoading ||
    debtsSwr.isLoading ||
    savingsSwr.isLoading ||
    budgetsSwr.isLoading;

  const value: FinanceContextType = {
    categories,
    incomes,
    expenses,
    debts,
    savingsGoals,
    budgets,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addDebt,
    updateDebt,
    deleteDebt,
    addDebtPayment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsContribution,
    addBudget,
    updateBudget,
    deleteBudget,
    getCategoryById,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getMonthlyData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceContextType => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider');
  return ctx;
};
