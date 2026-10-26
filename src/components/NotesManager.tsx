import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Trash2, Copy, Check, X, Pencil } from 'lucide-react';
import { Note } from '../types/index.ts';

interface NotesManagerProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updated: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const NOTE_COLORS = [
  { id: 'white', label: 'Putih', bg: 'bg-white', border: 'border-slate-200' },
  { id: 'amber', label: 'Kuning', bg: 'bg-amber-50/60', border: 'border-amber-200/80' },
  { id: 'emerald', label: 'Hijau', bg: 'bg-emerald-50/60', border: 'border-emerald-200/80' },
  { id: 'sky', label: 'Biru', bg: 'bg-sky-50/60', border: 'border-sky-200/80' },
  { id: 'purple', label: 'Ungu', bg: 'bg-purple-50/60', border: 'border-purple-200/80' },
];

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('white');
  const [pinned, setPinned] = useState(false);

  // Edit modal states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState('white');
  const [editPinned, setEditPinned] = useState(false);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = notes.filter((n) => {
      return (
        q === '' ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });

    // Pinned notes first
    return [...list].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return b.createdAt - a.createdAt;
      }
      return a.pinned ? -1 : 1;
    });
  }, [notes, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onAddNote({
      title: title.trim() || 'Tanpa Judul',
      content: content.trim(),
      color,
      pinned,
    });

    setTitle('');
    setContent('');
    setColor('white');
    setPinned(false);
    setIsAdding(false);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditColor(note.color);
    setEditPinned(note.pinned);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    if (!editTitle.trim() && !editContent.trim()) return;

    onUpdateNote(editingNote.id, {
      title: editTitle.trim() || 'Tanpa Judul',
      content: editContent.trim(),
      color: editColor,
      pinned: editPinned,
    });

    setEditingNote(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getColorClasses = (colorKey: string) => {
    const found = NOTE_COLORS.find((c) => c.id === colorKey);
    return found || NOTE_COLORS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Catatan Cepat & Memo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simpan ide, draft tulisan, atau informasi penting secara instan.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Tutup Formulir' : 'Catatan Baru'}</span>
        </button>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Buat Catatan Baru</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              aria-label="Tutup formulir catatan"
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Judul
            </label>
            <input
              type="text"
              placeholder="Contoh: Rencana Belanja / Ide Aplikasi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Isi Catatan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan catatan Anda di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Warna:</span>
              <div className="flex items-center gap-1.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    aria-label={`Warna ${c.label}`}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      c.bg
                    } ${
                      color === c.id
                        ? 'ring-2 ring-indigo-500 ring-offset-1 border-slate-400'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Sematkan ke atas (Pin)</span>
            </label>
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
              Simpan Catatan
            </button>
          </div>
        </form>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
            <form onSubmit={handleSaveEdit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Edit Catatan</h3>
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  aria-label="Tutup edit catatan"
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Judul Catatan
                  </label>
                  <input
                    type="text"
                    placeholder="Judul catatan"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Isi Catatan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tuliskan catatan..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Warna:</span>
                    <div className="flex items-center gap-1.5">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setEditColor(c.id)}
                          aria-label={`Ubah warna ke ${c.label}`}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            c.bg
                          } ${
                            editColor === c.id
                              ? 'ring-2 ring-indigo-500 ring-offset-1 border-slate-400'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPinned}
                      onChange={(e) => setEditPinned(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Sematkan ke atas (Pin)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80">
          <p className="text-sm font-medium text-slate-600">Tidak ada catatan.</p>
          <p className="text-xs text-slate-400 mt-1">
            Klik tombol &quot;Catatan Baru&quot; di atas untuk menulis memo pertama Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const colorClass = getColorClasses(note.color);
            const isEdited = note.updatedAt && note.updatedAt > note.createdAt + 1000;

            return (
              <div
                key={note.id}
                className={`relative flex flex-col justify-between p-4 rounded-xl border shadow-xs transition-all hover:shadow-md ${colorClass.bg} ${colorClass.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-slate-900 leading-snug break-words">
                      {note.title}
                    </h3>
                    <button
                      onClick={() => onTogglePin(note.id)}
                      aria-label={note.pinned ? 'Lepas pin' : 'Sematkan catatan'}
                      className={`p-1 rounded hover:bg-black/5 transition-colors cursor-pointer shrink-0 ${
                        note.pinned ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-indigo-600' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-black/5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {isEdited && (
                      <span className="text-[10px] text-slate-400 italic">
                        · diedit
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(note)}
                      title="Edit catatan"
                      aria-label={`Edit catatan ${note.title}`}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(note.id, `${note.title}\n\n${note.content}`)}
                      title="Salin teks"
                      aria-label="Salin teks"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      title="Hapus catatan"
                      aria-label="Hapus catatan"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
