import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useCalendarData(partyId) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!partyId) return;

    try {
      // Cargar eventos
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('party_id', partyId)
        .order('date', { ascending: true });

      // Cargar tareas con due_date
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:assigned_to (id, name)
        `)
        .eq('party_id', partyId)
        .not('due_date', 'is', null);

      // Cargar gastos
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('party_id', partyId);

      setEvents(eventsData || []);
      setTasks(tasksData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error cargando datos del calendario:', error);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    loadData();

    // Realtime: escuchar cambios en events, tasks, expenses
    const channel = supabase
      .channel(`calendar-${partyId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events', filter: `party_id=eq.${partyId}` },
        () => loadData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `party_id=eq.${partyId}` },
        () => loadData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses', filter: `party_id=eq.${partyId}` },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, loadData]);

  return { events, tasks, expenses, loading, refresh: loadData };
}