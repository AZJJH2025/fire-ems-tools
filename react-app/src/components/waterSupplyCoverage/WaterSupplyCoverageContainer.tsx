/**
 * Tank Zone Coverage Tool Container
 * 
 * Provides rural water supply analysis and tank placement optimization
 * for fire departments. Leverages Fire Map Pro's architecture with
 * tank-specific functionality.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// FORCE DEPLOYMENT CACHE INVALIDATION - HYDRANT FIX - JULY 13, 2025 02:15
console.log('🚨 HYDRANT DATA STRUCTURE FIXED - 2025-07-13T02:15:00Z - FORCING BUNDLE REFRESH');
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  LocalFireDepartment as TankIcon
} from '@mui/icons-material';

import {
  selectTanks,
  selectHydrants,
  selectAllSupplies,
  selectCoverageZones,
  selectActiveAnalysis,
  selectUIState,
  selectIsLoading,
  selectError,
  setSidebarTab,
  clearError,
  setLoading,
  addTank,
  addHydrant
} from '../../state/redux/waterSupplyCoverageSlice';

// Import Fire Map Pro components for reuse
import A11yProvider from '../fireMapPro/A11yProvider';

// Import Water Supply Coverage specific components
import WaterSupplySidebar from './TankSidebar';
import TankMapContainer from './TankMapContainer';
import WaterSupplyReportGenerator from './WaterSupplyReportGenerator';
import { TankZoneCoverageProps } from '../../types/tankZoneCoverage';

const SIDEBAR_WIDTH = 320;

const WaterSupplyCoverageContainer: React.FC<TankZoneCoverageProps> = ({
  initialTanks = [],
  initialAnalysisParams,
  onAnalysisComplete,
  onTankUpdate,
  mode = 'analysis'
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const tanks = useSelector(selectTanks);
  const hydrants = useSelector(selectHydrants);
  const allSupplies = useSelector(selectAllSupplies);
  const coverageZones = useSelector(selectCoverageZones);
  const activeAnalysis = useSelector(selectActiveAnalysis);
  const uiState = useSelector(selectUIState);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  
  // UI state for sidebar management (leveraging Fire Map Pro pattern)
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [fullscreen, setFullscreen] = React.useState(false);
  
  // Set browser tab title
  useEffect(() => {
    document.title = 'FireEMS Water Supply Coverage Analysis';
  }, []);
  
  // Initialize with any provided data
  useEffect(() => {
    if (initialTanks.length > 0) {
      // TODO: Dispatch action to load initial tanks
      console.log('Loading initial tanks:', initialTanks);
    }
    
    if (initialAnalysisParams) {
      // TODO: Dispatch action to update analysis parameters
      console.log('Loading initial analysis parameters:', initialAnalysisParams);
    }
  }, [initialTanks, initialAnalysisParams]);

  // Handle analysis completion callback
  useEffect(() => {
    if (activeAnalysis && onAnalysisComplete) {
      onAnalysisComplete(activeAnalysis);
    }
  }, [activeAnalysis, onAnalysisComplete]);

  // Import data from Data Formatter via sessionStorage
  useEffect(() => {
    const checkForImportedData = () => {
      try {
        const exportedData = sessionStorage.getItem('fireEmsExportedData');
        if (exportedData) {
          const data = JSON.parse(exportedData);
          console.log('🔥 WATER SUPPLY COVERAGE - Checking imported data:', data);
          
          if (data.toolId === 'water-supply-coverage' && data.data && data.data.length > 0) {
            console.log('🔥 WATER SUPPLY COVERAGE - Processing imported data:', data.data.length, 'records');
            
            // Process each record and determine if it's a tank or hydrant
            data.data.forEach((record: any, index: number) => {
              console.log(`🔥 Processing record ${index + 1}:`, record);
              
              // Check for required location fields
              const lat = record.latitude || record.lat;
              const lng = record.longitude || record.lng || record.lon;
              
              if (lat && lng) {
                // Determine if it's a tank or hydrant based on available data
                // Default to hydrant if no clear indicator
                const isHydrant = record.type?.toLowerCase().includes('hydrant') || 
                                 record.infrastructure_type?.toLowerCase().includes('hydrant') ||
                                 !record.capacity; // If no capacity, assume it's a hydrant
                
                if (isHydrant) {
                  const hydrant = {
                    name: record.address || record.name || `Hydrant ${index + 1}`,
                    location: {
                      latitude: parseFloat(lat),
                      longitude: parseFloat(lng)
                    },
                    flowRate: record.gpm || record.flow_rate || 1000, // Default 1000 GPM
                    staticPressure: record.staticPressure || record.static_pressure || 50, // Default 50 PSI
                    residualPressure: record.residualPressure || record.residual_pressure || 20, // Default 20 PSI
                    type: (record.hydrant_type as any) || 'municipal',
                    size: (record.size as any) || '4-inch',
                    operationalStatus: (record.status as any) || 'active',
                    owner: record.owner || 'Municipal',
                    contactInfo: record.contact || '',
                    notes: record.notes || ''
                  };
                  console.log('🔥 Adding hydrant:', hydrant);
                  dispatch(addHydrant(hydrant));
                } else {
                  const tank = {
                    name: record.address || record.name || `Tank ${index + 1}`,
                    location: {
                      latitude: parseFloat(lat),
                      longitude: parseFloat(lng)
                    },
                    capacity: parseInt(record.capacity) || parseInt(record.gallons) || 10000, // Default 10,000 gallons
                    type: (record.tank_type as any) || 'municipal',
                    accessRating: (record.access_rating as any) || 'good',
                    operationalStatus: (record.status as any) || 'active',
                    owner: record.owner || 'Municipal',
                    contactInfo: record.contact || '',
                    notes: record.notes || ''
                  };
                  console.log('🔥 Adding tank:', tank);
                  dispatch(addTank(tank));
                }
              } else {
                console.warn(`🔥 Skipping record ${index + 1} - missing latitude/longitude:`, record);
              }
            });
            
            // Clear the imported data after processing
            sessionStorage.removeItem('fireEmsExportedData');
            console.log('🔥 WATER SUPPLY COVERAGE - Data import complete, cleared sessionStorage');
          }
        }
      } catch (error) {
        console.error('🔥 WATER SUPPLY COVERAGE - Error importing data:', error);
      }
    };
    
    // Check for data on component mount
    checkForImportedData();
  }, [dispatch]);

  // Handlers
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
    
    if (!fullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSave = () => {
    // Save current tank configuration and analysis
    const tankData = {
      tanks,
      coverageZones,
      activeAnalysis,
      timestamp: new Date()
    };
    
    localStorage.setItem('tankZoneCoverage_autosave', JSON.stringify(tankData));
    console.log('Tank zone coverage data saved');
  };

  const [showReportGenerator, setShowReportGenerator] = React.useState(false);

  // Debug current state
  useEffect(() => {
    console.log('🔥🔥🔥 COMPONENT STATE UPDATE - Export button state:', {
      tanksCount: tanks.length,
      hydrantsCount: hydrants.length,
      isDisabled: tanks.length === 0 && hydrants.length === 0,
      showReportGenerator: showReportGenerator
    });
  }, [tanks.length, hydrants.length, showReportGenerator]);

  const handleExport = () => {
    console.log('🔥🔥🔥 EXPORT FUNCTION CALLED - ENTRY POINT');
    console.log('🔥 EXPORT BUTTON CLICKED - Starting export process');
    
    // Open professional report generator
    const hasData = tanks.length > 0 || hydrants.length > 0;
    
    console.log('🔥 EXPORT DATA CHECK:', {
      tanksCount: tanks.length,
      hydrantsCount: hydrants.length,
      hasData: hasData
    });
    
    if (!hasData) {
      console.log('🔥 NO DATA - Showing alert');
      alert('No water supply data to export. Please add tanks or hydrants first.');
      return;
    }

    console.log('🔥 OPENING REPORT GENERATOR - Setting state');
    // Open the professional report generator
    setShowReportGenerator(true);
    
    console.log('📊 Opening professional water supply report generator:', {
      tanks: tanks.length,
      hydrants: hydrants.length,
      hasAnalysis: !!activeAnalysis,
      showReportGenerator: true
    });
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  // Calculate map container styles - fixed for proper sidebar positioning
  const mapContainerStyle = {
    marginLeft: !isMobile && sidebarOpen ? 0 : 0, // Let flexbox handle positioning
    width: '100%', // Let flexbox calculate width
    height: fullscreen ? '100vh' : 'calc(100vh - 64px)',
    marginTop: fullscreen ? 0 : '64px', // Account for app bar height
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };

  return (
    <A11yProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
          position: fullscreen ? 'fixed' : 'relative',
          top: fullscreen ? 0 : 'auto',
          left: fullscreen ? 0 : 'auto',
          right: fullscreen ? 0 : 'auto',
          bottom: fullscreen ? 0 : 'auto',
          zIndex: fullscreen ? 1300 : 'auto',
        }}
        role="main"
        aria-label="Tank Zone Coverage Analysis Tool"
      >
        {/* App Bar */}
        {!fullscreen && (
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'primary.main',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="toggle sidebar"
                onClick={handleToggleSidebar}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <TankIcon sx={{ mr: 1 }} />
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                Water Supply Coverage Analysis
                {mode === 'planning' && ' - Planning Mode'}
                {mode === 'presentation' && ' - Presentation Mode'}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={handleSave}
                  title="Save Analysis"
                >
                  <SaveIcon />
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={(e) => {
                    console.log('🔥🔥🔥 EXPORT BUTTON CLICKED - Raw event:', e);
                    console.log('🔥🔥🔥 Button disabled state:', tanks.length === 0 && hydrants.length === 0);
                    console.log('🔥🔥🔥 Tank count:', tanks.length, 'Hydrant count:', hydrants.length);
                    handleExport();
                  }}
                  title="Generate Professional Report"
                  disabled={tanks.length === 0 && hydrants.length === 0}
                >
                  <ExportIcon />
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={handleToggleFullscreen}
                  title="Toggle Fullscreen"
                >
                  {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={sidebarOpen}
          onClose={handleToggleSidebar}
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              marginTop: fullscreen ? 0 : '56px', // Match main content margin
              height: fullscreen ? '100vh' : 'calc(100vh - 56px)', // Match main content height
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          ModalProps={{
            keepMounted: true,
            disablePortal: false,
            hideBackdrop: !isMobile,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
          }}
          PaperProps={{
            'aria-hidden': false,
            role: 'complementary',
            'aria-label': 'Tank Zone Coverage Tools',
          }}
        >
          <WaterSupplySidebar mode={mode} />
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            position: 'relative',
            marginLeft: !isMobile && sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
            width: !isMobile && sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
            marginTop: fullscreen ? 0 : '56px', // Reduced gap from 64px to 56px
            height: fullscreen ? '100vh' : 'calc(100vh - 56px)', // Adjusted height accordingly
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Map Container - Reusing Fire Map Pro's MapContainer */}
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              width: '100%',
              borderRadius: 0,
              overflow: 'hidden',
              position: 'relative',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              // CSS fixes for Leaflet tile rendering
              '& .leaflet-container': {
                background: 'transparent !important',
                outline: 'none'
              },
              '& .leaflet-tile-pane': {
                opacity: '1 !important',
                visibility: 'visible !important'
              },
              '& .leaflet-tile': {
                opacity: '1 !important',
                visibility: 'visible !important',
                display: 'block !important',
                imageRendering: 'auto',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              },
              '& .leaflet-layer': {
                opacity: '1 !important',
                visibility: 'visible !important'
              }
            }}
          >
            {/* Tank-specific Map Container with interactive tank placement */}
            <TankMapContainer sidebarOpen={sidebarOpen} isMobile={isMobile} />
          </Paper>

          {/* Loading Overlay */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <Typography variant="h6">Analyzing Tank Coverage...</Typography>
            </Box>
          )}
        </Box>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Professional Report Generator */}
        <WaterSupplyReportGenerator
          open={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
        />
      </Box>
    </A11yProvider>
  );
};

export default WaterSupplyCoverageContainer;