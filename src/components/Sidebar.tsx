import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BookOpenCheck,
  Bookmark,
  Globe,
  Bell,
  CreditCard,
  User,
  BookPlus,
  Users,
  Repeat,
  DollarSign,
  Send,
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/books', label: 'Search Books', icon: Search },
    { to: '/student/borrowings', label: 'My Borrowings', icon: BookOpenCheck },
    { to: '/student/reservations', label: 'Reservations', icon: Bookmark },
    { to: '/student/resources', label: 'Digital Resources', icon: Globe },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/fines', label: 'Fines & Payments', icon: CreditCard },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/admin/books', label: 'Book Catalog CRUD', icon: BookPlus },
    { to: '/admin/issue-return', label: 'Issue & Return Desk', icon: Repeat },
    { to: '/admin/users', label: 'Student Directory', icon: Users },
    { to: '/admin/reservations', label: 'Reservations Desk', icon: Bookmark },
    { to: '/admin/resources', label: 'Digital Resources', icon: Globe },
    { to: '/admin/fines', label: 'Fine Collection', icon: DollarSign },
    { to: '/admin/notifications', label: 'Broadcast Alerts', icon: Send },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 shrink-0 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/60">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {role === 'admin' ? 'Librarian Workspace' : 'Student Library Portal'}
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
