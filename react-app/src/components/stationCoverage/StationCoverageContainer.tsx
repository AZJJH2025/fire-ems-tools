/**
 * Station Coverage Optimizer Container
 * 
 * Enterprise-grade React tool combining legacy isochrone mapping and coverage gap analysis
 * into a comprehensive station placement and coverage optimization platform.
 * 
 * Features:
 * - Interactive station placement and management
 * - NFPA 1710/1720 compliant coverage analysis
 * - Real-time isochrone generation with travel time modeling
 * - Coverage gap identification and visualization
 * - Professional reporting for city councils and compliance
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Toolbar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Tooltip,
  Drawer
} from '@mui/material';
import {
  Place as StationIcon,
  FileDownload as ExportIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Assessment as AnalysisIcon,
  Map as MapIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

// Import station coverage components
import InteractiveCoverageMap from './InteractiveCoverageMap/CoverageMap';
import StationCoverageSidebar from './StationCoverageSidebar';
import StationCoverageReportGenerator from './StationCoverageReportGenerator';

interface StationCoverageContainerProps {
  mode?: 'analysis' | 'optimization' | 'reporting';
}

const StationCoverageContainer: React.FC<StationCoverageContainerProps> = ({
  mode: _mode = 'analysis'
}) => {
  // Component state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [_selectedTab, _setSelectedTab] = useState('coverage');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [jurisdictionBoundary, setJurisdictionBoundary] = useState<any>(null);
  const [coverageStandard, setCoverageStandard] = useState<'nfpa1710' | 'nfpa1720'>('nfpa1710'); // nfpa1710 or nfpa1720
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisTriggered, setAnalysisTriggered] = useState(0);

  // Sidebar width constant
  const SIDEBAR_WIDTH = 400;

  /**
   * Handle station data import from Data Formatter
   */
  const handleStationDataImport = useCallback((data: any[]) => {
    console.log('🚒 Importing station data:', data.length, 'stations');
    setStations(data);
    setAnalysisResults(null); // Reset analysis when new data is imported
  }, []);

  /**
   * Handle adding new station manually
   */
  const handleStationAdd = useCallback((newStation: any) => {
    console.log('➕ Adding new station:', newStation);
    setStations(prev => [...prev, newStation]);
  }, []);

  /**
   * Handle station selection
   */
  const handleStationSelect = useCallback((station: any) => {
    console.log('🎯 Station selected:', station.station_name);
    // TODO: Show station details panel or highlight station
  }, []);

  /**
   * Handle analysis results update from map
   */
  const handleAnalysisUpdate = useCallback((results: any) => {
    console.log('📊 Analysis updated:', results);
    setAnalysisResults(results);
  }, []);

  /**
   * Handle station edit
   */
  const handleStationEdit = useCallback((station: any) => {
    console.log('✏️ Edit station:', station.station_id);
    // TODO: Open edit dialog
  }, []);

  /**
   * Handle station delete
   */
  const handleStationDelete = useCallback((stationId: string) => {
    console.log('🗑️ Delete station:', stationId);
    setStations(prev => prev.filter(s => s.station_id !== stationId));
  }, []);

  /**
   * Handle coverage standard change
   */
  const handleCoverageStandardChange = useCallback((standard: 'nfpa1710' | 'nfpa1720') => {
    console.log('📏 Coverage standard changed to:', standard);
    setCoverageStandard(standard);
    setAnalysisResults(null); // Reset analysis when standard changes
  }, []);

  /**
   * Handle boundary file upload
   */
  const handleBoundaryUpload = useCallback((boundaryData: any) => {
    console.log('🗺️ Boundary data uploaded:', boundaryData);
    setJurisdictionBoundary(boundaryData);
  }, []);

  /**
   * Handle coverage analysis execution
   */
  const handleRunCoverageAnalysis = useCallback(() => {
    console.log('📊 Running coverage analysis with NFPA standard:', coverageStandard);
    
    if (stations.length === 0) {
      console.warn('No stations available for analysis');
      return;
    }

    // Trigger analysis by incrementing trigger counter
    setAnalysisResults(null); // Clear previous results
    setAnalysisTriggered(prev => prev + 1); // Increment to trigger useEffect in map
    console.log('✅ Analysis triggered - results will be provided by map component');
  }, [stations, coverageStandard]);

  /**
   * Handle professional report generation
   */
  const handleGenerateReport = useCallback(() => {
    console.log('📋 Opening station coverage report generator');
    setShowReportGenerator(true);
  }, []);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Custom Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <StationCoverageSidebar
          stations={stations}
          coverageStandard={coverageStandard}
          jurisdictionBoundary={jurisdictionBoundary}
          onStationDataImport={handleStationDataImport}
          onCoverageStandardChange={handleCoverageStandardChange}
          onStationAdd={handleStationAdd}
          onStationEdit={handleStationEdit}
          onStationDelete={handleStationDelete}
          onBoundaryUpload={handleBoundaryUpload}
        />
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin 0.3s ease-in-out',
          marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px'
        }}
      >
        {/* Header Toolbar */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 0,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StationIcon color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Station Coverage Optimizer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enterprise coverage analysis with NFPA compliance assessment
                </Typography>
              </Box>
              {coverageStandard && (
                <Chip
                  label={coverageStandard.toUpperCase()}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Toggle Sidebar">
                <IconButton onClick={toggleSidebar}>
                  <MenuIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Run Coverage Analysis">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AnalysisIcon />}
                  onClick={handleRunCoverageAnalysis}
                  disabled={stations.length === 0}
                >
                  Analyze Coverage
                </Button>
              </Tooltip>

              <Tooltip title="Generate Professional Report">
                <IconButton
                  color="primary"
                  onClick={handleGenerateReport}
                  disabled={!analysisResults}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                  }}
                >
                  <ExportIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings">
                <IconButton onClick={() => setShowSettings(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="About Station Coverage Optimizer">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Paper>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Map and Analysis Area */}
          <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
            {stations.length === 0 ? (
              // Welcome/Getting Started Screen
              <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Welcome to Station Coverage Optimizer
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Upload station data to begin coverage analysis and optimization.
                </Typography>
                <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Getting Started:
                  </Typography>
                  <Typography variant="body2" component="div">
                    1. Use the sidebar to upload station data (CSV, Excel) or import from Data Formatter<br />
                    2. Define your jurisdiction boundary (draw or upload)<br />
                    3. Select NFPA standard (1710 for career, 1720 for volunteer departments)<br />
                    4. Run coverage analysis to identify gaps and optimization opportunities
                  </Typography>
                </Alert>
              </Paper>
            ) : (
              // Interactive Coverage Map
              <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom>
                    Interactive Coverage Map
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stations.length} stations loaded • {coverageStandard.toUpperCase()} standards
                  </Typography>
                  
                  {analysisResults && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      Coverage analysis: {analysisResults.coverageMetrics.nfpaCompliance.toFixed(1)}% NFPA compliance • 
                      {analysisResults.identifiedGaps} gaps identified • 
                      {analysisResults.recommendedStations} stations recommended
                    </Alert>
                  )}
                </Box>
                
                {/* Interactive Coverage Map Component */}
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                  <InteractiveCoverageMap
                    stations={stations}
                    jurisdictionBoundary={jurisdictionBoundary}
                    coverageStandard={coverageStandard}
                    onStationAdd={handleStationAdd}
                    onStationSelect={handleStationSelect}
                    onAnalysisUpdate={handleAnalysisUpdate}
                    analysisTriggered={analysisTriggered}
                  />
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="md" fullWidth>
        <DialogTitle>Station Coverage Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Settings panel for NFPA standards, travel speeds, response time thresholds, etc.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Professional Report Generator */}
      <StationCoverageReportGenerator
        open={showReportGenerator}
        onClose={() => setShowReportGenerator(false)}
        stations={stations}
        analysisResults={analysisResults}
        coverageStandard={coverageStandard}
        jurisdictionBoundary={jurisdictionBoundary}
      />
    </Box>
  );
};

export default StationCoverageContainer;