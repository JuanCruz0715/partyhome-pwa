import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getPayments } from '../services/expenses';

export function usePayments(partyId) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getPayments(partyId);
    if (!error && data) {
      setPayments(data);
    }
    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    loadPayments();

    const channel = supabase
      .channel(`payments-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, loadPayments]);

  return { payments, loading, refresh: loadPayments };
}