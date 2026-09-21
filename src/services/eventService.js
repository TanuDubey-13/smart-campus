import { useMock, db } from '../firebase/config';
import { mockDb } from '../firebase/helpers';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

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
      try {
        const q = query(collection(db, 'events'));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      } catch (err) {
        console.error('getEvents error:', err);
        return [];
      }
    }
  },

  registerForEvent: async (eventId, userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const events = mockDb.get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        const event = events[idx];
        const registered = event.registeredStudents || [];
        if (registered.includes(userId)) {
          throw new Error('You are already registered.');
        }
        if (event.registeredCount >= event.maxSeats) {
          throw new Error('Seats are full.');
        }

        const updated = {
          ...event,
          registeredCount: event.registeredCount + 1,
          registeredStudents: [...registered, userId]
        };
        events[idx] = updated;
        mockDb.save('events', events);
        return updated;
      }
      throw new Error('Event not found.');
    } else {
      const docRef = doc(db, 'events', eventId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) throw new Error('Event not found.');
      const data = snap.data();
      const registered = data.registeredStudents || [];
      if (registered.includes(userId)) {
        throw new Error('You are already registered.');
      }
      if ((data.registeredCount || 0) >= (data.maxSeats || 100)) {
        throw new Error('Seats are full.');
      }
      await updateDoc(docRef, {
        registeredStudents: arrayUnion(userId),
        registeredCount: increment(1)
      });
      return { 
        id: eventId, 
        ...data, 
        registeredStudents: [...registered, userId], 
        registeredCount: (data.registeredCount || 0) + 1 
      };
    }
  },

  unregisterFromEvent: async (eventId, userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const events = mockDb.get('events');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        const event = events[idx];
        const registered = event.registeredStudents || [];
        if (!registered.includes(userId)) {
          throw new Error('You are not registered.');
        }

        const updated = {
          ...event,
          registeredCount: Math.max(0, event.registeredCount - 1),
          registeredStudents: registered.filter(id => id !== userId)
        };
        events[idx] = updated;
        mockDb.save('events', events);
        return updated;
      }
      throw new Error('Event not found.');
    } else {
      const docRef = doc(db, 'events', eventId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) throw new Error('Event not found.');
      const data = snap.data();
      const registered = data.registeredStudents || [];
      if (!registered.includes(userId)) {
        throw new Error('You are not registered.');
      }
      await updateDoc(docRef, {
        registeredStudents: arrayRemove(userId),
        registeredCount: increment(-1)
      });
      return { 
        id: eventId, 
        ...data, 
        registeredStudents: registered.filter(id => id !== userId), 
        registeredCount: Math.max(0, (data.registeredCount || 0) - 1) 
      };
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
