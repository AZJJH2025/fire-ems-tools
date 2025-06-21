/**
 * Settings Panel Component
 * 
 * Map settings and preferences
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Divider
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

import {
  selectMapState,
  setActiveBaseMap,
  updateMapSettings
} from '@/state/redux/fireMapProSlice';

const SettingsPanel: React.FC = () => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMapState);

  const handleBaseMapChange = (baseMapId: string) => {
    dispatch(setActiveBaseMap(baseMapId));
  };

  const handleSettingChange = (setting: string, value: any) => {
    dispatch(updateMapSettings({ [setting]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Settings
      </Typography>

      {/* Base Map Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Base Map
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Base Map</InputLabel>
          <Select
            value={mapState.activeBaseMap}
            label="Base Map"
            onChange={(e) => handleBaseMapChange(e.target.value)}
          >
            {mapState.baseMaps.map((baseMap) => (
              <MenuItem key={baseMap.id} value={baseMap.id}>
                {baseMap.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Display Options */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Display Options
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={mapState.showCoordinates}
              onChange={(e) => handleSettingChange('showCoordinates', e.target.checked)}
              size="small"
            />
          }
          label="Show Coordinates"
          sx={{ mb: 1, display: 'flex' }}
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={mapState.showGrid}
              onChange={(e) => handleSettingChange('showGrid', e.target.checked)}
              size="small"
            />
          }
          label="Show Grid"
          sx={{ mb: 1, display: 'flex' }}
        />
      </Paper>

      {/* Units */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Measurement Units
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Units</InputLabel>
          <Select
            value={mapState.measurementUnits}
            label="Units"
            onChange={(e) => handleSettingChange('measurementUnits', e.target.value)}
          >
            <MenuItem value="metric">Metric (m, km)</MenuItem>
            <MenuItem value="imperial">Imperial (ft, mi)</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default SettingsPanel;