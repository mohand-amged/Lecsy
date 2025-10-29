'use client';

import { NavBar } from '@/app/dashboard/components/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2, Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type NotificationItem = { id: string; title: string; body: string | null; read: boolean };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      setMarking(true);
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } finally {
      setMarking(false);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      setActingId(id);
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } finally {
      setActingId(null);
    }
  };

  const deleteOne = async (id: string) => {
    try {
      setActingId(id);
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 mt-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Bell className="h-8 w-8 mr-3" />
            Notifications
          </h1>
          {notifications.length > 0 && (
            <Button onClick={markAllRead} variant="outline" className="border-gray-700 text-white" disabled={marking}>
              {marking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCheck className="h-4 w-4 mr-2" />}
              Mark all as read
            </Button>
          )}
        </div>

        <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-700 bg-gray-900">
            <CardTitle className="text-white">Your notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-gray-800 rounded-full mb-4">
                  <Bell className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-gray-300 mb-2 font-semibold text-lg">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up ✨</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {notifications.map((n) => (
                  <li key={n.id} className={`p-4 ${n.read ? 'opacity-70' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{n.title}</p>
                        {n.body && <p className="text-gray-400 text-sm">{n.body}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <Button size="sm" variant="outline" className="border-gray-700 text-white" disabled={actingId === n.id} onClick={() => markOneRead(n.id)}>
                            {actingId === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Mark read</span>
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" disabled={actingId === n.id} onClick={() => deleteOne(n.id)}>
                          {actingId === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
