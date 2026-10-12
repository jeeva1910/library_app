import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchNotifications, markNotificationRead } from '../../store/slices/notificationsSlice';
import { Sidebar } from '../../components/Sidebar';
import { formatDate } from '../../lib/utils';
import { Bell, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">System Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overdue alerts, borrowing confirmations, and library desk announcements</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No notifications</p>
            <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isRead
                    ? 'bg-white border-slate-200/80'
                    : 'bg-blue-50/40 border-blue-200 shadow-2xs font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <span className="text-[10px] text-slate-400 font-normal">{formatDate(item.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => dispatch(markNotificationRead(item._id))}
                      className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors shrink-0"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
