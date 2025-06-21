import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import { RootState } from '@/state/redux/store';
import { IncidentRecord } from '@/types/analyzer';
import { calculateIncidentMetrics, formatResponseTime } from '@/utils/responseTimeCalculator';

// Define color scheme for time segments
interface TimeSegmentColors {
  dispatch: string;
  turnout: string;
  travel: string;
  scene: string;
  border: string;
  text: string;
  background: string;
}

// Incident timeline component for a single incident
interface IncidentTimelineProps {
  incident: IncidentRecord;
  colors: TimeSegmentColors;
  showLabels?: boolean;
  compact?: boolean;
}

const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incident,
  colors,
  showLabels = true,
  compact = false
}) => {
  // Calculate metrics for this incident
  const metrics = useMemo(() => calculateIncidentMetrics(incident), [incident]);
  
  // Calculate total time for proportions
  const totalTime = metrics.totalIncidentTime || 0;
  
  // If we don't have any time data, show placeholder
  if (totalTime === 0) {
    return (
      <Box 
        sx={{ 
          height: compact ? 20 : 40, 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'action.hover',
          borderRadius: 1,
          px: 1
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No time data available
        </Typography>
      </Box>
    );
  }
  
  // Calculate segment proportions of the total
  const dispatchProportion = (metrics.dispatchTime || 0) / totalTime * 100;
  const turnoutProportion = (metrics.turnoutTime || 0) / totalTime * 100;
  const travelProportion = (metrics.travelTime || 0) / totalTime * 100;
  const sceneProportion = (metrics.sceneTime || 0) / totalTime * 100;
  
  return (
    <Box sx={{ mb: compact ? 0.5 : 2 }}>
      {!compact && showLabels && (
        <Typography variant="body2" gutterBottom>
          {incident.incidentId} {incident.incidentType ? `(${incident.incidentType})` : ''}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Timeline bar */}
        <Box 
          sx={{ 
            display: 'flex', 
            height: compact ? 20 : 30, 
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${colors.border}`
          }}
        >
          {/* Dispatch segment */}
          {metrics.dispatchTime && metrics.dispatchTime > 0 && (
            <Box 
              sx={{ 
                width: `${dispatchProportion}%`, 
                bgcolor: colors.dispatch,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20
              }}
            >
              {!compact && <Typography variant="caption" color={colors.text}>D</Typography>}
            </Box>
          )}
          
          {/* Turnout segment */}
          {metrics.turnoutTime && metrics.turnoutTime > 0 && (
            <Box 
              sx={{ 
                width: `${turnoutProportion}%`, 
                bgcolor: colors.turnout,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20
              }}
            >
              {!compact && <Typography variant="caption" color={colors.text}>T</Typography>}
            </Box>
          )}
          
          {/* Travel segment */}
          {metrics.travelTime && metrics.travelTime > 0 && (
            <Box 
              sx={{ 
                width: `${travelProportion}%`, 
                bgcolor: colors.travel,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20
              }}
            >
              {!compact && <Typography variant="caption" color={colors.text}>R</Typography>}
            </Box>
          )}
          
          {/* Scene segment */}
          {metrics.sceneTime && metrics.sceneTime > 0 && (
            <Box 
              sx={{ 
                width: `${sceneProportion}%`, 
                bgcolor: colors.scene,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 20
              }}
            >
              {!compact && <Typography variant="caption" color={colors.text}>S</Typography>}
            </Box>
          )}
        </Box>
        
        {/* Time labels */}
        {!compact && showLabels && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatResponseTime(metrics.dispatchTime, 'seconds')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatResponseTime(metrics.turnoutTime, 'seconds')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatResponseTime(metrics.travelTime, 'seconds')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatResponseTime(metrics.sceneTime, 'seconds')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Time legend component
const TimeLegend: React.FC<{ colors: TimeSegmentColors }> = ({ colors }) => (
  <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: 20, 
          height: 20, 
          bgcolor: colors.dispatch, 
          mr: 1, 
          borderRadius: 0.5,
          border: `1px solid ${colors.border}`
        }} 
      />
      <Typography variant="caption">Dispatch Time</Typography>
    </Box>
    
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: 20, 
          height: 20, 
          bgcolor: colors.turnout, 
          mr: 1, 
          borderRadius: 0.5,
          border: `1px solid ${colors.border}`
        }} 
      />
      <Typography variant="caption">Turnout Time</Typography>
    </Box>
    
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: 20, 
          height: 20, 
          bgcolor: colors.travel, 
          mr: 1, 
          borderRadius: 0.5,
          border: `1px solid ${colors.border}`
        }} 
      />
      <Typography variant="caption">Travel Time</Typography>
    </Box>
    
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: 20, 
          height: 20, 
          bgcolor: colors.scene, 
          mr: 1, 
          borderRadius: 0.5,
          border: `1px solid ${colors.border}`
        }} 
      />
      <Typography variant="caption">Scene Time</Typography>
    </Box>
  </Box>
);

// Main component
const TimelineVisualization: React.FC = () => {
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  const selectedIncidentId = useSelector((state: RootState) => state.analyzer.ui.selectedIncidentId);
  const theme = useTheme();
  
  // Define colors based on theme
  const colors: TimeSegmentColors = {
    dispatch: theme.palette.info.light,
    turnout: theme.palette.warning.light,
    travel: theme.palette.error.light,
    scene: theme.palette.success.light,
    border: theme.palette.divider,
    text: theme.palette.getContrastText(theme.palette.primary.main),
    background: theme.palette.background.paper
  };
  
  // Get selected incident if any
  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return incidents.find(inc => inc.incidentId === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);
  
  // Get most recent incidents for display
  const recentIncidents = useMemo(() => {
    // Sort by date (most recent first) and take first 10
    return [...incidents]
      .sort((a, b) => {
        const dateA = new Date(a.incidentDate);
        const dateB = new Date(b.incidentDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  }, [incidents]);
  
  // If no data
  if (!incidents.length || !responseTimeStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Response Time Timeline
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No incident data available for timeline visualization.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Response Time Timeline
      </Typography>
      
      <TimeLegend colors={colors} />
      
      <Grid container spacing={3}>
        {/* Selected incident details */}
        {selectedIncident && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Incident: {selectedIncident.incidentId}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedIncident.incidentDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedIncident.incidentTime || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedIncident.incidentType || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Unit
                    </Typography>
                    <Typography variant="body1">
                      {selectedIncident.respondingUnit || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Response Timeline
              </Typography>
              
              <IncidentTimeline 
                incident={selectedIncident} 
                colors={colors} 
                showLabels={true}
              />
              
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Dispatch Time
                    </Typography>
                    <Typography variant="body1">
                      {formatResponseTime(calculateIncidentMetrics(selectedIncident).dispatchTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Turnout Time
                    </Typography>
                    <Typography variant="body1">
                      {formatResponseTime(calculateIncidentMetrics(selectedIncident).turnoutTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Travel Time
                    </Typography>
                    <Typography variant="body1">
                      {formatResponseTime(calculateIncidentMetrics(selectedIncident).travelTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Response Time
                    </Typography>
                    <Typography variant="body1">
                      {formatResponseTime(calculateIncidentMetrics(selectedIncident).totalResponseTime)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Recent incidents list */}
        <Grid item xs={12} md={selectedIncident ? 12 : 6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Incidents Timeline
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {recentIncidents.map(incident => (
                <IncidentTimeline 
                  key={incident.incidentId}
                  incident={incident} 
                  colors={colors} 
                  showLabels={true}
                  compact={false}
                />
              ))}
              
              {recentIncidents.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No recent incidents to display.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Average times comparison */}
        {!selectedIncident && (
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Average Response Time Breakdown
              </Typography>
              
              <Box sx={{ p: 2, mt: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Average time breakdown:
                </Typography>
                
                <Box sx={{ display: 'flex', height: 40, borderRadius: 1, overflow: 'hidden', mt: 1 }}>
                  {/* Dispatch segment */}
                  <Box 
                    sx={{ 
                      width: `${(responseTimeStats.mean.dispatchTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100}%`, 
                      bgcolor: colors.dispatch,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20
                    }}
                  >
                    <Typography variant="caption" color={colors.text}>
                      {Math.round((responseTimeStats.mean.dispatchTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100)}%
                    </Typography>
                  </Box>
                  
                  {/* Turnout segment */}
                  <Box 
                    sx={{ 
                      width: `${(responseTimeStats.mean.turnoutTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100}%`, 
                      bgcolor: colors.turnout,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20
                    }}
                  >
                    <Typography variant="caption" color={colors.text}>
                      {Math.round((responseTimeStats.mean.turnoutTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100)}%
                    </Typography>
                  </Box>
                  
                  {/* Travel segment */}
                  <Box 
                    sx={{ 
                      width: `${(responseTimeStats.mean.travelTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100}%`, 
                      bgcolor: colors.travel,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20
                    }}
                  >
                    <Typography variant="caption" color={colors.text}>
                      {Math.round((responseTimeStats.mean.travelTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100)}%
                    </Typography>
                  </Box>
                  
                  {/* Scene segment */}
                  <Box 
                    sx={{ 
                      width: `${(responseTimeStats.mean.sceneTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100}%`, 
                      bgcolor: colors.scene,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20
                    }}
                  >
                    <Typography variant="caption" color={colors.text}>
                      {Math.round((responseTimeStats.mean.sceneTime || 0) / (responseTimeStats.mean.totalIncidentTime || 1) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Dispatch
                      </Typography>
                      <Typography variant="body1">
                        {formatResponseTime(responseTimeStats.mean.dispatchTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Turnout
                      </Typography>
                      <Typography variant="body1">
                        {formatResponseTime(responseTimeStats.mean.turnoutTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Travel
                      </Typography>
                      <Typography variant="body1">
                        {formatResponseTime(responseTimeStats.mean.travelTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Total
                      </Typography>
                      <Typography variant="body1">
                        {formatResponseTime(responseTimeStats.mean.totalResponseTime)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TimelineVisualization;