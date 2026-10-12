import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getColors = () => {
    switch (status.toLowerCase()) {
      case 'borrowed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'returned':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'renewed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'active':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'fulfilled':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'unavailable':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getColors()} ${className}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
