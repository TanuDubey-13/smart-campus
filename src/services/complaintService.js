import { useMock, db } from '../firebase/config';
import { mockDb } from '../firebase/helpers';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';

export const complaintService = {
  createComplaint: async (complaintData, studentUser) => {
    const newComplaint = {
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      priority: complaintData.priority,
      status: 'pending',
      imageUrl: complaintData.imageUrl || '',
      studentId: studentUser.uid,
      studentName: studentUser.name,
      adminResponse: '',
      adminId: '',
      timeline: [
        {
          status: 'pending',
          message: `Complaint ticket created by ${studentUser.name}`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const created = mockDb.add('complaints', newComplaint);
      
      // Log Action
      mockDb.add('activityLogs', {
        userId: studentUser.uid,
        userName: studentUser.name,
        userRole: 'student',
        action: 'CREATE_COMPLAINT',
        details: `Created complaint: "${complaintData.title}"`
      });

      return created;
    } else {
      const docRef = await addDoc(collection(db, 'complaints'), newComplaint);
      return { id: docRef.id, ...newComplaint };
    }
  },

  getComplaints: async (userId, userRole) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const complaints = mockDb.get('complaints');
      const list = userRole === 'admin' ? complaints : complaints.filter(c => c.studentId === userId);
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      try {
        let q;
        if (userRole === 'admin') {
          q = query(collection(db, 'complaints'));
        } else {
          q = query(
            collection(db, 'complaints'), 
            where('studentId', '==', userId)
          );
        }
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } catch (err) {
        console.error('getComplaints error:', err);
        return [];
      }
    }
  },

  getComplaintById: async (id) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const complaints = mockDb.get('complaints');
      const found = complaints.find(c => c.id === id);
      if (!found) throw new Error('Complaint not found.');
      return found;
    } else {
      const docRef = doc(db, 'complaints', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) throw new Error('Complaint not found.');
      return { id: snapshot.id, ...snapshot.data() };
    }
  },

  updateComplaintStatus: async (id, status, adminResponse, adminUser) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const complaints = mockDb.get('complaints');
      const complaintIndex = complaints.findIndex(c => c.id === id);
      
      if (complaintIndex !== -1) {
        const complaint = complaints[complaintIndex];
        const newTimelineEvent = {
          status,
          message: `Status updated to ${status} by ${adminUser.name}. Remarks: ${adminResponse}`,
          timestamp: new Date().toISOString()
        };
        
        const updated = {
          ...complaint,
          status,
          adminResponse,
          adminId: adminUser.uid,
          timeline: [...complaint.timeline, newTimelineEvent],
          updatedAt: new Date().toISOString()
        };
        
        complaints[complaintIndex] = updated;
        mockDb.save('complaints', complaints);

        // Log action
        mockDb.add('activityLogs', {
          userId: adminUser.uid,
          userName: adminUser.name,
          userRole: 'admin',
          action: 'RESOLVE_COMPLAINT',
          details: `Updated complaint "${complaint.title}" status to "${status}"`
        });

        return updated;
      }
      throw new Error('Complaint not found.');
    } else {
      const docRef = doc(db, 'complaints', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Complaint not found.');
      
      const complaintData = docSnap.data();
      const newTimelineEvent = {
        status,
        message: `Status updated to ${status} by ${adminUser.name}. Remarks: ${adminResponse}`,
        timestamp: new Date().toISOString()
      };

      const updateData = {
        status,
        adminResponse,
        adminId: adminUser.uid,
        timeline: [...(complaintData.timeline || []), newTimelineEvent],
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updateData);
      return { id, ...complaintData, ...updateData };
    }
  }
};
