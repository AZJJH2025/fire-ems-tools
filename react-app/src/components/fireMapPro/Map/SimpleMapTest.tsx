/**
 * Simple Map Test - Isolate fundamental map stability issues
 * 
 * This component tests ONLY the map without any Redux, layers, or other components
 * to determine if the core React/Leaflet integration is stable.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SimpleMapTest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const mapInstanceId = useRef<string>(Math.random().toString(36));
  const renderCount = useRef<number>(0);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    console.log(`[SimpleMapTest] ${message}`);
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    renderCount.current++;
    addResult(`Component render #${renderCount.current}`);

    if (!mapRef.current) {
      addResult('❌ No map container div');
      return;
    }

    if (leafletMapRef.current) {
      addResult(`⚠️ Map already exists (ID: ${mapInstanceId.current})`);
      return;
    }

    // Create map with unique ID
    mapInstanceId.current = Math.random().toString(36);
    addResult(`🗺️ Creating map with ID: ${mapInstanceId.current}`);

    try {
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 6,
        zoomControl: true
      });

      // Add tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Test click event handler
      const clickHandler = (e: L.LeafletMouseEvent) => {
        addResult(`✅ Click event works at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      };
      map.on('click', clickHandler);

      // Test coordinate conversion
      setTimeout(() => {
        try {
          const center = map.getCenter();
          const containerPoint = map.latLngToContainerPoint(center);
          const backToLatLng = map.containerPointToLatLng(containerPoint);
          addResult(`✅ Coordinate conversion works: ${backToLatLng.lat.toFixed(4)}, ${backToLatLng.lng.toFixed(4)}`);
        } catch (error) {
          addResult(`❌ Coordinate conversion failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }, 1000);

      leafletMapRef.current = map;
      addResult(`✅ Map created successfully (ID: ${mapInstanceId.current})`);

      // Cleanup
      return () => {
        addResult(`🧹 Cleanup called for map ID: ${mapInstanceId.current}`);
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
          addResult(`✅ Map cleaned up (ID: ${mapInstanceId.current})`);
        }
      };
    } catch (error) {
      addResult(`❌ Map creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []); // Empty dependency array - should only run once

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 9999, background: 'white' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10000, background: 'white', padding: '10px', maxHeight: '300px', overflow: 'auto', border: '1px solid #ccc' }}>
        <h3>Simple Map Test Results</h3>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          {testResults.map((result, index) => (
            <div key={index}>{result}</div>
          ))}
        </div>
        <button onClick={() => window.location.reload()}>Reload Test</button>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SimpleMapTest;