/**
 * Base Map Switcher Component
 * 
 * Allows users to switch between different base map layers (OSM, Satellite, Terrain).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper
} from '@mui/material';
import {
  Map as MapIcon,
  Satellite as SatelliteIcon,
  Terrain as TerrainIcon
} from '@mui/icons-material';

import { selectMapState, setActiveBaseMap } from '@/state/redux/fireMapProSlice';

const BaseMapSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMapState);

  const baseMaps = [
    { id: 'osm', name: 'Street', icon: <MapIcon />, description: 'OpenStreetMap with roads and labels' },
    { id: 'satellite', name: 'Satellite', icon: <SatelliteIcon />, description: 'High-resolution satellite imagery' },
    { id: 'terrain', name: 'Terrain', icon: <TerrainIcon />, description: 'Topographic map with elevation' }
  ];

  const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: string) => {
    if (newValue) {
      dispatch(setActiveBaseMap(newValue));
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Base Map Style
      </Typography>
      
      <ToggleButtonGroup
        value={mapState.activeBaseMap}
        exclusive
        onChange={handleChange}
        orientation="vertical"
        fullWidth
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {baseMaps.map((baseMap) => (
          <ToggleButton
            key={baseMap.id}
            value={baseMap.id}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              height: 56,
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.main'
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {baseMap.icon}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {baseMap.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {baseMap.description}
                </Typography>
              </Box>
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default BaseMapSwitcher;