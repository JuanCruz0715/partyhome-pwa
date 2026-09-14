import { useNavigate } from 'react-router-dom';
import { 
  Check, CheckCheck, Trash2, 
  ClipboardList, DollarSign, Calendar, 
  Users, CheckCircle2, X 
} from 'lucide-react';
import { 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  deleteAllNotifications 
} from '../services/notifications';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  task_assigned: { icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
  task_completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  expense_added: { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
  expense_fixed: { icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  event_created: { icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-100' },
  member_joined: { icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
};

export default function NotificationsPanel({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, refresh } = useNotifications();

  const handleNotificationClick = async (notif) => {
    // Marcar como leída
    if (!notif.read) {
      await markAsRead(notif.id);
      refresh();
    }

    // Navegar al recurso
    const data = notif.data || {};
    if (data.party_id) {
      navigate(`/party/${data.party_id}`);
      onClose();
    }
  };

  const handleMarkAllRead = async () => {
    const { error } = await markAllAsRead(user.id);
    if (error) toast.error('Error marcando como leídas');
    else {
      toast.success('Todas marcadas como leídas');
      refresh();
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    const { error } = await deleteNotification(notifId);
    if (error) toast.error('Error eliminando');
    else refresh();
  };

  const handleDeleteAll = async () => {
    if (!confirm('¿Eliminar TODAS las notificaciones?')) return;
    const { error } = await deleteAllNotifications(user.id);
    if (error) toast.error('Error eliminando');
    else {
      toast.success('Todas eliminadas');
      refresh();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      {/* Acciones */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 text-xs">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck size={14} />
            Marcar todas leídas
          </button>
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600"
          >
            <Trash2 size={14} />
            Borrar todas
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-sm font-medium text-gray-600">
              No tenés notificaciones
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Acá vas a ver las novedades de tus parties
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => {
              const typeConfig = TYPE_ICONS[notif.type] || TYPE_ICONS.task_assigned;
              const Icon = typeConfig.icon;

              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group ${
                    !notif.read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}>
                    <Icon size={16} className={typeConfig.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notif.body}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}