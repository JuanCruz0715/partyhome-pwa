import { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { joinPartyByCode } from '../services/parties';
import toast from 'react-hot-toast';

export default function JoinPartyModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.trim().length !== 6) {
      toast.error('El código debe tener 6 caracteres');
      return;
    }

    setLoading(true);
    const { data, error } = await joinPartyByCode({
      code: code.trim(),
      userId: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al unirse');
    } else {
      toast.success(`¡Te uniste a "${data.party.name}"!`);
      setCode('');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Unirse a una Party</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Código de invitación</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="input-field pl-10 text-center text-2xl font-mono tracking-widest uppercase"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pedile el código a quien creó la party
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
            <p className="text-xs text-yellow-700">
              ⚠️ Una vez dentro, vas a poder ver tareas, gastos y más.
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
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Uniéndose...' : 'Unirse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}