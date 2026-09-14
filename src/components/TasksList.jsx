import { useState } from 'react';
import { Plus, ClipboardList, LayoutList, Kanban } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { updateTaskStatus, deleteTask } from '../services/tasks';
import TaskCard from './TaskCard';
import KanbanBoard from './KanbanBoard';
import CreateTaskModal from './CreateTaskModal';
import toast from 'react-hot-toast';

export default function TasksList({ partyId }) {
  const { tasks, loading, refresh } = useTasks(partyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('kanban'); // 'list' o 'kanban'

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const { error } = await updateTaskStatus({ taskId: task.id, status: newStatus });
    if (error) toast.error('Error actualizando tarea');
    else toast.success(newStatus === 'completed' ? '¡Tarea completada!' : 'Tarea reactivada');
  };

  const handleDelete = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    const { error } = await deleteTask(taskId);
    if (error) toast.error('Error eliminando tarea');
    else toast.success('Tarea eliminada');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  // Si es Kanban, renderizar el tablero directamente
  if (view === 'kanban') {
    return (
      <div>
        {/* Toggle de vista */}
        <div className="flex justify-end mb-3">
          <ViewToggle view={view} setView={setView} />
        </div>
        <KanbanBoard partyId={partyId} />
      </div>
    );
  }

  // Vista lista (la tuya original)
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-primary-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">
            Tareas ({tasks.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} setView={setView} />
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'completed', label: 'Completadas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando tareas...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500 font-medium">
            {filter === 'all'
              ? 'No hay tareas todavía'
              : filter === 'pending'
              ? 'No hay tareas pendientes'
              : 'No hay tareas completadas'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Creá una nueva tarea para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
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

// Toggle de vista Lista/Kanban
function ViewToggle({ view, setView }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setView('list')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Vista lista"
      >
        <LayoutList size={14} />
        Lista
      </button>
      <button
        onClick={() => setView('kanban')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'kanban'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Vista kanban"
      >
        <Kanban size={14} />
        Kanban
      </button>
    </div>
  );
}