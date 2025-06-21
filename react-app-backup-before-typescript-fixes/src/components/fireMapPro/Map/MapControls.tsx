/**
 * Map Controls Component
 * 
 * Provides zoom controls, fullscreen toggle, and other map interaction controls.
 */

import React from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  ButtonGroup
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Fullscreen as FullscreenIcon,
  CenterFocusStrong as CenterIcon
} from '@mui/icons-material';

import { selectMapState, updateMapView } from '@/state/redux/fireMapProSlice';

const MapControls: React.FC = () => {
  const map = useMap();
  const dispatch = useDispatch();
  const mapState = useSelector(selectMapState);

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleRecenter = () => {
    const { center, zoom } = mapState.view;
    map.setView([center.latitude, center.longitude], zoom);
  };

  const handleFitBounds = () => {
    // Fit to show all features
    if (map.getBounds()) {
      map.fitBounds(map.getBounds());
    }
  };

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 16);
          dispatch(updateMapView({
            center: { latitude, longitude },
            zoom: 16
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ButtonGroup orientation="vertical" variant="contained">
        <Tooltip title="Zoom In" placement="left">
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out" placement="left">
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Recenter Map" placement="left">
          <IconButton onClick={handleRecenter} size="small">
            <CenterIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Fit All Features" placement="left">
          <IconButton onClick={handleFitBounds} size="small">
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Find My Location" placement="left">
          <IconButton onClick={handleLocateUser} size="small">
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
    </Paper>
  );
};

export default MapControls;