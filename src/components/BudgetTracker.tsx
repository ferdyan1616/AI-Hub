import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  X,
  Download,
  Calendar,
  Check,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/index.ts';
import {
  calculateFinancialSummary,
  calculateMonthlyStats,
  getAvailableMonths,
  formatMonthLabel,
  generateMonthlyFinancialCSV,
  formatRupiah,
} from '../utils/calc.ts';

interface BudgetTrackerProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORIES_EXPENSE = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Hiburan',
  'Lainnya',
];
const CATEGORIES_INCOME = [
  'Gaji',
  'Freelance & Bisnis',
  'Hadiah/Bonus',
  'Investasi',
  'Lainnya',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman': 'bg-amber-500',
  Transportasi: 'bg-blue-500',
  Belanja: 'bg-purple-500',
  Tagihan: 'bg-rose-500',
  Hiburan: 'bg-pink-500',
  Lainnya: 'bg-slate-400',
};

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Available months
  const availableMonths = useMemo(
    () => getAvailableMonths(transactions),
    [transactions]
  );

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths[0] || new Date().toISOString().slice(0, 7);
  });

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(CATEGORIES_EXPENSE[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Overall summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);

  // Selected month statistics & evaluation
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const filteredTransactions = useMemo(() => {
    const list = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filterType === 'all') return list;
    return list.filter((t) => t.type === filterType);
  }, [transactions, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
    });

    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(
      newType === 'expense' ? CATEGORIES_EXPENSE[0] : CATEGORIES_INCOME[0]
    );
  };

  const handleDownloadCSV = () => {
    const csvContent = generateMonthlyFinancialCSV(transactions, selectedMonth);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-keuangan-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Chart bar scaling math
  const maxMonthlyVal = Math.max(
    monthlyStats.totalIncome,
    monthlyStats.totalExpense,
    1
  );
  const incomeBarHeight = Math.max(
    8,
    Math.round((monthlyStats.totalIncome / maxMonthlyVal) * 100)
  );
  const expenseBarHeight = Math.max(
    8,
    Math.round((monthlyStats.totalExpense / maxMonthlyVal) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Catatan Keuangan & Anggaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau arus pemasukan, grafik evaluasi bulanan, dan unduh laporan.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Tutup Formulir' : 'Catat Transaksi'}</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Pemasukan (Semua)
            </span>
            <div className="p-1 rounded bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 font-mono-tabular">
            {formatRupiah(summary.totalIncome)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Pengeluaran (Semua)
            </span>
            <div className="p-1 rounded bg-rose-50 text-rose-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-600 font-mono-tabular">
            {formatRupiah(summary.totalExpense)}
          </p>
        </div>

        {/* Balance Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Sisa Saldo
            </span>
          </div>
          <p className="text-xl font-bold font-mono-tabular text-white">
            {formatRupiah(summary.balance)}
          </p>
        </div>
      </div>

      {/* MONTHLY EVALUATION & CHART SECTION */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Top Control: Month Selector & Download Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold">Pilih Periode Evaluasi:</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih Bulan Evaluasi"
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Download Monthly CSV Button */}
          <button
            onClick={handleDownloadCSV}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Laporan Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Laporan CSV ({formatMonthLabel(selectedMonth)})</span>
              </>
            )}
          </button>
        </div>

        {/* Monthly Evaluation Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Pemasukan Bulan Ini
            </span>
            <span className="text-base font-bold text-emerald-600 font-mono-tabular mt-1 block truncate">
              {formatRupiah(monthlyStats.totalIncome)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Pengeluaran Bulan Ini
            </span>
            <span className="text-base font-bold text-rose-600 font-mono-tabular mt-1 block truncate">
              {formatRupiah(monthlyStats.totalExpense)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Surplus / Sisa Saldo
            </span>
            <span
              className={`text-base font-bold font-mono-tabular mt-1 block truncate ${
                monthlyStats.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              {formatRupiah(monthlyStats.balance)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Rasio Tabungan
            </span>
            <span className="text-base font-bold text-slate-900 font-mono-tabular mt-1 block">
              {monthlyStats.savingsRate}%
            </span>
          </div>
        </div>

        {/* Charts Section: 2 Columns (Comparison Bar Chart & Category Breakdown) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Chart 1: Pemasukan vs Pengeluaran Bar Chart */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Grafik Perbandingan: Pemasukan vs Pengeluaran
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluasi proporsi arus kas pada {monthlyStats.monthLabel}
              </p>
            </div>

            {/* Visual Bar Display */}
            <div className="h-44 flex items-end justify-center gap-12 px-6 pb-2 border-b border-slate-200">
              {/* Income Bar */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-24">
                <span className="text-xs font-semibold text-emerald-700 font-mono-tabular text-center">
                  {formatRupiah(monthlyStats.totalIncome)}
                </span>
                <div
                  className="w-full bg-emerald-500 rounded-t-lg transition-all duration-700 shadow-xs"
                  style={{ height: `${incomeBarHeight}%` }}
                />
                <span className="text-xs font-medium text-slate-600">Pemasukan</span>
              </div>

              {/* Expense Bar */}
              <div className="flex flex-col items-center gap-2 h-full justify-end w-24">
                <span className="text-xs font-semibold text-rose-700 font-mono-tabular text-center">
                  {formatRupiah(monthlyStats.totalExpense)}
                </span>
                <div
                  className="w-full bg-rose-500 rounded-t-lg transition-all duration-700 shadow-xs"
                  style={{ height: `${expenseBarHeight}%` }}
                />
                <span className="text-xs font-medium text-slate-600">Pengeluaran</span>
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="mt-3 text-xs text-slate-600">
              {monthlyStats.balance >= 0 ? (
                <span className="text-emerald-700 font-medium">
                  ✓ Surplus anggaran: Pemasukan mencukupi seluruh kebutuhan bulan ini.
                </span>
              ) : (
                <span className="text-rose-700 font-medium">
                  ⚠ Defisit anggaran: Pengeluaran melampaui pemasukan bulan ini.
                </span>
              )}
            </div>
          </div>

          {/* Chart 2: Category Expense Breakdown */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Distribusi Kategori Pengeluaran
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alokasi pengeluaran berdasarkan pos belanja
              </p>
            </div>

            {/* Category Segmented Bar */}
            {monthlyStats.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada pengeluaran yang tercatat pada bulan ini.
              </div>
            ) : (
              <div className="space-y-3 my-auto py-2">
                {/* Horizontal Multi-color Stacked Bar */}
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  {monthlyStats.categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      style={{ width: `${item.percentage}%` }}
                      className={`${
                        CATEGORY_COLORS[item.category] || 'bg-slate-400'
                      } h-full transition-all`}
                      title={`${item.category}: ${item.percentage}%`}
                    />
                  ))}
                </div>

                {/* Category List with Percentages */}
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {monthlyStats.categoryBreakdown.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            CATEGORY_COLORS[item.category] || 'bg-slate-400'
                          }`}
                        />
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono-tabular">
                        <span className="text-slate-500">
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="font-semibold text-slate-800 w-9 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Category Insight */}
            <div className="mt-3 text-xs text-slate-600">
              {monthlyStats.topExpenseCategory ? (
                <span>
                  Pengeluaran tertinggi pada pos:{' '}
                  <strong className="text-slate-900">
                    {monthlyStats.topExpenseCategory}
                  </strong>
                </span>
              ) : (
                <span>Belum ada pos pengeluaran.</span>
              )}
            </div>
          </div>
        </div>

        {/* Automatic Evaluation & Recommendations Banner */}
        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">
              💡 Kesimpulan Evaluasi Keuangan ({monthlyStats.monthLabel}):
            </span>
            <p className="text-slate-600 leading-relaxed">
              {monthlyStats.totalIncome === 0 && monthlyStats.totalExpense === 0
                ? 'Belum ada data transaksi tercatat untuk bulan ini.'
                : monthlyStats.balance >= 0
                ? `Kondisi keuangan bulan ini sangat sehat dengan tingkat tabungan sebesar ${
                    monthlyStats.savingsRate
                  }%. Dari total pemasukan ${formatRupiah(
                    monthlyStats.totalIncome
                  )}, Anda mempertahankan surplus sebesar ${formatRupiah(
                    monthlyStats.balance
                  )}.${
                    monthlyStats.topExpenseCategory
                      ? ` Pos pengeluaran terbesar dialokasikan untuk ${monthlyStats.topExpenseCategory}.`
                      : ''
                  }`
                : `Perhatian: Pengeluaran bulan ini melebihi pemasukan dengan defisit ${formatRupiah(
                    Math.abs(monthlyStats.balance)
                  )}. Disarankan untuk meninjau kembali alokasi pengeluaran pada pos ${
                    monthlyStats.topExpenseCategory || 'utama'
                  }.`}
            </p>
          </div>
        </div>
      </div>

      {/* Add Transaction Form (Collapsible) */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Catat Transaksi Baru
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label="Tutup formulir transaksi"
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Keterangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Makan Siang / Gaji Proyek"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {(type === 'expense'
                  ? CATEGORIES_EXPENSE
                  : CATEGORIES_INCOME
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & History Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Riwayat Transaksi</h3>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterType === 'income'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterType === 'expense'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80">
            <p className="text-sm font-medium text-slate-600">
              Belum ada transaksi.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Catat pengeluaran atau pemasukan pertama Anda untuk melacak saldo.
            </p>
          </div>
        ) : (
          filteredTransactions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    item.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {item.type === 'income' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-sm font-bold font-mono-tabular ${
                    item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                </span>

                <button
                  onClick={() => onDeleteTransaction(item.id)}
                  aria-label="Hapus transaksi"
                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
