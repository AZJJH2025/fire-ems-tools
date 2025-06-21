/**
 * Export Modal Component
 * 
 * Professional export system with 3-tab interface matching legacy functionality.
 * Includes Basic Export, Advanced Export, and Layout Designer tabs.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Tab,
  Tabs,
  Button,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';

import { 
  selectExportState, 
  selectMapState,
  closeExportModal, 
  setExportTab,
  setExportProcess
} from '@/state/redux/fireMapProSlice';
import { ExportTab } from '@/types/export';
import { ExportService } from '@/services/exportService';

// Import tab components (we'll create these next)
import BasicExportTab from './BasicExportTab';
import AdvancedExportTab from './AdvancedExportTab';
import LayoutDesignerTab from './LayoutDesignerTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ExportModal: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const exportState = useSelector(selectExportState);
  const mapState = useSelector(selectMapState);
  const { open, activeTab, configuration, process } = exportState;

  // Map string tabs to numbers for MUI Tabs component
  const tabMapping: Record<ExportTab, number> = {
    'basic': 0,
    'advanced': 1,
    'layout-designer': 2
  };

  const reverseTabMapping: Record<number, ExportTab> = {
    0: 'basic',
    1: 'advanced', 
    2: 'layout-designer'
  };

  const currentTabIndex = tabMapping[activeTab];

  const handleClose = () => {
    if (!process.isExporting) {
      dispatch(closeExportModal());
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (!process.isExporting) {
      dispatch(setExportTab(reverseTabMapping[newValue]));
    }
  };

  const handleStartExport = async () => {
    try {
      dispatch(setExportProcess({ 
        isExporting: true, 
        progress: 0, 
        currentStep: 'Preparing export...',
        error: null 
      }));

      // Get the map element
      const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
      if (!mapElement) {
        throw new Error('Map element not found');
      }

      // Sync layout elements from Redux state to configuration
      const updatedConfiguration = {
        ...configuration,
        layout: {
          ...configuration.layout,
          // Get current layout elements from Redux state
          elements: exportState.configuration.layout.elements,
          selectedElementId: exportState.configuration.layout.selectedElementId,
          customLayout: exportState.configuration.layout.customLayout
        },
        // Add map view data for scale bar calculations
        mapView: {
          center: mapState.view.center,
          zoom: mapState.view.zoom
        }
      };

      // Start export with progress callback
      await ExportService.exportMap(
        mapElement, 
        updatedConfiguration,
        (progress, step) => {
          dispatch(setExportProcess({ 
            isExporting: true, 
            progress, 
            currentStep: step,
            error: null 
          }));
        }
      );
      
      // Export completed successfully
      dispatch(setExportProcess({ 
        isExporting: false, 
        progress: 100, 
        currentStep: 'Export completed',
        success: true 
      }));

      // Close modal after short delay
      setTimeout(() => {
        dispatch(closeExportModal());
      }, 1500);
      
    } catch (error) {
      dispatch(setExportProcess({ 
        isExporting: false, 
        error: error instanceof Error ? error.message : 'Export failed',
        success: false 
      }));
    }
  };

  const getTabColor = (tabIndex: number) => {
    if (tabIndex === currentTabIndex) {
      return 'primary';
    }
    return 'inherit';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
          bgcolor: 'background.default'
        }
      }}
    >
      {/* Custom Header with Tabs */}
      <DialogTitle 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          p: 2,
          pb: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ExportIcon />
            <Typography variant="h6" component="div">
              Export Options
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            disabled={process.isExporting}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs in Header */}
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          variant="fullWidth"
          disabled={process.isExporting}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: 'white',
                fontWeight: 600
              },
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'secondary.main'
            }
          }}
        >
          <Tab label="Basic" id="export-tab-0" aria-controls="export-tabpanel-0" />
          <Tab label="Advanced" id="export-tab-1" aria-controls="export-tabpanel-1" />
          <Tab label="Layout Designer" id="export-tab-2" aria-controls="export-tabpanel-2" />
        </Tabs>
      </DialogTitle>

      {/* Tab Content */}
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <TabPanel value={currentTabIndex} index={0}>
          <BasicExportTab 
            isActive={activeTab === 'basic'}
            configuration={configuration}
            disabled={process.isExporting}
          />
        </TabPanel>
        
        <TabPanel value={currentTabIndex} index={1}>
          <AdvancedExportTab 
            isActive={activeTab === 'advanced'}
            configuration={configuration}
            disabled={process.isExporting}
          />
        </TabPanel>
        
        <TabPanel value={currentTabIndex} index={2}>
          <LayoutDesignerTab 
            isActive={activeTab === 'layout-designer'}
            configuration={configuration}
            disabled={process.isExporting}
          />
        </TabPanel>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={handleClose}
          disabled={process.isExporting}
          color="inherit"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleStartExport}
          disabled={process.isExporting}
          variant="contained"
          startIcon={process.isExporting ? null : <ExportIcon />}
          sx={{ minWidth: 120 }}
        >
          {process.isExporting ? `${process.progress}%` : 'Export Map'}
        </Button>
      </DialogActions>

      {/* Export Progress Display */}
      {process.isExporting && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 80, 
          left: 16, 
          right: 16,
          bgcolor: 'info.main',
          color: 'info.contrastText',
          p: 1,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="body2">
            {process.currentStep}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
};

export default ExportModal;