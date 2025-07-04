import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  Button, 
  Switch, 
  FormControlLabel 
} from '@mui/material';
import { setSourceFile, setTransformedData, setValidationErrors } from './state/redux/formatterSlice';

// Import the main components
import ExportContainer from './components/formatter/Export/ExportContainer';
import ResponseTimeAnalyzerContainer from './components/analyzer/ResponseTimeAnalyzerContainer';

// Sample data for testing
const sampleIncidents = [
  {
    incidentId: "INC-001",
    incidentDate: "05/01/2025",
    incidentTime: "08:30:00",
    dispatchTime: "08:31:15",
    enRouteTime: "08:33:45",
    arrivalTime: "08:40:20",
    clearTime: "09:15:30",
    incidentType: "Medical Emergency",
    respondingUnit: "Ambulance 1",
    latitude: 34.0522,
    longitude: -118.2437,
    address: "123 Main St, Los Angeles, CA",
    priority: "High"
  },
  {
    incidentId: "INC-002",
    incidentDate: "05/01/2025",
    incidentTime: "09:45:00",
    dispatchTime: "09:46:10",
    enRouteTime: "09:48:30",
    arrivalTime: "09:53:15",
    clearTime: "10:20:00",
    incidentType: "Fire Alarm",
    respondingUnit: "Engine 3",
    latitude: 34.0610,
    longitude: -118.2549,
    address: "456 Oak St, Los Angeles, CA",
    priority: "Medium"
  },
  {
    incidentId: "INC-003",
    incidentDate: "05/01/2025",
    incidentTime: "11:15:00",
    dispatchTime: "11:16:20",
    enRouteTime: "11:18:40",
    arrivalTime: "11:28:15",
    clearTime: "12:05:30",
    incidentType: "Traffic Accident",
    respondingUnit: "Engine 5",
    latitude: 34.0689,
    longitude: -118.2195,
    address: "789 Pine St, Los Angeles, CA",
    priority: "High"
  },
  {
    incidentId: "INC-004",
    incidentDate: "05/02/2025",
    incidentTime: "14:20:00",
    dispatchTime: "14:21:30",
    enRouteTime: "14:23:45",
    arrivalTime: "14:31:10",
    clearTime: "15:00:00",
    incidentType: "Medical Emergency",
    respondingUnit: "Ambulance 2",
    latitude: 34.0479,
    longitude: -118.2631,
    address: "101 Elm St, Los Angeles, CA",
    priority: "High"
  },
  {
    incidentId: "INC-005",
    incidentDate: "05/02/2025",
    incidentTime: "16:45:00",
    dispatchTime: "16:46:15",
    enRouteTime: "16:48:30",
    arrivalTime: "16:57:45",
    clearTime: "17:30:00",
    incidentType: "Structure Fire",
    respondingUnit: "Engine 1",
    latitude: 34.0556,
    longitude: -118.2598,
    address: "222 Maple St, Los Angeles, CA",
    priority: "High"
  }
];

// Mock tool selector component
const MockToolSelector = () => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        FireEMS Tools Integration Test
      </Typography>
      <Typography paragraph>
        This is a test component to demonstrate the integration between the Data Formatter's Export functionality
        and the Response Time Analyzer. It simulates what would happen when you send data from the formatter
        to the analyzer.
      </Typography>
      <Typography paragraph>
        In a real deployment, these would be separate routes in your application, but for testing purposes,
        we're showing both components on the same page.
      </Typography>
    </Paper>
  );
};

// Main integration test component
const IntegrationTest: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [useSampleData, setUseSampleData] = useState<boolean>(true);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Generate transformed data for the formatter export component
  // This would normally come from the field mapping process
  const transformedData = sampleIncidents.map(incident => ({
    "Incident ID": incident.incidentId,
    "Incident Date": incident.incidentDate,
    "Incident Time": incident.incidentTime,
    "Dispatch Time": incident.dispatchTime,
    "En Route Time": incident.enRouteTime,
    "Arrival Time": incident.arrivalTime,
    "Clear Time": incident.clearTime,
    "Incident Type": incident.incidentType,
    "Responding Unit": incident.respondingUnit,
    "Latitude": incident.latitude,
    "Longitude": incident.longitude,
    "Address": incident.address,
    "Priority": incident.priority
  }));
  
  // Set up the formatter state when the component mounts
  useEffect(() => {
    // Dispatch actions to set up the formatter state
    dispatch(setSourceFile({ 
      id: 'sample-file',
      name: "sample_incidents.csv", 
      type: "csv",
      size: 2048,
      lastModified: Date.now()
    }));
    dispatch(setTransformedData(transformedData));
    dispatch(setValidationErrors([]));
  }, [dispatch, transformedData]);
  
  return (
    <Box sx={{ p: 3 }}>
      <MockToolSelector />
      
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useSampleData}
              onChange={(e) => setUseSampleData(e.target.checked)}
            />
          }
          label="Use Sample Data"
        />
        {!useSampleData && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            When disabled, the analyzer will only use data sent from the formatter export
          </Typography>
        )}
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Data Formatter Export" />
          <Tab label="Response Time Analyzer" />
        </Tabs>
      </Box>
      
      <Box role="tabpanel" hidden={activeTab !== 0} sx={{ py: 3 }}>
        {activeTab === 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Formatter Export
            </Typography>
            <Typography paragraph>
              Use the "Send to Tool" tab below to send data to the Response Time Analyzer.
              Then switch to the "Response Time Analyzer" tab to see the result.
            </Typography>
            
            {/* Render the Export Container with mock data */}
            <ExportContainer />
          </Paper>
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeTab !== 1} sx={{ py: 3 }}>
        {activeTab === 1 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Response Time Analyzer
            </Typography>
            
            {/* Conditional button to switch tabs */}
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => setActiveTab(0)}
                sx={{ mr: 2 }}
              >
                Back to Formatter
              </Button>
              
              <Button
                variant="contained"
                onClick={() => sessionStorage.removeItem('fireEmsExportedData')}
              >
                Clear Session Data
              </Button>
            </Box>
            
            {/* Render the Response Time Analyzer */}
            <ResponseTimeAnalyzerContainer 
              initialData={useSampleData ? sampleIncidents : undefined} 
            />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default IntegrationTest;