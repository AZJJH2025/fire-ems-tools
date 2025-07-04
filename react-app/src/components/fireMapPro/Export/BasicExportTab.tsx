/**
 * Basic Export Tab Component
 * 
 * First tab of the export modal with essential export settings:
 * - Map title and subtitle
 * - Department logo upload
 * - Export format selection
 * - Resolution (DPI) settings
 * - Paper size and orientation
 * - Layout elements checkboxes
 */

import React, { useState } from 'react';
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
  Button,
  Avatar,
  Alert,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';

import { updateBasicExportSettings, updateLayoutElement, addLayoutElement } from '@/state/redux/fireMapProSlice';
import { ExportConfiguration, ExportFormat, DPIResolution, PaperSize } from '@/types/export';
import { RootState } from '@/state/redux/store';

interface BasicExportTabProps {
  isActive: boolean;
  configuration: ExportConfiguration;
  disabled?: boolean;
}

const BasicExportTab: React.FC<BasicExportTabProps> = ({ 
  isActive, 
  configuration, 
  disabled = false 
}) => {
  const dispatch = useDispatch();
  const settings = configuration.basic;
  
  // Get layout elements from Redux state
  const layoutElements = useSelector((state: RootState) => 
    state.fireMapPro.export.configuration.layout.elements
  );
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof settings) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const value = (event.target as HTMLInputElement).type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;
      
    dispatch(updateBasicExportSettings({ [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        dispatch(updateBasicExportSettings({ logo: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Manual sync function
  const applyToLayout = () => {
    console.log('[BasicExportTab] Manual apply clicked!', { title: settings.title, subtitle: settings.subtitle });
    console.log('[BasicExportTab] Current layout elements:', layoutElements);
    
    // Find title and subtitle elements in the layout
    let titleElement = layoutElements.find(el => el.type === 'title');
    let subtitleElement = layoutElements.find(el => el.type === 'subtitle');
    
    // Create or update title element
    if (settings.title) {
      if (!titleElement) {
        console.log('[BasicExportTab] Creating new title element');
        const newTitleElement = {
          type: 'title' as const,
          x: 10,
          y: 5,
          width: 80,
          height: 8,
          zIndex: 10,
          content: {
            text: settings.title,
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#333333',
            textAlign: 'center' as const
          },
          visible: true
        };
        dispatch(addLayoutElement(newTitleElement));
      } else {
        console.log('[BasicExportTab] Updating existing title element');
        dispatch(updateLayoutElement({
          id: titleElement.id,
          updates: { content: { ...titleElement.content, text: settings.title } }
        }));
      }
    }
    
    // Create or update subtitle element
    if (settings.subtitle) {
      if (!subtitleElement) {
        console.log('[BasicExportTab] Creating new subtitle element');
        const newSubtitleElement = {
          type: 'subtitle' as const,
          x: 10,
          y: 15,
          width: 80,
          height: 6,
          zIndex: 9,
          content: {
            text: settings.subtitle,
            fontSize: 14,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#666666',
            textAlign: 'center' as const
          },
          visible: true
        };
        dispatch(addLayoutElement(newSubtitleElement));
      } else {
        console.log('[BasicExportTab] Updating existing subtitle element');
        dispatch(updateLayoutElement({
          id: subtitleElement.id,
          updates: { content: { ...subtitleElement.content, text: settings.subtitle } }
        }));
      }
    }
  };

  const exportFormats: { value: ExportFormat; label: string; group: string }[] = [
    // Raster Formats
    { value: 'png', label: 'PNG Image', group: 'Raster Formats' },
    { value: 'jpg', label: 'JPEG Image', group: 'Raster Formats' },
    { value: 'tiff', label: 'TIFF Image', group: 'Raster Formats' },
    { value: 'webp', label: 'WebP Image', group: 'Raster Formats' },
    
    // Vector Formats
    { value: 'pdf', label: 'PDF Document', group: 'Vector Formats' },
    { value: 'svg', label: 'SVG Vector', group: 'Vector Formats' },
    { value: 'eps', label: 'EPS Vector', group: 'Vector Formats' },
    
    // GIS Formats
    { value: 'geojson', label: 'GeoJSON', group: 'GIS Formats' },
    { value: 'kml', label: 'KML', group: 'GIS Formats' },
    { value: 'geopdf', label: 'GeoPDF', group: 'GIS Formats' }
  ];

  const dpiOptions: { value: DPIResolution; label: string }[] = [
    { value: 96, label: 'Standard (96 DPI)' },
    { value: 150, label: 'Medium (150 DPI)' },
    { value: 300, label: 'High (300 DPI)' },
    { value: 450, label: 'Very High (450 DPI)' },
    { value: 600, label: 'Ultra High (600 DPI)' }
  ];

  const paperSizes: { value: PaperSize; label: string }[] = [
    { value: 'letter', label: 'Letter (8.5" × 11")' },
    { value: 'legal', label: 'Legal (8.5" × 14")' },
    { value: 'tabloid', label: 'Tabloid (11" × 17")' },
    { value: 'a4', label: 'A4 (210mm × 297mm)' },
    { value: 'a3', label: 'A3 (297mm × 420mm)' },
    { value: 'a2', label: 'A2 (420mm × 594mm)' },
    { value: 'a1', label: 'A1 (594mm × 841mm)' },
    { value: 'a0', label: 'A0 (841mm × 1189mm)' },
    { value: 'custom', label: 'Custom Size' }
  ];

  // Group formats for optgroups
  const formatGroups = exportFormats.reduce((groups, format) => {
    if (!groups[format.group]) {
      groups[format.group] = [];
    }
    groups[format.group].push(format);
    return groups;
  }, {} as Record<string, typeof exportFormats>);

  if (!isActive) return null;

  return (
    <Box sx={{ p: 3, height: '60vh', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {/* Map Information Section */}
        <Grid size={12}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Map Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Map Title"
            value={settings.title}
            onChange={handleInputChange('title')}
            disabled={disabled}
            placeholder="My Fire Department Map"
            helperText="Title that will appear on the exported map"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Subtitle (optional)"
            value={settings.subtitle}
            onChange={handleInputChange('subtitle')}
            disabled={disabled}
            placeholder="Created by Fire Prevention Division"
            helperText="Optional subtitle for additional context"
          />
        </Grid>

        <Grid size={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={applyToLayout}
            disabled={disabled || (!settings.title && !settings.subtitle)}
            sx={{ mt: 1 }}
          >
            Apply Title/Subtitle to Layout
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click to add your title and subtitle to the Layout Designer
          </Typography>
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle2" gutterBottom>
            Department Logo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={disabled}
            >
              Choose Logo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </Button>
            
            {logoPreview && (
              <Avatar
                src={logoPreview}
                variant="rounded"
                sx={{ width: 60, height: 60 }}
              >
                <ImageIcon />
              </Avatar>
            )}
            
            {!logoPreview && (
              <Typography variant="body2" color="text.secondary">
                No logo selected
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Export Settings Section */}
        <Grid size={12}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Export Settings
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={settings.format}
              label="Export Format"
              onChange={handleInputChange('format')}
            >
              {Object.entries(formatGroups).map(([groupName, formats]) => [
                <MenuItem key={groupName} disabled sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                  {groupName}
                </MenuItem>,
                ...formats.map(format => (
                  <MenuItem key={format.value} value={format.value} sx={{ pl: 3 }}>
                    {format.label}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Resolution (DPI)</InputLabel>
            <Select
              value={String(settings.dpi)}
              label="Resolution (DPI)"
              onChange={handleInputChange('dpi')}
            >
              {dpiOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Print Size</InputLabel>
            <Select
              value={settings.paperSize}
              label="Print Size"
              onChange={handleInputChange('paperSize')}
            >
              {paperSizes.map(size => (
                <MenuItem key={size.value} value={size.value}>
                  {size.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth disabled={disabled}>
            <InputLabel>Orientation</InputLabel>
            <Select
              value={settings.orientation}
              label="Orientation"
              onChange={handleInputChange('orientation')}
            >
              <MenuItem value="portrait">Portrait</MenuItem>
              <MenuItem value="landscape">Landscape</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Layout Elements Section */}
        <Grid size={12}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Layout Elements
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select which elements to include in your exported map
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeLegend}
                onChange={handleInputChange('includeLegend')}
                disabled={disabled}
              />
            }
            label="Include Legend"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeScale}
                onChange={handleInputChange('includeScale')}
                disabled={disabled}
              />
            }
            label="Include Scale Bar"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeNorth}
                onChange={handleInputChange('includeNorth')}
                disabled={disabled}
              />
            }
            label="Include North Arrow"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeTitle}
                onChange={handleInputChange('includeTitle')}
                disabled={disabled}
              />
            }
            label="Include Title Banner"
          />
        </Grid>

        {/* Help Information */}
        <Grid size={12}>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Quick Start:</strong> Enter a title, select your preferred format (PNG for images, PDF for documents), 
              and click Export. For advanced print settings or custom layouts, switch to the Advanced or Layout Designer tabs.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicExportTab;