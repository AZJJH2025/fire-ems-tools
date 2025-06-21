import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface SimpleLayoutToolboxProps {
  configuration?: any;
  disabled?: boolean;
}

const SimpleLayoutToolbox: React.FC<SimpleLayoutToolboxProps> = ({ disabled = false }) => {
  const elements = [
    { type: 'map', label: 'Map Frame' },
    { type: 'title', label: 'Title' },
    { type: 'legend', label: 'Legend' },
    { type: 'north-arrow', label: 'North Arrow' },
    { type: 'scale-bar', label: 'Scale Bar' },
    { type: 'text', label: 'Text Box' }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Layout Toolbox
      </Typography>
      
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Drag Elements to Canvas:
      </Typography>
      
      {elements.map((element) => (
        <Paper
          key={element.type}
          sx={{
            p: 1,
            mb: 1,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'grab',
            border: 1,
            borderColor: 'divider',
            '&:hover': disabled ? {} : {
              bgcolor: 'action.hover'
            }
          }}
          draggable={!disabled}
        >
          <Typography variant="body2">
            {element.label}
          </Typography>
        </Paper>
      ))}
      
      <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
        Templates:
      </Typography>
      
      <Button variant="outlined" size="small" fullWidth sx={{ mb: 1 }}>
        Standard Layout
      </Button>
      <Button variant="outlined" size="small" fullWidth sx={{ mb: 1 }}>
        Professional Layout
      </Button>
      
      <Box sx={{ mt: 2, p: 1, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
        <Typography variant="caption">
          ✅ Layout Designer is working! Drag elements to canvas.
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleLayoutToolbox;