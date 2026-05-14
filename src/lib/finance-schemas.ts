import { z } from 'zod';

const cuid = z.string().min(1);
const isoDate = z.union([z.string(), z.date()]).transform((v) => new Date(v));
const positiveAmount = z.coerce.number().positive('El monto debe ser mayor a 0');
const nonNegativeAmount = z.coerce.number().nonnegative();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido'),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1),
  icon: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: cuid,
});

export const incomeCreateSchema = z.object({
  amount: positiveAmount,
  description: z.string().trim().min(1),
  categoryId: cuid,
  date: isoDate,
});

export const incomeUpdateSchema = incomeCreateSchema.partial().extend({ id: cuid });

const recurringFrequency = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const expenseCreateSchema = z.object({
  amount: positiveAmount,
  description: z.string().trim().min(1),
  categoryId: cuid,
  date: isoDate,
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: recurringFrequency.optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().extend({ id: cuid });

export const debtCreateSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['loan', 'credit_card', 'mortgage', 'other']),
  creditor: z.string().trim().min(1),
  originalAmount: positiveAmount,
  currentAmount: nonNegativeAmount,
  interestRate: nonNegativeAmount,
  monthlyPayment: nonNegativeAmount,
  startDate: isoDate,
  dueDate: isoDate,
  notes: z.string().optional().nullable(),
});

export const debtUpdateSchema = debtCreateSchema.partial().extend({ id: cuid });

export const debtPaymentSchema = z.object({
  debtId: cuid,
  amount: positiveAmount,
  notes: z.string().optional().nullable(),
});

export const savingsGoalCreateSchema = z.object({
  name: z.string().trim().min(1),
  targetAmount: positiveAmount,
  targetDate: isoDate,
  icon: z.string().min(1),
  color: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const savingsGoalUpdateSchema = savingsGoalCreateSchema.partial().extend({ id: cuid });

export const savingsContributionSchema = z.object({
  goalId: cuid,
  amount: positiveAmount,
  notes: z.string().optional().nullable(),
});

export const budgetCreateSchema = z.object({
  categoryId: cuid,
  amount: positiveAmount,
  period: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: isoDate,
  endDate: isoDate,
});

export const budgetUpdateSchema = budgetCreateSchema.partial().extend({
  id: cuid,
  spent: nonNegativeAmount.optional(),
  isActive: z.boolean().optional(),
});

export const walletTypeSchema = z.enum(['exchange', 'hot', 'cold', 'other']);

export const walletCreateSchema = z.object({
  name: z.string().trim().min(1, 'Nombre requerido'),
  type: walletTypeSchema.optional().default('exchange'),
  asset: z.string().trim().min(1).optional().default('USDT'),
  network: z.string().trim().min(1).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const walletUpdateSchema = walletCreateSchema.partial().extend({
  id: cuid,
  archivedAt: z.union([z.string(), z.date(), z.null()]).optional(),
});

export const walletTransactionTypeSchema = z.enum([
  'buy',
  'sell',
  'deposit',
  'withdrawal',
]);

export const walletTransactionCreateSchema = z
  .object({
    walletId: cuid,
    type: walletTransactionTypeSchema,
    amount: positiveAmount,
    pricePerUnit: positiveAmount.optional().nullable(),
    date: isoDate,
    counterparty: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (d) => (d.type === 'buy' || d.type === 'sell' ? d.pricePerUnit != null : true),
    { message: 'El precio es obligatorio para compras y ventas', path: ['pricePerUnit'] },
  );
