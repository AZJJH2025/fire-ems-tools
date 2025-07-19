import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  Psychology as AIIcon,
  Assessment as AnalysisIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon
} from '@mui/icons-material';

interface AIAnalysisResult {
  success: boolean;
  insight?: string;
  source: 'ai' | 'fallback';
  model?: string;
  timestamp: string;
  sanitized?: boolean;
  error?: string;
}

interface AIServiceStatus {
  enabled: boolean;
  has_api_key: boolean;
  model: string;
  max_tokens: number;
  status: 'ready' | 'error' | 'disabled';
}

interface ComplianceMetrics {
  incident_count: number;
  avg_response_time: number;
  dispatch_time_90th: number;
  turnout_time_90th: number;
  total_response_90th: number;
}

const AIAnalysisDashboard: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<AIServiceStatus | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [dataInput, setDataInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics>({
    incident_count: 0,
    avg_response_time: 0,
    dispatch_time_90th: 0,
    turnout_time_90th: 0,
    total_response_90th: 0
  });

  // Sample data for demonstration
  const sampleData = "Fire department with 150 incidents last month, average response time 4.8 minutes, NFPA 1710 compliance at 82%, dispatch time averaging 45 seconds, turnout time averaging 75 seconds.";

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/ai/debug', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data.ai_service_status);
      } else {
        throw new Error('Failed to check AI status');
      }
    } catch (error) {
      console.error('Error checking AI status:', error);
      setAiStatus({
        enabled: false,
        has_api_key: false,
        model: 'unavailable',
        max_tokens: 0,
        status: 'error'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const performAnalysis = async () => {
    if (!dataInput.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/ai/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          data_summary: dataInput,
          query: queryInput || undefined
        })
      });

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error performing analysis:', error);
      setAnalysisResult({
        success: false,
        error: 'Failed to perform analysis',
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const performComplianceCheck = async () => {
    if (!complianceMetrics.incident_count) return;

    try {
      setLoading(true);
      const response = await fetch('/ai/api/compliance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(complianceMetrics)
      });

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error performing compliance check:', error);
      setAnalysisResult({
        success: false,
        error: 'Failed to perform compliance check',
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!aiStatus) return 'default';
    switch (aiStatus.status) {
      case 'ready': return 'success';
      case 'error': return 'error';
      case 'disabled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    if (!aiStatus) return <HelpIcon />;
    switch (aiStatus.status) {
      case 'ready': return <CheckIcon />;
      case 'error': return <WarningIcon />;
      case 'disabled': return <WarningIcon />;
      default: return <HelpIcon />;
    }
  };

  const loadSampleData = () => {
    setDataInput(sampleData);
    setQueryInput('What improvements should we focus on?');
  };

  const loadSampleMetrics = () => {
    setComplianceMetrics({
      incident_count: 150,
      avg_response_time: 4.8,
      dispatch_time_90th: 45,
      turnout_time_90th: 75,
      total_response_90th: 290
    });
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        AI Analysis Dashboard
      </Typography>

      {/* AI Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              AI Service Status
              {statusLoading && <CircularProgress size={20} />}
            </Typography>
            <IconButton onClick={checkAIStatus} disabled={statusLoading}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {aiStatus && (
            <Box sx={{ mt: 2 }}>
              <Chip 
                icon={getStatusIcon()} 
                label={aiStatus.status.toUpperCase()} 
                color={getStatusColor()}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Model: {aiStatus.model} | Max Tokens: {aiStatus.max_tokens} | API Key: {aiStatus.has_api_key ? 'Configured' : 'Missing'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* General AI Analysis */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalysisIcon color="primary" />
                General AI Analysis
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Data Summary"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Enter your CAD data summary or performance metrics..."
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Specific Query (Optional)"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="What specific insights are you looking for?"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={performAnalysis}
                  disabled={loading || !dataInput.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : <TrendingIcon />}
                >
                  Analyze Data
                </Button>
                <Button
                  variant="outlined"
                  onClick={loadSampleData}
                  size="small"
                >
                  Load Sample
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* NFPA 1710 Compliance Check */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon color="primary" />
                NFPA 1710 Compliance Check
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Incident Count"
                    value={complianceMetrics.incident_count || ''}
                    onChange={(e) => setComplianceMetrics(prev => ({
                      ...prev,
                      incident_count: parseInt(e.target.value) || 0
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Avg Response Time (min)"
                    value={complianceMetrics.avg_response_time || ''}
                    onChange={(e) => setComplianceMetrics(prev => ({
                      ...prev,
                      avg_response_time: parseFloat(e.target.value) || 0
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dispatch Time 90th (sec)"
                    value={complianceMetrics.dispatch_time_90th || ''}
                    onChange={(e) => setComplianceMetrics(prev => ({
                      ...prev,
                      dispatch_time_90th: parseInt(e.target.value) || 0
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Turnout Time 90th (sec)"
                    value={complianceMetrics.turnout_time_90th || ''}
                    onChange={(e) => setComplianceMetrics(prev => ({
                      ...prev,
                      turnout_time_90th: parseInt(e.target.value) || 0
                    }))}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Response 90th (sec)"
                    value={complianceMetrics.total_response_90th || ''}
                    onChange={(e) => setComplianceMetrics(prev => ({
                      ...prev,
                      total_response_90th: parseInt(e.target.value) || 0
                    }))}
                    size="small"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={performComplianceCheck}
                  disabled={loading || !complianceMetrics.incident_count}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  Check Compliance
                </Button>
                <Button
                  variant="outlined"
                  onClick={loadSampleMetrics}
                  size="small"
                >
                  Load Sample
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Results */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>
              
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
                  <CircularProgress size={30} />
                  <Typography>Analyzing data with AI...</Typography>
                </Box>
              )}
              
              {analysisResult && !loading && (
                <Box>
                  {/* Result Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      icon={analysisResult.success ? <CheckIcon /> : <WarningIcon />}
                      label={analysisResult.success ? 'Success' : 'Error'}
                      color={analysisResult.success ? 'success' : 'error'}
                    />
                    <Chip 
                      label={analysisResult.source === 'ai' ? 'AI Analysis' : 'Fallback Analysis'}
                      color={analysisResult.source === 'ai' ? 'primary' : 'default'}
                    />
                    {analysisResult.model && (
                      <Chip label={analysisResult.model} variant="outlined" />
                    )}
                    {analysisResult.sanitized && (
                      <Chip label="Data Sanitized" variant="outlined" color="info" />
                    )}
                  </Box>
                  
                  {/* Result Content */}
                  {analysisResult.success && analysisResult.insight && (
                    <Paper sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50', 
                      minHeight: 500,
                      maxHeight: '80vh', 
                      overflow: 'auto',
                      border: '1px solid rgba(0, 0, 0, 0.12)'
                    }}>
                      {formatInsightText(analysisResult.insight)}
                    </Paper>
                  )}
                  
                  {!analysisResult.success && analysisResult.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {analysisResult.error}
                    </Alert>
                  )}
                  
                  {/* Timestamp */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Generated: {new Date(analysisResult.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              )}
              
              {!analysisResult && !loading && (
                <Alert severity="info">
                  Enter your data summary or compliance metrics above and click "Analyze Data" or "Check Compliance" to get AI-powered insights.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAnalysisDashboard;