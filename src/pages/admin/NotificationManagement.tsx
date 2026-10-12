import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAdminStudents } from '../../store/slices/adminSlice';
import { sendNotification } from '../../store/slices/notificationsSlice';
import { Sidebar } from '../../components/Sidebar';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Send, CheckCircle2, Megaphone } from 'lucide-react';

export const NotificationManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { students } = useAppSelector((state) => state.admin);

  const [targetUserId, setTargetUserId] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminStudents());
  }, [dispatch]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    setSuccess('');

    const res = await dispatch(sendNotification({ userId: targetUserId, title, message, type }));
    setLoading(false);

    if (sendNotification.fulfilled.match(res)) {
      setSuccess('Notification sent successfully!');
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Broadcast Alerts & Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">Send notification messages to all students or specific accounts</p>
        </div>

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Compose Announcement</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Recipient Target *</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
              >
                <option value="all">📢 All Enrolled Students (Broadcast)</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    👤 {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Alert Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value="info">Info Notice</option>
                  <option value="warning">Warning Notice</option>
                  <option value="alert">Alert / Overdue</option>
                  <option value="success">Success Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Library Exam-Week Timings Extended"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Message Content *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter details of the announcement or library notice..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Notification'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
