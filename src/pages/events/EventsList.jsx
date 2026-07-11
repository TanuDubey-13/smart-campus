import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { eventService } from '../../services/eventService';
import CountdownTimer from '../../components/dashboard/CountdownTimer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiClock,
  FiTrash2, 
  FiCheckCircle, 
  FiAward,
  FiLoader
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function EventsList() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      organizer: '',
      location: '',
      date: '',
      maxSeats: 100,
      category: 'technical',
      imageUrl: '',
    }
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents();
      // Sort: closest date first
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await eventService.createEvent(data, user);
      Swal.fire({
        icon: 'success',
        title: 'Event Created',
        text: 'The campus event has been scheduled successfully.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      reset();
      setIsFormOpen(false);
      fetchEvents();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Scheduling Failed',
        text: err.message || 'An error occurred.',
        background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterToggle = async (event) => {
    const isRegistered = event.registeredStudents.includes(user.uid);
    try {
      if (isRegistered) {
        await eventService.unregisterFromEvent(event.id, user.uid);
        Swal.fire({
          icon: 'success',
          title: 'Unregistered',
          text: `You have successfully cancelled registration for ${event.title}.`,
          background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
      } else {
        await eventService.registerForEvent(event.id, user.uid);
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: `Congratulations! You have booked a seat for ${event.title}.`,
          background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
      }
      fetchEvents();
    } catch (err) {
      Swal.fire('Failed', err.message, 'error');
    }
  };

  const handleDelete = async (eventId) => {
    const check = await Swal.fire({
      title: 'Delete Event?',
      text: 'This event will be deleted permanent from campus schedules.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#d33',
      background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (check.isConfirmed) {
      try {
        await eventService.deleteEvent(eventId, user);
        Swal.fire('Deleted', 'Event has been cancelled and removed.', 'success');
        fetchEvents();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  // Mock Certificate Download
  const handleDownloadCertificate = (evtTitle) => {
    Swal.fire({
      title: 'Generate Certificate',
      text: `Generating participation credential for ${user.name}...`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      willClose: () => {
        Swal.fire({
          icon: 'success',
          title: 'Certificate Downloaded!',
          text: `Successfully downloaded participate certificate for "${evtTitle}". [Credential ID: SCMS-EVT-${Math.floor(100000 + Math.random() * 900000)}]`,
          background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
          color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
      }
    });
  };

  // Filter listings
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Nearest event countdown (only for events in future)
  const futureEvents = events.filter(e => new Date(e.date) > new Date());
  const featuredEvent = futureEvents.length > 0 ? futureEvents[0] : null;

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
            Campus Events Calendar
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
            Register for B.Tech workshops and hackathons
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={<FiPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Create Event Post
          </Button>
        )}
      </div>

      {/* Slide-Down Event Creator Form Card */}
      {isAdmin && isFormOpen && (
        <Card
          title="Schedule Campus Event"
          subtitle="All scheduled events will have live registration tracking"
          action={
            <button 
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google Cloud Code Sprint"
                    {...register('title', { required: 'Event title is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Organizer Cell
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CSE Club"
                      {...register('organizer', { required: 'Organizer is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                    {errors.organizer && <p className="text-red-500 text-xs mt-1">{errors.organizer.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm cursor-pointer"
                    >
                      <option value="technical">Technical</option>
                      <option value="cultural">Cultural</option>
                      <option value="sports">Sports</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Event Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      {...register('date', { required: 'Event date is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm cursor-pointer"
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Max Seats (Capacity)
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      {...register('maxSeats', { required: 'Seat capacity is required', min: 1 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Campus Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Block C Hall A"
                      {...register('location', { required: 'Location is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Banner Image Link
                    </label>
                    <input
                      type="text"
                      placeholder="https://unsplash.com/..."
                      {...register('imageUrl')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Event Guidelines & Description
                </label>
                <textarea
                  rows={9}
                  placeholder="Provide detailed instructions, prerequisites, event scheduling, coordinates, prize configurations..."
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none"
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-dark-border pt-4">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={submitting}>
                Publish Event
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Featured Event Countdown Hero Card */}
      {featuredEvent && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-500 via-secondary-500 to-transparent"></div>
          
          <div className="relative z-10 space-y-4 max-w-lg text-left">
            <span className="text-[10px] bg-primary-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Featured Next Event
            </span>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight">
              {featuredEvent.title}
            </h3>
            <p className="text-slate-350 text-xs md:text-sm line-clamp-2 leading-relaxed">
              {featuredEvent.description}
            </p>
            <div className="flex gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><FiMapPin /> {featuredEvent.location}</span>
              <span className="flex items-center gap-1.5"><FiClock /> {new Date(featuredEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="shrink-0 text-left relative z-10 w-full md:w-auto">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Registration Closes In:</p>
            <CountdownTimer targetDate={featuredEvent.date} />
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleRegisterToggle(featuredEvent)}
              >
                {featuredEvent.registeredStudents.includes(user.uid) ? 'Cancel Registration' : 'Register Seat'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <Card title="Search Events Calendar" className="bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search by keyword, organizer..."
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
              <option value="all">All Event Categories</option>
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
          <FiLoader className="w-8 h-8 animate-spin text-primary-500 mb-2" />
          <span className="text-xs font-semibold">Loading events calendar...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-8">No scheduled events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const isRegistered = evt.registeredStudents.includes(user.uid);
            const isSeatsFull = evt.registeredCount >= evt.maxSeats;
            const eventDate = new Date(evt.date);
            const isCompleted = eventDate < new Date();
            const seatsUtilizationPercent = Math.min(100, Math.floor((evt.registeredCount / evt.maxSeats) * 100));

            return (
              <div 
                key={evt.id}
                className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                
                {/* Banner */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-900">
                  <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow bg-primary-500 text-white">
                    {evt.category}
                  </span>
                  {isCompleted && (
                    <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow bg-slate-800 text-slate-350">
                      Completed
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 text-left space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2.5 pt-2 text-[10px] text-slate-500 dark:text-slate-405 font-semibold">
                      <span className="flex items-center gap-1"><FiMapPin className="text-slate-400 shrink-0" /> {evt.location}</span>
                      <span className="flex items-center gap-1"><FiUsers className="text-slate-400 shrink-0" /> By {evt.organizer}</span>
                      <span className="flex items-center gap-1"><FiCalendar className="text-slate-400 shrink-0" /> {eventDate.toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><FiClock className="text-slate-400 shrink-0" /> {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Seat availability progress bar */}
                  {!isCompleted && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-dark-border/40">
                      <div className="flex justify-between text-[10px] font-bold text-slate-450 dark:text-slate-550">
                        <span>Booked Seats ({evt.registeredCount}/{evt.maxSeats})</span>
                        <span>{seatsUtilizationPercent}% Filled</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full rounded-full transition-all duration-550" 
                          style={{ width: `${seatsUtilizationPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Button actions */}
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-dark-border/40 flex-wrap">
                    {isCompleted ? (
                      <>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                          Event Finished
                        </span>
                        {isRegistered && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<FiAward className="text-purple-500" />}
                            onClick={() => handleDownloadCertificate(evt.title)}
                          >
                            Certificate
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {isAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 dark:border-red-950/30 text-red-500 hover:bg-red-500/10"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(evt.id)}
                          >
                            Cancel Event
                          </Button>
                        ) : (
                          <Button
                            variant={isRegistered ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={!isRegistered && isSeatsFull}
                            onClick={() => handleRegisterToggle(evt)}
                          >
                            {isRegistered ? 'Cancel Registration' : isSeatsFull ? 'Seats Full' : 'Book Seat'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
