import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para suscribirse a cambios de Realtime en una tabla de Supabase.
 * Maneja correctamente React 18+ StrictMode evitando conflictos de canales.
 */
export function useRealtimeChannel({ table, filter, callback, enabled = true }) {
  const callbackRef = useRef(callback);

  // Mantener callback actualizado sin re-suscribir
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !table) return;

    // Nombre único para evitar colisiones en StrictMode
    const channelName = `${table}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase.channel(channelName);

    // Configurar listener ANTES de subscribe
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
      },
      (payload) => {
        callbackRef.current?.(payload);
      }
    );

    // Suscribir
    channel.subscribe();

    // Cleanup: eliminar canal al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, enabled]);
}