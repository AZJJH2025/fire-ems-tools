/**
 * Fire Map Pro Container Component
 * 
 * Main container for the Fire Map Pro application that orchestrates
 * all map functionality including layers, drawing tools, and export features.
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  BugReport as TestIcon
} from '@mui/icons-material';

import {
  selectMapState,
  selectUIState,
  selectCanUndo,
  selectCanRedo,
  toggleSidebar,
  toggleFullscreen,
  setError,
  undo,
  redo,
  loadMapState,
  importIncidentData,
  openExportModal
} from '@/state/redux/fireMapProSlice';

import { defaultMapLayers } from '@/data/fireMapData';
import { DataTransformer } from '@/services/integration/dataTransformer';

// Import child components
import MapContainer from './Map/MapContainer';
import Sidebar from './Sidebar/Sidebar';
import WelcomeDialog from './Dialogs/WelcomeDialog';
import ExportModal from './Export/ExportModal';
import SimpleMapTest from './Map/SimpleMapTest';
import { FireMapProContainerProps } from '@/types/fireMapPro';
import A11yProvider from './A11yProvider';

const SIDEBAR_WIDTH = 320;

const FireMapProContainer: React.FC<FireMapProContainerProps> = ({
  initialMapState,
  mode = 'create',
  onSave,
  onExport
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Set browser tab title for Fire Map Pro
  useEffect(() => {
    document.title = 'FireEMS Fire Map Pro';
  }, []);
  
  const mapState = useSelector(selectMapState);
  const uiState = useSelector(selectUIState);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Test mode for debugging
  const [testMode, setTestMode] = React.useState(false);

  // Initialize map state and load default data - run only once
  useEffect(() => {
    if (initialMapState) {
      console.log('Loading initial map state:', initialMapState);
      dispatch(loadMapState({ ...mapState, ...initialMapState }));
    } else {
      // Load default fire/EMS data for immediate value
      console.log('Loading default fire/EMS data:', defaultMapLayers);
      const defaultMapState = {
        view: {
          center: { latitude: 39.8283, longitude: -98.5795 },
          zoom: 6
        },
        layers: defaultMapLayers,
        baseMaps: mapState.baseMaps,
        activeBaseMap: mapState.activeBaseMap,
        selectedFeatures: [],
        drawingMode: null,
        drawingOptions: mapState.drawingOptions,
        exportConfig: mapState.exportConfig,
        measurementUnits: mapState.measurementUnits,
        showCoordinates: mapState.showCoordinates,
        showGrid: mapState.showGrid
      };
      dispatch(loadMapState(defaultMapState));
    }
  }, []); // Empty dependency array - run only once

  // Check for imported data from Data Formatter
  useEffect(() => {
    const checkForImportedData = () => {
      try {
        const exportedData = sessionStorage.getItem('fireEmsExportedData');
        if (exportedData) {
          const parsedData = JSON.parse(exportedData);
          console.log('Found exported data for Fire Map Pro:', parsedData);

          // Check if this data is intended for Fire Map Pro
          if (parsedData.toolId === 'fire-map-pro' && parsedData.data && parsedData.data.length > 0) {
            console.log('🔧 FIRE MAP PRO - Processing exported data:', {
              toolId: parsedData.toolId,
              dataLength: parsedData.data.length,
              sampleDataItem: parsedData.data[0]
            });

            // Check if the data is already transformed features (from Data Formatter upfront transformation)
            const isAlreadyTransformed = parsedData.data[0] && 
              typeof parsedData.data[0] === 'object' && 
              parsedData.data[0].hasOwnProperty('type') && 
              parsedData.data[0].hasOwnProperty('coordinates');

            if (isAlreadyTransformed) {
              console.log('✅ FIRE MAP PRO - Data is already transformed features, using directly');
              
              // Data is already transformed features from Data Formatter
              const features = parsedData.data;
              const layer = {
                id: 'imported-incidents',
                name: `Imported Incidents (${features.length})`,
                visible: true,
                opacity: 1,
                zIndex: 1000,
                type: 'feature' as const,
                features,
                style: {
                  defaultStyle: {
                    color: '#dc2626',
                    fillColor: '#dc2626',
                    fillOpacity: 0.7,
                    weight: 2,
                    opacity: 1
                  }
                },
                metadata: {
                  description: `Incident data imported from Data Formatter - ${features.length} incidents`,
                  source: 'Data Formatter',
                  created: new Date(),
                  featureCount: features.length
                }
              };

              console.log('Importing pre-transformed incident data to Fire Map Pro:', {
                layerName: layer.name,
                featureCount: features.length
              });

              // Import the data into Fire Map Pro
              dispatch(importIncidentData({ layer, features }));

              // Clear the session storage data to prevent re-importing
              sessionStorage.removeItem('fireEmsExportedData');

            } else {
              console.log('🔧 FIRE MAP PRO - Data is raw incident data, transforming...');
              
              // Data is raw incident data, transform it
              const transformResult = DataTransformer.transformToFireMapPro(parsedData.data);

              if (transformResult.success && transformResult.data) {
                console.log('Importing incident data to Fire Map Pro:', {
                  layerName: transformResult.data.layer.name,
                  featureCount: transformResult.data.features.length,
                  errors: transformResult.errors,
                  warnings: transformResult.warnings
                });

                // Import the data into Fire Map Pro
                dispatch(importIncidentData(transformResult.data));

                // Show success message if there are any warnings or errors
                if (transformResult.errors.length > 0 || transformResult.warnings.length > 0) {
                  const message = [
                    `Successfully imported ${transformResult.metadata.successfulRecords} of ${transformResult.metadata.totalRecords} incidents.`,
                    transformResult.errors.length > 0 ? `${transformResult.errors.length} errors encountered.` : '',
                    transformResult.warnings.length > 0 ? `${transformResult.warnings.length} warnings.` : ''
                  ].filter(Boolean).join(' ');

                  dispatch(setError(message));
                }

                // Clear the session storage data to prevent re-importing
                sessionStorage.removeItem('fireEmsExportedData');
              } else {
                console.error('Failed to transform incident data:', transformResult.errors);
                dispatch(setError(`Failed to import incident data: ${transformResult.errors.join(', ')}`));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking for imported data:', error);
        dispatch(setError('Error importing data from Data Formatter'));
      }
    };

    // Check immediately and also after a short delay to ensure component is fully mounted
    checkForImportedData();
    const timeoutId = setTimeout(checkForImportedData, 1000);

    return () => clearTimeout(timeoutId);
  }, [dispatch]); // Depend on dispatch to avoid stale closures

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            if (event.shiftKey) {
              if (canRedo) dispatch(redo());
            } else {
              if (canUndo) dispatch(undo());
            }
            break;
          case 'y':
            event.preventDefault();
            if (canRedo) dispatch(redo());
            break;
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'e':
            event.preventDefault();
            handleExport();
            break;
        }
      }

      // ESC key handling
      if (event.key === 'Escape') {
        // Close dialogs, exit drawing mode, etc.
        if (mapState.drawingMode) {
          // Exit drawing mode logic
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canUndo, canRedo, mapState.drawingMode, dispatch]);

  // Handlers
  const handleSave = () => {
    if (onSave) {
      onSave(mapState);
    } else {
      // Default save behavior - could save to localStorage or trigger API call
      localStorage.setItem('fireMapPro_autosave', JSON.stringify(mapState));
      // Show success message
      console.log('Map saved to local storage');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(mapState.exportConfig);
    } else {
      // Open the export modal
      dispatch(openExportModal());
    }
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleToggleFullscreen = () => {
    dispatch(toggleFullscreen());
    
    if (!uiState.fullscreen) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleCloseError = () => {
    dispatch(setError(null));
  };

  // Calculate map container styles based on sidebar state
  const mapContainerStyle = {
    marginLeft: !isMobile && uiState.sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
    width: !isMobile && uiState.sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
    height: uiState.fullscreen ? '100vh' : 'calc(100vh - 64px)', // Account for app bar
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };

  // Render test component if in test mode
  if (testMode) {
    return (
      <div>
        <button 
          onClick={() => setTestMode(false)}
          style={{ position: 'fixed', top: 10, right: 10, zIndex: 10001, padding: '10px', background: 'red', color: 'white' }}
        >
          Exit Test Mode
        </button>
        <SimpleMapTest />
      </div>
    );
  }

  return (
    <A11yProvider>
      <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
        position: uiState.fullscreen ? 'fixed' : 'relative',
        top: uiState.fullscreen ? 0 : 'auto',
        left: uiState.fullscreen ? 0 : 'auto',
        right: uiState.fullscreen ? 0 : 'auto',
        bottom: uiState.fullscreen ? 0 : 'auto',
        zIndex: uiState.fullscreen ? 1300 : 'auto',
      }}
      role="main"
      aria-label="Fire Map Pro Application"
    >
      {/* App Bar */}
      {!uiState.fullscreen && (
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
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Fire Map Pro {mode === 'edit' ? '- Editing' : mode === 'view' ? '- View Only' : ''}
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <UndoIcon />
              </IconButton>
              
              <IconButton
                color="inherit"
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <RedoIcon />
              </IconButton>

              <IconButton
                color="inherit"
                onClick={() => setTestMode(true)}
                title="Debug Test Mode"
                sx={{ color: 'orange' }}
              >
                <TestIcon />
              </IconButton>

              {mode !== 'view' && (
                <IconButton
                  color="inherit"
                  onClick={handleSave}
                  title="Save (Ctrl+S)"
                >
                  <SaveIcon />
                </IconButton>
              )}

              <IconButton
                color="inherit"
                onClick={handleExport}
                title="Export (Ctrl+E)"
              >
                <ExportIcon />
              </IconButton>

              <IconButton
                color="inherit"
                onClick={handleToggleFullscreen}
                title="Toggle Fullscreen"
              >
                {uiState.fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={uiState.sidebarOpen}
        onClose={handleToggleSidebar}
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            marginTop: uiState.fullscreen ? 0 : '64px',
            height: uiState.fullscreen ? '100vh' : 'calc(100vh - 64px)',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        ModalProps={{
          keepMounted: true, // Better mobile performance
          disablePortal: false, // Keep portal behavior for proper stacking
          hideBackdrop: !isMobile, // Only show backdrop on mobile
          disableAutoFocus: true, // Prevent automatic focus management
          disableEnforceFocus: true, // Allow focus to move outside the modal
          disableRestoreFocus: true, // Don't restore focus when closing
        }}
        PaperProps={{
          'aria-hidden': false, // Ensure drawer content is accessible
          role: 'complementary', // Semantic role for sidebar
          'aria-label': 'Fire Map Pro Tools',
        }}
      >
        <Sidebar mode={mode} />
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          position: 'relative',
          ...mapContainerStyle,
        }}
      >
        {/* Map Container */}
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
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden'
            },
            '& .leaflet-layer': {
              opacity: '1 !important',
              visibility: 'visible !important'
            }
          }}
        >
          <MapContainer />
        </Paper>

        {/* Loading Overlay */}
        {uiState.isLoading && (
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
            <Typography variant="h6">Loading...</Typography>
          </Box>
        )}
      </Box>

      {/* Welcome Dialog */}
      {uiState.showWelcome && <WelcomeDialog />}

      {/* Export Modal */}
      <ExportModal />

      {/* Error Snackbar */}
      <Snackbar
        open={!!uiState.error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {uiState.error}
        </Alert>
      </Snackbar>
    </Box>
    </A11yProvider>
  );
};

export default FireMapProContainer;