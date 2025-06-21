/**
 * Layout Designer Tab Component
 * 
 * Third tab with the professional layout designer:
 * - 3-panel layout (toolbox, canvas, properties)
 * - Drag-and-drop layout elements
 * - Professional template system
 * - Live layout preview
 * - Element properties panel
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import {
  Dashboard as LayoutIcon
} from '@mui/icons-material';

import { updateLayoutSettings } from '@/state/redux/fireMapProSlice';
import { ExportConfiguration, PrintOrientation } from '@/types/export';

// Import Layout Designer components
import LayoutToolbox from './LayoutDesigner/LayoutToolbox';
import LayoutCanvas from './LayoutDesigner/LayoutCanvas';
import PropertiesPanel from './LayoutDesigner/PropertiesPanel';

interface LayoutDesignerTabProps {
  isActive: boolean;
  configuration: ExportConfiguration;
  disabled?: boolean;
}

const LayoutDesignerTab: React.FC<LayoutDesignerTabProps> = ({ 
  isActive, 
  configuration, 
  disabled = false 
}) => {
  const dispatch = useDispatch();
  const settings = configuration.layout;

  const handleOrientationChange = (event: SelectChangeEvent) => {
    const orientation = event.target.value as PrintOrientation;
    dispatch(updateLayoutSettings({ 
      pageOrientation: orientation,
      // Swap canvas dimensions for orientation change
      canvasWidth: orientation === 'landscape' ? 520 : 400,
      canvasHeight: orientation === 'landscape' ? 400 : 520
    }));
  };

  if (!isActive) return null;

  return (
    <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LayoutIcon color="primary" />
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Layout Designer
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small" disabled={disabled}>
              <InputLabel>Page Orientation</InputLabel>
              <Select
                value={settings.pageOrientation}
                label="Page Orientation"
                onChange={handleOrientationChange}
              >
                <MenuItem value="portrait">Portrait</MenuItem>
                <MenuItem value="landscape">Landscape</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Alert severity="info" sx={{ py: 0.5 }}>
              <Typography variant="caption">
                Drag elements from the toolbox to the canvas. Select templates for quick layouts.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>

      {/* 3-Panel Layout Designer */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel: Toolbox */}
        <Box sx={{ 
          width: 200, 
          borderRight: 1, 
          borderColor: 'divider',
          overflow: 'auto',
          bgcolor: 'background.paper',
          p: 2
        }}>
          <LayoutToolbox configuration={configuration} disabled={disabled} />
        </Box>

        {/* Center Panel: Canvas */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: 'grey.100',
          p: 2,
          overflow: 'auto'
        }}>
          <LayoutCanvas />
        </Box>

        {/* Right Panel: Properties */}
        <Box sx={{ 
          width: 280, 
          borderLeft: 1, 
          borderColor: 'divider',
          overflow: 'auto',
          bgcolor: 'background.paper',
          p: 1
        }}>
          <PropertiesPanel />
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutDesignerTab;