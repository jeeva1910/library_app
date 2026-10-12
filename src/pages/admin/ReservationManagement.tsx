import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchReservations, updateReservationStatus, clearReservationMessages } from '../../store/slices/reservationsSlice';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate } from '../../lib/utils';
import { Bookmark, CheckCircle, XCircle, CheckCircle2 } from 'lucide-react';

export const ReservationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reservations, loading, error, successMessage } = useAppSelector((state) => state.reservations);

  useEffect(() => {
    dispatch(fetchReservations());
  }, [dispatch]);

  const handleUpdate = (id: string, status: 'fulfilled' | 'cancelled') => {
    dispatch(clearReservationMessages());
    dispatch(updateReservationStatus({ reservationId: id, status }));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Student Reservations Queue Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">Fulfill or cancel student reservations for out-of-stock titles</p>
        </div>

        <ErrorMessage message={error || ''} onDismiss={() => dispatch(clearReservationMessages())} />

        {successMessage && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading reservations queue...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No active reservations</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Reservation Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{item.bookTitle}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">
                      {item.userName} <span className="text-[11px] text-slate-400">({item.userEmail})</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{formatDate(item.reservationDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.status === 'active' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(item._id, 'fulfilled')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Fulfill</span>
                          </button>
                          <button
                            onClick={() => handleUpdate(item._id, 'cancelled')}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        </div>
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
