import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReportIcon from '@mui/icons-material/Report';

// Available tools
const availableTools = [
  {
    id: 'fire-map-pro',
    name: 'Fire Map Pro',
    description: 'Professional mapping and visualization for incident locations and analysis',
    icon: <MapIcon fontSize="large" sx={{ color: '#dc2626' }} />,
    requiredFields: ['incidentId', 'latitude', 'longitude'],
    optionalFields: ['incidentType', 'incidentDate', 'incidentTime', 'address', 'city', 'state', 'priority', 'respondingUnit', 'responseCategory']
  },
  {
    id: 'response-time-analyzer',
    name: 'Response Time Analyzer',
    description: 'Analyze incident response times and visualize performance metrics',
    icon: <AccessTimeIcon fontSize="large" sx={{ color: '#2196f3' }} />,
    requiredFields: ['incidentId', 'incidentDate'],
    optionalFields: ['dispatchTime', 'enRouteTime', 'arrivalTime', 'latitude', 'longitude']
  },
  {
    id: 'call-density-heatmap',
    name: 'Call Density Heatmap',
    description: 'Visualize incident density across geographic areas',
    icon: <MapIcon fontSize="large" sx={{ color: '#ff9800' }} />,
    requiredFields: ['incidentId', 'latitude', 'longitude']
  },
  {
    id: 'incident-dashboard',
    name: 'Incident Dashboard',
    description: 'Interactive dashboard for incident analysis and reporting',
    icon: <BarChartIcon fontSize="large" sx={{ color: '#4caf50' }} />,
    requiredFields: ['incidentId', 'incidentType', 'incidentDate']
  },
  {
    id: 'trend-analyzer',
    name: 'Trend Analyzer',
    description: 'Identify incident trends and patterns over time',
    icon: <TimelineIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
    requiredFields: ['incidentId', 'incidentDate', 'incidentType']
  }
];

interface SendToToolPanelProps {
  selectedTool: string | null;
  onToolSelect: (toolId: string | null) => void;
  transformedData: Record<string, any>[];
  onSendToTool: () => void;
  isSending: boolean;
  preTransformedData?: Record<string, any>[] | null;
}

