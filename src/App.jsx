import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ComplaintsList from './pages/complaints/ComplaintsList';
import ComplaintDetails from './pages/complaints/ComplaintDetails';
import LostFoundList from './pages/lostfound/LostFoundList';
import NoticeBoard from './pages/notices/NoticeBoard';
import EventsList from './pages/events/EventsList';
import EmergencyContacts from './pages/emergency/EmergencyContacts';
import Profile from './pages/profile/Profile';

// Errors
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

// Toast Notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context consumer helper to resolve dashboards dynamically
function DashboardResolver() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* 1. Public Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              } 
            />
            <Route 
              path="/register" 
              element={
                <AuthLayout>
                  <Register />
                </AuthLayout>
              } 
            />

            {/* 2. Error and Warn Pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* 3. Protected Common Subpages */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <DashboardResolver />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <ComplaintsList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <ComplaintDetails />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/lost-found"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <LostFoundList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notices"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <NoticeBoard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <EventsList />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/emergency"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <EmergencyContacts />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* 4. Strict Admin Only Panel Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global toast container notifications */}
          <ToastContainer 
            position="bottom-right" 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop 
            closeOnClick 
            pauseOnHover 
            draggable 
            theme="colored"
          />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
