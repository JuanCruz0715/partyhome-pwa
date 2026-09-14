import { useEffect, useState, useCallback } from 'react';
import { getTasks } from '../services/tasks';
import { useRealtimeChannel } from './useRealtimeChannel';

export function useTasks(partyId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getTasks(partyId);
    if (!error && data) setTasks(data);
    setLoading(false);
  }, [partyId]);

  // 🔥 Carga inicial (evita warning de setState síncrono)
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (!partyId) return;
      const { data, error } = await getTasks(partyId);
      if (!isCancelled && !error && data) {
        setTasks(data);
      }
      if (!isCancelled) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [partyId]);

  // 🔄 Realtime
  useRealtimeChannel({
    table: 'tasks',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadTasks(),
    enabled: !!partyId,
  });

  return { tasks, loading, refresh: loadTasks };
}