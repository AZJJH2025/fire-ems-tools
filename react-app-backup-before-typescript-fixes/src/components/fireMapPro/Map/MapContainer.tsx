/**
 * Map Container Component
 * 
 * Core map component that renders the Leaflet map with all layers,
 * features, and interactive controls.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import * as L from 'leaflet';

import { RootState } from '@/state/redux/store';
import {
  selectMapState,
  selectDrawingState,
  selectLayers,
  updateMapView,
  setError,
  addFeature
} from '@/state/redux/fireMapProSlice';

// Import map components
import LayerRenderer from './LayerRenderer';
import MapControls from './MapControls';
import { CoordinateDisplayUI, MouseTracker } from './CoordinateDisplay';
import MeasurementDisplay from './MeasurementDisplay';
import DirectTileLayer from './DirectTileLayer';
import PureLeafletMap from './PureLeafletMap';
import PureLeafletLayerManager from './PureLeafletLayerManager';
import PureLeafletDrawTools from './PureLeafletDrawTools';
import PureLeafletDragDrop from './PureLeafletDragDrop';
import TestDirectRender from './TestDirectRender';
import MapDebugger from '../Debug/MapDebugger';

// Fix for default markers in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Map Event Handler Component
 * Handles map events and updates Redux state
 */
const MapEventHandler: React.FC = () => {
  const dispatch = useDispatch();
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      
      dispatch(updateMapView({
        center: { latitude: center.lat, longitude: center.lng },
        zoom,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }
      }));
    },
    
    zoomend: () => {
      const zoom = map.getZoom();
      dispatch(updateMapView({ zoom }));
    },
    
    click: (e) => {
      // Handle map clicks for drawing and selection
      console.log('Map clicked at:', e.latlng);
    },
    
    contextmenu: (e) => {
      // Handle right-click context menu
      e.originalEvent.preventDefault();
      console.log('Context menu at:', e.latlng);
    }
  });

  return null;
};

/**
 * Map Setup Component
 * Handles initial map configuration and ongoing updates
 */
const MapSetup: React.FC = () => {
  const map = useMap();
  const mapState = useSelector(selectMapState);
  const dispatch = useDispatch();

  // Update map view when Redux state changes
  useEffect(() => {
    const { center, zoom } = mapState.view;
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    
    // Only update if significantly different to avoid unnecessary re-renders
    const centerChanged = Math.abs(currentCenter.lat - center.latitude) > 0.0001 || 
                         Math.abs(currentCenter.lng - center.longitude) > 0.0001;
    const zoomChanged = Math.abs(currentZoom - zoom) > 0.1;
    
    if (centerChanged || zoomChanged) {
      map.setView([center.latitude, center.longitude], zoom);
    }
  }, [map, mapState.view]);

  // Handle base map changes
  useEffect(() => {
    const activeBaseMap = mapState.baseMaps.find(bm => bm.id === mapState.activeBaseMap);
    if (activeBaseMap) {
      // Base map tiles are handled by TileLayer component
      console.log('Active base map:', activeBaseMap.name);
    }
  }, [mapState.activeBaseMap, mapState.baseMaps]);

  return null;
};

/**
 * Main Map Container Component
 */
const MapContainer: React.FC = () => {
  const dispatch = useDispatch();
  const mapState = useSelector(selectMapState);
  const drawingState = useSelector(selectDrawingState);
  const layers = useSelector(selectLayers);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Get active base map configuration
  const activeBaseMap = mapState.baseMaps.find(bm => bm.id === mapState.activeBaseMap);

  // Memoized map ready callback to prevent recreation
  const handleMapReady = useCallback((map: L.Map, container: HTMLElement) => {
    mapRef.current = map;
    setMapContainer(container);
    setIsMapReady(true);
    
    // Expose map globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).fireMapProInstance = map;
      console.log('✓ Pure Leaflet map exposed as window.fireMapProInstance');
    }
  }, []); // Empty deps - these setters are stable


  // Handle map loading errors
  const handleTileError = (error: any) => {
    console.error('Tile loading error:', error);
    // Don't show error immediately, tiles sometimes fail and retry
    setTimeout(() => {
      dispatch(setError('Some map tiles failed to load. This is normal and should not affect functionality.'));
    }, 5000);
  };

  // Clear error when base map changes
  React.useEffect(() => {
    dispatch(setError(null));
  }, [mapState.activeBaseMap, dispatch]);

  if (!activeBaseMap) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: 'grey.100'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No base map configured
        </Typography>
      </Box>
    );
  }

  // Handle icon drop from library
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const iconData = JSON.parse(event.dataTransfer.getData('application/json'));
      const mapElement = event.currentTarget as HTMLElement;
      const rect = mapElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      if (mapRef.current && iconData) {
        const latlng = mapRef.current.containerPointToLatLng([x, y]);
        
        // Find the first feature layer to add the icon to
        const targetLayer = layers.find(layer => layer.type === 'feature');
        
        if (targetLayer) {
          // Create a new feature with the dropped icon
          const newFeature = {
            type: 'marker' as const,
            title: iconData.name,
            description: `${iconData.name} - Click to edit`,
            coordinates: [latlng.lng, latlng.lat],
            style: {
              ...iconData,
              icon: iconData
            },
            properties: {
              iconCategory: iconData.category,
              droppedFrom: 'icon-library'
            },
            layerId: targetLayer.id
          };
          
          dispatch(addFeature({
            layerId: targetLayer.id,
            feature: newFeature
          }));
          
          console.log('Icon placed successfully:', iconData.name, 'at', latlng);
        } else {
          dispatch(setError('Please create a feature layer first to place icons'));
        }
      }
    } catch (error) {
      console.error('Error handling icon drop:', error);
      dispatch(setError('Error placing icon on map'));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        minHeight: '500px', // Ensure minimum height
        '& .leaflet-container': {
          height: '100% !important',
          width: '100% !important',
          position: 'relative !important'
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Pure Leaflet Map with Layer Management */}
      <PureLeafletMap
        onMapReady={handleMapReady}
      >
        {/* Feature Layer Manager - delay to ensure map is fully ready */}
        {isMapReady && mapRef.current && mapContainer && (
          <PureLeafletLayerManager map={mapRef.current} />
        )}
        
        {/* Drawing Tools - mount always to run diagnostics */}
        {isMapReady && mapRef.current && mapContainer && (
          <PureLeafletDrawTools map={mapRef.current} />
        )}
        
        {/* Drag & Drop Handler */}
        {isMapReady && mapRef.current && mapContainer && (
          <PureLeafletDragDrop map={mapRef.current} mapContainer={mapContainer} />
        )}
        
        {/* Test Direct Render - adds test shapes to verify map rendering works */}
        {isMapReady && mapRef.current && process.env.NODE_ENV === 'development' && (
          <TestDirectRender map={mapRef.current} />
        )}
      </PureLeafletMap>

      {/* Coordinate Display */}
      {mapState.showCoordinates && <CoordinateDisplayUI mouseCoords={mouseCoords} />}

      {/* Measurement Display */}
      {drawingState.options.showMeasurements && <MeasurementDisplay />}

      {/* Debug Information (development only) */}
      {process.env.NODE_ENV === 'development' && <MapDebugger />}

      {/* Grid Overlay */}
      {mapState.showGrid && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            zIndex: 1000
          }}
        />
      )}

      {/* Loading Indicator */}
      {!isMapReady && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 2000
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading map...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapContainer;