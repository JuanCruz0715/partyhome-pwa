import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getEvents } from '../services/events';

export function useEvents(partyId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!partyId) return;
    const { data, error } = await getEvents(partyId);
    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  }, [partyId]);

  useEffect(() => {
    if (!partyId) return;

    loadEvents();

    const channel = supabase
      .channel(`events-${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          console.log('🔄 Cambio en eventos');
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, loadEvents]);

  return { events, loading, refresh: loadEvents };
}