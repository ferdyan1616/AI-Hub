import { Task, TaskStats, Transaction, FinancialSummary } from '../types/index.ts';

export function filterTasks(
  tasks: Task[],
  searchQuery: string,
  categoryFilter: string,
  statusFilter: 'all' | 'active' | 'completed'
): Task[] {
  const query = searchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchesSearch =
      query === '' ||
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query));

    const matchesCategory =
      categoryFilter === 'all' || task.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !task.completed) ||
      (statusFilter === 'completed' && task.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

export function calculateTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, completionRate };
}

export function calculateFinancialSummary(
  transactions: Transaction[]
): FinancialSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = INDONESIAN_MONTHS[monthIdx] || monthStr;
  return `${monthName} ${yearStr}`;
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  const currentMonth = new Date().toISOString().slice(0, 7);
  set.add(currentMonth);

  for (const t of transactions) {
    if (t.date && t.date.length >= 7) {
      set.add(t.date.slice(0, 7));
    }
  }

  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

export function calculateMonthlyStats(
  transactions: Transaction[],
  monthKey: string
): import('../types/index.ts').MonthlyStats {
  const monthTransactions = transactions.filter(
    (t) => t.date && t.date.startsWith(monthKey)
  );

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCatMap: Record<string, number> = {};

  for (const t of monthTransactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;
    }
  }

  const balance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;

  const categoryBreakdown = Object.entries(expenseCatMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenseCategory = categoryBreakdown[0]?.category;

  return {
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    totalIncome,
    totalExpense,
    balance,
    savingsRate,
    topExpenseCategory,
    categoryBreakdown,
  };
}

export function generateMonthlyFinancialCSV(
  transactions: Transaction[],
  monthKey: string
): string {
  const stats = calculateMonthlyStats(transactions, monthKey);
  const monthTransactions = transactions
    .filter((t) => t.date && t.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const rows: string[] = [];

  // UTF-8 BOM for Microsoft Excel / Sheets compatibility
  rows.push('"Tanggal","Tipe","Kategori","Keterangan","Nominal (IDR)"');

  for (const t of monthTransactions) {
    const typeLabel = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const escapedTitle = t.title.replace(/"/g, '""');
    const escapedCat = t.category.replace(/"/g, '""');
    rows.push(
      `"${t.date}","${typeLabel}","${escapedCat}","${escapedTitle}","${t.amount}"`
    );
  }

  rows.push('""');
  rows.push(`"RINGKASAN EVALUASI (${stats.monthLabel})","","","",""`);
  rows.push(`"Total Pemasukan","","","","${stats.totalIncome}"`);
  rows.push(`"Total Pengeluaran","","","","${stats.totalExpense}"`);
  rows.push(`"Sisa Saldo","","","","${stats.balance}"`);
  rows.push(`"Rasio Tabungan","","","","${stats.savingsRate}%"`);
  if (stats.topExpenseCategory) {
    rows.push(
      `"Pengeluaran Terbesar","","","","${stats.topExpenseCategory}"`
    );
  }

  return '\uFEFF' + rows.join('\r\n');
}
