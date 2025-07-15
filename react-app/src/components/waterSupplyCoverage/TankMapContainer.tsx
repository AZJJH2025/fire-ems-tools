/**
 * Water Supply Coverage Map Container
 * 
 * Specialized map container for water supply coverage analysis.
 * Supports both tanks and hydrants with unified map interface.
 * Integrates with Fire Map Pro's map architecture.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import * as L from 'leaflet';

import {
  selectTanks,
  selectHydrants,
  selectAllSupplies,
  selectUIState
} from '../../state/redux/waterSupplyCoverageSlice';

import { getSupplyLocation } from '../../types/tankZoneCoverage';

// Import map components from Fire Map Pro
import { CoordinateDisplayUI } from '../fireMapPro/Map/CoordinateDisplay';
import PureLeafletMap from '../fireMapPro/Map/PureLeafletMap';

// Import water supply components
import TankMapLayer from './TankMapLayer';
import HydrantMapLayer from './HydrantMapLayer';
import TankPropertyEditor from './TankPropertyEditor';
import HydrantPropertyEditor from './HydrantPropertyEditor';

// Fix for default markers in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TankMapContainerProps {
  sidebarOpen?: boolean;
  isMobile?: boolean;
}

/**
 * Water Supply Coverage Map Container
 */
const TankMapContainer: React.FC<TankMapContainerProps> = ({ 
  sidebarOpen = false, 
  isMobile = false 
}) => {
  const dispatch = useDispatch();
  const tanks = useSelector(selectTanks);
  const hydrants = useSelector(selectHydrants);
  const allSupplies = useSelector(selectAllSupplies);
  const uiState = useSelector(selectUIState);
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [_coordinateInfo, setCoordinateInfo] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  }>({
    latitude: 39.8283, // Center of US
    longitude: -98.5795,
    zoom: 4
  });

  // Water supply property editor state
  const [tankEditorOpen, setTankEditorOpen] = useState(false);
  const [hydrantEditorOpen, setHydrantEditorOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<any>(null);
  const [editingHydrant, setEditingHydrant] = useState<any>(null);
  const [pendingSupplyLocation, setPendingSupplyLocation] = useState<{lat: number, lng: number, type: 'tank' | 'hydrant'} | null>(null);
  
  // Map click placement mode
  const [placementMode, setPlacementMode] = useState<'tank' | 'hydrant'>('tank');

  // Handle map initialization
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    setIsMapReady(true);

    // Set up click-to-place water supply functionality
    map.on('click', (e: L.LeafletMouseEvent) => {
      // Only place supply if nothing is selected (avoids accidental placement)
      if (uiState.selectedTanks.length === 0 && uiState.selectedHydrants.length === 0) {
        // Use current placement mode (tank or hydrant)
        const supplyType = placementMode;
        
        // Store the location and open the appropriate property editor
        setPendingSupplyLocation({ lat: e.latlng.lat, lng: e.latlng.lng, type: supplyType });
        
        if (supplyType === 'tank') {
          // Create a temporary tank for the editor
          const tempTank = {
            id: `temp-${Date.now()}`,
            name: `Tank ${tanks.length + 1}`,
            location: {
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            },
            capacity: 25000, // Default 25,000 gallons
            type: 'municipal' as any,
            accessRating: 'good' as any,
            operationalStatus: 'active' as any,
            owner: 'Fire Department',
            contactInfo: '',
            notes: '',
            created: new Date(),
            modified: new Date()
          };
          
          setEditingTank(tempTank);
          setTankEditorOpen(true);
          console.log('🎯 Opening tank editor for new tank at:', e.latlng);
        } else {
          // Create a temporary hydrant for the editor
          const tempHydrant = {
            id: `temp-${Date.now()}`,
            name: `Hydrant ${hydrants.length + 1}`,
            location: {
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            },
            flowRate: 1000, // Default 1,000 GPM
            staticPressure: 50, // Default 50 PSI
            residualPressure: 20, // Default 20 PSI
            type: 'municipal' as any,
            size: '4-inch' as any,
            operationalStatus: 'active' as any,
            owner: 'Water Department',
            contactInfo: '',
            notes: '',
            created: new Date(),
            modified: new Date()
          };
          
          setEditingHydrant(tempHydrant);
          setHydrantEditorOpen(true);
          console.log('🎯 Opening hydrant editor for new hydrant at:', e.latlng);
        }
      }
    });

    // Update coordinate display on map movement
    map.on('move', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setCoordinateInfo({
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom
      });
    });

    // Set initial view based on existing water supplies or default location
    if (allSupplies.length > 0) {
      // Filter supplies with valid locations
      const validSupplies = allSupplies.filter(supply => 
        getSupplyLocation(supply) && getSupplyLocation(supply).latitude && getSupplyLocation(supply).longitude
      );
      
      if (validSupplies.length > 0) {
        const bounds = L.latLngBounds(validSupplies.map(supply => 
          [getSupplyLocation(supply).latitude, getSupplyLocation(supply).longitude]
        ));
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
      } else {
        // Default view if no valid locations
        map.setView([39.8283, -98.5795], 4);
      }
    } else {
      // Default view of United States
      map.setView([39.8283, -98.5795], 4);
    }

    console.log('🗺️ Water supply map initialized with', tanks.length, 'tanks and', hydrants.length, 'hydrants');
  }, [allSupplies, uiState.selectedTanks.length, uiState.selectedHydrants.length, placementMode, dispatch]);

  // Handle map errors
  const _handleMapError = useCallback((error: string) => {
    console.error('Tank map error:', error);
  }, []);

  // Auto-fit bounds when water supplies change
  useEffect(() => {
    if (!mapRef.current || allSupplies.length === 0) return;

    const map = mapRef.current;
    
    // Ensure map is properly sized first
    setTimeout(() => {
      map.invalidateSize();
      
      // Filter supplies with valid locations
      const validSupplies = allSupplies.filter(supply => 
        getSupplyLocation(supply) && getSupplyLocation(supply).latitude && getSupplyLocation(supply).longitude
      );
      
      if (validSupplies.length === 0) return;
      
      const bounds = L.latLngBounds(validSupplies.map(supply => 
        [getSupplyLocation(supply).latitude, getSupplyLocation(supply).longitude]
      ));
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 16,
          animate: true,
          duration: 0.5
        });
      }
    }, 100);
  }, [allSupplies.length]); // Only trigger on total supply count change, not position updates

  // Handle map resizing when container dimensions change
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Invalidate map size when component mounts or layout changes
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
      console.log('🗺️ Map size invalidated due to layout change');
    }, 200);
    
    return () => clearTimeout(resizeTimeout);
  }, [isMapReady]);

  // Handle sidebar state changes - resize map when sidebar opens/closes
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Multiple resize attempts to ensure proper layout
    const resizeTimeouts = [100, 300, 500]; // Multiple timing attempts
    
    resizeTimeouts.forEach(delay => {
      setTimeout(() => {
        if (!mapRef.current) return;
        
        map.invalidateSize();
        
        // Force map to recalculate its container size
        map.invalidateSize(true); // Force hard refresh
        
        // If we have supplies, recenter the view
        if (allSupplies.length > 0) {
          const validSupplies = allSupplies.filter(supply => 
            getSupplyLocation(supply) && getSupplyLocation(supply).latitude && getSupplyLocation(supply).longitude
          );
          
          if (validSupplies.length > 0) {
            const bounds = L.latLngBounds(validSupplies.map(supply => 
              [getSupplyLocation(supply).latitude, getSupplyLocation(supply).longitude]
            ));
            
            if (bounds.isValid()) {
              map.fitBounds(bounds, { 
                padding: [50, 50], 
                maxZoom: 16
              });
            }
          }
        }
        
        console.log(`🗺️ Map resized due to layout change (${delay}ms delay) - sidebarOpen: ${sidebarOpen}, isMobile: ${isMobile}`);
      }, delay);
    });
  }, [sidebarOpen, isMobile, allSupplies.length]); // Trigger on actual sidebar state changes
  
  // ResizeObserver to detect container size changes (sidebar toggle, etc.)
  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Container size changed - likely due to sidebar toggle
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize(true);
            console.log('🗺️ Map resized due to container size change:', {
              width: entry.contentRect.width,
              height: entry.contentRect.height
            });
          }
        }, 50);
      }
    });
    
    resizeObserver.observe(mapContainerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [isMapReady]);
  
  // Additional layout change detection - listen for window resize events
  useEffect(() => {
    if (!mapRef.current) return;
    
    const handleWindowResize = () => {
      if (!mapRef.current) return;
      
      setTimeout(() => {
        mapRef.current?.invalidateSize(true);
        console.log('🗺️ Map resized due to window resize');
      }, 100);
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Handle tank property editor close
  const handleTankEditorClose = () => {
    setTankEditorOpen(false);
    setEditingTank(null);
    setPendingSupplyLocation(null);
  };

  // Handle hydrant property editor close
  const handleHydrantEditorClose = () => {
    setHydrantEditorOpen(false);
    setEditingHydrant(null);
    setPendingSupplyLocation(null);
  };

  // Handle tank edit request from map
  const handleTankEdit = (tank: any) => {
    setEditingTank(tank);
    setTankEditorOpen(true);
    setPendingSupplyLocation(null); // This is an existing tank, not a new one
  };

  // Handle hydrant edit request from map
  const handleHydrantEdit = (hydrant: any) => {
    setEditingHydrant(hydrant);
    setHydrantEditorOpen(true);
    setPendingSupplyLocation(null); // This is an existing hydrant, not a new one
  };

  return (
    <Box 
      ref={mapContainerRef}
      sx={{ 
        height: '100%', 
        width: '100%', 
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: '8px', // Add consistent padding around map
        boxSizing: 'border-box'
      }}
    >
      {/* Map Component */}
      <PureLeafletMap
        onMapReady={handleMapReady}
      />

      {/* Water Supply Layers */}
      {isMapReady && (
        <>
          <TankMapLayer 
            map={mapRef.current} 
            onTankEdit={handleTankEdit}
          />
          <HydrantMapLayer 
            map={mapRef.current} 
            onHydrantEdit={handleHydrantEdit}
          />
        </>
      )}

      {/* Coordinate Display */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          p: 1,
          borderRadius: 1,
          fontSize: '0.75rem'
        }}
      >
        <CoordinateDisplayUI mouseCoords={null} />
      </Box>

      {/* Placement Mode Selector - moved to avoid zoom controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16, // Moved to right side to avoid zoom controls
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'flex-end' // Align to right edge
        }}
      >
        {/* Mode Selector */}
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            p: 1,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium', mb: 0.5, display: 'block' }}>
            Click to Place:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={placementMode}
            exclusive
            onChange={(_, newMode) => {
              if (newMode !== null) {
                setPlacementMode(newMode);
                console.log('🎯 Placement mode changed to:', newMode);
              }
            }}
            sx={{ 
              '& .MuiToggleButton-root': { 
                fontSize: '0.75rem',
                px: 1,
                py: 0.5,
                minWidth: 'auto'
              }
            }}
          >
            <ToggleButton value="tank">
              🏢 Tank
            </ToggleButton>
            <ToggleButton value="hydrant">
              🚰 Hydrant
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Water Supply Count Display */}
        <Box
          sx={{
            bgcolor: 'rgba(33, 150, 243, 0.9)',
            color: 'white',
            p: 1,
            borderRadius: 1,
            fontSize: '0.875rem',
            fontWeight: 'medium'
          }}
        >
          {tanks.length} {tanks.length === 1 ? 'Tank' : 'Tanks'}
          {hydrants.length > 0 && (
            <span style={{ marginLeft: '8px' }}>
              • {hydrants.length} {hydrants.length === 1 ? 'Hydrant' : 'Hydrants'}
            </span>
          )}
        </Box>
      </Box>

      {/* Instructions Overlay */}
      {allSupplies.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            p: 3,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: 350,
            boxShadow: 2
          }}
        >
          <Typography variant="h6" gutterBottom color="primary">
            Welcome to Water Supply Coverage Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the placement mode selector in the top-left to choose between tanks and hydrants, then click anywhere on the map to place water supplies. You can also use the "Add Tank" and "Add Hydrant" buttons in the sidebar.
          </Typography>
        </Box>
      )}

      {/* Property Editor Dialogs */}
      <TankPropertyEditor
        tank={editingTank}
        open={tankEditorOpen}
        onClose={handleTankEditorClose}
        isNewTank={!!pendingSupplyLocation && pendingSupplyLocation.type === 'tank'}
      />
      
      <HydrantPropertyEditor
        hydrant={editingHydrant}
        open={hydrantEditorOpen}
        onClose={handleHydrantEditorClose}
        isNewHydrant={!!pendingSupplyLocation && pendingSupplyLocation.type === 'hydrant'}
      />
    </Box>
  );
};

export default TankMapContainer;