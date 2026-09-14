import { useEffect, useState, useCallback } from 'react';
import { getExpensesByMonth } from '../services/expenses';
import { useRealtimeChannel } from './useRealtimeChannel';

export function useExpenses(partyId, year, month) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getExpensesByMonth(partyId, year, month);
    if (!error && data) setExpenses(data);
    setLoading(false);
  }, [partyId, year, month]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (!partyId) return;
      const { data, error } = await getExpensesByMonth(partyId, year, month);
      if (!isCancelled && !error && data) setExpenses(data);
      if (!isCancelled) setLoading(false);
    };
    fetchData();
    return () => { isCancelled = true; };
  }, [partyId, year, month]);

  useRealtimeChannel({
    table: 'expenses',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadExpenses(),
    enabled: !!partyId,
  });

  return { expenses, loading, refresh: loadExpenses };
}