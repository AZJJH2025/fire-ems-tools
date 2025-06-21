import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { RootState } from '@/state/redux/store';
import { 
  loadIncidentsStart, 
  loadIncidentsSuccess, 
  loadIncidentsFailure,
  updateResponseTimeStats,
  setSelectedView
} from '@/state/redux/analyzerSlice';
import { IncidentRecord, DashboardView } from '@/types/analyzer';
import { calculateResponseTimeStatistics } from '@/utils/responseTimeCalculator';

// Import dashboard components
import AnalyzerDashboard from './Dashboard/AnalyzerDashboard';
import TimelineVisualization from './TimeAnalysis/TimelineVisualization';
import ResponseTimeDistribution from './TimeAnalysis/ResponseTimeDistribution';
import IncidentMap from './GeospatialAnalysis/IncidentMap';
import IncidentTable from './IncidentData/IncidentTable';
import StatisticsSummary from './Statistics/StatisticsSummary';
import FilterPanel from './Filters/FilterPanel';
import ReportExport from './Export/ReportExport';

interface ResponseTimeAnalyzerContainerProps {
  // Optional initial data if coming from the formatter
  initialData?: IncidentRecord[];
}

const ResponseTimeAnalyzerContainer: React.FC<ResponseTimeAnalyzerContainerProps> = ({
  initialData
}) => {
  const dispatch = useDispatch();
  const { rawData, ui } = useSelector((state: RootState) => state.analyzer);
  const [dataSource, setDataSource] = useState<'formatter' | 'session' | 'none'>('none');
  
  // Set browser tab title for Response Time Analyzer
  useEffect(() => {
    document.title = 'FireEMS Response Time Analyzer';
  }, []);
  
  // Check for data from the formatter or session storage on mount
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      loadData(initialData, 'formatter');
      return;
    }
    
    // Check session storage for data from the formatter
    const sessionData = sessionStorage.getItem('fireEmsExportedData');
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        console.log("Session data found:", parsed);
        
        if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
          // Log the raw session data and parsed result for debugging
          console.log("ANALYZER DEBUG - Raw session data:", sessionData);
          console.log("ANALYZER DEBUG - Parsed session data:", parsed);
          console.log("Sample record from session:", parsed.data[0]);
          
          // Check all field names in the first record for debugging
          console.log('ANALYZER DATA CHECK - All field names in first record:');
          console.log(Object.keys(parsed.data[0]));

          // Verify that essential fields are present
          const requiredFields = ['incidentId', 'incidentDate'];
          console.log('ANALYZER FIELD CHECK - Checking for required fields:', requiredFields);

          const missingFields = requiredFields.filter(field =>
            !parsed.data[0].hasOwnProperty(field) || parsed.data[0][field] === undefined || parsed.data[0][field] === null
          );

          if (missingFields.length > 0) {
            console.error(`Missing required fields in incident data: ${missingFields.join(', ')}`);
            console.log('ANALYZER DEBUG - Full record with missing fields:', JSON.stringify(parsed.data[0]));
          }
          
          // Process the data even if some fields are missing
          loadData(parsed.data, 'session');
          return;
        } else {
          console.error("Invalid data structure in session storage", parsed);
        }
      } catch (error) {
        console.error('Error parsing session data', error);
      }
    } else {
      console.log("No data found in session storage");
    }
  }, [initialData]);
  
  // Transform field names from "Field Name" format to "fieldName" format
  const normalizeFieldNames = (records: any[]): IncidentRecord[] => {
    return records.map(record => {
      const normalizedRecord: Record<string, any> = {};

      // Field name mapping - both "Incident ID" and "incidentId" map to "incidentId"
      const fieldMappings: Record<string, string> = {
        'Incident ID': 'incidentId',
        'Incident Date': 'incidentDate',
        'Incident Time': 'incidentTime',
        'Dispatch Time': 'dispatchTime',
        'En Route Time': 'enRouteTime',
        'Arrival Time': 'arrivalTime',
        'Clear Time': 'clearTime',
        'Incident Type': 'incidentType',
        'Latitude': 'latitude',
        'Longitude': 'longitude'
      };

      // First check if we already have camelCase field names
      Object.entries(fieldMappings).forEach(([originalField, camelField]) => {
        // If record has the camelCase version, use it directly
        if (record[camelField] !== undefined) {
          normalizedRecord[camelField] = record[camelField];
        }
        // Otherwise check for the original capitalized version with spaces
        else if (record[originalField] !== undefined) {
          normalizedRecord[camelField] = record[originalField];
        }
      });

      // For any fields we don't have explicit mappings for, copy them as is
      Object.entries(record).forEach(([key, value]) => {
        // Skip fields we've already processed
        if (Object.values(fieldMappings).includes(key) ||
            Object.keys(fieldMappings).includes(key)) {
          return;
        }

        // For other fields, convert to camelCase if they have spaces
        if (key.includes(' ')) {
          const camelKey = key.toLowerCase()
            .split(' ')
            .map((word, index) =>
              index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join('');
          normalizedRecord[camelKey] = value;
        } else {
          // Keep the key as is if it doesn't have spaces
          normalizedRecord[key] = value;
        }
      });

      return normalizedRecord as IncidentRecord;
    });
  };

  // Load data and calculate metrics
  const loadData = (data: any[], source: 'formatter' | 'session') => {
    dispatch(loadIncidentsStart());

    try {
      // Normalize field names to ensure consistent camelCase format
      const normalizedData = normalizeFieldNames(data);

      // Log a sample record to help with debugging
      if (normalizedData.length > 0) {
        console.log('FIELD NAMES NORMALIZED - Sample record after normalization:', normalizedData[0]);
      }

      // Load the incidents with normalized field names
      dispatch(loadIncidentsSuccess(normalizedData));

      // Calculate response time statistics
      const stats = calculateResponseTimeStatistics(normalizedData);
      dispatch(updateResponseTimeStats(stats));

      // Set the data source
      setDataSource(source);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
      dispatch(loadIncidentsFailure(errorMessage));
    }
  };
  
  // Handle tab change
  const handleViewChange = (event: React.SyntheticEvent, newView: DashboardView) => {
    dispatch(setSelectedView(newView));
  };
  
  // UI state for panel visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // If loading
  if (rawData.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading incident data...
        </Typography>
      </Box>
    );
  }
  
  // If error
  if (rawData.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading data: {rawData.error}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </Box>
    );
  }
  
  // If no data
  if (!rawData.incidents.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Response Time Analyzer
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            No incident data loaded. Please use the Data Formatter to send incident data to this tool.
          </Alert>
          <Typography variant="body1" paragraph>
            The Response Time Analyzer calculates and visualizes response time metrics for fire and EMS incidents.
            You can send data to this tool from the Data Formatter's export screen.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            // This would be updated with the correct routing once implemented
            onClick={() => window.location.href = '/data-formatter'}
          >
            Go to Data Formatter
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // When data is loaded
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Response Time Analyzer
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            Analyzing {rawData.incidents.length} incidents
            {dataSource === 'formatter' && ' (from Data Formatter)'}
            {dataSource === 'session' && ' (from previous session)'}
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              color="secondary"
              sx={{ mr: 1 }}
              onClick={() => {
                setShowFilters(!showFilters);
                if (!showFilters) setShowExport(false);
              }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary"
              sx={{ mr: 1 }}
              onClick={() => {
                setShowExport(!showExport);
                if (!showExport) setShowFilters(false);
              }}
            >
              {showExport ? 'Hide Export' : 'Export Results'}
            </Button>
            
            <Button variant="outlined" color="primary">
              Load New Data
            </Button>
          </Box>
        </Box>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          Data loaded successfully. Use the tabs below to explore different views.
        </Alert>
      </Paper>
      
      {/* Filter panel */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <FilterPanel />
        </Paper>
      )}
      
      {/* Export panel */}
      {showExport && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <ReportExport />
        </Paper>
      )}
      
      {/* View selector tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={ui.selectedView} 
          onChange={handleViewChange}
          aria-label="analyzer view tabs"
        >
          <Tab label="Dashboard" value="dashboard" />
          <Tab label="Timeline" value="timeline" />
          <Tab label="Map" value="map" />
          <Tab label="Incidents" value="table" />
          <Tab label="Statistics" value="statistics" />
        </Tabs>
      </Box>
      
      {/* View content */}
      <Box>
        {ui.selectedView === 'dashboard' && <AnalyzerDashboard />}
        {ui.selectedView === 'timeline' && (
          <Box>
            <TimelineVisualization />
            <ResponseTimeDistribution />
          </Box>
        )}
        {ui.selectedView === 'map' && <IncidentMap />}
        {ui.selectedView === 'table' && <IncidentTable />}
        {ui.selectedView === 'statistics' && <StatisticsSummary />}
      </Box>
    </Box>
  );
};

export default ResponseTimeAnalyzerContainer;