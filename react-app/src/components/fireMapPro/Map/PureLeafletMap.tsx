/**
 * Pure Leaflet Map - Bypasses React-Leaflet completely
 * 
 * Creates a native Leaflet map directly in a div to test if React-Leaflet
 * is causing the tile rendering issues.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import { selectDrawingState, selectMapState } from '@/state/redux/fireMapProSlice';

// Import Leaflet CSS directly
import 'leaflet/dist/leaflet.css';

interface PureLeafletMapProps {
  onMapReady?: (map: L.Map, container: HTMLElement) => void;
  children?: React.ReactNode;
}

const PureLeafletMap: React.FC<PureLeafletMapProps> = ({ onMapReady, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const initializationInProgress = useRef<boolean>(false);
  const cleanupInProgress = useRef<boolean>(false);
  const drawingState = useSelector(selectDrawingState);
  const mapState = useSelector(selectMapState);

  // Memoize the map ready callback to prevent recreation on prop changes
  const stableOnMapReady = useCallback(onMapReady || (() => {}), [onMapReady]);

  useEffect(() => {
    // Prevent multiple initializations
    if (!mapRef.current || leafletMapRef.current || initializationInProgress.current) {
      return;
    }
    
    initializationInProgress.current = true;
    console.log('[PureLeaflet] Creating pure Leaflet map...');

    // Create the map - disable dragging if in drawing mode
    const isDrawing = !!drawingState.mode;
    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // Center of US
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: !isDrawing, // Disable double click when drawing
      boxZoom: !isDrawing, // Disable box zoom when drawing
      keyboard: true,
      dragging: !isDrawing, // Disable dragging when drawing
      touchZoom: true
    });

    // Add tile layer based on active base map
    const activeBaseMap = mapState.baseMaps.find(bm => bm.id === mapState.activeBaseMap);
    const tileLayer = L.tileLayer(activeBaseMap?.url || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: activeBaseMap?.attribution || '© OpenStreetMap contributors',
      maxZoom: activeBaseMap?.maxZoom || 19,
      minZoom: activeBaseMap?.minZoom || 1,
      tileSize: 256,
      opacity: 1
    });

    currentTileLayerRef.current = tileLayer;
    tileLayer.addTo(map);

    // Event handlers for debugging
    tileLayer.on('tileload', (e) => {
      console.log('[PureLeaflet] Tile loaded:', e.coords);
    });

    tileLayer.on('tileerror', (e) => {
      console.error('[PureLeaflet] Tile error:', e);
    });

    tileLayer.on('loading', () => {
      console.log('[PureLeaflet] Started loading tiles');
    });

    tileLayer.on('load', () => {
      console.log('[PureLeaflet] Finished loading all visible tiles');
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      console.log(`[PureLeaflet] Map moved to: ${center.lat}, ${center.lng} at zoom ${zoom}`);
    });

    // Force immediate sizing
    setTimeout(() => {
      if (map.getContainer()) { // Check if map still exists
        map.invalidateSize();
        console.log('[PureLeaflet] Map size invalidated');
      }
    }, 100);

    leafletMapRef.current = map;

    // Use Leaflet's proper readiness API instead of immediate callback
    map.whenReady(() => {
      console.log('[PureLeaflet] ✓ Map panes and coordinate system ready');
      
      // Expose for debugging
      if (typeof window !== 'undefined') {
        (window as any).pureLeafletMap = map;
        console.log('[PureLeaflet] ✓ Map exposed as window.pureLeafletMap');
      }

      // Validate coordinate system is ready
      if (!(map as any)._size || !map.getPixelOrigin() || !map.getPanes().mapPane) {
        console.error('[PureLeaflet] Map coordinate system not properly initialized');
        return;
      }

      initializationInProgress.current = false;
      
      // Call the callback only when map is truly ready
      if (mapRef.current) {
        stableOnMapReady(map, mapRef.current);
      }
    });

    // Cleanup function
    return () => {
      if (leafletMapRef.current && !cleanupInProgress.current) {
        cleanupInProgress.current = true;
        console.log('[PureLeaflet] Map cleaned up');
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.warn('[PureLeaflet] Error during cleanup:', error);
        }
        leafletMapRef.current = null;
        initializationInProgress.current = false;
        cleanupInProgress.current = false;
      }
    };
  }, []); // Empty dependency array to prevent recreation

  // Effect to handle drawing mode changes - enable/disable map interactions
  useEffect(() => {
    console.log('[PureLeafletMap] Drawing effect triggered with mode:', drawingState.mode);
    const map = leafletMapRef.current;
    if (!map) {
      console.log('[PureLeafletMap] No map instance, skipping drawing effect');
      return;
    }

    const isDrawing = !!drawingState.mode;
    console.log('[PureLeafletMap] isDrawing calculated as:', isDrawing);
    
    if (isDrawing) {
      // Only disable zoom interactions during drawing - drawing tools handle dragging
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      console.log('[PureLeaflet] Zoom interactions disabled for drawing mode:', drawingState.mode);
    } else {
      // Re-enable all map interactions when not drawing
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      console.log('[PureLeaflet] All map interactions enabled - drawing mode off');
    }
  }, [drawingState.mode]);

  // Handle base map changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const activeBaseMap = mapState.baseMaps.find(bm => bm.id === mapState.activeBaseMap);
    if (!activeBaseMap) return;

    // Remove current tile layer
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
      console.log('[PureLeaflet] Removed old tile layer');
    }

    // Add new tile layer
    const newTileLayer = L.tileLayer(activeBaseMap.url, {
      attribution: activeBaseMap.attribution,
      maxZoom: activeBaseMap.maxZoom || 19,
      minZoom: activeBaseMap.minZoom || 1,
      tileSize: 256,
      opacity: 1
    });

    // Event handlers for debugging
    newTileLayer.on('tileload', (e) => {
      console.log('[PureLeaflet] Tile loaded:', e.coords);
    });

    newTileLayer.on('tileerror', (e) => {
      console.error('[PureLeaflet] Tile error:', e);
    });

    newTileLayer.on('loading', () => {
      console.log('[PureLeaflet] Started loading tiles');
    });

    newTileLayer.on('load', () => {
      console.log('[PureLeaflet] Finished loading all visible tiles');
    });

    currentTileLayerRef.current = newTileLayer;
    newTileLayer.addTo(map);
    
    console.log(`[PureLeaflet] Switched to base map: ${activeBaseMap.name}`);
  }, [mapState.activeBaseMap, mapState.baseMaps]);

  return (
    <>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
          background: 'transparent'
        }}
        className="pure-leaflet-map"
      />
      {/* Render children components that need the map instance */}
      {children}
    </>
  );
};

export default PureLeafletMap;