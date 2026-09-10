import { supabase } from '../lib/supabase';

// ============================================
// CREAR EVENTO
// ============================================
export async function createEvent({
  partyId,
  title,
  description,
  date,
  type,
  userId,
}) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        party_id: partyId,
        title,
        description: description || null,
        date,
        type: type || 'event',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando evento:', error);
    return { data: null, error };
  }
}

// ============================================
// OBTENER EVENTOS DE UNA PARTY
// ============================================
export async function getEvents(partyId) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        created_profile:created_by (id, name, email)
      `)
      .eq('party_id', partyId)
      .order('date', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return { data: null, error };
  }
}

// ============================================
// ELIMINAR EVENTO
// ============================================
export async function deleteEvent(eventId) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando evento:', error);
    return { error };
  }
}