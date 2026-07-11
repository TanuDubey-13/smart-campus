import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiGrid, 
  FiAlertOctagon, 
  FiFileText, 
  FiSearch, 
  FiCalendar, 
  FiPhoneCall, 
  FiUser, 
  FiShield, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout, isAdmin } = useAuth();

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FiGrid />, role: ['student', 'admin'] },
    { path: '/complaints', name: 'Complaints', icon: <FiAlertOctagon />, role: ['student', 'admin'] },
    { path: '/lost-found', name: 'Lost & Found', icon: <FiSearch />, role: ['student', 'admin'] },
    { path: '/notices', name: 'Notice Board', icon: <FiFileText />, role: ['student', 'admin'] },
    { path: '/events', name: 'Campus Events', icon: <FiCalendar />, role: ['student', 'admin'] },
    { path: '/emergency', name: 'Emergency', icon: <FiPhoneCall />, role: ['student', 'admin'] },
    { path: '/profile', name: 'My Profile', icon: <FiUser />, role: ['student', 'admin'] },
  ];

  // If user is admin, add Admin Panel options
  if (isAdmin) {
    menuItems.push({ 
      path: '/admin', 
      name: 'Admin Panel', 
      icon: <FiShield className="text-purple-500" />, 
      role: ['admin'] 
    });
  }

  // Filter items by user role
  const filteredItems = menuItems.filter(item => item.role.includes(user?.role));

  return (
    <aside 
      className={`fixed top-0 left-0 z-30 h-screen border-r border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2.5 bg-primary-100 dark:bg-primary-950/40 rounded-xl text-primary-500 dark:text-primary-400 shrink-0">
            <MdSchool className="text-xl" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold font-display text-slate-800 dark:text-white text-sm tracking-tight">Smart Campus</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Panel</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all group cursor-pointer ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <span className="text-lg shrink-0 group-hover:scale-105 transition-transform">{item.icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Session Info footer */}
      <div className="p-4 border-t border-slate-200 dark:border-dark-border">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border/40">
            <img 
              src={user?.profilePicUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'} 
              alt="avatar" 
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-dark-border"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 capitalize truncate font-semibold">{user?.role}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold tracking-wide text-red-500 hover:bg-red-500/10 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <FiLogOut className="text-lg shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
