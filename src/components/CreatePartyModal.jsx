import { useState } from 'react';
import { X, Home, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createParty } from '../services/parties';
import toast from 'react-hot-toast';

export default function CreatePartyModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Poné un nombre a la party');
      return;
    }

    setLoading(true);
    const { data, error } = await createParty({
      name: name.trim(),
      address: address.trim(),
      userId: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al crear la party');
    } else {
      toast.success(`¡Party "${data.name}" creada!`);
      setName('');
      setAddress('');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Crear nueva Party</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nombre de la party *</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Depto Palermo, Casa Rodriguez..."
                className="input-field pl-10"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label">Dirección (opcional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Santa Fe 1234"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 Se generará un <strong>código único</strong> para invitar a tus compañeros.
            </p>
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
              {loading ? 'Creando...' : 'Crear Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}