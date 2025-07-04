import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SimplePropertiesPanel: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Properties Panel
      </Typography>
      
      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          ✅ Properties Panel Working!
        </Typography>
        <Typography variant="body2">
          Select an element on the canvas to view its properties here.
        </Typography>
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Available Properties:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Position (X, Y)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Size (Width, Height)  
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Text formatting
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Colors and styling
        </Typography>
      </Box>
    </Box>
  );
};

export default SimplePropertiesPanel;