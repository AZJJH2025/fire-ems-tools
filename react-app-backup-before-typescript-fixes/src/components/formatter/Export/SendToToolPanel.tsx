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
    requiredFields: ['Incident ID', 'Latitude', 'Longitude'],
    optionalFields: ['Incident Type', 'Incident Date', 'Incident Time', 'Address', 'City', 'State', 'Priority', 'Station', 'Response Category']
  },
  {
    id: 'response-time-analyzer',
    name: 'Response Time Analyzer',
    description: 'Analyze incident response times and visualize performance metrics',
    icon: <AccessTimeIcon fontSize="large" sx={{ color: '#2196f3' }} />,
    requiredFields: ['Incident ID', 'Incident Date'],
    optionalFields: ['Dispatch Time', 'En Route Time', 'Arrival Time', 'Latitude', 'Longitude']
  },
  {
    id: 'call-density-heatmap',
    name: 'Call Density Heatmap',
    description: 'Visualize incident density across geographic areas',
    icon: <MapIcon fontSize="large" sx={{ color: '#ff9800' }} />,
    requiredFields: ['Incident ID', 'Latitude', 'Longitude']
  },
  {
    id: 'incident-dashboard',
    name: 'Incident Dashboard',
    description: 'Interactive dashboard for incident analysis and reporting',
    icon: <BarChartIcon fontSize="large" sx={{ color: '#4caf50' }} />,
    requiredFields: ['Incident ID', 'Incident Type', 'Incident Date']
  },
  {
    id: 'trend-analyzer',
    name: 'Trend Analyzer',
    description: 'Identify incident trends and patterns over time',
    icon: <TimelineIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
    requiredFields: ['Incident ID', 'Incident Date', 'Incident Type']
  }
];

interface SendToToolPanelProps {
  selectedTool: string | null;
  onToolSelect: (toolId: string | null) => void;
  transformedData: Record<string, any>[];
  onSendToTool: () => void;
  isSending: boolean;
}

const SendToToolPanel: React.FC<SendToToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  transformedData,
  onSendToTool,
  isSending
}) => {
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

    const dataFields = Object.keys(transformedData[0]);
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
              <Grid item xs={12} key={tool.id}>
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
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!compatibilityInfo.compatible || isSending}
                      startIcon={isSending ? <CircularProgress size={20} /> : <SendIcon />}
                      onClick={onSendToTool}
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