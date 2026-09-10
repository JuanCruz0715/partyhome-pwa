import { useState, useEffect, useMemo } from 'react';
import { Plus, DollarSign, HandCoins } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { usePayments } from '../hooks/usePayments';
import { deleteExpense, calculateBalance } from '../services/expenses';
import { getPartyMembers } from '../services/parties';
import ExpenseCard from './ExpenseCard';
import CreateExpenseModal from './CreateExpenseModal';
import CreatePaymentModal from './CreatePaymentModal';
import ExpenseSummary from './ExpenseSummary';
import toast from 'react-hot-toast';

export default function ExpensesList({ partyId }) {
  const { expenses, loading, refresh } = useExpenses(partyId);
  const { payments, refresh: refreshPayments } = usePayments(partyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (partyId) {
      getPartyMembers(partyId).then(({ data }) => setMembers(data || []));
    }
  }, [partyId]);

  const balance = useMemo(
    () => calculateBalance(expenses, members, payments),
    [expenses, members, payments]
  );

  const handleDelete = async (expenseId) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    const { error } = await deleteExpense(expenseId);
    if (error) toast.error('Error eliminando gasto');
    else toast.success('Gasto eliminado');
  };

  const handlePaymentSuccess = () => {
    refreshPayments();
    refresh();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="text-primary-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">
            Gastos ({expenses.length})
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Registrar pago entre miembros"
          >
            <HandCoins size={16} />
            Pagar
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Resumen / Balance */}
      {expenses.length > 0 && (
        <div className="mb-6">
          <ExpenseSummary balance={balance} />
        </div>
      )}

      {/* Lista de gastos */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando gastos...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">💰</div>
          <p className="text-gray-500 font-medium">No hay gastos todavía</p>
          <p className="text-sm text-gray-400 mt-1">
            Registrá el primer gasto del hogar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateExpenseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refresh}
        partyId={partyId}
      />

      <CreatePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        partyId={partyId}
      />
    </div>
  );
}