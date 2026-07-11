import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { MdSchool } from 'react-icons/md';

export default function AuthLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg transition-colors duration-300 p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-400/20 dark:bg-primary-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-400/20 dark:bg-secondary-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-2xl dark:shadow-dark-bg/60 rounded-3xl p-8 relative overflow-hidden"
        >
          {/* Header Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/40 rounded-2xl border border-primary-200/50 dark:border-primary-900/30 text-primary-500 dark:text-primary-400 mb-3 animate-float">
              <MdSchool className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white tracking-tight">
              Smart Campus
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold mt-1">
              Management System
            </p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
