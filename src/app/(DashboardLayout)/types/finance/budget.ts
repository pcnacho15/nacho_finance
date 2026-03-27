export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  activeBudgets: number;
  overBudget: number;
  onTrack: number;
}

export const PERIOD_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
};
