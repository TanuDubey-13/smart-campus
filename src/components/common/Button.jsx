import React from 'react';
import { FiLoader } from 'react-icons/fi';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon, 
  className = '', 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-semibold tracking-wide rounded-xl transition-all duration-350 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm";
  
  const variants = {
    primary: "bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary-500/20 focus:ring-primary-500",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500",
    danger: "bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:shadow-red-500/20 focus:ring-red-500",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/20 focus:ring-emerald-500",
    outline: "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-primary-500 shadow-xs",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  };

  return (
    <button
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <FiLoader className="animate-spin text-sm" />}
      {!loading && icon && <span className="text-sm md:text-base">{icon}</span>}
      {children}
    </button>
  );
}
