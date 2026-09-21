import { useMock, db } from '../firebase/config';
import { mockDb } from '../firebase/helpers';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export const lostFoundService = {
  createPost: async (postData, reporterUser) => {
    const newPost = {
      title: postData.title,
      description: postData.description,
      type: postData.type, // 'lost' or 'found'
      category: postData.category,
      location: postData.location,
      date: postData.date || new Date().toISOString(),
      imageUrls: postData.imageUrls || [], // Array of base64 images
      reporterId: reporterUser.uid,
      reporterName: reporterUser.name,
      reporterContact: `${reporterUser.email} / ${reporterUser.phoneNumber || 'N/A'}`,
      status: 'active',
      isApproved: reporterUser.role === 'admin', // Auto-approved if created by admin, else false (pending)
      createdAt: new Date().toISOString()
    };

    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const created = mockDb.add('lostFound', newPost);
      
      // Log Action
      mockDb.add('activityLogs', {
        userId: reporterUser.uid,
        userName: reporterUser.name,
        userRole: reporterUser.role,
        action: 'CREATE_LOST_FOUND',
        details: `Reported ${newPost.type} item: "${newPost.title}"`
      });

      return created;
    } else {
      const docRef = await addDoc(collection(db, 'lostFound'), newPost);
      return { id: docRef.id, ...newPost };
    }
  },

  getApprovedPosts: async () => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const items = mockDb.get('lostFound');
      return items.filter(item => item.isApproved && item.status === 'active');
    } else {
      try {
        const q = query(
          collection(db, 'lostFound'),
          where('isApproved', '==', true)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return list
          .filter(item => item.status === 'active')
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } catch (err) {
        console.error('getApprovedPosts error:', err);
        return [];
      }
    }
  },

  getPendingModeration: async () => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = mockDb.get('lostFound');
      return items.filter(item => !item.isApproved);
    } else {
      try {
        const q = query(
          collection(db, 'lostFound'),
          where('isApproved', '==', false)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } catch (err) {
        console.error('getPendingModeration error:', err);
        return [];
      }
    }
  },

  getMyPosts: async (userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = mockDb.get('lostFound');
      return items.filter(item => item.reporterId === userId);
    } else {
      try {
        const q = query(
          collection(db, 'lostFound'),
          where('reporterId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } catch (err) {
        console.error('getMyPosts error:', err);
        return [];
      }
    }
  },

  approvePost: async (id, adminUser) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const updated = mockDb.update('lostFound', id, { isApproved: true });
      if (updated) {
        mockDb.add('activityLogs', {
          userId: adminUser.uid,
          userName: adminUser.name,
          userRole: 'admin',
          action: 'MODERATE_POST',
          details: `Approved Lost & Found post: "${updated.title}"`
        });
      }
      return updated;
    } else {
      const docRef = doc(db, 'lostFound', id);
      await updateDoc(docRef, { isApproved: true });
      return { id, isApproved: true };
    }
  },

  resolvePost: async (id, userId) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const updated = mockDb.update('lostFound', id, { status: 'resolved' });
      return updated;
    } else {
      const docRef = doc(db, 'lostFound', id);
      await updateDoc(docRef, { status: 'resolved' });
      return { id, status: 'resolved' };
    }
  },

  deletePost: async (id, adminUser) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const items = mockDb.get('lostFound');
      const found = items.find(item => item.id === id);
      mockDb.delete('lostFound', id);
      if (found && adminUser) {
        mockDb.add('activityLogs', {
          userId: adminUser.uid,
          userName: adminUser.name,
          userRole: 'admin',
          action: 'DELETE_POST',
          details: `Deleted/Rejected Lost & Found post: "${found.title}"`
        });
      }
      return true;
    } else {
      const docRef = doc(db, 'lostFound', id);
      await deleteDoc(docRef);
      return true;
    }
  }
};
