import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../services/events';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { id: 'event', label: 'Evento', emoji: '🎉' },
  { id: 'reminder', label: 'Recordatorio', emoji: '🔔' },
  { id: 'meeting', label: 'Reunión', emoji: '👥' },
  { id: 'payment', label: 'Pago', emoji: '💰' },
];

export default function CreateEventModal({ isOpen, onClose, onSuccess, partyId }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('event');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Poné un título al evento');
      return;
    }

    if (!date) {
      toast.error('Seleccioná una fecha');
      return;
    }

    setLoading(true);
    const { error } = await createEvent({
      partyId,
      title: title.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      type,
      userId: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al crear el evento');
    } else {
      toast.success('¡Evento creado!');
      setTitle('');
      setDescription('');
      setDate('');
      setType('event');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Nuevo Evento</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="label">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    type === t.id
                      ? 'bg-primary-100 ring-2 ring-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xl">{t.emoji}</div>
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión mensual"
              className="input-field"
              autoFocus
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del evento..."
              className="input-field"
              rows={2}
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="label">Fecha y hora *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}