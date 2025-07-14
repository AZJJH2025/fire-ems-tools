/**
 * Hydrant Map Layer Component
 * 
 * Renders fire hydrants as interactive markers on the Leaflet map
 * with different visual styling from tanks and hydrant-specific functionality.
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as L from 'leaflet';

import {
  selectHydrants,
  selectFilteredHydrants,
  selectUIState,
  selectAnalysisParameters,
  updateHydrant,
  selectHydrant,
  deselectHydrant
} from '../../state/redux/waterSupplyCoverageSlice';

interface HydrantMapLayerProps {
  map: L.Map | null;
  onHydrantEdit?: (hydrant: any) => void;
}

const HydrantMapLayer: React.FC<HydrantMapLayerProps> = ({ map, onHydrantEdit }) => {
  const dispatch = useDispatch();
  const hydrants = useSelector(selectFilteredHydrants);
  const allHydrants = useSelector(selectHydrants);
  const uiState = useSelector(selectUIState);
  const analysisParameters = useSelector(selectAnalysisParameters);
  
  // Debug state synchronization
  console.log('🔍 HydrantMapLayer state debug:', {
    allHydrantsCount: allHydrants.length,
    filteredHydrantsCount: hydrants.length,
    showHydrants: uiState.filterCriteria.showHydrants,
    filterCriteria: uiState.filterCriteria
  });
  
  const hydrantLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const coverageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hydrantMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize layer groups
  useEffect(() => {
    if (!map) return;

    // Create layer groups for hydrants and coverage zones
    hydrantLayerGroupRef.current = L.layerGroup().addTo(map);
    coverageLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      if (hydrantLayerGroupRef.current) {
        map.removeLayer(hydrantLayerGroupRef.current);
      }
      if (coverageLayerGroupRef.current) {
        map.removeLayer(coverageLayerGroupRef.current);
      }
    };
  }, [map]);

  // Create custom hydrant icons based on hydrant properties
  const createHydrantIcon = (hydrant: any) => {
    const getIconColor = () => {
      switch (hydrant.operationalStatus) {
        case 'active': return '#2196f3'; // Blue
        case 'inactive': return '#9e9e9e'; // Gray
        case 'maintenance': return '#ff9800'; // Orange
        default: return '#2196f3';
      }
    };

    const getIconSize = () => {
      // Scale icon based on flow rate
      const baseSize = 20;
      const scaleFactor = Math.min(Math.max(hydrant.flowRate / 1000, 0.8), 2.0);
      return Math.round(baseSize * scaleFactor);
    };

    const getBorderColor = () => {
      // Different border color based on pressure rating
      if (hydrant.staticPressure >= 50) return '#1976d2'; // High pressure - dark blue
      if (hydrant.staticPressure >= 30) return '#4caf50'; // Medium pressure - green
      return '#f44336'; // Low pressure - red
    };

    const iconSize = getIconSize();
    const iconColor = getIconColor();
    const borderColor = getBorderColor();
    
    // Create SVG icon for fire hydrant (square to differentiate from round tanks)
    const svgIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" fill="${iconColor}" stroke="${borderColor}" stroke-width="3" rx="2"/>
        <path d="M8 8h8v2H8z" fill="#ffffff"/>
        <path d="M8 12h8v2H8z" fill="#ffffff"/>
        <path d="M8 16h8v2H8z" fill="#ffffff"/>
        <circle cx="12" cy="6" r="1.5" fill="#ffffff"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'hydrant-marker',
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      popupAnchor: [0, -iconSize / 2]
    });
  };

  // Create popup content for hydrant
  const createHydrantPopup = (hydrant: any) => {
    const flowRateText = hydrant.flowRate.toLocaleString();
    const pressureText = `${hydrant.staticPressure}/${hydrant.residualPressure} PSI`;
    // Safety check for location display
    const locationText = hydrant.location?.latitude && hydrant.location?.longitude 
      ? `Lat: ${hydrant.location.latitude.toFixed(6)}, Lng: ${hydrant.location.longitude.toFixed(6)}`
      : 'Location: Unknown';
    
    return `
      <div style="min-width: 220px;">
        <h4 style="margin: 0 0 8px 0; color: #2196f3;">🚰 ${hydrant.name}</h4>
        <p style="margin: 4px 0;"><strong>Flow Rate:</strong> ${flowRateText} GPM</p>
        <p style="margin: 4px 0;"><strong>Pressure:</strong> ${pressureText}</p>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${hydrant.type}</p>
        <p style="margin: 4px 0;"><strong>Size:</strong> ${hydrant.size}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${hydrant.operationalStatus}</p>
        <p style="margin: 4px 0;"><strong>Owner:</strong> ${hydrant.owner}</p>
        ${hydrant.notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${hydrant.notes}</p>` : ''}
        <div style="margin-top: 8px; font-size: 12px; color: #666;">
          ${locationText}
        </div>
        <div style="margin-top: 4px; font-size: 11px; color: #888;">
          💧 Unlimited Supply • High Pressure Coverage
        </div>
      </div>
    `;
  };

  // Create coverage circle for hydrant (different from tanks - pressure-based)
  const createHydrantCoverageCircle = (hydrant: any) => {
    if (!uiState.showCoverageZones) return null;

    // Hydrant coverage based on pressure and flow rate (different from tank volume)
    // Higher pressure = larger effective coverage area
    let radiusFeet = 800; // Base coverage radius in feet
    
    // Adjust radius based on pressure
    if (hydrant.staticPressure >= 50) {
      radiusFeet = 1200; // High pressure extends coverage
    } else if (hydrant.staticPressure >= 30) {
      radiusFeet = 1000; // Medium pressure
    } else {
      radiusFeet = 600; // Low pressure reduces coverage
    }
    
    // Further adjust based on flow rate
    const flowMultiplier = Math.min(hydrant.flowRate / 1000, 1.5);
    radiusFeet = radiusFeet * flowMultiplier;
    
    // Convert feet to meters
    const radiusMeters = radiusFeet * 0.3048;
    
    const circle = L.circle([hydrant.location.latitude, hydrant.location.longitude], {
      radius: radiusMeters,
      fillColor: '#00bcd4', // Cyan to differentiate from blue tank coverage
      fillOpacity: 0.1,
      color: '#0097a7',
      weight: 2,
      opacity: 0.6,
      dashArray: '5,10' // Dashed line to differentiate from solid tank coverage
    });

    return circle;
  };

  // Update hydrant markers when hydrants change
  useEffect(() => {
    if (!map || !hydrantLayerGroupRef.current || !coverageLayerGroupRef.current) return;

    // Clear existing markers
    hydrantLayerGroupRef.current.clearLayers();
    coverageLayerGroupRef.current.clearLayers();
    hydrantMarkersRef.current.clear();

    // Add markers for each hydrant
    console.log('🚰 Processing hydrants for map display:', hydrants.length);
    console.log('🚰 Sample hydrant data:', hydrants[0]);
    
    hydrants.forEach((hydrant, index) => {
      // Safety check for hydrant location
      if (!hydrant.location || !hydrant.location.latitude || !hydrant.location.longitude) {
        console.warn('🚰 Skipping hydrant with invalid location:', hydrant);
        return;
      }
      
      console.log(`🚰 Processing hydrant ${index + 1}:`, {
        name: hydrant.name,
        lat: hydrant.location.latitude,
        lng: hydrant.location.longitude,
        hasValidCoords: !isNaN(hydrant.location.latitude) && !isNaN(hydrant.location.longitude)
      });

      const icon = createHydrantIcon(hydrant);
      const marker = L.marker([hydrant.location.latitude, hydrant.location.longitude], {
        icon,
        draggable: true,
        riseOnHover: true
      });

      // Set up popup
      marker.bindPopup(createHydrantPopup(hydrant));

      // Handle hydrant selection
      marker.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        
        if (uiState.selectedHydrants.includes(hydrant.id)) {
          dispatch(deselectHydrant(hydrant.id));
        } else {
          dispatch(selectHydrant(hydrant.id));
        }
        
        console.log('🎯 Hydrant selected:', hydrant.name);
      });

      // Handle hydrant editing (double-click)
      marker.on('dblclick', (e) => {
        e.originalEvent?.stopPropagation();
        
        if (onHydrantEdit) {
          onHydrantEdit(hydrant);
          console.log('✏️ Hydrant edit requested:', hydrant.name);
        }
      });

      // Handle hydrant dragging
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        const updatedHydrant = {
          ...hydrant,
          location: {
            latitude: newLatLng.lat,
            longitude: newLatLng.lng
          },
          modified: new Date()
        };
        
        dispatch(updateHydrant(updatedHydrant));
        console.log('🚛 Hydrant moved:', hydrant.name, 'to', newLatLng);
      });

      // Style selected hydrants differently
      if (uiState.selectedHydrants.includes(hydrant.id)) {
        marker.setZIndexOffset(1000);
      }

      // Add to layer group
      console.log(`🚰 Adding hydrant ${index + 1} to layer group:`, hydrant.name);
      hydrantLayerGroupRef.current.addLayer(marker);
      hydrantMarkersRef.current.set(hydrant.id, marker);
      console.log(`🚰 Layer group now has ${hydrantLayerGroupRef.current.getLayers().length} layers`);

      // Add coverage circle if enabled
      const coverageCircle = createHydrantCoverageCircle(hydrant);
      if (coverageCircle) {
        coverageLayerGroupRef.current.addLayer(coverageCircle);
      }
    });

    // Auto-fit map bounds to show all hydrants (if no tanks are present)
    if (hydrants.length > 0) {
      const group = new L.FeatureGroup(Array.from(hydrantMarkersRef.current.values()));
      const bounds = group.getBounds();
      
      if (bounds.isValid()) {
        // Add padding and ensure reasonable zoom level
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16
        });
      }
    }

    console.log('🗺️ Hydrant markers updated:', hydrants.length, 'hydrants displayed');
    console.log('🗺️ Layer group attached to map:', map.hasLayer(hydrantLayerGroupRef.current));
    console.log('🗺️ Total layers in hydrant group:', hydrantLayerGroupRef.current.getLayers().length);
    console.log('🗺️ Map zoom level:', map.getZoom());
    console.log('🗺️ Map center:', map.getCenter());
  }, [hydrants, uiState.selectedHydrants, uiState.showCoverageZones, analysisParameters.maxEffectiveDistance, dispatch, map]);

  // Handle coverage zone visibility toggle
  useEffect(() => {
    if (!coverageLayerGroupRef.current || !map) return;

    if (uiState.showCoverageZones) {
      if (!map.hasLayer(coverageLayerGroupRef.current)) {
        map.addLayer(coverageLayerGroupRef.current);
      }
    } else {
      if (map.hasLayer(coverageLayerGroupRef.current)) {
        map.removeLayer(coverageLayerGroupRef.current);
      }
    }
  }, [uiState.showCoverageZones, map]);

  return null; // This component doesn't render anything directly
};

export default HydrantMapLayer;