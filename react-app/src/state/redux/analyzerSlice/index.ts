import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  AnalyzerState, 
  IncidentRecord, 
  GeoBounds, 
  DashboardView,
  ResponseTimeStatistics,
  GeoStatistics,
  TimeSeriesData
} from '@/types/analyzer';

// Define the initial state
const initialState: AnalyzerState = {
  rawData: {
    incidents: [],
    isLoading: false,
    error: null
  },
  calculatedMetrics: {
    responseTimeStats: null,
    geographicStats: null,
    timeSeriesData: null
  },
  filters: {
    dateRange: null,
    incidentTypes: null,
    units: null,
    geographicBounds: null,
    timeOfDay: null,
    priority: null
  },
  ui: {
    selectedView: 'dashboard',
    activeDashboardPanels: [
      'response-time-summary', 
      'incident-map', 
      'time-distribution',
      'incident-table'
    ],
    expandedPanels: [],
    isLoading: false,
    error: null,
    selectedIncidentId: null
  }
};

// Create the slice
const analyzerSlice = createSlice({
  name: 'analyzer',
  initialState,
  reducers: {
    // Data loading actions
    loadIncidentsStart(state) {
      state.rawData.isLoading = true;
      state.rawData.error = null;
    },
    loadIncidentsSuccess(state, action: PayloadAction<IncidentRecord[]>) {
      state.rawData.incidents = action.payload;
      state.rawData.isLoading = false;
      state.rawData.error = null;
    },
    loadIncidentsFailure(state, action: PayloadAction<string>) {
      state.rawData.isLoading = false;
      state.rawData.error = action.payload;
    },
    
    // Update metrics
    updateResponseTimeStats(state, action: PayloadAction<ResponseTimeStatistics>) {
      state.calculatedMetrics.responseTimeStats = action.payload;
    },
    updateGeographicStats(state, action: PayloadAction<GeoStatistics[]>) {
      state.calculatedMetrics.geographicStats = action.payload;
    },
    updateTimeSeriesData(state, action: PayloadAction<TimeSeriesData>) {
      state.calculatedMetrics.timeSeriesData = action.payload;
    },
    
    // Filter actions
    setDateRangeFilter(state, action: PayloadAction<[Date, Date] | null>) {
      state.filters.dateRange = action.payload;
    },
    setIncidentTypesFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.incidentTypes = action.payload;
    },
    setUnitsFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.units = action.payload;
    },
    setGeographicBoundsFilter(state, action: PayloadAction<GeoBounds | null>) {
      state.filters.geographicBounds = action.payload;
    },
    setTimeOfDayFilter(state, action: PayloadAction<[number, number] | null>) {
      state.filters.timeOfDay = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<string[] | null>) {
      state.filters.priority = action.payload;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    
    // UI actions
    setSelectedView(state, action: PayloadAction<DashboardView>) {
      state.ui.selectedView = action.payload;
    },
    setActiveDashboardPanels(state, action: PayloadAction<string[]>) {
      state.ui.activeDashboardPanels = action.payload;
    },
    togglePanelExpansion(state, action: PayloadAction<string>) {
      const panelId = action.payload;
      if (state.ui.expandedPanels.includes(panelId)) {
        state.ui.expandedPanels = state.ui.expandedPanels.filter(id => id !== panelId);
      } else {
        state.ui.expandedPanels.push(panelId);
      }
    },
    setSelectedIncidentId(state, action: PayloadAction<string | null>) {
      state.ui.selectedIncidentId = action.payload;
    },
    
    // Reset the entire state
    resetAnalyzerState() {
      return initialState;
    }
  }
});

// Export actions and reducer
export const {
  loadIncidentsStart,
  loadIncidentsSuccess,
  loadIncidentsFailure,
  updateResponseTimeStats,
  updateGeographicStats,
  updateTimeSeriesData,
  setDateRangeFilter,
  setIncidentTypesFilter,
  setUnitsFilter,
  setGeographicBoundsFilter,
  setTimeOfDayFilter,
  setPriorityFilter,
  resetFilters,
  setSelectedView,
  setActiveDashboardPanels,
  togglePanelExpansion,
  setSelectedIncidentId,
  resetAnalyzerState
} = analyzerSlice.actions;

export default analyzerSlice.reducer;