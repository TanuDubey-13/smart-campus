import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { mockDb } from '../../firebase/helpers';
import { complaintService } from '../../services/complaintService';
import { lostFoundService } from '../../services/lostFoundService';
import { eventService } from '../../services/eventService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  FiAlertOctagon, 
  FiCalendar, 
  FiFileText, 
  FiSearch, 
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiLoader
} from 'react-icons/fi';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalStudents: 0,
    activeComplaints: 0,
    pendingLostFound: 0,
    totalEvents: 0
  });

  const [complaintCategoryData, setComplaintCategoryData] = useState(null);
  const [complaintStatusData, setComplaintStatusData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        let users = mockDb.get('users') || [];
        let complaints = [];
        let pendingLF = [];
        let events = [];
        let logs = mockDb.get('activityLogs') || [];

        try {
          complaints = await complaintService.getComplaints(user?.uid, 'admin');
        } catch (err) {
          complaints = mockDb.get('complaints') || [];
        }

        try {
          pendingLF = await lostFoundService.getPendingModeration();
        } catch (err) {
          const lf = mockDb.get('lostFound') || [];
          pendingLF = lf.filter(i => !i.isApproved);
        }

        try {
          events = await eventService.getEvents();
        } catch (err) {
          events = mockDb.get('events') || [];
        }

        const studentsCount = users.filter(u => u.role === 'student').length;
        const activeComp = complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;

        setKpis({
          totalStudents: studentsCount || 1,
          activeComplaints: activeComp,
          pendingLostFound: pendingLF.length,
          totalEvents: events.length
        });

        // 1. Chart 1: Complaints by Category
        const categories = ['academic', 'hostel', 'maintenance', 'security', 'others'];
        const categoryCounts = categories.map(cat => complaints.filter(c => c.category === cat).length);
        
        setComplaintCategoryData({
          labels: ['Academic', 'Hostel', 'Maintenance', 'Security', 'Others'],
          datasets: [
            {
              label: 'Complaints by Category',
              data: categoryCounts,
              backgroundColor: [
                'rgba(14, 165, 233, 0.65)',  // sky-500
                'rgba(168, 85, 247, 0.65)',  // purple-500
                'rgba(245, 158, 11, 0.65)',  // amber-500
                'rgba(239, 68, 68, 0.65)',   // red-500
                'rgba(100, 116, 139, 0.65)'  // slate-500
              ],
              borderColor: [
                '#0ea5e9',
                '#a855f7',
                '#f59e0b',
                '#ef4444',
                '#64748b'
              ],
              borderWidth: 1.5,
            }
          ]
        });

        // 2. Chart 2: Complaints by Status
        const statuses = ['pending', 'in-progress', 'resolved', 'rejected'];
        const statusCounts = statuses.map(st => complaints.filter(c => c.status === st).length);
        
        setComplaintStatusData({
          labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
          datasets: [
            {
              label: 'Number of Tickets',
              data: statusCounts,
              backgroundColor: [
                'rgba(148, 163, 184, 0.65)', // slate
                'rgba(234, 179, 8, 0.65)',   // yellow
                'rgba(16, 185, 129, 0.65)',  // emerald
                'rgba(239, 68, 68, 0.65)'    // red
              ],
              borderColor: [
                '#94a3b8',
                '#eab308',
                '#10b981',
                '#ef4444'
              ],
              borderWidth: 1.5
            }
          ]
        });

        // Logs
        setRecentLogs((logs || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <FiLoader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <span className="text-sm font-semibold uppercase tracking-wider">Loading Analytics...</span>
      </div>
    );
  }

  // Chart configuration settings for dark/light themes
  const isDarkTheme = document.documentElement.classList.contains('dark');
  const textColor = isDarkTheme ? '#9ca3af' : '#475569';
  const gridColor = isDarkTheme ? '#1f2937' : '#f1f5f9';

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 12,
          font: { size: 11, weight: 'bold' }
        }
      }
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
            Administrator Analytics Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
            System overview & moderations
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            icon={<FiFileText />} 
            onClick={() => navigate('/notices')}
          >
            Create Notice
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            icon={<FiCalendar />} 
            onClick={() => navigate('/events')}
          >
            Add Campus Event
          </Button>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl flex items-center gap-4.5">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl">
            <FiUsers className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Total Students</p>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{kpis.totalStudents}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl flex items-center gap-4.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
            <FiAlertOctagon className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Active Tickets</p>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{kpis.activeComplaints}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl flex items-center gap-4.5 animate-pulse-subtle">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
            <FiSearch className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Pending L&F Moderation</p>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{kpis.pendingLostFound}</h4>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl flex items-center gap-4.5">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-xl">
            <FiCalendar className="text-xl" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-300 font-bold uppercase tracking-wider">Total Events</p>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{kpis.totalEvents}</h4>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <Card title="Complaints Category Breakdown" subtitle="Distribution by category label">
          <div className="max-w-[280px] mx-auto py-2">
            {complaintCategoryData && <Pie data={complaintCategoryData} options={pieOptions} />}
          </div>
        </Card>

        {/* Chart 2 */}
        <Card title="Resolution Status Overview" subtitle="Total tickets per status category">
          <div className="py-2">
            {complaintStatusData && <Bar data={complaintStatusData} options={barOptions} />}
          </div>
        </Card>
      </div>

      {/* System Logs & Quick Moderator Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Logs List */}
        <Card 
          className="lg:col-span-2" 
          title="Recent System Actions Log" 
          subtitle="Audit trail of security and database mutations"
          action={<FiActivity className="text-slate-400" />}
        >
          <div className="divide-y divide-slate-100 dark:divide-dark-border/80">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex justify-between items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                    {log.userName}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Admin Quick Moderator Links Panel */}
        <Card title="Moderator Access Cell" subtitle="Fast administrative workflows">
          <div className="space-y-3">
            <div 
              onClick={() => navigate('/complaints')}
              className="p-3.5 rounded-xl border border-slate-150 dark:border-dark-border/60 bg-slate-50/50 dark:bg-slate-900/10 hover:border-primary-500/25 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Review Complaints</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Solve, reject or progress tickets</p>
              </div>
              <FiCheckCircle className="text-slate-400 hover:text-primary-500 text-sm" />
            </div>

            <div 
              onClick={() => navigate('/lost-found')}
              className="p-3.5 rounded-xl border border-slate-150 dark:border-dark-border/60 bg-slate-50/50 dark:bg-slate-900/10 hover:border-primary-500/25 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Moderate Lost & Found</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Approve posts to block spam</p>
              </div>
              <FiSearch className="text-slate-400 hover:text-primary-500 text-sm" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
