import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { complaintService } from '../../services/complaintService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiClock, 
  FiUser, 
  FiBook, 
  FiFlag, 
  FiActivity, 
  FiCornerDownRight, 
  FiCheckCircle, 
  FiArrowLeft,
  FiLoader,
  FiFileText
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: 'in-progress',
      adminResponse: '',
    }
  });

  const fetchComplaint = async () => {
    try {
      const data = await complaintService.getComplaintById(id);
      
      // Security check: Student cannot see other student's complaints
      if (!isAdmin && data.studentId !== user.uid) {
        navigate('/unauthorized');
        return;
      }
      
      setComplaint(data);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading',
        text: err.message || 'Ticket not found.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      navigate('/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id, user.uid, isAdmin]);

  const handleResolveSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updated = await complaintService.updateComplaintStatus(
        id, 
        data.status, 
        data.adminResponse, 
        user
      );
      setComplaint(updated);
      
      Swal.fire({
        icon: 'success',
        title: 'Complaint Updated',
        text: `Status updated successfully to ${data.status}.`,
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message || 'Could not update status.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <FiLoader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <span className="text-sm font-semibold uppercase tracking-wider">Loading ticket...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Back navigation */}
      <div>
        <button
          onClick={() => navigate('/complaints')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer uppercase tracking-wider"
        >
          <FiArrowLeft /> Back to Complaints List
        </button>
      </div>

      {/* Grid: Complaint Details & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Ticket Metadata & description */}
        <div className="md:col-span-2 space-y-6">
          <Card 
            title={complaint.title} 
            subtitle={`Ticket Reference ID: #${complaint.id}`}
            action={
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                complaint.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' :
                complaint.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40' :
                complaint.status === 'rejected' ? 'bg-red-100 text-red-650 dark:bg-red-950/40' :
                'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {complaint.status}
              </span>
            }
          >
            {/* Meta attributes */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-dark-border/60 pb-4 mb-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-405">
                <FiBook className="text-slate-400" />
                <span className="capitalize"><strong className="text-slate-700 dark:text-slate-350">Category:</strong> {complaint.category}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-405">
                <FiFlag className="text-slate-400" />
                <span className="capitalize"><strong className="text-slate-700 dark:text-slate-350">Priority:</strong> {complaint.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-405">
                <FiUser className="text-slate-400" />
                <span><strong className="text-slate-700 dark:text-slate-350">Filed by:</strong> {complaint.studentName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-405">
                <FiClock className="text-slate-400" />
                <span>
                  <strong className="text-slate-700 dark:text-slate-350">Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Detailed Report
                </h4>
                <p className="text-sm text-slate-705 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-dark-border/40">
                  {complaint.description}
                </p>
              </div>

              {/* Image attachment */}
              {complaint.imageUrl && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Attached Incident Photograph
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-dark-border/60 bg-black/5 flex items-center justify-center p-2">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Incident reference" 
                      className="max-h-[350px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Admin Redressal Form Panel */}
          {isAdmin && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
            <Card title="Administrative Action Desk" subtitle="Update resolution status and remarks">
              <form onSubmit={handleSubmit(handleResolveSubmit)} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      New Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Resolution Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="Remarks displayed to the student..."
                      {...register('adminResponse', { required: 'Resolution remarks are required' })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    {errors.adminResponse && <p className="text-red-500 text-[10px] mt-1">{errors.adminResponse.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    type="submit"
                    loading={submitting}
                  >
                    Post Updates
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Admin response block if resolved/rejected */}
          {complaint.adminResponse && (
            <Card title="Official Administration Remarks" className="border-emerald-500/20">
              <div className="flex gap-3 text-emerald-600 dark:text-emerald-450">
                <FiCornerDownRight className="text-lg shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">Resolution Response</p>
                  <p className="text-sm text-slate-700 dark:text-slate-350 mt-1 italic">
                    "{complaint.adminResponse}"
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side: Timeline Track Panel */}
        <Card title="Progress History Timeline" subtitle="Updated logs in real-time" className="h-fit">
          <div className="relative pl-6 space-y-6 border-l border-slate-200 dark:border-dark-border/80">
            {complaint.timeline.map((event, index) => {
              const colors = {
                pending: 'bg-slate-300 ring-slate-100 dark:ring-slate-900',
                'in-progress': 'bg-yellow-500 ring-yellow-100 dark:ring-yellow-950/40',
                resolved: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950/40',
                rejected: 'bg-red-500 ring-red-100 dark:ring-red-950/40'
              };

              return (
                <div key={index} className="relative group text-left">
                  {/* Timeline dot */}
                  <span className={`absolute -left-[30px] top-1.5 w-3 h-3 rounded-full ring-4 ${colors[event.status] || 'bg-slate-400'}`}></span>
                  
                  <div className="text-xs">
                    <span className="font-bold text-slate-750 dark:text-slate-100 uppercase tracking-wide block">
                      {event.status}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {event.message}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-2 block font-semibold">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}
