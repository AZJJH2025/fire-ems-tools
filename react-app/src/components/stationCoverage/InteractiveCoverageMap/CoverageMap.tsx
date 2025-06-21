/**
 * Interactive Coverage Map Component
 * 
 * Core mapping component for Station Coverage Optimizer that provides:
 * - Interactive Leaflet map with station markers
 * - Real-time isochrone generation using NFPA standards
 * - Coverage gap visualization
 * - Station placement tools
 * - Jurisdiction boundary management
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Paper, Typography, Alert, Chip, IconButton, Tooltip } from '@mui/material';
import {
  MyLocation as LocationIcon,
  Add as AddStationIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Leaflet imports - using standard pattern like other working components
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Station {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  station_type?: string;
  apparatus_count?: number;
  staffing_level?: number;
  operational_status?: string;
}

interface CoverageMapProps {
  stations: Station[];
  jurisdictionBoundary?: any;
  coverageStandard: 'nfpa1710' | 'nfpa1720';
  onStationAdd?: (station: Partial<Station>) => void;
  onStationSelect?: (station: Station) => void;
  onAnalysisUpdate?: (results: any) => void;
  analysisTriggered?: number;
}

const CoverageMap: React.FC<CoverageMapProps> = ({
  stations,
  jurisdictionBoundary,
  coverageStandard,
  onStationAdd,
  onStationSelect,
  onAnalysisUpdate,
  analysisTriggered
}) => {
  // Component state
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isGeneratingRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isPlacingStation, setIsPlacingStation] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    stations: true,
    isochrones: true,
    gaps: true,
    boundaries: true
  });
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
  const [coverageGaps, setCoverageGaps] = useState<any[]>([]);
  const [recommendedStations, setRecommendedStations] = useState<any[]>([]);

  // NFPA Standards Configuration
  const nfpaStandards = {
    nfpa1710: {
      name: 'NFPA 1710 (Career Departments)',
      travelTime: 240, // 4 minutes in seconds
      responseTimeGoal: 480, // 8 minutes total response time
      coverageGoal: 90, // 90% coverage requirement
      travelSpeed: 35 // MPH average emergency vehicle speed
    },
    nfpa1720: {
      name: 'NFPA 1720 (Volunteer Departments)',
      travelTime: 480, // 8 minutes travel time
      responseTimeGoal: 600, // 10 minutes total response time  
      coverageGoal: 80, // 80% coverage requirement
      travelSpeed: 35 // MPH average emergency vehicle speed
    }
  };

  const currentStandard = nfpaStandards[coverageStandard];

  /**
   * Simple point-in-polygon algorithm using ray casting
   */
  const isPointInPolygon = (point: L.LatLng, geometry: any): boolean => {
    if (geometry.type === 'Polygon') {
      return isPointInPolygonRing(point, geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some((polygon: any) => 
        isPointInPolygonRing(point, polygon[0])
      );
    }
    return false;
  };

  /**
   * Point-in-polygon test using ray casting algorithm
   */
  const isPointInPolygonRing = (point: L.LatLng, ring: number[][]): boolean => {
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  /**
   * Initialize Leaflet map - using proven pattern from working components
   */
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Fix Leaflet default icon paths using CDN URLs like other working components
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      
      // Initialize map with default center (can be updated based on data)
      const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4); // Center of US

      // Use OpenStreetMap tiles like other working components
      const primaryTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      });

      // Add the reliable tile layer
      primaryTileLayer.addTo(map);
      
      console.log('🗺️ Using OpenStreetMap tiles like other working components');
      console.log('🗺️ Leaflet marker icons configured with CDN URLs');

      // Store map instance
      mapInstanceRef.current = map;
      setIsMapReady(true);

      console.log('🗺️ Coverage map initialized successfully');

      // Add click handler for station placement
      map.on('click', handleMapClick);

    } catch (error) {
      console.error('❌ Failed to initialize coverage map:', error);
      setAnalysisStatus('error');
    }
  }, []);

  /**
   * Handle map clicks for station placement
   */
  const handleMapClick = useCallback((event: any) => {
    if (!isPlacingStation || !onStationAdd) return;

    const { lat, lng } = event.latlng;
    
    // Create new station at clicked location
    const newStation: Partial<Station> = {
      station_id: `STATION_${Date.now()}`,
      station_name: `New Station`,
      latitude: lat,
      longitude: lng,
      station_type: 'engine',
      operational_status: 'active'
    };

    onStationAdd(newStation);
    setIsPlacingStation(false);
    
    console.log('🚒 New station placed at:', lat, lng);
  }, [isPlacingStation, onStationAdd]);

  /**
   * Update station markers on map
   */
  const updateStationMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    try {
      const map = mapInstanceRef.current;

      // Clear existing station markers
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.stationType === 'station') {
          map.removeLayer(layer);
        }
      });

      // Add station markers
      stations.forEach((station) => {
        const marker = L.marker([station.latitude, station.longitude], {
          stationType: 'station' // Custom property for identification
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div>
            <h4>${station.station_name}</h4>
            <p><strong>ID:</strong> ${station.station_id}</p>
            <p><strong>Type:</strong> ${station.station_type || 'Unknown'}</p>
            <p><strong>Apparatus:</strong> ${station.apparatus_count || 'N/A'}</p>
            <p><strong>Status:</strong> ${station.operational_status || 'Unknown'}</p>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Add click handler
        marker.on('click', () => {
          if (onStationSelect) {
            onStationSelect(station);
          }
        });
      });

      // Fit map to station bounds if stations exist
      if (stations.length > 0) {
        const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      console.log('📍 Updated', stations.length, 'station markers');

    } catch (error) {
      console.error('❌ Failed to update station markers:', error);
    }
  }, [stations, isMapReady]);

  /**
   * Update jurisdiction boundary on map
   */
  const updateJurisdictionBoundary = useCallback(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    try {
      const map = mapInstanceRef.current;

      // Clear existing boundary layers
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.layerType === 'boundary') {
          map.removeLayer(layer);
        }
      });

      // Add jurisdiction boundary if provided
      if (jurisdictionBoundary && mapLayers.boundaries) {
        console.log('🗺️ Adding jurisdiction boundary to map');
        
        // Create GeoJSON layer for boundary
        const boundaryLayer = L.geoJSON(jurisdictionBoundary, {
          layerType: 'boundary',
          style: {
            color: '#ff6b35',
            weight: 3,
            opacity: 0.8,
            fillColor: '#ff6b35',
            fillOpacity: 0.1,
            dashArray: '5, 5'
          }
        }).addTo(map);

        // Add popup with boundary info if properties exist
        if (jurisdictionBoundary.features && jurisdictionBoundary.features[0]?.properties) {
          const props = jurisdictionBoundary.features[0].properties;
          const popupContent = `
            <div>
              <h4>${props.name || 'Jurisdiction Boundary'}</h4>
              ${props.population ? `<p><strong>Population:</strong> ${props.population.toLocaleString()}</p>` : ''}
              ${props.area_sq_miles ? `<p><strong>Area:</strong> ${props.area_sq_miles} sq miles</p>` : ''}
              ${props.county ? `<p><strong>County:</strong> ${props.county}</p>` : ''}
              ${props.state ? `<p><strong>State:</strong> ${props.state}</p>` : ''}
            </div>
          `;
          boundaryLayer.bindPopup(popupContent);
        }

        // Fit map to boundary if no stations
        if (stations.length === 0) {
          map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
        }

        console.log('✅ Jurisdiction boundary added to map');
      }

    } catch (error) {
      console.error('❌ Failed to update jurisdiction boundary:', error);
    }
  }, [jurisdictionBoundary, isMapReady, mapLayers.boundaries, stations.length]);

  /**
   * Generate isochrones for coverage analysis
   */
  const generateIsochrones = useCallback(async () => {
    if (!mapInstanceRef.current || !isMapReady || stations.length === 0) return;
    
    // Prevent concurrent isochrone generation
    if (isGeneratingRef.current) {
      console.log('🔄 Isochrone generation already in progress, skipping...');
      return;
    }

    isGeneratingRef.current = true;
    setAnalysisStatus('analyzing');

    try {
      const map = mapInstanceRef.current;

      // Clear existing isochrones
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.layerType === 'isochrone') {
          map.removeLayer(layer);
        }
      });

      // Generate isochrones for each station
      const isochronePromises = stations.map(async (station) => {
        return generateStationIsochrone(station);
      });

      const isochrones = await Promise.all(isochronePromises);
      
      // Add isochrones to map
      isochrones.forEach((isochroneData, index) => {
        if (isochroneData) {
          addIsochroneToMap(isochroneData, stations[index]);
        }
      });

      setAnalysisStatus('complete');

      // Calculate coverage metrics
      const coverageMetrics = calculateCoverageMetrics();
      if (onAnalysisUpdate) {
        onAnalysisUpdate(coverageMetrics);
      }

      console.log('✅ Generated isochrones for', stations.length, 'stations');

    } catch (error) {
      console.error('❌ Failed to generate isochrones:', error);
      setAnalysisStatus('error');
    } finally {
      isGeneratingRef.current = false;
    }
  }, [stations, isMapReady, currentStandard]);

  /**
   * Generate isochrone for a single station (placeholder implementation)
   */
  const generateStationIsochrone = async (station: Station) => {
    // TODO: Implement actual isochrone generation
    // This would typically use a routing service or algorithm
    
    // Placeholder: Generate simple radius based on NFPA travel time
    const travelTimeMinutes = currentStandard.travelTime / 60;
    const radiusMeters = (currentStandard.travelSpeed * 1609.34 * travelTimeMinutes) / 60; // Convert to meters

    return {
      center: [station.latitude, station.longitude],
      radius: radiusMeters,
      travelTime: currentStandard.travelTime,
      stationId: station.station_id
    };
  };

  /**
   * Add isochrone visualization to map
   */
  const addIsochroneToMap = (isochroneData: any, station: Station) => {
    if (!mapInstanceRef.current) return;

    try {
      const map = mapInstanceRef.current;

      // Create circle representing coverage area
      const circle = L.circle(isochroneData.center, {
        radius: isochroneData.radius,
        layerType: 'isochrone',
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map);

      // Add popup with coverage info
      circle.bindPopup(`
        <div>
          <h4>${station.station_name} Coverage</h4>
          <p><strong>Travel Time:</strong> ${isochroneData.travelTime / 60} minutes</p>
          <p><strong>Standard:</strong> ${currentStandard.name}</p>
        </div>
      `);

    } catch (error) {
      console.error('❌ Failed to add isochrone to map:', error);
    }
  };

  /**
   * Perform real coverage gap analysis
   */
  const performCoverageAnalysis = useCallback(async () => {
    if (!mapInstanceRef.current || stations.length === 0) {
      console.warn('Cannot perform analysis: missing map or stations');
      return;
    }

    setAnalysisStatus('analyzing');
    console.log('🔍 Starting comprehensive coverage gap analysis...');

    try {
      // Step 1: Calculate coverage areas for all stations
      const coverageAreas = stations.map(station => {
        const travelTimeMinutes = currentStandard.travelTime / 60;
        const radiusMeters = (currentStandard.travelSpeed * 1609.34 * travelTimeMinutes) / 60;
        
        return {
          station,
          center: [station.latitude, station.longitude],
          radius: radiusMeters,
          coverageCircle: L.circle([station.latitude, station.longitude], { radius: radiusMeters })
        };
      });

      // Step 2: Identify coverage gaps using grid-based analysis
      const gaps = await identifyCoverageGaps(coverageAreas);
      setCoverageGaps(gaps);

      // Step 3: Generate station recommendations
      const recommendations = generateStationRecommendations(gaps);
      setRecommendedStations(recommendations);

      // Step 4: Calculate comprehensive metrics
      const metrics = calculateRealCoverageMetrics(coverageAreas, gaps);

      // Step 5: Visualize gaps and recommendations on map
      visualizeCoverageGaps(gaps);
      visualizeRecommendedStations(recommendations);

      setAnalysisStatus('complete');
      
      // Report results
      if (onAnalysisUpdate) {
        onAnalysisUpdate({
          ...metrics,
          gaps,
          recommendations,
          totalStations: stations.length,
          coverageStandard,
          analysisDate: new Date().toISOString()
        });
      }

      console.log('✅ Coverage analysis complete:', {
        gaps: gaps.length,
        recommendations: recommendations.length,
        metrics
      });

    } catch (error) {
      console.error('❌ Coverage analysis failed:', error);
      setAnalysisStatus('error');
    }
  }, [stations, jurisdictionBoundary, currentStandard, onAnalysisUpdate]);

  /**
   * Identify coverage gaps using grid-based analysis
   */
  const identifyCoverageGaps = async (coverageAreas: any[]) => {
    const gaps: any[] = [];
    
    // Use jurisdiction boundary if available, otherwise use station bounds with padding
    let bounds;
    let usingJurisdictionBoundary = false;
    
    if (jurisdictionBoundary && (jurisdictionBoundary.features || jurisdictionBoundary.type)) {
      console.log('🏛️ Jurisdiction boundary detected:', jurisdictionBoundary);
      const boundaryLayer = L.geoJSON(jurisdictionBoundary);
      bounds = boundaryLayer.getBounds();
      usingJurisdictionBoundary = true;
      console.log('🗺️ Using jurisdiction boundary for analysis area');
    } else {
      // Create bounds from stations with padding
      if (stations.length === 0) return gaps;
      
      const stationBounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      const padding = 0.05; // 5km padding in decimal degrees (approximate)
      bounds = L.latLngBounds([
        [stationBounds.getSouth() - padding, stationBounds.getWest() - padding],
        [stationBounds.getNorth() + padding, stationBounds.getEast() + padding]
      ]);
      
      console.log('🗺️ Using station bounds with padding for analysis area (no jurisdiction boundary)');
    }
    
    // Create analysis grid (1km x 1km cells)
    const gridSize = 0.01; // Approximately 1km in decimal degrees
    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    console.log('📋 Analyzing coverage with grid:', {
      bounds: { minLat, maxLat, minLng, maxLng },
      gridSize,
      totalCells: Math.ceil((maxLat - minLat) / gridSize) * Math.ceil((maxLng - minLng) / gridSize)
    });

    // Analyze each grid cell
    for (let lat = minLat; lat < maxLat; lat += gridSize) {
      for (let lng = minLng; lng < maxLng; lng += gridSize) {
        const cellCenter = L.latLng(lat + gridSize/2, lng + gridSize/2);
        
        // Check if cell is within analysis area
        let withinBoundary = true;
        
        // If we have a jurisdiction boundary, do precise point-in-polygon check
        if (usingJurisdictionBoundary) {
          withinBoundary = false; // Start with false, prove it's inside
          
          try {
            // Simple point-in-polygon using Leaflet's built-in capabilities
            const testPoint = L.latLng(cellCenter.lat, cellCenter.lng);
            const boundaryLayer = L.geoJSON(jurisdictionBoundary);
            
            // Check each polygon in the boundary
            boundaryLayer.eachLayer((layer: any) => {
              if (layer.getBounds && layer.getBounds().contains(testPoint)) {
                // More precise check using polygon contains logic
                if (layer.feature && layer.feature.geometry) {
                  withinBoundary = isPointInPolygon(testPoint, layer.feature.geometry);
                  if (withinBoundary) return; // Exit early if found
                }
              }
            });
          } catch (error) {
            console.warn('Point-in-polygon check failed, defaulting to bounds check:', error);
            withinBoundary = true; // Fallback to bounds check
          }
        }

        if (!withinBoundary) continue;

        // Check if cell is covered by any station
        let isCovered = false;
        for (const coverage of coverageAreas) {
          const distance = cellCenter.distanceTo(L.latLng(coverage.center[0], coverage.center[1]));
          if (distance <= coverage.radius) {
            isCovered = true;
            break;
          }
        }

        // If not covered, add to gaps
        if (!isCovered) {
          gaps.push({
            id: `gap_${gaps.length + 1}`,
            center: [cellCenter.lat, cellCenter.lng],
            bounds: {
              north: lat + gridSize,
              south: lat,
              east: lng + gridSize,
              west: lng
            },
            type: 'uncovered_area',
            severity: 'high', // TODO: Calculate based on population density
            estimatedPopulation: Math.floor(Math.random() * 1000) + 100 // Placeholder
          });
        }
      }
    }

    console.log(`🔴 Identified ${gaps.length} coverage gaps`);
    return gaps;
  };

  /**
   * Generate station placement recommendations
   */
  const generateStationRecommendations = (gaps: any[]) => {
    const recommendations: any[] = [];
    
    if (gaps.length === 0) {
      console.log('✅ No coverage gaps found - no station recommendations needed');
      return recommendations;
    }

    // Group nearby gaps and recommend stations for clusters
    const gapClusters = clusterGaps(gaps);
    
    gapClusters.forEach((cluster, index) => {
      const centroid = calculateClusterCentroid(cluster);
      
      recommendations.push({
        id: `recommendation_${index + 1}`,
        position: centroid,
        type: 'new_station',
        priority: cluster.length > 3 ? 'high' : 'medium',
        gapsCovered: cluster.length,
        estimatedPopulationServed: cluster.reduce((sum, gap) => sum + gap.estimatedPopulation, 0),
        reasoning: `Recommended to cover ${cluster.length} identified gaps in this area`
      });
    });

    console.log(`📍 Generated ${recommendations.length} station recommendations`);
    return recommendations;
  };

  /**
   * Cluster nearby gaps for station recommendations
   */
  const clusterGaps = (gaps: any[]) => {
    const clusters: any[][] = [];
    const processed = new Set();
    const clusterRadius = 5000; // 5km clustering radius

    gaps.forEach((gap, index) => {
      if (processed.has(index)) return;
      
      const cluster = [gap];
      processed.add(index);
      
      // Find nearby gaps
      gaps.forEach((otherGap, otherIndex) => {
        if (processed.has(otherIndex)) return;
        
        const distance = L.latLng(gap.center[0], gap.center[1])
          .distanceTo(L.latLng(otherGap.center[0], otherGap.center[1]));
        
        if (distance <= clusterRadius) {
          cluster.push(otherGap);
          processed.add(otherIndex);
        }
      });
      
      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    });

    return clusters;
  };

  /**
   * Calculate centroid of gap cluster
   */
  const calculateClusterCentroid = (cluster: any[]) => {
    const avgLat = cluster.reduce((sum, gap) => sum + gap.center[0], 0) / cluster.length;
    const avgLng = cluster.reduce((sum, gap) => sum + gap.center[1], 0) / cluster.length;
    return [avgLat, avgLng];
  };

  /**
   * Calculate real coverage metrics
   */
  const calculateRealCoverageMetrics = (coverageAreas: any[], gaps: any[]) => {
    if (!jurisdictionBoundary) {
      return {
        coverageMetrics: {
          populationCovered: 0,
          areaCovered: 0,
          nfpaCompliance: 0
        },
        identifiedGaps: gaps.length,
        recommendedStations: 0
      };
    }

    // Calculate total jurisdiction area (approximate)
    const boundaryLayer = L.geoJSON(jurisdictionBoundary);
    const bounds = boundaryLayer.getBounds();
    const totalArea = (bounds.getNorth() - bounds.getSouth()) * (bounds.getEast() - bounds.getWest());
    
    // Calculate covered area (approximate)
    const gapArea = gaps.length * 0.01 * 0.01; // Each gap is approximately 0.01 x 0.01 degrees
    const coveredArea = Math.max(0, totalArea - gapArea);
    const areaCoveredPercent = (coveredArea / totalArea) * 100;
    
    // Estimate population coverage (placeholder calculation)
    const totalEstimatedPopulation = gaps.reduce((sum, gap) => sum + gap.estimatedPopulation, 0) + (stations.length * 5000);
    const coveredPopulation = Math.max(0, totalEstimatedPopulation - gaps.reduce((sum, gap) => sum + gap.estimatedPopulation, 0));
    const populationCoveredPercent = totalEstimatedPopulation > 0 ? (coveredPopulation / totalEstimatedPopulation) * 100 : 100;
    
    // Calculate NFPA compliance
    const nfpaCompliance = Math.min(areaCoveredPercent, populationCoveredPercent);
    
    return {
      coverageMetrics: {
        populationCovered: Math.round(populationCoveredPercent * 10) / 10,
        areaCovered: Math.round(areaCoveredPercent * 10) / 10,
        nfpaCompliance: Math.round(nfpaCompliance * 10) / 10
      },
      identifiedGaps: gaps.length,
      recommendedStations: recommendedStations.length
    };
  };

  /**
   * Visualize coverage gaps on map
   */
  const visualizeCoverageGaps = (gaps: any[]) => {
    if (!mapInstanceRef.current || !mapLayers.gaps) return;

    const map = mapInstanceRef.current;

    // Clear existing gap layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.layerType === 'gap') {
        map.removeLayer(layer);
      }
    });

    // Add gap visualization
    gaps.forEach((gap) => {
      const rectangle = L.rectangle([
        [gap.bounds.south, gap.bounds.west],
        [gap.bounds.north, gap.bounds.east]
      ], {
        layerType: 'gap',
        color: '#ff4444',
        fillColor: '#ff4444',
        fillOpacity: 0.3,
        weight: 1
      }).addTo(map);

      rectangle.bindPopup(`
        <div>
          <h4>🔴 Coverage Gap</h4>
          <p><strong>Severity:</strong> ${gap.severity}</p>
          <p><strong>Est. Population:</strong> ${gap.estimatedPopulation}</p>
          <p><strong>Area:</strong> ~1 km²</p>
        </div>
      `);
    });

    console.log(`📍 Visualized ${gaps.length} coverage gaps on map`);
  };

  /**
   * Visualize recommended station locations
   */
  const visualizeRecommendedStations = (recommendations: any[]) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing recommendation layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.layerType === 'recommendation') {
        map.removeLayer(layer);
      }
    });

    // Add recommendation markers
    recommendations.forEach((rec) => {
      const marker = L.marker(rec.position, {
        layerType: 'recommendation',
        icon: L.divIcon({
          className: 'recommended-station-marker',
          html: '<div style="background-color: #4CAF50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">+</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map);

      marker.bindPopup(`
        <div>
          <h4>🟢 Recommended Station</h4>
          <p><strong>Priority:</strong> ${rec.priority}</p>
          <p><strong>Gaps Covered:</strong> ${rec.gapsCovered}</p>
          <p><strong>Population Served:</strong> ~${rec.estimatedPopulationServed}</p>
          <p><strong>Reasoning:</strong> ${rec.reasoning}</p>
        </div>
      `);
    });

    console.log(`🟢 Visualized ${recommendations.length} station recommendations on map`);
  };

  /**
   * Calculate coverage metrics (placeholder implementation)
   */
  const calculateCoverageMetrics = () => {
    // This is now handled by performCoverageAnalysis
    return performCoverageAnalysis();
  };

  /**
   * Toggle station placement mode
   */
  const toggleStationPlacement = useCallback(() => {
    setIsPlacingStation(!isPlacingStation);
    console.log('🎯 Station placement mode:', !isPlacingStation ? 'ON' : 'OFF');
  }, [isPlacingStation]);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array since initializeMap should only run once

  // Update markers when stations change
  useEffect(() => {
    updateStationMarkers();
  }, [stations, isMapReady]);

  // Update boundary when boundary data changes
  useEffect(() => {
    updateJurisdictionBoundary();
  }, [jurisdictionBoundary, isMapReady, mapLayers.boundaries]);

  // Generate isochrones when stations or standard changes
  useEffect(() => {
    if (stations.length > 0 && mapLayers.isochrones) {
      const timer = setTimeout(() => {
        generateIsochrones();
      }, 1000); // Debounce isochrone generation

      return () => clearTimeout(timer);
    }
  }, [stations, coverageStandard, mapLayers.isochrones]);

  // Listen for analysis trigger from parent component
  useEffect(() => {
    if (analysisTriggered && analysisTriggered > 0) {
      const timer = setTimeout(() => {
        performCoverageAnalysis();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [analysisTriggered, performCoverageAnalysis]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          cursor: isPlacingStation ? 'crosshair' : 'default'
        }}
      />

      {/* Map Controls Overlay */}
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000
        }}
      >
        <Tooltip title="Add Station">
          <IconButton
            color={isPlacingStation ? 'primary' : 'default'}
            onClick={toggleStationPlacement}
            sx={{
              bgcolor: isPlacingStation ? 'primary.main' : 'transparent',
              color: isPlacingStation ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: isPlacingStation ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <AddStationIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Center on Location">
          <IconButton>
            <LocationIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title={`Toggle Boundary: ${mapLayers.boundaries ? 'ON' : 'OFF'}`}>
          <IconButton
            color={mapLayers.boundaries ? 'primary' : 'default'}
            onClick={() => setMapLayers(prev => ({ ...prev, boundaries: !prev.boundaries }))}
            sx={{
              bgcolor: mapLayers.boundaries ? 'primary.main' : 'transparent',
              color: mapLayers.boundaries ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: mapLayers.boundaries ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000
        }}
      >
        <Chip
          label={currentStandard.name}
          size="small"
          color="primary"
          sx={{ mr: 1 }}
        />
        
        {analysisStatus === 'analyzing' && (
          <Chip
            label="Analyzing Coverage..."
            size="small"
            color="warning"
          />
        )}
        
        {analysisStatus === 'complete' && (
          <Chip
            label="Analysis Complete"
            size="small"
            color="success"
          />
        )}
        
        {analysisStatus === 'error' && (
          <Chip
            label="Analysis Error"
            size="small"
            color="error"
          />
        )}
      </Box>

      {/* Station Placement Instructions */}
      {isPlacingStation && (
        <Alert
          severity="info"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 80,
            zIndex: 1000
          }}
        >
          Click on the map to place a new fire station
        </Alert>
      )}

      {/* No Stations Message */}
      {stations.length === 0 && isMapReady && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 1000,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            p: 3,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Stations Loaded
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload station data or use the + button to add stations manually
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CoverageMap;