'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

const MAROON = '#5c1a1a';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
  sender_first: string | null;
  sender_last: string | null;
  read_at: string | null;
}

export default function MemberNotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);
  const [expanded, setExpanded]           = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth/signin'); return; }
  }, [user, authLoading, router]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    const unread = notifications.filter(n => !n.read_at);
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })));
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setMarkingAll(false);
  };

  const handleExpand = (id: number) => {
    setExpanded(prev => prev === id ? null : id);
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read_at) markRead(id);
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAROON }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={22} style={{ color: MAROON }} />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
              <CheckCheck size={15} />
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>

        {/* List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">You have no notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const isUnread = !n.read_at;
              const isOpen   = expanded === n.id;
              return (
                <div key={n.id}
                  className={`rounded-xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                  }`}
                  onClick={() => handleExpand(n.id)}>
                  <div className="px-5 py-4 flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {isUnread
                        ? <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MAROON }} />
                        : <div className="w-2 h-2 rounded-full bg-transparent" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {n.title}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        From {n.sender_first && n.sender_last ? `${n.sender_first} ${n.sender_last}` : 'Orchard Hills Bible Church'}
                      </p>

                      {isOpen && (
                        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {n.message}
                        </p>
                      )}
                      {!isOpen && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {n.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
