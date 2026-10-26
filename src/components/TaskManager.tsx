import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Calendar, CheckSquare, Square, X } from 'lucide-react';
import { Task, TaskCategory, TaskPriority } from '../types/index.ts';
import { filterTasks } from '../utils/calc.ts';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Pekerjaan');
  const [priority, setPriority] = useState<TaskPriority>('sedang');
  const [dueDate, setDueDate] = useState('');

  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, searchQuery, selectedCategory, selectedStatus);
  }, [tasks, searchQuery, selectedCategory, selectedStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      priority,
      completed: false,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDueDate('');
    setIsAdding(false);
  };

  const priorityColor = {
    rendah: 'text-slate-500',
    sedang: 'text-amber-600',
    tinggi: 'text-rose-600',
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Daftar Tugas Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola prioritas kerja, belajar, dan aktivitas harian Anda.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Tutup Formulir' : 'Tugas Baru'}</span>
        </button>
      </div>

      {/* Add Task Box (Collapsible) */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Tambah Tugas Baru</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label="Tutup formulir tugas"
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Judul Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Selesaikan laporan mingguan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
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
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
              >
                <option value="rendah">Rendah (Santai)</option>
                <option value="sedang">Sedang (Penting)</option>
                <option value="tinggi">Tinggi (Mendesak)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tenggat Waktu (Opsional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
              Simpan Tugas
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full md:w-auto shrink-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`flex-1 md:flex-initial px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedStatus === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selesai
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Semua Kategori</option>
            <option value="Pekerjaan">Pekerjaan</option>
            <option value="Pribadi">Pribadi</option>
            <option value="Belajar">Belajar</option>
            <option value="Kesehatan">Kesehatan</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80">
            <p className="text-sm font-medium text-slate-600">Tidak ada tugas yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">
              Tambahkan tugas baru untuk mulai mengorganisir harimu.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggleTask(task.id)}
                  aria-label={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0 transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </p>
                  
                  {/* Metadata line with typographic separators (anti-slop rule) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`capitalize font-medium ${priorityColor[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{task.dueDate}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={() => onDeleteTask(task.id)}
                aria-label="Hapus tugas"
                className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer helpers */}
      {tasks.some((t) => t.completed) && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onClearCompleted}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Bersihkan semua tugas yang sudah selesai
          </button>
        </div>
      )}
    </div>
  );
};
