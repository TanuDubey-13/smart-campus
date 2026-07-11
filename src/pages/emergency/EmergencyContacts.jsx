import React, { useEffect, useState } from 'react';
import { mockDb } from '../../firebase/helpers';
import Card from '../../components/common/Card';
import { 
  FiSearch, 
  FiPhoneCall, 
  FiAlertCircle, 
  FiHeart, 
  FiShield, 
  FiInfo, 
  FiPlus, 
  FiCheckCircle 
} from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const data = mockDb.get('emergencyContacts');
    setContacts(data);
    setFilteredContacts(data);
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...contacts];

    if (searchTerm) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.number.includes(searchTerm)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(c => c.category === categoryFilter);
    }

    setFilteredContacts(result);
  }, [searchTerm, categoryFilter, contacts]);

  const handleCallToast = (name, number) => {
    Swal.fire({
      title: 'Connecting Call...',
      text: `Mocking cellular connection call to ${name} (${number})`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'security':
        return <FiShield className="text-xl text-primary-500" />;
      case 'hospital':
        return <FiHeart className="text-xl text-red-500" />;
      case 'fire':
        return <FiAlertCircle className="text-xl text-amber-500" />;
      default:
        return <FiInfo className="text-xl text-sky-500" />;
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black font-display text-slate-800 dark:text-white tracking-tight">
          Campus Emergency Directory
        </h2>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
          24/7 Support cell and security helpline numbers
        </p>
      </div>

      {/* Filters */}
      <Card title="Search Directory" className="bg-slate-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FiSearch className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search by contact name, department..."
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
              <option value="all">All Contacts</option>
              <option value="emergency">Critical Emergency</option>
              <option value="medical">Medical / Hospital</option>
              <option value="helpline">Helplines & Support</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Contacts Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredContacts.map((contact) => (
          <div 
            key={contact.id}
            className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-205 dark:border-dark-border shadow-xs flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl shrink-0">
                {getIcon(contact.icon)}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm truncate">
                  {contact.name}
                </h4>
                <p className="text-[11px] text-slate-405 dark:text-slate-500 mt-1 truncate">
                  Phone: {contact.number}
                </p>
                <span className={`inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  contact.category === 'emergency' ? 'bg-red-100 text-red-500 dark:bg-red-950/40' :
                  contact.category === 'medical' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40' :
                  'bg-sky-100 text-sky-500 dark:bg-sky-950/40'
                }`}>
                  {contact.category}
                </span>
              </div>
            </div>

            <a
              href={`tel:${contact.number}`}
              onClick={(e) => {
                e.preventDefault();
                handleCallToast(contact.name, contact.number);
              }}
              className="p-3 bg-primary-100 dark:bg-primary-950/40 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 text-primary-550 dark:text-primary-400 rounded-xl shrink-0 cursor-pointer transition-all shadow-sm"
              title={`Call ${contact.name}`}
            >
              <FiPhoneCall className="text-lg" />
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
