import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { updateTaskStatus, deleteTask } from '../services/tasks';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import toast from 'react-hot-toast';

export default function TasksList({ partyId }) {
  const { tasks, loading, refresh } = useTasks(partyId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
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

      {/* Lista de tareas */}
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