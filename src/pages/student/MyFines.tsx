import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFines, payFine, clearFineMessages } from '../../store/slices/finesSlice';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate } from '../../lib/utils';
import { DollarSign, CreditCard, CheckCircle2 } from 'lucide-react';

export const MyFines: React.FC = () => {
  const dispatch = useAppDispatch();
  const { fines, loading, error, successMessage } = useAppSelector((state) => state.fines);

  useEffect(() => {
    dispatch(fetchFines());
  }, [dispatch]);

  const handlePay = (fineId: string) => {
    dispatch(clearFineMessages());
    dispatch(payFine(fineId));
  };

  const totalPending = fines
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Overdue Fines & Payments</h1>
            <p className="text-xs text-slate-500 mt-0.5">Automated overdue fee records ($2.00 / day rate)</p>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pending Fine</p>
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">${totalPending.toFixed(2)}</p>
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
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No fine records found</p>
            <p className="text-xs text-slate-500 mt-1">You have no overdue fines on record.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Incurred Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.bookTitle}</td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${(item.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.status === 'pending' ? (
                        <button
                          onClick={() => handlePay(item._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Paid on {formatDate(item.paidAt)}</span>
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
