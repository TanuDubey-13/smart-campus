import { useMock, db } from '../firebase/config';
import { mockDb } from '../firebase/helpers';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export const noticeService = {
  createNotice: async (noticeData, adminUser) => {
    const newNotice = {
      title: noticeData.title,
      content: noticeData.content,
      summary: noticeData.summary || '',
      category: noticeData.category,
      isPinned: noticeData.isPinned || false,
      createdBy: adminUser.uid,
      createdAt: new Date().toISOString()
    };

    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const created = mockDb.add('notices', newNotice);

      // Log Action
      mockDb.add('activityLogs', {
        userId: adminUser.uid,
        userName: adminUser.name,
        userRole: 'admin',
        action: 'CREATE_NOTICE',
        details: `Published notice: "${noticeData.title}"`
      });

      return created;
    } else {
      const docRef = await addDoc(collection(db, 'notices'), newNotice);
      return { id: docRef.id, ...newNotice };
    }
  },

  getNotices: async () => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockDb.get('notices');
    } else {
      const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  deleteNotice: async (id, adminUser) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const notices = mockDb.get('notices');
      const found = notices.find(n => n.id === id);
      mockDb.delete('notices', id);
      if (found) {
        mockDb.add('activityLogs', {
          userId: adminUser.uid,
          userName: adminUser.name,
          userRole: 'admin',
          action: 'DELETE_NOTICE',
          details: `Deleted notice: "${found.title}"`
        });
      }
      return true;
    } else {
      const docRef = doc(db, 'notices', id);
      await deleteDoc(docRef);
      return true;
    }
  }
};
