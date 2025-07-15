import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

/**
 * Authentication status component for debugging
 * Shows current authentication state and route information
 */
const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        p: 2,
        minWidth: 300,
        zIndex: 10000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        fontSize: '0.875rem',
      }}
    >
      <Typography variant="h6" gutterBottom>
        🔒 Auth Status (Dev Only)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Status:</Typography>
          <Chip
            label={isLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            color={isLoading ? 'default' : isAuthenticated ? 'success' : 'error'}
            size="small"
          />
        </Box>
        
        {user && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">User:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {user.name}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Email:</Typography>
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Role:</Typography>
              <Chip
                label={user.role}
                color={user.role === 'super_admin' || user.role === 'admin' ? 'warning' : 'primary'}
                size="small"
              />
            </Box>
            
            {user.has_temp_password && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Password:</Typography>
                <Chip label="Temporary" color="warning" size="small" />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Department:</Typography>
              <Typography variant="body2">{user.department_name || 'N/A'}</Typography>
            </Box>
          </>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Route:</Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {location.pathname}
          </Typography>
        </Box>
        
        {location.state?.from && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Return to:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {location.state.from.pathname}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AuthStatus;