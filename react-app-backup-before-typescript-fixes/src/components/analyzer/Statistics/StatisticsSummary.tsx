import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TimerIcon from '@mui/icons-material/Timer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { RootState } from '@/state/redux/store';
import { formatResponseTime } from '@/utils/responseTimeCalculator';

// Stat card component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  secondaryValue?: string;
  secondaryLabel?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  secondaryValue,
  secondaryLabel,
  color = '#1976d2'
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}20`,
              color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            {secondaryValue && (
              <Typography variant="caption" color="text.secondary">
                {secondaryLabel}: {secondaryValue}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main component
const StatisticsSummary: React.FC = () => {
  const { responseTimeStats } = useSelector(
    (state: RootState) => state.analyzer.calculatedMetrics
  );
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  
  // If no data is available
  if (!responseTimeStats || !incidents.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Response Time Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No data available for statistical analysis. Please load incident data.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Response Time Statistics
      </Typography>
      
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Based on {incidents.length} incidents
      </Typography>
      
      {/* Key Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Total Response Time"
            value={formatResponseTime(responseTimeStats.mean.totalResponseTime)}
            icon={<AccessTimeIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.ninetiethPercentile.totalResponseTime)}
            secondaryLabel="90th percentile"
            color="#1976d2"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Dispatch Time"
            value={formatResponseTime(responseTimeStats.mean.dispatchTime)}
            icon={<SpeedIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.ninetiethPercentile.dispatchTime)}
            secondaryLabel="90th percentile"
            color="#2e7d32"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Turnout Time"
            value={formatResponseTime(responseTimeStats.mean.turnoutTime)}
            icon={<TimerIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.ninetiethPercentile.turnoutTime)}
            secondaryLabel="90th percentile"
            color="#ed6c02"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Travel Time"
            value={formatResponseTime(responseTimeStats.mean.travelTime)}
            icon={<DirectionsCarIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.ninetiethPercentile.travelTime)}
            secondaryLabel="90th percentile"
            color="#9c27b0"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Scene Time"
            value={formatResponseTime(responseTimeStats.mean.sceneTime)}
            icon={<ScheduleIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.median.sceneTime)}
            secondaryLabel="median"
            color="#d32f2f"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Total Incident Time"
            value={formatResponseTime(responseTimeStats.mean.totalIncidentTime)}
            icon={<HourglassEmptyIcon />}
            secondaryValue={formatResponseTime(responseTimeStats.median.totalIncidentTime)}
            secondaryLabel="median"
            color="#0288d1"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Detailed Statistics Table */}
      <Typography variant="h6" gutterBottom>
        Detailed Response Time Statistics
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              <TableCell align="right">Mean</TableCell>
              <TableCell align="right">Median</TableCell>
              <TableCell align="right">90th Percentile</TableCell>
              <TableCell align="right">Min</TableCell>
              <TableCell align="right">Max</TableCell>
              <TableCell align="right">Std Dev</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Dispatch Time */}
            <TableRow>
              <TableCell>Dispatch Time</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.mean.dispatchTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.median.dispatchTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.ninetiethPercentile.dispatchTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.min.dispatchTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.max.dispatchTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.standardDeviation.dispatchTime, 'seconds')}</TableCell>
            </TableRow>
            
            {/* Turnout Time */}
            <TableRow>
              <TableCell>Turnout Time</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.mean.turnoutTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.median.turnoutTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.ninetiethPercentile.turnoutTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.min.turnoutTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.max.turnoutTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.standardDeviation.turnoutTime, 'seconds')}</TableCell>
            </TableRow>
            
            {/* Travel Time */}
            <TableRow>
              <TableCell>Travel Time</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.mean.travelTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.median.travelTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.ninetiethPercentile.travelTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.min.travelTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.max.travelTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.standardDeviation.travelTime, 'seconds')}</TableCell>
            </TableRow>
            
            {/* Total Response Time */}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Total Response Time</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.mean.totalResponseTime, 'seconds')}</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.median.totalResponseTime, 'seconds')}</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.ninetiethPercentile.totalResponseTime, 'seconds')}</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.min.totalResponseTime, 'seconds')}</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.max.totalResponseTime, 'seconds')}</strong></TableCell>
              <TableCell align="right"><strong>{formatResponseTime(responseTimeStats.standardDeviation.totalResponseTime, 'seconds')}</strong></TableCell>
            </TableRow>
            
            {/* Scene Time */}
            <TableRow>
              <TableCell>Scene Time</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.mean.sceneTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.median.sceneTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.ninetiethPercentile.sceneTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.min.sceneTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.max.sceneTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.standardDeviation.sceneTime, 'seconds')}</TableCell>
            </TableRow>
            
            {/* Total Incident Time */}
            <TableRow>
              <TableCell>Total Incident Time</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.mean.totalIncidentTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.median.totalIncidentTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.ninetiethPercentile.totalIncidentTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.min.totalIncidentTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.max.totalIncidentTime, 'seconds')}</TableCell>
              <TableCell align="right">{formatResponseTime(responseTimeStats.standardDeviation.totalIncidentTime, 'seconds')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="body2" color="text.secondary">
        * All times are shown in seconds for precise comparison.
      </Typography>
    </Box>
  );
};

export default StatisticsSummary;