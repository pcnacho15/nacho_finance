export interface Income {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
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
