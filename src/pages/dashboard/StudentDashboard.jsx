import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { mockDb } from '../../firebase/helpers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiAlertOctagon, 
  FiCalendar, 
  FiFileText, 
  FiPhoneCall,
  FiSearch,
  FiArrowRight,
  FiPlusCircle,
  FiClock,
  FiMapPin
} from 'react-icons/fi';
import { formatDistanceToNow } from '../../utils/dateUtils'; // We will create this simple utility next

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    activeComplaints: 0,
    upcomingEvents: 0,
    totalNotices: 0,
  });
  
  const [recentNotices, setRecentNotices] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Fetch complaints
    const complaints = mockDb.get('complaints');
    const studentComplaints = complaints.filter(c => c.studentId === user.uid);
    const activeComplaints = studentComplaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;

    // Fetch notices
    const notices = mockDb.get('notices');
    
    // Fetch events
    const events = mockDb.get('events');
    const upcoming = events.filter(e => new Date(e.date) > new Date());

    setStats({
      activeComplaints,
      upcomingEvents: upcoming.length,
      totalNotices: notices.length,
    });

    setRecentNotices(notices.slice(0, 3));
    setMyComplaints(studentComplaints.slice(0, 3));
    setUpcomingEvents(upcoming.slice(0, 2));
  }, [user.uid]);

  // Quick Action card details
  const actions = [
    { title: 'Submit a Complaint', desc: 'File hostel, academic or general concerns.', icon: <FiAlertOctagon className="text-red-500" />, path: '/complaints', color: 'hover:border-red-500/30' },
    { title: 'Report Lost & Found', desc: 'Post misplaced keys, phones, or books.', icon: <FiSearch className="text-sky-500" />, path: '/lost-found', color: 'hover:border-sky-500/30' },
    { title: 'Campus Directory', desc: 'Dial hostel warden, security or fire office.', icon: <FiPhoneCall className="text-emerald-500" />, path: '/emergency', color: 'hover:border-emerald-500/30' },
    { title: 'Event Board', desc: 'Sign up for hackathons and seminars.', icon: <FiCalendar className="text-purple-500" />, path: '/events', color: 'hover:border-purple-500/30' },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-linear-to-r from-primary-600 to-secondary-650 text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/10 blur-xl rounded-full w-48 h-48 bottom-[-50%] right-[-10%]"></div>
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {user?.department} Department • Semester {user?.semester}
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-display mt-3">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-slate-100/90 mt-2 text-xs md:text-sm font-medium leading-relaxed">
            Access notices, track your active complaints, register for academic/cultural events, or report lost belongings from your campus hub.
          </p>
        </div>
      </div>

      {/* Stats Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
            <FiAlertOctagon className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Active Complaints</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.activeComplaints}</h4>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-xl">
            <FiCalendar className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Upcoming Events</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.upcomingEvents}</h4>
          </div>
        </div>
        
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border flex items-center gap-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl">
            <FiFileText className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Notices</p>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">{stats.totalNotices}</h4>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-base font-bold font-display text-slate-800 dark:text-white mb-4.5">
          Quick Service Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actions.map((act, index) => (
            <div 
              key={index} 
              onClick={() => navigate(act.path)}
              className={`p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border cursor-pointer transition-all duration-350 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-1 group flex flex-col items-start ${act.color}`}
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-lg mb-4 group-hover:scale-105 transition-transform">
                {act.icon}
              </div>
              <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                {act.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Double Column content: Notices & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest Notices */}
        <Card 
          title="Announcements & Notices" 
          subtitle="Direct from Admin cell"
          action={
            <Link to="/notices" className="text-xs text-primary-500 hover:underline flex items-center gap-1 font-bold">
              All Notices <FiArrowRight />
            </Link>
          }
        >
          <div className="space-y-4">
            {recentNotices.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No notices posted yet.</p>
            ) : (
              recentNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    notice.category === 'emergency' 
                      ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30' 
                      : 'bg-slate-50 dark:bg-slate-900/35 border-slate-100 dark:border-dark-border/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      notice.category === 'emergency' ? 'bg-red-100 text-red-500 dark:bg-red-950/40' :
                      notice.category === 'exams' ? 'bg-purple-100 text-purple-500 dark:bg-purple-950/40' :
                      'bg-sky-100 text-sky-500 dark:bg-sky-950/40'
                    }`}>
                      {notice.category}
                    </span>
                    {notice.isPinned && (
                      <span className="text-[9px] text-primary-500 font-bold bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white mt-2">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {notice.summary || notice.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 mt-3 font-semibold uppercase tracking-wider">
                    <FiClock />
                    {formatDistanceToNow ? formatDistanceToNow(notice.createdAt) : 'Recently'}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Complaints Status & Timeline */}
        <Card 
          title="Recent Complaints Tracker" 
          subtitle="Track resolutions"
          action={
            <Link to="/complaints" className="text-xs text-primary-500 hover:underline flex items-center gap-1 font-bold">
              Submit Complaint <FiPlusCircle />
            </Link>
          }
        >
          <div className="space-y-4">
            {myComplaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-xs font-semibold">You have not submitted any complaints yet.</p>
                <Link to="/complaints">
                  <Button variant="outline" size="sm" className="mt-4">
                    Submit first ticket
                  </Button>
                </Link>
              </div>
            ) : (
              myComplaints.map((comp) => (
                <div 
                  key={comp.id}
                  onClick={() => navigate(`/complaints/${comp.id}`)}
                  className="p-4 rounded-xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-slate-900/20 hover:border-primary-500/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white truncate">
                      {comp.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 capitalize font-bold">
                        Category: {comp.category}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className={`text-[9px] font-bold capitalize ${
                        comp.priority === 'urgent' || comp.priority === 'high' ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        Priority: {comp.priority}
                      </span>
                    </div>
                  </div>
                  
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' :
                    comp.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40' :
                    comp.status === 'rejected' ? 'bg-red-100 text-red-650 dark:bg-red-950/40' :
                    'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {comp.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming Registered Events Calendar Summary */}
      <Card title="Your Upcoming Registered Events" subtitle="Countdowns and status">
        {upcomingEvents.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No upcoming events registered.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt) => {
              const isRegistered = evt.registeredStudents.includes(user.uid);
              return (
                <div key={evt.id} className="p-4 rounded-2xl border border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-950/40 text-primary-500 rounded-xl shrink-0">
                    <FiCalendar className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-white truncate">
                      {evt.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1 mt-1">
                      <FiMapPin /> {evt.location}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      Date: {new Date(evt.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                    <div className="mt-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isRegistered ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {isRegistered ? 'Registered' : 'Not Registered'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
