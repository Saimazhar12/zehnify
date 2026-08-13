import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ClipboardList, Loader2, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';

const POLL_MS = 45_000;

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

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnread(count);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setItems(data);
      setUnread(data.filter((n) => !n.isRead).length);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const id = window.setInterval(() => void refreshCount(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  useEffect(() => {
    if (open) void loadList();
  }, [open, loadList]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleOpen = () => setOpen((v) => !v);

  const handleClickItem = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        const updated = await notificationService.markAsRead(item.id);
        setItems((prev) => prev.map((n) => (n.id === item.id ? updated : n)));
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    if (item.type === 'section_assigned') {
      navigate('/app/chat');
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnread(0);
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex items-center justify-center text-blue-600 font-bold bg-blue-50 min-h-11 min-w-11 px-3 py-2 rounded-full hover:bg-blue-100 transition-all border border-blue-100"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" aria-hidden />
          <div
            className="fixed inset-x-3 top-[4.5rem] z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem] w-auto max-h-[min(70vh,28rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-fade-in"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-slate-50/80">
              <h3 className="text-sm font-black text-gray-900 tracking-tight">Notifications</h3>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleMarkAll()}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {markingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                    Mark all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 sm:hidden"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10 px-4">No notifications yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void handleClickItem(item)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 ${
                          !item.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
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
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm truncate ${!item.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                              {item.title}
                            </p>
                            {!item.isRead && (
                              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
                          <p className="text-[10px] font-medium text-gray-400 mt-1.5">
                            {formatRelative(item.createdAt)}
                            {item.sender?.firstName
                              ? ` · ${item.sender.firstName}${item.sender.lastName ? ` ${item.sender.lastName}` : ''}`
                              : ''}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
