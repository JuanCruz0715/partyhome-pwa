import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MonthSelector({ year, month, onChange }) {
  const handlePrevious = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const handleNext = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  const handleToday = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth() + 1);
  };

  const date = new Date(year, month - 1, 1);

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
      <button
        onClick={handlePrevious}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-primary-600" />
        <span className="font-semibold text-gray-900 capitalize">
          {format(date, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={handleToday}
          className="text-xs font-medium text-primary-600 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
        >
          Hoy
        </button>
      </div>

      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}