import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { RootState } from '@/state/redux/store';
import { IncidentRecord } from '@/types/analyzer';
import { calculateIncidentMetrics, formatResponseTime } from '@/utils/responseTimeCalculator';

// Constants for map settings
const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 }; // Los Angeles by default
const DEFAULT_ZOOM = 11;

// Real Leaflet map implementation
const MapContainer: React.FC<{
  incidents: IncidentRecord[];
  colorBy: 'responseTime' | 'incidentType' | 'unit';
  onIncidentSelect?: (incidentId: string) => void;
}> = ({ incidents, colorBy, onIncidentSelect }) => {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const { expandedPanels } = useSelector((state: RootState) => state.analyzer.ui);
  const isFullscreen = expandedPanels.includes('incident-map');
  
  // HOTFIX: Convert uppercase field names to lowercase for coordinates
  const normalizedIncidents = useMemo(() => {
    return incidents.map(incident => {
      const normalized = { ...incident };
      
      // Convert Latitude/Longitude to latitude/longitude if they exist
      if ((incident as any)['Latitude'] !== undefined && !incident.latitude) {
        normalized.latitude = (incident as any)['Latitude'];
      }
      if ((incident as any)['Longitude'] !== undefined && !incident.longitude) {
        normalized.longitude = (incident as any)['Longitude'];
      }
      if ((incident as any)['Address'] !== undefined && !incident.address) {
        normalized.address = (incident as any)['Address'];
      }
      
      console.log('HOTFIX: Converted field names for incident:', incident.incidentId, 
                 'lat:', normalized.latitude, 'lng:', normalized.longitude);
      
      return normalized;
    });
  }, [incidents]);
  
  // Calculate map center based on incidents
  const center = useMemo(() => {
    if (normalizedIncidents.length === 0) return DEFAULT_CENTER;
    
    // Filter out incidents without coordinates
    const incidentsWithCoords = normalizedIncidents.filter(
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
  }, [normalizedIncidents]);
  
  // Count incidents with coordinates
  const validIncidentCount = useMemo(() => {
    return normalizedIncidents.filter(inc => inc.latitude != null && inc.longitude != null).length;
  }, [normalizedIncidents]);
  
  // Helper function to get marker color based on colorBy setting
  const getMarkerColor = (incident: IncidentRecord): string => {
    if (colorBy === 'responseTime') {
      const metrics = calculateIncidentMetrics(incident);
      const totalSeconds = metrics.totalResponseTime;
      if (totalSeconds === null) return '#9e9e9e'; // gray for unknown
      
      // Convert seconds to minutes for color thresholds
      const totalMinutes = totalSeconds / 60;
      
      if (totalMinutes < 4) return '#4caf50'; // green
      if (totalMinutes < 8) return '#2196f3'; // blue  
      if (totalMinutes < 12) return '#ff9800'; // orange
      return '#f44336'; // red
    } else if (colorBy === 'incidentType') {
      const type = (typeof incident.incidentType === 'string' ? incident.incidentType : String(incident.incidentType || '')).toLowerCase() || 'other';
      if (type.includes('fire')) return '#f44336'; // red
      if (type.includes('ems') || type.includes('medical')) return '#2196f3'; // blue
      if (type.includes('rescue')) return '#ff9800'; // orange
      return '#4caf50'; // green for other
    } else if (colorBy === 'unit') {
      // This would need unit information - for now, use incident type as proxy
      const type = (typeof incident.incidentType === 'string' ? incident.incidentType : String(incident.incidentType || '')).toLowerCase() || 'other';
      if (type.includes('engine')) return '#f44336'; // red
      if (type.includes('ambulance') || type.includes('ems')) return '#2196f3'; // blue
      if (type.includes('truck')) return '#ff9800'; // orange
      return '#4caf50'; // green for other
    }
    return '#2196f3'; // default blue
  };
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Create map instance
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Create marker layer group
    const markerGroup = L.layerGroup().addTo(map);
    
    // Store references
    mapInstanceRef.current = map;
    markersRef.current = markerGroup;
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);
  
  // Update map center when incidents change
  useEffect(() => {
    if (mapInstanceRef.current && validIncidentCount > 0) {
      mapInstanceRef.current.setView([center.lat, center.lng], DEFAULT_ZOOM);
    }
  }, [center, validIncidentCount]);
  
  // Force map resize to fill container
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Small delay to ensure container has rendered
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [normalizedIncidents]);
  
  // Add resize observer to handle container size changes (like fullscreen)
  useEffect(() => {
    if (!mapRef.current || !mapInstanceRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        // Map is in fullscreen if the incident-map panel is expanded
        
        // Delay to ensure the container has finished resizing
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 150);
      }
    });
    
    resizeObserver.observe(mapRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Update markers when incidents or colorBy changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;
    
    // Clear existing markers
    markersRef.current.clearLayers();
    
    // Add markers for incidents with coordinates
    const incidentsWithCoords = normalizedIncidents.filter(
      inc => inc.latitude != null && inc.longitude != null
    );
    
    incidentsWithCoords.forEach(incident => {
      const lat = incident.latitude!;
      const lng = incident.longitude!;
      const color = getMarkerColor(incident);
      
      // Create custom icon with the appropriate color
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      // Create marker
      const marker = L.marker([lat, lng], { icon: markerIcon });
      
      // Create popup content
      const metrics = calculateIncidentMetrics(incident);
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0;">Incident ${incident.incidentId}</h4>
          <p style="margin: 0 0 4px 0;"><strong>Type:</strong> ${incident.incidentType || 'Unknown'}</p>
          <p style="margin: 0 0 4px 0;"><strong>Date:</strong> ${incident.incidentDate || 'Unknown'}</p>
          <p style="margin: 0 0 4px 0;"><strong>Response Time:</strong> ${formatResponseTime(metrics.totalResponseTime)}</p>
          ${incident.address ? `<p style="margin: 0 0 4px 0;"><strong>Address:</strong> ${incident.address}</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        if (onIncidentSelect) {
          onIncidentSelect(incident.incidentId);
        }
      });
      
      // Add to marker group
      markersRef.current!.addLayer(marker);
    });
    
    // Fit map to markers if we have any
    if (incidentsWithCoords.length > 0) {
      const group = new L.FeatureGroup(markersRef.current.getLayers());
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [normalizedIncidents, colorBy, onIncidentSelect]);
  
  if (validIncidentCount === 0) {
    return (
      <Box
        sx={{
          position: 'relative',
          height: 500,
          width: '100%',
          bgcolor: theme.palette.grey[100],
          borderRadius: 1,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
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
    );
  }
  
  return (
    <Box
      sx={{
        position: 'relative',
        height: isFullscreen ? 'calc(100vh - 200px)' : '100%',
        minHeight: { xs: 500, sm: 600, md: 700 },
        width: '100%',
        maxWidth: '100%',
        borderRadius: 1,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        '& .leaflet-container': {
          width: '100% !important',
          height: '100% !important'
        }
      }}
    >
      {/* Map container */}
      <div ref={mapRef} style={{ height: '100%', width: '100%', minWidth: '300px' }} />
      
      {/* Map overlay with incident counts */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000
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
          boxShadow: 2,
          zIndex: 1000
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
              <Chip size="small" label="< 4 min" sx={{ bgcolor: '#4caf50', color: 'white' }} />
              <Chip size="small" label="4-8 min" sx={{ bgcolor: '#2196f3', color: 'white' }} />
              <Chip size="small" label="8-12 min" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip size="small" label="> 12 min" sx={{ bgcolor: '#f44336', color: 'white' }} />
              <Chip size="small" label="No time data" sx={{ bgcolor: '#9e9e9e', color: 'white' }} />
            </>
          )}
          {colorBy === 'incidentType' && (
            <>
              <Chip size="small" label="Fire" sx={{ bgcolor: '#f44336', color: 'white' }} />
              <Chip size="small" label="EMS" sx={{ bgcolor: '#2196f3', color: 'white' }} />
              <Chip size="small" label="Rescue" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip size="small" label="Other" sx={{ bgcolor: '#4caf50', color: 'white' }} />
            </>
          )}
          {colorBy === 'unit' && (
            <>
              <Chip size="small" label="Engine" sx={{ bgcolor: '#f44336', color: 'white' }} />
              <Chip size="small" label="Ambulance" sx={{ bgcolor: '#2196f3', color: 'white' }} />
              <Chip size="small" label="Truck" sx={{ bgcolor: '#ff9800', color: 'white' }} />
              <Chip size="small" label="Other" sx={{ bgcolor: '#4caf50', color: 'white' }} />
            </>
          )}
        </Box>
      </Box>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body1">
                {incident.incidentDate} {incident.incidentTime ? `at ${incident.incidentTime}` : ''}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Dispatch:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.dispatchTime)}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Turnout:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.turnoutTime)}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">Travel:</Typography>
            <Typography variant="body1">{formatResponseTime(metrics.travelTime)}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">Average:</Typography>
            <Typography variant="body1">{formatResponseTime(responseTimeStats.mean.totalResponseTime)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">Median:</Typography>
            <Typography variant="body1">{formatResponseTime(responseTimeStats.median.totalResponseTime)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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
  console.log('INCIDENT_MAP_COMPONENT: Component is rendering!');
  
  const dispatch = useDispatch();
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  
  console.log('INCIDENT_MAP_COMPONENT: Received', incidents?.length || 0, 'incidents');
  
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
  
  // Handle incident selection from map
  const handleIncidentSelect = (incidentId: string) => {
    dispatch({ type: 'analyzer/setSelectedIncident', payload: incidentId });
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
        <Grid size={{ xs: 12, md: selectedIncident ? 8 : 12 }} sx={{ width: '100%' }}>
          <Box sx={{ 
            width: '100%', 
            height: '100%',
            minHeight: { xs: 500, sm: 600, md: 700 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MapContainer
                incidents={incidents}
                colorBy={colorBy}
                onIncidentSelect={handleIncidentSelect}
              />
            </Box>
          </Box>
        </Grid>
        
        {/* Incident details and statistics */}
        {selectedIncident && (
          <Grid size={{ xs: 12, md: 4 }}>
            <IncidentDetailsCard incident={selectedIncident} />
            <RegionalStatsCard incidents={incidents} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default IncidentMap;