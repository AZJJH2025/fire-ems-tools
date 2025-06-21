/**
 * Icon Library Component
 * 
 * Professional Fire and EMS icon library with drag-and-drop functionality.
 * Uses high-quality SVG icons designed specifically for emergency services.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  Alert
} from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
  LocalHospital as EMSIcon,
  Business as FacilityIcon,
  Warning as IncidentIcon,
  Security as PreventionIcon,
  ElectricBolt as EnergyIcon,
  Search as SearchIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

import { IconCategory, IconSize, MapIcon } from '@/types/fireMapPro';
import { enhancedFireEMSIcons } from '@/data/enhancedFireEMSIcons';
import { selectLayers } from '@/state/redux/fireMapProSlice';

const categoryIcons = {
  'fire-apparatus': <FireIcon />,
  'ems-units': <EMSIcon />,
  'incident-types': <IncidentIcon />,
  'facilities': <FacilityIcon />,
  'prevention': <PreventionIcon />,
  'energy-systems': <EnergyIcon />,
  'custom': <PaletteIcon />
};

const IconLibrary: React.FC = () => {
  const layers = useSelector(selectLayers);
  const [selectedCategory, setSelectedCategory] = useState<IconCategory>('fire-apparatus');
  const [selectedSize, setSelectedSize] = useState<IconSize>('medium');
  const [selectedColor, setSelectedColor] = useState('#DC2626');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(enhancedFireEMSIcons) as IconCategory[];
  const currentIcons = enhancedFireEMSIcons[selectedCategory] || [];

  // Filter icons based on search term
  const filteredIcons = currentIcons.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if there are feature layers to place icons
  const featureLayers = layers.filter(layer => layer.type === 'feature');

  const handleDragStart = (event: React.DragEvent, icon: MapIcon) => {
    // Enhanced icon data with current settings
    const enhancedIcon = {
      ...icon,
      size: selectedSize,
      color: selectedColor
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(enhancedIcon));
    event.dataTransfer.effectAllowed = 'copy';
    
    // Visual feedback
    const dragPreview = event.currentTarget.cloneNode(true) as HTMLElement;
    dragPreview.style.transform = 'scale(1.2)';
    dragPreview.style.opacity = '0.8';
    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 16, 16);
    
    setTimeout(() => document.body.removeChild(dragPreview), 0);
  };

  const colorOptions = [
    { name: 'Fire Red', value: '#DC2626' },
    { name: 'EMS Blue', value: '#1E40AF' },
    { name: 'Safety Green', value: '#059669' },
    { name: 'Warning Orange', value: '#F59E0B' },
    { name: 'Medical Cross', value: '#EF4444' },
    { name: 'Industrial Gray', value: '#6B7280' },
    { name: 'Hazmat Yellow', value: '#FCD34D' },
    { name: 'Emergency Purple', value: '#7C3AED' }
  ];

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaletteIcon />
        Professional Icons
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search fire & EMS icons..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onChange={(_, value) => setSelectedCategory(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, minHeight: 'auto' }}
      >
        {categories.map((category) => (
          <Tab
            key={category}
            value={category}
            icon={categoryIcons[category]}
            label={category.replace('-', ' ')}
            sx={{ 
              minHeight: 'auto', 
              py: 1,
              fontSize: '0.75rem',
              textTransform: 'capitalize'
            }}
          />
        ))}
      </Tabs>

      {/* Icon Customization */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Icon Settings
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Size</InputLabel>
              <Select
                value={selectedSize}
                label="Size"
                onChange={(e) => setSelectedSize(e.target.value as IconSize)}
              >
                <MenuItem value="small">Small (20px)</MenuItem>
                <MenuItem value="medium">Medium (32px)</MenuItem>
                <MenuItem value="large">Large (48px)</MenuItem>
                <MenuItem value="extra-large">Extra Large (64px)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Color Theme</InputLabel>
              <Select
                value={selectedColor}
                label="Color Theme"
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: color.value,
                          borderRadius: '50%',
                          border: '1px solid #ccc'
                        }}
                      />
                      {color.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Icons Grid */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
            {selectedCategory.replace('-', ' ')} ({filteredIcons.length})
          </Typography>
          <Chip 
            label={`${selectedSize} • ${colorOptions.find(c => c.value === selectedColor)?.name}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {filteredIcons.length > 0 ? (
          <Grid container spacing={1}>
            {filteredIcons.map((icon) => (
              <Grid item xs={4} key={icon.id}>
                <Tooltip title={`${icon.name} - Drag to map`}>
                  <Paper
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'grab',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        transform: 'scale(1.05)',
                        boxShadow: 2
                      },
                      '&:active': {
                        cursor: 'grabbing',
                        transform: 'scale(0.95)'
                      }
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, icon)}
                  >
                    <Box
                      component="img"
                      src={icon.url}
                      alt={icon.name}
                      sx={{
                        width: selectedSize === 'small' ? 20 : selectedSize === 'large' ? 40 : 32,
                        height: selectedSize === 'small' ? 20 : selectedSize === 'large' ? 40 : 32,
                        mb: 0.5,
                        filter: selectedColor !== icon.color ? 
                          `hue-rotate(${getHueRotation(icon.color, selectedColor)}deg)` : 'none'
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        fontSize: '0.65rem',
                        lineHeight: 1.2,
                        fontWeight: 500
                      }}
                    >
                      {icon.name}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No icons match your search' : 'No icons in this category'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* No Layers Warning */}
      {featureLayers.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Create a layer first
          </Typography>
          <Typography variant="caption">
            Go to the Layers tab and create a feature layer to place icons on the map.
          </Typography>
        </Alert>
      )}

      {/* Usage Instructions */}
      <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          How to Use
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0, '& li': { mb: 0.5 } }}>
          <li>Select icon size and color above</li>
          <li>Drag any icon from the library</li>
          <li>Drop it on the map to place a marker</li>
          <li>Click the marker to edit its properties</li>
        </Box>
      </Paper>
    </Box>
  );
};

// Helper function to calculate hue rotation for color changes
function getHueRotation(fromColor: string, toColor: string): number {
  const colorMap: Record<string, number> = {
    '#DC2626': 0,   // Fire Red
    '#EF4444': 5,   // Medical Cross Red
    '#F59E0B': 45,  // Warning Orange
    '#FCD34D': 60,  // Hazmat Yellow
    '#059669': 120, // Safety Green
    '#1E40AF': 240, // EMS Blue
    '#7C3AED': 270, // Emergency Purple
    '#6B7280': 0    // Industrial Gray (no change)
  };
  
  const fromHue = colorMap[fromColor] || 0;
  const toHue = colorMap[toColor] || 0;
  
  return toHue - fromHue;
}

export default IconLibrary;