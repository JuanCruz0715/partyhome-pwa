import { supabase } from '../lib/supabase';
import { generatePartyCode } from '../utils/partyCode';

// ============================================
// CREAR PARTY
// ============================================
export async function createParty({ name, address, userId }) {
  try {
    // Generar código único
    let code;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generatePartyCode();
      const { data } = await supabase
        .from('parties')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (!data) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      throw new Error('No se pudo generar un código único');
    }

    console.log('🔍 Llamando a create_party_with_owner...');
    console.log('  - name:', name);
    console.log('  - address:', address);
    console.log('  - code:', code);

    // 🔥 USAR LA FUNCIÓN RPC (bypassa RLS de forma segura)
    const { data: party, error } = await supabase
      .rpc('create_party_with_owner', {
        party_name: name,
        party_address: address || null,
        party_code: code,
      });

    if (error) {
      console.error('🔍 Error en RPC:', error);
      throw error;
    }

    console.log('✅ Party creada:', party);
    return { data: party, error: null };
  } catch (error) {
    console.error('Error creando party:', error);
    return { data: null, error };
  }
}

// ============================================
// OBTENER MIS PARTIES
// ============================================
export async function getMyParties(userId) {
  try {
    const { data, error } = await supabase
      .from('party_members')
      .select(`
        role,
        joined_at,
        parties:party_id (
          id,
          name,
          code,
          address,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Transformar datos
    const parties = data.map((item) => ({
      ...item.parties,
      role: item.role,
      joined_at: item.joined_at,
    }));

    return { data: parties, error: null };
  } catch (error) {
    console.error('Error obteniendo parties:', error);
    return { data: null, error };
  }
}

// ============================================
// UNIRSE A PARTY CON CÓDIGO
// ============================================
export async function joinPartyByCode({ code, userId }) {
  try {
    console.log('🔍 Llamando a join_party_by_code...');
    console.log('  - code:', code);

    const { data: party, error } = await supabase
      .rpc('join_party_by_code', {
        party_code: code.toUpperCase(),
      });

    if (error) {
      console.error('🔍 Error en RPC:', error);
      throw error;
    }

    console.log('✅ Party unida:', party);
    return { data: { party }, error: null };
  } catch (error) {
    console.error('Error uniéndose a party:', error);
    return { data: null, error };
  }
}

// ============================================
// OBTENER MIEMBROS DE UNA PARTY
// ============================================
export async function getPartyMembers(partyId) {
  try {
    const { data, error } = await supabase
      .from('party_members')
      .select(`
        id,
        role,
        joined_at,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('party_id', partyId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const members = data.map((item) => ({
      ...item.profiles,
      role: item.role,
      joined_at: item.joined_at,
      member_id: item.id,
    }));

    return { data: members, error: null };
  } catch (error) {
    console.error('Error obteniendo miembros:', error);
    return { data: null, error };
  }
}

// ============================================
// SALIR DE UNA PARTY
// ============================================
export async function leaveParty({ partyId, userId }) {
  try {
    const { error } = await supabase
      .from('party_members')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error saliendo de party:', error);
    return { error };
  }
}

// ============================================
// OBTENER UNA PARTY POR ID
// ============================================
export async function getPartyById(partyId) {
  try {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo party:', error);
    return { data: null, error };
  }
}