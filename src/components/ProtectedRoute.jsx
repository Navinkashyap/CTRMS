import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../lib/authApi';

const ProtectedRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  if (!isAuth) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  // Authorize admin check - ensures the user object exists
  // Additional role-based checks can be added here if there are multiple user types
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
