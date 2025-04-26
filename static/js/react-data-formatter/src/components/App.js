import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Button } from '@material-ui/core';
import { useData } from '../context/DataContext';
import ColumnMappingUI from './ColumnMappingUI';
import ErrorDisplay from './ErrorDisplay';
import ErrorBoundary from './ErrorBoundary';

const App = ({ onMappingComplete }) => {
  const { state } = useData();
  const { isLoading, error, sourceColumns, sampleData, selectedTool } = state;
  
  // Log initial state for debugging
  useEffect(() => {
    console.log('DataFormatterUI App initialized with:', { 
      sourceColumns, 
      sampleDataCount: sampleData?.length || 0,
      selectedTool,
      isLoading, 
      hasError: !!error 
    });
  }, []);
  
  // Handle mapping completion
  const handleMappingComplete = (mappings) => {
    console.log('Mapping complete:', mappings);
    
    if (typeof onMappingComplete === 'function') {
      onMappingComplete(mappings);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Box p={3} textAlign="center" data-testid="loading-indicator">
        <CircularProgress size={40} />
        <Typography variant="body1" style={{ marginTop: 16 }}>
          Loading field mapping interface...
        </Typography>
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  // Show warning if no source columns
  if (!sourceColumns || sourceColumns.length === 0) {
    return (
      <Paper elevation={2} style={{ padding: 24, margin: 16 }}>
        <Typography variant="h5" gutterBottom color="error">
          No source data available
        </Typography>
        <Typography variant="body1" paragraph>
          Please make sure you have uploaded a file with valid data before mapping fields.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Paper>
    );
  }
  
  // Render the column mapping UI with ErrorBoundary
  return (
    <ErrorBoundary>
      <Box p={2}>
        <ColumnMappingUI
          onMappingComplete={handleMappingComplete}
        />
      </Box>
    </ErrorBoundary>
  );
};

export default App;