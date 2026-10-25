import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredToken } from '../services/roamApi';

export const ProtectedRoute: React.FC = () => {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};
