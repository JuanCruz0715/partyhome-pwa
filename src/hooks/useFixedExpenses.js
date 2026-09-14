import { useEffect, useState, useCallback } from 'react';
import { getFixedExpenses } from '../services/expenses';
import { useRealtimeChannel } from './useRealtimeChannel';

export function useFixedExpenses(partyId) {
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFixedExpenses = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getFixedExpenses(partyId);
    if (!error && data) setFixedExpenses(data);
    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      if (!partyId) return;
      const { data, error } = await getFixedExpenses(partyId);
      if (!isCancelled && !error && data) setFixedExpenses(data);
      if (!isCancelled) setLoading(false);
    };
    fetchData();
    return () => { isCancelled = true; };
  }, [partyId]);

  useRealtimeChannel({
    table: 'fixed_expenses_config',
    filter: `party_id=eq.${partyId}`,
    callback: () => loadFixedExpenses(),
    enabled: !!partyId,
  });

  return { fixedExpenses, loading, refresh: loadFixedExpenses };
}