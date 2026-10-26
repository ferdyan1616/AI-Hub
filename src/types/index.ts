export type TaskCategory = 'Pekerjaan' | 'Pribadi' | 'Belajar' | 'Kesehatan';
export type TaskPriority = 'rendah' | 'sedang' | 'tinggi';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface MonthlyCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyStats {
  monthKey: string; // e.g. "2026-10"
  monthLabel: string; // e.g. "Oktober 2026"
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  topExpenseCategory?: string;
  categoryBreakdown: MonthlyCategoryBreakdown[];
}
