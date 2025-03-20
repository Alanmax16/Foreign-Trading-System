import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { hasRole } from '../store/slices/authSlice';

interface RoleRouteProps {
  component: React.ComponentType;
  requiredRole: string;
  redirectTo?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  component: Component, 
  requiredRole, 
  redirectTo = '/unauthorized'
}) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const userHasRole = useSelector((state: RootState) => hasRole(state, requiredRole));

  // If still loading auth state, show nothing (or could show a spinner)
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have the required role, redirect to unauthorized
  if (!userHasRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and has the required role, render the component
  return <Component />;
};

export default RoleRoute; 