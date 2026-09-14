import { supabase } from '../lib/supabase';

// ============================================
// OBTENER NOTIFICACIONES
// ============================================
export async function getNotifications(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return { data: null, error };
  }
}

// ============================================
// CONTAR NO LEÍDAS
// ============================================
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error contando no leídas:', error);
    return { count: 0, error };
  }
}

// ============================================
// MARCAR COMO LEÍDA
// ============================================
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marcando como leída:', error);
    return { error };
  }
}

// ============================================
// MARCAR TODAS COMO LEÍDAS
// ============================================
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    return { error };
  }
}

// ============================================
// ELIMINAR NOTIFICACIÓN
// ============================================
export async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    return { error };
  }
}

// ============================================
// ELIMINAR TODAS
// ============================================
export async function deleteAllNotifications(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando todas:', error);
    return { error };
  }
}