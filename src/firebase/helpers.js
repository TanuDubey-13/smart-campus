// Seed default data for Local Mock Mode to make testing out-of-the-box easy
const DEFAULT_EMERGENCY_CONTACTS = [
  { id: '1', name: 'Campus Security Main Gate', number: '+1-555-0199', category: 'emergency', icon: 'security' },
  { id: '2', name: 'Student Health Center (Hospital)', number: '+1-555-0120', category: 'medical', icon: 'hospital' },
  { id: '3', name: 'Campus Fire & Safety Office', number: '+1-555-0144', category: 'emergency', icon: 'fire' },
  { id: '4', name: 'Anti-Ragging Helpline (24/7)', number: '1800-180-5522', category: 'helpline', icon: 'info' },
  { id: '5', name: 'Women Helpline Cell', number: '+1-555-0188', category: 'helpline', icon: 'female' },
  { id: '6', name: 'IT Support Desk', number: '+1-555-0100', category: 'helpline', icon: 'support' },
];

const DEFAULT_USERS = [
  {
    uid: 'mock-student-id-123',
    email: 'student@campus.edu',
    name: 'Alex Johnson',
    role: 'student',
    department: 'CSE',
    semester: '5',
    phoneNumber: '+1-555-0177',
    profilePicUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'mock-admin-id-999',
    email: 'admin@campus.edu',
    name: 'Dr. Sarah Jenkins (Dean CSE)',
    role: 'admin',
    department: 'CSE',
    semester: 'N/A',
    phoneNumber: '+1-555-0111',
    profilePicUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_NOTICES = [
  {
    id: 'n1',
    title: 'End Semester Examinations Timetable Released',
    content: 'The end-semester practical and theory exams are scheduled to begin on November 20, 2026. Please check the official portal and download the date sheet from the department page. Make sure all fees are cleared to avoid hall ticket issues.',
    summary: 'End semester examinations begin November 20, 2026. Students must clear fee arrears to receive hall tickets.',
    category: 'exams',
    isPinned: true,
    createdBy: 'mock-admin-id-999',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'n2',
    title: 'Urgent: Anti-Ragging Affidavit Submission',
    content: 'All 1st and 2nd-year B.Tech students are strictly instructed to submit their signed anti-ragging affidavit to the administrative office by the end of this week. Failure to submit will result in suspension from classes.',
    summary: '1st and 2nd-year B.Tech students must submit signed anti-ragging affidavits by the end of this week.',
    category: 'emergency',
    isPinned: true,
    createdBy: 'mock-admin-id-999',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'n3',
    title: 'Google Hackathon Event Registration Open',
    content: 'The CSE Department is organizing a 24-hour campus hackathon sponsored by Google. Win cash prizes worth $5000 and internship opportunities. Registrations are open to CSE/ECE students.',
    summary: '24-hour campus hackathon sponsored by Google. Win cash prizes and internship slots. open to CSE/ECE students.',
    category: 'academic',
    isPinned: false,
    createdBy: 'mock-admin-id-999',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'e1',
    title: 'DevHack 2026: Annual Campus Hackathon',
    description: 'Showcase your engineering skills at the largest annual programming sprint! Form a team of 2-4 and build solutions for real-world issues. Food and refreshments will be provided. Pagers, servers, and cloud credits sponsored by Google Cloud.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
    location: 'Main Auditorium, Block C',
    category: 'technical',
    organizer: 'CSE Club',
    maxSeats: 150,
    registeredCount: 42,
    registeredStudents: ['mock-student-id-123'],
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'e2',
    title: 'Mental Health Seminar: Coping with Exam Stress',
    description: 'Join us for a relaxing and educational panel discussion on managing stress, keeping a balanced sleep schedule, and optimizing studies before exams. Conducted by Dr. Michael Vance from Health Services.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
    location: 'Seminar Hall 2, Block A',
    category: 'workshop',
    organizer: 'Student Wellness Cell',
    maxSeats: 80,
    registeredCount: 78,
    registeredStudents: [],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_COMPLAINTS = [
  {
    id: 'c1',
    title: 'WiFi Connection Broken in Hostel Block B',
    description: 'The WiFi router on the 3rd floor of Hostel Block B is failing to distribute IP addresses. It shows a orange indicator light. Many students are unable to access academic materials for exams.',
    category: 'maintenance',
    priority: 'high',
    status: 'in-progress',
    imageUrl: '',
    studentId: 'mock-student-id-123',
    studentName: 'Alex Johnson',
    adminResponse: 'Assigned to IT Network engineers. They are scheduled to replace the hardware router on Friday.',
    adminId: 'mock-admin-id-999',
    timeline: [
      { status: 'pending', message: 'Complaint submitted by Alex Johnson', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { status: 'in-progress', message: 'Assigned to maintenance technician', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c2',
    title: 'Lab Computer #14 Screen Flickering',
    description: 'The monitor connected to lab system #14 in CSE Lab 3 is flickering constantly, making it impossible to work on coding assignments.',
    category: 'academic',
    priority: 'low',
    status: 'resolved',
    imageUrl: '',
    studentId: 'mock-student-id-123',
    studentName: 'Alex Johnson',
    adminResponse: 'VGA cable replaced. Monitor display is now stable and functional.',
    adminId: 'mock-admin-id-999',
    timeline: [
      { status: 'pending', message: 'Complaint submitted', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'resolved', message: 'Resolution remarks: VGA cable replaced.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_LOST_FOUND = [
  {
    id: 'lf1',
    title: 'Found: Black Leather Wallet',
    description: 'Found a black leather wallet near the basketball court yesterday evening. It contains some ID cards and cash. Contact to verify ownership details.',
    type: 'found',
    category: 'others',
    location: 'Basketball Court',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    imageUrls: ['https://images.unsplash.com/photo-1627124118123-047b472c102b?w=400&h=300&fit=crop'],
    reporterId: 'mock-student-id-123',
    reporterName: 'Alex Johnson',
    reporterContact: 'alex.student@campus.edu / +1-555-0177',
    status: 'active',
    isApproved: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lf2',
    title: 'Lost: iPad Pro with Pencil',
    description: 'Lost my space gray iPad Pro (11-inch) with a white Apple Pencil. It has a green silicon cover case. Probably left in the library room 204 or seminar block.',
    type: 'lost',
    category: 'electronics',
    location: 'Library Room 204',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrls: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'],
    reporterId: 'mock-student-id-123',
    reporterName: 'Alex Johnson',
    reporterContact: '+1-555-0177',
    status: 'active',
    isApproved: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_LOGS = [
  {
    id: 'l1',
    userId: 'mock-student-id-123',
    userName: 'Alex Johnson',
    userRole: 'student',
    action: 'LOGIN',
    details: 'Student logged in successfully from Firefox browser.',
    timestamp: new Date().toISOString()
  }
];

export const initializeMockDatabase = () => {
  if (!localStorage.getItem('scms_users')) {
    localStorage.setItem('scms_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('scms_notices')) {
    localStorage.setItem('scms_notices', JSON.stringify(DEFAULT_NOTICES));
  }
  if (!localStorage.getItem('scms_events')) {
    localStorage.setItem('scms_events', JSON.stringify(DEFAULT_EVENTS));
  }
  if (!localStorage.getItem('scms_complaints')) {
    localStorage.setItem('scms_complaints', JSON.stringify(DEFAULT_COMPLAINTS));
  }
  if (!localStorage.getItem('scms_lostFound')) {
    localStorage.setItem('scms_lostFound', JSON.stringify(DEFAULT_LOST_FOUND));
  }
  if (!localStorage.getItem('scms_emergencyContacts')) {
    localStorage.setItem('scms_emergencyContacts', JSON.stringify(DEFAULT_EMERGENCY_CONTACTS));
  }
  if (!localStorage.getItem('scms_activityLogs')) {
    localStorage.setItem('scms_activityLogs', JSON.stringify(DEFAULT_LOGS));
  }
  console.log('📦 Mock database initialized in localStorage.');
};

// Access mock database collections with standard CRUD helper API
export const mockDb = {
  get: (collection) => {
    return JSON.parse(localStorage.getItem(`scms_${collection}`) || '[]');
  },
  save: (collection, data) => {
    localStorage.setItem(`scms_${collection}`, JSON.stringify(data));
  },
  add: (collection, item) => {
    const items = mockDb.get(collection);
    const newItem = {
      id: item.id || Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...item
    };
    items.unshift(newItem); // New items first
    mockDb.save(collection, items);
    return newItem;
  },
  update: (collection, id, updatedFields) => {
    const items = mockDb.get(collection);
    const index = items.findIndex(item => item.id === id || item.uid === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedFields, updatedAt: new Date().toISOString() };
      mockDb.save(collection, items);
      return items[index];
    }
    return null;
  },
  delete: (collection, id) => {
    const items = mockDb.get(collection);
    const filtered = items.filter(item => item.id !== id && item.uid !== id);
    mockDb.save(collection, filtered);
    return true;
  }
};
