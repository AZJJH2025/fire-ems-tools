import React from 'react';
import { Box, Typography, Paper, Button } from '@material-ui/core';
import { useData, ActionTypes } from '../context/DataContext';

const ErrorDisplay = ({ error }) => {
  const { dispatch } = useData();
  
  const handleRetry = () => {
    // Clear error and set loading to true to trigger a retry
    dispatch({ type: ActionTypes.SET_ERROR, payload: null });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    // Additional logic for specific retry scenarios could be added here
  };
  
  return (
    <Paper elevation={3} style={{ padding: 24, margin: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
      <Box textAlign="center" p={2}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Component
        </Typography>
        
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Please check your network connection and try again. If the problem persists, contact support.
        </Typography>
        
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRetry}
          >
            Retry
          </Button>
          
          <Button 
            variant="outlined"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ErrorDisplay;