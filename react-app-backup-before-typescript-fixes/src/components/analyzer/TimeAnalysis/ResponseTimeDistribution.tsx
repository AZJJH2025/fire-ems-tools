import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import { RootState } from '@/state/redux/store';
import { calculateIncidentMetrics, formatResponseTime } from '@/utils/responseTimeCalculator';

interface DistributionBarProps {
  count: number;
  maxCount: number;
  label: string;
  color: string;
  height?: number;
  showValue?: boolean;
}

// Component for a single bar in the distribution chart
const DistributionBar: React.FC<DistributionBarProps> = ({
  count,
  maxCount,
  label,
  color,
  height = 150,
  showValue = true
}) => {
  // Calculate height percentage based on max count
  const percentage = maxCount > 0 ? Math.max(5, (count / maxCount) * 100) : 0;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ height: height, display: 'flex', alignItems: 'flex-end' }}>
        <Box
          sx={{
            width: 30,
            height: `${percentage}%`,
            bgcolor: color,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            position: 'relative',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          {showValue && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {count}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  );
};

// Main component
const ResponseTimeDistribution: React.FC = () => {
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  const theme = useTheme();
  
  // Define colors for different ranges
  const colors = {
    fast: theme.palette.success.main,
    average: theme.palette.info.main,
    slow: theme.palette.warning.main,
    verySlow: theme.palette.error.main
  };
  
  // Calculate response time distributions for all incidents
  const distributions = useMemo(() => {
    if (!incidents.length || !responseTimeStats) return null;
    
    // Calculate metrics for each incident
    const allMetrics = incidents.map(calculateIncidentMetrics);
    
    // Extract total response times
    const responseTimes = allMetrics
      .map(m => m.totalResponseTime)
      .filter((time): time is number => time !== null);
    
    if (!responseTimes.length) return null;
    
    // Define time buckets in seconds
    const buckets = [
      { min: 0, max: 240, label: '0-4 min', color: colors.fast },
      { min: 240, max: 360, label: '4-6 min', color: colors.fast },
      { min: 360, max: 480, label: '6-8 min', color: colors.average },
      { min: 480, max: 600, label: '8-10 min', color: colors.average },
      { min: 600, max: 900, label: '10-15 min', color: colors.slow },
      { min: 900, max: 1200, label: '15-20 min', color: colors.slow },
      { min: 1200, max: Infinity, label: '20+ min', color: colors.verySlow }
    ];
    
    // Count incidents in each bucket
    const bucketCounts = buckets.map(bucket => {
      const count = responseTimes.filter(
        time => time >= bucket.min && time < bucket.max
      ).length;
      
      return {
        ...bucket,
        count
      };
    });
    
    // Find max count for scaling
    const maxCount = Math.max(...bucketCounts.map(b => b.count));
    
    return {
      buckets: bucketCounts,
      maxCount,
      totalCount: responseTimes.length
    };
  }, [incidents, responseTimeStats, colors]);
  
  // Calculate time range statistics
  const timeRangeStats = useMemo(() => {
    if (!incidents.length || !responseTimeStats) return null;
    
    // Calculate metrics for each incident
    const allMetrics = incidents.map(calculateIncidentMetrics);
    
    // Extract total response times
    const responseTimes = allMetrics
      .map(m => m.totalResponseTime)
      .filter((time): time is number => time !== null);
    
    if (!responseTimes.length) return null;
    
    // Define time ranges (in seconds) and count incidents in each range
    const ranges = [
      { max: 240, label: 'Under 4 min', color: colors.fast },
      { max: 480, label: 'Under 8 min', color: colors.average },
      { max: 600, label: 'Under 10 min', color: colors.average }
    ];
    
    return ranges.map(range => {
      const count = responseTimes.filter(time => time <= range.max).length;
      const percentage = (count / responseTimes.length) * 100;
      
      return {
        ...range,
        count,
        percentage: Math.round(percentage)
      };
    });
  }, [incidents, responseTimeStats, colors]);
  
  // If no data
  if (!distributions || !timeRangeStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Response Time Distribution
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No incident data available for distribution analysis.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Response Time Distribution
      </Typography>
      
      <Grid container spacing={3}>
        {/* Distribution chart */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Response Time Frequency
            </Typography>
            
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: 200,
                px: 2
              }}
            >
              {distributions.buckets.map((bucket, index) => (
                <DistributionBar
                  key={index}
                  count={bucket.count}
                  maxCount={distributions.maxCount}
                  label={bucket.label}
                  color={bucket.color}
                />
              ))}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Distribution of {distributions.totalCount} incidents by total response time
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Time range statistics */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Response Time Compliance
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {timeRangeStats.map((stat, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box
                    sx={{
                      bgcolor: 'background.default',
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${stat.color}`,
                      height: '100%'
                    }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ color: stat.color, fontWeight: 'bold' }}
                    >
                      {stat.percentage}%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.count} of {distributions.totalCount} incidents
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Average response time: {formatResponseTime(responseTimeStats.mean.totalResponseTime)} |
                Median: {formatResponseTime(responseTimeStats.median.totalResponseTime)} |
                90th percentile: {formatResponseTime(responseTimeStats.ninetiethPercentile.totalResponseTime)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResponseTimeDistribution;