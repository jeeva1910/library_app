import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchBooks } from '../../store/slices/booksSlice';
import { fetchAdminStudents } from '../../store/slices/adminSlice';
import { fetchBorrowings, borrowBook, returnBook, clearBorrowingMessages } from '../../store/slices/borrowingsSlice';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorMessage } from '../../components/ErrorMessage';
import { formatDate } from '../../lib/utils';
import { BookPlus, Repeat, CheckCircle2 } from 'lucide-react';

export const IssueReturn: React.FC = () => {
  const dispatch = useAppDispatch();
  const { books } = useAppSelector((state) => state.books);
  const { students } = useAppSelector((state) => state.admin);
  const { borrowings, loading, error, actionSuccessMessage } = useAppSelector((state) => state.borrowings);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchAdminStudents());
    dispatch(fetchBorrowings());
  }, [dispatch]);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId) return;

    dispatch(clearBorrowingMessages());
    const res = await dispatch(borrowBook({ bookId: selectedBookId, targetUserId: selectedStudentId }));
    if (borrowBook.fulfilled.match(res)) {
      setSelectedBookId('');
      setSelectedStudentId('');
      dispatch(fetchBooks());
      dispatch(fetchBorrowings());
    }
  };

  const handleReturnBook = async (borrowingId: string) => {
    dispatch(clearBorrowingMessages());
    const res = await dispatch(returnBook(borrowingId));
    if (returnBook.fulfilled.match(res)) {
      dispatch(fetchBooks());
      dispatch(fetchBorrowings());
    }
  };

  const activeCirculation = borrowings.filter((b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Library Desk — Book Issue & Return</h1>
          <p className="text-xs text-slate-500 mt-0.5">Issue physical books to students or process returns and fine generation</p>
        </div>

        <ErrorMessage message={error || ''} onDismiss={() => dispatch(clearBorrowingMessages())} />

        {actionSuccessMessage && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Issue Form Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <BookPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Issue Book to Student</h2>
          </div>

          <form onSubmit={handleIssueBook} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Student *</label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Book *</label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
              >
                <option value="">-- Choose Book --</option>
                {books
                  .filter((b) => b.availableCopies > 0)
                  .map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} (Avail: {b.availableCopies})
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 h-[38px]"
            >
              <BookPlus className="w-4 h-4" />
              <span>Confirm Book Issue</span>
            </button>
          </form>
        </div>

        {/* Active Circulation Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Repeat className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Active Checked Out Books ({activeCirculation.length})</h2>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading circulation data...</p>
          ) : activeCirculation.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active borrowings currently in circulation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Student Borrower</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Process Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCirculation.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{item.bookTitle}</td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        {item.userName} <span className="text-[11px] text-slate-400">({item.userEmail})</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{formatDate(item.issueDate)}</td>
                      <td className="px-4 py-3.5 text-slate-800 font-semibold">{formatDate(item.dueDate)}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleReturnBook(item._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          Process Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
