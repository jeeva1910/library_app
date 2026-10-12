import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFines, payFine, clearFineMessages } from '../../store/slices/finesSlice';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate } from '../../lib/utils';
import { DollarSign, CreditCard, CheckCircle2 } from 'lucide-react';

export const FineManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { fines, loading, error, successMessage } = useAppSelector((state) => state.fines);

  useEffect(() => {
    dispatch(fetchFines());
  }, [dispatch]);

  const handleMarkPaid = (id: string) => {
    dispatch(clearFineMessages());
    dispatch(payFine(id));
  };

  const totalCollected = fines.filter((f) => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const totalPending = fines.filter((f) => f.status === 'pending').reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fine Collection & Ledger</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage student overdue fees and payment clearances</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pending</p>
              <p className="text-lg font-extrabold text-amber-600 tabular-nums">${totalPending.toFixed(2)}</p>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Collected</p>
              <p className="text-lg font-extrabold text-emerald-600 tabular-nums">${totalCollected.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <ErrorMessage message={error || ''} onDismiss={() => dispatch(clearFineMessages())} />

        {successMessage && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading fine ledger...</div>
        ) : fines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No fine records</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Incurred Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.userName || 'Student'}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{item.bookTitle}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${(item.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkPaid(item._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
