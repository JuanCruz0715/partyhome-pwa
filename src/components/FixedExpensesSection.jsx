import { useEffect, useState } from 'react';
import { Lock, Check, Plus, Trash2 } from 'lucide-react';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { useAuth } from '../contexts/AuthContext';
import { 
  markFixedAsPaid, 
  deleteFixedExpense,
  isFixedExpensePaid 
} from '../services/expenses';
import { getCategoryById, formatCurrency } from '../utils/categories';
import CreateFixedExpenseModal from './CreateFixedExpenseModal';
import toast from 'react-hot-toast';

export default function FixedExpensesSection({ partyId, year, month, onPaid }) {
  const { user } = useAuth();
  const { fixedExpenses, loading, refresh } = useFixedExpenses(partyId);
  const [paidStatus, setPaidStatus] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Verificar qué fijos ya fueron pagados este mes
  useEffect(() => {
    const checkPaid = async () => {
      const status = {};
      for (const fixed of fixedExpenses) {
        const { isPaid } = await isFixedExpensePaid(fixed.id, year, month);
        status[fixed.id] = isPaid;
      }
      setPaidStatus(status);
    };
    if (fixedExpenses.length > 0) checkPaid();
  }, [fixedExpenses, year, month]);

  const handleMarkPaid = async (fixed) => {
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const date = isCurrentMonth
      ? now.toISOString().split('T')[0]
      : `${year}-${String(month).padStart(2, '0')}-${String(fixed.day_of_month).padStart(2, '0')}`;

    const { error } = await markFixedAsPaid({
      fixedExpense: fixed,
      partyId,
      userId: user.id,
      date,
    });

    if (error) {
      toast.error('Error marcando como pagado');
    } else {
      toast.success(`"${fixed.title}" marcado como pagado`);
      setPaidStatus({ ...paidStatus, [fixed.id]: true });
      onPaid?.();
    }
  };

  const handleDelete = async (fixed) => {
    if (!confirm(`¿Eliminar "${fixed.title}"?`)) return;
    const { error } = await deleteFixedExpense(fixed.id);
    if (error) toast.error('Error eliminando');
    else {
      toast.success('Gasto fijo eliminado');
      refresh();
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400 text-sm">Cargando fijos...</div>;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="text-blue-600" size={18} />
          <h3 className="text-lg font-bold text-gray-900">
            Gastos fijos ({fixedExpenses.length})
          </h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          Nuevo fijo
        </button>
      </div>

      {fixedExpenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            No hay gastos fijos configurados
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Agregá alquiler, servicios, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {fixedExpenses.map((fixed) => {
            const category = getCategoryById(fixed.category);
            const isPaid = paidStatus[fixed.id];

            return (
              <div
                key={fixed.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isPaid
                    ? 'bg-green-50 border-green-100'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${category.color}`}>
                  {category.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${isPaid ? 'text-gray-500' : 'text-gray-900'}`}>
                      {fixed.title}
                    </p>
                    {isPaid && (
                      <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                        ✓ Pagado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Día {fixed.day_of_month} de cada mes
                  </p>
                </div>

                <div className="text-right flex-shrink-0 mr-2">
                  <p className={`font-bold ${isPaid ? 'text-gray-400' : 'text-gray-900'}`}>
                    {formatCurrency(fixed.amount)}
                  </p>
                </div>

                {!isPaid ? (
                  <button
                    onClick={() => handleMarkPaid(fixed)}
                    className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    title="Marcar como pagado"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(fixed)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CreateFixedExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refresh}
        partyId={partyId}
      />
    </div>
  );
}