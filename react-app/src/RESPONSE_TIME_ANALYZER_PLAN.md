# Response Time Analyzer Rebuild Plan

## Overview

This document outlines the plan for rebuilding the Response Time Analyzer tool in React as part of the FireEMS Tools modernization project. The Response Time Analyzer is a critical tool that helps fire departments and EMS agencies analyze response times, visualize performance metrics, and identify opportunities for service improvement.

## Component Structure

### Core Components

1. **ResponseTimeAnalyzerContainer**
   - Main container component
   - Manages data loading, state, and renders child components
   - Handles integration with the Data Formatter

2. **AnalyzerDashboard**
   - Primary dashboard layout
   - Contains the dashboard grid system
   - Manages dashboard state (expanded panels, etc.)

3. **ResponseTimeCalculator**
   - Core logic component for calculating response times
   - Processes raw incident data into response time metrics
   - Calculates statistics like average, median, 90th percentile

4. **TimelineVisualization**
   - Visualizes dispatch to arrival time segments
   - Shows breakdown of response time components
   - Interactive timeline for individual incidents

5. **GeospatialVisualization**
   - Map-based visualization of incident locations
   - Heat map of response times by geographic area
   - Clicking areas shows detailed metrics for that region

6. **StatisticsSummary**
   - Key performance indicators (KPIs)
   - Summary statistics for response times
   - Trend analysis over time periods

7. **IncidentTable**
   - Detailed table of all incidents with response data
   - Sortable and filterable
   - Drilldown capability to view incident details

8. **FilterPanel**
   - Date range selection
   - Incident type filtering
   - Geographic area selection
   - Unit/station filtering

## Data Flow

1. **Input Sources**
   - Direct input from the Data Formatter tool
   - Loading saved analysis files
   - API integration with department CAD systems (future)

2. **Data Processing Pipeline**
   - Parse and validate incoming data
   - Calculate response time metrics
   - Generate statistics and aggregations
   - Prepare data for visualizations

3. **State Management**
   - Redux store with dedicated analyzer slice
   - Raw data storage
   - Calculated metrics
   - UI state (filters, selected views)
   - Visualization configurations

4. **Output Options**
   - Export to PDF reports
   - Export data as Excel/CSV
   - Save analysis state for future reference

## Core Features

### 1. Response Time Metrics

- **Dispatch Time**: Time from call received to unit dispatch
- **Turnout Time**: Time from dispatch to en route
- **Travel Time**: Time from en route to arrival
- **Total Response Time**: Time from call to arrival
- **Scene Time**: Time spent on scene
- **Total Incident Time**: Total time from call to completion

### 2. Statistical Analysis

- Mean, median, mode of response times
- Standard deviation and variance
- 90th percentile response times (NFPA standard)
- Comparison against department goals and standards
- Historical trend analysis

### 3. Visualizations

- **Time Series Charts**: Response times over days/weeks/months
- **Heat Maps**: Geographic distribution of response times
- **Bar Charts**: Response times by incident type, unit, or district
- **Box Plots**: Distribution of response times
- **Scatter Plots**: Response time vs. distance

### 4. Filtering and Segmentation

- By date range
- By incident type
- By responding unit
- By geographic area
- By time of day/day of week
- By weather conditions (if data available)

## Technical Implementation

### 1. React Component Structure

```
/components
  /analyzer
    /Dashboard
      AnalyzerDashboard.tsx
      DashboardControls.tsx
    /TimeAnalysis
      ResponseTimeCalculator.tsx
      TimelineVisualization.tsx
      ResponseTimeDistribution.tsx
    /GeospatialAnalysis
      IncidentMap.tsx
      ResponseTimeHeatmap.tsx
      GeoStatistics.tsx
    /Statistics
      StatisticsSummary.tsx
      KpiDisplay.tsx
      TrendAnalysis.tsx
    /IncidentData
      IncidentTable.tsx
      IncidentDetail.tsx
      BatchComparison.tsx
    /Filters
      FilterPanel.tsx
      FilterControls.tsx
      SavedFilters.tsx
    /Export
      ReportGenerator.tsx
      DataExport.tsx
```

### 2. Redux Store Structure

