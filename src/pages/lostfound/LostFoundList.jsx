import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { lostFoundService } from '../../services/lostFoundService';
import { validateImageFile } from '../../utils/fileValidators';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiUploadCloud, 
  FiMapPin, 
  FiCalendar, 
  FiUser, 
  FiMail, 
  FiCheckCircle, 
  FiEye,
  FiSlash,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function LostFoundList() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'moderator'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'lost', 'found'

  // Contact details Modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'lost',
      category: 'electronics',
      location: '',
      date: new Date().toISOString().substring(0, 10),
    }
  });

  const fetchPosts = async (tabOverride) => {
    const tabToFetch = tabOverride || activeTab;
    setLoading(true);
    try {
      let data = [];
      if (tabToFetch === 'all') {
        data = await lostFoundService.getApprovedPosts();
      } else if (tabToFetch === 'my') {
        data = await lostFoundService.getMyPosts(user.uid);
      } else if (tabToFetch === 'moderator' && isAdmin) {
        data = await lostFoundService.getPendingModeration();
      }
      setPosts(data);
    } catch (err) {
      console.error('fetchPosts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, user.uid, isAdmin]);

  // Multiple File Selection & Validation
  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check Limit: Max 3 images
    if (files.length + selectedFiles.length > 3) {
      setFileError('Maximum 3 images are allowed per report.');
      return;
    }

    const validFiles = [];
    let errorMsg = null;

    for (let file of files) {
      const check = validateImageFile(file);
      if (!check.isValid) {
        errorMsg = check.error;
        break;
      } else {
        validFiles.push(file);
      }
    }

    if (errorMsg) {
      setFileError(errorMsg);
    } else {
      setFileError(null);
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
      
      // Generate preview URLs
      const newUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newUrls]);
    }
  };

  const removeSelectedFile = (index) => {
    const files = [...selectedFiles];
    files.splice(index, 1);
    setSelectedFiles(files);

    const urls = [...previewUrls];
    // Revoke object url to prevent memory leaks
    URL.revokeObjectURL(urls[index]);
    urls.splice(index, 1);
    setPreviewUrls(urls);

    setFileError(null);
  };

  // Submit Handler
  const onSubmit = async (data) => {
    if (fileError) return;

    // Convert and compress selected images to base64 array
    let base64Images = [];
    if (selectedFiles.length > 0) {
      try {
        base64Images = await Promise.all(
          selectedFiles.map(file => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
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
          })
        );
      } catch (err) {
        console.error('Files conversion failed:', err);
      }
    }

    try {
      const payload = {
        ...data,
        imageUrls: base64Images.filter(Boolean)
      };

      await lostFoundService.createPost(payload, user);

      const msg = user.role === 'admin' 
        ? 'Your item has been posted successfully.'
        : 'Your item report has been submitted for admin approval to prevent spam.';

      Swal.fire({
        icon: 'success',
        title: 'Report Submitted',
        text: msg,
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });

      // Clear Form state
      reset();
      setSelectedFiles([]);
      setPreviewUrls([]);
      setIsFormOpen(false);
      
      // Auto switch to "My Submissions" tab so user immediately sees their post
      const nextTab = user.role === 'admin' ? 'all' : 'my';
      setActiveTab(nextTab);
      fetchPosts(nextTab);
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

  // Moderator actions
  const handleApprove = async (postId) => {
    try {
      await lostFoundService.approvePost(postId, user);
      Swal.fire('Approved!', 'Post has been published on the board.', 'success');
      fetchPosts();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleReject = async (postId) => {
    try {
      const check = await Swal.fire({
        title: 'Reject post?',
        text: "This will delete the submission permanent.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        confirmButtonColor: '#d33'
      });

      if (check.isConfirmed) {
        await lostFoundService.deletePost(postId, user);
        Swal.fire('Deleted!', 'Submission rejected and removed.', 'success');
        fetchPosts();
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleResolve = async (postId) => {
    try {
      await lostFoundService.resolvePost(postId, user.uid);
      Swal.fire('Resolved', 'Item marked as resolved/returned.', 'success');
      fetchPosts();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Filter listings
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesType = typeFilter === 'all' || post.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
            Lost & Found Desk
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Reclaim misplaced items and report findings
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<FiPlus />}
          onClick={() => setIsFormOpen(true)}
        >
          Report Item
        </Button>
      </div>

      {/* Report Form Component */}
      {isFormOpen && (
        <Card
          title="File Lost & Found Report"
          subtitle="Max 3 image attachments allowed"
          action={
            <button 
              onClick={() => {
                setIsFormOpen(false);
                setSelectedFiles([]);
                setPreviewUrls([]);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Item Name / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blue iPad Pro, Bunch of house keys"
                    {...register('title', { required: 'Item title is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Report Type
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="lost">Misplaced (Lost)</option>
                      <option value="found">Discovered (Found)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="documents">IDs / Documents</option>
                      <option value="keys">Keys</option>
                      <option value="clothing">Clothing</option>
                      <option value="bags">Bags / Wallets</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Approx. Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C-Block Canteen"
                      {...register('location', { required: 'Location is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Date Misplaced/Found
                    </label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details like color, brand, stickers, lockscreen wallpaper..."
                    {...register('description', { required: 'Description is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none"
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Multiple Upload Cards */}
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="flex-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl bg-slate-50 dark:bg-slate-900/35">
                  <FiUploadCloud className="text-4xl text-slate-450 dark:text-slate-550 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Attach Misplaced Pictures</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP formats. Up to 3 images total.</p>
                  
                  <input
                    type="file"
                    id="multiupload"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFilesChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="multiupload"
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-border cursor-pointer transition-all"
                  >
                    Select Images
                  </label>
                </div>

                {/* Previews Row */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/50 dark:border-dark-border">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-[10px] cursor-pointer"
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fileError && <p className="text-red-500 text-xs font-semibold text-center">{fileError}</p>}
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Submit Report
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-dark-border gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 tracking-wide cursor-pointer transition-all ${
            activeTab === 'all'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          All Postings
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 tracking-wide cursor-pointer transition-all ${
            activeTab === 'my'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Submissions
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('moderator')}
            className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 tracking-wide cursor-pointer transition-all relative ${
              activeTab === 'moderator'
                ? 'border-purple-500 text-purple-500'
                : 'border-transparent text-slate-400 hover:text-purple-400'
            }`}
          >
            Moderator Queue
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-black animate-pulse">
              Pending
            </span>
          </button>
        )}
      </div>

      {/* Search and category filters */}
      <Card title="Search & Filter Board" className="bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search by keyword, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="documents">IDs / Documents</option>
              <option value="keys">Keys</option>
              <option value="clothing">Clothing</option>
              <option value="bags">Bags / Wallets</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-dark-border bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Types (Lost & Found)</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid of Postings */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold">Loading bulletin posts...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6">
          <FiSlash className="text-4xl text-slate-350 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No items matching criteria</h4>
          <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
            We couldn't find any lost or found items under this filter. Submit a report to list it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            >
              
              {/* Image banner */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center border-b border-slate-100 dark:border-dark-border/40 overflow-hidden group">
                {post.imageUrls && post.imageUrls.length > 0 ? (
                  <img 
                    src={post.imageUrls[0]} 
                    alt="misplaced attachment" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-4 text-slate-400 text-xs text-center font-medium">No image attached</div>
                )}
                
                {/* Type Badge */}
                <span className={`absolute top-3 left-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-md ${
                  post.type === 'lost' ? 'bg-red-500 text-white' : 'bg-sky-500 text-white'
                }`}>
                  {post.type}
                </span>

                {/* Approval Status Badge in My Submissions */}
                {activeTab === 'my' && (
                  <span className={`absolute top-3 right-3 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-md ${
                    post.isApproved ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {post.isApproved ? 'Approved' : 'Pending Review'}
                  </span>
                )}

                {/* Images Count indicator if > 1 */}
                {post.imageUrls && post.imageUrls.length > 1 && (
                  <span className="absolute bottom-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold bg-black/60 text-white shadow-md">
                    +{post.imageUrls.length - 1} images
                  </span>
                )}
              </div>

              {/* Card info */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-primary-500 font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-550 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-dark-border/60">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <FiMapPin className="text-slate-405" />
                    <span className="truncate">{post.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <FiCalendar className="text-slate-405" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="pt-4 flex items-center justify-between gap-2.5 flex-wrap">
                  
                  {/* Moderator Access */}
                  {activeTab === 'moderator' && isAdmin ? (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="success" 
                        size="sm"
                        className="flex-1"
                        icon={<FiCheckCircle />}
                        onClick={() => handleApprove(post.id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        icon={<FiTrash2 />}
                        onClick={() => handleReject(post.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FiEye />}
                        onClick={() => {
                          setSelectedPost(post);
                          setCarouselIndex(0);
                        }}
                      >
                        View Details
                      </Button>
                      
                      {post.reporterId === user.uid && post.status === 'active' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={<FiCheckCircle />}
                          onClick={() => handleResolve(post.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      
                      {post.status === 'resolved' && (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200/40">
                          Resolved
                        </span>
                      )}
                    </>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Details & Contact Modal Overlay */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-float-none text-slate-800 dark:text-slate-200">
            
            {/* Close */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            {/* Title */}
            <div className="mb-4">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                selectedPost.type === 'lost' ? 'bg-red-500 text-white' : 'bg-sky-500 text-white'
              }`}>
                {selectedPost.type}
              </span>
              <h3 className="text-lg font-black font-display mt-2 text-slate-900 dark:text-white">
                {selectedPost.title}
              </h3>
            </div>

            {/* Images Carousel */}
            {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
              <div className="relative aspect-video bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-2 border border-slate-100 dark:border-dark-border/40">
                <img 
                  src={selectedPost.imageUrls[carouselIndex]} 
                  alt="attachment carousel" 
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
                
                {/* Prev & Next arrows if multiple images */}
                {selectedPost.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => setCarouselIndex((carouselIndex - 1 + selectedPost.imageUrls.length) % selectedPost.imageUrls.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      onClick={() => setCarouselIndex((carouselIndex + 1) % selectedPost.imageUrls.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer"
                    >
                      <FiChevronRight />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Info and contact details details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Details
                  </h5>
                  <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-dark-border/40">
                    {selectedPost.description}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FiMapPin className="text-slate-400" />
                    <span>{selectedPost.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FiCalendar className="text-slate-400" />
                    <span>{new Date(selectedPost.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border/40 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3 text-left">
                  <h5 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Reporter Contact Cell
                  </h5>
                  <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                    <FiUser className="text-slate-400 shrink-0" />
                    <span className="font-bold truncate">{selectedPost.reporterName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                    <FiMail className="text-slate-400 shrink-0" />
                    <span className="truncate font-semibold">{selectedPost.reporterContact}</span>
                  </div>
                </div>

                <div className="mt-6">
                  {/* Direct Contact Button */}
                  <a
                    href={`mailto:${selectedPost.reporterContact.split(' / ')[0]}?subject=SCMS: Regarding your post about "${selectedPost.title}"`}
                    className="w-full py-2.5 rounded-xl bg-gradient-primary text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <FiMail />
                    Send Direct Email
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
