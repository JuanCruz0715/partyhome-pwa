import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getMyParties } from '../services/parties';
import { useAuth } from '../contexts/AuthContext';

export function useParties() {
  const { user } = useAuth();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadParties = useCallback(async () => {
    if (!user) return;
    const { data, error } = await getMyParties(user.id);
    if (!error && data) {
      setParties(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadParties();

    // 🔄 REALTIME: escuchar cambios en party_members
    const channel = supabase
      .channel('my-parties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_members',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Cambio en mis parties:', payload);
          loadParties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadParties]);

  return { parties, loading, refresh: loadParties };
}