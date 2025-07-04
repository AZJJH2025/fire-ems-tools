/**
 * Welcome Dialog Component
 * 
 * Introductory dialog for new users.
 * Will be fully implemented in next phase.
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { dismissWelcome } from '@/state/redux/fireMapProSlice';

const WelcomeDialog: React.FC = () => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(dismissWelcome());
  };

  return (
    <Dialog open onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        Welcome to Fire Map Pro
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'primary.main' }}>
          Professional Mapping for Fire & EMS Operations
        </Typography>
        
        <Typography variant="body1" paragraph>
          <strong>Ready to use immediately:</strong> Your map is pre-loaded with fire stations, hospitals, 
          hydrants, and recent incidents to provide instant situational awareness.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Key Features:</strong>
        </Typography>
        
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <li><strong>Live Data Layers:</strong> Fire stations, hospitals, hydrants, response zones</li>
          <li><strong>Drawing Tools:</strong> Add markers, areas, and annotations</li>
          <li><strong>Icon Library:</strong> Professional fire & EMS symbols</li>
          <li><strong>Layer Controls:</strong> Toggle visibility and adjust transparency</li>
          <li><strong>Export Options:</strong> Generate professional maps and reports</li>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Click layers in the sidebar to explore your operational data →
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={handleClose} variant="contained" size="large">
          Start Mapping
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;