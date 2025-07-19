/**
 * AI Data Quality Panel
 * 
 * Enterprise-safe component for displaying AI-powered data quality analysis
 * Features:
 * - Optional display (can be hidden without affecting workflow)
 * - Never blocks user workflow
 * - Comprehensive error handling
 * - Professional enterprise UI
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

import { aiDataQualityService, DataQualityAnalysis } from '../../../services/aiDataQuality';

interface AIDataQualityPanelProps {
  transformedData: any[];
  fieldMappings: any[];
  targetTool?: string;
  className?: string;
}

const AIDataQualityPanel: React.FC<AIDataQualityPanelProps> = ({
  transformedData,
  fieldMappings,
  targetTool,
  className
}) => {
  const [analysis, setAnalysis] = useState<DataQualityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Auto-analyze when data changes
  useEffect(() => {
    console.log('[AIDataQuality] Effect triggered:', {
      hasData: !!(transformedData && transformedData.length > 0),
      visible,
      dataLength: transformedData?.length || 0,
      mappingsLength: fieldMappings?.length || 0,
      targetTool
    });
    
    if (transformedData && transformedData.length > 0 && visible) {
      performAnalysis();
    }
  }, [transformedData, fieldMappings, targetTool, visible]);

  const performAnalysis = async () => {
    if (!transformedData || transformedData.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await aiDataQualityService.analyzeDataQuality(
        transformedData,
        fieldMappings,
        targetTool
      );

      setAnalysis(result);
      console.log('[AIDataQuality] Analysis completed:', result);

    } catch (err) {
      console.error('[AIDataQuality] Analysis failed:', err);
      setError('Data quality analysis unavailable');
      // Don't block user workflow - just hide the panel
    } finally {
      setLoading(false);
    }
  };

  // Don't render if hidden or no data
  if (!visible || !transformedData || transformedData.length === 0) {
    console.log('[AIDataQuality] Early return - no data or not visible:', {
      visible,
      hasData: !!(transformedData && transformedData.length > 0),
      dataLength: transformedData?.length || 0
    });
    return null;
  }

  // Don't render if error occurred (fail silently)
  if (error && !analysis) {
    console.log('[AIDataQuality] Early return - error without analysis:', error);
    return null;
  }

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckIcon color="success" />;
    if (score >= 70) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'success';
    if (completeness >= 70) return 'warning';
    return 'error';
  };

  console.log('[AIDataQuality] Rendering component:', {
    visible,
    hasAnalysis: !!analysis,
    loading,
    error,
    hasData: !!(transformedData && transformedData.length > 0)
  });

  return (
    <Paper 
      className={className}
      elevation={2}
      sx={{ 
        mb: 2,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'rgba(33, 150, 243, 0.04)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Data Quality Analysis
          </Typography>
          {loading && <CircularProgress size={20} />}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {analysis && (
            <Chip
              icon={getScoreIcon(analysis.overallScore)}
              label={`${analysis.overallScore}% Quality Score`}
              color={getScoreColor(analysis.overallScore)}
              size="small"
            />
          )}
          <Tooltip title="Refresh Analysis">
            <IconButton
              size="small"
              onClick={performAnalysis}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={visible ? "Hide Panel" : "Show Panel"}>
            <IconButton
              size="small"
              onClick={() => setVisible(!visible)}
            >
              {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Analysis Content */}
      {analysis && (
        <Box sx={{ p: 2 }}>
          {/* Overview Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color={getScoreColor(analysis.overallScore)}>
                    {analysis.overallScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Quality
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {analysis.recordCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Records Analyzed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {analysis.toolCompatibility.filter(tool => tool.compatible).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compatible Tools
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Analysis Sections */}
          <Accordion 
            expanded={expanded} 
            onChange={() => setExpanded(!expanded)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Detailed Analysis & Recommendations
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Field Completeness */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Required Fields
                  </Typography>
                  {analysis.completenessMetrics.requiredFields.map((field, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{field.fieldName}</Typography>
                        <Typography variant="body2" color={getCompletenessColor(field.completeness)}>
                          {field.completeness}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={field.completeness}
                        color={getCompletenessColor(field.completeness)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      {field.missingCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {field.missingCount} records missing this field
                        </Typography>
                      )}
                    </Box>
                  ))}

                  {analysis.completenessMetrics.optionalFields.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                        Optional Fields (Top 5)
                      </Typography>
                      {analysis.completenessMetrics.optionalFields
                        .sort((a, b) => b.completeness - a.completeness)
                        .slice(0, 5)
                        .map((field, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              {field.fieldName}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                              {field.completeness}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={field.completeness}
                            color={getCompletenessColor(field.completeness)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      ))}
                    </>
                  )}
                </Grid>

                {/* Tool Compatibility */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Tool Compatibility
                  </Typography>
                  {analysis.toolCompatibility.map((tool, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {tool.compatible ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <WarningIcon color="warning" fontSize="small" />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {tool.toolName}
                        </Typography>
                        <Chip
                          label={`${tool.confidence}%`}
                          size="small"
                          color={tool.compatible ? 'success' : 'warning'}
                        />
                      </Box>
                      {tool.recommendations.length > 0 && (
                        <List dense sx={{ pl: 2 }}>
                          {tool.recommendations.slice(0, 2).map((rec, recIndex) => (
                            <ListItem key={recIndex} sx={{ py: 0, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 20 }}>
                                <InfoIcon fontSize="small" color="action" />
                              </ListItemIcon>
                              <ListItemText
                                primary={rec}
                                primaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  ))}
                </Grid>

                {/* AI Insights (if available) */}
                {analysis.aiInsights && (
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      AI Insights & Recommendations
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {analysis.aiInsights.summary}
                      </Typography>
                    </Alert>

                    {analysis.aiInsights.recommendations.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          Recommendations:
                        </Typography>
                        <List dense>
                          {analysis.aiInsights.recommendations.map((rec, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <InfoIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={rec}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {analysis.aiInsights.qualityIssues.length > 0 && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          Quality Issues:
                        </Typography>
                        <List dense>
                          {analysis.aiInsights.qualityIssues.map((issue, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <WarningIcon color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={issue}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Analysis generated: {new Date(analysis.generatedAt).toLocaleString()}
            </Typography>
            {analysis.aiInsights && (
              <Chip
                icon={<AIIcon />}
                label="AI-Enhanced"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">
            {error} - Continuing with standard workflow
          </Alert>
        </Box>
      )}
    </Paper>
  );
};

export default AIDataQualityPanel;