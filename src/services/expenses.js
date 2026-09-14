import { supabase } from '../lib/supabase';

// ============================================
// GASTOS (del mes)
// ============================================

export async function createExpense({
  partyId,
  title,
  description,
  amount,
  category,
  paidBy,
  date,
  isIncome = false,
  isFixed = false,
}) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        party_id: partyId,
        title,
        description: description || null,
        amount: parseFloat(amount),
        category,
        paid_by: paidBy,
        date: date || new Date().toISOString().split('T')[0],
        is_income: isIncome,
        is_fixed: isFixed,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando gasto:', error);
    return { data: null, error };
  }
}

export async function getExpensesByMonth(partyId, year, month) {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_profile:paid_by (id, name, email, avatar_url)
      `)
      .eq('party_id', partyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return { data: null, error };
  }
}

export async function deleteExpense(expenseId) {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    return { error };
  }
}

// ============================================
// GASTOS FIJOS (configuración recurrente)
// ============================================

export async function createFixedExpense({
  partyId,
  title,
  amount,
  category,
  dayOfMonth,
  isIncome = false,
  userId,
}) {
  try {
    const { data, error } = await supabase
      .from('fixed_expenses_config')
      .insert({
        party_id: partyId,
        title,
        amount: parseFloat(amount),
        category,
        day_of_month: parseInt(dayOfMonth),
        is_income: isIncome,
        created_by: userId,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando gasto fijo:', error);
    return { data: null, error };
  }
}

export async function getFixedExpenses(partyId) {
  try {
    const { data, error } = await supabase
      .from('fixed_expenses_config')
      .select('*')
      .eq('party_id', partyId)
      .eq('active', true)
      .order('day_of_month', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo gastos fijos:', error);
    return { data: null, error };
  }
}

export async function deleteFixedExpense(id) {
  try {
    const { error } = await supabase
      .from('fixed_expenses_config')
      .update({ active: false })
      .eq('id', id);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando gasto fijo:', error);
    return { error };
  }
}

export async function isFixedExpensePaid(fixedId, year, month) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id')
      .eq('fixed_config_id', fixedId)
      .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
      .lte('date', new Date(year, month, 0).toISOString().split('T')[0]);

    if (error) throw error;
    return { isPaid: (data?.length || 0) > 0, error: null };
  } catch (error) {
    console.error('Error verificando pago:', error);
    return { isPaid: false, error };
  }
}

export async function markFixedAsPaid({
  fixedExpense,
  partyId,
  userId,
  date,
}) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        party_id: partyId,
        title: fixedExpense.title,
        amount: parseFloat(fixedExpense.amount),
        category: fixedExpense.category,
        paid_by: userId,
        date: date || new Date().toISOString().split('T')[0],
        is_income: fixedExpense.is_income || false,
        is_fixed: true,
        fixed_config_id: fixedExpense.id,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marcando como pagado:', error);
    return { data: null, error };
  }
}

// ============================================
// CÁLCULOS MENSUALES
// ============================================

export function calculateMonthlyBalance(expenses) {
  const totalIncome = expenses
    .filter((e) => e.is_income === true)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalExpenses = expenses
    .filter((e) => e.is_income !== true)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}