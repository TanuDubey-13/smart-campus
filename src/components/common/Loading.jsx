import React from 'react';

// Spinner component
export function Spinner({ className = 'w-8 h-8 text-primary-500' }) {
  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}

// Card skeletal loader
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border/80 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-1/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-1/4"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-full"></div>
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-5/6"></div>
      </div>
    </div>
  );
}

// Table row skeletal loader
export function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-dark-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4.5 px-4">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
