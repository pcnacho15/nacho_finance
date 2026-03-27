'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Category, CategoryFormData, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES,
  Income, IncomeFormData, 
  Expense, ExpenseFormData,
  Debt, DebtFormData, DebtPayment,
  SavingsGoal, SavingsGoalFormData, SavingsContribution,
  Budget, BudgetFormData
} from '@/app/(DashboardLayout)/types/finance';
import { format } from 'date-fns';

interface FinanceContextType {
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  
  addCategory: (data: CategoryFormData) => void;
  updateCategory: (id: string, data: CategoryFormData) => void;
  deleteCategory: (id: string) => void;
  
  addIncome: (data: IncomeFormData) => void;
  updateIncome: (id: string, data: IncomeFormData) => void;
  deleteIncome: (id: string) => void;
  
  addExpense: (data: ExpenseFormData) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  
  addDebt: (data: DebtFormData) => void;
  updateDebt: (id: string, data: DebtFormData) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (debtId: string, amount: number, notes?: string) => void;
  
  addSavingsGoal: (data: SavingsGoalFormData) => void;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoalFormData>) => void;
  deleteSavingsGoal: (id: string) => void;
  addSavingsContribution: (goalId: string, amount: number, notes?: string) => void;
  
  addBudget: (data: BudgetFormData) => void;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => void;
  deleteBudget: (id: string) => void;
  
  getCategoryById: (id: string) => Category | undefined;
  getIncomesByMonth: (month: Date) => Income[];
  getExpensesByMonth: (month: Date) => Expense[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getMonthlyData: () => { month: string; income: number; expenses: number }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('finance_categories');
    const savedIncomes = localStorage.getItem('finance_incomes');
    const savedExpenses = localStorage.getItem('finance_expenses');
    const savedDebts = localStorage.getItem('finance_debts');
    const savedSavings = localStorage.getItem('finance_savings');
    const savedBudgets = localStorage.getItem('finance_budgets');

    if (!savedCategories) {
      const initialCategories: Category[] = [
        ...DEFAULT_INCOME_CATEGORIES.map((c, i) => ({
          ...c,
          id: generateId(),
          createdAt: new Date(),
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) => ({
          ...c,
          id: generateId() + i,
          createdAt: new Date(),
        })),
      ];
      setCategories(initialCategories);
      localStorage.setItem('finance_categories', JSON.stringify(initialCategories));
    } else {
      setCategories(JSON.parse(savedCategories));
    }

    if (savedIncomes) setIncomes(JSON.parse(savedIncomes));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    if (savedSavings) setSavingsGoals(JSON.parse(savedSavings));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
  }, []);

  useEffect(() => {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
    localStorage.setItem('finance_incomes', JSON.stringify(incomes));
    localStorage.setItem('finance_expenses', JSON.stringify(expenses));
    localStorage.setItem('finance_debts', JSON.stringify(debts));
    localStorage.setItem('finance_savings', JSON.stringify(savingsGoals));
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [categories, incomes, expenses, debts, savingsGoals, budgets]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const addCategory = useCallback((data: CategoryFormData) => {
    const newCategory: Category = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, data: CategoryFormData) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addIncome = useCallback((data: IncomeFormData) => {
    const category = getCategoryById(data.categoryId);
    if (!category) return;
    
    const newIncome: Income = {
      ...data,
      id: generateId(),
      categoryName: category.name,
      categoryColor: category.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setIncomes(prev => [...prev, newIncome]);
  }, [getCategoryById]);

  const updateIncome = useCallback((id: string, data: IncomeFormData) => {
    const category = getCategoryById(data.categoryId);
    if (!category) return;
    
    setIncomes(prev => prev.map(i => i.id === id ? {
      ...i,
      ...data,
      categoryName: category.name,
      categoryColor: category.color,
      updatedAt: new Date(),
    } : i));
  }, [getCategoryById]);

  const deleteIncome = useCallback((id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const category = getCategoryById(data.categoryId);
    if (!category) return;
    
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      categoryName: category.name,
      categoryColor: category.color,
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setExpenses(prev => [...prev, newExpense]);
  }, [getCategoryById]);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    const category = getCategoryById(data.categoryId);
    if (!category) return;
    
    setExpenses(prev => prev.map(e => e.id === id ? {
      ...e,
      ...data,
      categoryName: category.name,
      categoryColor: category.color,
      updatedAt: new Date(),
    } : e));
  }, [getCategoryById]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addDebt = useCallback((data: DebtFormData) => {
    const newDebt: Debt = {
      ...data,
      id: generateId(),
      paidAmount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDebts(prev => [...prev, newDebt]);
  }, []);

  const updateDebt = useCallback((id: string, data: DebtFormData) => {
    setDebts(prev => prev.map(d => d.id === id ? {
      ...d,
      ...data,
      updatedAt: new Date(),
    } : d));
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  }, []);

  const addDebtPayment = useCallback((debtId: string, amount: number, notes?: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d;
      const newPaidAmount = d.paidAmount + amount;
      const newCurrentAmount = d.currentAmount - amount;
      return {
        ...d,
        paidAmount: newPaidAmount,
        currentAmount: Math.max(0, newCurrentAmount),
        status: newCurrentAmount <= 0 ? 'paid' : d.status,
        updatedAt: new Date(),
      };
    }));

    const payment: DebtPayment = {
      id: generateId(),
      debtId,
      amount,
      date: new Date(),
      notes,
      createdAt: new Date(),
    };
  }, []);

  const addSavingsGoal = useCallback((data: SavingsGoalFormData) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: generateId(),
      currentAmount: 0,
      status: 'in_progress',
      contributions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  }, []);

  const updateSavingsGoal = useCallback((id: string, data: Partial<SavingsGoalFormData>) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? {
      ...g,
      ...data,
      updatedAt: new Date(),
    } : g));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const addSavingsContribution = useCallback((goalId: string, amount: number, notes?: string) => {
    setSavingsGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const contribution: SavingsContribution = {
        id: generateId(),
        goalId,
        amount,
        date: new Date(),
        notes,
        createdAt: new Date(),
      };
      return {
        ...g,
        currentAmount: g.currentAmount + amount,
        status: g.currentAmount + amount >= g.targetAmount ? 'completed' : g.status,
        contributions: [...g.contributions, contribution],
        updatedAt: new Date(),
      };
    }));
  }, []);

  const addBudget = useCallback((data: BudgetFormData) => {
    const category = getCategoryById(data.categoryId);
    if (!category) return;
    
    const endDate = new Date(data.startDate);
    if (data.period === 'weekly') endDate.setDate(endDate.getDate() + 7);
    else if (data.period === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);
    
    const newBudget: Budget = {
      ...data,
      id: generateId(),
      categoryName: category.name,
      categoryColor: category.color,
      endDate,
      spent: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBudgets(prev => [...prev, newBudget]);
  }, [getCategoryById]);

  const updateBudget = useCallback((id: string, data: Partial<BudgetFormData>) => {
    setBudgets(prev => prev.map(b => b.id === id ? {
      ...b,
      ...data,
      updatedAt: new Date(),
    } : b));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const getIncomesByMonth = useCallback((month: Date) => {
    return incomes.filter(i => {
      const incomeDate = new Date(i.date);
      return incomeDate.getMonth() === month.getMonth() && incomeDate.getFullYear() === month.getFullYear();
    });
  }, [incomes]);

  const getExpensesByMonth = useCallback((month: Date) => {
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === month.getMonth() && expenseDate.getFullYear() === month.getFullYear();
    });
  }, [expenses]);

  const getTotalIncome = useCallback(() => {
    return incomes.reduce((sum, i) => sum + i.amount, 0);
  }, [incomes]);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getMonthlyData = useCallback(() => {
    const months: { month: string; income: number; expenses: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = format(date, 'MMM');
      
      const monthIncomes = incomes
        .filter(inc => {
          const d = new Date(inc.date);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount, 0);
      
      const monthExpenses = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      months.push({ month: monthName, income: monthIncomes, expenses: monthExpenses });
    }
    
    return months;
  }, [incomes, expenses]);

  return (
    <FinanceContext.Provider value={{
      categories,
      incomes,
      expenses,
      debts,
      savingsGoals,
      budgets,
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
      getIncomesByMonth,
      getExpensesByMonth,
      getTotalIncome,
      getTotalExpenses,
      getBalance,
      getMonthlyData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
