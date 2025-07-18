import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PsychologyIcon from '@mui/icons-material/Psychology';
// XLSX will be dynamically imported only when needed for Excel/CSV export

import { RootState } from '@/state/redux/store';
import { calculateIncidentMetrics } from '@/utils/responseTimeCalculator';
import ReportGenerator from '../Reports/ReportGenerator';
import AIEnhancedReportGenerator from '../AIEnhancedReportGenerator';

interface ExportFormatOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Export format options
const exportFormats: ExportFormatOption[] = [
  {
    id: 'excel',
    name: 'Excel Workbook (.xlsx)',
    description: 'Detailed spreadsheet with multiple tabs for incidents, statistics, and charts',
    icon: <ArticleIcon sx={{ color: '#2E7D32' }} />
  },
  {
    id: 'csv',
    name: 'CSV File (.csv)',
    description: 'Simple comma-separated values file that can be opened in any spreadsheet application',
    icon: <InsertDriveFileIcon sx={{ color: '#1976D2' }} />
  },
  {
    id: 'pdf',
    name: 'PDF Report (.pdf)',
    description: 'Formatted report with tables, charts and statistics',
    icon: <PictureAsPdfIcon sx={{ color: '#D32F2F' }} />
  },
  {
    id: 'ai-enhanced',
    name: 'AI-Enhanced Report (.pdf)',
    description: 'Professional report with AI-powered insights and recommendations',
    icon: <PsychologyIcon sx={{ color: '#9C27B0' }} />
  }
];

// Content section options
const contentSections = [
  {
    id: 'summary',
    name: 'Summary Statistics',
    description: 'Overall response time metrics and KPIs',
    icon: <BarChartIcon />
  },
  {
    id: 'incidents',
    name: 'Incident Details',
    description: 'Detailed table of all incidents and response times',
    icon: <TableChartIcon />
  },
  {
    id: 'map',
    name: 'Geographic Analysis',
    description: 'Map and location-based analysis (PDF only)',
    icon: <MapIcon />
  }
];

