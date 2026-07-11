import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertOctagon, FiArrowLeft } from 'react-icons/fi';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-flex items-center justify-center mb-6"
        >
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full w-28 h-28 mx-auto"></div>
          <div className="p-6 bg-red-100 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50">
            <FiAlertOctagon className="text-6xl text-red-500 animate-pulse" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold font-display text-slate-800 dark:text-white mb-3">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          You do not have the required permissions to view this administrative page. If you believe this is an error, please contact the campus IT administrator.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium transition-all duration-300 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
