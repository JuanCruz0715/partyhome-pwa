import { Calendar } from 'lucide-react';
import { useCalendarData } from '../hooks/useCalendarData';
import CalendarView from './CalendarView';

export default function CalendarList({ partyId }) {
  const { events, tasks, expenses, loading } = useCalendarData(partyId);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-primary-600" size={20} />
        <h2 className="text-xl font-bold text-gray-900">Calendario</h2>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Cargando calendario...
        </div>
      ) : (
        <CalendarView
          events={events}
          tasks={tasks}
          expenses={expenses}
        />
      )}
    </div>
  );
}