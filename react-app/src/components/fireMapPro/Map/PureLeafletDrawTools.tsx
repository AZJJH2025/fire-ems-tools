/**
 * Pure Leaflet Draw Tools using Custom Implementation
 * 
 * Simple drawing implementation without Leaflet Draw plugin
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';

import { 
  selectDrawingState, 
  selectLayers,
  setDrawingMode, 
  addFeature,
  deleteFeature 
} from '@/state/redux/fireMapProSlice';
import { MapFeature, FeatureType } from '@/types/fireMapPro';

interface PureLeafletDrawToolsProps {
  map: L.Map | null;
}

const PureLeafletDrawTools: React.FC<PureLeafletDrawToolsProps> = ({ map }) => {
  const dispatch = useDispatch();
  const drawingState = useSelector(selectDrawingState);
  const layers = useSelector(selectLayers);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const activeHandlersRef = useRef<Array<{ event: string; handler: (e: any) => void }>>([]);
  
  // Get the first feature layer as default target
  const targetLayer = layers.find(layer => layer.type === 'feature');

  // Centralized event handler management
  const addEventHandler = useCallback((eventType: string, handler: (e: any) => void) => {
    if (!map) return;
    
    console.log('[PureLeafletDrawTools] Adding event handler:', eventType);
    map.on(eventType as any, handler);
    activeHandlersRef.current.push({ event: eventType, handler });
  }, [map]);

  const clearAllEventHandlers = useCallback(() => {
    if (!map) return;
    
    console.log('[PureLeafletDrawTools] Clearing all event handlers');
    activeHandlersRef.current.forEach(({ event, handler }) => {
      map.off(event as any, handler);
    });
    activeHandlersRef.current = [];
    
    // Reset map interactions to default state
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.getContainer().style.cursor = '';
  }, [map]);

  // Generate unique feature ID
  const generateFeatureId = (): string => {
    return `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Convert Leaflet layer to our MapFeature format
  const createFeatureFromLayer = (layer: L.Layer, type: FeatureType): MapFeature => {
    let coordinates: number[] | number[][] | number[][][] = [];
    
    switch (type) {
      case 'marker':
        const marker = layer as L.Marker;
        const latlng = marker.getLatLng();
        coordinates = [latlng.lng, latlng.lat];
        break;
        
      case 'circle':
        const circle = layer as L.Circle;
        const center = circle.getLatLng();
        const radius = circle.getRadius();
        coordinates = [center.lng, center.lat, radius];
        break;
        
      case 'polygon':
        const polygon = layer as L.Polygon;
        coordinates = [(polygon.getLatLngs()[0] as any[]).map((ll: any) => [ll.lng, ll.lat])];
        break;
        
      case 'polyline':
        const polyline = layer as L.Polyline;
        coordinates = polyline.getLatLngs().map((ll: any) => [ll.lng, ll.lat]);
        break;
        
      case 'rectangle':
        const rectangle = layer as L.Rectangle;
        const bounds = rectangle.getBounds();
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
        color: drawingState.options.style?.color,
        fillColor: drawingState.options.style?.fillColor,
        fillOpacity: drawingState.options.style?.fillOpacity,
        weight: drawingState.options.style?.weight,
        opacity: drawingState.options.style?.opacity
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

  // Initialize simple drawing system
  useEffect(() => {
    if (!map) return;

    console.log('[PureLeafletDrawTools] Initializing simple drawing');

    // Create feature group for drawn items
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    featureGroupRef.current = featureGroup;
    
    console.log('[PureLeafletDrawTools] Feature group created and added to map:', featureGroup);
    console.log('[PureLeafletDrawTools] Feature group attached to map:', map.hasLayer(featureGroup));
    console.log('[PureLeafletDrawTools] Map has feature group in layers:', map.hasLayer(featureGroup));
    
    // Feature group is ready for user-drawn features

    // Cleanup
    return () => {
      if (map && featureGroupRef.current) {
        console.log('[PureLeafletDrawTools] Removing feature group from map');
        map.removeLayer(featureGroupRef.current);
      }
      featureGroupRef.current = null;
    };
  }, [map, dispatch]);

  // Handle drawing mode changes with simple drawing
  useEffect(() => {
    if (!map || !map.getContainer()) return;

    console.log('[PureLeafletDrawTools] Drawing mode changed to:', drawingState.mode);

    // Clear any existing handlers first
    clearAllEventHandlers();

    if (drawingState.mode === 'edit') {
      console.log('[PureLeafletDrawTools] Activating edit mode');
      
      // In edit mode, make existing shapes clickable and editable
      map.getContainer().style.cursor = 'pointer';
      
      const handleEditClick = (e: L.LeafletMouseEvent) => {
        // Find if we clicked on a feature
        const target = e.originalEvent.target as HTMLElement;
        if (target && target.classList.contains('leaflet-interactive')) {
          console.log('[PureLeafletDrawTools] Edit click on feature:', target);
          // Here you could open an edit dialog or enable dragging
          alert('Edit functionality - feature clicked! (Can be enhanced to show edit dialog)');
        }
      };
      
      addEventHandler('click', handleEditClick);
      
    } else if (drawingState.mode === 'delete') {
      console.log('[PureLeafletDrawTools] Activating delete mode');
      
      // In delete mode, make features clickable for deletion
      map.getContainer().style.cursor = 'crosshair';
      
      const handleDeleteClick = (e: L.LeafletMouseEvent) => {
        // Find if we clicked on a feature
        const target = e.originalEvent.target as HTMLElement;
        if (target && target.classList.contains('leaflet-interactive')) {
          console.log('[PureLeafletDrawTools] Delete click on feature:', target);
          
          // Find the leaflet layer associated with this DOM element
          map.eachLayer((layer: any) => {
            if (layer.getElement && layer.getElement() === target) {
              console.log('[PureLeafletDrawTools] Deleting layer:', layer);
              
              // Check if this layer has a stored feature ID
              const featureId = layer._fireEmsFeatureId;
              if (featureId) {
                console.log('[PureLeafletDrawTools] Found feature ID for deletion:', featureId);
                dispatch(deleteFeature(featureId));
                console.log('[PureLeafletDrawTools] Feature deleted from Redux store');
              }
              
              // Remove from map
              map.removeLayer(layer);
              console.log('[PureLeafletDrawTools] Layer removed from map');
            }
          });
        }
      };
      
      addEventHandler('click', handleDeleteClick);
      
    } else if (drawingState.mode) {
      console.log('[PureLeafletDrawTools] Activating simple drawing mode:', drawingState.mode);
      
      let isDrawing = false;
      let startPoint: L.LatLng | null = null;
      let currentShape: L.Layer | null = null;

      const handleMapClick = (e: L.LeafletMouseEvent) => {
        // Stop all default map behavior
        L.DomEvent.stopPropagation(e.originalEvent);
        L.DomEvent.preventDefault(e.originalEvent);
        
        console.log('[PureLeafletDrawTools] Drawing click detected:', drawingState.mode, e.latlng);
        console.log('[PureLeafletDrawTools] Current drawing options:', drawingState.options);
        console.log('[PureLeafletDrawTools] Current style options:', drawingState.options.style);
        
        if (drawingState.mode === 'marker') {
          // Create colored marker based on selected stroke color
          const markerColor = drawingState.options.style?.color || '#3388ff';
          console.log('[PureLeafletDrawTools] Creating marker with color:', markerColor);
          
          // Create a colored icon using Leaflet's default icon but with custom color
          const coloredIcon = L.divIcon({
            className: 'colored-marker',
            html: `<div style="
              background-color: ${markerColor};
              width: 25px;
              height: 25px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 24],
            popupAnchor: [1, -24]
          });
          
          const marker = L.marker(e.latlng, {
            draggable: true,
            icon: coloredIcon
          });
          
          // Add DIRECTLY to map instead of feature group
          marker.addTo(map);
          console.log('[PureLeafletDrawTools] Colored marker added DIRECTLY to map:', marker);
          
          // Also add to feature group for tracking
          if (featureGroupRef.current) {
            featureGroupRef.current.addLayer(marker);
          }
          
          if (!targetLayer) return;
          const feature = createFeatureFromLayer(marker, 'marker');
          const { id, created, modified, ...featureWithoutIds } = feature;
          dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
          
          // Store the generated feature ID with the Leaflet layer for deletion tracking
          (marker as any)._fireEmsFeatureId = feature.id;
          
          dispatch(setDrawingMode(null));
        } else if (!isDrawing && drawingState.mode === 'circle') {
          // Start drawing circle (first click)
          isDrawing = true;
          startPoint = e.latlng;
          
          console.log('[PureLeafletDrawTools] Starting circle drawing at:', e.latlng);
          
          // Create initial circle with small radius
          const circleOptions = {
            radius: 100, // Start small, will resize on drag
            color: drawingState.options.style?.color || '#3388ff',
            fillColor: drawingState.options.style?.fillColor || '#3388ff', 
            fillOpacity: drawingState.options.style?.fillOpacity || 0.2,
            weight: drawingState.options.style?.weight || 3,
            opacity: drawingState.options.style?.opacity || 1.0
          };
          
          console.log('[PureLeafletDrawTools] Circle options:', circleOptions);
          console.log('[PureLeafletDrawTools] Fill color value:', drawingState.options.style?.fillColor);
          
          currentShape = L.circle(e.latlng, circleOptions);
          
          // Add DIRECTLY to map
          currentShape.addTo(map);
          console.log('[PureLeafletDrawTools] Circle started, added DIRECTLY to map:', currentShape);
          
        } else if (isDrawing && drawingState.mode === 'circle') {
          // Finish drawing circle (second click)
          console.log('[PureLeafletDrawTools] Finishing circle drawing');
          if (currentShape) {
            if (!targetLayer) return;
            const feature = createFeatureFromLayer(currentShape, 'circle');
            console.log('[PureLeafletDrawTools] Circle feature created:', feature);
            const { id, created, modified, ...featureWithoutIds } = feature;
            dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
            
            // Store the generated feature ID with the Leaflet layer for deletion tracking
            (currentShape as any)._fireEmsFeatureId = feature.id;
            
            console.log('[PureLeafletDrawTools] Circle feature dispatched to Redux');
          }
          dispatch(setDrawingMode(null));
          
        } else if (!isDrawing && drawingState.mode === 'rectangle') {
          // Start drawing rectangle (two-click process)
          isDrawing = true;
          startPoint = e.latlng;
          
          console.log('[PureLeafletDrawTools] Starting rectangle drawing');
          
          currentShape = L.rectangle([[e.latlng.lat, e.latlng.lng], [e.latlng.lat, e.latlng.lng]], {
            color: drawingState.options.style?.color || '#3388ff',
            fillColor: drawingState.options.style?.fillColor || '#3388ff',
            fillOpacity: drawingState.options.style?.fillOpacity || 0.2,
            weight: drawingState.options.style?.weight || 3,
            opacity: drawingState.options.style?.opacity || 1.0
          });
          
          currentShape.addTo(map);
          console.log('[PureLeafletDrawTools] Rectangle started, added DIRECTLY to map:', currentShape);
          
        } else if (isDrawing && drawingState.mode === 'rectangle') {
          // Finish drawing rectangle
          console.log('[PureLeafletDrawTools] Finishing rectangle drawing');
          if (currentShape) {
            if (!targetLayer) return;
            const feature = createFeatureFromLayer(currentShape, 'rectangle');
            console.log('[PureLeafletDrawTools] Rectangle feature created:', feature);
            const { id, created, modified, ...featureWithoutIds } = feature;
            dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
            
            // Store the generated feature ID with the Leaflet layer for deletion tracking
            (currentShape as any)._fireEmsFeatureId = feature.id;
            
            console.log('[PureLeafletDrawTools] Rectangle feature dispatched to Redux');
          }
          dispatch(setDrawingMode(null));
          
        } else if (!isDrawing && (drawingState.mode === 'polygon' || drawingState.mode === 'polyline')) {
          // Start drawing polygon/polyline (multi-click process)
          if (!currentShape) {
            // First click - start new shape
            const coords = [e.latlng];
            if (drawingState.mode === 'polygon') {
              currentShape = L.polygon(coords, {
                color: drawingState.options.style?.color || '#3388ff',
                fillColor: drawingState.options.style?.fillColor || '#3388ff',
                fillOpacity: drawingState.options.style?.fillOpacity || 0.2,
                weight: drawingState.options.style?.weight || 3,
                opacity: drawingState.options.style?.opacity || 1.0
              });
            } else {
              currentShape = L.polyline(coords, {
                color: drawingState.options.style?.color || '#3388ff',
                weight: drawingState.options.style?.weight || 3,
                opacity: drawingState.options.style?.opacity || 1.0
              });
            }
            currentShape.addTo(map);
            console.log(`[PureLeafletDrawTools] ${drawingState.mode} started:`, currentShape);
          } else {
            // Add point to existing shape
            const currentCoords = drawingState.mode === 'polygon' 
              ? (currentShape as L.Polygon).getLatLngs()[0] as L.LatLng[]
              : (currentShape as L.Polyline).getLatLngs() as L.LatLng[];
            currentCoords.push(e.latlng);
            
            if (drawingState.mode === 'polygon') {
              (currentShape as L.Polygon).setLatLngs(currentCoords);
            } else {
              (currentShape as L.Polyline).setLatLngs(currentCoords);
            }
            console.log(`[PureLeafletDrawTools] Added point to ${drawingState.mode}:`, e.latlng);
          }
        }
      };

      const handleMouseMove = (e: L.LeafletMouseEvent) => {
        if (!isDrawing || !currentShape || !startPoint) return;

        // Stop event propagation during drawing
        L.DomEvent.stopPropagation(e.originalEvent);

        switch (drawingState.mode) {
          case 'circle':
            const radius = startPoint.distanceTo(e.latlng);
            (currentShape as L.Circle).setRadius(radius);
            break;
          case 'rectangle':
            const bounds = L.latLngBounds([startPoint, e.latlng]);
            (currentShape as L.Rectangle).setBounds(bounds);
            break;
          case 'polygon':
          case 'polyline':
            // Handle polygon/polyline drawing (multi-point)
            break;
        }
      };

      // Disable map interactions during drawing
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      
      console.log('[PureLeafletDrawTools] Map interactions disabled for drawing');

      // Handle double-click to finish polygon/polyline
      const handleDoubleClick = (e: L.LeafletMouseEvent) => {
        if (drawingState.mode === 'polygon' || drawingState.mode === 'polyline') {
          L.DomEvent.stopPropagation(e.originalEvent);
          L.DomEvent.preventDefault(e.originalEvent);
          
          if (currentShape) {
            console.log(`[PureLeafletDrawTools] Finishing ${drawingState.mode} with double-click`);
            if (!targetLayer) return;
            const feature = createFeatureFromLayer(currentShape, drawingState.mode);
            console.log(`[PureLeafletDrawTools] ${drawingState.mode} feature created:`, feature);
            const { id, created, modified, ...featureWithoutIds } = feature;
            dispatch(addFeature({ layerId: targetLayer.id, feature: featureWithoutIds }));
            
            // Store the generated feature ID with the Leaflet layer for deletion tracking
            (currentShape as any)._fireEmsFeatureId = feature.id;
            
            console.log(`[PureLeafletDrawTools] ${drawingState.mode} feature dispatched to Redux`);
            dispatch(setDrawingMode(null));
          }
        }
      };

      // Add event listeners using centralized system
      addEventHandler('click', handleMapClick);
      addEventHandler('mousemove', handleMouseMove);
      addEventHandler('dblclick', handleDoubleClick);
      
      // Set cursor
      map.getContainer().style.cursor = 'crosshair';
    }

    // Return cleanup function for this effect
    return () => {
      clearAllEventHandlers();
    };
  }, [drawingState.mode, map, dispatch, clearAllEventHandlers, addEventHandler]);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      clearAllEventHandlers();
    };
  }, [clearAllEventHandlers]);

  return null; // This component doesn't render anything
};

export default PureLeafletDrawTools;