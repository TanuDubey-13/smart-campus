import { useMock, auth, db } from '../firebase/config';
import { mockDb, initializeMockDatabase } from '../firebase/helpers';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  updatePassword as fbUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Initialize mock DB if in mock mode
if (useMock) {
  initializeMockDatabase();
}

export const authService = {
  login: async (email, password) => {
    if (useMock) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const users = mockDb.get('users');
      // In a real mock, we match email. We can use a simple password scheme:
      // student@campus.edu -> password123
      // admin@campus.edu -> admin123
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found. Try student@campus.edu or admin@campus.edu.');
      }
      
      const expectedPassword = email === 'admin@campus.edu' ? 'admin123' : 'password123';
      if (password !== expectedPassword && password !== 'password123') {
        throw new Error('Invalid credentials. Password incorrect.');
      }
      
      // Log Activity
      mockDb.add('activityLogs', {
        userId: foundUser.uid,
        userName: foundUser.name,
        userRole: foundUser.role,
        action: 'LOGIN',
        details: `${foundUser.name} logged in successfully (Mock Mode)`
      });

      return foundUser;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User profile does not exist in Firestore.');
      }
      
      const userData = userDoc.data();
      // Log activity
      try {
        await setDoc(doc(db, 'activityLogs', Math.random().toString(36).substring(2, 11)), {
          userId: userCredential.user.uid,
          userName: userData.name,
          userRole: userData.role,
          action: 'LOGIN',
          details: `${userData.name} logged in successfully`,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to log login action in Firestore:', err);
      }
      
      return { uid: userCredential.user.uid, ...userData, isVerified: userCredential.user.emailVerified };
    }
  },

  register: async (email, password, profileDetails) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const users = mockDb.get('users');
      if (users.some(u => u.email === email)) {
        throw new Error('Email is already registered.');
      }

      const uid = 'mock-user-' + Math.random().toString(36).substring(2, 9);
      const newProfile = {
        uid,
        email,
        name: profileDetails.name,
        role: 'student', // Default to student
        department: profileDetails.department,
        semester: profileDetails.semester,
        phoneNumber: profileDetails.phoneNumber || '',
        profilePicUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', // Default avatar
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newProfile);
      mockDb.save('users', users);

      // Log activity
      mockDb.add('activityLogs', {
        userId: uid,
        userName: newProfile.name,
        userRole: 'student',
        action: 'REGISTER',
        details: `Student account registered: ${newProfile.name}`
      });

      return newProfile;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const profile = {
        uid,
        email,
        name: profileDetails.name,
        role: 'student', // Admin can only be created manually in DB for security
        department: profileDetails.department,
        semester: profileDetails.semester,
        phoneNumber: profileDetails.phoneNumber || '',
        profilePicUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save profile to Firestore
      await setDoc(doc(db, 'users', uid), profile);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Log activity
      await setDoc(doc(db, 'activityLogs', Math.random().toString(36).substring(2, 11)), {
        userId: uid,
        userName: profile.name,
        userRole: 'student',
        action: 'REGISTER',
        details: `Student registered: ${profile.name}`,
        timestamp: new Date().toISOString()
      });

      return { uid, ...profile, isVerified: false };
    }
  },

  logout: async () => {
    if (useMock) {
      return true;
    } else {
      await signOut(auth);
      return true;
    }
  },

  updateProfile: async (uid, updatedFields) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updated = mockDb.update('users', uid, updatedFields);
      if (!updated) throw new Error('User not found.');
      return updated;
    } else {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...updatedFields,
        updatedAt: new Date().toISOString()
      });
      return { uid, ...updatedFields };
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    if (useMock) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return true;
    } else {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated.');
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await fbUpdatePassword(user, newPassword);
      return true;
    }
  },

  getCurrentUser: async (uid) => {
    if (useMock) {
      const users = mockDb.get('users');
      return users.find(u => u.uid === uid) || null;
    } else {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() };
      }
      return null;
    }
  }
};
