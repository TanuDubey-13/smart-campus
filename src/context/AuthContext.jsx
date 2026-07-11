import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useMock, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    let unsubscribe = () => {};

    if (useMock) {
      // In mock mode, check localStorage for a saved user session
      const savedUser = localStorage.getItem('scms_session_user') || sessionStorage.getItem('scms_session_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      // In Firebase mode, listen to auth state changes
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            // Fetch latest user profile details
            const profile = await authService.getCurrentUser ? await authService.getCurrentUser(fbUser.uid) : null;
            if (profile) {
              setUser({ ...profile, isVerified: fbUser.emailVerified });
            } else {
              // fallback if get profile fails (e.g. registration step incomplete)
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                role: 'student',
                isVerified: fbUser.emailVerified
              });
            }
          } catch (error) {
            console.error('Error listening to auth state:', error);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('scms_session_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, profileDetails) => {
    setLoading(true);
    try {
      const newUser = await authService.register(email, password, profileDetails);
      // We don't automatically log them in if they need email verification
      if (useMock) {
        setUser(newUser);
        sessionStorage.setItem('scms_session_user', JSON.stringify(newUser));
      }
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('scms_session_user');
      sessionStorage.removeItem('scms_session_user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileDetails = async (uid, details) => {
    try {
      const updated = await authService.updateProfile(uid, details);
      const updatedUser = { ...user, ...updated };
      setUser(updatedUser);
      
      // Update saved session
      if (localStorage.getItem('scms_session_user')) {
        localStorage.setItem('scms_session_user', JSON.stringify(updatedUser));
      } else if (sessionStorage.getItem('scms_session_user')) {
        sessionStorage.setItem('scms_session_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const changeUserPassword = async (oldPassword, newPassword) => {
    return await authService.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfileDetails,
        changeUserPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
