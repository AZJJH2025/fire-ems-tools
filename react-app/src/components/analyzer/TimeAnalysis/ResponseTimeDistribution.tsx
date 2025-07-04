import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid
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
  // Calculate height percentage based on max count with minimum visibility
  const percentage = maxCount > 0 ? Math.max(count > 0 ? 12 : 0, (count / maxCount) * 100) : 0;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 55, mx: 0.5 }}>
      <Box sx={{ height: height, display: 'flex', alignItems: 'flex-end' }}>
        <Box
          sx={{
            width: 45,
            height: `${percentage}%`,
            bgcolor: count > 0 ? color : 'rgba(0,0,0,0.1)',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            position: 'relative',
            border: `2px solid ${count > 0 ? color : 'rgba(0,0,0,0.2)'}`,
            transition: 'all 0.3s ease-in-out',
            boxShadow: count > 0 ? `0 2px 4px ${color}30` : 'none',
            '&:hover': {
              opacity: 0.85,
              transform: 'translateY(-3px)',
              boxShadow: count > 0 ? `0 6px 12px ${color}50` : '0 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }
          }}
        >
          {showValue && count > 0 && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -26,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '0.8rem',
                bgcolor: 'white',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                border: `1px solid ${color}`,
                boxShadow: `0 2px 4px ${color}30`
              }}
            >
              {count}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 2, 
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'text.primary',
          lineHeight: 1.3,
          bgcolor: 'white',
          px: 0.8,
          py: 0.4,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// Main component
const ResponseTimeDistribution: React.FC = () => {
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  
  // Define enhanced colors for different ranges with better contrast
  const colors = {
    fast: '#2E7D32',      // Darker green for better visibility
    average: '#1976D2',   // Blue for average performance  
    slow: '#F57C00',      // Orange for slower times
    verySlow: '#D32F2F'   // Red for concerning times
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
    
    // Define time buckets in seconds with improved color distribution
    const buckets = [
      { min: 0, max: 240, label: '0-4 min\n(Excellent)', color: colors.fast },
      { min: 240, max: 360, label: '4-6 min\n(Good)', color: colors.fast },
      { min: 360, max: 480, label: '6-8 min\n(Target)', color: colors.average },
      { min: 480, max: 600, label: '8-10 min\n(Fair)', color: colors.average },
      { min: 600, max: 900, label: '10-15 min\n(Slow)', color: colors.slow },
      { min: 900, max: 1200, label: '15-20 min\n(Concern)', color: colors.verySlow },
      { min: 1200, max: Infinity, label: '20+ min\n(Critical)', color: colors.verySlow }
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
        <Grid size={{ xs: 12 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: '2px solid',
              borderColor: 'primary.light'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                Response Time Frequency Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                NFPA 1710 Performance Analysis
              </Typography>
            </Box>
            
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                height: 280,
                px: 3,
                gap: 2,
                position: 'relative',
                borderLeft: '3px solid #424242',
                borderBottom: '3px solid #424242',
                ml: 6,
                mb: 6,
                mr: 3,
                bgcolor: 'rgba(248, 250, 252, 0.5)',
                borderRadius: '4px 0 0 0'
              }}
            >
              {/* Y-axis labels */}
              <Box
                sx={{
                  position: 'absolute',
                  left: -35,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  py: 1
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    color="text.primary"
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      bgcolor: 'white',
                      px: 0.5,
                      borderRadius: 0.5
                    }}
                  >
                    {Math.round((distributions.maxCount / 5) * (5 - i))}
                  </Typography>
                ))}
              </Box>
              
              {/* Y-axis title */}
              <Typography
                variant="caption"
                color="text.primary"
                sx={{
                  position: 'absolute',
                  left: -70,
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-90deg)',
                  fontWeight: 600,
                  transformOrigin: 'center',
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px'
                }}
              >
                Number of Incidents
              </Typography>
              
              {distributions.buckets.map((bucket, index) => (
                <DistributionBar
                  key={index}
                  count={bucket.count}
                  maxCount={distributions.maxCount}
                  label={bucket.label}
                  color={bucket.color}
                  height={240}
                />
              ))}
              
              {/* X-axis title */}
              <Typography
                variant="caption"
                color="text.primary"
                sx={{
                  position: 'absolute',
                  bottom: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  letterSpacing: '0.5px',
                  bgcolor: 'white',
                  px: 1,
                  borderRadius: 1
                }}
              >
                Response Time Ranges
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" color="text.primary" sx={{ textAlign: 'center', fontWeight: 500 }}>
                Distribution of <strong>{distributions.totalCount} incidents</strong> by total response time
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 0.5 }}>
                Bars show incident count in each time range • Hover for details • Performance ratings based on NFPA 1710 standards
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Time range statistics */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Response Time Compliance
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {timeRangeStats.map((stat, index) => (
                <Grid size={{ xs: 12, sm: 4 }} key={index}>
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
            
            {responseTimeStats && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Average response time: {formatResponseTime(responseTimeStats.mean.totalResponseTime)} |
                  Median: {formatResponseTime(responseTimeStats.median.totalResponseTime)} |
                  90th percentile: {formatResponseTime(responseTimeStats.ninetiethPercentile.totalResponseTime)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResponseTimeDistribution;