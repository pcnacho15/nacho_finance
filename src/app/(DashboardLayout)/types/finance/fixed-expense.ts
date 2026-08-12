import type { Category } from './category';

export type FixedExpenseFrequency =
  | 'semanal'
  | 'quincenal'
  | 'mensual'
  | 'bimestral'
  | 'trimestral'
  | 'semestral'
  | 'anual';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  category?: Category;
  frequency: FixedExpenseFrequency;
  dayOfMonth?: number | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  isActive: boolean;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FixedExpenseFormData {
  name: string;
  amount: number;
  categoryId: string;
  frequency: FixedExpenseFrequency;
  dayOfMonth?: number | null;
  startDate: Date;
  endDate?: Date | null;
  isActive?: boolean;
  paymentMethod?: string | null;
  notes?: string | null;
}

export const FIXED_EXPENSE_FREQUENCY_LABELS: Record<FixedExpenseFrequency, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
};

// Cuántas veces al año se paga cada frecuencia. Sirve para normalizar montos de
// distintas periodicidades a un equivalente mensual/anual comparable.
export const FIXED_EXPENSE_PAYMENTS_PER_YEAR: Record<FixedExpenseFrequency, number> = {
  semanal: 52,
  quincenal: 24,
  mensual: 12,
  bimestral: 6,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};

export function monthlyEquivalent(expense: Pick<FixedExpense, 'amount' | 'frequency'>): number {
  return (Number(expense.amount) * FIXED_EXPENSE_PAYMENTS_PER_YEAR[expense.frequency]) / 12;
}

export function yearlyEquivalent(expense: Pick<FixedExpense, 'amount' | 'frequency'>): number {
  return Number(expense.amount) * FIXED_EXPENSE_PAYMENTS_PER_YEAR[expense.frequency];
}

// Un gasto fijo está vigente si está activo y la fecha de hoy cae dentro de su
// ventana [startDate, endDate]. `endDate` nulo = sin fecha de fin.
export function isCurrentlyActive(
  expense: Pick<FixedExpense, 'isActive' | 'startDate' | 'endDate'>,
  reference: Date = new Date(),
): boolean {
  if (!expense.isActive) return false;
  if (new Date(expense.startDate) > reference) return false;
  if (expense.endDate && new Date(expense.endDate) < reference) return false;
  return true;
}