// Main component
const ReportExport: React.FC = () => {
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  const filters = useSelector((state: RootState) => state.analyzer.filters);
  
  // Export state
  const [exportFormat, setExportFormat] = useState<string>('excel');
  const [selectedSections, setSelectedSections] = useState<string[]>(['summary', 'incidents']);
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
  
  // PDF Report Generator state
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  // AI-Enhanced Report Generator state
  const [showAIReportGenerator, setShowAIReportGenerator] = useState(false);
  
  
  // Handle section selection change
  const handleSectionToggle = (sectionId: string) => {
    const currentSelectedSections = [...selectedSections];
    const currentIndex = currentSelectedSections.indexOf(sectionId);
    
    if (currentIndex === -1) {
      currentSelectedSections.push(sectionId);
    } else {
      currentSelectedSections.splice(currentIndex, 1);
    }
    
    setSelectedSections(currentSelectedSections);
  };
  
  // Generate Excel export using secure ExcelJS
  const generateExcelExport = async () => {
    // Dynamic import for ExcelJS (bundle optimization)
    const ExcelJS = await import('exceljs');
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = "FireEMS Response Time Analyzer";
    workbook.lastModifiedBy = "FireEMS Response Time Analyzer";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.title = "Response Time Analysis Report";
    workbook.subject = "Incident Response Times";
    
    // If summary statistics are selected
    if (selectedSections.includes('summary') && responseTimeStats) {
      // Create summary statistics worksheet
      const statsData = [
        ['Response Time Statistics', '', '', '', ''],
        ['Metric', 'Mean', 'Median', '90th Percentile', 'Standard Deviation'],
        ['Dispatch Time', 
          responseTimeStats.mean.dispatchTime || 'N/A', 
          responseTimeStats.median.dispatchTime || 'N/A',
          responseTimeStats.ninetiethPercentile.dispatchTime || 'N/A',
          responseTimeStats.standardDeviation.dispatchTime || 'N/A'
        ],
        ['Turnout Time', 
          responseTimeStats.mean.turnoutTime || 'N/A', 
          responseTimeStats.median.turnoutTime || 'N/A',
          responseTimeStats.ninetiethPercentile.turnoutTime || 'N/A',
          responseTimeStats.standardDeviation.turnoutTime || 'N/A'
        ],
        ['Travel Time', 
          responseTimeStats.mean.travelTime || 'N/A', 
          responseTimeStats.median.travelTime || 'N/A',
          responseTimeStats.ninetiethPercentile.travelTime || 'N/A',
          responseTimeStats.standardDeviation.travelTime || 'N/A'
        ],
        ['Total Response Time', 
          responseTimeStats.mean.totalResponseTime || 'N/A', 
          responseTimeStats.median.totalResponseTime || 'N/A',
          responseTimeStats.ninetiethPercentile.totalResponseTime || 'N/A',
          responseTimeStats.standardDeviation.totalResponseTime || 'N/A'
        ],
        ['', '', '', '', ''],
        ['Report Generated:', new Date().toLocaleString(), '', '', ''],
        ['Total Incidents:', incidents.length.toString(), '', '', '']
      ];
      
      // Add active filters if any
      if (filters.dateRange || filters.incidentTypes || filters.units || filters.timeOfDay) {
        statsData.push(['', '', '', '', '']);
        statsData.push(['Applied Filters:', '', '', '', '']);
        
        if (filters.dateRange) {
          statsData.push([
            'Date Range:', 
            `${filters.dateRange[0].toLocaleDateString()} to ${filters.dateRange[1].toLocaleDateString()}`,
            '', '', ''
          ]);
        }
        
        if (filters.incidentTypes) {
          statsData.push([
            'Incident Types:', 
            filters.incidentTypes.join(', '),
            '', '', ''
          ]);
        }
        
        if (filters.units) {
          statsData.push([
            'Units:', 
            filters.units.join(', '),
            '', '', ''
          ]);
        }
        
        if (filters.timeOfDay) {
          statsData.push([
            'Time of Day:', 
            `${filters.timeOfDay[0]}:00 to ${filters.timeOfDay[1]}:00`,
            '', '', ''
          ]);
        }
      }
      
      const summaryWorksheet = workbook.addWorksheet('Summary Statistics');
      
      // Add data to worksheet
      summaryWorksheet.addRows(statsData);
      
      // Set column widths
      summaryWorksheet.columns = [
        { width: 20 }, // A
        { width: 20 }, // B
        { width: 20 }, // C
        { width: 20 }, // D
        { width: 20 }, // E
      ];
      
      // Style the header rows
      summaryWorksheet.getRow(1).font = { bold: true, size: 14 };
      summaryWorksheet.getRow(2).font = { bold: true };
    }
    
    // If incident details are selected
    if (selectedSections.includes('incidents')) {
      // Calculate metrics for each incident
      const incidentsWithMetrics = incidents.map(incident => {
        const metrics = calculateIncidentMetrics(incident);
        return {
          'Incident ID': incident.incidentId,
          'Date': incident.incidentDate,
          'Time': incident.incidentTime || '',
          'Type': incident.incidentType || '',
          'Responding Unit': incident.respondingUnit || '',
          'Address': incident.address || '',
          'Location': incident.latitude && incident.longitude 
                    ? `${incident.latitude}, ${incident.longitude}` 
                    : '',
          'Dispatch Time (s)': metrics.dispatchTime || '',
          'Turnout Time (s)': metrics.turnoutTime || '',
          'Travel Time (s)': metrics.travelTime || '',
          'Total Response Time (s)': metrics.totalResponseTime || '',
          'Scene Time (s)': metrics.sceneTime || '',
          'Total Incident Time (s)': metrics.totalIncidentTime || ''
        };
      });
      
      // Create incidents worksheet
      const incidentsWorksheet = workbook.addWorksheet('Incident Details');
      
      // Add headers
      const headers = Object.keys(incidentsWithMetrics[0] || {});
      incidentsWorksheet.addRow(headers);
      
      // Add data rows
      incidentsWithMetrics.forEach(incident => {
        incidentsWorksheet.addRow(Object.values(incident));
      });
      
      // Set column widths
      incidentsWorksheet.columns = [
        { width: 15 }, // A - Incident ID
        { width: 12 }, // B - Date
        { width: 10 }, // C - Time
        { width: 15 }, // D - Type
        { width: 15 }, // E - Responding Unit
        { width: 25 }, // F - Address
        { width: 20 }, // G - Location
        { width: 15 }, // H - Dispatch Time
        { width: 15 }, // I - Turnout Time
        { width: 15 }, // J - Travel Time
        { width: 20 }, // K - Total Response Time
        { width: 15 }, // L - Scene Time
        { width: 20 }, // M - Total Incident Time
      ];
      
      // Style the header row
      incidentsWorksheet.getRow(1).font = { bold: true };
    }
    
    // Generate the file
    const filename = `response_time_analysis_${Date.now()}.xlsx`;
    
    // Write file to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return { success: true, filename };
  };
  
  // Generate CSV export
  const generateCsvExport = async () => {
    // Calculate metrics for each incident
    const incidentsWithMetrics = incidents.map(incident => {
      const metrics = calculateIncidentMetrics(incident);
      return {
        'Incident ID': incident.incidentId,
        'Date': incident.incidentDate,
        'Time': incident.incidentTime || '',
        'Type': incident.incidentType || '',
        'Responding Unit': incident.respondingUnit || '',
        'Address': incident.address || '',
        'Location': incident.latitude && incident.longitude 
                  ? `${incident.latitude}, ${incident.longitude}` 
                  : '',
        'Dispatch Time (s)': metrics.dispatchTime || '',
        'Turnout Time (s)': metrics.turnoutTime || '',
        'Travel Time (s)': metrics.travelTime || '',
        'Total Response Time (s)': metrics.totalResponseTime || '',
        'Scene Time (s)': metrics.sceneTime || '',
        'Total Incident Time (s)': metrics.totalIncidentTime || ''
      };
    });
    
    // Convert to CSV using ExcelJS
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Incident Details');
    
    // Add headers
    const headers = Object.keys(incidentsWithMetrics[0] || {});
    worksheet.addRow(headers);
    
    // Add data rows
    incidentsWithMetrics.forEach(incident => {
      worksheet.addRow(Object.values(incident));
    });
    
    // Write to CSV format
    const csvOutput = await workbook.csv.writeBuffer();
    
    // Create a download link
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `response_time_analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, filename: `response_time_analysis_${Date.now()}.csv` };
  };
  
  // Generate PDF export - now opens the professional report generator
  const generatePdfExport = () => {
    setShowReportGenerator(true);
    return { success: true, filename: 'Opening Report Generator...' };
  };
  
  // Handle export
  const handleExport = async () => {
    if (!incidents.length) {
      setExportStatus({
        success: false,
        message: 'No data to export',
        open: true
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      let result;
      
      switch (exportFormat) {
        case 'excel':
          result = await generateExcelExport();
          break;
        case 'csv':
          result = await generateCsvExport();
          break;
        case 'pdf':
          // Open the professional report generator instead of inline generation
          generatePdfExport();
          return; // Exit early for PDF since we're opening a dialog
        case 'ai-enhanced':
          // Open the AI-enhanced report generator
          setShowAIReportGenerator(true);
          return; // Exit early for AI-enhanced since we're opening a dialog
        default:
          throw new Error('Unsupported export format');
      }
      
      setExportStatus({
        success: true,
        message: `Data exported successfully as ${exportFormat.toUpperCase()} file: ${result.filename}`,
        open: true
      });
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        success: false,
        message: `Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        open: true
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export Analysis Results
      </Typography>
      
      <Grid container spacing={3}>
        {/* Export format selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Export Format
            </Typography>
            
            <List>
              {exportFormats.map((format) => (
                <Paper
                  key={format.id}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    p: 1,
                    bgcolor: exportFormat === format.id ? 'action.selected' : 'background.paper',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => setExportFormat(format.id)}
                >
                  <ListItem>
                    <ListItemIcon>
                      {format.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={format.name}
                      secondary={format.description}
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Content selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Include In Export
            </Typography>
            
            <List>
              {contentSections.map((section) => (
                <ListItem key={section.id} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        disabled={section.id === 'map' && exportFormat !== 'pdf'}
                      />
                    }
                    label={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {section.icon}
                          <Typography variant="body1" sx={{ ml: 1 }}>
                            {section.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Export summary */}
      <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Export Summary
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Total Records
            </Typography>
            <Typography variant="body1">
              {incidents.length} incidents
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Format
            </Typography>
            <Typography variant="body1">
              {exportFormats.find(f => f.id === exportFormat)?.name || exportFormat}
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Estimated File Size
            </Typography>
            <Typography variant="body1">
              {/* Very rough size estimation based on number of incidents and format */}
              {exportFormat === 'excel' 
                ? `~${Math.ceil(incidents.length * 0.5)} KB`
                : exportFormat === 'csv'
                ? `~${Math.ceil(incidents.length * 0.3)} KB`
                : exportFormat === 'pdf'
                ? `~${Math.ceil(incidents.length * 0.7 + 
                    (selectedSections.includes('map') ? 500 : 0))} KB`
                : 'Unknown'
              }
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={isExporting || !selectedSections.length}
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </Box>
      </Paper>
      
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
      
      {/* Professional PDF Report Generator */}
      <ReportGenerator
        open={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
        incidents={incidents || []}
        statistics={responseTimeStats || {
          mean: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          median: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          ninetiethPercentile: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          standardDeviation: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          min: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          max: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          count: 0
        }}
        dateRange={filters?.dateRange ? {
          start: filters.dateRange[0].toISOString().split('T')[0],
          end: filters.dateRange[1].toISOString().split('T')[0]
        } : undefined}
      />
      
      {/* AI-Enhanced Report Generator */}
      <AIEnhancedReportGenerator
        open={showAIReportGenerator}
        onClose={() => setShowAIReportGenerator(false)}
        incidents={incidents || []}
        statistics={responseTimeStats || {
          mean: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          median: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          ninetiethPercentile: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          standardDeviation: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          min: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          max: { dispatchTime: null, turnoutTime: null, travelTime: null, totalResponseTime: null, sceneTime: null, totalIncidentTime: null },
          count: 0
        }}
        dateRange={filters?.dateRange ? {
          start: filters.dateRange[0].toISOString().split('T')[0],
          end: filters.dateRange[1].toISOString().split('T')[0]
        } : undefined}
      />
    </Box>
  );
};

export default ReportExport;