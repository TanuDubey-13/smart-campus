import { useMock, db } from '../firebase/config';
import { mockDb } from '../firebase/helpers';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export const eventService = {
  createEvent: async (eventData, adminUser) => {
    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      date: new Date(eventData.date).toISOString(),
      location: eventData.location,
      category: eventData.category,
      organizer: eventData.organizer,
      maxSeats: Number(eventData.maxSeats) || 100,
      registeredCount: 0,
      registeredStudents: [],
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop',
      createdAt: new Date().toISOString()
    };

    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const created = mockDb.add('events', newEvent);
      
      // Log Action
      mockDb.add('activityLogs', {
        userId: adminUser.uid,
        userName: adminUser.name,
        userRole: 'admin',
        action: 'CREATE_EVENT',
        details: `Created campus event: "${eventData.title}"`
      });

      return created;
    } else {
      const docRef = await addDoc(collection(db, 'events'), newEvent);
      return { id: docRef.id, ...newEvent };
    }
  },

  getEvents: async () => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockDb.get('events');
    } else {
      const q = query(collection(db, 'events'), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  registerForEvent: async (eventId, userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const events = mockDb.get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        const event = events[idx];
        if (event.registeredStudents.includes(userId)) {
          throw new Error('You are already registered.');
        }
        if (event.registeredCount >= event.maxSeats) {
          throw new Error('Seats are full.');
        }

        const updated = {
          ...event,
          registeredCount: event.registeredCount + 1,
          registeredStudents: [...event.registeredStudents, userId]
        };
        events[idx] = updated;
        mockDb.save('events', events);
        return updated;
      }
      throw new Error('Event not found.');
    } else {
      // Firebase update details omitted here for mock integration, but follows same format
      const docRef = doc(db, 'events', eventId);
      // ...
    }
  },

  unregisterFromEvent: async (eventId, userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const events = mockDb.get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        const event = events[idx];
        if (!event.registeredStudents.includes(userId)) {
          throw new Error('You are not registered.');
        }

        const updated = {
          ...event,
          registeredCount: Math.max(0, event.registeredCount - 1),
          registeredStudents: event.registeredStudents.filter(id => id !== userId)
        };
        events[idx] = updated;
        mockDb.save('events', events);
        return updated;
      }
      throw new Error('Event not found.');
    } else {
      const docRef = doc(db, 'events', eventId);
      // ...
    }
  },

  deleteEvent: async (eventId, adminUser) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const events = mockDb.get('events');
      const found = events.find(e => e.id === eventId);
      mockDb.delete('events', eventId);
      if (found) {
        mockDb.add('activityLogs', {
          userId: adminUser.uid,
          userName: adminUser.name,
          userRole: 'admin',
          action: 'DELETE_EVENT',
          details: `Deleted event: "${found.title}"`
        });
      }
      return true;
    } else {
      const docRef = doc(db, 'events', eventId);
      await deleteDoc(docRef);
      return true;
    }
  }
};
