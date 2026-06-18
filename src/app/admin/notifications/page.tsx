'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell, Send, Users, User, Shield, Trash2,
  CheckCircle2, ChevronDown, ChevronUp, Search,
} from 'lucide-react';

const MAROON = '#5c1a1a';

type NotifType = 'direct' | 'mass' | 'role';

interface SentNotification {
  id: number;
  title: string;
  message: string;
  type: NotifType;
  target_role: string | null;
  created_at: string;
  sender_first: string;
  sender_last: string;
  recipient_count: number;
  read_count: number;
}

interface UserOption {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const ROLES = ['Member', 'Ministry Leader', 'Admin', 'Super Admin'];

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = !authLoading && !!user && (user.role === 'Admin' || user.role === 'Super Admin');

  // Compose state
  const [type, setType]           = useState<NotifType>('mass');
  const [title, setTitle]         = useState('');
  const [message, setMessage]     = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  // Sent notifications
  const [sent, setSent]             = useState<SentNotification[]>([]);
  const [sentLoading, setSentLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
      router.replace('/members/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchSent = useCallback(async () => {
    setSentLoading(true);
    try {
      const res  = await fetch('/api/notifications/sent');
      const data = await res.json();
      setSent(data.notifications ?? []);
    } finally {
      setSentLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchSent(); }, [isAdmin, fetchSent]);

  // User search for direct messages
  useEffect(() => {
    if (type !== 'direct' || userSearch.trim().length < 2) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res  = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}`);
      const data = await res.json();
      setUserResults(data.users ?? []);
      setUserDropdownOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, type]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    if (type === 'direct' && !selectedUser) {
      setSendError('Please select a recipient.');
      return;
    }
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          targetUserId: type === 'direct' ? selectedUser?.id : undefined,
          targetRole:   type === 'role'   ? targetRole : type === 'mass' ? 'all' : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send');
      setSendSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setSelectedUser(null);
      setUserSearch('');
      setTargetRole('all');
      fetchSent();
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this notification? Recipients will no longer see it.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setSent(prev => prev.filter(n => n.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const typeLabel: Record<NotifType, string> = {
    direct: 'Direct Message',
    mass:   'All Members',
    role:   'By Role',
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: MAROON }} />
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Send messages to members individually or in bulk.</p>
      </div>

      {/* ── Compose ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Send size={18} style={{ color: MAROON }} />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Compose Notification</h2>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-5">

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Send To</label>
            <div className="flex flex-wrap gap-2">
              {(['mass', 'role', 'direct'] as NotifType[]).map(t => (
                <button key={t} type="button" onClick={() => { setType(t); setSendSuccess(''); setSendError(''); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
                  style={type === t
                    ? { backgroundColor: MAROON, borderColor: MAROON, color: '#fff' }
                    : { backgroundColor: 'transparent', borderColor: '#d1d5db', color: '#374151' }}>
                  {t === 'mass'   && <Users size={14} />}
                  {t === 'role'   && <Shield size={14} />}
                  {t === 'direct' && <User size={14} />}
                  {typeLabel[t]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {type === 'mass'   && 'This notification will be sent to all active members.'}
              {type === 'role'   && 'Send to all members with a specific role.'}
              {type === 'direct' && 'Send a private message to one specific member.'}
            </p>
          </div>

          {/* Role picker */}
          {type === 'role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': MAROON } as React.CSSProperties}>
                <option value="all">All roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* User picker */}
          {type === 'direct' && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient</label>
              {selectedUser ? (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 max-w-sm">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': MAROON } as React.CSSProperties} />
                  {userDropdownOpen && userResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                      {userResults.map(u => (
                        <button key={u.id} type="button"
                          onClick={() => { setSelectedUser(u); setTargetUserId(u.id); setUserSearch(''); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email} · {u.role}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              maxLength={120}
              placeholder="Notification title…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': MAROON } as React.CSSProperties} />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
              maxLength={2000}
              placeholder="Write your message…"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': MAROON } as React.CSSProperties} />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{message.length}/2000</p>
          </div>

          {sendSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle2 size={16} /> {sendSuccess}
            </div>
          )}
          {sendError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {sendError}
            </div>
          )}

          <button type="submit" disabled={sending || !title.trim() || !message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: MAROON }}>
            <Send size={15} />
            {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </form>
      </div>

      {/* ── Sent history ── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Bell size={18} style={{ color: MAROON }} />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Sent Notifications</h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{sent.length} total</span>
        </div>

        {sentLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: MAROON }} />
          </div>
        )}

        {!sentLoading && sent.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-10">No notifications sent yet.</p>
        )}

        {!sentLoading && sent.length > 0 && (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {sent.map(n => (
              <div key={n.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{n.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: '#f3eded', color: MAROON }}>
                        {n.type === 'direct' ? 'Direct' : n.type === 'mass' ? 'All Members' : `Role: ${n.target_role}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {n.sender_first} {n.sender_last} · {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {n.recipient_count} recipient{n.recipient_count !== 1 ? 's' : ''}
                      {n.recipient_count > 0 && ` · ${n.read_count} read (${Math.round((n.read_count / n.recipient_count) * 100)}%)`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      {expandedId === n.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandedId === n.id && (
                  <div className="mt-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {n.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
