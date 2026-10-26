import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterTasks,
  calculateTaskStats,
  calculateFinancialSummary,
  formatRupiah,
  formatTime,
  formatMonthLabel,
  getAvailableMonths,
  calculateMonthlyStats,
  generateMonthlyFinancialCSV,
} from './calc.ts';
import { Task, Transaction } from '../types/index.ts';

test('formatMonthLabel formats YYYY-MM correctly to Indonesian', () => {
  assert.equal(formatMonthLabel('2026-10'), 'Oktober 2026');
  assert.equal(formatMonthLabel('2026-01'), 'Januari 2026');
});

test('calculateMonthlyStats aggregates income, expense, balance, and category breakdown', () => {
  const transactions: Transaction[] = [
    { id: '1', title: 'Gaji', amount: 6000000, type: 'income', category: 'Gaji', date: '2026-10-01' },
    { id: '2', title: 'Belanja', amount: 500000, type: 'expense', category: 'Belanja', date: '2026-10-05' },
    { id: '3', title: 'Makan', amount: 200000, type: 'expense', category: 'Makanan', date: '2026-10-10' },
    { id: '4', title: 'Transaksi Bulan Lain', amount: 100000, type: 'expense', category: 'Makanan', date: '2026-09-10' },
  ];

  const stats = calculateMonthlyStats(transactions, '2026-10');
  assert.equal(stats.totalIncome, 6000000);
  assert.equal(stats.totalExpense, 700000);
  assert.equal(stats.balance, 5300000);
  assert.equal(stats.topExpenseCategory, 'Belanja');
  assert.equal(stats.categoryBreakdown.length, 2);
  assert.equal(stats.categoryBreakdown[0].category, 'Belanja');
  assert.equal(stats.categoryBreakdown[0].amount, 500000);
});

test('generateMonthlyFinancialCSV produces valid CSV content with summary rows', () => {
  const transactions: Transaction[] = [
    { id: '1', title: 'Gaji', amount: 5000000, type: 'income', category: 'Gaji', date: '2026-10-01' },
    { id: '2', title: 'Sewa', amount: 1500000, type: 'expense', category: 'Tagihan', date: '2026-10-02' },
  ];

  const csv = generateMonthlyFinancialCSV(transactions, '2026-10');
  assert.ok(csv.startsWith('\uFEFF"Tanggal","Tipe"'));
  assert.ok(csv.includes('"Sewa"'));
  assert.ok(csv.includes('RINGKASAN EVALUASI (Oktober 2026)'));
  assert.ok(csv.includes('"Total Pengeluaran","","","","1500000"'));
});

test('filterTasks correctly filters by status, search, and category', () => {
  const dummyTasks: Task[] = [
    {
      id: '1',
      title: 'Belajar TypeScript',
      description: 'Membaca handbook',
      category: 'Belajar',
      priority: 'tinggi',
      completed: false,
      createdAt: 1000,
    },
    {
      id: '2',
      title: 'Beli Kopi',
      description: 'Arabica beans',
      category: 'Pribadi',
      priority: 'sedang',
      completed: true,
      createdAt: 2000,
    },
    {
      id: '3',
      title: 'Meeting Tim Proyek',
      description: 'Sprint planning',
      category: 'Pekerjaan',
      priority: 'tinggi',
      completed: false,
      createdAt: 3000,
    },
  ];

  // Test status filter
  const activeTasks = filterTasks(dummyTasks, '', 'all', 'active');
  assert.equal(activeTasks.length, 2);

  const completedTasks = filterTasks(dummyTasks, '', 'all', 'completed');
  assert.equal(completedTasks.length, 1);
  assert.equal(completedTasks[0].id, '2');

  // Test search query
  const searchResults = filterTasks(dummyTasks, 'kopi', 'all', 'all');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].title, 'Beli Kopi');

  // Test category filter
  const studyTasks = filterTasks(dummyTasks, '', 'Belajar', 'all');
  assert.equal(studyTasks.length, 1);
  assert.equal(studyTasks[0].category, 'Belajar');
});

test('calculateTaskStats returns accurate numbers and percentages', () => {
  const tasks: Task[] = [
    { id: '1', title: 'Task 1', category: 'Pribadi', priority: 'rendah', completed: true, createdAt: 1 },
    { id: '2', title: 'Task 2', category: 'Pribadi', priority: 'rendah', completed: true, createdAt: 2 },
    { id: '3', title: 'Task 3', category: 'Pribadi', priority: 'rendah', completed: false, createdAt: 3 },
    { id: '4', title: 'Task 4', category: 'Pribadi', priority: 'rendah', completed: false, createdAt: 4 },
  ];

  const stats = calculateTaskStats(tasks);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 2);
  assert.equal(stats.pending, 2);
  assert.equal(stats.completionRate, 50);

  const emptyStats = calculateTaskStats([]);
  assert.equal(emptyStats.total, 0);
  assert.equal(emptyStats.completionRate, 0);
});

test('calculateFinancialSummary calculates income, expense, and net balance', () => {
  const transactions: Transaction[] = [
    { id: '1', title: 'Gaji Bulanan', amount: 5000000, type: 'income', category: 'Gaji', date: '2026-10-25' },
    { id: '2', title: 'Makan Siang', amount: 35000, type: 'expense', category: 'Makanan', date: '2026-10-25' },
    { id: '3', title: 'Bensin Motor', amount: 50000, type: 'expense', category: 'Transport', date: '2026-10-25' },
  ];

  const summary = calculateFinancialSummary(transactions);
  assert.equal(summary.totalIncome, 5000000);
  assert.equal(summary.totalExpense, 85000);
  assert.equal(summary.balance, 4915000);
});

test('formatTime formats seconds into mm:ss strings', () => {
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(300), '05:00');
  assert.equal(formatTime(9), '00:09');
  assert.equal(formatTime(0), '00:00');
});

test('formatRupiah formats currency numbers', () => {
  const formatted = formatRupiah(100000);
  assert.match(formatted, /100\.000/);
});
