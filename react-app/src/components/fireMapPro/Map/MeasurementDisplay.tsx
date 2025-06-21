/**
 * Measurement Display Component
 * 
 * Shows measurement information for drawn features.
 * This component is rendered outside the map container.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Chip
} from '@mui/material';
import {
  Straighten as MeasureIcon
} from '@mui/icons-material';

import { selectLayers } from '@/state/redux/fireMapProSlice';

const MeasurementDisplay: React.FC = () => {
  const layers = useSelector(selectLayers);

  // Calculate total measurements
  const calculations = {
    totalFeatures: 0,
    totalMarkers: 0,
    totalLines: 0,
    totalPolygons: 0
  };

  layers.forEach(layer => {
    if (layer.visible) {
      calculations.totalFeatures += layer.features.length;
      
      layer.features.forEach(feature => {
        switch (feature.type) {
          case 'marker':
            calculations.totalMarkers++;
            break;
          case 'polyline':
            calculations.totalLines++;
            break;
          case 'polygon':
            calculations.totalPolygons++;
            break;
        }
      });
    }
  });

  if (calculations.totalFeatures === 0) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        minWidth: 200
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MeasureIcon fontSize="small" />
        Features
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            size="small" 
            label={`${calculations.totalFeatures} total`}
            color="primary"
            variant="outlined"
          />
          {calculations.totalMarkers > 0 && (
            <Chip 
              size="small" 
              label={`${calculations.totalMarkers} markers`}
              variant="outlined"
            />
          )}
          {calculations.totalLines > 0 && (
            <Chip 
              size="small" 
              label={`${calculations.totalLines} lines`}
              variant="outlined"
            />
          )}
          {calculations.totalPolygons > 0 && (
            <Chip 
              size="small" 
              label={`${calculations.totalPolygons} polygons`}
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default MeasurementDisplay;