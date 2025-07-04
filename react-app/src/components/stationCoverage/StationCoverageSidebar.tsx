/**
 * Station Coverage Sidebar Component
 * 
 * Provides controls and input panels for station coverage analysis including:
 * - Station data import and management
 * - NFPA standards configuration
 * - Coverage analysis parameters
 * - Jurisdiction boundary tools
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as UploadIcon,
  Place as StationIcon,
  Timeline as StandardIcon,
  Map as BoundaryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

interface StationCoverageSidebarProps {
  stations: any[];
  coverageStandard: 'nfpa1710' | 'nfpa1720';
  jurisdictionBoundary?: any;
  onStationDataImport: (data: any[]) => void;
  onCoverageStandardChange: (standard: 'nfpa1710' | 'nfpa1720') => void;
  onStationAdd: (station: any) => void;
  onStationEdit: (station: any) => void;
  onStationDelete: (stationId: string) => void;
  onBoundaryUpload?: (boundaryData: any) => void;
}

const StationCoverageSidebar: React.FC<StationCoverageSidebarProps> = ({
  stations,
  coverageStandard,
  jurisdictionBoundary,
  onStationDataImport,
  onCoverageStandardChange,
  onStationAdd,
  onStationEdit,
  onStationDelete,
  onBoundaryUpload
}) => {
  const [newStationData, setNewStationData] = useState({
    station_id: '',
    station_name: '',
    latitude: '',
    longitude: '',
    station_type: 'engine'
  });

  /**
   * Handle manual station addition
   */
  const handleAddStation = useCallback(() => {
    if (!newStationData.station_id || !newStationData.station_name || 
        !newStationData.latitude || !newStationData.longitude) {
      alert('Please fill in all required fields');
      return;
    }

    const station = {
      ...newStationData,
      latitude: parseFloat(newStationData.latitude),
      longitude: parseFloat(newStationData.longitude),
      operational_status: 'active'
    };

    onStationAdd(station);
    
    // Reset form
    setNewStationData({
      station_id: '',
      station_name: '',
      latitude: '',
      longitude: '',
      station_type: 'engine'
    });
  }, [newStationData, onStationAdd]);

  /**
   * Handle boundary file upload
   */
  const handleBoundaryUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('🗺️ Processing uploaded boundary file:', file.name, 'Size:', file.size, 'bytes');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Try to parse as GeoJSON
        if (file.name.toLowerCase().endsWith('.geojson') || file.name.toLowerCase().endsWith('.json')) {
          const geoData = JSON.parse(text);
          console.log('✅ Successfully parsed GeoJSON boundary file');
          
          if (onBoundaryUpload) {
            onBoundaryUpload(geoData);
          }
        } else {
          alert('Please upload a GeoJSON (.geojson or .json) file for jurisdiction boundaries');
          return;
        }
        
        // Clear the file input
        event.target.value = '';

      } catch (error) {
        console.error('❌ Error parsing boundary file:', error);
        alert('Error parsing boundary file. Please check the format and try again.');
      }
    };

    reader.readAsText(file);
  }, [onBoundaryUpload]);

  /**
   * Handle file upload for station data
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Processing uploaded file:', file.name, 'Size:', file.size, 'bytes');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
        
        if (lines.length < 2) {
          alert('CSV file appears to be empty or invalid');
          return;
        }

        // Parse CSV with proper quoted field handling
        const parseCSVLine = (line: string): string[] => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        // Parse header row
        const headers = parseCSVLine(lines[0]);
        console.log('📊 CSV Headers:', headers);

        // Parse data rows
        const stations = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          
          if (values.length !== headers.length) {
            console.warn(`Row ${i} has ${values.length} values but ${headers.length} headers. Skipping.`);
            continue;
          }

          // Create station object from CSV row
          const station: any = {};
          headers.forEach((header, index) => {
            const value = values[index];
            
            // Convert numeric fields
            if (header === 'latitude' || header === 'longitude') {
              station[header] = parseFloat(value);
            } else if (header === 'apparatus_count' || header === 'staffing_level') {
              station[header] = parseInt(value) || 0;
            } else {
              station[header] = value;
            }
          });

          // Validate required fields
          if (station.station_id && station.station_name && 
              !isNaN(station.latitude) && !isNaN(station.longitude)) {
            stations.push(station);
          } else {
            console.warn(`Row ${i} missing required fields:`, station);
          }
        }

        console.log('✅ Successfully parsed', stations.length, 'stations from CSV');
        
        if (stations.length === 0) {
          alert('No valid stations found in CSV file. Please check the format.');
          return;
        }

        onStationDataImport(stations);
        
        // Clear the file input
        event.target.value = '';

      } catch (error) {
        console.error('❌ Error parsing CSV file:', error);
        alert('Error parsing CSV file. Please check the format and try again.');
      }
    };

    reader.readAsText(file);
  }, [onStationDataImport]);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Station Coverage Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure stations and analysis parameters
        </Typography>
      </Box>

      {/* Station Data Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StationIcon color="primary" />
            <Typography variant="subtitle1">Station Data</Typography>
            <Chip label={`${stations.length} stations`} size="small" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* File Upload */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Import Station Data
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload CSV/Excel
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Required fields: Station ID, Name, Latitude, Longitude
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Manual Station Entry */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Add Station Manually
            </Typography>
            <TextField
              fullWidth
              label="Station ID"
              value={newStationData.station_id}
              onChange={(e) => setNewStationData(prev => ({ ...prev, station_id: e.target.value }))}
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              label="Station Name"
              value={newStationData.station_name}
              onChange={(e) => setNewStationData(prev => ({ ...prev, station_name: e.target.value }))}
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Latitude"
                value={newStationData.latitude}
                onChange={(e) => setNewStationData(prev => ({ ...prev, latitude: e.target.value }))}
                size="small"
                type="number"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Longitude"
                value={newStationData.longitude}
                onChange={(e) => setNewStationData(prev => ({ ...prev, longitude: e.target.value }))}
                size="small"
                type="number"
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              select
              label="Station Type"
              value={newStationData.station_type}
              onChange={(e) => setNewStationData(prev => ({ ...prev, station_type: e.target.value }))}
              size="small"
              sx={{ mb: 2 }}
              SelectProps={{ native: true }}
            >
              <option value="engine">Engine Company</option>
              <option value="ladder">Ladder Company</option>
              <option value="rescue">Rescue Company</option>
              <option value="hazmat">Hazmat Unit</option>
              <option value="ems">EMS Station</option>
            </TextField>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddStation}
              startIcon={<AddIcon />}
            >
              Add Station
            </Button>
          </Box>

          {/* Station List */}
          {stations.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Stations
              </Typography>
              <List dense>
                {stations.map((station, index) => (
                  <ListItem
                    key={station.station_id || index}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Edit Station">
                          <IconButton size="small" onClick={() => onStationEdit(station)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Station">
                          <IconButton size="small" onClick={() => onStationDelete(station.station_id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <StationIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={station.station_name}
                      secondary={`${station.station_id} • ${station.station_type}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* NFPA Standards Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StandardIcon color="primary" />
            <Typography variant="subtitle1">NFPA Standards</Typography>
            <Chip label={coverageStandard.toUpperCase()} size="small" color="primary" />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset">
            <FormLabel component="legend">Response Time Standard</FormLabel>
            <RadioGroup
              value={coverageStandard}
              onChange={(e) => onCoverageStandardChange(e.target.value as 'nfpa1710' | 'nfpa1720')}
            >
              <FormControlLabel
                value="nfpa1710"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2">NFPA 1710 - Career Departments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      4-minute travel time • 90% coverage requirement
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="nfpa1720"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2">NFPA 1720 - Volunteer Departments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      8-minute travel time • 80% coverage requirement
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              NFPA standards define response time requirements for fire departments. 
              Career departments (1710) have stricter requirements than volunteer departments (1720).
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Analysis Configuration */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoundaryIcon color="primary" />
            <Typography variant="subtitle1">Analysis Configuration</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            Configure analysis parameters and jurisdiction boundaries.
          </Typography>
          
          <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
            Draw Jurisdiction Boundary
          </Button>
          
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 1 }}
            startIcon={<UploadIcon />}
          >
            Upload Boundary File
            <input
              type="file"
              hidden
              accept=".geojson,.json"
              onChange={handleBoundaryUpload}
            />
          </Button>
          
          
          {jurisdictionBoundary && (
            <Alert severity="success" sx={{ mb: 1 }}>
              <Typography variant="body2">
                Jurisdiction boundary loaded successfully
              </Typography>
            </Alert>
          )}
          
          <Typography variant="caption" color="text.secondary">
            Define your service area to calculate accurate coverage metrics
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default StationCoverageSidebar;