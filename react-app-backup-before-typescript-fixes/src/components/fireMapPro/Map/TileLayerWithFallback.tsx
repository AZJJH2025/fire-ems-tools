/**
 * Enhanced Tile Layer with Fallback
 * 
 * Provides robust tile loading with fallback providers to ensure maps always load.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TileLayer, useMap } from 'react-leaflet';

interface TileLayerWithFallbackProps {
  primary: {
    url: string;
    attribution: string;
    maxZoom: number;
    minZoom?: number;
  };
  fallbacks?: Array<{
    url: string;
    attribution: string;
    maxZoom: number;
    minZoom?: number;
  }>;
  onError?: (error: any) => void;
}

const TileLayerWithFallback: React.FC<TileLayerWithFallbackProps> = ({
  primary,
  fallbacks = [],
  onError
}) => {
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadedTiles, setLoadedTiles] = useState(0);
  const [failedTiles, setFailedTiles] = useState(0);
  const map = useMap();
  const tileLayerRef = useRef<any>(null);

  // Enhanced fallback providers
  const defaultFallbacks = [
    {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      name: 'OSM Multi-Server'
    },
    {
      url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
      attribution: '© CARTO, © OpenStreetMap contributors',
      maxZoom: 19,
      name: 'CartoDB Voyager'
    },
    {
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
      attribution: '© Wikimedia maps, © OpenStreetMap contributors',
      maxZoom: 18,
      name: 'Wikimedia'
    }
  ];

  const allProviders = [
    { ...primary, name: 'Primary' },
    ...defaultFallbacks,
    ...fallbacks.map((f, i) => ({ ...f, name: `Fallback ${i + 1}` }))
  ];
  
  const currentProvider = allProviders[currentProviderIndex];

  // Debug logging
  useEffect(() => {
    console.log(`[TileLayer] Current provider: ${currentProvider?.name} (${currentProviderIndex}/${allProviders.length - 1})`);
    console.log(`[TileLayer] Stats - Loaded: ${loadedTiles}, Failed: ${failedTiles}, Retries: ${retryCount}`);
  }, [currentProviderIndex, currentProvider, loadedTiles, failedTiles, retryCount, allProviders.length]);

  const handleTileError = useCallback((error: any) => {
    setFailedTiles(prev => prev + 1);
    console.warn(`[TileLayer] Tile error from "${currentProvider?.name}":`, error);
    console.warn(`[TileLayer] Error details:`, {
      url: currentProvider?.url,
      errorType: error?.type,
      errorMessage: error?.message,
      errorCode: error?.code,
      target: error?.target?.src
    });
    
    // Log network status
    if (navigator.onLine === false) {
      console.error('[TileLayer] Network is offline');
    }
    
    // Switch immediately on first error - don't retry same provider
    if (currentProviderIndex < allProviders.length - 1) {
      setCurrentProviderIndex(prev => prev + 1);
      setRetryCount(0);
      setHasError(false);
      setLoadedTiles(0);
      setFailedTiles(0);
      console.log(`[TileLayer] Switching to: "${allProviders[currentProviderIndex + 1]?.name}"`);
    } else {
      setHasError(true);
      console.error('[TileLayer] All tile providers exhausted');
      onError && onError(error);
    }
  }, [currentProviderIndex, currentProvider, allProviders, onError]);

  const handleTileLoad = useCallback(() => {
    setLoadedTiles(prev => prev + 1);
    if (hasError) {
      console.log(`[TileLayer] Provider "${currentProvider?.name}" recovered`);
      setHasError(false);
    }
  }, [hasError, currentProvider]);

  const handleTileLoadStart = useCallback(() => {
    console.log(`[TileLayer] Starting tile load from "${currentProvider?.name}"`);
  }, [currentProvider]);

  // Force tile refresh on provider change
  useEffect(() => {
    if (tileLayerRef.current && map) {
      setTimeout(() => {
        map.invalidateSize();
        tileLayerRef.current.redraw();
        console.log(`[TileLayer] Forced refresh for "${currentProvider?.name}"`);
      }, 100);
    }
  }, [currentProviderIndex, map, currentProvider]);

  // Timeout mechanism - switch providers if no tiles load within 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadedTiles === 0 && currentProviderIndex < allProviders.length - 1) {
        console.warn(`[TileLayer] No tiles loaded within 10s, switching from "${currentProvider?.name}"`);
        setCurrentProviderIndex(prev => prev + 1);
        setRetryCount(0);
        setLoadedTiles(0);
        setFailedTiles(0);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [currentProviderIndex, loadedTiles, allProviders.length, currentProvider]);

  if (!currentProvider) {
    console.error('[TileLayer] No provider available');
    return null;
  }

  return (
    <TileLayer
      ref={tileLayerRef}
      key={`provider-${currentProviderIndex}-retry-${retryCount}`}
      url={currentProvider.url}
      attribution={currentProvider.attribution}
      maxZoom={currentProvider.maxZoom}
      minZoom={currentProvider.minZoom || 1}
      // Simplified options for better compatibility
      tileSize={256}
      updateWhenIdle={true} // Wait for idle to reduce load
      updateWhenZooming={false}
      keepBuffer={2} // Reduced buffer for faster loading
      // Remove problematic options
      onError={handleTileError}
      onLoad={handleTileLoad}
      onLoading={handleTileLoadStart}
    />
  );
};

export default TileLayerWithFallback;