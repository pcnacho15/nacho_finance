import type { Category } from './category';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  category?: Category;
  date: Date | string;
  isRecurring: boolean;
  recurringFrequency?: 'diario' | 'semanal' | 'mensual' | 'anual' | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ExpenseFormData {
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
  isRecurring?: boolean;
  recurringFrequency?: "diario" | "semanal" | "mensual" | "anual";
}

export interface ExpenseSummary {
  total: number;
  count: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    count: number;
  }[];
  byMonth: {
    month: string;
    total: number;
  }[];
  recurringTotal: number;
}
