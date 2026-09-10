import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPayment } from '../services/expenses';
import { getPartyMembers } from '../services/parties';
import { formatCurrency } from '../utils/categories';
import toast from 'react-hot-toast';

export default function CreatePaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  partyId,
  preselectedFrom = null,
  preselectedTo = null,
  preselectedAmount = null,
}) {
  const { user } = useAuth();
  const [fromUserId, setFromUserId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && partyId) {
      getPartyMembers(partyId).then(({ data }) => {
        setMembers(data || []);
        
        // Valores pre-seleccionados
        if (preselectedFrom) setFromUserId(preselectedFrom);
        else if (user?.id) setFromUserId(user.id);
        
        if (preselectedTo) setToUserId(preselectedTo);
        if (preselectedAmount) setAmount(preselectedAmount.toString());
      });
    }
  }, [isOpen, partyId, user, preselectedFrom, preselectedTo, preselectedAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fromUserId || !toUserId) {
      toast.error('Seleccioná quién paga y a quién');
      return;
    }

    if (fromUserId === toUserId) {
      toast.error('No podés pagarte a vos mismo');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresá un monto válido');
      return;
    }

    setLoading(true);
    const { error } = await createPayment({
      partyId,
      fromUserId,
      toUserId,
      amount,
      note: note.trim() || null,
      date,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al registrar el pago');
    } else {
      toast.success('¡Pago registrado!');
      onSuccess?.();
      onClose();
    }
  };

  const fromMember = members.find((m) => m.id === fromUserId);
  const toMember = members.find((m) => m.id === toUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Registrar Pago</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 Registrá cuando alguien le paga a otro para saldar una deuda.
              El balance se actualizará automáticamente.
            </p>
          </div>

          {/* Vista previa */}
          {fromMember && toMember && (
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                  {fromMember.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{fromMember.name}</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                  {toMember.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{toMember.name}</span>
              </div>
            </div>
          )}

          {/* De quién */}
          <div>
            <label className="label">¿Quién paga? *</label>
            <select
              value={fromUserId}
              onChange={(e) => setFromUserId(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {member.id === user.id ? '(Yo)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* A quién */}
          <div>
            <label className="label">¿A quién le paga? *</label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar...</option>
              {members
                .filter((m) => m.id !== fromUserId)
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.id === user.id ? '(Yo)' : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="label">Monto *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="input-field pl-10 text-lg font-bold"
              />
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="label">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Saldo pendiente"
              className="input-field"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="label">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
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
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}