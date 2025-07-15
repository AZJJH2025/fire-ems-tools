import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  restrictWhenAuthenticated?: boolean;
}

/**
 * PublicRoute component for pages that should be accessible to non-authenticated users
 * 
 * Features:
 * - Allows unauthenticated users to access the page
 * - Optionally redirects authenticated users to a different page
 * - Handles loading states during authentication check
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/',
  restrictWhenAuthenticated = false 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
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

  // If authenticated and this route should be restricted for authenticated users
  if (restrictWhenAuthenticated && isAuthenticated) {
    // Check if we have a return URL from the login state
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  // Allow access to the page
  return <>{children}</>;
};

export default PublicRoute;