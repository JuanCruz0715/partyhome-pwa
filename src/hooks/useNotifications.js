import { useEffect, useState, useCallback } from 'react';
import { 
  getNotifications, 
  getUnreadCount 
} from '../services/notifications';
import { useRealtimeChannel } from './useRealtimeChannel';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getNotifications(user.id);
    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (!user) return;
      const { data, error } = await getNotifications(user.id);
      if (!isCancelled && !error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
      if (!isCancelled) setLoading(false);
    };
    fetchData();
    return () => { isCancelled = true; };
  }, [user]);

  // 🔄 Realtime: escuchar nuevas notificaciones
  useRealtimeChannel({
    table: 'notifications',
    filter: `user_id=eq.${user?.id}`,
    callback: () => {
      loadNotifications();
    },
    enabled: !!user,
  });

  return {
    notifications,
    unreadCount,
    loading,
    refresh: loadNotifications,
    setUnreadCount,
    setNotifications,
  };
}