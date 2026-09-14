import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createExpense } from '../services/expenses';
import { getPartyMembers } from '../services/parties';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import toast from 'react-hot-toast';

export default function CreateExpenseModal({ isOpen, onClose, onSuccess, partyId }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('supermarket');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('expense'); // expense, fixed, income
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && partyId) {
      getPartyMembers(partyId).then(({ data }) => {
        setMembers(data || []);
        if (user?.id) setPaidBy(user.id);
      });
    }
  }, [isOpen, partyId, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Poné un título');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Ingresá un monto válido');
      return;
    }

    if (!paidBy) {
      toast.error('Seleccioná quién pagó/recibió');
      return;
    }

    setLoading(true);
    const { error } = await createExpense({
      partyId,
      title: title.trim(),
      description: description.trim(),
      amount,
      category,
      paidBy,
      date,
      isIncome: type === 'income',
      isFixed: type === 'fixed',
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al guardar');
    } else {
      toast.success('¡Registrado!');
      setTitle('');
      setDescription('');
      setAmount('');
      setCategory('supermarket');
      setPaidBy(user.id);
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Nuevo registro</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo: Gasto / Fijo / Ingreso */}
          <div>
            <label className="label">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`p-2 rounded-lg text-center transition-all border-2 ${
                  type === 'expense'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl">💸</div>
                <div className="text-xs font-medium mt-1">Gasto</div>
              </button>
              <button
                type="button"
                onClick={() => setType('fixed')}
                className={`p-2 rounded-lg text-center transition-all border-2 ${
                  type === 'fixed'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl">🔒</div>
                <div className="text-xs font-medium mt-1">Fijo</div>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`p-2 rounded-lg text-center transition-all border-2 ${
                  type === 'income'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl">💵</div>
                <div className="text-xs font-medium mt-1">Ingreso</div>
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'income' ? 'Ej: Sueldo' :
                type === 'fixed' ? 'Ej: Alquiler' :
                'Ej: Supermercado'
              }
              className="input-field"
              autoFocus
            />
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

          {/* Categoría */}
          <div>
            <label className="label">Categoría</label>
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    category === cat.id
                      ? 'bg-primary-100 ring-2 ring-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xl">{cat.emoji}</div>
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles..."
              className="input-field"
              rows={2}
            />
          </div>

          {/* Quién */}
          <div>
            <label className="label">
              {type === 'income' ? '¿Quién recibió? *' : '¿Quién pagó? *'}
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="input-field"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {member.id === user.id ? '(Yo)' : ''}
                </option>
              ))}
            </select>
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
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}