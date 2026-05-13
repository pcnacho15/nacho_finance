import { prisma } from '@/lib/prisma';
import { handleError, json, requireUser } from '@/lib/api-utils';

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salario', type: 'income', color: '#22c55e', icon: 'solar:money-bag-bold' },
  { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'solar:laptop-bold' },
  { name: 'Inversiones', type: 'income', color: '#8b5cf6', icon: 'solar:chart-line-up-bold' },
  { name: 'Ventas', type: 'income', color: '#06b6d4', icon: 'solar:shopping-bag-bold' },
  { name: 'Regalos', type: 'income', color: '#ec4899', icon: 'solar:gift-bold' },
  { name: 'Otros Ingresos', type: 'income', color: '#6b7280', icon: 'solar:add-circle-bold' },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación', type: 'expense', color: '#ef4444', icon: 'solar:cup-bold' },
  { name: 'Transporte', type: 'expense', color: '#f97316', icon: 'solar:car-bold' },
  { name: 'Vivienda', type: 'expense', color: '#eab308', icon: 'solar:home-bold' },
  { name: 'Servicios', type: 'expense', color: '#22c55e', icon: 'solar:bolt-bold' },
  { name: 'Salud', type: 'expense', color: '#ec4899', icon: 'solar:heart-bold' },
  { name: 'Entretenimiento', type: 'expense', color: '#8b5cf6', icon: 'solar:gamepad-bold' },
  { name: 'Educación', type: 'expense', color: '#3b82f6', icon: 'solar:book-bold' },
  { name: 'Ropa', type: 'expense', color: '#06b6d4', icon: 'solar:t-shirt-bold' },
  { name: 'Deudas', type: 'expense', color: '#dc2626', icon: 'solar:document-text-bold' },
  { name: 'Ahorros', type: 'expense', color: '#14b8a6', icon: 'solar:piggy-bank-bold' },
  { name: 'Otros Gastos', type: 'expense', color: '#6b7280', icon: 'solar:add-circle-bold' },
];

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const existing = await prisma.category.findMany({ where: { userId: user.userId } });
    if (existing.length === 0) {
      await prisma.category.createMany({
        data: [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES].map((c) => ({
          ...c,
          userId: user.userId,
        })),
      });
      const categories = await prisma.category.findMany({ where: { userId: user.userId } });
      return json({ initialized: true, categories });
    }
    return json({ initialized: false, categories: existing });
  } catch (error) {
    return handleError('GET /api/finance/init', error);
  }
}
