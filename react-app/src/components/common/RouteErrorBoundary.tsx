import React from 'react';
import { Box, Typography, Button, Paper, Stack, Alert, Divider } from '@mui/material';
import { Home, Refresh, ArrowBack, ErrorOutline } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Route-level error boundary that provides navigation options
 * and context-aware error handling for different routes
 */
export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRouteContext = () => {
    const path = location.pathname;
    
    if (path.includes('/admin')) {
      return {
        title: 'Admin Panel Error',
        description: 'The admin panel encountered an error and cannot be displayed.',
        icon: <ErrorOutline color="error" />,
        suggestions: [
          'Check your admin permissions',
          'Try refreshing the page',
          'Contact system administrator',
        ],
      };
    }
    
    if (path.includes('/data-formatter')) {
      return {
        title: 'Data Formatter Error',
        description: 'The data formatter tool encountered an error.',
        icon: <ErrorOutline color="error" />,
        suggestions: [
          'Check your uploaded data format',
          'Try with a different CSV file',
          'Verify field mappings are correct',
        ],
      };
    }
    
    if (path.includes('/response-time-analyzer')) {
      return {
        title: 'Response Time Analyzer Error',
        description: 'The response time analyzer encountered an error.',
        icon: <ErrorOutline color="error" />,
        suggestions: [
          'Check your incident data format',
          'Verify time fields are properly mapped',
          'Try with a smaller dataset',
        ],
      };
    }
    
    if (path.includes('/fire-map-pro')) {
      return {
        title: 'Fire Map Pro Error',
        description: 'The fire mapping tool encountered an error.',
        icon: <ErrorOutline color="error" />,
        suggestions: [
          'Check your location data',
          'Verify latitude/longitude fields',
          'Try refreshing the map',
        ],
      };
    }
    
    if (path.includes('/water-supply-coverage')) {
      return {
        title: 'Water Supply Coverage Error',
        description: 'The water supply coverage tool encountered an error.',
        icon: <ErrorOutline color="error" />,
        suggestions: [
          'Check your hydrant/tank data',
          'Verify coordinate fields',
          'Try with valid geographic data',
        ],
      };
    }
    
    // Default route error
    return {
      title: 'Page Error',
      description: 'This page encountered an error and cannot be displayed.',
      icon: <ErrorOutline color="error" />,
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Go back to the previous page',
      ],
    };
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const RouteErrorFallback = () => {
    const context = getRouteContext();
    
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            border: '1px solid #f44336',
            borderRadius: 2,
          }}
        >
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
              {context.icon}
              <Typography variant="h4" color="error">
                {context.title}
              </Typography>
            </Box>

            <Alert severity="error" sx={{ textAlign: 'left' }}>
              {context.description}
            </Alert>

            <Box>
              <Typography variant="h6" gutterBottom>
                What you can try:
              </Typography>
              <Stack spacing={1} sx={{ textAlign: 'left' }}>
                {context.suggestions.map((suggestion, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {suggestion}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
              >
                Go Back
              </Button>
              
              <Button
                variant="outlined"
                color="info"
                startIcon={<Home />}
                onClick={handleGoHome}
              >
                Home
              </Button>
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Current Route: <code>{location.pathname}</code>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    );
  };

  return (
    <ErrorBoundary
      level="page"
      fallback={<RouteErrorFallback />}
      showErrorDetails={import.meta.env.DEV}
      onError={(error, errorInfo) => {
        // Log route-specific error context
        console.error('Route Error:', {
          route: location.pathname,
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;