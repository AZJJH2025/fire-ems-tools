/**
 * Map Debugger Component
 * 
 * Shows debug information to help troubleshoot map loading issues.
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';

import { selectMapState, selectLayers } from '@/state/redux/fireMapProSlice';
import MapArchitectureTest from './MapArchitectureTest';
import SimpleMapTest from './SimpleMapTest';

const MapDebugger: React.FC = () => {
  const mapState = useSelector(selectMapState);
  const layers = useSelector(selectLayers);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<'architecture' | 'simple' | null>(null);

  const debugInfo = {
    mapView: mapState.view,
    activeBaseMap: mapState.activeBaseMap,
    baseMaps: mapState.baseMaps,
    layerCount: layers.length,
    visibleLayers: layers.filter(l => l.visible).length,
    totalFeatures: layers.reduce((sum, layer) => sum + layer.features.length, 0),
    visibleFeatures: layers.filter(l => l.visible).reduce((sum, layer) => sum + layer.features.length, 0)
  };

  const openTest = (testType: 'architecture' | 'simple') => {
    setCurrentTest(testType);
    setTestDialogOpen(true);
  };

  const closeTest = () => {
    setTestDialogOpen(false);
    setCurrentTest(null);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 300,
        zIndex: 1001,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon fontSize="small" />
            Map Debug Info
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Map View */}
            <Box>
              <Typography variant="caption" color="text.secondary">Map View:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                Center: {debugInfo.mapView.center.latitude.toFixed(4)}, {debugInfo.mapView.center.longitude.toFixed(4)}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                Zoom: {debugInfo.mapView.zoom}
              </Typography>
            </Box>

            {/* Base Map */}
            <Box>
              <Typography variant="caption" color="text.secondary">Base Map:</Typography>
              <Typography variant="body2">
                {debugInfo.activeBaseMap} ({debugInfo.baseMaps.length} available)
              </Typography>
            </Box>

            {/* Layers */}
            <Box>
              <Typography variant="caption" color="text.secondary">Layers:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip size="small" label={`${debugInfo.layerCount} total`} />
                <Chip size="small" label={`${debugInfo.visibleLayers} visible`} color="primary" />
              </Box>
            </Box>

            {/* Features */}
            <Box>
              <Typography variant="caption" color="text.secondary">Features:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip size="small" label={`${debugInfo.totalFeatures} total`} />
                <Chip size="small" label={`${debugInfo.visibleFeatures} visible`} color="success" />
              </Box>
            </Box>

            {/* Layer Details */}
            <Box>
              <Typography variant="caption" color="text.secondary">Layer Details:</Typography>
              {layers.map(layer => (
                <Typography key={layer.id} variant="body2" sx={{ fontSize: '0.75rem' }}>
                  • {layer.name}: {layer.features.length} features ({layer.visible ? 'visible' : 'hidden'})
                </Typography>
              ))}
            </Box>

            {/* Test Buttons */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Architecture Tests:
              </Typography>
              <Stack spacing={1}>
                <Button
                  size="small"
                  startIcon={<BugReportIcon />}
                  onClick={() => openTest('simple')}
                  variant="outlined"
                  fullWidth
                >
                  Simple Map Test
                </Button>
                <Button
                  size="small"
                  startIcon={<BugReportIcon />}
                  onClick={() => openTest('architecture')}
                  variant="outlined"
                  fullWidth
                >
                  Architecture Test
                </Button>
              </Stack>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Test Dialog */}
      <Dialog 
        open={testDialogOpen} 
        onClose={closeTest}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          {currentTest === 'simple' ? 'Simple Map Test' : 'Architecture Test'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {currentTest === 'simple' && <SimpleMapTest />}
          {currentTest === 'architecture' && <MapArchitectureTest />}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTest}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MapDebugger;