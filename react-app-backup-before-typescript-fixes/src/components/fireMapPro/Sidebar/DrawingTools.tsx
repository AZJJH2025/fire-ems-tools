/**
 * Drawing Tools Panel Component
 * 
 * Provides drawing tools for creating markers, polygons, lines, and other features.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Place as MarkerIcon,
  Timeline as LineIcon,
  Crop as PolygonIcon,
  PanoramaFishEye as CircleIcon,
  CropDin as RectangleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Straighten as MeasureIcon,
  GridOn as GridIcon
} from '@mui/icons-material';

import {
  selectDrawingState,
  selectLayers,
  setDrawingMode,
  updateDrawingOptions,
  updateMapSettings
} from '@/state/redux/fireMapProSlice';
import { DrawingMode } from '@/types/fireMapPro';

const DrawingTools: React.FC = () => {
  const dispatch = useDispatch();
  const drawingState = useSelector(selectDrawingState);
  const layers = useSelector(selectLayers);
  const [selectedTargetLayer, setSelectedTargetLayer] = useState<string>('');

  const drawingModes: Array<{ mode: DrawingMode; icon: React.ReactNode; label: string }> = [
    { mode: 'marker', icon: <MarkerIcon />, label: 'Marker' },
    { mode: 'polyline', icon: <LineIcon />, label: 'Line' },
    { mode: 'polygon', icon: <PolygonIcon />, label: 'Polygon' },
    { mode: 'circle', icon: <CircleIcon />, label: 'Circle' },
    { mode: 'rectangle', icon: <RectangleIcon />, label: 'Rectangle' }
  ];

  const handleModeChange = (mode: DrawingMode) => {
    const newMode = mode === drawingState.mode ? null : mode;
    console.log('[DrawingTools UI] Button clicked:', { 
      clickedMode: mode, 
      currentMode: drawingState.mode, 
      newMode: newMode 
    });
    dispatch(setDrawingMode(newMode));
  };

  const handleStyleChange = (property: string, value: any) => {
    console.log('[DrawingTools] Style change:', { property, value });
    console.log('[DrawingTools] Current style before update:', drawingState.options.style);
    
    const newOptions = {
      style: {
        ...drawingState.options.style,
        [property]: value
      }
    };
    
    console.log('[DrawingTools] New options to dispatch:', newOptions);
    dispatch(updateDrawingOptions(newOptions));
  };

  const handleOptionsChange = (property: string, value: any) => {
    dispatch(updateDrawingOptions({
      [property]: value
    }));
  };

  const handleMapSettingChange = (setting: string, value: any) => {
    dispatch(updateMapSettings({ [setting]: value }));
  };

  // Get target layer options (only feature layers)
  const targetLayers = layers.filter(layer => layer.type === 'feature');

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditIcon />
        Drawing Tools
      </Typography>

      {/* Drawing Mode Selection */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Drawing Mode
        </Typography>
        <Grid container spacing={1}>
          {drawingModes.map(({ mode, icon, label }) => (
            <Grid item xs={6} key={mode}>
              <Tooltip title={label}>
                <ToggleButton
                  value={mode}
                  selected={drawingState.mode === mode}
                  onChange={() => handleModeChange(mode)}
                  sx={{ width: '100%', height: 48 }}
                  size="small"
                >
                  {icon}
                </ToggleButton>
              </Tooltip>
            </Grid>
          ))}
          <Grid item xs={6}>
            <Tooltip title="Edit Features">
              <ToggleButton
                value="edit"
                selected={drawingState.mode === 'edit'}
                onChange={() => handleModeChange('edit')}
                sx={{ width: '100%', height: 48 }}
                size="small"
              >
                <EditIcon />
              </ToggleButton>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Delete Features">
              <ToggleButton
                value="delete"
                selected={drawingState.mode === 'delete'}
                onChange={() => handleModeChange('delete')}
                sx={{ width: '100%', height: 48 }}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </ToggleButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Target Layer Selection */}
      {targetLayers.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Target Layer</InputLabel>
            <Select
              value={selectedTargetLayer}
              label="Target Layer"
              onChange={(e) => setSelectedTargetLayer(e.target.value)}
            >
              {targetLayers.map((layer) => (
                <MenuItem key={layer.id} value={layer.id}>
                  {layer.name} ({layer.features.length} features)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Style Options */}
      {drawingState.mode && drawingState.mode !== 'edit' && drawingState.mode !== 'delete' && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Style Options
          </Typography>

          {/* Color Selection */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Stroke Color
            </Typography>
            <Grid container spacing={1}>
              {['#3388ff', '#ff6b35', '#4caf50', '#f44336', '#9c27b0', '#ff9800'].map((color) => (
                <Grid item key={color}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      border: drawingState.options.style.color === color ? '3px solid #000' : '1px solid #ccc',
                      borderRadius: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleStyleChange('color', color)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Fill Color (for polygons and circles) */}
          {(drawingState.mode === 'polygon' || drawingState.mode === 'circle' || drawingState.mode === 'rectangle') && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Fill Color
              </Typography>
              <Grid container spacing={1}>
                {['#3388ff', '#ff6b35', '#4caf50', '#f44336', '#9c27b0', '#ff9800'].map((color) => (
                  <Grid item key={color}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color,
                        border: drawingState.options.style.fillColor === color ? '3px solid #000' : '1px solid #ccc',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleStyleChange('fillColor', color)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Stroke Width */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Stroke Width: {drawingState.options.style.weight}px
            </Typography>
            <Slider
              value={drawingState.options.style.weight || 3}
              onChange={(_, value) => handleStyleChange('weight', value)}
              min={1}
              max={10}
              step={1}
              size="small"
            />
          </Box>

          {/* Fill Opacity (for polygons and circles) */}
          {(drawingState.mode === 'polygon' || drawingState.mode === 'circle' || drawingState.mode === 'rectangle') && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Fill Opacity: {Math.round((drawingState.options.style.fillOpacity || 0.3) * 100)}%
              </Typography>
              <Slider
                value={(drawingState.options.style.fillOpacity || 0.3) * 100}
                onChange={(_, value) => handleStyleChange('fillOpacity', (value as number) / 100)}
                min={0}
                max={100}
                step={5}
                size="small"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Drawing Options */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Drawing Options
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={drawingState.options.snapToGrid || false}
              onChange={(e) => handleOptionsChange('snapToGrid', e.target.checked)}
              size="small"
            />
          }
          label="Snap to Grid"
          sx={{ mb: 1, display: 'flex' }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={drawingState.options.showMeasurements || false}
              onChange={(e) => handleOptionsChange('showMeasurements', e.target.checked)}
              size="small"
            />
          }
          label="Show Measurements"
          sx={{ mb: 1, display: 'flex' }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={drawingState.options.allowEdit || false}
              onChange={(e) => handleOptionsChange('allowEdit', e.target.checked)}
              size="small"
            />
          }
          label="Allow Editing"
          sx={{ display: 'flex' }}
        />
      </Paper>

      {/* Map Display Options */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Map Display
        </Typography>

        <FormControlLabel
          control={
            <Switch
              // This will be connected to map state
              checked={false}
              onChange={(e) => handleMapSettingChange('showGrid', e.target.checked)}
              size="small"
            />
          }
          label="Show Grid"
          sx={{ mb: 1, display: 'flex' }}
        />

        <FormControlLabel
          control={
            <Switch
              // This will be connected to map state
              checked={true}
              onChange={(e) => handleMapSettingChange('showCoordinates', e.target.checked)}
              size="small"
            />
          }
          label="Show Coordinates"
          sx={{ display: 'flex' }}
        />
      </Paper>

      {/* Current Mode Info */}
      {drawingState.mode && (
        <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Active: {drawingState.mode.charAt(0).toUpperCase() + drawingState.mode.slice(1)} Mode
          </Typography>
          <Typography variant="caption">
            {drawingState.mode === 'marker' && 'Click on the map to place markers'}
            {drawingState.mode === 'polyline' && 'Click points to draw a line'}
            {drawingState.mode === 'polygon' && 'Click points to draw a polygon'}
            {drawingState.mode === 'circle' && 'Click and drag to draw a circle'}
            {drawingState.mode === 'rectangle' && 'Click and drag to draw a rectangle'}
            {drawingState.mode === 'edit' && 'Click features to edit them'}
            {drawingState.mode === 'delete' && 'Click features to delete them'}
          </Typography>
        </Paper>
      )}

      {/* No Layers Warning */}
      {targetLayers.length === 0 && (
        <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            No Feature Layers
          </Typography>
          <Typography variant="caption">
            Create a feature layer first to start drawing.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DrawingTools;