const SendToToolPanel: React.FC<SendToToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  transformedData,
  onSendToTool,
  isSending,
  preTransformedData
}) => {
  console.log('📡📡📡 SEND TO TOOL PANEL RENDER - FRESH BUILD JUN 13 2025 16:48 - selectedTool:', selectedTool);
  console.log('📡📡📡 SEND TO TOOL PANEL RENDER - onSendToTool function:', !!onSendToTool);
  console.log('📡📡📡 SEND TO TOOL PANEL RENDER - transformedData length:', transformedData?.length);
  console.log('📡📡📡 SEND TO TOOL PANEL RENDER - preTransformedData exists:', !!preTransformedData);
  console.log('📡📡📡 SEND TO TOOL PANEL RENDER - preTransformedData length:', preTransformedData?.length);
  if (preTransformedData && preTransformedData.length > 0) {
    console.log('📡📡📡 SEND TO TOOL PANEL RENDER - preTransformedData sample:', preTransformedData[0]);
  }
  // Handle tool selection
  const handleToolChange = (event: SelectChangeEvent<string>) => {
    onToolSelect(event.target.value);
  };

  // Check if data has all required fields for a tool
  const checkDataCompatibility = (toolId: string): { 
    compatible: boolean; 
    missingFields: string[];
    hasOptionalFields?: string[];
    missingOptionalFields?: string[];
  } => {
    const tool = availableTools.find(t => t.id === toolId);
    if (!tool) return { compatible: false, missingFields: [] };

    // For tools with pre-transformation, check if transformation was successful
    if (toolId === 'fire-map-pro') {
      console.log('🔍 FIRE MAP PRO COMPATIBILITY CHECK - ENHANCED FOR ADDRESS PARSING');
      console.log('preTransformedData exists:', !!preTransformedData);
      console.log('preTransformedData length:', preTransformedData?.length);
      console.log('transformedData sample:', transformedData[0]);
      
      // Fire Map Pro requires successful transformation, not just raw fields
      if (preTransformedData && preTransformedData.length > 0) {
        // Check what fields are actually available in the transformed data
        const dataFields = Object.keys(transformedData[0]);
        console.log('🔍 Available transformed data fields:', dataFields);
        
        // Check which optional fields are present in the transformed data
        const hasOptionalFields = tool.optionalFields ? 
          tool.optionalFields.filter(field => {
            const hasField = dataFields.includes(field);
            console.log(`🔍 Fire Map Pro optional field ${field}: ${hasField ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
            return hasField;
          }) : [];
          
        const missingOptionalFields = tool.optionalFields ? 
          tool.optionalFields.filter(field => !dataFields.includes(field)) : [];
        
        console.log('✅ Fire Map Pro data is compatible - features exist');
        console.log('📊 Available optional fields:', hasOptionalFields);
        console.log('📋 Missing optional fields:', missingOptionalFields);
        
        return {
          compatible: true,
          missingFields: [],
          hasOptionalFields,
          missingOptionalFields
        };
      } else {
        console.log('❌ Fire Map Pro data not compatible - no features');
        return {
          compatible: false,
          missingFields: ['incidentId', 'latitude', 'longitude'],
          hasOptionalFields: [],
          missingOptionalFields: tool.optionalFields || []
        };
      }
    }

    // For Response Time Analyzer, use flexible field checking that handles both camelCase and snake_case
    if (toolId === 'response-time-analyzer') {
      console.log('🔍 RESPONSE TIME ANALYZER COMPATIBILITY CHECK - FLEXIBLE FIELD MATCHING');
      
      const dataFields = Object.keys(transformedData[0]);
      console.log('🔍 Available data fields:', dataFields);
      console.log('🔍 Required fields (camelCase):', tool.requiredFields);
      
      // Check each required field with flexible name matching
      const missingFields = tool.requiredFields.filter(requiredField => {
        // Try exact match first
        if (dataFields.includes(requiredField)) {
          console.log(`✅ Found exact match for ${requiredField}`);
          return false;
        }
        
        // Try snake_case version
        const snakeCase = requiredField.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (dataFields.includes(snakeCase)) {
          console.log(`✅ Found snake_case match for ${requiredField} -> ${snakeCase}`);
          return false;
        }
        
        console.log(`❌ No match found for ${requiredField} (tried ${requiredField} and ${snakeCase})`);
        return true;
      });
      
      console.log(`🔍 CHECKING OPTIONAL FIELDS:`);
      console.log(`🔍 Tool optional fields:`, tool.optionalFields);
      
      const hasOptionalFields = tool.optionalFields ? 
        tool.optionalFields.filter(field => {
          let snakeCase = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          // Special case for enRouteTime -> enroute_time (not en_route_time)
          if (field === 'enRouteTime') {
            snakeCase = 'enroute_time';
          }
          const hasField = dataFields.includes(field);
          const hasSnakeCase = dataFields.includes(snakeCase);
          console.log(`🔍 Optional field ${field}: camelCase=${hasField}, snake_case(${snakeCase})=${hasSnakeCase}`);
          return hasField || hasSnakeCase;
        }) : [];
        
      const missingOptionalFields = tool.optionalFields ? 
        tool.optionalFields.filter(field => {
          let snakeCase = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          // Special case for enRouteTime -> enroute_time (not en_route_time)
          if (field === 'enRouteTime') {
            snakeCase = 'enroute_time';
          }
          return !dataFields.includes(field) && !dataFields.includes(snakeCase);
        }) : [];
      
      console.log(`🔍 OPTIONAL FIELDS RESULT:`);
      console.log(`✅ Has optional fields:`, hasOptionalFields);
      console.log(`❌ Missing optional fields:`, missingOptionalFields);
      
      return {
        compatible: missingFields.length === 0,
        missingFields,
        hasOptionalFields,
        missingOptionalFields
      };
    }

    // For other tools, check field names in original data
    const dataFields = Object.keys(transformedData[0]);
    console.log(`🔍 ${toolId.toUpperCase()} COMPATIBILITY CHECK`);
    console.log('Available fields:', dataFields);
    console.log('Required fields:', tool.requiredFields);
    
    const missingFields = tool.requiredFields.filter(
      requiredField => !dataFields.includes(requiredField)
    );
    
    // Check optional fields if they exist
    const hasOptionalFields = tool.optionalFields ? 
      tool.optionalFields.filter(field => dataFields.includes(field)) : 
      [];
      
    const missingOptionalFields = tool.optionalFields ? 
      tool.optionalFields.filter(field => !dataFields.includes(field)) : 
      [];

    return {
      compatible: missingFields.length === 0,
      missingFields,
      hasOptionalFields,
      missingOptionalFields
    };
  };

  // Get compatibility info for selected tool
  const compatibilityInfo = selectedTool
    ? checkDataCompatibility(selectedTool)
    : { compatible: false, missingFields: [] };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Send to FireEMS Tool
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Send your formatted data directly to another FireEMS tool for analysis and visualization.
      </Alert>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="tool-select-label">Select Tool</InputLabel>
        <Select
          labelId="tool-select-label"
          id="tool-select"
          value={selectedTool || ''}
          label="Select Tool"
          onChange={handleToolChange}
        >
          <MenuItem value="">
            <em>Select a tool...</em>
          </MenuItem>
          {availableTools.map(tool => (
            <MenuItem key={tool.id} value={tool.id}>
              {tool.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedTool && (
        <Grid container spacing={3}>
          {availableTools
            .filter(tool => tool.id === selectedTool)
            .map(tool => (
              <Grid size={12} key={tool.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {tool.icon}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6">{tool.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tool.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Required Fields:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {tool.requiredFields.map((field, index) => (
                        <Typography 
                          key={index} 
                          variant="body2" 
                          sx={{ 
                            backgroundColor: compatibilityInfo.missingFields.includes(field) 
                              ? 'error.light' 
                              : 'success.light',
                            color: compatibilityInfo.missingFields.includes(field)
                              ? 'error.contrastText'
                              : 'success.contrastText',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5
                          }}
                        >
                          {field}
                        </Typography>
                      ))}
                    </Box>
                    
                    {tool.optionalFields && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Optional Fields:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {tool.optionalFields.map((field, index) => (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                backgroundColor: compatibilityInfo.hasOptionalFields?.includes(field) 
                                  ? 'info.light' 
                                  : 'action.disabledBackground',
                                color: compatibilityInfo.hasOptionalFields?.includes(field)
                                  ? 'info.contrastText'
                                  : 'text.secondary',
                                borderRadius: 1,
                                px: 1,
                                py: 0.5
                              }}
                            >
                              {field}
                            </Typography>
                          ))}
                        </Box>
                      </>
                    )}
                    
                    {!compatibilityInfo.compatible && (
                      <Alert 
                        severity="warning" 
                        icon={<ReportIcon />}
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2" gutterBottom>
                          Your data is missing required fields for this tool:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {compatibilityInfo.missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                    
                    {compatibilityInfo.compatible && (
                      <Alert 
                        severity="success" 
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2" gutterBottom>
                          Your data is compatible with this tool. All required fields are present.
                        </Typography>
                        {tool.optionalFields && compatibilityInfo.hasOptionalFields && compatibilityInfo.hasOptionalFields.length > 0 && (
                          <Typography variant="body2">
                            {compatibilityInfo.hasOptionalFields.length} of {tool.optionalFields.length} optional fields are available for enhanced analysis.
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!compatibilityInfo.compatible || isSending}
                      startIcon={isSending ? <CircularProgress size={20} /> : <SendIcon />}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        console.log('🚀🚀🚀 SEND TO TOOL BUTTON CLICKED - FRESH BUILD JUN 13 2025 16:49 - tool.id:', tool.id);
                        console.log('🚀🚀🚀 SEND TO TOOL BUTTON - onSendToTool function:', onSendToTool);
                        onSendToTool();
                      }}
                    >
                      {isSending ? 'Sending...' : `Send to ${tool.name}`}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default SendToToolPanel;