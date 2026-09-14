import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeChannel } from './useRealtimeChannel';

export function useCalendarData(partyId) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!partyId) return;
    try {
      const [eventsRes, tasksRes, expensesRes, fixedRes] = await Promise.all([
        supabase.from('events').select('*').eq('party_id', partyId),
        supabase
          .from('tasks')
          .select('*, assigned_profile:assigned_to (id, name)')
          .eq('party_id', partyId)
          .not('due_date', 'is', null),
        supabase.from('expenses').select('*').eq('party_id', partyId),
        supabase
          .from('fixed_expenses_config')
          .select('*')
          .eq('party_id', partyId)
          .eq('active', true),
      ]);
      setEvents(eventsRes.data || []);
      setTasks(tasksRes.data || []);
      setExpenses(expensesRes.data || []);
      setFixedExpenses(fixedRes.data || []);
    } catch (error) {
      console.error('Error cargando calendario:', error);
    } finally {
      setLoading(false);
    }
  }, [partyId]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (!partyId) return;
      try {
        const [eventsRes, tasksRes, expensesRes, fixedRes] = await Promise.all([
          supabase.from('events').select('*').eq('party_id', partyId),
          supabase
            .from('tasks')
            .select('*, assigned_profile:assigned_to (id, name)')
            .eq('party_id', partyId)
            .not('due_date', 'is', null),
          supabase.from('expenses').select('*').eq('party_id', partyId),
          supabase
            .from('fixed_expenses_config')
            .select('*')
            .eq('party_id', partyId)
            .eq('active', true),
        ]);
        if (!isCancelled) {
          setEvents(eventsRes.data || []);
          setTasks(tasksRes.data || []);
          setExpenses(expensesRes.data || []);
          setFixedExpenses(fixedRes.data || []);
        }
      } catch (error) {
        console.error('Error cargando calendario:', error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { isCancelled = true; };
  }, [partyId]);

  useRealtimeChannel({
    table: 'events',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadData(),
    enabled: !!partyId,
  });

  useRealtimeChannel({
    table: 'tasks',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadData(),
    enabled: !!partyId,
  });

  useRealtimeChannel({
    table: 'expenses',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadData(),
    enabled: !!partyId,
  });

  useRealtimeChannel({
    table: 'fixed_expenses_config',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadData(),
    enabled: !!partyId,
  });

  return { events, tasks, expenses, fixedExpenses, loading, refresh: loadData };
}