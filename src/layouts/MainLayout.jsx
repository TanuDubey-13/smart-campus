import React, { useState } from 'react';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* 2. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
            ></motion.div>
            
            {/* Drawer sheet */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-dark-card z-50 md:hidden shadow-2xl border-r border-slate-100 dark:border-dark-border"
            >
              {/* Close Button Inside Drawer */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-dark-border text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                >
                  <FiX />
                </button>
              </div>
              
              {/* Force collapse to false in drawer mode */}
              <Sidebar collapsed={false} setCollapsed={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Body Wrapper */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        } pl-0`}
      >
        <Topbar 
          setSidebarOpen={setSidebarOpen} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 pt-20 p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
