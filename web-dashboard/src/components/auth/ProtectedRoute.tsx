import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles: Array<'admin' | 'consumer'>;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  // Mock Auth Check
  const userJson = localStorage.getItem('user');
  const role = localStorage.getItem('role') as 'admin' | 'consumer';
  
  if (!userJson || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to their respective dashboard if they try to access wrong role path
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/consumer/dashboard'} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
