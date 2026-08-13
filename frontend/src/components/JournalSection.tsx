import React, { useState, useEffect } from 'react';
import {
  PenTool, Save, Loader2, Trash2, ChevronDown, ChevronUp, Pencil, X, Check,
} from 'lucide-react';
import { journalService, JournalNote } from '../services/journalService';
import { USER_INPUT_MAX_LENGTH } from '../constants';

function formatNoteDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today, ${time}`;
  }

  const datePart = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return `${datePart} · ${time}`;
}

function displayTitle(note: JournalNote): string {
  if (note.title?.trim()) return note.title.trim();
  const firstLine = note.content.split('\n')[0]?.trim() || 'Untitled entry';
  return firstLine.length > 60 ? `${firstLine.slice(0, 60)}…` : firstLine;
}

interface NoteCardProps {
  note: JournalNote;
  expanded: boolean;
  editing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (title: string, content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  saving: boolean;
  deleting: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  expanded,
  editing,
  onToggle,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  saving,
  deleting,
}) => {
  const [editTitle, setEditTitle] = useState(note.title || displayTitle(note));
  const [editContent, setEditContent] = useState(note.content);

  useEffect(() => {
    if (editing) {
      setEditTitle(note.title || displayTitle(note));
      setEditContent(note.content);
    }
  }, [editing, note]);

  const wasEdited = note.updatedAt && note.updatedAt !== note.createdAt;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden transition-all">
      <button
        type="button"
        onClick={onToggle}
        disabled={editing}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-gray-100/80 transition-colors disabled:cursor-default"
      >
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm truncate">{displayTitle(note)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatNoteDate(note.createdAt)}
            {wasEdited && <span className="ml-1 text-gray-300">· edited</span>}
          </p>
          {!expanded && !editing && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{note.content}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {!editing && (
            expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {(expanded || editing) && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {editing ? (
            <div className="pt-4 space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value.slice(0, USER_INPUT_MAX_LENGTH))}
                maxLength={USER_INPUT_MAX_LENGTH}
                placeholder="Entry title"
                className="w-full bg-white rounded-lg px-3 py-2 text-sm font-bold text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value.slice(0, USER_INPUT_MAX_LENGTH))}
                maxLength={USER_INPUT_MAX_LENGTH}
                className="w-full bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-100 resize-none min-h-[120px]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void onSaveEdit(editTitle.trim(), editContent.trim())}
                  disabled={!editTitle.trim() || !editContent.trim() || saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-2.5 min-h-11 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2.5 min-h-11 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const JournalSection: React.FC = () => {
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await journalService.getNotes();
        setNotes(data);
      } catch (err) {
        console.error('Failed to load journal notes:', err);
        setError('Could not load your journal entries.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const saveNote = async () => {
    if (!currentTitle.trim() || !currentNote.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      const created = await journalService.createNote(currentTitle.trim(), currentNote.trim());
      setNotes((prev) => [created, ...prev]);
      setCurrentTitle('');
      setCurrentNote('');
      setExpandedId(created.id);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('Could not save your note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    setUpdatingId(noteId);
    setError(null);
    try {
      const updated = await journalService.updateNote(noteId, { title, content });
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      setEditingId(null);
      setExpandedId(noteId);
    } catch (err) {
      console.error('Failed to update note:', err);
      setError('Could not update this note.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteNote = async (noteId: string) => {
    setDeletingId(noteId);
    setError(null);
    try {
      await journalService.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (expandedId === noteId) setExpandedId(null);
      if (editingId === noteId) setEditingId(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Could not delete this note.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (noteId: string) => {
    if (editingId) return;
    setExpandedId((prev) => (prev === noteId ? null : noteId));
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0 md:min-h-[600px]">
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <PenTool className="w-5 h-5 mr-2 text-blue-500" /> New Entry
          </h3>
          <input
            type="text"
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 mb-3"
            placeholder="Entry title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value.slice(0, USER_INPUT_MAX_LENGTH))}
            maxLength={USER_INPUT_MAX_LENGTH}
            disabled={saving}
          />
          <textarea
            className="flex-1 w-full bg-gray-50 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none mb-2 min-h-[200px]"
            placeholder="What's on your mind today?"
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value.slice(0, USER_INPUT_MAX_LENGTH))}
            maxLength={USER_INPUT_MAX_LENGTH}
            disabled={saving}
          />
          <p className="text-[10px] text-gray-400 text-right mb-4">
            {currentNote.length}/{USER_INPUT_MAX_LENGTH}
          </p>
          <button
            onClick={() => void saveNote()}
            disabled={!currentTitle.trim() || !currentNote.trim() || saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[700px]">
          <h3 className="font-bold text-gray-800 mb-4">Past Entries</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Loading entries...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                <PenTool className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No entries yet</p>
                <p className="text-xs mt-1">Your saved notes will appear here.</p>
              </div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  expanded={expandedId === note.id}
                  editing={editingId === note.id}
                  onToggle={() => toggleExpand(note.id)}
                  onEdit={() => {
                    setExpandedId(note.id);
                    setEditingId(note.id);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(title, content) => updateNote(note.id, title, content)}
                  onDelete={() => deleteNote(note.id)}
                  saving={updatingId === note.id}
                  deleting={deletingId === note.id}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalSection;
