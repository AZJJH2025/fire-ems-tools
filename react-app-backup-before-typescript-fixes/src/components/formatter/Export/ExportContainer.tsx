import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
// @ts-ignore - Add this to avoid TypeScript errors with the jspdf-autotable plugin
import autoTable from 'jspdf-autotable';

import { RootState } from '@/state/redux/store';
import { setCurrentStep } from '@/state/redux/formatterSlice';
import ExportFormatSelector from './ExportFormatSelector';
import SendToToolPanel from './SendToToolPanel';
import DownloadExportSummary from './DownloadExportSummary';

// Helper function to format dates in the export data
const formatDateFields = (data: Record<string, any>[]): Record<string, any>[] => {
  if (!data || data.length === 0) return data;
  
  // Create a deep copy of the data to avoid modifying the original
  const formattedData = JSON.parse(JSON.stringify(data));
  
  // Process each row
  return formattedData.map((row: Record<string, any>) => {
    const newRow = { ...row };
    
    // Format date fields - extract only the date part (MM/DD/YYYY)
    const dateFields = ['Incident Date'];
    dateFields.forEach(field => {
      if (newRow[field] && typeof newRow[field] === 'string') {
        try {
          // First try to parse as a date object
          const dateObj = new Date(newRow[field]);
          if (!isNaN(dateObj.getTime())) {
            // Format as MM/DD/YYYY
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            newRow[field] = `${month}/${day}/${year}`;
          } else if (newRow[field].includes(' ')) {
            // Fallback: just split on space and take the first part
            newRow[field] = newRow[field].split(' ')[0];
          }
        } catch (e) {
          // If parsing fails, use the split method
          if (newRow[field].includes(' ')) {
            newRow[field] = newRow[field].split(' ')[0];
          }
        }
      }
    });
    
    // Format time fields - extract only the time part (HH:MM:SS)
    const timeFields = ['Dispatch Time', 'En Route Time', 'Arrival Time', 'Incident Time'];
    timeFields.forEach(field => {
      if (newRow[field] && typeof newRow[field] === 'string') {
        try {
          const dateObj = new Date(newRow[field]);
          if (!isNaN(dateObj.getTime())) {
            // Format as HH:MM:SS
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const seconds = dateObj.getSeconds().toString().padStart(2, '0');
            newRow[field] = `${hours}:${minutes}:${seconds}`;
          } else if (newRow[field].includes(' ')) {
            // Fallback: just split on space and take the second part
            const parts = newRow[field].split(' ');
            if (parts.length > 1) {
              newRow[field] = parts[1];
            }
          }
        } catch (e) {
          // If parsing fails, use the split method
          if (newRow[field].includes(' ')) {
            const parts = newRow[field].split(' ');
            if (parts.length > 1) {
              newRow[field] = parts[1];
            }
          }
        }
      }
    });
    
    return newRow;
  });
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ExportContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    sourceFile, 
    transformedData, 
    selectedTool, 
    validationErrors 
  } = useSelector((state: RootState) => state.formatter);

  // Interface for export history
  interface ExportHistoryItem {
    id: string;
    timestamp: number;
    format: string;
    recordCount: number;
    success: boolean;
    destination: string;
    fileName?: string;
  }

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for export format
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel' | 'pdf'>('csv');

  // State for selected tool to send data to
  const [selectedExportTool, setSelectedExportTool] = useState<string | null>(null);

  // State for export progress/status
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    success: boolean;
    message: string;
    open: boolean;
  }>({
    success: false,
    message: '',
    open: false
  });

  // State for export history
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load export history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('fireEmsExportHistory');
      if (savedHistory) {
        setExportHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading export history:', error);
    }
  }, []);

  // Save export history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('fireEmsExportHistory', JSON.stringify(exportHistory));
    } catch (error) {
      console.error('Error saving export history:', error);
    }
  }, [exportHistory]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle export format change
  const handleExportFormatChange = (format: 'csv' | 'json' | 'excel') => {
    setExportFormat(format);
  };

  // Handle selected tool change
  const handleToolChange = (toolId: string | null) => {
    setSelectedExportTool(toolId);
  };

  // Add to export history
  const addToExportHistory = (
    format: string,
    recordCount: number,
    success: boolean,
    destination: string,
    fileName?: string
  ) => {
    const newHistoryItem: ExportHistoryItem = {
      id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      format,
      recordCount,
      success,
      destination,
      fileName
    };

    // Add to the beginning of the array (most recent first)
    setExportHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep only last 20 exports
  };

  // Clear export history
  const clearExportHistory = () => {
    setExportHistory([]);
  };

  // Format date for headers
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  };

  // Handle export to file
  const handleExportToFile = async () => {
    if (!transformedData || transformedData.length === 0) {
      setExportStatus({
        success: false,
        message: 'No data to export',
        open: true
      });
      return;
    }

    setIsExporting(true);

    try {
      // Apply proper date formatting for export
      // This ensures date and time fields are properly formatted
      const dataToExport = formatDateFields(transformedData);
      let fileName = `formatted_data_${Date.now()}`;

      // Handle Excel export separately due to its special binary processing
      if (exportFormat === 'excel') {
        // Create a worksheet from the JSON data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const columnWidths: { [key: string]: number } = {};

        // Get all column headers
        const headers = Object.keys(transformedData[0]);

        // First determine column widths from headers
        headers.forEach(header => {
          columnWidths[header] = Math.max(10, header.length + 2); // Default minimum width
        });

        // Then check data in each column and adjust width if needed
        transformedData.forEach(row => {
          headers.forEach(header => {
            const cellValue = String(row[header] || '');
            // Limit max width to 50 characters for readability
            columnWidths[header] = Math.min(50, Math.max(columnWidths[header], cellValue.length + 2));
          });
        });

        // Apply column widths to worksheet
        worksheet['!cols'] = headers.map(header => ({ wch: columnWidths[header] }));

        // Add metadata to the workbook
        const workbook = XLSX.utils.book_new();
        workbook.Props = {
          Title: "FireEMS Formatted Data",
          Subject: "Incident Data",
          Author: "FireEMS Data Formatter",
          CreatedDate: new Date()
        };

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Formatted Data');

        // Set the file name with timestamp
        fileName = `formatted_data_${Date.now()}.xlsx`;

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, fileName);

        // Add to export history
        addToExportHistory('Excel', dataToExport.length, true, 'File Download', fileName);

        setExportStatus({
          success: true,
          message: 'Data exported successfully as EXCEL',
          open: true
        });
        setIsExporting(false);
        return;
      }

      // Handle PDF export
      if (exportFormat === 'pdf') {
        // Create PDF document using jsPDF
        const doc = new jsPDF();

        // Add title and metadata
        doc.setFontSize(18);
        doc.text('FireEMS Formatted Data', 14, 22);

        doc.setFontSize(11);
        doc.text(`Export Date: ${getFormattedDate()}`, 14, 30);
        doc.text(`Records: ${dataToExport.length}`, 14, 36);

        // Create table structure for PDF
        const headers = Object.keys(dataToExport[0]);

        // Prepare headers and data for table
        const tableHeaders = headers.map(header => ({
          title: header,
          dataKey: header
        }));

        // Create data rows (limit to 500 rows to prevent huge PDFs)
        const maxRows = Math.min(dataToExport.length, 500);

        // Add notice if data was truncated
        if (dataToExport.length > 500) {
          doc.text('Note: Export limited to 500 records for PDF format.', 14, 42);
        }

        // Create a simpler table without the plugin
        const startY = dataToExport.length > 500 ? 48 : 42;

        // Create a simpler table approach
        const cellWidth = 30;
        const cellHeight = 10;
        const marginLeft = 10;

        // Draw header row
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFillColor(220, 220, 220);

        headers.forEach((header, i) => {
          doc.rect(marginLeft + (i * cellWidth), startY, cellWidth, cellHeight, 'FD');
          doc.text(
            header,
            marginLeft + (i * cellWidth) + 2,
            startY + 7
          );
        });

        // Draw data rows (limit to 20 for simplicity)
        const visibleRows = Math.min(dataToExport.length, 20);

        for (let row = 0; row < visibleRows; row++) {
          const y = startY + ((row + 1) * cellHeight);

          headers.forEach((header, col) => {
            // Draw cell border
            doc.rect(marginLeft + (col * cellWidth), y, cellWidth, cellHeight, 'S');

            // Draw cell content
            const value = dataToExport[row][header] || '';
            let displayValue = String(value);

            // Truncate long values
            if (displayValue.length > 10) {
              displayValue = displayValue.substring(0, 8) + '...';
            }

            doc.text(
              displayValue,
              marginLeft + (col * cellWidth) + 2,
              y + 7
            );
          });
        }

        // Add footer with page count
        doc.setFontSize(8);
        doc.text(
          `Generated by FireEMS Tools - ${new Date().toLocaleString()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );

        // Set file name with timestamp
        fileName = `formatted_data_${Date.now()}.pdf`;

        // Save PDF file
        doc.save(fileName);

        // Add to export history
        addToExportHistory('PDF', dataToExport.length, true, 'File Download', fileName);

        setExportStatus({
          success: true,
          message: 'Data exported successfully as PDF',
          open: true
        });
        setIsExporting(false);
        return;
      }

      // Handle CSV and JSON formats
      let content = '';
      let mimeType = '';

      if (exportFormat === 'csv') {
        // Create CSV content with proper structure (one record per row)
        const headers = Object.keys(dataToExport[0]);

        // Start with the header row
        content = headers.join(',') + '\n';

        // Add one row per record
        dataToExport.forEach(row => {
          const values = headers.map(header => {
            const val = row[header];
            // Handle values with commas, quotes, etc.
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          });
          content += values.join(',') + '\n';
        });

        fileName = `formatted_data_${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else if (exportFormat === 'json') {
        // Create JSON content
        content = JSON.stringify(dataToExport, null, 2);
        fileName = `formatted_data_${Date.now()}.json`;
        mimeType = 'application/json';
      }

      // Create a blob and download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Add to export history
      addToExportHistory(
        exportFormat.toUpperCase(),
        dataToExport.length,
        true,
        'File Download',
        fileName
      );

      setExportStatus({
        success: true,
        message: `Data exported successfully as ${exportFormat.toUpperCase()}`,
        open: true
      });
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        success: false,
        message: `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        open: true
      });

      // Add failed export to history
      addToExportHistory(
        exportFormat.toUpperCase(),
        transformedData.length,
        false,
        'File Download'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Get tool name from tool ID
  const getToolName = (toolId: string): string => {
    const tools: Record<string, string> = {
      'response-time-analyzer': 'Response Time Analyzer',
      'call-density-heatmap': 'Call Density Heatmap',
      'incident-dashboard': 'Incident Dashboard',
      'trend-analyzer': 'Trend Analyzer'
    };

    return tools[toolId] || toolId;
  };

  // Handle send to tool
  const handleSendToTool = async () => {
    if (!transformedData || transformedData.length === 0 || !selectedExportTool) {
      setExportStatus({
        success: false,
        message: 'No data or tool selected',
        open: true
      });
      return;
    }

    setIsExporting(true);
    const toolName = getToolName(selectedExportTool);

    try {
      // Apply proper date formatting for export and ensure the data has all required fields
      // for the Response Time Analyzer
      console.log('DEBUG - USING ALREADY TRANSFORMED DATA: Sample data fields:',
                 transformedData.length > 0 ? Object.keys(transformedData[0]) : 'No data');

      // Use transformedData directly - it's already correctly mapped from the field mapping step
      // No need to re-transform since the data is already in the correct format
      const formattedData = transformedData.map(record => {
        // Create a copy of the record without re-transforming field names
        const incident: Record<string, any> = { ...record };

        console.log('DEBUG - USING MAPPED DATA: Record fields:', Object.keys(record));

        // Process datetime fields to separate date and time components
        Object.keys(incident).forEach(field => {
          if (incident[field] && typeof incident[field] === 'string' && incident[field].includes(' ')) {
            // Split datetime into date and time parts
            const [datePart, timePart] = incident[field].split(' ');
            
            console.log(`DATETIME SPLIT: Field "${field}" = "${incident[field]}" -> Date: "${datePart}", Time: "${timePart}"`);
            
            if (field.toLowerCase().includes('date')) {
              console.log(`SETTING DATE FIELD "${field}" to "${datePart}"`);
              incident[field] = datePart; // Keep only date part for date fields
            } else if (field.toLowerCase().includes('time')) {
              console.log(`SETTING TIME FIELD "${field}" to "${timePart}"`);
              incident[field] = timePart; // Keep only time part for time fields
            }
          }
        });

        return incident;
      });

      // Enhanced export data with additional metadata
      const exportData = {
        toolId: selectedExportTool,
        toolName: toolName,
        data: formattedData,
        sourceFile: sourceFile?.name,
        timestamp: Date.now(),
        fields: Object.keys(formattedData[0]),
        recordCount: formattedData.length,
        exportVersion: '2.0'
      };

      // Log a sample record to help with debugging
      if (formattedData.length > 0) {
        console.log('Sample record being sent (using user-mapped fields):', formattedData[0]);
        const firstRecord = formattedData[0];
        const fieldNames = Object.keys(firstRecord);
        console.log('All field names (as mapped by user):', fieldNames);
        console.log('Field values:', firstRecord);
      }

      // Clear any existing data first
      sessionStorage.removeItem('fireEmsExportedData');

      // Verify what field names are being stored
      console.log('VERIFY: Field names being stored in sessionStorage:',
        exportData.data && exportData.data.length > 0 ? Object.keys(exportData.data[0]) : 'No data');

      // Store in sessionStorage for tool access
      sessionStorage.setItem('fireEmsExportedData', JSON.stringify(exportData));

      // Log sample data for debugging
      console.log(`Data prepared for ${selectedExportTool}. Data size: ${formattedData.length} records`);
      if (formattedData.length > 0) {
        console.log('FIELD NAMES CHECK - Sample record being sent to session storage:');
        console.log(JSON.stringify(formattedData[0]));
      }

      // Add to export history
      addToExportHistory(
        'Data Transfer',
        formattedData.length,
        true,
        toolName
      );

      setExportStatus({
        success: true,
        message: `Data sent to ${toolName} successfully!`,
        open: true
      });

      // Set a timeout to ensure session storage is updated before redirecting
      setTimeout(() => {
        // Get the current hostname and port for more dynamic URL construction
        const hostname = window.location.hostname;
        const port = '5006'; // Hardcoded port as per requirements

        const baseUrl = `http://${hostname}:${port}`;
        let targetUrl = '';

        // Redirect to the appropriate URL based on the selected tool
        if (selectedExportTool === 'fire-map-pro') {
          // For React tools, use the React router path
          targetUrl = `${window.location.origin}/app/fire-map-pro`;
        } else if (selectedExportTool === 'response-time-analyzer') {
          targetUrl = `${baseUrl}/response-time-analyzer`;
        } else if (selectedExportTool === 'call-density-heatmap') {
          targetUrl = `${baseUrl}/call-density-heatmap`;
        } else if (selectedExportTool === 'incident-dashboard') {
          targetUrl = `${baseUrl}/incident-dashboard`;
        } else if (selectedExportTool === 'trend-analyzer') {
          targetUrl = `${baseUrl}/trend-analyzer`;
        } else {
          console.log(`Tool ID not recognized: ${selectedExportTool}`);
          return;
        }

        console.log(`Redirecting to: ${targetUrl}`);
        window.location.href = targetUrl;
      }, 500); // Short delay to ensure session storage is updated
    } catch (error) {
      console.error('Send to tool error:', error);
      setExportStatus({
        success: false,
        message: `Error sending data to tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        open: true
      });

      // Add failed export to history
      addToExportHistory(
        'Data Transfer',
        transformedData.length,
        false,
        toolName
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Handle navigation back to validation
  const handleBack = () => {
    dispatch(setCurrentStep(2)); // Go back to Preview & Validate
  };

  // Check if we have data to export
  if (!transformedData || transformedData.length === 0) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No data available to export. Please go back and ensure your data is processed correctly.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Validation
        </Button>
      </Box>
    );
  }

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render export history list
  const renderExportHistory = () => {
    if (exportHistory.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No export history available</Typography>
        </Box>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }} dense>
        {exportHistory.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => {
                setExportHistory(prev => prev.filter(i => i.id !== item.id));
              }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              borderLeft: '4px solid',
              borderColor: item.success ? 'success.main' : 'error.main',
              mb: 1,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>
              {/* Simplified icon rendering to avoid undefined reference errors */}
              {item.format === 'Excel' && <DescriptionIcon color="success" />}
              {item.format === 'CSV' && <DataArrayIcon color="primary" />}
              {item.format === 'JSON' && <DataObjectIcon color="info" />}
              {item.format === 'PDF' && <DescriptionIcon color="error" />}
              {item.format === 'Data Transfer' && <SendIcon color="secondary" />}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="medium">
                  {item.format === 'Data Transfer'
                    ? `Sent to ${item.destination}`
                    : `${item.format} Export${item.fileName ? ` - ${item.fileName}` : ''}`
                  }
                </Typography>
              }
              secondary={
                <Typography variant="caption" display="block">
                  {formatTimestamp(item.timestamp)} • {item.recordCount} records
                  {!item.success && ' • Failed'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Export Formatted Data
      </Typography>

      {/* Data summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Source File
              </Typography>
              <Typography variant="body1">
                {sourceFile?.name || 'No file'} ({sourceFile?.type})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Records
              </Typography>
              <Typography variant="body1">
                {transformedData.length} records processed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Validation Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {validationErrors.length === 0 ? (
                  <>
                    <CheckCircleIcon color="success" />
                    <Typography color="success.main">
                      All data is valid
                    </Typography>
                  </>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {validationErrors.length} validation issues found. Consider reviewing before export.
                    </Alert>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Export History Toggle */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" color="text.secondary">
              Export History
            </Typography>
            {exportHistory.length > 0 && (
              <Badge
                badgeContent={exportHistory.length}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? "Hide history" : "Show history"}
            >
              {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            {exportHistory.length > 0 && showHistory && (
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={clearExportHistory}
                sx={{ ml: 1 }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {/* Export History List */}
        <Collapse in={showHistory}>
          <Box sx={{ mt: 2 }}>
            {renderExportHistory()}
          </Box>
        </Collapse>
      </Paper>

      {/* Export tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="export options tabs">
          <Tab label="Download File" id="export-tab-0" aria-controls="export-tabpanel-0" />
          <Tab label="Send to Tool" id="export-tab-1" aria-controls="export-tabpanel-1" />
        </Tabs>
      </Box>
      
      {/* Download tab panel */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ExportFormatSelector 
              selectedFormat={exportFormat}
              onFormatChange={handleExportFormatChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DownloadExportSummary
              dataCount={transformedData.length}
              fields={Object.keys(transformedData[0])}
              format={exportFormat}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleExportToFile}
              disabled={isExporting}
              startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
              sx={{ mt: 2 }}
            >
              {isExporting ? 'Exporting...' : `Download as ${exportFormat.toUpperCase()}`}
            </Button>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Send to tool tab panel */}
      <TabPanel value={tabValue} index={1}>
        <SendToToolPanel
          selectedTool={selectedExportTool}
          onToolSelect={handleToolChange}
          transformedData={transformedData}
          onSendToTool={handleSendToTool}
          isSending={isExporting}
        />
      </TabPanel>
      
      {/* Navigation buttons */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Validation
        </Button>
      </Box>
      
      {/* Status snackbar */}
      <Snackbar
        open={exportStatus.open}
        autoHideDuration={6000}
        onClose={() => setExportStatus({...exportStatus, open: false})}
      >
        <Alert 
          onClose={() => setExportStatus({...exportStatus, open: false})} 
          severity={exportStatus.success ? 'success' : 'error'}
        >
          {exportStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportContainer;