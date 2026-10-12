import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAdminDashboard } from '../../store/slices/adminSlice';
import { Sidebar } from '../../components/Sidebar';
import { DashboardCard } from '../../components/DashboardCard';
import {
  BookOpen,
  CheckCircle,
  Repeat,
  Users,
  AlertTriangle,
  Bookmark,
  DollarSign,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Head Librarian Control Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time statistics on book inventory, student circulation, fines, and reservations</p>
        </div>

        {loading || !stats ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading library analytics...</div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <DashboardCard
                title="Total Book Inventory"
                value={stats.totalBooks}
                icon={BookOpen}
                color="blue"
                description={`${stats.availableBooks} copies currently available`}
              />
              <DashboardCard
                title="Active Borrowings"
                value={stats.borrowedBooks}
                icon={Repeat}
                color="emerald"
                description="Books in circulation"
              />
              <DashboardCard
                title="Overdue Books"
                value={stats.overdueBooks}
                icon={AlertTriangle}
                color="rose"
                description="Past return due date"
              />
              <DashboardCard
                title="Pending Fine Balances"
                value={`$${stats.pendingFinesAmount.toFixed(2)}`}
                icon={DollarSign}
                color="amber"
                description="Uncollected overdue fees"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Borrowed Books */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Top Circulation Books</h2>
                </div>

                {stats.mostBorrowedBooks.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No borrowing trends recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.mostBorrowedBooks.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[220px]">{item.title}</span>
                        </div>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                          {item.borrowCount} Checkouts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Collection by Category</h2>
                </div>

                <div className="space-y-3">
                  {stats.categoryBreakdown.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-800">{cat.category}</span>
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {cat.count} Titles
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
