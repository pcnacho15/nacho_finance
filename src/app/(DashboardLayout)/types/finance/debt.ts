export type DebtType = 'loan' | 'credit_card' | 'mortgage' | 'other';
export type DebtStatus = 'active' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  creditor: string;
  originalAmount: number;
  currentAmount: number;
  paidAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: Date;
  dueDate: Date;
  status: DebtStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtFormData {
  name: string;
  type: DebtType;
  creditor: string;
  originalAmount: number;
  currentAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: Date;
  dueDate: Date;
  notes?: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface DebtSummary {
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
  activeDebts: number;
  paidDebts: number;
  overdueDebts: number;
  monthlyPaymentTotal: number;
  byType: {
    type: DebtType;
    total: number;
    count: number;
  }[];
}

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  loan: 'Préstamo',
  credit_card: 'Tarjeta de Crédito',
  mortgage: 'Hipoteca',
  other: 'Otro',
};

export const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  active: 'Activa',
  paid: 'Pagada',
  overdue: 'Vencida',
};
