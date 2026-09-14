import { Trash2, Calendar, User, TrendingUp, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCategoryById, formatCurrency } from '../utils/categories';

export default function ExpenseCard({ expense, onDelete }) {
  const category = getCategoryById(expense.category);
  const isIncome = expense.is_income === true;
  const isFixed = expense.is_fixed === true;

  return (
    <div className={`card hover:shadow-md transition-shadow border-l-4 ${
      isIncome ? 'border-l-green-500' :
      isFixed ? 'border-l-blue-500' :
      'border-l-gray-300'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${category.color}`}>
          {isIncome ? '💵' : category.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-gray-900 truncate">
                  {expense.title}
                </h3>
                {isIncome && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Ingreso
                  </span>
                )}
                {isFixed && !isIncome && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    <Lock size={10} className="inline mr-1" />
                    Fijo
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${category.color} inline-block mt-1`}>
                {category.label}
              </span>
            </div>
            <button
              onClick={() => onDelete(expense.id)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {expense.description && (
            <p className="text-sm text-gray-500 mt-2">{expense.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            {expense.paid_by_profile && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>
                  {isIncome ? 'Recibió ' : 'Pagó '}
                  {expense.paid_by_profile.name}
                </span>
              </div>
            )}
            {expense.date && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{format(new Date(expense.date), "d 'de' MMM", { locale: es })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={`text-xl font-bold ${
            isIncome ? 'text-green-600' : 'text-gray-900'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}