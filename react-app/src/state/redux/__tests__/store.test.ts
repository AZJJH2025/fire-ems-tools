import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../store';

describe('Redux Store', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer,
    });
  });

  it('should create store with initial state', () => {
    const state = store.getState();
    
    expect(state).toHaveProperty('formatter');
    expect(state).toHaveProperty('analyzer');
    expect(state).toHaveProperty('fireMapPro');
    expect(state).toHaveProperty('waterSupplyCoverage');
  });

  it('should handle formatter actions', () => {
    const initialState = store.getState();
    
    // Test data upload
    store.dispatch({
      type: 'formatter/setData',
      payload: [
        { id: 1, name: 'Test Data' },
        { id: 2, name: 'More Data' }
      ]
    });
    
    const newState = store.getState();
    expect(newState.formatter.data).toHaveLength(2);
    expect(newState.formatter.data[0]).toEqual({ id: 1, name: 'Test Data' });
  });

  it('should handle field mapping actions', () => {
    const fieldMappings = [
      { sourceField: 'id', targetField: 'incident_id', transformations: [] },
      { sourceField: 'name', targetField: 'incident_type', transformations: [] }
    ];
    
    store.dispatch({
      type: 'formatter/setMappings',
      payload: fieldMappings
    });
    
    const state = store.getState();
    expect(state.formatter.mappings).toEqual(fieldMappings);
  });

  it('should handle validation errors', () => {
    const validationErrors = [
      { field: 'incident_id', message: 'Required field missing', severity: 'error' },
      { field: 'incident_time', message: 'Invalid date format', severity: 'warning' }
    ];
    
    store.dispatch({
      type: 'formatter/setValidationErrors',
      payload: validationErrors
    });
    
    const state = store.getState();
    expect(state.formatter.validationErrors).toEqual(validationErrors);
  });

  it('should handle analyzer state', () => {
    const incidentData = [
      {
        incidentId: 'INC-001',
        incidentTime: '2025-01-15T14:23:45Z',
        dispatchTime: '2025-01-15T14:24:15Z',
        arrivalTime: '2025-01-15T14:30:00Z',
      }
    ];
    
    store.dispatch({
      type: 'analyzer/setData',
      payload: incidentData
    });
    
    const state = store.getState();
    expect(state.analyzer.data).toEqual(incidentData);
  });

  it('should handle response time calculations', () => {
    const responseTimeMetrics = {
      averageDispatchTime: 45,
      averageResponseTime: 360,
      nfpaCompliance: 85,
      totalIncidents: 150
    };
    
    store.dispatch({
      type: 'analyzer/setResponseTimeMetrics',
      payload: responseTimeMetrics
    });
    
    const state = store.getState();
    expect(state.analyzer.responseTimeMetrics).toEqual(responseTimeMetrics);
  });

  it('should handle fire map pro state', () => {
    const mapFeatures = [
      {
        id: 'feature-1',
        type: 'incident',
        coordinates: [39.7392, -104.9903],
        properties: {
          incidentType: 'Medical Emergency',
          timestamp: '2025-01-15T14:23:45Z'
        }
      }
    ];
    
    store.dispatch({
      type: 'fireMapPro/setFeatures',
      payload: mapFeatures
    });
    
    const state = store.getState();
    expect(state.fireMapPro.features).toEqual(mapFeatures);
  });

  it('should handle water supply coverage state', () => {
    const hydrants = [
      {
        id: 'HYD-001',
        latitude: 39.7392,
        longitude: -104.9903,
        flowRate: 1500,
        operationalStatus: 'active'
      }
    ];
    
    store.dispatch({
      type: 'waterSupplyCoverage/setHydrants',
      payload: hydrants
    });
    
    const state = store.getState();
    expect(state.waterSupplyCoverage.hydrants).toEqual(hydrants);
  });

  it('should handle tanks state', () => {
    const tanks = [
      {
        id: 'TANK-001',
        latitude: 39.7392,
        longitude: -104.9903,
        capacity: 50000,
        currentLevel: 45000,
        tankType: 'storage'
      }
    ];
    
    store.dispatch({
      type: 'waterSupplyCoverage/setTanks',
      payload: tanks
    });
    
    const state = store.getState();
    expect(state.waterSupplyCoverage.tanks).toEqual(tanks);
  });

  it('should handle UI state updates', () => {
    store.dispatch({
      type: 'analyzer/setActiveTab',
      payload: 'performance-metrics'
    });
    
    const state = store.getState();
    expect(state.analyzer.ui.activeTab).toBe('performance-metrics');
  });

  it('should handle error states', () => {
    const error = {
      message: 'Failed to process data',
      code: 'PROCESSING_ERROR',
      timestamp: new Date().toISOString()
    };
    
    store.dispatch({
      type: 'formatter/setError',
      payload: error
    });
    
    const state = store.getState();
    expect(state.formatter.error).toEqual(error);
  });

  it('should handle loading states', () => {
    store.dispatch({
      type: 'formatter/setLoading',
      payload: true
    });
    
    let state = store.getState();
    expect(state.formatter.loading).toBe(true);
    
    store.dispatch({
      type: 'formatter/setLoading',
      payload: false
    });
    
    state = store.getState();
    expect(state.formatter.loading).toBe(false);
  });

  it('should handle complex state updates', () => {
    // Simulate a complete workflow
    const csvData = [
      { 'Incident Number': 'INC-001', 'Call Time': '2025-01-15 14:23:45' },
      { 'Incident Number': 'INC-002', 'Call Time': '2025-01-15 15:30:12' }
    ];
    
    const fieldMappings = [
      { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
      { sourceField: 'Call Time', targetField: 'incident_time', transformations: [] }
    ];
    
    const transformedData = [
      { incident_id: 'INC-001', incident_time: '2025-01-15T14:23:45Z' },
      { incident_id: 'INC-002', incident_time: '2025-01-15T15:30:12Z' }
    ];
    
    // Upload data
    store.dispatch({
      type: 'formatter/setData',
      payload: csvData
    });
    
    // Set field mappings
    store.dispatch({
      type: 'formatter/setMappings',
      payload: fieldMappings
    });
    
    // Transform and send to analyzer
    store.dispatch({
      type: 'analyzer/setData',
      payload: transformedData
    });
    
    const state = store.getState();
    expect(state.formatter.data).toEqual(csvData);
    expect(state.formatter.mappings).toEqual(fieldMappings);
    expect(state.analyzer.data).toEqual(transformedData);
  });

  it('should maintain state immutability', () => {
    const initialState = store.getState();
    const testData = [{ id: 1, name: 'Test' }];
    
    store.dispatch({
      type: 'formatter/setData',
      payload: testData
    });
    
    const newState = store.getState();
    
    // States should be different objects
    expect(newState).not.toBe(initialState);
    expect(newState.formatter).not.toBe(initialState.formatter);
    
    // Original state should be unchanged
    expect(initialState.formatter.data).toEqual([]);
    expect(newState.formatter.data).toEqual(testData);
  });

  it('should handle multiple dispatches correctly', () => {
    const actions = [
      { type: 'formatter/setData', payload: [{ id: 1 }] },
      { type: 'formatter/setLoading', payload: true },
      { type: 'formatter/setError', payload: null },
      { type: 'formatter/setLoading', payload: false }
    ];
    
    actions.forEach(action => {
      store.dispatch(action);
    });
    
    const state = store.getState();
    expect(state.formatter.data).toEqual([{ id: 1 }]);
    expect(state.formatter.loading).toBe(false);
    expect(state.formatter.error).toBeNull();
  });
});