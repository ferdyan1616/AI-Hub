import React from 'react';
import { CheckCircle2, FileText, Wallet, Clock } from 'lucide-react';
import { TaskStats, FinancialSummary } from '../types/index.ts';
import { formatRupiah } from '../utils/calc.ts';

interface QuickStatsProps {
  taskStats: TaskStats;
  notesCount: number;
  financialSummary: FinancialSummary;
  focusSessions: number;
  onNavigateTab: (tab: 'tasks' | 'notes' | 'budget' | 'timer') => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  taskStats,
  notesCount,
  financialSummary,
  focusSessions,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Task Stat */}
      <button
        onClick={() => onNavigateTab('tasks')}
        className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Tugas Selesai</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {taskStats.completed}
          </span>
          <span className="text-sm text-slate-500 tabular-nums">
            / {taskStats.total} ({taskStats.completionRate}%)
          </span>
        </div>
      </button>

      {/* Notes Stat */}
      <button
        onClick={() => onNavigateTab('notes')}
        className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Catatan Aktif</span>
          <FileText className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {notesCount}
          </span>
          <span className="text-sm text-slate-500">item tersimpan</span>
        </div>
      </button>

      {/* Financial Stat */}
      <button
        onClick={() => onNavigateTab('budget')}
        className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Saldo Dompet</span>
          <Wallet className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl font-bold text-slate-900 tabular-nums truncate">
          {formatRupiah(financialSummary.balance)}
        </div>
      </button>

      {/* Focus Timer Stat */}
      <button
        onClick={() => onNavigateTab('timer')}
        className="text-left p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Sesi Fokus</span>
          <Clock className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {focusSessions}
          </span>
          <span className="text-sm text-slate-500">siklus terselesaikan</span>
        </div>
      </button>
    </div>
  );
};
