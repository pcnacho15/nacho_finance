import { z } from 'zod';

const cuid = z.string().min(1);
const isoDate = z.union([z.string(), z.date()]).transform((v) => new Date(v));
const positiveAmount = z.coerce.number().positive();
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

const recurringFrequency = z.enum(["diario", "semanal", "mensual", "anual"]);

export const expenseCreateSchema = z.object({
  amount: positiveAmount,
  description: z.string().trim().min(1),
  categoryId: cuid,
  date: isoDate,
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: recurringFrequency.optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().extend({ id: cuid });

export const fixedExpenseFrequency = z.enum([
  'semanal',
  'quincenal',
  'mensual',
  'bimestral',
  'trimestral',
  'semestral',
  'anual',
]);

export const fixedExpenseCreateSchema = z
  .object({
    name: z.string().trim().min(1, 'Nombre requerido'),
    amount: positiveAmount,
    categoryId: cuid,
    frequency: fixedExpenseFrequency.optional().default('mensual'),
    dayOfMonth: z.coerce.number().int().min(1).max(31).optional().nullable(),
    startDate: isoDate,
    endDate: isoDate.optional().nullable(),
    isActive: z.boolean().optional().default(true),
    paymentMethod: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((d) => (d.endDate ? d.endDate >= d.startDate : true), {
    message: 'La fecha de fin no puede ser anterior al inicio',
    path: ['endDate'],
  });

export const fixedExpenseUpdateSchema = z
  .object({
    id: cuid,
    name: z.string().trim().min(1).optional(),
    amount: positiveAmount.optional(),
    categoryId: cuid.optional(),
    frequency: fixedExpenseFrequency.optional(),
    dayOfMonth: z.coerce.number().int().min(1).max(31).optional().nullable(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional().nullable(),
    isActive: z.boolean().optional(),
    paymentMethod: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((d) => (d.endDate && d.startDate ? d.endDate >= d.startDate : true), {
    message: 'La fecha de fin no puede ser anterior al inicio',
    path: ['endDate'],
  });

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
  targetAmount: positiveAmount.optional().nullable(),
  targetDate: isoDate.optional().nullable(),
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

// Address format is re-validated per chain in the route (TronWeb.isAddress / viem
// isAddress) — the schema stays lightweight and free of chain-specific imports
// (finance-schemas may be pulled into client bundles).
export const onchainChainSchema = z.enum(['tron', 'ethereum']);

export const walletConnectSchema = z.object({
  address: z.string().trim().min(1),
  chain: onchainChainSchema.optional().default('tron'),
  name: z.string().trim().min(1).optional(),
});

export const walletSyncSchema = z.object({
  walletId: cuid,
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
    pricePerUnit: positiveAmount,
    date: isoDate,
    counterparty: z.string().trim().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine(
    (d) => (d.type === 'buy' || d.type === 'sell' ? d.pricePerUnit != null : true),
    { message: 'El precio es obligatorio para compras y ventas', path: ['pricePerUnit'] },
  );
