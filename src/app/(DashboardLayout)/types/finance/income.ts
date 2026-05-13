import type { Category } from './category';

export interface Income {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  category?: Category;
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IncomeFormData {
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
}

export interface IncomeSummary {
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
}
