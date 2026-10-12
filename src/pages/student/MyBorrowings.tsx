import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBorrowings, renewBook, clearBorrowingMessages } from '../../store/slices/borrowingsSlice';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate, getDaysRemaining } from '../../lib/utils';
import { BookOpenCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MyBorrowings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { borrowings, loading, error, actionSuccessMessage } = useAppSelector((state) => state.borrowings);

  useEffect(() => {
    dispatch(fetchBorrowings());
  }, [dispatch]);

  const handleRenew = (borrowingId: string) => {
    dispatch(clearBorrowingMessages());
    dispatch(renewBook(borrowingId));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="student" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Borrowing History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track active checked out books, return due dates, and renewals</p>
        </div>

        <ErrorMessage message={error || ''} onDismiss={() => dispatch(clearBorrowingMessages())} />

        {actionSuccessMessage && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading borrowings...</div>
        ) : borrowings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <BookOpenCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No borrowing records</p>
            <p className="text-xs text-slate-500 mt-1">You haven't borrowed any library books yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Fine Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowings.map((item) => {
                  const daysLeft = getDaysRemaining(item.dueDate);
                  const canRenew = (item.status === 'borrowed' || item.status === 'renewed') && (item.renewCount || 0) < 2;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{item.bookTitle}</td>
                      <td className="px-4 py-3.5 text-slate-600">{formatDate(item.issueDate)}</td>
                      <td className="px-4 py-3.5 text-slate-800 font-semibold">{formatDate(item.dueDate)}</td>
                      <td className="px-4 py-3.5 text-slate-600">{item.returnDate ? formatDate(item.returnDate) : '-'}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        ${(item.fineAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {canRenew ? (
                          <button
                            onClick={() => handleRenew(item._id)}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Extend due date by 7 days"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Renew ({item.renewCount || 0}/2)</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
