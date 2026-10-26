import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'tasks' | 'notes' | 'budget' | 'timer';
  setActiveTab: (tab: 'tasks' | 'notes' | 'budget' | 'timer') => void;
  onOpenQuickAdd: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('tasks');
          }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors"
        >
          DailyHub
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tasks'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tugas
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'notes'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catatan
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'budget'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keuangan
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'timer'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fokus
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
