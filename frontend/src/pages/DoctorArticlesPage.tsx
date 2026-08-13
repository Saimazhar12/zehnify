import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, LogOut, Menu, PenLine, Plus, Trash2, User as UserIcon, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { articleService, CreateArticlePayload } from '../services/articleService';
import { WellnessArticleSummary } from '../types';

const emptyForm: CreateArticlePayload = {
  title: '',
  excerpt: '',
  content: '',
  type: 'article',
  readTimeMinutes: 5,
  published: true,
};

export default function DoctorArticlesPage() {
  const { handleLogout, currentUser } = useAppContext();
  const [articles, setArticles] = useState<WellnessArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateArticlePayload>(emptyForm);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await articleService.getMine();
      setArticles(data);
    } catch (error) {
      console.error('Failed to load articles:', error);
      showToast('Failed to load your articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (article: WellnessArticleSummary) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      excerpt: article.excerpt,
      content: '',
      type: article.type,
      readTimeMinutes: article.readTimeMinutes,
      published: article.published,
    });
    void articleService.getById(article.id).then((detail) => {
      setForm((prev) => ({ ...prev, content: detail.content }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      showToast('Please fill in title, excerpt, and content.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await articleService.update(editingId, form);
        showToast('Article updated successfully.');
      } else {
        await articleService.create(form);
        showToast('Article published successfully.');
      }
      resetForm();
      await loadArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
      showToast('Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await articleService.remove(id);
      if (editingId === id) resetForm();
      showToast('Article deleted.');
      await loadArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      showToast('Failed to delete article.');
    } finally {
      setDeletingId(null);
    }
  };

  const sidebarContent = (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <PenLine size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">Wellness Articles</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              Dr. {currentUser?.firstName} {currentUser?.lastName}
            </p>
          </div>
        </div>
        <Link
          to="/doctor"
          onClick={() => setSidebarOpen(false)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-sm border border-slate-100"
        >
          <ArrowLeft size={18} />
          <span>Back to Patients</span>
        </Link>
      </div>
      <div className="mt-auto p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {toast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 z-50 bg-gray-900/90 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <PenLine size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-800 truncate">Wellness Articles</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest truncate">
              Dr. {currentUser?.firstName} {currentUser?.lastName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-end p-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Article' : 'Write New Article'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Understanding Anxiety"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Short excerpt</label>
                <textarea
                  required
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  placeholder="A brief summary patients will see on the library card..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'article' | 'guide' })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="article">Article</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Read time (min)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={form.readTimeMinutes}
                    onChange={(e) => setForm({ ...form, readTimeMinutes: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full content</label>
                <textarea
                  required
                  rows={12}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-y"
                  placeholder="Write the full article here. Use blank lines between paragraphs. **Bold text** is supported."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Publish to Wellness Library
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingId ? 'Update Article' : 'Publish Article'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Your Articles</h2>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading articles...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-6 sm:p-10 text-center text-slate-500 text-sm">
                No articles yet. Write your first wellness article for patients.
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        article.type === 'guide' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {article.type}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-2">{article.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{article.excerpt}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{article.readTimeMinutes} min</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                    <UserIcon className="w-3.5 h-3.5" />
                    Dr. {article.author?.firstName} {article.author?.lastName}
                    {!article.published && (
                      <span className="ml-auto text-amber-600 font-bold uppercase">Draft</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(article)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-50"
                    >
                      {deletingId === article.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
