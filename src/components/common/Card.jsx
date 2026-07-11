import React from 'react';

export default function Card({ 
  children, 
  title, 
  subtitle, 
  action, 
  className = '', 
  bodyClassName = '' 
}) {
  return (
    <div className={`bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-xs rounded-2xl overflow-hidden transition-all duration-300 ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-dark-border/80 flex items-center justify-between flex-wrap gap-2">
          <div>
            {title && (
              <h3 className="font-bold text-sm md:text-base font-display text-slate-800 dark:text-white tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
