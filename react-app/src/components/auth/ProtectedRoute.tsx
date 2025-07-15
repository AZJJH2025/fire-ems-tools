import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiresAuth?: boolean;
}

/**
 * ProtectedRoute component that enforces authentication and authorization
 * 
 * Features:
 * - Redirects unauthenticated users to login page
 * - Supports role-based access control
 * - Preserves intended destination after login
 * - Shows loading state during auth check
 * - Handles authentication errors gracefully
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiresAuth = true 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // If authentication is required but user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated, check role requirements
  if (isAuthenticated && requiredRole) {
    const userRole = user?.role;
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole || '')
      : userRole === requiredRole;

    if (!hasRequiredRole) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          p={3}
        >
          <Alert 
            severity="error" 
            sx={{ maxWidth: 600 }}
          >
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2">
              You don't have the required permissions to access this page. 
              {Array.isArray(requiredRole) 
                ? ` Required roles: ${requiredRole.join(', ')}`
                : ` Required role: ${requiredRole}`
              }
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Your current role: {userRole || 'Unknown'}
            </Typography>
          </Alert>
        </Box>
      );
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;