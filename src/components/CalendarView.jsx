import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarView({ events = [], tasks = [], expenses = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generar todos los días del mes + días de relleno
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Obtener "eventos" por día (eventos + tareas con fecha + gastos)
  const getDayData = (day) => {
    const eventsForDay = events.filter((e) => isSameDay(new Date(e.date), day));
    const tasksForDay = tasks.filter(
      (t) => t.due_date && isSameDay(new Date(t.due_date), day)
    );
    const expensesForDay = expenses.filter(
      (e) => e.date && isSameDay(new Date(e.date), day)
    );

    return {
      events: eventsForDay,
      tasks: tasksForDay,
      expenses: expensesForDay,
      total: eventsForDay.length + tasksForDay.length + expensesForDay.length,
    };
  };

  // Datos del día seleccionado
  const selectedDayData = getDayData(selectedDate);

  // Navegación
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const dayData = getDayData(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const hasData = dayData.total > 0;

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                relative transition-all text-sm
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
                ${!isSelected && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                ${isTodayDate && !isSelected ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              <span className={isTodayDate && !isSelected ? 'text-primary-600 font-bold' : ''}>
                {format(day, 'd')}
              </span>

              {/* Puntos indicadores */}
              {hasData && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayData.events.length > 0 && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
                  )}
                  {dayData.tasks.length > 0 && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                  )}
                  {dayData.expenses.length > 0 && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Eventos
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Tareas
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Gastos
        </div>
      </div>

      {/* Detalles del día seleccionado */}
      <DayDetails 
        date={selectedDate} 
        data={selectedDayData} 
      />
    </div>
  );
}

// ============================================
// SUBCOMPONENTE: Detalles del día
// ============================================
function DayDetails({ date, data }) {
  const hasItems = data.total > 0;

  return (
    <div className="pt-4 border-t border-gray-100">
      <h4 className="text-sm font-bold text-gray-900 mb-3 capitalize">
        {format(date, "EEEE d 'de' MMMM", { locale: es })}
      </h4>

      {!hasItems ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">No hay eventos este día</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Eventos */}
          {data.events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 p-2 rounded-lg bg-purple-50 border border-purple-100"
            >
              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-xs flex-shrink-0">
                🎉
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(event.date), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}

          {/* Tareas */}
          {data.tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                task.status === 'completed'
                  ? 'bg-gray-50 border-gray-100 opacity-60'
                  : 'bg-blue-50 border-blue-100'
              }`}
            >
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs flex-shrink-0">
                {task.status === 'completed' ? '✅' : '📝'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </p>
                <p className="text-xs text-gray-500">
                  {task.assigned_profile?.name || 'Sin asignar'}
                </p>
              </div>
            </div>
          ))}

          {/* Gastos */}
          {data.expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100"
            >
              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-xs flex-shrink-0">
                💰
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {expense.title}
                </p>
                <p className="text-xs text-gray-500">
                  ${expense.amount.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}