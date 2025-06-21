/**
 * Direct Leaflet Tile Layer
 * 
 * Bypasses React-Leaflet TileLayer component and uses native Leaflet tile loading
 * with manual fallback handling to fix tile loading issues.
 */

import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface DirectTileLayerProps {
  primary: {
    url: string;
    attribution: string;
    maxZoom: number;
    minZoom?: number;
  };
}

const DirectTileLayer: React.FC<DirectTileLayerProps> = ({ primary }) => {
  const map = useMap();
  const currentLayerRef = useRef<L.TileLayer | null>(null);
  const currentProviderRef = useRef<number>(0);

  // Tile providers with working URLs
  const providers = [
    {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      name: 'OpenStreetMap Single'
    },
    {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors', 
      name: 'OpenStreetMap Multi'
    },
    {
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/light_all/{z}/{x}/{y}.png',
      attribution: '© CARTO, © OpenStreetMap contributors',
      name: 'CartoDB Light'
    },
    {
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
      attribution: '© Wikimedia maps, © OpenStreetMap contributors',
      name: 'Wikimedia'
    }
  ];

  const addTileLayer = (providerIndex: number) => {
    // Remove existing layer
    if (currentLayerRef.current) {
      map.removeLayer(currentLayerRef.current);
      currentLayerRef.current = null;
    }

    if (providerIndex >= providers.length) {
      console.error('[DirectTileLayer] All providers exhausted');
      return;
    }

    const provider = providers[providerIndex];
    console.log(`[DirectTileLayer] Loading provider: ${provider.name}`);

    // Create native Leaflet tile layer
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: primary.maxZoom,
      minZoom: primary.minZoom || 1,
      tileSize: 256,
      updateWhenIdle: true,
      keepBuffer: 2,
      crossOrigin: true,
      // Additional options for better rendering
      opacity: 1,
      className: 'fire-map-tiles', // Add custom class for CSS targeting
      errorTileUrl: '' // No error tiles to avoid confusion
    });

    let tilesLoaded = 0;
    let tilesErrored = 0;
    let switchTimeout: NodeJS.Timeout;

    // Set up event handlers
    tileLayer.on('tileload', () => {
      tilesLoaded++;
      console.log(`[DirectTileLayer] Tile loaded from ${provider.name} (${tilesLoaded} total)`);
      
      // Clear switch timeout once tiles start loading
      if (switchTimeout) {
        clearTimeout(switchTimeout);
      }
    });

    tileLayer.on('tileerror', (e: any) => {
      tilesErrored++;
      console.warn(`[DirectTileLayer] Tile error from ${provider.name}:`, e);
      
      // If too many errors, switch providers
      if (tilesErrored > 5) {
        console.log(`[DirectTileLayer] Too many errors (${tilesErrored}), switching providers`);
        currentProviderRef.current++;
        addTileLayer(currentProviderRef.current);
      }
    });

    tileLayer.on('loading', () => {
      console.log(`[DirectTileLayer] Starting to load tiles from ${provider.name}`);
      
      // Set timeout to switch providers if no tiles load within 8 seconds
      switchTimeout = setTimeout(() => {
        if (tilesLoaded === 0) {
          console.warn(`[DirectTileLayer] No tiles loaded within 8s from ${provider.name}, switching`);
          currentProviderRef.current++;
          addTileLayer(currentProviderRef.current);
        }
      }, 8000);
    });

    tileLayer.on('load', () => {
      console.log(`[DirectTileLayer] All visible tiles loaded from ${provider.name}`);
    });

    // Add to map
    currentLayerRef.current = tileLayer;
    tileLayer.addTo(map);
    
    // Force tile layer to be visible and at the very bottom
    tileLayer.setZIndex(-1);
    
    // Force immediate refresh and ensure tiles are visible
    setTimeout(() => {
      map.invalidateSize();
      
      // AGGRESSIVE fixes for tile visibility
      const container = map.getContainer();
      const tilePane = container.querySelector('.leaflet-tile-pane');
      if (tilePane) {
        (tilePane as HTMLElement).style.opacity = '1 !important';
        (tilePane as HTMLElement).style.visibility = 'visible !important';
        (tilePane as HTMLElement).style.zIndex = '-1';
        (tilePane as HTMLElement).style.position = 'absolute';
        (tilePane as HTMLElement).style.pointerEvents = 'none';
        (tilePane as HTMLElement).style.background = 'transparent';
        console.log(`[DirectTileLayer] AGGRESSIVELY forced tile pane visibility for ${provider.name}`);
      }
      
      // Force remove any potential overlay layers that could block tiles
      const overlayPane = container.querySelector('.leaflet-overlay-pane');
      if (overlayPane) {
        (overlayPane as HTMLElement).style.pointerEvents = 'none';
        (overlayPane as HTMLElement).style.background = 'transparent';
        console.log(`[DirectTileLayer] Made overlay pane transparent`);
      }
      
      // Force map container background
      (container as HTMLElement).style.background = 'transparent';
      
      // Force individual tile visibility
      const tiles = container.querySelectorAll('.leaflet-tile');
      tiles.forEach((tile, i) => {
        (tile as HTMLElement).style.opacity = '1';
        (tile as HTMLElement).style.visibility = 'visible';
        (tile as HTMLElement).style.display = 'block';
        if (i < 3) {
          console.log(`[DirectTileLayer] Forced tile ${i} visibility:`, (tile as HTMLImageElement).src);
        }
      });
      
    }, 100);
  };

  // Initialize tile layer
  useEffect(() => {
    addTileLayer(0);
    
    // Cleanup on unmount
    return () => {
      if (currentLayerRef.current) {
        map.removeLayer(currentLayerRef.current);
      }
    };
  }, [map]);

  // Expose debugging methods
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).switchTileProvider = () => {
        currentProviderRef.current++;
        addTileLayer(currentProviderRef.current);
      };
      
      (window as any).resetTileProvider = () => {
        currentProviderRef.current = 0;
        addTileLayer(0);
      };
      
      console.log('✓ Tile debugging: window.switchTileProvider() and window.resetTileProvider()');
    }
  }, []);

  return null; // This component doesn't render anything
};

export default DirectTileLayer;