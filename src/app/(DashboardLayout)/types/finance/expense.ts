export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
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
