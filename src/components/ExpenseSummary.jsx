import { TrendingUp, TrendingDown, DollarSign, Users, Lock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/categories';

export default function ExpenseSummary({ balance, onPayClick }) {
  if (!balance || balance.totalExpenses === 0) return null;

  const { totalExpenses, totalShared, totalFixed, perPerson, balances } = balance;

  return (
    <div className="space-y-4">
      {/* Resumen general */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-primary-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">Total gastado</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">Por persona</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">
            {formatCurrency(perPerson)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">solo compartidos</p>
        </div>
      </div>

      {/* Desglose */}
      {(totalShared > 0 || totalFixed > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <Users size={14} />
              <span className="text-xs font-medium">Compartidos</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(totalShared)}
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <Lock size={14} />
              <span className="text-xs font-medium">Fijos</span>
            </div>
            <p className="text-lg font-bold text-gray-700">
              {formatCurrency(totalFixed)}
            </p>
          </div>
        </div>
      )}

      {/* Balances individuales */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Balance por miembro
        </h3>
        <div className="space-y-2">
          {balances.map((b) => {
            const isPositive = b.balance > 0;
            const isZero = Math.abs(b.balance) < 0.01;

            return (
              <div
                key={b.user_id}
                className="py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                      {b.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-500">
                        Pagó {formatCurrency(b.paid)} de {formatCurrency(b.owed)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      {isZero ? (
                        <span className="text-xs text-gray-400 font-medium">Al día</span>
                      ) : (
                        <>
                          <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="text-sm font-bold">
                              {isPositive ? '+' : ''}{formatCurrency(b.balance)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {isPositive ? 'le deben' : 'debe'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {b.fixedPaid > 0 && (
                  <p className="text-xs text-gray-400 mt-1 ml-10">
                    🔒 Además pagó {formatCurrency(b.fixedPaid)} en gastos fijos
                  </p>
                )}

                {b.paidToOthers > 0 && (
                  <p className="text-xs text-green-600 mt-1 ml-10">
                    ✅ Ya pagó {formatCurrency(b.paidToOthers)} a otros
                  </p>
                )}
                {b.receivedFromOthers > 0 && (
                  <p className="text-xs text-blue-600 mt-1 ml-10">
                    📥 Recibió {formatCurrency(b.receivedFromOthers)} de otros
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}