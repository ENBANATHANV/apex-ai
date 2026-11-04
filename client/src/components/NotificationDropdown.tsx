import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCheck, Trash2, Dumbbell, Droplet, Award, Info } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'REMINDER':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'SYSTEM':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161D26] border border-zinc-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-zinc-400 hover:text-red-400 flex items-center gap-1 transition"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No notifications yet. Keep training!
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && markAsRead(item.id)}
              className={`p-3.5 hover:bg-zinc-800/40 cursor-pointer transition flex items-start gap-3 ${
                !item.isRead ? 'bg-emerald-950/15' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-zinc-800/70 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-semibold text-zinc-200 truncate">{item.title}</h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.message}</p>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
