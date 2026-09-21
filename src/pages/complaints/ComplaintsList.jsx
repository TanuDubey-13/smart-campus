import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { complaintService } from '../../services/complaintService';
import { validateImageFile } from '../../utils/fileValidators';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiAlertOctagon, 
  FiCalendar, 
  FiEye, 
  FiX, 
  FiCheckCircle, 
  FiUploadCloud,
  FiFileText
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function ComplaintsList() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form toggle state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'maintenance',
      priority: 'medium',
    }
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintService.getComplaints(user.uid, user.role);
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user.uid, user.role]);

  // Apply filters
  useEffect(() => {
    let result = [...complaints];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.title || '').toLowerCase().includes(term) || 
        (c.description || '').toLowerCase().includes(term) ||
        (c.studentName || '').toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter(c => c.category === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(c => c.priority === priorityFilter);
    }

    setFilteredComplaints(result);
    setCurrentPage(1); // Reset to first page
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, complaints]);

  // Handle File Input Validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setFileError(validation.error);
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setFileError(null);
      setSelectedFile(file);
      // Generate object URL for preview
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Complaint Handler
  const onSubmit = async (data) => {
    if (fileError) return;

    let base64Image = '';
    if (selectedFile) {
      // Compress image client-side to ensure document stays safely under Firestore 1MB limit
      try {
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              let width = img.width;
              let height = img.height;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => resolve(event.target.result);
          };
          reader.onerror = () => resolve('');
        });
      } catch (err) {
        console.error('File reading and compression failed:', err);
      }
    }

    try {
      const payload = {
        ...data,
        imageUrl: base64Image
      };
      
      await complaintService.createComplaint(payload, user);
      
      Swal.fire({
        icon: 'success',
        title: 'Ticket Submitted',
        text: 'Your complaint ticket has been submitted to administration cell.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });

      // Clear Form state
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsFormOpen(false);
      
      // Refresh list
      fetchComplaints();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'An error occurred.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
            Complaint Redressal Cell
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Submit and track redressal tickets
          </p>
        </div>
        {!isAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={<FiPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Submit New Ticket
          </Button>
        )}
      </div>

      {/* Slide-Down Submit Complaint Card */}
      {isFormOpen && (
        <Card 
          title="Submit Redressal Ticket" 
          subtitle="All fields must be validated before upload"
          action={
            <button 
              onClick={() => {
                setIsFormOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          }
          className="border-primary-500/20"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Title, Category, Priority, Desc */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Complaint Title
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of issue (e.g. WiFi broken)"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="academic">Academic</option>
                      <option value="hostel">Hostel</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Priority Level
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific details (location, room number, router name)..."
                    {...register('description', { required: 'Description is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none"
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Right Column: Image Attachments */}
              <div className="flex flex-col justify-center items-center p-6 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl bg-slate-50 dark:bg-slate-900/30 relative">
                {previewUrl ? (
                  <div className="relative w-full h-full max-h-[220px] rounded-xl overflow-hidden flex items-center justify-center bg-black/5">
                    <img src={previewUrl} alt="preview" className="max-h-[200px] object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-650 transition-colors cursor-pointer"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center">
                    <FiUploadCloud className="text-4xl text-slate-450 dark:text-slate-500 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-slate-650 dark:text-slate-350">
                      Upload Incident Image
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports JPG, JPEG, PNG, WEBP (Max 5MB)
                    </p>
                    <input
                      type="file"
                      id="fileUpload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-border cursor-pointer transition-all"
                    >
                      Browse Device
                    </label>
                  </div>
                )}
                {fileError && <p className="text-red-500 text-xs mt-3 font-semibold text-center">{fileError}</p>}
              </div>

            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Submit Ticket
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters Panel Card */}
      <Card title="Search & Filter Tickets" className="bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="hostel">Hostel</option>
              <option value="maintenance">Maintenance</option>
              <option value="security">Security</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Complaints List Table Card */}
      <Card title={isAdmin ? "All Campus Submissions" : "My Redressal History"} className="overflow-hidden" bodyClassName="p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-semibold">Fetching records...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FiAlertOctagon className="text-4xl text-slate-350 dark:text-slate-650 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Tickets Found</h4>
            <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
              We couldn't find any complaints that match your selected filters. Try updating your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-border bg-slate-50/70 dark:bg-slate-900/40 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  <th className="py-4.5 px-6">Title</th>
                  {isAdmin && <th className="py-4.5 px-4">Student</th>}
                  <th className="py-4.5 px-4">Category</th>
                  <th className="py-4.5 px-4">Priority</th>
                  <th className="py-4.5 px-4">Status</th>
                  <th className="py-4.5 px-4">Date</th>
                  <th className="py-4.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/80">
                {currentItems.map((comp) => (
                  <tr 
                    key={comp.id} 
                    className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    <td className="py-4 px-6 font-bold text-slate-850 dark:text-slate-100 max-w-[200px] truncate">
                      {comp.title}
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {comp.studentName}
                      </td>
                    )}
                    <td className="py-4 px-4 capitalize">{comp.category}</td>
                    <td className="py-4 px-4">
                      <span className={`font-bold capitalize ${
                        comp.priority === 'urgent' || comp.priority === 'high' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {comp.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' :
                        comp.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40' :
                        comp.status === 'rejected' ? 'bg-red-100 text-red-650 dark:bg-red-950/40' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 dark:text-slate-500">
                      {new Date(comp.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/complaints/${comp.id}`)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-primary-50 dark:bg-slate-800 dark:hover:bg-primary-950/20 text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 cursor-pointer transition-all"
                        title="View Details & Timeline"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4.5 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredComplaints.length)} of {filteredComplaints.length} tickets
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
