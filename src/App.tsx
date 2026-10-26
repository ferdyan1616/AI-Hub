/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { QuickStats } from './components/QuickStats.tsx';
import { TaskManager } from './components/TaskManager.tsx';
import { NotesManager } from './components/NotesManager.tsx';
import { BudgetTracker } from './components/BudgetTracker.tsx';
import { PomodoroTimer } from './components/PomodoroTimer.tsx';
import { QuickAddModal } from './components/QuickAddModal.tsx';
import { Task, Note, Transaction } from './types/index.ts';
import { calculateTaskStats, calculateFinancialSummary } from './utils/calc.ts';
import { RotateCcw } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Persiapkan materi presentasi kerja',
    category: 'Pekerjaan',
    priority: 'tinggi',
    completed: false,
    dueDate: '2026-10-27',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'task-2',
    title: 'Beli sayuran segar & buah mingguan',
    category: 'Pribadi',
    priority: 'sedang',
    completed: false,
    dueDate: '2026-10-26',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'task-3',
    title: 'Membaca 2 bab buku pemrograman',
    category: 'Belajar',
    priority: 'rendah',
    completed: true,
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'task-4',
    title: 'Jalan pagi atau olahraga ringan 30 menit',
    category: 'Kesehatan',
    priority: 'sedang',
    completed: true,
    createdAt: Date.now() - 3600000 * 48,
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Prinsip Desain Bersih & Elegan',
    content:
      'Gunakan tata letak berhirarki jelas, kontras warna yang nyaman di mata, dan hindari elemen visual berlebihan yang tidak fungsional.',
    color: 'amber',
    pinned: true,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'note-2',
    title: 'Daftar Kebutuhan Akhir Pekan',
    content:
      '1. Kopi Arabika giling segar\n2. Susu oat\n3. Telur ayam kampung\n4. Buah pisang & apel',
    color: 'sky',
    pinned: false,
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'note-3',
    title: 'Rangkuman Singkat Proyek',
    content:
      'Target utama minggu ini: merampungkan aplikasi produktivitas yang intuitif, cepat diakses, dan responsif di berbagai perangkat.',
    color: 'emerald',
    pinned: false,
    createdAt: Date.now() - 3600000 * 16,
    updatedAt: Date.now() - 3600000 * 16,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Pemasukan Gaji / Project Web',
    amount: 6500000,
    type: 'income',
    category: 'Gaji',
    date: '2026-10-24',
  },
  {
    id: 'tx-2',
    title: 'Belanja Kebutuhan Mingguan',
    amount: 320000,
    type: 'expense',
    category: 'Belanja',
    date: '2026-10-25',
  },
  {
    id: 'tx-3',
    title: 'Makan Siang & Es Teh Manis',
    amount: 35000,
    type: 'expense',
    category: 'Makanan & Minuman',
    date: '2026-10-25',
  },
  {
    id: 'tx-4',
    title: 'Langganan Internet Rumah',
    amount: 375000,
    type: 'expense',
    category: 'Tagihan',
    date: '2026-10-22',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'budget' | 'timer'>('tasks');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Read URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'notes' || tabParam === 'budget' || tabParam === 'timer') {
      setActiveTab(tabParam);
    }
  }, []);

  // Persistent State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dailyhub_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('dailyhub_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dailyhub_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [focusSessions, setFocusSessions] = useState<number>(() => {
    const saved = localStorage.getItem('dailyhub_sessions');
    return saved ? parseInt(saved, 10) : 2;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dailyhub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dailyhub_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('dailyhub_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dailyhub_sessions', focusSessions.toString());
  }, [focusSessions]);

  // Task actions
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Note actions
  const handleAddNote = (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleUpdateNote = (
    id: string,
    updated: Partial<Omit<Note, 'id' | 'createdAt'>>
  ) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updated, updatedAt: Date.now() } : n
      )
    );
  };

  // Transaction actions
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Muat ulang data contoh awal?')) {
      setTasks(INITIAL_TASKS);
      setNotes(INITIAL_NOTES);
      setTransactions(INITIAL_TRANSACTIONS);
      setFocusSessions(2);
    }
  };

  const taskStats = calculateTaskStats(tasks);
  const financialSummary = calculateFinancialSummary(transactions);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Bar following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Quick Stats Banner */}
        <QuickStats
          taskStats={taskStats}
          notesCount={notes.length}
          financialSummary={financialSummary}
          focusSessions={focusSessions}
          onNavigateTab={setActiveTab}
        />

        {/* Tab View Content */}
        <div className="min-h-[460px]">
          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompletedTasks}
            />
          )}

          {activeTab === 'notes' && (
            <NotesManager
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePinNote}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTracker
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'timer' && (
            <PomodoroTimer
              completedSessions={focusSessions}
              onSessionComplete={() => setFocusSessions((prev) => prev + 1)}
            />
          )}
        </div>
      </main>

      {/* Modal for Quick Universal Entry */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        onAddNote={handleAddNote}
        onAddTransaction={handleAddTransaction}
        onSwitchTab={setActiveTab}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>DailyHub · Manajemen Tugas, Catatan, & Keuangan Harian</span>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
