import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { noticeService } from '../../services/noticeService';
import { summarizeNoticeContent } from '../../services/geminiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiClock, 
  FiBookmark, 
  FiAlertCircle, 
  FiCpu, 
  FiTrash2, 
  FiEye,
  FiFileText
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { formatDistanceToNow } from '../../utils/dateUtils';

export default function NoticeBoard() {
  const { user, isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form toggle states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummaryValue, setAiSummaryValue] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Detail Modal overlay
  const [selectedNotice, setSelectedNotice] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      isPinned: false,
    }
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeService.getNotices();
      setNotices(data);
      setFilteredNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...notices];

    if (searchTerm) {
      result = result.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(n => n.category === categoryFilter);
    }

    // Separate: Pinned notices first, then sorted by date
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredNotices(result);
  }, [searchTerm, categoryFilter, notices]);

  // AI Summarization Handler
  const handleAiSummarize = async () => {
    const title = getValues('title');
    const content = getValues('content');

    if (!title || !content) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Required',
        text: 'Please input both Title and Content before generating summary.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      return;
    }

    setAiLoading(true);
    try {
      const summary = await summarizeNoticeContent(title, content);
      setAiSummaryValue(summary);
      Swal.fire({
        icon: 'success',
        title: 'Summary Generated!',
        text: 'AI Summary generated successfully.',
        timer: 1200,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        summary: aiSummaryValue
      };

      await noticeService.createNotice(payload, user);
      
      Swal.fire({
        icon: 'success',
        title: 'Notice Published',
        text: 'The notice has been published on the board.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });

      // Reset
      reset();
      setAiSummaryValue('');
      setIsFormOpen(false);
      
      // Refresh board
      fetchNotices();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Publishing Failed',
        text: err.message || 'An error occurred.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    }
  };

  const handleDelete = async (noticeId) => {
    const check = await Swal.fire({
      title: 'Delete Notice?',
      text: 'This notice will be removed from all student feeds.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#d33',
      background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (check.isConfirmed) {
      try {
        await noticeService.deleteNotice(noticeId, user);
        Swal.fire('Deleted', 'Notice removed successfully.', 'success');
        fetchNotices();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
            Official Bulletin Board
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Academic bulletins and emergency alerts
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={<FiPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Publish Announcement
          </Button>
        )}
      </div>

      {/* Slide-Down Notice Form Card */}
      {isAdmin && isFormOpen && (
        <Card
          title="Publish Campus Announcement"
          subtitle="Generate instant summaries using integrated Gemini API"
          action={
            <button 
              onClick={() => {
                setIsFormOpen(false);
                setAiSummaryValue('');
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Notice Content Fields (Col span 2) */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    placeholder="Short descriptive heading..."
                    {...register('title', { required: 'Notice title is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="exams">Exams</option>
                      <option value="placement">Placements</option>
                      <option value="emergency">Emergency / Alert</option>
                    </select>
                  </div>
                  <div className="flex items-center pl-2 pt-6">
                    <input
                      id="isPinned"
                      type="checkbox"
                      {...register('isPinned')}
                      className="w-4.5 h-4.5 rounded border-slate-350 text-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900"
                    />
                    <label htmlFor="isPinned" className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer">
                      Pin Notice to top
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Detailed Announcement Text
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type the complete notice details here..."
                    {...register('content', { required: 'Announcement content is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none"
                  ></textarea>
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
              </div>

              {/* AI Summarizer Column */}
              <div className="p-5 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FiCpu className="text-xl text-primary-500 animate-float" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Notice Summarizer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Instantly summarize long announcements. This text will appear in notifications and quick summary cards.
                  </p>

                  {aiSummaryValue ? (
                    <div className="p-3.5 bg-primary-500/5 border border-primary-500/10 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 text-primary-500">
                        Generated Summary
                      </p>
                      <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed italic">
                        "{aiSummaryValue}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-dark-border rounded-xl">
                      No summary generated.
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold gap-2"
                    onClick={handleAiSummarize}
                    loading={aiLoading}
                  >
                    <FiCpu />
                    {aiSummaryValue ? 'Re-Generate AI Summary' : 'Generate AI Summary'}
                  </Button>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-dark-border pt-4">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setAiSummaryValue('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Publish Notice
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters board */}
      <Card title="Search Announcements" className="bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search announcements by keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-805 dark:text-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Announcement Categories</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="exams">Exams</option>
              <option value="placement">Placements</option>
              <option value="emergency">Emergency / Alert</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notice Board Cards list */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold">Loading notices board...</span>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl p-6">
          <FiAlertCircle className="text-4xl text-slate-350 mx-auto mb-3 animate-bounce" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No notices posted</h4>
          <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
            There are no notices matching your keyword search. Pinned notices will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredNotices.map((notice) => {
            const isEmergency = notice.category === 'emergency';
            return (
              <div 
                key={notice.id}
                className={`p-6 rounded-2xl bg-white dark:bg-dark-card border shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  notice.isPinned 
                    ? 'border-primary-500/40 dark:border-primary-500/20 shadow-md ring-2 ring-primary-500/5' 
                    : isEmergency 
                    ? 'border-red-200 dark:border-red-950/30 bg-red-500/[0.02]' 
                    : 'border-slate-200/80 dark:border-dark-border/80'
                }`}
              >
                <div className="space-y-2.5 flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      notice.category === 'emergency' ? 'bg-red-100 text-red-500 dark:bg-red-950/40' :
                      notice.category === 'exams' ? 'bg-purple-100 text-purple-500 dark:bg-purple-950/40' :
                      notice.category === 'placement' ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/40' :
                      'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {notice.category}
                    </span>
                    {notice.isPinned && (
                      <span className="text-[9px] bg-primary-100 text-primary-600 dark:bg-primary-950/40 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                        Pinned
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-slate-850 dark:text-slate-100 tracking-tight line-clamp-1">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.summary || notice.content}
                  </p>

                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider pt-1.5">
                    <FiClock />
                    {formatDistanceToNow ? formatDistanceToNow(notice.createdAt) : 'Recently'}
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex gap-2 w-full md:w-auto shrink-0 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-initial"
                    icon={<FiEye />}
                    onClick={() => setSelectedNotice(notice)}
                  >
                    Read More
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 dark:border-red-950/30 text-red-500 hover:bg-red-500/10 flex-none"
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(notice.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Modal Overlay */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-float-none text-slate-850 dark:text-slate-250 text-left">
            
            {/* Close */}
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-750 dark:hover:text-white transition-colors cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            {/* Header tags */}
            <div className="mb-4">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                selectedNotice.category === 'emergency' ? 'bg-red-100 text-red-500 dark:bg-red-950/40' :
                'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>
                {selectedNotice.category}
              </span>
              <h3 className="text-lg font-black font-display mt-2 text-slate-900 dark:text-white leading-snug">
                {selectedNotice.title}
              </h3>
            </div>

            {/* AI Summary Highlight Box */}
            {selectedNotice.summary && (
              <div className="mb-5 p-4 rounded-2xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 dark:border-primary-500/25">
                <div className="flex items-center gap-1.5 text-primary-500 font-bold mb-1.5">
                  <FiCpu className="text-base" />
                  <span className="text-[10px] uppercase tracking-wider">AI Bullet Summary</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                  {selectedNotice.summary}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              <h5 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider">
                Full Announcement Details
              </h5>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-dark-border/40 whitespace-pre-wrap">
                {selectedNotice.content}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-dark-border/60 text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>Date: {new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
              <span>Ref ID: #{selectedNotice.id}</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
