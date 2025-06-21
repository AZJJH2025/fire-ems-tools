/**
 * Simple Map Test - Minimal map implementation
 * 
 * Tests map instance stability without any Redux, complex state, or child components.
 * This is the absolute minimal test to see if the issue is architectural.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Chip, Stack } from '@mui/material';
import L from 'leaflet';

interface MapEvent {
  timestamp: number;
  type: string;
  details: any;
}

const SimpleMapTest: React.FC = () => {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [mapId, setMapId] = useState<string>('');
  const [renderCount, setRenderCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [events, setEvents] = useState<MapEvent[]>([]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  // Track every render
  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      console.log(`[SimpleMapTest] Render #${newCount}`);
      addEvent('component-render', { renderNumber: newCount });
      return newCount;
    });
  });

  const addEvent = (type: string, details: any) => {
    const event: MapEvent = {
      timestamp: Date.now(),
      type,
      details
    };
    setEvents(prev => [...prev.slice(-19), event]); // Keep last 20 events
    console.log(`[SimpleMapTest] ${type}:`, details);
  };

  const createMap = () => {
    if (!mapRef.current || mapInstanceRef.current) {
      addEvent('create-map-skipped', { 
        reason: !mapRef.current ? 'no-container' : 'map-exists',
        existingMapId: (mapInstanceRef.current as any)?._leaflet_id 
      });
      return;
    }

    addEvent('create-map-start', {});

    try {
      // Create the simplest possible Leaflet map
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 8,
        zoomControl: true,
        attributionControl: true
      });

      // Add basic tile layer
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      });

      tileLayer.addTo(map);

      const newMapId = `map_${(map as any)._leaflet_id}`;
      setMapId(newMapId);
      setMapInstance(map);
      mapInstanceRef.current = map;

      addEvent('map-created', { mapId: newMapId });

      // Add a single click handler to test event persistence
      const clickHandler = (e: L.LeafletMouseEvent) => {
        setClickCount(prev => {
          const newCount = prev + 1;
          addEvent('map-clicked', { 
            coordinates: [e.latlng.lat, e.latlng.lng],
            clickNumber: newCount
          });
          return newCount;
        });
      };

      map.on('click', clickHandler);
      clickHandlerRef.current = clickHandler;

      addEvent('click-handler-attached', {});

      // Expose for debugging
      if (typeof window !== 'undefined') {
        (window as any).simpleTestMap = map;
        addEvent('map-exposed-globally', { mapId: newMapId });
      }

    } catch (error) {
      addEvent('map-creation-error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const destroyMap = () => {
    if (!mapInstanceRef.current) {
      addEvent('destroy-map-skipped', { reason: 'no-map' });
      return;
    }

    addEvent('destroy-map-start', { mapId });

    try {
      // Remove click handler
      if (clickHandlerRef.current) {
        mapInstanceRef.current.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
        addEvent('click-handler-removed', {});
      }

      // Remove map
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      setMapInstance(null);
      setMapId('');

      addEvent('map-destroyed', {});

    } catch (error) {
      addEvent('map-destruction-error', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const checkMapStability = () => {
    if (!mapInstanceRef.current) {
      addEvent('stability-check', { result: 'no-map' });
      return;
    }

    const currentMapId = `map_${(mapInstanceRef.current as any)._leaflet_id}`;
    const stable = currentMapId === mapId;
    
    addEvent('stability-check', {
      originalMapId: mapId,
      currentMapId,
      stable,
      hasClickHandler: !!clickHandlerRef.current
    });

    // Test if click handler is still working
    if (mapInstanceRef.current && clickHandlerRef.current) {
      // Fire a programmatic click to test event system
      mapInstanceRef.current.fire('click', { 
        latlng: L.latLng(40, -100),
        originalEvent: new Event('click')
      } as any);
    }
  };

  const forceReRender = () => {
    addEvent('force-rerender', {});
    setRenderCount(prev => prev); // This will trigger a re-render
  };

  // Cleanup on unmount
  useEffect(() => {
    addEvent('component-mounted', {});
    
    return () => {
      addEvent('component-unmounting', {});
      destroyMap();
    };
  }, []); // Empty deps to run only once

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Simple Map Test - Minimal Implementation
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={createMap} disabled={!!mapInstance}>
          Create Map
        </Button>
        <Button variant="outlined" onClick={destroyMap} disabled={!mapInstance}>
          Destroy Map
        </Button>
        <Button variant="outlined" onClick={checkMapStability} disabled={!mapInstance}>
          Check Stability
        </Button>
        <Button variant="outlined" onClick={forceReRender}>
          Force Re-render
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={`Renders: ${renderCount}`} 
          color={renderCount > 10 ? 'error' : renderCount > 5 ? 'warning' : 'default'}
        />
        <Chip 
          label={`Clicks: ${clickCount}`} 
          color="primary"
        />
        <Chip 
          label={mapInstance ? `Map: ${mapId}` : 'No Map'} 
          color={mapInstance ? 'success' : 'default'}
        />
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        {/* Events Log */}
        <Box sx={{ flex: 1, maxHeight: '300px', overflow: 'auto', p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>Events Log</Typography>
          {events.map((event, index) => (
            <Box key={index} sx={{ mb: 1, fontSize: '0.75rem' }}>
              <Typography variant="body2" color="primary">
                {new Date(event.timestamp).toLocaleTimeString()}: {event.type}
              </Typography>
              <Typography variant="caption" color="text.secondary" component="pre">
                {JSON.stringify(event.details, null, 2)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Map Container */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom>Test Map (Click to test events)</Typography>
          <Box
            ref={mapRef}
            sx={{
              height: '300px',
              width: '100%',
              border: '2px solid',
              borderColor: mapInstance ? 'success.main' : 'grey.300',
              borderRadius: 1,
              backgroundColor: mapInstance ? 'transparent' : 'grey.50'
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Map Status: {mapInstance ? `Active (${mapId})` : 'Not Created'}
          </Typography>
        </Box>
      </Box>

      {/* Findings Summary */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Key Findings</Typography>
        <Typography variant="body2">
          • This minimal test creates a map without Redux, React-Leaflet, or complex state management
        </Typography>
        <Typography variant="body2">
          • If this map stays stable, the issue is in the complex architecture
        </Typography>
        <Typography variant="body2">
          • If this map also recreates, the issue is more fundamental
        </Typography>
        <Typography variant="body2">
          • Watch the Events Log to see what triggers map recreation
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleMapTest;