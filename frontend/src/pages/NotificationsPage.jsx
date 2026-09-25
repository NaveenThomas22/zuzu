import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import PixelCard from '../components/PixelCard';
import PixelLoader from '../components/PixelLoader';
import PixelError from '../components/PixelError';
import PixelButton from '../components/PixelButton';
import PageHeader from '../components/layout/PageHeader';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/api/notifications?page=${pageNum}&page_size=20`);
      setNotifications(prev => append ? [...prev, ...res.data] : res.data);
      setHasMore(res.data.length === 20);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(`/api/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-[family-name:var(--font-pixel)] pb-16">
      <PageHeader title="NOTIFICATIONS" showBack />
      
      <main className="p-4 flex-1 flex flex-col gap-4 max-w-lg mx-auto w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm text-ink">YOUR ALERTS</h2>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead} 
              className="text-mint text-[10px] hover:underline"
            >
              MARK ALL READ
            </button>
          )}
        </div>
        
        {loading && page === 1 ? (
          <PixelLoader />
        ) : error && page === 1 ? (
          <PixelError message={error} onRetry={() => fetchNotifications(1)} />
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-ink/50 text-xs border-[3px] border-dashed border-ink/30">
            No notifications found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-3 border-[3px] border-ink transition-colors flex gap-3 ${notif.is_read ? 'bg-cream opacity-70' : 'bg-yellow-pp'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-ink/60">{new Date(notif.created_at).toLocaleString('en-IN')}</p>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-pink-pp border border-ink rounded-full inline-block shrink-0"></span>
                    )}
                  </div>
                  <h3 className="text-sm text-ink truncate mb-1">{notif.title}</h3>
                  <p className="font-[family-name:var(--font-retro)] text-sm text-ink/80 break-words leading-tight">{notif.message}</p>
                </div>
                
                <div className="flex flex-col gap-2 justify-center shrink-0">
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="w-6 h-6 border-[2px] border-ink bg-mint text-ink text-[10px] flex items-center justify-center hover:bg-mint/80 active:translate-y-px"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="w-6 h-6 border-[2px] border-ink bg-pink-pp text-ink text-[10px] flex items-center justify-center hover:bg-pink-pp/80 active:translate-y-px"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button 
                onClick={loadMore}
                disabled={loading}
                className="w-full mt-2 p-3 bg-lavender border-[3px] border-ink text-[10px] active:translate-y-1 active:shadow-none shadow-[2px_2px_0_#1A1A1A] transition-all disabled:opacity-50"
              >
                {loading ? 'LOADING...' : 'LOAD MORE'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
