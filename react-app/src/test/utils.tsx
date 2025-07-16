import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { theme } from '../theme';
import { rootReducer } from '../state/redux/store';

// Create a custom render function with providers
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
  initialEntries?: string[];
  basename?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
    }),
    initialEntries = ['/'],
    basename = '/app',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter basename={basename}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </Provider>
      </BrowserRouter>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper to create mock Redux store with specific state
export function createMockStore(initialState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
  });
}

// Mock data generators for testing
export const mockIncidentData = {
  basic: [
    {
      incident_id: 'INC-001',
      incident_date: '2025-01-15',
      incident_time: '2025-01-15T14:23:45',
      incident_type: 'Medical Emergency',
      latitude: 39.7392,
      longitude: -104.9903,
      address: '123 Main St',
      city: 'Denver',
      state: 'CO',
    },
    {
      incident_id: 'INC-002',
      incident_date: '2025-01-15',
      incident_time: '2025-01-15T15:30:12',
      incident_type: 'Structure Fire',
      latitude: 39.7491,
      longitude: -104.9876,
      address: '456 Oak Ave',
      city: 'Denver',
      state: 'CO',
    },
  ],
  withResponseTimes: [
    {
      incident_id: 'INC-001',
      incident_date: '2025-01-15',
      incident_time: '2025-01-15T14:23:45',
      dispatch_time: '2025-01-15T14:24:15',
      enroute_time: '2025-01-15T14:26:30',
      arrival_time: '2025-01-15T14:32:10',
      clear_time: '2025-01-15T15:15:00',
      incident_type: 'Medical Emergency',
      responding_unit: 'EMS-1',
      latitude: 39.7392,
      longitude: -104.9903,
    },
  ],
};

export const mockCSVData = `incident_id,incident_date,incident_time,incident_type,latitude,longitude,address,city,state
INC-001,2025-01-15,2025-01-15T14:23:45,Medical Emergency,39.7392,-104.9903,123 Main St,Denver,CO
INC-002,2025-01-15,2025-01-15T15:30:12,Structure Fire,39.7491,-104.9876,456 Oak Ave,Denver,CO`;

export const mockHydrantData = [
  {
    id: 'HYD-001',
    latitude: 39.7392,
    longitude: -104.9903,
    flowRate: 1500,
    operationalStatus: 'active',
    lastInspection: '2025-01-01',
    address: '123 Main St',
  },
  {
    id: 'HYD-002',
    latitude: 39.7491,
    longitude: -104.9876,
    flowRate: 1200,
    operationalStatus: 'maintenance',
    lastInspection: '2024-12-15',
    address: '456 Oak Ave',
  },
];

export const mockTankData = [
  {
    id: 'TANK-001',
    latitude: 39.7392,
    longitude: -104.9903,
    capacity: 50000,
    currentLevel: 45000,
    tankType: 'storage',
    lastInspection: '2025-01-01',
  },
];

// Mock file objects for testing file uploads
export function createMockFile(name: string, content: string, type: string = 'text/csv') {
  const file = new File([content], name, { type });
  return file;
}

// Mock field mapping templates
export const mockFieldMappingTemplate = {
  id: 'test-template',
  name: 'Test Template',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    {
      sourceField: 'incident_number',
      targetField: 'incident_id',
      transformations: [],
    },
    {
      sourceField: 'call_time',
      targetField: 'incident_time',
      transformations: [],
    },
  ],
  metadata: {
    version: '1.0.0',
    qualityScore: 95,
    successRate: 100,
    tags: ['test'],
  },
  isPublic: true,
};

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock error for testing error boundaries
export const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock user events for testing
export const mockUserEvent = {
  click: (element: HTMLElement) => {
    element.click();
  },
  type: (element: HTMLElement, text: string) => {
    if (element instanceof HTMLInputElement) {
      element.value = text;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
  upload: (element: HTMLElement, file: File) => {
    if (element instanceof HTMLInputElement) {
      Object.defineProperty(element, 'files', {
        value: [file],
        writable: false,
      });
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  },
};

// Common test assertions
export const testUtils = {
  expectElementToBeInDocument: (element: HTMLElement | null) => {
    expect(element).toBeInTheDocument();
  },
  expectElementToHaveText: (element: HTMLElement | null, text: string) => {
    expect(element).toHaveTextContent(text);
  },
  expectElementToBeDisabled: (element: HTMLElement | null) => {
    expect(element).toBeDisabled();
  },
  expectElementToBeEnabled: (element: HTMLElement | null) => {
    expect(element).toBeEnabled();
  },
};

// Mock API responses
export const mockApiResponses = {
  success: {
    status: 200,
    data: { success: true },
  },
  error: {
    status: 500,
    data: { error: 'Internal Server Error' },
  },
  unauthorized: {
    status: 401,
    data: { error: 'Unauthorized' },
  },
};

// Performance testing utilities
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    await renderFn();
    const end = performance.now();
    return end - start;
  },
  expectRenderTimeBelow: (time: number, threshold: number) => {
    expect(time).toBeLessThan(threshold);
  },
};

// Accessibility testing helpers
export const a11yHelpers = {
  expectElementToHaveRole: (element: HTMLElement | null, role: string) => {
    expect(element).toHaveAttribute('role', role);
  },
  expectElementToHaveAriaLabel: (element: HTMLElement | null, label: string) => {
    expect(element).toHaveAttribute('aria-label', label);
  },
  expectElementToBeAccessible: (element: HTMLElement | null) => {
    expect(element).toBeVisible();
    expect(element).not.toHaveAttribute('aria-hidden', 'true');
  },
};

export * from '@testing-library/react';
export { vi } from 'vitest';