/**
 * Tank Map Layer Component
 * 
 * Renders water tanks as interactive markers on the Leaflet map
 * with drag functionality and property editing capabilities.
 */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as L from 'leaflet';

import {
  selectFilteredTanks,
  selectUIState,
  selectAnalysisParameters,
  updateTank,
  selectTank,
  deselectTank
} from '../../state/redux/waterSupplyCoverageSlice';

interface TankMapLayerProps {
  map: L.Map | null;
  onTankEdit?: (tank: any) => void;
}

const TankMapLayer: React.FC<TankMapLayerProps> = ({ map, onTankEdit }) => {
  const dispatch = useDispatch();
  const tanks = useSelector(selectFilteredTanks); // Use filtered tanks for display
  const uiState = useSelector(selectUIState);
  const analysisParameters = useSelector(selectAnalysisParameters);
  
  const tankLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const coverageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tankMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize layer groups
  useEffect(() => {
    if (!map) return;

    // Create layer groups for tanks and coverage zones
    tankLayerGroupRef.current = L.layerGroup().addTo(map);
    coverageLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      if (tankLayerGroupRef.current) {
        map.removeLayer(tankLayerGroupRef.current);
      }
      if (coverageLayerGroupRef.current) {
        map.removeLayer(coverageLayerGroupRef.current);
      }
    };
  }, [map]);

  // Create custom tank icons based on tank properties
  const createTankIcon = (tank: any) => {
    const getIconColor = () => {
      switch (tank.operationalStatus) {
        case 'active': return '#2196f3'; // Blue
        case 'inactive': return '#9e9e9e'; // Gray
        case 'maintenance': return '#ff9800'; // Orange
        default: return '#2196f3';
      }
    };

    const getIconSize = () => {
      // Scale icon based on capacity
      const baseSize = 24;
      const scaleFactor = Math.min(Math.max(tank.capacity / 25000, 0.7), 2.0);
      return Math.round(baseSize * scaleFactor);
    };

    const iconSize = getIconSize();
    const iconColor = getIconColor();
    
    // Create SVG icon for water tank
    const svgIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${iconColor}" stroke="#ffffff" stroke-width="2"/>
        <path d="M8 10h8v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6z" fill="#ffffff"/>
        <path d="M7 8h10v2H7z" fill="#ffffff"/>
        <circle cx="12" cy="6" r="1" fill="#ffffff"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'tank-marker',
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      popupAnchor: [0, -iconSize / 2]
    });
  };

  // Create popup content for tank
  const createTankPopup = (tank: any) => {
    const capacityText = tank.capacity.toLocaleString();
    // Safety check for location display
    const locationText = tank.location?.latitude && tank.location?.longitude 
      ? `Lat: ${tank.location.latitude.toFixed(6)}, Lng: ${tank.location.longitude.toFixed(6)}`
      : 'Location: Unknown';
    
    return `
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1976d2;">${tank.name}</h4>
        <p style="margin: 4px 0;"><strong>Capacity:</strong> ${capacityText} gallons</p>
        <p style="margin: 4px 0;"><strong>Type:</strong> ${tank.type}</p>
        <p style="margin: 4px 0;"><strong>Access:</strong> ${tank.accessRating}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${tank.operationalStatus}</p>
        <p style="margin: 4px 0;"><strong>Owner:</strong> ${tank.owner}</p>
        ${tank.notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${tank.notes}</p>` : ''}
        <div style="margin-top: 8px; font-size: 12px; color: #666;">
          ${locationText}
        </div>
      </div>
    `;
  };

  // Create coverage circle for tank (capacity-based)
  const createCoverageCircle = (tank: any) => {
    if (!uiState.showCoverageZones) return null;
    
    // Safety check for tank location
    if (!tank.location || !tank.location.latitude || !tank.location.longitude) {
      console.warn('🏗️ Skipping coverage circle for tank with invalid location:', tank);
      return null;
    }

    // Calculate coverage radius based on tank capacity
    // Larger tanks can support operations farther away due to longer duration supply
    let radiusFeet = 400; // Base coverage radius for small tanks
    
    // Scale coverage based on tank capacity
    if (tank.capacity >= 100000) {
      radiusFeet = 1500; // Very large tanks (100,000+ gallons) - maximum coverage
    } else if (tank.capacity >= 50000) {
      radiusFeet = 1200; // Large tanks (50,000+ gallons) - extended coverage
    } else if (tank.capacity >= 25000) {
      radiusFeet = 1000; // Medium tanks (25,000+ gallons) - standard coverage
    } else if (tank.capacity >= 10000) {
      radiusFeet = 800;  // Small tanks (10,000+ gallons) - reduced coverage
    } else {
      radiusFeet = 600;  // Very small tanks (<10,000 gallons) - limited coverage
    }
    
    // Apply access rating modifier (better access = larger effective coverage)
    const accessMultiplier = tank.accessRating === 'excellent' ? 1.2 : 
                            tank.accessRating === 'good' ? 1.0 : 
                            tank.accessRating === 'fair' ? 0.8 : 0.6;
    
    radiusFeet = radiusFeet * accessMultiplier;
    
    // Don't exceed maximum effective distance from analysis parameters
    radiusFeet = Math.min(radiusFeet, analysisParameters.maxEffectiveDistance);
    
    // Convert feet to meters
    const radiusMeters = radiusFeet * 0.3048;
    
    const circle = L.circle([tank.location.latitude, tank.location.longitude], {
      radius: radiusMeters,
      fillColor: '#2196f3',
      fillOpacity: 0.1,
      color: '#1976d2',
      weight: 2,
      opacity: 0.6
    });

    return circle;
  };

  // Update tank markers when tanks change
  useEffect(() => {
    if (!map || !tankLayerGroupRef.current || !coverageLayerGroupRef.current) return;

    // Clear existing markers
    tankLayerGroupRef.current.clearLayers();
    coverageLayerGroupRef.current.clearLayers();
    tankMarkersRef.current.clear();

    // Add markers for each tank
    tanks.forEach(tank => {
      // Safety check for tank location
      if (!tank.location || !tank.location.latitude || !tank.location.longitude) {
        console.warn('🏗️ Skipping tank with invalid location:', tank);
        return;
      }

      const icon = createTankIcon(tank);
      const marker = L.marker([tank.location.latitude, tank.location.longitude], {
        icon,
        draggable: true,
        riseOnHover: true
      });

      // Set up popup
      marker.bindPopup(createTankPopup(tank));

      // Handle tank selection
      marker.on('click', (e) => {
        e.originalEvent?.stopPropagation();
        
        if (uiState.selectedTanks.includes(tank.id)) {
          dispatch(deselectTank(tank.id));
        } else {
          dispatch(selectTank(tank.id));
        }
        
        console.log('🎯 Tank selected:', tank.name);
      });

      // Handle tank editing (double-click)
      marker.on('dblclick', (e) => {
        e.originalEvent?.stopPropagation();
        
        if (onTankEdit) {
          onTankEdit(tank);
          console.log('✏️ Tank edit requested:', tank.name);
        }
      });

      // Handle tank dragging
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        const updatedTank = {
          ...tank,
          location: {
            latitude: newLatLng.lat,
            longitude: newLatLng.lng
          },
          modified: new Date()
        };
        
        dispatch(updateTank(updatedTank));
        console.log('🚛 Tank moved:', tank.name, 'to', newLatLng);
      });

      // Style selected tanks differently
      if (uiState.selectedTanks.includes(tank.id)) {
        marker.setZIndexOffset(1000);
      }

      // Add to layer group
      tankLayerGroupRef.current?.addLayer(marker);
      tankMarkersRef.current.set(tank.id, marker);

      // Add coverage circle if enabled
      const coverageCircle = createCoverageCircle(tank);
      if (coverageCircle) {
        coverageLayerGroupRef.current?.addLayer(coverageCircle);
      }
    });

    // Auto-fit map bounds to show all tanks
    if (tanks.length > 0) {
      const group = new L.FeatureGroup(Array.from(tankMarkersRef.current.values()));
      const bounds = group.getBounds();
      
      if (bounds.isValid()) {
        // Add padding and ensure reasonable zoom level
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 16
        });
      }
    }

    console.log('🗺️ Tank markers updated:', tanks.length, 'tanks displayed');
  }, [tanks, uiState.selectedTanks, uiState.showCoverageZones, analysisParameters.maxEffectiveDistance, dispatch, map]);

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

export default TankMapLayer;