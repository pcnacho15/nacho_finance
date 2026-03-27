export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  description?: string;
  createdAt: Date;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  description?: string;
}

export const DEFAULT_INCOME_CATEGORIES: CategoryFormData[] = [
  { name: 'Salario', type: 'income', color: '#22c55e', icon: 'solar:money-bag-bold' },
  { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'solar:laptop-bold' },
  { name: 'Inversiones', type: 'income', color: '#8b5cf6', icon: 'solar:chart-line-up-bold' },
  { name: 'Ventas', type: 'income', color: '#06b6d4', icon: 'solar:shopping-bag-bold' },
  { name: 'Regalos', type: 'income', color: '#ec4899', icon: 'solar:gift-bold' },
  { name: 'Otros Ingresos', type: 'income', color: '#6b7280', icon: 'solar:add-circle-bold' },
];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryFormData[] = [
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
