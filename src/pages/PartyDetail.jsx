import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Home, Copy, Check, Palette } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getPartyMembers } from '../services/parties';
import { useAuth } from '../contexts/AuthContext';
import { getBackgroundStyle } from '../utils/backgrounds';
import Header from '../components/Header';
import Loading from '../components/Loading';
import TasksList from '../components/TasksList';
import ExpensesList from '../components/ExpensesList';
import EventsList from '../components/EventsList';
import CalendarList from '../components/CalendarList';
import BackgroundPickerModal from '../components/BackgroundPickerModal';
import toast from 'react-hot-toast';

export default function PartyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [party, setParty] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Cargar party
  const loadParty = async () => {
    const { data: partyData, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', id)
      .single();

    if (partyError) {
      toast.error('Party no encontrada');
      navigate('/dashboard');
      return;
    }

    setParty(partyData);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadParty();
      const { data: membersData } = await getPartyMembers(id);
      setMembers(membersData || []);
      setLoading(false);
    };

    init();

    // 🔄 Realtime: miembros + cambios en party
    const channel = supabase
      .channel(`party-${id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_members',
          filter: `party_id=eq.${id}`,
        },
        () => {
          getPartyMembers(id).then(({ data }) => setMembers(data || []));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'parties',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setParty(payload.new);
          toast.success('🎨 La party fue actualizada', { duration: 2000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loading />;
  if (!party) return null;

  const isOwner = party.owner_id === user?.id;
  const hasBackground = party.background_type && party.background_type !== 'solid';

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle(party)}>
      {/* 🔥 Overlay difuminado para legibilidad */}
      {hasBackground && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm pointer-events-none" />
      )}

      <div className="relative z-10">
        <Header />

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            Volver al dashboard
          </button>

          {/* Header de la party */}
          <div className="card">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl sm:text-3xl shadow-sm flex-shrink-0">
                🏠
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {party.name}
                </h1>
                {party.address && (
                  <p className="text-gray-500 flex items-center gap-1 mt-1 text-xs sm:text-sm">
                    <Home size={14} />
                    <span className="truncate">{party.address}</span>
                  </p>
                )}
              </div>

              {/* 🎨 Botón de fondo (solo owner) */}
              {isOwner && (
                <button
                  onClick={() => setShowBackgroundPicker(true)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                  title="Cambiar fondo de la party"
                >
                  <Palette size={16} />
                  <span className="hidden sm:inline">Fondo</span>
                </button>
              )}
            </div>

            {/* Código de invitación */}
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Código de invitación</p>
              <button
                onClick={copyCode}
                className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors w-full sm:w-auto"
              >
                <code className="text-xl sm:text-2xl font-mono tracking-widest text-primary-600 font-bold">
                  {party.code}
                </code>
                {copied ? (
                  <Check size={20} className="text-green-600" />
                ) : (
                  <Copy size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Calendario */}
          <CalendarList partyId={id} />

          {/* Tareas */}
          <TasksList partyId={id} />

          {/* Gastos */}
          <ExpensesList partyId={id} />

          {/* Eventos */}
          <EventsList partyId={id} />

          {/* Miembros */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-primary-600" size={20} />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Miembros ({members.length})
              </h2>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.member_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 flex-shrink-0">
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                  {member.role === 'owner' && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      👑 Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de fondos */}
      <BackgroundPickerModal
        isOpen={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        party={party}
        onSuccess={loadParty}
      />
    </div>
  );
}