// Types for the Response Time Analyzer

// Incident record structure
export interface IncidentRecord {
  incidentId: string;
  incidentDate: string; // ISO date string
  incidentTime?: string; // HH:MM:SS
  dispatchTime?: string; // HH:MM:SS or ISO date string
  enRouteTime?: string; // HH:MM:SS or ISO date string
  arrivalTime?: string; // HH:MM:SS or ISO date string
  clearTime?: string; // HH:MM:SS or ISO date string
  latitude?: number;
  longitude?: number;
  incidentType?: string;
  respondingUnit?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  priority?: string;
}

// Response time metrics for a single incident
export interface ResponseTimeMetrics {
  dispatchTime: number | null; // seconds, time from call to dispatch
  turnoutTime: number | null; // seconds, time from dispatch to en route
  travelTime: number | null; // seconds, time from en route to arrival
  totalResponseTime: number | null; // seconds, time from call to arrival
  sceneTime: number | null; // seconds, time spent on scene
  totalIncidentTime: number | null; // seconds, total time from call to completion
}

// Aggregate statistics for response times
export interface ResponseTimeStatistics {
  mean: ResponseTimeMetrics;
  median: ResponseTimeMetrics;
  ninetiethPercentile: ResponseTimeMetrics;
  standardDeviation: ResponseTimeMetrics;
  min: ResponseTimeMetrics;
  max: ResponseTimeMetrics;
  count: number;
}

// Geographic bounds for filtering
export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Geographic statistics for a region
export interface GeoStatistics {
  regionId: string;
  centerLat: number;
  centerLng: number;
  incidentCount: number;
  responseTimeStats: ResponseTimeStatistics;
}

// Time series data structure
export interface TimeSeriesData {
  timePoints: string[]; // Array of time markers (dates, hours, etc.)
  metrics: {
    dispatchTime: number[];
    turnoutTime: number[];
    travelTime: number[];
    totalResponseTime: number[];
  };
}

// Filter criteria
export interface AnalyzerFilters {
  dateRange: [Date, Date] | null;
  incidentTypes: string[] | null;
  units: string[] | null;
  geographicBounds: GeoBounds | null;
  timeOfDay: [number, number] | null; // Hours [0-23]
  priority: string[] | null;
}

// Dashboard view types
export type DashboardView = 'dashboard' | 'timeline' | 'map' | 'table' | 'statistics';

// UI state
export interface AnalyzerUiState {
  selectedView: DashboardView;
  activeDashboardPanels: string[];
  expandedPanels: string[];
  isLoading: boolean;
  error: string | null;
  selectedIncidentId: string | null;
}

// Main analyzer state
export interface AnalyzerState {
  rawData: {
    incidents: IncidentRecord[];
    isLoading: boolean;
    error: string | null;
  };
  calculatedMetrics: {
    responseTimeStats: ResponseTimeStatistics | null;
    geographicStats: GeoStatistics[] | null;
    timeSeriesData: TimeSeriesData | null;
  };
  filters: AnalyzerFilters;
  ui: AnalyzerUiState;
}