/**
 * Advanced Export Tab Component
 * 
 * Second tab with professional printing options:
 * - Color modes (RGB/CMYK) and ICC profiles
 * - Custom print dimensions
 * - Professional print features (bleed, crop marks, etc.)
 * - Large format printing with tiling
 * - Layer-specific export controls
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Alert,
  Paper,
  InputAdornment,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import {
  Palette as ColorIcon,
  Print as PrintIcon,
  ViewModule as TileIcon,
  Layers as LayersIcon
} from '@mui/icons-material';

import { updateAdvancedExportSettings } from '@/state/redux/fireMapProSlice';
import { selectLayers } from '@/state/redux/fireMapProSlice';
import { ExportConfiguration, ColorProfile, PaperSize } from '@/types/export';

interface AdvancedExportTabProps {
  isActive: boolean;
  configuration: ExportConfiguration;
  disabled?: boolean;
}

const AdvancedExportTab: React.FC<AdvancedExportTabProps> = ({ 
  isActive, 
  configuration, 
  disabled = false 
}) => {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);
  const settings = configuration.advanced;

  const handleInputChange = (field: keyof typeof settings) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const value = (event.target as HTMLInputElement).type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;
      
    dispatch(updateAdvancedExportSettings({ [field]: value }));
  };

  const handleNumericChange = (field: keyof typeof settings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value) || 0;
    dispatch(updateAdvancedExportSettings({ [field]: value }));
  };

  const handleLayerToggle = (layerId: string) => {
    const currentSelected = settings.selectedLayers;
    const newSelected = currentSelected.includes(layerId)
      ? currentSelected.filter(id => id !== layerId)
      : [...currentSelected, layerId];
    
    dispatch(updateAdvancedExportSettings({ selectedLayers: newSelected }));
  };

  const colorProfiles: { value: ColorProfile; label: string }[] = [
    { value: 'srgb', label: 'sRGB (Default)' },
    { value: 'adobergb', label: 'Adobe RGB' },
    { value: 'cmyk-swop', label: 'CMYK SWOP (U.S.)' },
    { value: 'cmyk-fogra', label: 'CMYK FOGRA39 (Europe)' },
    { value: 'custom', label: 'Custom Profile...' }
  ];

  const tileSizes: { value: PaperSize; label: string }[] = [
    { value: 'letter', label: 'Letter (8.5" × 11")' },
    { value: 'a4', label: 'A4 (210mm × 297mm)' }
  ];

  if (!isActive) return null;

  return (
    <Box sx={{ p: 3, height: '60vh', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {/* Color Management Section */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ColorIcon color="primary" />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Color Management
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Color Mode</InputLabel>
            <Select
              value={settings.colorMode}
              label="Color Mode"
              onChange={handleInputChange('colorMode')}
            >
              <MenuItem value="rgb">RGB (Screen)</MenuItem>
              <MenuItem value="cmyk">CMYK (Print)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>ICC Color Profile</InputLabel>
            <Select
              value={settings.colorProfile}
              label="ICC Color Profile"
              onChange={handleInputChange('colorProfile')}
            >
              {colorProfiles.map(profile => (
                <MenuItem key={profile.value} value={profile.value}>
                  {profile.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Custom Dimensions Section */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Custom Print Size
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Width"
            type="number"
            value={settings.customWidth}
            onChange={handleNumericChange('customWidth')}
            disabled={disabled}
            inputProps={{ min: 1, max: 100, step: 0.1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Height"
            type="number"
            value={settings.customHeight}
            onChange={handleNumericChange('customHeight')}
            disabled={disabled}
            inputProps={{ min: 1, max: 100, step: 0.1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Units</InputLabel>
            <Select
              value={settings.printUnits}
              label="Units"
              onChange={handleInputChange('printUnits')}
            >
              <MenuItem value="in">inches</MenuItem>
              <MenuItem value="cm">centimeters</MenuItem>
              <MenuItem value="mm">millimeters</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Professional Print Options */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PrintIcon color="primary" />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Professional Print Options
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.addBleed}
                      onChange={handleInputChange('addBleed')}
                      disabled={disabled}
                    />
                  }
                  label="Add Bleed (0.125″)"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.showCropMarks}
                      onChange={handleInputChange('showCropMarks')}
                      disabled={disabled}
                    />
                  }
                  label="Show Crop Marks"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.includeColorBars}
                      onChange={handleInputChange('includeColorBars')}
                      disabled={disabled}
                    />
                  }
                  label="Include Color Calibration Bars"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.addRegistrationMarks}
                      onChange={handleInputChange('addRegistrationMarks')}
                      disabled={disabled}
                    />
                  }
                  label="Add Registration Marks"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.embedICCProfile}
                      onChange={handleInputChange('embedICCProfile')}
                      disabled={disabled}
                    />
                  }
                  label="Embed ICC Profile"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Large Format Printing */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TileIcon color="primary" />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Large Format Printing
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.enableTiledPrinting}
                onChange={handleInputChange('enableTiledPrinting')}
                disabled={disabled}
              />
            }
            label="Enable Tiled Printing"
          />
        </Grid>

        {settings.enableTiledPrinting && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={disabled}>
                <InputLabel>Tile Size</InputLabel>
                <Select
                  value={settings.tileSize}
                  label="Tile Size"
                  onChange={handleInputChange('tileSize')}
                >
                  {tileSizes.map(size => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Overlap"
                type="number"
                value={settings.tileOverlap}
                onChange={handleNumericChange('tileOverlap')}
                disabled={disabled}
                inputProps={{ min: 0, max: 2, step: 0.25 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">inches</InputAdornment>
                }}
              />
            </Grid>
          </>
        )}

        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Layer Controls */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LayersIcon color="primary" />
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Layer Controls
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.exportAllLayers}
                onChange={handleInputChange('exportAllLayers')}
                disabled={disabled}
              />
            }
            label="Export All Visible Layers"
          />
        </Grid>

        {!settings.exportAllLayers && layers.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Layers to Export:
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List dense>
                {layers.map(layer => (
                  <ListItem key={layer.id} component="button" disabled={disabled}>
                    <ListItemText 
                      primary={layer.name}
                      secondary={`${layer.features.length} features`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.selectedLayers.includes(layer.id)}
                        onChange={() => handleLayerToggle(layer.id)}
                        disabled={disabled}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Help Information */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Professional Printing:</strong> Use CMYK color mode and appropriate ICC profiles for commercial printing. 
              Enable bleed and crop marks for professional print shops. For large maps, use tiled printing to split across multiple pages.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedExportTab;