import { supabase } from '../lib/supabase';

// ============================================
// CREAR GASTO
// ============================================
export async function createExpense({
  partyId,
  title,
  description,
  amount,
  category,
  paidBy,
  splitType = 'equal',
  date,
  isShared = true,
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
        split_type: splitType,
        date: date || new Date().toISOString().split('T')[0],
        is_shared: isShared,
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

// ============================================
// OBTENER GASTOS DE UNA PARTY
// ============================================
export async function getExpenses(partyId) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        paid_by_profile:paid_by (id, name, email, avatar_url)
      `)
      .eq('party_id', partyId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return { data: null, error };
  }
}

// ============================================
// ACTUALIZAR GASTO
// ============================================
export async function updateExpense({ expenseId, updates }) {
  try {
    if (updates.amount) {
      updates.amount = parseFloat(updates.amount);
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    return { data: null, error };
  }
}

// ============================================
// ELIMINAR GASTO
// ============================================
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
// PAGOS ENTRE MIEMBROS
// ============================================

// Registrar un pago
export async function createPayment({
  partyId,
  fromUserId,
  toUserId,
  amount,
  note,
  date,
}) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        party_id: partyId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: parseFloat(amount),
        note: note || null,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando pago:', error);
    return { data: null, error };
  }
}

// Obtener pagos de una party
export async function getPayments(partyId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        from_profile:from_user_id (id, name, email, avatar_url),
        to_profile:to_user_id (id, name, email, avatar_url)
      `)
      .eq('party_id', partyId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return { data: null, error };
  }
}

// Eliminar un pago
export async function deletePayment(paymentId) {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando pago:', error);
    return { error };
  }
}

// ============================================
// CALCULAR BALANCE (CON PAGOS)
// ============================================
export function calculateBalance(expenses, members, payments = []) {
  if (!expenses || !members || members.length === 0) {
    return {
      totalExpenses: 0,
      totalShared: 0,
      totalFixed: 0,
      perPerson: 0,
      balances: [],
      totalMembers: 0,
    };
  }

  // Separar gastos compartidos de fijos
  const sharedExpenses = expenses.filter((exp) => exp.is_shared !== false);
  const fixedExpenses = expenses.filter((exp) => exp.is_shared === false);

  // Total gastado
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  const totalShared = sharedExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  const totalFixed = fixedExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  const perPerson = totalShared / members.length;

  // Cuánto pagó cada uno en gastos compartidos
  const paidByEach = {};
  members.forEach((m) => {
    paidByEach[m.id] = 0;
  });

  sharedExpenses.forEach((exp) => {
    if (paidByEach[exp.paid_by] !== undefined) {
      paidByEach[exp.paid_by] += parseFloat(exp.amount);
    }
  });

  // Cuánto pagó cada uno en gastos fijos
  const fixedByEach = {};
  members.forEach((m) => {
    fixedByEach[m.id] = 0;
  });

  fixedExpenses.forEach((exp) => {
    if (fixedByEach[exp.paid_by] !== undefined) {
      fixedByEach[exp.paid_by] += parseFloat(exp.amount);
    }
  });

  // Procesar pagos: restan deuda
  const paidOut = {};
  const received = {};
  members.forEach((m) => {
    paidOut[m.id] = 0;
    received[m.id] = 0;
  });

  payments.forEach((payment) => {
    if (paidOut[payment.from_user_id] !== undefined) {
      paidOut[payment.from_user_id] += parseFloat(payment.amount);
    }
    if (received[payment.to_user_id] !== undefined) {
      received[payment.to_user_id] += parseFloat(payment.amount);
    }
  });

  // Calcular balance final
  const balances = members.map((member) => {
    const paid = paidByEach[member.id] || 0;
    const owed = perPerson;
    const paidToOthers = paidOut[member.id] || 0;
    const receivedFromOthers = received[member.id] || 0;

    const balance = paid - owed + receivedFromOthers - paidToOthers;

    return {
      user_id: member.id,
      name: member.name,
      email: member.email,
      paid: paid,
      owed: owed,
      balance: balance,
      fixedPaid: fixedByEach[member.id] || 0,
      paidToOthers,
      receivedFromOthers,
    };
  });

  return {
    totalExpenses,
    totalShared,
    totalFixed,
    perPerson,
    balances,
    totalMembers: members.length,
  };
}