import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver for components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTMLCanvasElement.getContext for jsPDF and chart components
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock import.meta.env for environment variables
const mockEnv = {
  DEV: true,
  PROD: false,
  MODE: 'test',
  VITE_API_URL: 'http://localhost:3000',
};

Object.defineProperty(import.meta, 'env', {
  value: mockEnv,
  writable: true,
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods in test environment
const originalConsole = { ...console };
beforeEach(() => {
  // Reset console mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Restore console after each test
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock localStorage and sessionStorage
const createStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
});

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true,
});

// Mock IntersectionObserver for lazy loading components
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL for file handling
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader for file upload tests
const MockFileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  result: null,
  error: null,
  onload: null,
  onerror: null,
  onprogress: null,
  readyState: 0,
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Add static properties to the mock
(MockFileReader as any).EMPTY = 0;
(MockFileReader as any).LOADING = 1;
(MockFileReader as any).DONE = 2;
(MockFileReader as any).prototype = {};

global.FileReader = MockFileReader as any;

// Mock crypto for security features
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
  writable: true,
});

// Mock DOMPurify for security tests
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input),
  },
}));

// Mock Leaflet for map components
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    fitBounds: vi.fn(),
    getBounds: vi.fn(),
    getZoom: vi.fn(),
    setZoom: vi.fn(),
    getCenter: vi.fn(),
    panTo: vi.fn(),
    invalidateSize: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    bindPopup: vi.fn(),
    openPopup: vi.fn(),
    closePopup: vi.fn(),
    setLatLng: vi.fn(),
    getLatLng: vi.fn(),
  })),
  popup: vi.fn(() => ({
    setLatLng: vi.fn(),
    setContent: vi.fn(),
    openOn: vi.fn(),
  })),
  icon: vi.fn(() => ({})),
  divIcon: vi.fn(() => ({})),
  latLng: vi.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: vi.fn(() => ({
    extend: vi.fn(),
    isValid: vi.fn(() => true),
  })),
}));

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(({ children }) => children),
  TileLayer: vi.fn(() => null),
  Marker: vi.fn(() => null),
  Popup: vi.fn(({ children }) => children),
  useMap: vi.fn(() => ({
    setView: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    fitBounds: vi.fn(),
    invalidateSize: vi.fn(),
  })),
  useMapEvents: vi.fn(() => ({})),
}));

// Mock jsPDF for PDF generation tests
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    addImage: vi.fn(),
    save: vi.fn(),
    output: vi.fn(),
    addPage: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    line: vi.fn(),
    circle: vi.fn(),
    internal: {
      pageSize: {
        width: 210,
        height: 297,
      },
    },
  })),
}));

// Mock autoTable for PDF tables
vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

// Mock xlsx for Excel processing
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
    write: vi.fn(),
  },
  writeFile: vi.fn(),
}));

// Mock papaparse for CSV processing
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
    unparse: vi.fn(),
  },
}));

// Console suppression for cleaner test output
export const suppressConsole = () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
};