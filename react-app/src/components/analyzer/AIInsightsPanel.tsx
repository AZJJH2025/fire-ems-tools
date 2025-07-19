import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Lightbulb as InsightIcon,
  Assessment as MetricsIcon
} from '@mui/icons-material';
import { RootState } from '../../state/redux/store';
import useAIService, { AIAnalysisResult } from '../../hooks/useAIService';

interface AIInsightsPanelProps {
  className?: string;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ className }) => {
  const { loading, error, checkCompliance } = useAIService();
  const [insights, setInsights] = useState<AIAnalysisResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  // Get response time data from Redux store
  const responseTimeData = useSelector((state: RootState) => state.analyzer?.rawData?.incidents || []);
  const responseTimeStats = useSelector((state: RootState) => state.analyzer?.calculatedMetrics?.responseTimeStats);

  const hasData = responseTimeData.length > 0;

  useEffect(() => {
    // Auto-generate insights when data is available
    if (hasData && !insights && !loading) {
      handleGenerateInsights();
    }
  }, [hasData, insights, loading]);

  const handleGenerateInsights = async () => {
    if (!hasData || !responseTimeStats) return;

    // Use pre-calculated statistics instead of raw data
    const metrics = {
      incident_count: responseTimeData.length,
      avg_response_time: responseTimeStats.mean?.totalResponseTime ? responseTimeStats.mean.totalResponseTime / 60 : 0,
      dispatch_time_90th: responseTimeStats.ninetiethPercentile?.dispatchTime || 0,
      turnout_time_90th: responseTimeStats.ninetiethPercentile?.turnoutTime || 0,
      total_response_90th: responseTimeStats.ninetiethPercentile?.totalResponseTime || 0
    };

    const result = await checkCompliance(metrics);
    if (result) {
      setInsights(result);
      setLastAnalyzed(new Date().toLocaleString());
    }
  };

  const handleComplianceCheck = async () => {
    if (!responseTimeStats) return;

    const metrics = {
      incident_count: responseTimeData.length,
      avg_response_time: responseTimeStats.mean?.totalResponseTime ? responseTimeStats.mean.totalResponseTime / 60 : 0, // Convert to minutes
      dispatch_time_90th: responseTimeStats.ninetiethPercentile?.dispatchTime || 0,
      turnout_time_90th: responseTimeStats.ninetiethPercentile?.turnoutTime || 0,
      total_response_90th: responseTimeStats.ninetiethPercentile?.totalResponseTime || 0
    };

    const result = await checkCompliance(metrics);
    if (result) {
      setInsights(result);
      setLastAnalyzed(new Date().toLocaleString());
    }
  };

  const getNFPAComplianceColor = () => {
    if (!responseTimeStats) return 'default';
    
    const dispatchCompliant = (responseTimeStats.ninetiethPercentile?.dispatchTime || 0) <= 60;
    const turnoutCompliant = (responseTimeStats.ninetiethPercentile?.turnoutTime || 0) <= 80;
    const responseCompliant = (responseTimeStats.ninetiethPercentile?.totalResponseTime || 0) <= 300;
    
    if (dispatchCompliant && turnoutCompliant && responseCompliant) return 'success';
    if (dispatchCompliant || turnoutCompliant || responseCompliant) return 'warning';
    return 'error';
  };

  const getComplianceScore = () => {
    if (!responseTimeStats) return 0;
    
    let score = 0;
    if ((responseTimeStats.ninetiethPercentile?.dispatchTime || 0) <= 60) score += 33;
    if ((responseTimeStats.ninetiethPercentile?.turnoutTime || 0) <= 80) score += 33;
    if ((responseTimeStats.ninetiethPercentile?.totalResponseTime || 0) <= 300) score += 34;
    
    return Math.round(score);
  };

  const formatInsightText = (text: string) => {
    // Split into sections and format for better readability
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      const lines = section.split('\n');
      
      return (
        <Box key={index} sx={{ mb: 2 }}>
          {lines.map((line, lineIndex) => {
            if (line.startsWith('###')) {
              return (
                <Typography key={lineIndex} variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                  {line.replace('###', '').trim()}
                </Typography>
              );
            } else if (line.startsWith('##')) {
              return (
                <Typography key={lineIndex} variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                  {line.replace('##', '').trim()}
                </Typography>
              );
            } else if (line.startsWith('- ')) {
              return (
                <Typography key={lineIndex} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                  • {line.replace('- ', '')}
                </Typography>
              );
            } else if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <Typography key={lineIndex} variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {line.replace(/\*\*/g, '')}
                </Typography>
              );
            } else if (line.trim()) {
              return (
                <Typography key={lineIndex} variant="body2" sx={{ mb: 0.5 }}>
                  {line}
                </Typography>
              );
            }
            return null;
          })}
        </Box>
      );
    });
  };

  return (
    <Card className={className}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            AI Insights
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>

        {/* NFPA Compliance Summary */}
        {responseTimeStats && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MetricsIcon fontSize="small" />
              <Typography variant="subtitle2">NFPA 1710 Compliance</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<CheckIcon />}
                label={`${getComplianceScore()}% Compliant`}
                color={getNFPAComplianceColor()}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {responseTimeData.length} incidents analyzed
              </Typography>
            </Box>
          </Box>
        )}

        <Collapse in={expanded}>
          <Box>
            <Divider sx={{ my: 2 }} />
            
            {/* Action Buttons */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateInsights}
                  disabled={!hasData || loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <TrendingIcon />}
                  size="small"
                >
                  Generate Insights
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleComplianceCheck}
                  disabled={!responseTimeStats || loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
                  size="small"
                >
                  Check Compliance
                </Button>
              </Grid>
            </Grid>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2">Analyzing data with AI...</Typography>
              </Box>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* No Data State */}
            {!hasData && !loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Upload and analyze response time data to get AI-powered insights and recommendations.
              </Alert>
            )}

            {/* Insights Display */}
            {insights && !loading && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InsightIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2">Analysis Results</Typography>
                  <Chip 
                    label={insights.source === 'ai' ? 'AI Analysis' : 'Fallback Analysis'}
                    color={insights.source === 'ai' ? 'primary' : 'default'}
                    size="small"
                  />
                  {insights.sanitized && (
                    <Tooltip title="Data was sanitized for privacy">
                      <Chip label="Sanitized" color="info" size="small" />
                    </Tooltip>
                  )}
                </Box>

                {insights.success && insights.insight && (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 600, overflow: 'auto' }}>
                    {formatInsightText(insights.insight)}
                  </Paper>
                )}

                {!insights.success && insights.error && (
                  <Alert severity="error">
                    {insights.error}
                  </Alert>
                )}

                {lastAnalyzed && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Last analyzed: {lastAnalyzed}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;