export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalDebt: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    total: number;
    percentage: number;
  }[];
  incomeVsExpenses: {
    month: string;
    income: number;
    expenses: number;
  }[];
  recentTransactions: {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    categoryName: string;
    categoryColor: string;
    date: Date;
  }[];
  savingsGoalsProgress: {
    id: string;
    name: string;
    current: number;
    target: number;
    percentage: number;
    color: string;
  }[];
  debtOverview: {
    total: number;
    paid: number;
    remaining: number;
    monthlyPayment: number;
  };
  budgetStatus: {
    active: number;
    overBudget: number;
    totalBudget: number;
    totalSpent: number;
  };
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  investments: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}
