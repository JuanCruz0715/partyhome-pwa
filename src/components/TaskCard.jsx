import { Check, Clock, User, Trash2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const STATUS_STYLES = {
  pending: 'border-gray-200 bg-white',
  in_progress: 'border-blue-200 bg-blue-50',
  completed: 'border-green-200 bg-green-50 opacity-60',
};

export default function TaskCard({ task, onToggleComplete, onDelete }) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isCompleted;

  return (
    <div className={`card border-2 transition-all ${STATUS_STYLES[task.status]}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            isCompleted
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {isCompleted && <Check size={14} className="text-white" />}
        </button>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}

          {/* Meta información */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Prioridad */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>

            {/* Asignado */}
            {task.assigned_profile ? (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User size={12} />
                <span>{task.assigned_profile.name}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Sin asignar</span>
            )}

            {/* Fecha */}
            {task.due_date && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                <Clock size={12} />
                <span>
                  {isOverdue ? 'Venció ' : ''}
                  {format(new Date(task.due_date), "d 'de' MMM", { locale: es })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}