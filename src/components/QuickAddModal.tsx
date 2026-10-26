import React, { useState } from 'react';
import { X, CheckSquare, FileText, Wallet } from 'lucide-react';
import { Task, Note, Transaction, TaskCategory, TaskPriority, TransactionType } from '../types/index.ts';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onSwitchTab: (tab: 'tasks' | 'notes' | 'budget' | 'timer') => void;
}

type ModalType = 'task' | 'note' | 'transaction';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  onAddNote,
  onAddTransaction,
  onSwitchTab,
}) => {
  const [activeType, setActiveType] = useState<ModalType>('task');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('Pekerjaan');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('sedang');

  // Note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('white');

  // Transaction fields
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txCategory, setTxCategory] = useState('Makanan & Minuman');

  if (!isOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      completed: false,
    });
    setTaskTitle('');
    onSwitchTab('tasks');
    onClose();
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;
    onAddNote({
      title: noteTitle.trim() || 'Tanpa Judul',
      content: noteContent.trim(),
      color: noteColor,
      pinned: false,
    });
    setNoteTitle('');
    setNoteContent('');
    onSwitchTab('notes');
    onClose();
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(txAmount.replace(/[^0-9]/g, ''));
    if (!txTitle.trim() || isNaN(parsed) || parsed <= 0) return;
    onAddTransaction({
      title: txTitle.trim(),
      amount: parsed,
      type: txType,
      category: txCategory,
      date: new Date().toISOString().split('T')[0],
    });
    setTxTitle('');
    setTxAmount('');
    onSwitchTab('budget');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">Tambah Cepat</h3>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveType('task')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeType === 'task'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tugas</span>
          </button>
          <button
            onClick={() => setActiveType('note')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeType === 'note'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Catatan</span>
          </button>
          <button
            onClick={() => setActiveType('transaction')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeType === 'transaction'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Keuangan</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {activeType === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Tugas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kirim email ke klien..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Pekerjaan">Pekerjaan</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Belajar">Belajar</option>
                    <option value="Kesehatan">Kesehatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="rendah">Rendah</option>
                    <option value="sedang">Sedang</option>
                    <option value="tinggi">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Tambah Tugas
                </button>
              </div>
            </form>
          )}

          {activeType === 'note' && (
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Judul Catatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rangkuman Buku"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Isi Catatan
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan catatan..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          )}

          {activeType === 'transaction' && (
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    txType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    txType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi pagi"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Contoh: 25000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-tabular"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
