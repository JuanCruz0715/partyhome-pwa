import { supabase } from '../lib/supabase';

// ============================================
// CREAR TAREA
// ============================================
export async function createTask({ partyId, title, description, assignedTo, priority, dueDate, userId }) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        party_id: partyId,
        title,
        description: description || null,
        assigned_to: assignedTo || null,
        created_by: userId,
        priority: priority || 'medium',
        due_date: dueDate || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando tarea:', error);
    return { data: null, error };
  }
}

// ============================================
// OBTENER TAREAS DE UNA PARTY
// ============================================
export async function getTasks(partyId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_profile:assigned_to (id, name, email, avatar_url),
        created_profile:created_by (id, name, email, avatar_url)
      `)
      .eq('party_id', partyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    return { data: null, error };
  }
}

// ============================================
// ACTUALIZAR ESTADO DE TAREA
// ============================================
export async function updateTaskStatus({ taskId, status, userId }) {
  try {
    const updates = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return { data: null, error };
  }
}

// ============================================
// ASIGNAR TAREA A UN MIEMBRO
// ============================================
export async function assignTask({ taskId, assignedTo }) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ assigned_to: assignedTo })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error asignando tarea:', error);
    return { data: null, error };
  }
}

// ============================================
// ACTUALIZAR TAREA COMPLETA
// ============================================
export async function updateTask({ taskId, updates }) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    return { data: null, error };
  }
}

// ============================================
// ELIMINAR TAREA
// ============================================
export async function deleteTask(taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    return { error };
  }
}