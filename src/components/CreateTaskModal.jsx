import { useState, useEffect } from 'react';
import { X, ClipboardList, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createTask } from '../services/tasks';
import { getPartyMembers } from '../services/parties';
import toast from 'react-hot-toast';

export default function CreateTaskModal({ isOpen, onClose, onSuccess, partyId }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && partyId) {
      getPartyMembers(partyId).then(({ data }) => setMembers(data || []));
    }
  }, [isOpen, partyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Poné un título a la tarea');
      return;
    }

    setLoading(true);
    const { error } = await createTask({
      partyId,
      title: title.trim(),
      description: description.trim(),
      assignedTo: assignedTo || null,
      priority,
      dueDate: dueDate || null,
      userId: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al crear la tarea');
    } else {
      toast.success('¡Tarea creada!');
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDueDate('');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Nueva Tarea</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Título *</label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Lavar los platos"
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles extra..."
              className="input-field"
              rows={3}
            />
          </div>

          <div>
            <label className="label">Asignar a</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="input-field"
            >
              <option value="">Sin asignar</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {member.id === user.id ? '(Yo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    priority === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Fecha límite (opcional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

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
              {loading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}