import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
