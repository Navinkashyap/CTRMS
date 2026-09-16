import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../lib/authApi';

// Pass salesOnly for routes under /sales, so any role can view them.
// The main admin area (default) is off-limits to sales_manager accounts —
// they're bounced to their own /sales portal instead.
const ProtectedRoute = ({ children, salesOnly = false }) => {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  if (!isAuth) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!salesOnly && user.role === "sales_manager") {
    return <Navigate to="/sales" replace />;
  }

  return children;
};

export default ProtectedRoute;
