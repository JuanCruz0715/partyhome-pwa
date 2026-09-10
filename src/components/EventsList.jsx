import { useState } from 'react';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEvents } from '../hooks/useEvents';
import { deleteEvent } from '../services/events';
import CreateEventModal from './CreateEventModal';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  event: { emoji: '🎉', bg: 'bg-purple-100 text-purple-700', label: 'Evento' },
  reminder: { emoji: '🔔', bg: 'bg-yellow-100 text-yellow-700', label: 'Recordatorio' },
  meeting: { emoji: '👥', bg: 'bg-blue-100 text-blue-700', label: 'Reunión' },
  payment: { emoji: '💰', bg: 'bg-green-100 text-green-700', label: 'Pago' },
};

export default function EventsList({ partyId }) {
  const { events, loading, refresh } = useEvents(partyId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDelete = async (eventId) => {
    if (!confirm('¿Eliminar este evento?')) return;
    const { error } = await deleteEvent(eventId);
    if (error) toast.error('Error eliminando evento');
    else toast.success('Evento eliminado');
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => isAfter(new Date(e.date), now));
  const pastEvents = events.filter((e) => isBefore(new Date(e.date), now));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">
            Eventos ({events.length})
          </h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando eventos...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-gray-500 font-medium">No hay eventos todavía</p>
          <p className="text-sm text-gray-400 mt-1">
            Agendá el primer evento del hogar
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Próximos */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                📅 Próximos ({upcomingEvents.length})
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <EventItem key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Pasados */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">
                ⏰ Pasados ({pastEvents.length})
              </h3>
              <div className="space-y-2 opacity-70">
                {pastEvents.map((event) => (
                  <EventItem key={event.id} event={event} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refresh}
        partyId={partyId}
      />
    </div>
  );
}

function EventItem({ event, onDelete }) {
  const typeStyle = TYPE_STYLES[event.type] || TYPE_STYLES.event;
  const daysUntil = differenceInDays(new Date(event.date), new Date());
  const isSoon = daysUntil >= 0 && daysUntil <= 3;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
      isSoon ? 'border-primary-200 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${typeStyle.bg}`}>
        {typeStyle.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {format(new Date(event.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
            </p>
          </div>
          <button
            onClick={() => onDelete(event.id)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        )}

        {isSoon && daysUntil >= 0 && (
          <span className="inline-block text-xs font-medium text-primary-600 bg-white px-2 py-0.5 rounded-full mt-2">
            {daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
          </span>
        )}
      </div>
    </div>
  );
}