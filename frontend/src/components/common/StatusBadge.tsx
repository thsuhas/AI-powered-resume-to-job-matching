import React from 'react';
import { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'Offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'Interview':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
      case 'Assessment':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'To Apply':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
      case 'Interested':
        return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-400/20';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ring-1 ring-inset ${getBadgeStyle(
        status
      )} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
