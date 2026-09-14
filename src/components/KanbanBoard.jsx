import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { Plus, ClipboardList } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { updateTaskOrder, deleteTask } from '../services/tasks';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import CreateTaskModal from './CreateTaskModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'pending', title: 'Pendiente', emoji: '🔵', color: 'blue' },
  { id: 'in_progress', title: 'En Progreso', emoji: '🟡', color: 'yellow' },
  { id: 'completed', title: 'Completada', emoji: '🟢', color: 'green' },
];

export default function KanbanBoard({ partyId }) {
  const { tasks, loading, refresh } = useTasks(partyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [filterMember, setFilterMember] = useState('all');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // evita clicks accidentales
    })
  );

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    if (filterMember === 'all') return tasks;
    return tasks.filter((t) => t.assigned_to === filterMember);
  }, [tasks, filterMember]);

  // Agrupar por status
  const tasksByStatus = useMemo(() => {
    const grouped = { pending: [], in_progress: [], completed: [] };
    filteredTasks.forEach((task) => {
      const status = task.status || 'pending';
      if (grouped[status]) grouped[status].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  // Miembros únicos para filtro
  const members = useMemo(() => {
    const unique = {};
    tasks.forEach((t) => {
      if (t.assigned_profile) {
        unique[t.assigned_profile.id] = t.assigned_profile;
      }
    });
    return Object.values(unique);
  }, [tasks]);

  // Obtener status de una tarea por id
  const findTaskStatus = (taskId) => {
    for (const status of Object.keys(tasksByStatus)) {
      if (tasksByStatus[status].some((t) => t.id === taskId)) return status;
    }
    return null;
  };

  // Cuando empieza el drag
  const handleDragStart = (event) => {
    const taskId = event.active.id;
    const allTasks = Object.values(tasksByStatus).flat();
    setActiveTask(allTasks.find((t) => t.id === taskId) || null);
  };

  // Cuando termina el drag
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const sourceStatus = findTaskStatus(activeId);
    if (!sourceStatus) return;

    // Determinar status destino
    let destStatus;
    if (COLUMNS.some((c) => c.id === overId)) {
      // Soltó sobre una columna vacía
      destStatus = overId;
    } else {
      // Soltó sobre otra tarjeta
      destStatus = findTaskStatus(overId);
    }

    if (!destStatus) return;

    // Si es la misma columna, no hacer nada (por ahora sin reordenamiento interno)
    if (sourceStatus === destStatus) return;

    // Actualizar en Supabase
    const { error } = await updateTaskOrder({
      taskId: activeId,
      status: destStatus,
    });

    if (error) {
      toast.error('Error moviendo tarea');
    } else {
      const statusName = COLUMNS.find((c) => c.id === destStatus)?.title;
      toast.success(`Tarea movida a "${statusName}"`);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    const { error } = await deleteTask(taskId);
    if (error) toast.error('Error eliminando tarea');
    else toast.success('Tarea eliminada');
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-primary-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">
            Tareas ({tasks.length})
          </h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Nueva
        </button>
      </div>

      {/* Filtro por miembro */}
      {members.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterMember('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filterMember === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMember(m.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterMember === m.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Kanban */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByStatus[col.id] || []}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refresh}
        partyId={partyId}
      />
    </div>
  );
}