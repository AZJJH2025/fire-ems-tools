/**
 * Direct Render Test - bypasses all Redux and drawing logic
 * Just directly adds a visible shape to verify map rendering works
 */

import React, { useEffect } from 'react';
import L from 'leaflet';

interface TestDirectRenderProps {
  map: L.Map | null;
}

const TestDirectRender: React.FC<TestDirectRenderProps> = ({ map }) => {
  
  useEffect(() => {
    if (!map) return;

    console.log('[TestDirectRender] Adding test shapes directly to map');

    // Add a bright red circle directly to the map
    const testCircle = L.circle([39.8283, -98.5795], {
      radius: 50000, // 50km radius - should be very visible
      color: 'red',
      fillColor: 'red',
      fillOpacity: 0.5,
      weight: 3
    });

    // Add a bright green marker
    const testMarker = L.marker([40.0, -98.0]).bindPopup('Test Marker');

    // Add directly to map (not to feature group)
    testCircle.addTo(map);
    testMarker.addTo(map);

    console.log('[TestDirectRender] Test shapes added:', { testCircle, testMarker });
    console.log('[TestDirectRender] Circle bounds:', testCircle.getBounds());
    console.log('[TestDirectRender] Map bounds:', map.getBounds());

    // Cleanup
    return () => {
      console.log('[TestDirectRender] Removing test shapes');
      map.removeLayer(testCircle);
      map.removeLayer(testMarker);
    };
  }, [map]);

  return null;
};

export default TestDirectRender;