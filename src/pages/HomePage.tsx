import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser } from '../store/slices/authSlice';
import {
  BookOpen,
  Search,
  BookCheck,
  Bookmark,
  Globe,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [quickSearch, setQuickSearch] = useState('');

  const handleDemoLogin = async (role: 'admin' | 'student') => {
    const email = role === 'admin' ? 'admin@library.edu' : 'alex.student@library.edu';
    const password = role === 'admin' ? 'admin123' : 'student123';
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/student/books?search=${encodeURIComponent(quickSearch)}`);
    } else {
      navigate('/student/books');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Award className="w-4 h-4" />
            <span>Academic Library & Resource Management System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Centralized Digital Library Management Portal
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Streamlining campus book circulation, reservations, e-learning digital resources, overdue fines tracking, and student research services.
          </p>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2 bg-white p-2 rounded-xl shadow-lg border border-slate-200 text-slate-900 mb-8">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Search by book title, author, category, or ISBN..."
              className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shrink-0"
            >
              Explore Catalog
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4">
            <span className="text-xs font-medium text-slate-400">Quick Demo Access:</span>
            <button
              onClick={() => handleDemoLogin('student')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Login as Demo Student</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Login as Head Librarian</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Digital Library Services
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Built for modern university libraries, faculties, and enrolled students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Smart Book Search</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant filtering across Computer Science, Electronics, Mechanical, Physics, and Mathematics textbooks with real-time stock availability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <BookCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Borrow & Renewals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Self-service online book requests with 14-day borrowing cycles, 1-click renewal extensions, and return reminders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Queue Reservations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reserve high-demand textbooks when copies are checked out. Automated notification when books are returned to desk.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Digital Journals & E-Books</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct access to ACM Digital Library, IEEE Xplore, MIT OpenCourseWare, and downloadable PDF academic publications.
            </p>
          </div>
        </div>
      </section>

      {/* Library Rules & Fine Calculation Info */}
      <section className="bg-white py-12 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Library Policies & Circulation Guidelines</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard issue duration: 14 days with up to 2 allowable renewals.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Configurable overdue fine calculation rate: $2.00 / day overdue.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Real-time availability tracking across physical library stacks.</span>
              </li>
            </ul>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <span>Student / Staff Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
