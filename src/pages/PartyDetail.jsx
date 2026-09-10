import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Home, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getPartyMembers } from '../services/parties';
import Header from '../components/Header';
import Loading from '../components/Loading';
import TasksList from '../components/TasksList';
import toast from 'react-hot-toast';
import ExpensesList from '../components/ExpensesList';
import EventsList from '../components/EventsList';
import CalendarList from '../components/CalendarList';

export default function PartyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadParty = async () => {
      setLoading(true);

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

      const { data: membersData } = await getPartyMembers(id);
      setMembers(membersData || []);

      setLoading(false);
    };

    loadParty();

    const channel = supabase
      .channel(`party-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${id}` },
        () => {
          getPartyMembers(id).then(({ data }) => setMembers(data || []));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(party.code);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Loading />;
  if (!party) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al dashboard
        </button>

        {/* Header de la party */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl shadow-sm">
              🏠
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{party.name}</h1>
              {party.address && (
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <Home size={14} />
                  {party.address}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Código de invitación</p>
            <button
              onClick={copyCode}
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
            >
              <code className="text-2xl font-mono tracking-widest text-primary-600 font-bold">
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
            <h2 className="text-xl font-bold text-gray-900">
              Miembros ({members.length})
            </h2>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.member_id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                {member.role === 'owner' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                    👑 Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}