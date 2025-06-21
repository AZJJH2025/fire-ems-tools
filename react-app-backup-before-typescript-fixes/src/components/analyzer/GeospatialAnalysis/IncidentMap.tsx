import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FireTruckIcon from '@mui/icons-material/FireTruck';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import { RootState } from '@/state/redux/store';
import { IncidentRecord } from '@/types/analyzer';
import { calculateIncidentMetrics, formatResponseTime } from '@/utils/responseTimeCalculator';

// Constants for map settings
const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 }; // Los Angeles by default
const DEFAULT_ZOOM = 11;

// Mock implementation of a map component
// In a real implementation, this would use a library like Google Maps, Leaflet, or Mapbox
const MapContainer: React.FC<{
  incidents: IncidentRecord[];
  colorBy: 'responseTime' | 'incidentType' | 'unit';
  selectedIncident: string | null;
  onSelectIncident: (id: string) => void;
}> = ({ incidents, colorBy, selectedIncident, onSelectIncident }) => {
  const theme = useTheme();
  
  // Calculate map center based on incidents
  const center = useMemo(() => {
    if (incidents.length === 0) return DEFAULT_CENTER;
    
    // Filter out incidents without coordinates
    const incidentsWithCoords = incidents.filter(
      inc => inc.latitude != null && inc.longitude != null
    );
    
    if (incidentsWithCoords.length === 0) return DEFAULT_CENTER;
    
    // Calculate average lat/lng
    const sumLat = incidentsWithCoords.reduce(
      (sum, inc) => sum + (inc.latitude || 0), 
      0
    );
    const sumLng = incidentsWithCoords.reduce(
      (sum, inc) => sum + (inc.longitude || 0), 
      0
    );
    
    return {
      lat: sumLat / incidentsWithCoords.length,
      lng: sumLng / incidentsWithCoords.length
    };
  }, [incidents]);
  
  // Count incidents with coordinates
  const validIncidentCount = useMemo(() => {
    return incidents.filter(inc => inc.latitude != null && inc.longitude != null).length;
  }, [incidents]);
  
  // This is a mock implementation - in the real component, we would render an actual map
  return (
    <Box
      sx={{
        position: 'relative',
        height: 500,
        width: '100%',
        bgcolor: theme.palette.grey[100],
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {validIncidentCount === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            p: 3
          }}
        >
          <LocationOnIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Location Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            None of the incidents have valid latitude/longitude coordinates.
            <br />
            Please ensure your data includes location information.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Map background - would be replaced with actual map */}
          <Box 
            sx={{ 
              height: '100%', 
              backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${DEFAULT_ZOOM}&size=600x400&key=YOUR_API_KEY')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" sx={{ bgcolor: 'rgba(255,255,255,0.8)', p: 2, borderRadius: 1 }}>
              Map Visualization (Placeholder)
            </Typography>
          </Box>
          
          {/* Map overlay with incident counts */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <Typography variant="body2" gutterBottom>
              <strong>{validIncidentCount}</strong> incidents with location data
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </Typography>
          </Box>
          
          {/* Legend for color coding */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            <Typography variant="body2" gutterBottom>
              <strong>Color Legend:</strong> 
              {colorBy === 'responseTime' && ' Response Time'}
              {colorBy === 'incidentType' && ' Incident Type'}
              {colorBy === 'unit' && ' Responding Unit'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {colorBy === 'responseTime' && (
                <>
                  <Chip size="small" label="< 4 min" sx={{ bgcolor: theme.palette.success.light }} />
                  <Chip size="small" label="4-8 min" sx={{ bgcolor: theme.palette.info.light }} />
                  <Chip size="small" label="8-12 min" sx={{ bgcolor: theme.palette.warning.light }} />
                  <Chip size="small" label="> 12 min" sx={{ bgcolor: theme.palette.error.light }} />
                </>
              )}
              {colorBy === 'incidentType' && (
                <>
                  <Chip size="small" label="Fire" sx={{ bgcolor: theme.palette.error.light }} />
                  <Chip size="small" label="EMS" sx={{ bgcolor: theme.palette.info.light }} />
                  <Chip size="small" label="Rescue" sx={{ bgcolor: theme.palette.warning.light }} />
                  <Chip size="small" label="Other" sx={{ bgcolor: theme.palette.success.light }} />
                </>
              )}
              {colorBy === 'unit' && (
                <>
                  <Chip size="small" label="Engine" sx={{ bgcolor: theme.palette.error.light }} />
                  <Chip size="small" label="Ambulance" sx={{ bgcolor: theme.palette.info.light }} />
                  <Chip size="small" label="Truck" sx={{ bgcolor: theme.palette.warning.light }} />
                  <Chip size="small" label="Other" sx={{ bgcolor: theme.palette.success.light }} />
                </>
              )}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

// Incident details card
const IncidentDetailsCard: React.FC<{ incident: IncidentRecord }> = ({ incident }) => {
  const metrics = useMemo(() => calculateIncidentMetrics(incident), [incident]);
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Incident {incident.incidentId}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body1">
                {incident.incidentDate} {incident.incidentTime ? `at ${incident.incidentTime}` : ''}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1">
                {incident.incidentType || 'Unknown'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
          <LocationOnIcon color="primary" />
          <Typography>
            {incident.latitude != null && incident.longitude != null
              ? `${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}`
              : 'No coordinates available'}
          </Typography>
        </Box>
        
        {incident.address && (
          <Typography variant="body2" sx={{ ml: 4, mb: 1.5 }}>
            {incident.address}
            {incident.city ? `, ${incident.city}` : ''}
            {incident.state ? `, ${incident.state}` : ''}
            {incident.zipCode ? ` ${incident.zipCode}` : ''}
          </Typography>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Response Times:
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Dispatch:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.dispatchTime)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Turnout:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.turnoutTime)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Travel:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.travelTime)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Total:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.totalResponseTime)}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Regional statistics card
const RegionalStatsCard: React.FC<{ incidents: IncidentRecord[] }> = ({ incidents }) => {
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  
  // Count incidents by type
  const incidentTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(incident => {
      const type = incident.incidentType || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [incidents]);
  
  // Find most common types
  const topTypes = useMemo(() => {
    return Object.entries(incidentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [incidentTypeCounts]);
  
  if (!responseTimeStats) return null;
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Regional Statistics
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Based on {incidents.length} incidents
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Response Times:
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Average:</Typography>
            <Typography variant="body1">{formatResponseTime(responseTimeStats.mean.totalResponseTime)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Median:</Typography>
            <Typography variant="body1">{formatResponseTime(responseTimeStats.median.totalResponseTime)}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">90th Percentile:</Typography>
            <Typography variant="body1">{formatResponseTime(responseTimeStats.ninetiethPercentile.totalResponseTime)}</Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Top Incident Types:
        </Typography>
        
        <Box sx={{ mt: 1 }}>
          {topTypes.map(([type, count]) => (
            <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{type}</Typography>
              <Typography variant="body2">{count} incidents</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// Main component
const IncidentMap: React.FC = () => {
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const selectedIncidentId = useSelector((state: RootState) => state.analyzer.ui.selectedIncidentId);
  const [colorBy, setColorBy] = useState<'responseTime' | 'incidentType' | 'unit'>('responseTime');
  
  // Get selected incident
  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find(inc => inc.incidentId === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);
  
  // Check if incidents have location data
  const hasLocationData = useMemo(() => {
    return incidents.some(inc => inc.latitude != null && inc.longitude != null);
  }, [incidents]);
  
  // Handle color mapping selection
  const handleColorByChange = (event: SelectChangeEvent<string>) => {
    setColorBy(event.target.value as 'responseTime' | 'incidentType' | 'unit');
  };
  
  // Handle incident selection
  const handleSelectIncident = (id: string) => {
    // In a real implementation, this would dispatch setSelectedIncidentId
    console.log(`Selected incident: ${id}`);
  };
  
  // If no incidents
  if (!incidents.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Incident Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No incident data available for mapping.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Incident Map
      </Typography>
      
      {!hasLocationData && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          None of the incidents in your dataset have location coordinates (latitude/longitude).
          The map visualization requires geographic coordinates to display incidents.
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {incidents.length} incidents
        </Typography>
        
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel id="color-by-label">Color By</InputLabel>
          <Select
            labelId="color-by-label"
            value={colorBy}
            label="Color By"
            onChange={handleColorByChange}
          >
            <MenuItem value="responseTime">Response Time</MenuItem>
            <MenuItem value="incidentType">Incident Type</MenuItem>
            <MenuItem value="unit">Responding Unit</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Map */}
        <Grid item xs={12} md={selectedIncident ? 8 : 12}>
          <MapContainer
            incidents={incidents}
            colorBy={colorBy}
            selectedIncident={selectedIncidentId}
            onSelectIncident={handleSelectIncident}
          />
        </Grid>
        
        {/* Incident details and statistics */}
        {selectedIncident && (
          <Grid item xs={12} md={4}>
            <IncidentDetailsCard incident={selectedIncident} />
            <RegionalStatsCard incidents={incidents} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default IncidentMap;