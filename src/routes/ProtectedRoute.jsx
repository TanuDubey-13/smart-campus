import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLoader } from 'react-icons/fi';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-slate-400">
        <FiLoader className="w-10 h-10 animate-spin text-primary-500 mb-4" />
        <span className="text-sm font-medium tracking-wide">Validating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
