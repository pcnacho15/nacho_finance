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
  targetAmount?: number | null;
  targetDate?: Date | null;
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
  { value: "solar:home-bold", label: "Casa" },
  { value: "glyphs:car-bold", label: "Auto" },
  { value: "ph:airplane-bold", label: "Viaje" },
  { value: "solar:laptop-bold", label: "Tecnología" },
  { value: "glyphs:graduation-cap-bold", label: "Educación" },
  { value: "solar:gift-bold", label: "Regalo" },
  { value: "mdi:gold", label: "Joyería" },
  { value: "ph:piggy-bank-bold", label: "Ahorro General" },
];
