import { useState } from 'react';
import { X, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createFixedExpense } from '../services/expenses';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import toast from 'react-hot-toast';

export default function CreateFixedExpenseModal({ isOpen, onClose, onSuccess, partyId }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('services');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [isIncome, setIsIncome] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error('Completá título y monto');
      return;
    }

    const day = parseInt(dayOfMonth);
    if (day < 1 || day > 31) {
      toast.error('Día entre 1 y 31');
      return;
    }

    setLoading(true);
    const { error } = await createFixedExpense({
      partyId,
      title: title.trim(),
      amount,
      category,
      dayOfMonth: day,
      isIncome,
      userId: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Error al crear');
    } else {
      toast.success('Gasto fijo creado');
      setTitle('');
      setAmount('');
      setCategory('services');
      setDayOfMonth('1');
      setIsIncome(false);
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Gasto fijo mensual</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 Se va a repetir <strong>todos los meses</strong> en el día que elijas.
              Aparecerá en el calendario automáticamente.
            </p>
          </div>

          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Alquiler"
              className="input-field"
              autoFocus
            />
          </div>

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

          <div>
            <label className="label">Día del mes *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                min="1"
                max="31"
                className="input-field pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ej: 1 = todos los 1ros de mes
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isIncome}
              onChange={(e) => setIsIncome(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">
              Es un ingreso (en vez de gasto)
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear fijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}