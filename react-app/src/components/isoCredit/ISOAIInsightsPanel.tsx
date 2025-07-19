import React, { useState, useEffect } from 'react';
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
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Psychology as AIIcon,
  Security as ISOIcon,
  Assessment as AnalysisIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Lightbulb as InsightIcon,
  TrendingUp as ImprovementIcon
} from '@mui/icons-material';
import { useAIService, AIAnalysisResult } from '../../hooks/useAIService';

// ISO Assessment interface (matching existing structure)
interface ISOAssessment {
  fireDepartment: {
    staffing: number;
    equipment: number;
    training: number;
    distribution: number;
  };
  waterSupply: {
    capacity: number;
    distribution: number;
    alternative: number;
  };
  communications: {
    dispatch: number;
    alerting: number;
  };
  communityRiskReduction: {
    prevention: number;
    education: number;
    investigation: number;
  };
}

interface ISOAIInsightsPanelProps {
  assessment: ISOAssessment | null;
  currentScore: number;
  classification: number;
  className?: string;
}

const ISOAIInsightsPanel: React.FC<ISOAIInsightsPanelProps> = ({
  assessment,
  currentScore,
  classification,
  className
}) => {
  const { loading, error, analyzeData } = useAIService();
  const [insights, setInsights] = useState<AIAnalysisResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  const hasAssessmentData = assessment !== null && currentScore > 0;

  // Auto-generate insights when assessment data is available
  useEffect(() => {
    if (hasAssessmentData && !insights && !loading) {
      handleGenerateInsights();
    }
  }, [hasAssessmentData, currentScore, classification]);

  const handleGenerateInsights = async () => {
    if (!hasAssessmentData || !assessment) return;

    // Build comprehensive assessment summary for AI analysis
    const assessmentSummary = `
Fire Department ISO Assessment Analysis:

OVERALL PERFORMANCE:
- Total Score: ${currentScore.toFixed(1)}/105.5 points (${(currentScore/105.5*100).toFixed(1)}%)
- Current Classification: Class ${classification}
- Performance Level: ${getPerformanceDescription(currentScore)}

FIRE DEPARTMENT OPERATIONS (${getFDScore(assessment)}/50 points):
- Staffing: ${assessment.fireDepartment.staffing.toFixed(1)}/12.5 points
- Equipment: ${assessment.fireDepartment.equipment.toFixed(1)}/12.5 points  
- Training: ${assessment.fireDepartment.training.toFixed(1)}/12.5 points
- Distribution: ${assessment.fireDepartment.distribution.toFixed(1)}/12.5 points

WATER SUPPLY (${getWaterScore(assessment)}/40 points):
- Capacity: ${assessment.waterSupply.capacity.toFixed(1)}/20 points
- Distribution: ${assessment.waterSupply.distribution.toFixed(1)}/15 points
- Alternative Supply: ${assessment.waterSupply.alternative.toFixed(1)}/5 points

EMERGENCY COMMUNICATIONS (${getCommScore(assessment)}/10 points):
- Dispatch: ${assessment.communications.dispatch.toFixed(1)}/7 points
- Alerting: ${assessment.communications.alerting.toFixed(1)}/3 points

COMMUNITY RISK REDUCTION (${getCRRScore(assessment)}/5.5 points):
- Prevention: ${assessment.communityRiskReduction.prevention.toFixed(1)}/2.5 points
- Education: ${assessment.communityRiskReduction.education.toFixed(1)}/2 points
- Investigation: ${assessment.communityRiskReduction.investigation.toFixed(1)}/1 points
    `.trim();

    const analysisQuery = `
Analyze this fire department's ISO Fire Suppression Rating Schedule assessment. Provide:

1. PERFORMANCE ANALYSIS: Identify the department's strongest and weakest areas
2. IMPROVEMENT PRIORITIES: Top 3 specific recommendations for maximum classification improvement
3. COST-BENEFIT GUIDANCE: Which improvements offer the best return on investment
4. REGULATORY COMPLIANCE: Key ISO requirements this department should focus on
5. COMMUNITY IMPACT: How improvements would affect insurance costs and fire protection

Focus on practical, actionable recommendations that a fire chief can implement.
    `.trim();

    try {
      const result = await analyzeData(assessmentSummary, analysisQuery);
      if (result) {
        setInsights(result);
        setLastAnalyzed(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('ISO AI Analysis Error:', error);
    }
  };

  const getFDScore = (assessment: ISOAssessment): number => {
    return Object.values(assessment.fireDepartment).reduce((sum, val) => sum + val, 0);
  };

  const getWaterScore = (assessment: ISOAssessment): number => {
    return Object.values(assessment.waterSupply).reduce((sum, val) => sum + val, 0);
  };

  const getCommScore = (assessment: ISOAssessment): number => {
    return Object.values(assessment.communications).reduce((sum, val) => sum + val, 0);
  };

  const getCRRScore = (assessment: ISOAssessment): number => {
    return Object.values(assessment.communityRiskReduction).reduce((sum, val) => sum + val, 0);
  };

  const getPerformanceDescription = (score: number): string => {
    if (score >= 94.5) return 'Superior Protection (Class 1)';
    if (score >= 84.5) return 'Excellent Protection (Class 2-3)';
    if (score >= 69.5) return 'Good Protection (Class 4-5)';
    if (score >= 39.5) return 'Fair Protection (Class 6-8)';
    return 'Limited Protection (Class 9-10)';
  };

  const getClassificationColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (classification <= 3) return 'success';
    if (classification <= 5) return 'info';
    if (classification <= 7) return 'warning';
    return 'error';
  };

  const formatInsightText = (text: string) => {
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
            AI ISO Analysis
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>

        {/* ISO Classification Summary */}
        {hasAssessmentData && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ISOIcon fontSize="small" />
              <Typography variant="subtitle2">ISO Classification</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<AnalysisIcon />}
                label={`Class ${classification} - ${currentScore.toFixed(1)}/105.5 pts`}
                color={getClassificationColor()}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {getPerformanceDescription(currentScore)}
              </Typography>
            </Box>
          </Box>
        )}

        <Collapse in={expanded}>
          <Box>
            <Divider sx={{ my: 2 }} />
            
            {/* Action Button */}
            <Box sx={{ mb: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateInsights}
                disabled={!hasAssessmentData || loading}
                startIcon={loading ? <CircularProgress size={16} /> : <ImprovementIcon />}
                size="small"
              >
                {loading ? 'Analyzing ISO Assessment...' : 'Generate AI Insights'}
              </Button>
            </Box>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2">Analyzing ISO assessment with AI...</Typography>
              </Box>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* No Data State */}
            {!hasAssessmentData && !loading && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Complete your ISO assessment to get AI-powered improvement recommendations and classification analysis.
              </Alert>
            )}

            {/* Insights Display */}
            {insights && !loading && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InsightIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2">AI Analysis Results</Typography>
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
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    minHeight: 500,
                    maxHeight: '80vh', 
                    overflow: 'auto',
                    border: '1px solid rgba(0, 0, 0, 0.12)'
                  }}>
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

export default ISOAIInsightsPanel;