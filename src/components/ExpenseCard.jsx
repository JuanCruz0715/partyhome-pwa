import { Trash2, Calendar, User, Lock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCategoryById, formatCurrency } from '../utils/categories';

export default function ExpenseCard({ expense, onDelete }) {
  const category = getCategoryById(expense.category);
  const isFixed = expense.is_shared === false;

  return (
    <div className={`card hover:shadow-md transition-shadow ${isFixed ? 'border-l-4 border-l-gray-400' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Categoría emoji */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${category.color}`}>
          {category.emoji}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-gray-900 truncate">
                  {expense.title}
                </h3>
                {isFixed && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    <Lock size={10} />
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

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User size={12} />
              <span>
                {isFixed ? 'Pagó ' : 'Pagó '}
                {expense.paid_by_profile?.name || 'Alguien'}
              </span>
            </div>
            {expense.date && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{format(new Date(expense.date), "d 'de' MMM", { locale: es })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <p className={`text-xl font-bold ${isFixed ? 'text-gray-600' : 'text-primary-600'}`}>
            {formatCurrency(expense.amount)}
          </p>
          {isFixed && (
            <p className="text-xs text-gray-400 mt-0.5">no se divide</p>
          )}
        </div>
      </div>
    </div>
  );
}