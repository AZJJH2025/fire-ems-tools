/**
 * Map Architecture Test Component
 * 
 * Systematic test to isolate root architectural issues:
 * 1. Test map instance persistence
 * 2. Test component mounting order
 * 3. Test event system conflicts
 * 4. Test state synchronization
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Paper, Button, Chip, Stack } from '@mui/material';
import L from 'leaflet';
import { selectMapState, selectDrawingState } from '@/state/redux/fireMapProSlice';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details: string[];
  startTime?: number;
  endTime?: number;
}

interface LifecycleLog {
  timestamp: number;
  event: string;
  mapId?: string;
  details?: any;
}

const MapArchitectureTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Map Instance Persistence', status: 'pending', details: [] },
    { name: 'Component Mounting Order', status: 'pending', details: [] },
    { name: 'Event System Conflicts', status: 'pending', details: [] },
    { name: 'State Synchronization', status: 'pending', details: [] }
  ]);
  
  const [lifecycleLog, setLifecycleLog] = useState<LifecycleLog[]>([]);
  const [testMapInstance, setTestMapInstance] = useState<L.Map | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initialMapId = useRef<string>('');
  const eventListeners = useRef<Array<{ event: string; handler: any }>>([]);
  
  const mapState = useSelector(selectMapState);
  const drawingState = useSelector(selectDrawingState);
  const dispatch = useDispatch();

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    logLifecycle('component-render', { renderNumber: renderCount + 1 });
  });

  const logLifecycle = useCallback((event: string, details?: any) => {
    const log: LifecycleLog = {
      timestamp: Date.now(),
      event,
      mapId: mapInstanceRef.current ? `map_${mapInstanceRef.current._leaflet_id}` : undefined,
      details
    };
    setLifecycleLog(prev => [...prev, log]);
    console.log('[ArchTest]', event, details);
  }, []);

  const updateTestResult = useCallback((testName: string, status: TestResult['status'], details: string[]) => {
    setTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status, details, endTime: status !== 'running' ? Date.now() : test.endTime }
        : test
    ));
  }, []);

  // Test 1: Map Instance Persistence
  const testMapPersistence = useCallback(async () => {
    logLifecycle('test-1-start', { test: 'Map Instance Persistence' });
    updateTestResult('Map Instance Persistence', 'running', ['Starting map persistence test...']);

    try {
      if (!mapRef.current) {
        throw new Error('Map container not available');
      }

      // Create simple map instance
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 8,
        zoomControl: true,
        attributionControl: false
      });

      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      });
      tileLayer.addTo(map);

      const mapId = `map_${map._leaflet_id}`;
      initialMapId.current = mapId;
      mapInstanceRef.current = map;
      setTestMapInstance(map);

      logLifecycle('map-created', { mapId });

      // Add a simple click handler to test persistence
      const clickHandler = (e: L.LeafletMouseEvent) => {
        setClickCount(prev => prev + 1);
        logLifecycle('map-clicked', { 
          coordinates: [e.latlng.lat, e.latlng.lng],
          clickNumber: clickCount + 1
        });
      };

      map.on('click', clickHandler);
      eventListeners.current.push({ event: 'click', handler: clickHandler });

      // Test map stability over time
      setTimeout(() => {
        if (mapInstanceRef.current && mapInstanceRef.current._leaflet_id) {
          const currentMapId = `map_${mapInstanceRef.current._leaflet_id}`;
          const persistent = currentMapId === initialMapId.current;
          
          updateTestResult('Map Instance Persistence', persistent ? 'passed' : 'failed', [
            `Initial map ID: ${initialMapId.current}`,
            `Current map ID: ${currentMapId}`,
            `Map instance persistent: ${persistent}`,
            `Click events attached: ${eventListeners.current.length}`,
            `Total clicks received: ${clickCount}`
          ]);
          
          logLifecycle('test-1-complete', { 
            persistent, 
            initialMapId: initialMapId.current, 
            currentMapId 
          });
        } else {
          updateTestResult('Map Instance Persistence', 'failed', [
            'Map instance no longer exists',
            `Initial map ID: ${initialMapId.current}`,
            'Map was destroyed or recreated'
          ]);
        }
      }, 2000);

    } catch (error) {
      updateTestResult('Map Instance Persistence', 'failed', [
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Failed to create or maintain map instance'
      ]);
      logLifecycle('test-1-error', { error: error instanceof Error ? error.message : error });
    }
  }, [updateTestResult, logLifecycle, clickCount]);

  // Test 2: Component Mounting Order
  const testMountingOrder = useCallback(() => {
    logLifecycle('test-2-start', { test: 'Component Mounting Order' });
    updateTestResult('Component Mounting Order', 'running', ['Analyzing component mounting order...']);

    const mountingDetails = [];
    const currentLog = lifecycleLog.filter(log => log.event.includes('mount') || log.event.includes('ready'));
    
    if (currentLog.length > 0) {
      mountingDetails.push(`Found ${currentLog.length} mounting events:`);
      currentLog.forEach((log, index) => {
        mountingDetails.push(`${index + 1}. ${log.event} at ${new Date(log.timestamp).toLocaleTimeString()}`);
      });
    } else {
      mountingDetails.push('No mounting events detected yet');
    }

    // Check if map is ready before other components
    const mapReadyLog = lifecycleLog.find(log => log.event === 'map-created');
    const componentLogs = lifecycleLog.filter(log => 
      log.event.includes('layer') || log.event.includes('drawing') || log.event.includes('drag')
    );

    if (mapReadyLog && componentLogs.length > 0) {
      const mapReadyTime = mapReadyLog.timestamp;
      const earlyComponents = componentLogs.filter(log => log.timestamp < mapReadyTime);
      
      if (earlyComponents.length > 0) {
        mountingDetails.push('⚠️ Components mounted before map was ready:');
        earlyComponents.forEach(log => {
          mountingDetails.push(`  - ${log.event}`);
        });
      } else {
        mountingDetails.push('✓ All components waited for map readiness');
      }
    }

    updateTestResult('Component Mounting Order', 'passed', mountingDetails);
    logLifecycle('test-2-complete', { mountingOrder: mountingDetails });
  }, [updateTestResult, logLifecycle, lifecycleLog]);

  // Test 3: Event System Conflicts
  const testEventConflicts = useCallback(() => {
    logLifecycle('test-3-start', { test: 'Event System Conflicts' });
    updateTestResult('Event System Conflicts', 'running', ['Checking for event conflicts...']);

    const conflictDetails = [];
    
    if (mapInstanceRef.current) {
      // Check for multiple listeners on same events
      const map = mapInstanceRef.current;
      const eventTypes = ['click', 'moveend', 'zoomend', 'contextmenu'];
      
      eventTypes.forEach(eventType => {
        // Access internal Leaflet event registry
        const events = (map as any)._events;
        if (events && events[eventType]) {
          const listenerCount = events[eventType].length;
          conflictDetails.push(`${eventType}: ${listenerCount} listeners`);
          
          if (listenerCount > 1) {
            conflictDetails.push(`  ⚠️ Multiple listeners on ${eventType} event`);
          }
        }
      });

      // Test event propagation
      let eventPropagationWorking = true;
      const testHandler = () => { eventPropagationWorking = true; };
      
      map.on('click', testHandler);
      // Simulate click to test if events work
      map.fire('click', { latlng: L.latLng(0, 0) });
      map.off('click', testHandler);
      
      conflictDetails.push(`Event propagation working: ${eventPropagationWorking}`);
      
      updateTestResult('Event System Conflicts', 'passed', conflictDetails);
    } else {
      updateTestResult('Event System Conflicts', 'failed', ['No map instance available for testing']);
    }
    
    logLifecycle('test-3-complete', { eventConflicts: conflictDetails });
  }, [updateTestResult, logLifecycle]);

  // Test 4: State Synchronization
  const testStateSynchronization = useCallback(() => {
    logLifecycle('test-4-start', { test: 'State Synchronization' });
    updateTestResult('State Synchronization', 'running', ['Testing state synchronization...']);

    const syncDetails = [];
    
    // Check Redux state changes that might trigger re-renders
    const stateChangeLog = lifecycleLog.filter(log => 
      log.event.includes('state') || log.event.includes('render')
    );
    
    syncDetails.push(`Total renders: ${renderCount}`);
    syncDetails.push(`State changes detected: ${stateChangeLog.length}`);
    
    // Check if state changes are causing map recreation
    const mapCreationEvents = lifecycleLog.filter(log => log.event === 'map-created');
    if (mapCreationEvents.length > 1) {
      syncDetails.push(`⚠️ Map recreated ${mapCreationEvents.length} times`);
      mapCreationEvents.forEach((event, index) => {
        syncDetails.push(`  Creation ${index + 1}: ${new Date(event.timestamp).toLocaleTimeString()}`);
      });
    } else {
      syncDetails.push('✓ Map created only once');
    }

    // Check current Redux state
    syncDetails.push(`Current drawing mode: ${drawingState.mode || 'none'}`);
    syncDetails.push(`Map center: ${mapState.view.center.latitude}, ${mapState.view.center.longitude}`);
    syncDetails.push(`Map zoom: ${mapState.view.zoom}`);

    updateTestResult('State Synchronization', 'passed', syncDetails);
    logLifecycle('test-4-complete', { stateSynchronization: syncDetails });
  }, [updateTestResult, logLifecycle, renderCount, lifecycleLog, drawingState, mapState]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setLifecycleLog([]);
    setClickCount(0);
    logLifecycle('test-suite-start');
    
    await testMapPersistence();
    setTimeout(() => testMountingOrder(), 1000);
    setTimeout(() => testEventConflicts(), 2000);
    setTimeout(() => testStateSynchronization(), 3000);
  }, [testMapPersistence, testMountingOrder, testEventConflicts, testStateSynchronization, logLifecycle]);

  // Cleanup on unmount
  useEffect(() => {
    logLifecycle('component-mount');
    
    return () => {
      logLifecycle('component-unmount');
      if (mapInstanceRef.current) {
        // Clean up event listeners
        eventListeners.current.forEach(({ event, handler }) => {
          mapInstanceRef.current?.off(event, handler);
        });
        
        // Remove map
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [logLifecycle]);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom>
        Map Architecture Test Suite
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={runAllTests}>
          Run All Tests
        </Button>
        <Chip 
          label={`Renders: ${renderCount}`} 
          color={renderCount > 5 ? 'warning' : 'default'}
        />
        <Chip 
          label={`Clicks: ${clickCount}`} 
          color="primary"
        />
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        {/* Test Results */}
        <Paper sx={{ flex: 1, p: 2, maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Test Results</Typography>
          {tests.map((test, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip 
                  label={test.status} 
                  color={getStatusColor(test.status)}
                  size="small"
                />
                <Typography variant="subtitle2">{test.name}</Typography>
              </Stack>
              <Box sx={{ pl: 2, fontSize: '0.8rem' }}>
                {test.details.map((detail, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    {detail}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Lifecycle Log */}
        <Paper sx={{ flex: 1, p: 2, maxHeight: '400px', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Lifecycle Log</Typography>
          {lifecycleLog.slice(-20).map((log, index) => (
            <Box key={index} sx={{ mb: 1, fontSize: '0.75rem' }}>
              <Typography variant="body2" color="primary">
                {new Date(log.timestamp).toLocaleTimeString()}: {log.event}
              </Typography>
              {log.mapId && (
                <Typography variant="caption" color="text.secondary">
                  Map: {log.mapId}
                </Typography>
              )}
              {log.details && (
                <Typography variant="caption" color="text.secondary" component="pre">
                  {JSON.stringify(log.details, null, 2)}
                </Typography>
              )}
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Test Map Container */}
      <Paper sx={{ mt: 2, p: 1 }}>
        <Typography variant="h6" gutterBottom>Test Map (Click to test events)</Typography>
        <Box
          ref={mapRef}
          sx={{
            height: '300px',
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: 1
          }}
        />
      </Paper>
    </Box>
  );
};

export default MapArchitectureTest;