export type SavingsGoalStatus = 'in_progress' | 'completed' | 'paused';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: SavingsGoalStatus;
  icon: string;
  color: string;
  description?: string;
  contributions: SavingsContribution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface SavingsGoalFormData {
  name: string;
  targetAmount: number;
  targetDate: Date;
  icon: string;
  color: string;
  description?: string;
}

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
  activeGoals: number;
  completedGoals: number;
  goalsByMonth: {
    month: string;
    saved: number;
    target: number;
  }[];
}

export const SAVINGS_ICONS = [
  { value: 'solar:home-bold', label: 'Casa' },
  { value: 'solar:car-bold', label: 'Auto' },
  { value: 'solar:airplane-bold', label: 'Viaje' },
  { value: 'solar:laptop-bold', label: 'Tecnología' },
  { value: 'solar:graduation-cap-bold', label: 'Educación' },
  { value: 'solar:gift-bold', label: 'Regalo' },
  { value: 'solar:diamond-bold', label: 'Joyería' },
  { value: 'solar:piggy-bank-bold', label: 'Ahorro General' },
];
