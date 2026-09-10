import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getTasks } from '../services/tasks';

export function useTasks(partyId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getTasks(partyId);
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    loadTasks();

    // 🔄 REALTIME: escuchar cambios en tasks
    const channel = supabase
      .channel(`tasks-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          console.log('🔄 Cambio en tareas:', payload);
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, loadTasks]);

  return { tasks, loading, refresh: loadTasks };
}