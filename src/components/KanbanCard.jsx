import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { User, Clock, Trash2, GripVertical } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export default function KanbanCard({ task, isDragging, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging: dragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const isCompleted = task.status === 'completed';
  const isOverdue =
    task.due_date && isPast(new Date(task.due_date)) && !isCompleted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-3 transition-all ${
        dragging || isDragging
          ? 'opacity-50 shadow-lg ring-2 ring-primary-400'
          : 'hover:shadow-md cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Handle de drag */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-start gap-2"
      >
        <GripVertical
          size={14}
          className="text-gray-300 mt-0.5 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-medium ${
              isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                PRIORITY_COLORS[task.priority]
              }`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>

            {task.assigned_profile && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User size={10} />
                <span className="truncate max-w-[80px]">
                  {task.assigned_profile.name}
                </span>
              </div>
            )}

            {task.due_date && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
                }`}
              >
                <Clock size={10} />
                <span>
                  {format(new Date(task.due_date), "d MMM", { locale: es })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón eliminar (fuera del drag handle) */}
      {onDelete && !isDragging && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          style={{ position: 'absolute' }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}