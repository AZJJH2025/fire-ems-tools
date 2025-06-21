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
import ReportGenerator from './Reports/ReportGenerator';
import ProfessionalReportGenerator from './ProfessionalReportGenerator';

interface ResponseTimeAnalyzerContainerProps {
  // Optional initial data if coming from the formatter
  initialData?: IncidentRecord[];
}

const ResponseTimeAnalyzerContainer: React.FC<ResponseTimeAnalyzerContainerProps> = ({
  initialData
}) => {
  const dispatch = useDispatch();
  const { rawData, ui, calculatedMetrics } = useSelector((state: RootState) => state.analyzer);
  const [dataSource, setDataSource] = useState<'formatter' | 'session' | 'none'>('none');
  
  // Set browser tab title for Response Time Analyzer
  useEffect(() => {
    document.title = 'FireEMS Response Time Analyzer';
  }, []);
  
  // Check for data from the formatter or session storage on mount
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      console.log('🔍 INITIAL DATA DEBUG - Data received from formatter:');
      console.log('Number of records:', initialData.length);
      console.log('First record field names:', Object.keys(initialData[0]));
      console.log('First record sample:', initialData[0]);
      console.log('First record incidentTime:', initialData[0].incidentTime);
      console.log('First record Call Receive Time:', (initialData[0] as any)['Call Receive Time']);
      console.log('🔍 END INITIAL DATA DEBUG');
      
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

          // Check if data is already normalized (from DataTransformer) or needs normalization
          const firstRecord = parsed.data[0];
          const hasNormalizedFields = firstRecord.hasOwnProperty('incidentId') && firstRecord.hasOwnProperty('incidentDate');
          const hasOriginalFields = firstRecord.hasOwnProperty('Incident ID') && firstRecord.hasOwnProperty('Incident Date');
          
          console.log('🔍 DATA FORMAT DETECTION:');
          console.log('🔍 Has normalized fields (incidentId, incidentDate):', hasNormalizedFields);
          console.log('🔍 Has original fields (Incident ID, Incident Date):', hasOriginalFields);
          console.log('🔍 Sample incidentTime value:', firstRecord.incidentTime);
          console.log('🔍 Sample incidentTime type:', typeof firstRecord.incidentTime);
          console.log('🔍 Sample "Call Received Date/Time" value:', firstRecord['Call Received Date/Time']);
          console.log('🔍 Sample "Call Received Time" value (legacy):', firstRecord['Call Received Time']);
          console.log('🔍 CHATGPT DEBUG - Full first record before processing:', JSON.stringify(firstRecord, null, 2));
          
          let dataToLoad: IncidentRecord[];
          
          if (hasNormalizedFields && !hasOriginalFields) {
            // Data is already normalized by DataTransformer - use it directly
            console.log('✅ USING PRE-NORMALIZED DATA FROM DATATRANSFORMER - SKIPPING FIELD NORMALIZATION');
            dataToLoad = parsed.data as IncidentRecord[];
          } else {
            // Data needs normalization (legacy path or direct CSV import)
            console.log('🔧 APPLYING FIELD NORMALIZATION FOR RAW DATA');
            dataToLoad = normalizeFieldNames(parsed.data);
          }
          
          loadData(dataToLoad, 'session');
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
    console.log('📝 NORMALIZE FIELD NAMES - Function called with', records.length, 'records');
    return records.map((record, index) => {
      const normalizedRecord: Record<string, any> = {};

      // Field mapping debug removed for stability

      // Field name mapping - handles various field name formats from CSV files
      // Note: Order matters when multiple fields map to the same target - earlier entries take precedence
      const fieldMappings: Record<string, string> = {
        // Standard capitalized field names - prioritize "Call Received Date/Time" over other time fields
        'Incident ID': 'incidentId',
        'Incident Date': 'incidentDate',
        'Call Received Date/Time': 'incidentTime',  // Primary mapping for incident time (new field name)
        'Call Receive Time': 'incidentTime',        // Legacy mapping for incident time
        'Call Received Time': 'incidentTime',       // Legacy mapping for incident time (variation)
        'Incident Time': 'incidentTime',            // Fallback for incident time
        'Dispatch Time': 'dispatchTime',
        'En Route Time': 'enRouteTime',
        'Arrival Time': 'arrivalTime',
        'Clear Time': 'clearTime',
        'Incident Type': 'incidentType',
        'Latitude': 'latitude',
        'Longitude': 'longitude',
        'Address': 'address',
        
        // User's actual field names with spaces and commas - prioritize call receive time
        'call receive time': 'incidentTime',  // Priority mapping for incident time (lowercase)
        'incident time': 'incidentTime',      // Fallback for incident time (lowercase)
        'dispatch time': 'dispatchTime',
        'turnout, time': 'enRouteTime',  // Map turnout time to enRoute time
        'travel time': 'travelTime',
        'total response, time': 'totalResponseTime',
        'incident type': 'incidentType',
        'type': 'incidentType',
        'location': 'location',
        'Location': 'location',
        'unit': 'unit',
        'Unit': 'unit',
        
        // Alternative common variations
        'turnout time': 'enRouteTime',
        'response time': 'totalResponseTime',
        'total response time': 'totalResponseTime',
        'en route time': 'enRouteTime',
        'enroute time': 'enRouteTime',
        'arrival time': 'arrivalTime',
        'clear time': 'clearTime',
        'incident id': 'incidentId',
        'incident date': 'incidentDate',
        'date': 'incidentDate',
        'time': 'incidentTime'
      };

      // Process field mappings with priority handling
      // First pass: handle high-priority fields that might have conflicts
      const priorityFields = ['incidentTime', 'incidentId', 'incidentDate'];
      priorityFields.forEach(targetField => {
        // Find all source fields that map to this target field
        const sourceFields = Object.entries(fieldMappings)
          .filter(([_, target]) => target === targetField)
          .map(([source, _]) => source);
        
        // Try each source field in order until we find a value
        for (const sourceField of sourceFields) {
          if (record[sourceField] !== undefined && record[sourceField] !== null && record[sourceField] !== '') {
            normalizedRecord[targetField] = record[sourceField];
            console.log(`PRIORITY_FIELD_MAPPING: "${sourceField}" -> "${targetField}" = "${record[sourceField]}"`);
            break; // Stop after first valid value found
          }
        }
        
        // If no source field found, check for camelCase version
        if (!normalizedRecord[targetField] && record[targetField] !== undefined && record[targetField] !== null && record[targetField] !== '') {
          normalizedRecord[targetField] = record[targetField];
          console.log(`PRIORITY_FIELD_MAPPING: "${targetField}" (already camelCase) = "${record[targetField]}"`);
        }
      });
      
      // Second pass: handle all other fields
      Object.entries(fieldMappings).forEach(([originalField, camelField]) => {
        // Skip if already processed in priority pass
        if (priorityFields.includes(camelField) && normalizedRecord[camelField] !== undefined) {
          return;
        }
        
        // Check for the original field name first (this handles CSV imports properly)
        if (record[originalField] !== undefined && record[originalField] !== null && record[originalField] !== '') {
          normalizedRecord[camelField] = record[originalField];
          console.log(`FIELD_MAPPING: "${originalField}" -> "${camelField}" = "${record[originalField]}"`);
        }
        // If original field doesn't exist, check for camelCase version
        else if (record[camelField] !== undefined && record[camelField] !== null && record[camelField] !== '') {
          normalizedRecord[camelField] = record[camelField];
          console.log(`FIELD_MAPPING: "${camelField}" (already camelCase) = "${record[camelField]}"`);
        }
      });

      // Field mapping debug removed for stability

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

      // BULLETPROOF DEBUG - Show actual field names
      console.log('=== FIELD MAPPING DEBUG FOR RECORD', index, '===');
      console.log('ORIGINAL_FIELD_NAMES:', Object.keys(record));
      console.log('ORIGINAL_RECORD_SAMPLE:', record);
      console.log('NORMALIZED_FIELD_NAMES:', Object.keys(normalizedRecord));
      console.log('NORMALIZED_RECORD_SAMPLE:', normalizedRecord);
      console.log('=== END FIELD MAPPING DEBUG ===');
      
      // SPECIFIC DEBUG for incidentTime mapping
      console.log('=== INCIDENT TIME DEBUG ===');
      console.log('Original "Call Receive Time":', record['Call Receive Time']);
      console.log('Original "call receive time":', record['call receive time']);
      console.log('Original "Incident Time":', record['Incident Time']);
      console.log('Original "incident time":', record['incident time']);
      console.log('Normalized incidentTime:', normalizedRecord.incidentTime);
      console.log('=== END INCIDENT TIME DEBUG ===');
      
      // Check for location data specifically  
      const locationFields = Object.keys(record).filter(key => 
        key.toLowerCase().includes('location') || 
        key.toLowerCase().includes('lat') ||
        key.toLowerCase().includes('lon') ||
        key.toLowerCase().includes('coordinate')
      );
      console.log('LOCATION_RELATED_FIELDS_FOUND:', locationFields);

      // Handle combined location field (e.g., "33.4501, -112.8498")
      if (normalizedRecord.location && typeof normalizedRecord.location === 'string') {
        const locationParts = normalizedRecord.location.split(',');
        if (locationParts.length === 2) {
          const lat = parseFloat(locationParts[0].trim());
          const lng = parseFloat(locationParts[1].trim());
          
          if (!isNaN(lat) && !isNaN(lng)) {
            normalizedRecord.latitude = lat;
            normalizedRecord.longitude = lng;
            console.log(`Parsed location "${normalizedRecord.location}" -> lat: ${lat}, lng: ${lng}`);
          } else {
            console.warn(`Could not parse location: ${normalizedRecord.location}`);
          }
        }
      }

      return normalizedRecord as IncidentRecord;
    });
  };

  // Load data and calculate metrics
  const loadData = (data: any[], source: 'formatter' | 'session') => {
    dispatch(loadIncidentsStart());

    try {
      console.log('🔄 LOAD DATA - Starting field normalization');
      console.log('Raw data before normalization (first record):', data[0]);
      console.log('Raw data field names:', Object.keys(data[0]));
      
      // Normalize field names to ensure consistent camelCase format
      const normalizedData = normalizeFieldNames(data);

      // Log a sample record to help with debugging
      if (normalizedData.length > 0) {
        console.log('🔄 LOAD DATA - After normalization (first record):', normalizedData[0]);
        console.log('🔄 LOAD DATA - Normalized field names:', Object.keys(normalizedData[0]));
        console.log('🔄 LOAD DATA - incidentTime value:', normalizedData[0].incidentTime);
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
  const handleViewChange = (_event: React.SyntheticEvent, newView: DashboardView) => {
    dispatch(setSelectedView(newView));
  };
  
  // UI state for panel visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showProfessionalReportGenerator, setShowProfessionalReportGenerator] = useState(false);
  
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
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowReportGenerator(true)}
              disabled={!rawData.incidents || rawData.incidents.length === 0}
            >
              Generate PDF Report
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => setShowProfessionalReportGenerator(true)}
              disabled={!rawData.incidents || rawData.incidents.length === 0}
              sx={{ ml: 1 }}
            >
              Professional Reports
            </Button>
            
            <Button variant="outlined" color="primary" sx={{ ml: 1 }}>
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
      
      {/* Professional PDF Report Generator */}
      <ReportGenerator
        open={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
        incidents={rawData.incidents || []}
        statistics={calculatedMetrics.responseTimeStats || {
          mean: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          median: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          ninetiethPercentile: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          standardDeviation: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          min: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          max: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          count: 0
        }}
        dateRange={{
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          end: new Date().toISOString().split('T')[0] // today
        }}
      />
      
      {/* Professional Report Templates */}
      {showProfessionalReportGenerator && (
        <ProfessionalReportGenerator
          responseTimeStats={calculatedMetrics.responseTimeStats || {
            mean: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            median: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            ninetiethPercentile: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            standardDeviation: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            min: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            max: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
            count: 0
          }}
          incidentData={rawData.incidents || []}
          onClose={() => setShowProfessionalReportGenerator(false)}
        />
      )}
    </Box>
  );
};

export default ResponseTimeAnalyzerContainer;