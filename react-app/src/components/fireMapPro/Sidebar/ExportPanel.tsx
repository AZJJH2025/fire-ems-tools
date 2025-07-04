/**
 * Export Panel Component
 * 
 * Handles map export in various formats (PNG, PDF, SVG, etc.)
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper } from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { openExportModal } from '@/state/redux/fireMapProSlice';

const ExportPanel: React.FC = () => {
  const dispatch = useDispatch();

  const handleExportClick = () => {
    dispatch(openExportModal());
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ExportIcon />
        Export
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate professional maps with the new export system
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleExportClick}
          startIcon={<ExportIcon />}
          fullWidth
        >
          Open Export Options
        </Button>
      </Paper>
    </Box>
  );
};

export default ExportPanel;