import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-flex items-center justify-center mb-8"
        >
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full w-32 h-32 mx-auto"></div>
          <span className="text-9xl font-black text-slate-300 dark:text-slate-800 tracking-wider">404</span>
          <FiAlertCircle className="absolute text-5xl text-primary-500 bottom-2 right-2 animate-bounce" />
        </motion.div>
        
        <h1 className="text-3xl font-bold font-display text-slate-800 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300 group"
        >
          <FiHome className="text-lg group-hover:-translate-y-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