```typescript
interface AnalyzerState {
  rawData: {
    incidents: IncidentRecord[];
    isLoading: boolean;
    error: string | null;
  };
  calculatedMetrics: {
    responseTimeStats: ResponseTimeStatistics;
    geographicStats: GeographicStatistics;
    timeSeriesData: TimeSeriesData;
  };
  filters: {
    dateRange: [Date, Date];
    incidentTypes: string[];
    units: string[];
    geographicBounds: GeoBounds | null;
    timeOfDay: [number, number] | null;
  };
  ui: {
    selectedView: 'dashboard' | 'timeline' | 'map' | 'table';
    activeDashboardPanels: string[];
    expandedPanels: string[];
  };
}
```

### 3. Key Data Types

```typescript
interface IncidentRecord {
  incidentId: string;
  incidentDate: string;
  incidentTime: string;
  dispatchTime: string;
  enRouteTime: string;
  arrivalTime: string;
  clearTime: string;
  latitude: number;
  longitude: number;
  incidentType: string;
  respondingUnit: string;
  address?: string;
  priority?: string;
}

interface ResponseTimeMetrics {
  dispatchTime: number; // seconds
  turnoutTime: number; // seconds
  travelTime: number; // seconds
  totalResponseTime: number; // seconds
  sceneTime?: number; // seconds
  totalIncidentTime?: number; // seconds
}

interface ResponseTimeStatistics {
  mean: ResponseTimeMetrics;
  median: ResponseTimeMetrics;
  ninetiethPercentile: ResponseTimeMetrics;
  standardDeviation: ResponseTimeMetrics;
  min: ResponseTimeMetrics;
  max: ResponseTimeMetrics;
  count: number;
}
```

## Integration with Data Formatter

1. **Data Transfer Mechanism**
   - Session storage for immediate transfer
   - JSON file export/import for offline transfer
   - Direct Redux state sharing when both tools are loaded

2. **Required Field Mapping**
   - Incident ID → unique identifier
   - Incident Date → date of incident
   - Incident Time → time of incident
   - Dispatch Time → time when dispatched
   - En Route Time → time when unit began traveling
   - Arrival Time → time when unit arrived on scene
   - Latitude/Longitude → incident location

3. **Implementation Details**
   - Add "Send to Response Time Analyzer" option in Formatter Export panel
   - Create data transformation function to convert Formatter output to Analyzer input format
   - Implement session storage mechanism for data transfer
   - Add loading indicator during transfer process

## Development Roadmap

### Phase 1: Core Framework and Data Logic

1. Set up project structure for the Response Time Analyzer
2. Create Redux store slice for analyzer
3. Implement data processing and calculation logic
4. Build basic UI components without full styling
5. Create simple visualizations for testing

### Phase 2: UI Development and Visualizations

1. Implement dashboard layout with responsive grid
2. Develop advanced visualizations (timeline, map, charts)
3. Build filtering and control components
4. Implement table view with sorting and filtering
5. Add theming and polish UI

### Phase 3: Integration and Advanced Features

1. Integrate with Data Formatter
2. Add export and reporting functionality
3. Implement saved analysis feature
4. Add comparison between data sets
5. Create performance optimization features

## Testing Strategy

1. **Unit Tests**
   - Test calculation functions for accuracy
   - Test data transformation functions
   - Test Redux reducers and selectors

2. **Component Tests**
   - Test rendering of visualization components
   - Test interactive features
   - Test filter functionality

3. **Integration Tests**
   - Test data flow from Formatter to Analyzer
   - Test end-to-end workflow

4. **Performance Tests**
   - Test with large datasets (1000+ incidents)
   - Optimize rendering performance
   - Implement pagination or virtualization for large data sets

## Deployment Plan

1. Build the React app
2. Integrate with Flask backend
3. Update navigation to include the new Analyzer
4. Deploy to production with feature flag
5. Monitor performance and gather feedback

## Conclusion

This plan outlines a comprehensive approach to rebuilding the Response Time Analyzer tool using React, Redux, and modern visualization libraries. The new implementation will maintain all the functionality of the existing tool while providing a more modern, responsive, and maintainable codebase.