/**
 * Layer Renderer Component
 * 
 * Renders all map layers and their features using react-leaflet components.
 * Handles layer ordering, styling, and interactive features.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Marker, 
  Popup, 
  Polygon, 
  Polyline, 
  Circle, 
  Rectangle,
  LayerGroup,
  Tooltip
} from 'react-leaflet';
import * as L from 'leaflet';

import { selectLayers, selectSelectedFeatures, selectFeature } from '@/state/redux/fireMapProSlice';
import { MapFeature, FeatureStyle } from '@/types/fireMapPro';

/**
 * Create Leaflet icon from MapIcon configuration
 */
const createLeafletIcon = (iconConfig: any, color: string, size: string): L.Icon => {
  const sizeMap = {
    small: [20, 20],
    medium: [30, 30],
    large: [40, 40],
    'extra-large': [50, 50]
  };
  
  const iconSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.medium;
  
  return L.icon({
    iconUrl: iconConfig.url,
    iconSize: iconSize as [number, number],
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]],
    className: `fire-map-icon fire-map-icon-${color}`
  });
};

/**
 * Convert FeatureStyle to react-leaflet compatible style
 */
const convertStyle = (style: FeatureStyle, isSelected: boolean = false) => {
  const baseStyle = {
    color: style.color || '#3388ff',
    fillColor: style.fillColor || style.color || '#3388ff',
    fillOpacity: style.fillOpacity !== undefined ? style.fillOpacity : 0.3,
    weight: style.weight || 3,
    opacity: style.opacity !== undefined ? style.opacity : 1,
    dashArray: style.dashArray
  };

  // Modify style for selected features
  if (isSelected) {
    return {
      ...baseStyle,
      color: '#ff6b35',
      fillColor: '#ff6b35',
      weight: (baseStyle.weight || 3) + 2,
      opacity: 1,
      fillOpacity: Math.min((baseStyle.fillOpacity || 0.3) + 0.2, 0.7)
    };
  }

  return baseStyle;
};

/**
 * Feature Component - renders individual map features
 */
interface FeatureComponentProps {
  feature: MapFeature;
  isSelected: boolean;
  onFeatureClick: (featureId: string) => void;
  onFeatureContextMenu: (featureId: string, event: any) => void;
}

const FeatureComponent: React.FC<FeatureComponentProps> = ({
  feature,
  isSelected,
  onFeatureClick,
  onFeatureContextMenu
}) => {
  const style = convertStyle(feature.style, isSelected);
  
  const eventHandlers = {
    click: () => onFeatureClick(feature.id),
    contextmenu: (e: any) => {
      e.originalEvent.preventDefault();
      onFeatureContextMenu(feature.id, e);
    }
  };

  // Render popup content
  const popupContent = (
    <div>
      <h4 style={{ margin: '0 0 8px 0' }}>{feature.title}</h4>
      {feature.description && <p style={{ margin: '0 0 8px 0' }}>{feature.description}</p>}
      {Object.keys(feature.properties).length > 0 && (
        <div>
          <strong>Properties:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
            {Object.entries(feature.properties).map(([key, value]) => (
              <li key={key}>{key}: {String(value)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  switch (feature.type) {
    case 'marker':
      const [lng, lat] = feature.coordinates as number[];
      const icon = feature.style.icon 
        ? createLeafletIcon(feature.style.icon, feature.style.icon.color, feature.style.icon.size)
        : undefined;
      
      return (
        <Marker
          position={[lat, lng]}
          icon={icon}
          eventHandlers={eventHandlers}
        >
          <Popup>{popupContent}</Popup>
          <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
            {feature.title}
          </Tooltip>
        </Marker>
      );

    case 'polygon':
      const polygonCoords = (feature.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]);
      
      return (
        <Polygon
          positions={polygonCoords}
          pathOptions={style}
          eventHandlers={eventHandlers}
        >
          <Popup>{popupContent}</Popup>
          <Tooltip sticky>{feature.title}</Tooltip>
        </Polygon>
      );

    case 'polyline':
      const lineCoords = (feature.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]);
      
      return (
        <Polyline
          positions={lineCoords}
          pathOptions={style}
          eventHandlers={eventHandlers}
        >
          <Popup>{popupContent}</Popup>
          <Tooltip sticky>{feature.title}</Tooltip>
        </Polyline>
      );

    case 'circle':
      const [circleLng, circleLat, radius] = feature.coordinates as number[];
      
      return (
        <Circle
          center={[circleLat, circleLng]}
          radius={radius}
          pathOptions={style}
          eventHandlers={eventHandlers}
        >
          <Popup>{popupContent}</Popup>
          <Tooltip sticky>{feature.title}</Tooltip>
        </Circle>
      );

    case 'rectangle':
      const [[swLng, swLat], [neLng, neLat]] = feature.coordinates as number[][];
      
      return (
        <Rectangle
          bounds={[[swLat, swLng], [neLat, neLng]]}
          pathOptions={style}
          eventHandlers={eventHandlers}
        >
          <Popup>{popupContent}</Popup>
          <Tooltip sticky>{feature.title}</Tooltip>
        </Rectangle>
      );

    default:
      console.warn(`Unknown feature type: ${feature.type}`);
      return null;
  }
};

/**
 * Layer Group Component - renders a single layer with all its features
 */
interface LayerGroupComponentProps {
  layer: any; // MapLayer type
  selectedFeatures: string[];
  onFeatureClick: (featureId: string) => void;
  onFeatureContextMenu: (featureId: string, event: any) => void;
}

const LayerGroupComponent: React.FC<LayerGroupComponentProps> = ({
  layer,
  selectedFeatures,
  onFeatureClick,
  onFeatureContextMenu
}) => {
  if (!layer.visible || layer.features.length === 0) {
    return null;
  }

  return (
    <LayerGroup>
      {layer.features.map((feature: MapFeature) => (
        <FeatureComponent
          key={feature.id}
          feature={feature}
          isSelected={selectedFeatures.includes(feature.id)}
          onFeatureClick={onFeatureClick}
          onFeatureContextMenu={onFeatureContextMenu}
        />
      ))}
    </LayerGroup>
  );
};

/**
 * Main Layer Renderer Component
 */
const LayerRenderer: React.FC = () => {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);
  const selectedFeatures = useSelector(selectSelectedFeatures);

  const handleFeatureClick = (featureId: string) => {
    console.log('Feature clicked:', featureId);
    dispatch(selectFeature(featureId));
  };

  const handleFeatureContextMenu = (featureId: string, event: any) => {
    // Context menu logic will be implemented
    console.log('Feature context menu:', featureId, event.latlng);
  };

  // Sort layers by zIndex for proper rendering order
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <>
      {sortedLayers.map((layer) => (
        <LayerGroupComponent
          key={layer.id}
          layer={layer}
          selectedFeatures={selectedFeatures}
          onFeatureClick={handleFeatureClick}
          onFeatureContextMenu={handleFeatureContextMenu}
        />
      ))}
    </>
  );
};

export default LayerRenderer;