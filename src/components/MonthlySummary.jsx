import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/categories';

export default function MonthlySummary({ balance }) {
  const { totalIncome, totalExpenses, balance: netBalance } = balance;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Ingresos */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-600 mb-1">
          <TrendingUp size={16} />
          <span className="text-xs font-medium">Ingresos</span>
        </div>
        <p className="text-2xl font-bold text-green-700">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      {/* Gastos */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-600 mb-1">
          <TrendingDown size={16} />
          <span className="text-xs font-medium">Gastos</span>
        </div>
        <p className="text-2xl font-bold text-red-700">
          {formatCurrency(totalExpenses)}
        </p>
      </div>

      {/* Balance */}
      <div className={`rounded-xl p-4 border ${
        netBalance >= 0
          ? 'bg-primary-50 border-primary-100'
          : 'bg-orange-50 border-orange-100'
      }`}>
        <div className={`flex items-center gap-2 mb-1 ${
          netBalance >= 0 ? 'text-primary-600' : 'text-orange-600'
        }`}>
          <DollarSign size={16} />
          <span className="text-xs font-medium">Balance del mes</span>
        </div>
        <p className={`text-2xl font-bold ${
          netBalance >= 0 ? 'text-primary-700' : 'text-orange-700'
        }`}>
          {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
        </p>
      </div>
    </div>
  );
}