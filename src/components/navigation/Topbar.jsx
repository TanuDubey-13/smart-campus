import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { mockDb } from '../../firebase/helpers';
import { noticeService } from '../../services/noticeService';
import { 
  FiBell, 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiUser, 
  FiLogOut, 
  FiChevronDown 
} from 'react-icons/fi';

export default function Topbar({ setSidebarOpen, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch announcements for notifications panel
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let notices = [];
        try {
          notices = await noticeService.getNotices();
        } catch (err) {
          notices = mockDb.get('notices') || [];
        }
        const emergencyNotices = (notices || []).filter(n => n.category === 'emergency' || n.isPinned);
        setAlerts(emergencyNotices);
      } catch (err) {
        console.error('Failed to load topbar alerts:', err);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <header className={`h-16 border-b border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-card/85 backdrop-blur-md fixed top-0 right-0 z-20 flex items-center justify-between px-6 transition-all duration-300 left-0 ${
      collapsed ? 'md:left-20' : 'md:pl-0 md:left-64'
    }`}
    >
      {/* Left section: Hamburger / Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer md:block hidden"
        >
          <FiMenu className="text-xl" />
        </button>
        
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer md:hidden block"
        >
          <FiMenu className="text-xl" />
        </button>
        
        <h1 className="text-lg font-bold font-display text-slate-800 dark:text-white hidden sm:block tracking-wide">
          Campus Portal
        </h1>
      </div>

      {/* Right section: Theme, Alerts, User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all cursor-pointer relative"
          >
            <FiBell className="text-lg" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-card animate-pulse"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl p-4 z-40 transition-all">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-dark-border mb-3">
                <span className="font-bold text-slate-800 dark:text-white text-sm">Critical Notifications</span>
                <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-500 px-2 py-0.5 rounded-full font-bold">
                  {alerts.length} Urgent
                </span>
              </div>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    No urgent announcements.
                  </div>
                ) : (
                  alerts.map(notice => (
                    <div 
                      key={notice.id} 
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate('/notices');
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border/40 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-100 dark:hover:border-primary-900/20 cursor-pointer transition-all text-left"
                    >
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                        {notice.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                        {notice.summary || notice.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-dark-border text-center">
                <Link
                  to="/notices"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-primary-500 font-bold hover:underline"
                >
                  View all announcements
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-dark-border/80"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
          >
            <img
              src={user?.profilePicUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
              alt="avatar"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-dark-border"
            />
            <span className="hidden sm:block text-xs font-bold text-slate-700 dark:text-slate-300">
              {user?.name?.split(' ')[0]}
            </span>
            <FiChevronDown className="text-slate-400 text-xs hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl p-2.5 z-40 transition-all">
              <div className="p-3 border-b border-slate-100 dark:border-dark-border/80 text-left">
                <p className="font-bold text-slate-800 dark:text-white text-xs truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">{user?.email}</p>
              </div>
              
              <div className="py-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer"
                >
                  <FiUser className="text-sm text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <FiLogOut className="text-sm" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
