import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getExpenses } from '../services/expenses';

export function useExpenses(partyId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getExpenses(partyId);
    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    loadExpenses();

    // 🔄 REALTIME: escuchar cambios en expenses
    const channel = supabase
      .channel(`expenses-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `party_id=eq.${partyId}`,
        },
        (payload) => {
          console.log('🔄 Cambio en gastos:', payload);
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, loadExpenses]);

  return { expenses, loading, refresh: loadExpenses };
}