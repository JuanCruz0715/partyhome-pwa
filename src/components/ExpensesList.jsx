import { useState, useMemo } from 'react';
import { Plus, DollarSign, Filter } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../contexts/AuthContext';
import { deleteExpense, calculateMonthlyBalance } from '../services/expenses';
import ExpenseCard from './ExpenseCard';
import CreateExpenseModal from './CreateExpenseModal';
import MonthSelector from './MonthSelector';
import MonthlySummary from './MonthlySummary';
import FixedExpensesSection from './FixedExpensesSection';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'all', label: 'Todos', emoji: '📋' },
  { id: 'expense', label: 'Gastos', emoji: '💸' },
  { id: 'income', label: 'Ingresos', emoji: '💵' },
];

export default function ExpensesList({ partyId }) {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tab, setTab] = useState('all');

  const { expenses, loading, refresh } = useExpenses(partyId, year, month);

  const balance = useMemo(() => calculateMonthlyBalance(expenses), [expenses]);

  const filteredExpenses = useMemo(() => {
    if (tab === 'expense') return expenses.filter((e) => e.is_income !== true);
    if (tab === 'income') return expenses.filter((e) => e.is_income === true);
    return expenses;
  }, [expenses, tab]);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    const { error } = await deleteExpense(id);
    if (error) toast.error('Error eliminando');
    else toast.success('Eliminado');
  };

  const handleMonthChange = (y, m) => {
    setYear(y);
    setMonth(m);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="text-primary-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">
            Gastos e Ingresos
          </h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Nuevo registro
        </button>
      </div>

      {/* Selector de mes */}
      <div className="mb-4">
        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
      </div>

      {/* Balance del mes */}
      <div className="mb-4">
        <MonthlySummary balance={balance} />
      </div>

      {/* Gastos fijos */}
      <div className="mb-4">
        <FixedExpensesSection
          partyId={partyId}
          year={year}
          month={month}
          onPaid={refresh}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-100 pb-2">
        {TABS.map((t) => {
          const count = t.id === 'all'
            ? expenses.length
            : expenses.filter((e) => 
                t.id === 'income' ? e.is_income === true : e.is_income !== true
              ).length;
          
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === t.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{t.emoji}</span>
              {t.label}
              <span className={`text-xs px-1.5 rounded-full ${
                tab === t.id ? 'bg-primary-200' : 'bg-gray-200'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">💰</div>
          <p className="text-gray-500 font-medium">
            {tab === 'income'
              ? 'No hay ingresos este mes'
              : tab === 'expense'
              ? 'No hay gastos este mes'
              : 'No hay registros este mes'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Agregá un movimiento para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
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
    </div>
  );
}