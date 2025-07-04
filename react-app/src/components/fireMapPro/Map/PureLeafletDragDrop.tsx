/**
 * Pure Leaflet Drag & Drop Handler
 * 
 * Handles icon drag and drop from the icon library to the map
 * using pure Leaflet APIs.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import L from 'leaflet';

import { addFeature, addLayer, selectLayers } from '@/state/redux/fireMapProSlice';
import { MapFeature, MapLayer } from '@/types/fireMapPro';

interface PureLeafletDragDropProps {
  map: L.Map | null;
  mapContainer: HTMLElement | null;
}

const PureLeafletDragDrop: React.FC<PureLeafletDragDropProps> = ({ map, mapContainer }) => {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);

  // Generate unique feature ID
  const generateFeatureId = (): string => {
    return `dropped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    if (!map || !mapContainer || !map.getContainer()) {
      console.warn('[DragDrop] Map or container not ready for drag/drop setup');
      return;
    }
    
    // Wait for map to be fully initialized
    const setupTimeout = setTimeout(() => {
      // Verify map is still valid and DOM is ready
      const container = map.getContainer();
      if (!container || !container.parentNode || !document.body.contains(container)) {
        console.warn('[DragDrop] Map container not properly attached, skipping setup');
        return;
      }
      
      // Verify map panes exist
      const mapPanes = map.getPanes();
      if (!mapPanes) {
        console.warn('[DragDrop] Map panes not ready, skipping setup');
        return;
      }

      console.log('[DragDrop] Setting up drag and drop handlers');

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'copy';
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      
      try {
        const iconDataString = event.dataTransfer!.getData('application/json');
        if (!iconDataString) {
          console.warn('[DragDrop] No icon data found in drop event');
          return;
        }

        const iconData = JSON.parse(iconDataString);
        console.log('[DragDrop] Dropped icon:', iconData);

        // Get map coordinates from drop position with enhanced error handling
        let latlng;
        try {
          // Ensure map container and panes are ready
          const container = map.getContainer();
          if (!container || !container.parentNode) {
            throw new Error('Map container not available or not attached');
          }
          
          // Verify map internal state is ready
          const mapPanes = map.getPanes();
          if (!mapPanes || !(map as any)._loaded) {
            throw new Error('Map not fully loaded');
          }

          // Validate coordinate system is ready before conversion
          if (!(map as any)._size || !(map as any)._pixelOrigin || !mapPanes.mapPane) {
            throw new Error('Map coordinate system not ready - missing _size, _pixelOrigin, or mapPane');
          }

          const rect = container.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          
          // Validate coordinates are within bounds
          if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            throw new Error('Drop coordinates are outside map bounds');
          }
          
          // Use proven legacy coordinate conversion method
          try {
            console.log('[DragDrop] Using legacy containerPointToLatLng method');
            
            // Convert pixel coordinates to Leaflet point, then to lat/lng
            const point = L.point(x, y);
            latlng = map.containerPointToLatLng(point);
            
            console.log('[DragDrop] Legacy coordinate conversion:', { 
              x, y, point: { x: point.x, y: point.y }, latlng: { lat: latlng.lat, lng: latlng.lng } 
            });
          } catch (conversionError) {
            console.error('[DragDrop] Legacy conversion failed, falling back:', conversionError);
            // Fallback to map center
            latlng = L.latLng(39.8283, -98.5795);
          }
          
          if (!latlng || isNaN(latlng.lat) || isNaN(latlng.lng)) {
            throw new Error('Invalid coordinates calculated');
          }
          
          // Validate lat/lng are within reasonable bounds
          if (Math.abs(latlng.lat) > 90 || Math.abs(latlng.lng) > 180) {
            throw new Error('Coordinates outside valid geographic bounds');
          }
        } catch (coordError) {
          console.error('[DragDrop] Error calculating coordinates:', coordError);
          // Fallback to map center with safety check
          try {
            latlng = map.getCenter();
            if (!latlng || isNaN(latlng.lat) || isNaN(latlng.lng)) {
              throw new Error('Map center is invalid');
            }
          } catch (centerError) {
            console.error('[DragDrop] Error getting map center:', centerError);
            // Ultimate fallback to a known good coordinate
            latlng = { lat: 39.8283, lng: -98.5795 };
          }
        }
        
        // Debug the icon data
        console.log('[DragDrop] Icon data received:', {
          id: iconData.id,
          name: iconData.name,
          url: iconData.url ? iconData.url.substring(0, 100) + '...' : 'NO URL',
          urlLength: iconData.url ? iconData.url.length : 0,
          category: iconData.category,
          size: iconData.size,
          color: iconData.color
        });

        // Find the first available feature layer to add the icon to
        let targetLayer = layers.find(layer => 
          layer.type === 'feature' && layer.visible
        );

        // Create feature from dropped icon  
        const feature: MapFeature = {
          id: generateFeatureId(),
          type: 'marker',
          title: iconData.name || 'Dropped Icon',
          description: `${iconData.name} placed at ${new Date().toLocaleTimeString()}`,
          coordinates: [latlng.lng, latlng.lat],
          layerId: targetLayer?.id || 'pending', // Will be updated when layer is determined
          style: {
            color: iconData.color || '#666666',
            icon: {
              id: iconData.id,
              name: iconData.name,
              category: iconData.category || 'custom',
              url: iconData.url,
              size: iconData.size || 'medium',
              color: iconData.color || '#666666',
              anchor: iconData.anchor || [16, 32],
              popupAnchor: iconData.popupAnchor || [0, -32]
            }
          },
          properties: {
            droppedAt: new Date().toISOString(),
            iconSource: 'library',
            originalIcon: iconData
          },
          created: new Date(),
          modified: new Date()
        };
        
        console.log('[DragDrop] Created feature with icon URL:', feature.style.icon?.url ? 'PRESENT' : 'MISSING');
        
        if (!targetLayer) {
          // No suitable layer found, create one
          console.log('[DragDrop] No suitable layer found. Creating "Dropped Icons" layer. Available layers:', 
            layers.map(l => ({ id: l.id, name: l.name, type: l.type, visible: l.visible })));
          
          const userIconLayer: Omit<MapLayer, 'id'> = {
            name: 'Dropped Icons',
            type: 'feature',
            visible: true,
            opacity: 1,
            zIndex: layers.length, // Set zIndex based on current layer count
            features: [],
            style: {
              defaultStyle: {
                color: '#DC2626',
                fillColor: '#DC2626',
                fillOpacity: 0.3,
                weight: 2,
                opacity: 1
              }
            },
            metadata: {
              description: 'Icons dropped from the icon library',
              source: 'user-interaction',
              created: new Date(),
              featureCount: 0
            }
          };
          
          dispatch(addLayer(userIconLayer));
          
          // Use setTimeout to allow Redux state to update
          setTimeout(() => {
            // Re-fetch layers to get the newly created one
            const updatedLayers = layers;
            const newLayer = updatedLayers.find(layer => layer.name === 'Dropped Icons');
            
            if (newLayer) {
              console.log('[DragDrop] Adding feature to newly created layer:', newLayer.id);
              // Update feature with correct layerId
              feature.layerId = newLayer.id;
              dispatch(addFeature({
                layerId: newLayer.id,
                feature: feature
              }));
            } else {
              // If still can't find it, use the first feature layer available
              const firstFeatureLayer = updatedLayers.find(layer => layer.type === 'feature');
              if (firstFeatureLayer) {
                console.log('[DragDrop] Using first available feature layer:', firstFeatureLayer.id);
                dispatch(addFeature({
                  layerId: firstFeatureLayer.id,
                  feature: feature
                }));
              } else {
                console.error('[DragDrop] Failed to create or find any feature layer');
              }
            }
          }, 300);
        } else {
          console.log('[DragDrop] Adding feature to existing layer:', targetLayer.id, targetLayer.name);
          dispatch(addFeature({
            layerId: targetLayer.id,
            feature: feature
          }));
        }
        
        console.log('[DragDrop] Successfully created feature from dropped icon:', feature.id);

      } catch (error) {
        console.error('[DragDrop] Error handling drop event:', error);
      }
    };

      // Add event listeners to map container
      mapContainer.addEventListener('dragover', handleDragOver);
      mapContainer.addEventListener('drop', handleDrop);

      console.log('[DragDrop] Successfully set up drag and drop handlers');
      
      // Cleanup function for the timeout setup
      return () => {
        mapContainer.removeEventListener('dragover', handleDragOver);
        mapContainer.removeEventListener('drop', handleDrop);
        console.log('[DragDrop] Cleaned up drag and drop handlers');
      };
    }, 100); // Small delay to ensure map is ready

    // Cleanup for the effect
    return () => {
      clearTimeout(setupTimeout);
    };

  }, [map, mapContainer, dispatch, layers]);

  return null; // This component doesn't render anything
};

export default PureLeafletDragDrop;