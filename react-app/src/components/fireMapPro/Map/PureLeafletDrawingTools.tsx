/**
 * Pure Leaflet Drawing Tools
 * 
 * Implements drawing functionality using native Leaflet drawing APIs
 * instead of React-Leaflet drawing components.
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';

import { 
  selectDrawingState, 
  selectLayers,
  setDrawingMode, 
  addFeature 
} from '@/state/redux/fireMapProSlice';
import { MapFeature, FeatureType } from '@/types/fireMapPro';

interface PureLeafletDrawingToolsProps {
  map: L.Map | null;
}

const PureLeafletDrawingTools: React.FC<PureLeafletDrawingToolsProps> = ({ map }) => {
  const dispatch = useDispatch();
  const drawingState = useSelector(selectDrawingState);
  const layers = useSelector(selectLayers);
  const drawingModeRef = useRef<string | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  
  // Get the first feature layer as default target
  const targetLayer = layers.find(layer => layer.type === 'feature');

  // Generate unique feature ID
  const generateFeatureId = (): string => {
    return `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Create feature from drawing event
  const createFeatureFromEvent = (event: any, type: FeatureType): MapFeature => {
    const layer = event.layer;
    let coordinates: number[] | number[][] | number[][][] = [];
    
    switch (type) {
      case 'marker':
        const latlng = layer.getLatLng();
        coordinates = [latlng.lng, latlng.lat];
        break;
        
      case 'circle':
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        coordinates = [center.lng, center.lat, radius];
        break;
        
      case 'polygon':
        coordinates = [layer.getLatLngs()[0].map((ll: any) => [ll.lng, ll.lat])];
        break;
        
      case 'polyline':
        coordinates = layer.getLatLngs().map((ll: any) => [ll.lng, ll.lat]);
        break;
        
      case 'rectangle':
        const bounds = layer.getBounds();
        coordinates = [
          [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
          [bounds.getNorthEast().lng, bounds.getNorthEast().lat]
        ];
        break;
    }

    return {
      id: generateFeatureId(),
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Feature`,
      description: `Drawing created at ${new Date().toLocaleTimeString()}`,
      coordinates,
      style: {
        color: drawingState.options.style.color,
        fillColor: drawingState.options.style.fillColor,
        fillOpacity: drawingState.options.style.fillOpacity,
        weight: drawingState.options.style.weight,
        opacity: drawingState.options.style.opacity
      },
      properties: {
        created: new Date().toISOString(),
        drawingMode: type
      },
      layerId: 'user-drawings',
      created: new Date(),
      modified: new Date()
    };
  };

  // Setup drawing mode handlers
  useEffect(() => {
    console.log('[PureLeafletDrawingTools] Effect triggered with:', { 
      hasMap: !!map, 
      drawingMode: drawingState.mode 
    });
    if (!map || !drawingState.mode) {
      console.log('[PureLeafletDrawingTools] Skipping setup - no map or no drawing mode');
      return;
    }

    console.log(`[DrawingTools] Setting up ${drawingState.mode} drawing mode`);
    drawingModeRef.current = drawingState.mode;
    isDrawingRef.current = true;

    // Create drawing control based on mode
    let isDrawing = false;
    let tempLayer: L.Layer | null = null;

    const startDrawing = (e: L.LeafletMouseEvent) => {
      if (isDrawing || !drawingModeRef.current) return;
      
      // Stop event from triggering map pan, but allow the drawing to work
      L.DomEvent.stopPropagation(e.originalEvent);
      
      isDrawing = true;
      console.log(`[DrawingTools] Started drawing ${drawingModeRef.current}`);
      
      // Disable map dragging only during active drawing
      map.dragging.disable();

      switch (drawingModeRef.current) {
        case 'marker':
          // Create marker immediately
          const marker = L.marker(e.latlng);
          if (!targetLayer) return;
          const markerFeature = createFeatureFromEvent({ layer: marker }, 'marker');
          const { id, created, modified, ...featureWithoutIds } = markerFeature;
          dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
          dispatch(setDrawingMode(null));
          isDrawing = false;
          // Re-enable map dragging
          map.dragging.enable();
          break;

        case 'circle':
          // Start circle drawing
          tempLayer = L.circle(e.latlng, { radius: 0 });
          tempLayer.addTo(map);
          break;

        case 'rectangle':
          // Start rectangle drawing
          tempLayer = L.rectangle([[e.latlng.lat, e.latlng.lng], [e.latlng.lat, e.latlng.lng]]);
          tempLayer.addTo(map);
          break;
      }
    };

    const continueDrawing = (e: L.LeafletMouseEvent) => {
      if (!isDrawing || !tempLayer || !drawingModeRef.current) return;
      
      // Stop event propagation to prevent map panning
      L.DomEvent.stopPropagation(e.originalEvent);

      switch (drawingModeRef.current) {
        case 'circle':
          const startLatLng = (tempLayer as L.Circle).getLatLng();
          const radius = startLatLng.distanceTo(e.latlng);
          (tempLayer as L.Circle).setRadius(radius);
          break;

        case 'rectangle':
          const bounds = L.latLngBounds([
            (tempLayer as L.Rectangle).getBounds().getSouthWest(),
            e.latlng
          ]);
          (tempLayer as L.Rectangle).setBounds(bounds);
          break;
      }
    };

    const finishDrawing = (e: L.LeafletMouseEvent) => {
      if (!isDrawing || !tempLayer || !drawingModeRef.current) return;

      // Stop event propagation to prevent map interaction
      L.DomEvent.stopPropagation(e.originalEvent);

      console.log(`[DrawingTools] Finished drawing ${drawingModeRef.current}`);
      
      if (!targetLayer) return;
      const feature = createFeatureFromEvent({ layer: tempLayer }, drawingModeRef.current as FeatureType);
      const { id, created, modified, ...featureWithoutIds } = feature;
      dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
      
      map.removeLayer(tempLayer);
      tempLayer = null;
      isDrawing = false;
      
      // Re-enable map dragging
      map.dragging.enable();
      
      dispatch(setDrawingMode(null));
    };

    const cancelDrawing = () => {
      if (tempLayer) {
        map.removeLayer(tempLayer);
        tempLayer = null;
      }
      isDrawing = false;
      
      // Re-enable map dragging
      map.dragging.enable();
      
      dispatch(setDrawingMode(null));
    };

    // Add event listeners
    map.on('click', startDrawing);
    map.on('mousemove', continueDrawing);
    map.on('dblclick', finishDrawing);
    
    // ESC key to cancel
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrawing();
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    // Change cursor to crosshair
    map.getContainer().style.cursor = 'crosshair';

    // Cleanup function
    return () => {
      map.off('click', startDrawing);
      map.off('mousemove', continueDrawing);
      map.off('dblclick', finishDrawing);
      document.removeEventListener('keydown', handleKeyPress);
      
      if (tempLayer) {
        map.removeLayer(tempLayer);
      }
      
      map.getContainer().style.cursor = '';
      isDrawingRef.current = false;
      drawingModeRef.current = null;
      
      console.log('[DrawingTools] Cleaned up drawing mode');
    };

  }, [map, drawingState.mode, dispatch, drawingState.options]);

  return null; // This component doesn't render anything
};

export default PureLeafletDrawingTools;