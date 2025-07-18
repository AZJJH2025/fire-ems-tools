import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid as MuiGrid
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';

import { RootState } from '@/state/redux/store';
import { togglePanelExpansion } from '@/state/redux/analyzerSlice';

// Create a type-safe Grid component to work around TypeScript errors
const Grid = MuiGrid;

// Import visualization components
import StatisticsSummary from '../Statistics/StatisticsSummary';
import ResponseTimeDistribution from '../TimeAnalysis/ResponseTimeDistribution';
import IncidentMap from '../GeospatialAnalysis/IncidentMap';
import IncidentTable from '../IncidentData/IncidentTable';
import AIInsightsPanel from '../AIInsightsPanel';

// Dashboard panel component
interface DashboardPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  id,
  title,
  children,
  height = 300
}) => {
  const dispatch = useDispatch();
  const { expandedPanels } = useSelector((state: RootState) => state.analyzer.ui);
  const isExpanded = expandedPanels.includes(id);
  
  // Toggle expansion state
  const handleToggleExpansion = () => {
    dispatch(togglePanelExpansion(id));
  };
  
  return (
    <Paper
      sx={{
        height: isExpanded ? 'calc(100vh - 160px)' : height,
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.3s ease',
        position: isExpanded ? 'fixed' : 'relative',
        top: isExpanded ? '70px' : 'auto',
        left: isExpanded ? '20px' : 'auto',
        right: isExpanded ? '20px' : 'auto',
        zIndex: isExpanded ? 1200 : 'auto',
        width: isExpanded ? 'calc(100% - 40px)' : '100%'
      }}
      elevation={isExpanded ? 8 : 1}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Box>
          <IconButton size="small" sx={{ mr: 1 }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleToggleExpansion}>
            {isExpanded ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ 
        p: 2, 
        overflow: 'auto', 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>{children}</Box>
    </Paper>
  );
};

// Main dashboard component
const AnalyzerDashboard: React.FC = () => {
  const { activeDashboardPanels } = useSelector((state: RootState) => state.analyzer.ui);
  
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Response Time Summary Panel */}
        {activeDashboardPanels.includes('response-time-summary') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardPanel
              id="response-time-summary"
              title="Response Time Summary"
            >
              {/* Simplified version of StatisticsSummary */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <StatisticsSummary />
              </Box>
            </DashboardPanel>
          </Grid>
        )}
        
        {/* Time Distribution Panel */}
        {activeDashboardPanels.includes('time-distribution') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardPanel
              id="time-distribution"
              title="Response Time Distribution"
            >
              {/* Simplified version of ResponseTimeDistribution */}
              <Box sx={{ minHeight: 400, overflow: 'visible' }}>
                <ResponseTimeDistribution />
              </Box>
            </DashboardPanel>
          </Grid>
        )}
        
        {/* Map Panel */}
        {activeDashboardPanels.includes('incident-map') && (
          <Grid size={{ xs: 12 }}>
            <DashboardPanel
              id="incident-map"
              title="Incident Map"
              height={400}
            >
              {/* Simplified version of IncidentMap */}
              <Box sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <IncidentMap />
              </Box>
            </DashboardPanel>
          </Grid>
        )}
        
        {/* Incident Table Panel */}
        {activeDashboardPanels.includes('incident-table') && (
          <Grid size={{ xs: 12 }}>
            <DashboardPanel
              id="incident-table"
              title="Incident Data"
              height={350}
            >
              {/* Simplified version of IncidentTable */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                <IncidentTable />
              </Box>
            </DashboardPanel>
          </Grid>
        )}
        
        {/* AI Insights Panel */}
        {activeDashboardPanels.includes('ai-insights') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <AIInsightsPanel />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyzerDashboard;