import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAdminStudents } from '../../store/slices/adminSlice';
import { Sidebar } from '../../components/Sidebar';
import { formatDate } from '../../lib/utils';
import { Search, Users, Mail, BookOpenCheck } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { students, loading } = useAppSelector((state) => state.admin);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAdminStudents());
  }, [dispatch]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Student Directory & Account Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">View registered student accounts and active circulation activity</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">Loading student directory...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No students found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Member Since</th>
                  <th className="px-4 py-3 text-center">Active Borrowings</th>
                  <th className="px-4 py-3 text-center">Total Borrowings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{student.name}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{student.email}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(student.createdAt)}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-600">
                      {student.activeBorrowings}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                      {student.totalBorrowings}
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
