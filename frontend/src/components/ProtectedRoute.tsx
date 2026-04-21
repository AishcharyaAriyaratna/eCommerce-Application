import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // If empty, just requires authentication
}

/**
 * Protected route component that checks authentication and roles
 * Includes navigation menu on all protected pages
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['Supplier']}>
 *   <SupplierDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if specified
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {children}
    </div>
  );
};

export default ProtectedRoute;
