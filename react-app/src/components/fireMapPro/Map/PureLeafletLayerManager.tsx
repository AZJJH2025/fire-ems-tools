/**
 * Pure Leaflet Layer Manager
 * 
 * Manages all feature layers using pure Leaflet APIs instead of React-Leaflet.
 * Handles fire stations, hospitals, hydrants, incidents, and response zones.
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';

import { selectLayers, selectFeature } from '@/state/redux/fireMapProSlice';
import { MapFeature, MapLayer } from '@/types/fireMapPro';

interface PureLeafletLayerManagerProps {
  map: L.Map | null;
}

const PureLeafletLayerManager: React.FC<PureLeafletLayerManagerProps> = ({ map }) => {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);
  const layerGroupsRef = useRef<Map<string, L.LayerGroup>>(new Map());

  // Create Leaflet icon from feature style with better error handling
  const createLeafletIcon = (feature: MapFeature): L.Icon | null => {
    try {
      const style = feature.style;
      const icon = style.icon;
      
      if (!icon) {
        // Default marker icon with error handling
        return L.icon({
          iconUrl: 'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23666666"/%3E%3C/svg%3E',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
          popupAnchor: [0, -24]
        });
      }

      const sizeMap = {
        small: [20, 20],
        medium: [30, 30],
        large: [40, 40],
        'extra-large': [50, 50]
      };
      
      const iconSize = sizeMap[icon.size as keyof typeof sizeMap] || sizeMap.medium;
      
      // Validate required properties
      if (!icon.url) {
        console.warn(`[LayerManager] Icon missing URL for feature ${feature.id}`);
        return null;
      }
      
      return L.icon({
        iconUrl: icon.url,
        iconSize: iconSize as [number, number],
        iconAnchor: icon.anchor ? icon.anchor as [number, number] : [iconSize[0] / 2, iconSize[1]],
        popupAnchor: icon.popupAnchor ? icon.popupAnchor as [number, number] : [0, -iconSize[1]]
      });
    } catch (error) {
      console.warn(`[LayerManager] Error creating icon for feature ${feature.id}:`, error);
      return null;
    }
  };

  // Create popup content for features
  const createPopupContent = (feature: MapFeature): string => {
    let content = `<div class="fire-map-popup">`;
    content += `<h3>${feature.title}</h3>`;
    content += `<p>${feature.description}</p>`;
    
    if (feature.properties && Object.keys(feature.properties).length > 0) {
      content += `<div class="feature-properties">`;
      Object.entries(feature.properties).forEach(([key, value]) => {
        const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        content += `<div><strong>${displayKey}:</strong> ${value}</div>`;
      });
      content += `</div>`;
    }
    
    content += `</div>`;
    return content;
  };

  // Create Leaflet layer from feature with enhanced error handling
  const createFeatureLayer = (feature: MapFeature): L.Layer | null => {
    try {
      const style = feature.style;
      
      switch (feature.type) {
        case 'marker': {
          const [lng, lat] = feature.coordinates as number[];
          
          // Validate coordinates
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`[LayerManager] Invalid coordinates for feature ${feature.id}: [${lng}, ${lat}]`);
            return null;
          }
          
          const iconInstance = createLeafletIcon(feature);
          if (!iconInstance) {
            console.warn(`[LayerManager] Failed to create icon for feature ${feature.id}`);
            return null;
          }
          
          const marker = L.marker([lat, lng], {
            icon: iconInstance
          });
          
          try {
            marker.bindPopup(createPopupContent(feature));
            marker.bindTooltip(feature.title, { sticky: true });
            
            // Add click handler
            marker.on('click', () => {
              console.log('Feature clicked:', feature.id);
              dispatch(selectFeature(feature.id));
            });
          } catch (bindError) {
            console.warn(`[LayerManager] Error binding popup/tooltip for feature ${feature.id}:`, bindError);
            // Continue without popup/tooltip if binding fails
          }
          
          return marker;
        }
      
      case 'polygon': {
        const coords = (feature.coordinates as number[][][])[0].map(([lng, lat]) => [lat, lng] as [number, number]);
        const polygon = L.polygon(coords, {
          color: style.color || '#3388ff',
          fillColor: style.fillColor || style.color || '#3388ff',
          fillOpacity: style.fillOpacity || 0.2,
          weight: style.weight || 3,
          opacity: style.opacity || 1
        });
        
        polygon.bindPopup(createPopupContent(feature));
        polygon.bindTooltip(feature.title, { sticky: true });
        
        polygon.on('click', () => {
          console.log('Feature clicked:', feature.id);
          dispatch(selectFeature(feature.id));
        });
        
        return polygon;
      }
      
      case 'polyline': {
        const coords = (feature.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]);
        const polyline = L.polyline(coords, {
          color: style.color || '#3388ff',
          weight: style.weight || 3,
          opacity: style.opacity || 1
        });
        
        polyline.bindPopup(createPopupContent(feature));
        polyline.bindTooltip(feature.title, { sticky: true });
        
        polyline.on('click', () => {
          console.log('Feature clicked:', feature.id);
          dispatch(selectFeature(feature.id));
        });
        
        return polyline;
      }
      
      case 'circle': {
        const [lng, lat, radius] = feature.coordinates as number[];
        const circle = L.circle([lat, lng], {
          radius: radius,
          color: style.color || '#3388ff',
          fillColor: style.fillColor || style.color || '#3388ff',
          fillOpacity: style.fillOpacity || 0.2,
          weight: style.weight || 3,
          opacity: style.opacity || 1
        });
        
        circle.bindPopup(createPopupContent(feature));
        circle.bindTooltip(feature.title, { sticky: true });
        
        circle.on('click', () => {
          console.log('Feature clicked:', feature.id);
          dispatch(selectFeature(feature.id));
        });
        
        return circle;
      }
      
      default:
        console.warn(`[LayerManager] Unknown feature type: ${feature.type}`);
        return null;
    }
    } catch (error) {
      console.error(`[LayerManager] Error creating feature layer for ${feature.id}:`, error);
      return null;
    }
  };

  // Update layers when Redux state changes
  useEffect(() => {
    if (!map || !map.getContainer()) {
      console.warn('[LayerManager] Map or container not ready, skipping layer update');
      return;
    }

    // Use proper map readiness checking instead of setTimeout
    const updateLayers = () => {
      try {
        // Validate map is fully ready including coordinate system
        const container = map.getContainer();
        if (!container || !container.parentNode || !document.body.contains(container)) {
          console.warn('[LayerManager] Map container not properly attached to DOM, skipping update');
          return;
        }

        // Check for map panes and coordinate system readiness
        const mapPanes = map.getPanes();
        if (!mapPanes || !mapPanes.markerPane || !(map as any)._size || !(map as any)._pixelOrigin) {
          console.warn('[LayerManager] Map panes or coordinate system not ready, skipping update');
          return;
        }
        
        console.log('[LayerManager] Updating layers with', layers.length, 'layers');

        // Sort layers by zIndex for proper rendering order
        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

        sortedLayers.forEach((layer: MapLayer) => {
          const existingLayerGroup = layerGroupsRef.current.get(layer.id);
          
          // Remove existing layer group if it exists
          if (existingLayerGroup) {
            try {
              map.removeLayer(existingLayerGroup);
              layerGroupsRef.current.delete(layer.id);
            } catch (error) {
              console.warn(`[LayerManager] Error removing existing layer ${layer.id}:`, error);
            }
          }
          
          // Only create layer group if layer is visible and has features
          if (layer.visible && layer.features.length > 0) {
            try {
              // Enhanced DOM readiness verification
              const container = map.getContainer();
              if (!container || !container.parentNode || !document.body.contains(container)) {
                console.warn(`[LayerManager] Map container not ready for layer ${layer.id}`);
                return;
              }
              
              // Verify map panes exist (critical for icon creation)
              const mapPanes = map.getPanes();
              if (!mapPanes || !mapPanes.markerPane) {
                console.warn(`[LayerManager] Map panes not ready for layer ${layer.id}`);
                return;
              }

              const layerGroup = L.layerGroup();
              let successfulFeatures = 0;
              
              layer.features.forEach((feature: MapFeature) => {
                try {
                  const featureLayer = createFeatureLayer(feature);
                  if (featureLayer) {
                    layerGroup.addLayer(featureLayer);
                    successfulFeatures++;
                  }
                } catch (error) {
                  console.warn(`[LayerManager] Error creating feature ${feature.id}:`, error);
                }
              });
              
              // Set layer opacity
              if (layer.opacity !== undefined && layer.opacity !== 1) {
                layerGroup.eachLayer((featureLayer) => {
                  try {
                    if (featureLayer instanceof L.Marker) {
                      featureLayer.setOpacity(layer.opacity);
                    } else if (featureLayer instanceof L.Path) {
                      featureLayer.setStyle({ opacity: layer.opacity });
                    }
                  } catch (error) {
                    console.warn(`[LayerManager] Error setting opacity:`, error);
                  }
                });
              }
              
              // Only add to map if we have successful features and map is still ready
              if (successfulFeatures > 0 && map.getContainer()) {
                layerGroup.addTo(map);
                layerGroupsRef.current.set(layer.id, layerGroup);
                console.log(`[LayerManager] Added layer "${layer.name}" with ${successfulFeatures}/${layer.features.length} features`);
              }
            } catch (error) {
              console.error(`[LayerManager] Error creating layer ${layer.id}:`, error);
            }
          }
        });
      } catch (error) {
        console.error('[LayerManager] Critical error during layer update:', error);
      }
    };

    // Check if map is already ready, otherwise wait for it
    if ((map as any)._loaded && map.getPanes() && (map as any)._size) {
      // Map is ready, update immediately
      updateLayers();
    } else {
      // Map not ready, wait for it
      map.whenReady(updateLayers);
    }
  }, [map, layers, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        layerGroupsRef.current.forEach((layerGroup, layerId) => {
          map.removeLayer(layerGroup);
          console.log(`[LayerManager] Cleaned up layer: ${layerId}`);
        });
        layerGroupsRef.current.clear();
      }
    };
  }, [map]);

  return null; // This component doesn't render anything
};

export default PureLeafletLayerManager;