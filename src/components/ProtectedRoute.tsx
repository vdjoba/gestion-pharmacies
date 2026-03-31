import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthRole, getAuthToken } from '../services/auth';
import { getDefaultRouteForRole, isDesktopShell } from '../services/runtime';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const token = getAuthToken();
  const role = getAuthRole();

  if (!token) {
    return <Navigate to={isDesktopShell() ? '/admin/login' : '/login'} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
