import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';
import { BookOpen, Bell, LogOut, User as UserIcon, Shield, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.notifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const [isResetting, setIsResetting] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSeedReset = async () => {
    if (!confirm('Reset database to clean seed demo data?')) return;
    setIsResetting(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      alert('Failed to reset seed data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              Digital Library
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Management System
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
            Home
          </Link>
          {user && user.role === 'student' && (
            <>
              <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Dashboard
              </Link>
              <Link to="/student/books" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Search Books
              </Link>
              <Link to="/student/borrowings" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                My Borrowings
              </Link>
              <Link to="/student/resources" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Digital Resources
              </Link>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Admin Dashboard
              </Link>
              <Link to="/admin/books" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Book Catalog
              </Link>
              <Link to="/admin/issue-return" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Issue / Return
              </Link>
              <Link to="/admin/users" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
                Students
              </Link>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSeedReset}
            disabled={isResetting}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Reset Database to Seed Demo Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'student' && (
                <Link
                  to="/student/notifications"
                  className="relative p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full" />
                  )}
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/profile'}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                    {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
