import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, TrendingUp, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useParties } from '../hooks/useParties';
import Header from '../components/Header';
import PartyCard from '../components/PartyCard';
import CreatePartyModal from '../components/CreatePartyModal';
import JoinPartyModal from '../components/JoinPartyModal';
import Loading from '../components/Loading';
import { formatCurrency } from '../utils/categories';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { profile } = useAuth();
  const { parties, loading, refresh } = useParties();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    upcomingEvents: 0,
    totalExpenses: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Cargar estadísticas globales
  useEffect(() => {
    if (parties.length === 0) return;

    const loadStats = async () => {
      const partyIds = parties.map((p) => p.id);

      // Tareas
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status')
        .in('party_id', partyIds);

      // Eventos próximos
      const now = new Date().toISOString();
      const { data: events } = await supabase
        .from('events')
        .select('*, parties:party_id (id, name)')
        .in('party_id', partyIds)
        .gte('date', now)
        .order('date', { ascending: true })
        .limit(5);

      // Gastos
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .in('party_id', partyIds);

      setStats({
        totalTasks: tasks?.length || 0,
        pendingTasks: tasks?.filter((t) => t.status !== 'completed').length || 0,
        upcomingEvents: events?.length || 0,
        totalExpenses:
          expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0,
      });

      setUpcomingEvents(events || []);
    };

    loadStats();
  }, [parties]);

  if (loading) return <Loading />;

  const firstName = profile?.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {parties.length === 0
              ? 'Empezá creando tu primera party'
              : `Tenés ${parties.length} ${parties.length === 1 ? 'party' : 'parties'} activas`}
          </p>
        </div>

        {/* Stats globales */}
        {parties.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Home size={20} />}
              label="Parties"
              value={parties.length}
              color="primary"
            />
            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Tareas pendientes"
              value={stats.pendingTasks}
              color="green"
            />
            <StatCard
              icon={<Calendar size={20} />}
              label="Próximos eventos"
              value={stats.upcomingEvents}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Gastos totales"
              value={formatCurrency(stats.totalExpenses)}
              color="orange"
              isMoney
            />
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="card card-hover flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Plus className="text-primary-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Crear Party</h3>
              <p className="text-sm text-gray-500">Empezá una nueva convivencia</p>
            </div>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="card card-hover flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Unirse a Party</h3>
              <p className="text-sm text-gray-500">Con un código de invitación</p>
            </div>
          </button>
        </div>

        {/* Próximos eventos */}
        {upcomingEvents.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-primary-600" size={20} />
                Próximos eventos
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/party/${event.parties.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.parties.name} • {format(new Date(event.date), "d 'de' MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Parties */}
        {parties.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Tus Parties</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No tenés Parties todavía
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Creá tu primera party para empezar a organizar tu convivencia, o unite a una existente con un código.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Crear Party
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Users size={18} />
                Unirse
              </button>
            </div>
          </div>
        )}
      </main>

      <CreatePartyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refresh}
      />
      <JoinPartyModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={refresh}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color, isMoney }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`font-bold text-gray-900 mt-0.5 ${isMoney ? 'text-lg' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
  );
}