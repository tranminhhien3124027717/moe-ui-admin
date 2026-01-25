import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminGuard = () => {
  const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminGuard;