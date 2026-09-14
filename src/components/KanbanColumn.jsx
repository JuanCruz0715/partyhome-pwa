import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

const COLUMN_STYLES = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-200 text-blue-800',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-200 text-yellow-800',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-200 text-green-800',
  },
};

export default function KanbanColumn({ column, tasks, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const styles = COLUMN_STYLES[column.color];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 p-3 transition-colors min-h-[200px] ${
        styles.bg
      } ${styles.border} ${isOver ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
    >
      {/* Header de columna */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{column.emoji}</span>
          <h3 className={`text-sm font-bold ${styles.text}`}>
            {column.title}
          </h3>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tareas */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            {isOver ? 'Soltá acá' : 'Sin tareas'}
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}