import { useEffect, useState } from 'react';
import { Bell, ClipboardList, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DashboardNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationService.getAll();
        setItems(data.slice(0, 5));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const onOpen = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setItems((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
          ),
        );
      } catch {
        /* ignore */
      }
    }
    if (item.type === 'section_assigned') {
      navigate('/app/chat');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm flex items-center gap-3 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Loading notifications…</span>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900">Recent Notifications</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => void onOpen(item)}
              className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-colors ${
                item.isRead
                  ? 'border-gray-100 hover:border-gray-200 hover:bg-slate-50'
                  : 'border-blue-100 bg-blue-50/50 hover:bg-blue-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'section_assigned'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {item.type === 'section_assigned' ? (
                  <ClipboardList className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${item.isRead ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'}`}>
                    {item.title}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {formatRelative(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
