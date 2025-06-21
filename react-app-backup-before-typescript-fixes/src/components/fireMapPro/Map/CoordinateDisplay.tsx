/**
 * Coordinate Display Component
 * 
 * Shows current mouse coordinates and map center information.
 */

import React, { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';

import { selectMapState } from '@/state/redux/fireMapProSlice';

/**
 * Mouse tracker component that must be inside MapContainer
 */
const MouseTracker: React.FC<{ onMouseMove: (coords: { lat: number; lng: number } | null) => void }> = ({ onMouseMove }) => {
  useMapEvents({
    mousemove: (e) => {
      onMouseMove({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout: () => {
      onMouseMove(null);
    }
  });

  return null;
};

/**
 * Coordinate display UI component (rendered outside map)
 */
const CoordinateDisplayUI: React.FC<{ mouseCoords: { lat: number; lng: number } | null }> = ({ mouseCoords }) => {
  const mapState = useSelector(selectMapState);

  const formatCoordinate = (coord: number, digits: number = 5) => {
    return coord.toFixed(digits);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        p: 1,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Mouse Coordinates */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Mouse: 
          </Typography>
          {mouseCoords ? (
            <Typography variant="caption" sx={{ ml: 1, fontFamily: 'monospace' }}>
              {formatCoordinate(mouseCoords.lat)}, {formatCoordinate(mouseCoords.lng)}
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
              Move mouse over map
            </Typography>
          )}
        </Box>

        {/* Map Center */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Center: 
          </Typography>
          <Typography variant="caption" sx={{ ml: 1, fontFamily: 'monospace' }}>
            {formatCoordinate(mapState.view.center.latitude)}, {formatCoordinate(mapState.view.center.longitude)}
          </Typography>
        </Box>

        {/* Current Zoom */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Zoom: 
          </Typography>
          <Typography variant="caption" sx={{ ml: 1, fontFamily: 'monospace' }}>
            {mapState.view.zoom.toFixed(1)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Default export is the UI component for external use
const CoordinateDisplay: React.FC = () => {
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  return <CoordinateDisplayUI mouseCoords={mouseCoords} />;
};

export default CoordinateDisplay;
export { MouseTracker, CoordinateDisplayUI };