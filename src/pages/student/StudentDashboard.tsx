import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBorrowings } from '../../store/slices/borrowingsSlice';
import { fetchReservations } from '../../store/slices/reservationsSlice';
import { fetchNotifications, markNotificationRead } from '../../store/slices/notificationsSlice';
import { fetchFines } from '../../store/slices/finesSlice';
import { Sidebar } from '../../components/Sidebar';
import { DashboardCard } from '../../components/DashboardCard';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import {
  BookOpenCheck,
  Clock,
  AlertTriangle,
  Bookmark,
  DollarSign,
  Bell,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { borrowings } = useAppSelector((state) => state.borrowings);
  const { reservations } = useAppSelector((state) => state.reservations);
  const { notifications } = useAppSelector((state) => state.notifications);
  const { fines } = useAppSelector((state) => state.fines);

  useEffect(() => {
    dispatch(fetchBorrowings());
    dispatch(fetchReservations());
    dispatch(fetchNotifications());
    dispatch(fetchFines());
  }, [dispatch]);

  const activeBorrowings = borrowings.filter((b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue');
  const overdueCount = borrowings.filter((b) => b.status === 'overdue').length;
  const dueSoonCount = activeBorrowings.filter((b) => {
    const days = getDaysRemaining(b.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  const activeReservationsCount = reservations.filter((r) => r.status === 'active').length;
  const pendingFines = fines.filter((f) => f.status === 'pending');
  const totalPendingFineAmount = pendingFines.reduce((acc, f) => acc + (f.amount || 0), 0);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Student Academic Portal Overview & Circulation Metrics</p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <DashboardCard
            title="Active Borrowed Books"
            value={activeBorrowings.length}
            icon={BookOpenCheck}
            color="blue"
            description="Currently checked out books"
          />
          <DashboardCard
            title="Books Due Soon"
            value={dueSoonCount}
            icon={Clock}
            color="amber"
            description="Due within the next 3 days"
          />
          <DashboardCard
            title="Overdue Books"
            value={overdueCount}
            icon={AlertTriangle}
            color="rose"
            description="Lending period exceeded"
          />
          <DashboardCard
            title="Pending Fines"
            value={`$${totalPendingFineAmount.toFixed(2)}`}
            icon={DollarSign}
            color="indigo"
            description={`${pendingFines.length} unpaid fine records`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Borrowings Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Current Borrowings</h2>
              </div>
              <Link
                to="/student/borrowings"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeBorrowings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">You currently have no borrowed books.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeBorrowings.slice(0, 4).map((item) => {
                  const daysRem = getDaysRemaining(item.dueDate);
                  return (
                    <div key={item._id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.bookTitle}</p>
                        <p className="text-xs text-slate-500">
                          Due Date: <span className="font-medium text-slate-700">{formatDate(item.dueDate)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {daysRem < 0 ? (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            Overdue {Math.abs(daysRem)} days
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-600">
                            {daysRem} days left
                          </span>
                        )}
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              </div>
              <Link
                to="/student/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                See All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 rounded-lg border text-xs ${
                      notif.isRead
                        ? 'bg-slate-50 border-slate-200/60 text-slate-600'
                        : 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      {!notif.isRead && (
                        <button
                          onClick={() => dispatch(markNotificationRead(notif._id))}
                          className="text-[10px] text-blue-600 hover:underline shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
