import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import {
  Psychology as AIIcon,
  Assessment as ReportIcon,
  Lightbulb as InsightIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { RootState } from '../../state/redux/store';
import useAIService, { AIAnalysisResult } from '../../hooks/useAIService';

interface AIEnhancedReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  incidents?: any[];
  statistics?: any;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  includeAI: boolean;
  sections: string[];
  targetAudience: string[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'monthly_nfpa_compliance',
    name: 'Monthly NFPA 1710 Compliance Report',
    description: 'Official monthly compliance report with AI-powered recommendations',
    includeAI: true,
    sections: [
      'Executive Summary',
      'NFPA 1710 Compliance Analysis',
      'AI Performance Insights',
      'Improvement Recommendations',
      'Statistical Analysis'
    ],
    targetAudience: ['Fire Chief', 'City Manager', 'Mayor']
  },
  {
    id: 'grant_application',
    name: 'Grant Application Data Package',
    description: 'Comprehensive data package for grant applications with AI analysis',
    includeAI: true,
    sections: [
      'Executive Summary',
      'Needs Assessment',
      'AI Performance Analysis',
      'Cost-Benefit Analysis',
      'Implementation Plan'
    ],
    targetAudience: ['Grant Reviewers', 'FEMA', 'State Agencies']
  },
  {
    id: 'city_council_brief',
    name: 'City Council Executive Brief',
    description: 'Concise executive briefing with AI insights for council meetings',
    includeAI: true,
    sections: [
      'Performance Dashboard',
      'AI Key Insights',
      'Budget Impact Analysis',
      'Council Recommendations'
    ],
    targetAudience: ['City Council', 'Mayor', 'Budget Director']
  },
  {
    id: 'annual_performance',
    name: 'Annual Performance Report',
    description: 'Comprehensive annual report with AI trend analysis',
    includeAI: true,
    sections: [
      'Year in Review',
      'AI Performance Trends',
      'Strategic Initiatives',
      'Future Planning'
    ],
    targetAudience: ['Public', 'Media', 'City Leadership']
  }
];

const AIEnhancedReportGenerator: React.FC<AIEnhancedReportGeneratorProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [departmentInfo, setDepartmentInfo] = useState({
    name: '',
    chief: '',
    email: '',
    phone: '',
    city: '',
    state: ''
  });
  const [aiEnhanced, setAiEnhanced] = useState(true);
  const [aiInsights, setAiInsights] = useState<AIAnalysisResult | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const { generateInsights, loading: aiLoading } = useAIService();
  const responseTimeData = useSelector((state: RootState) => state.analyzer?.rawData?.incidents || []);
  const responseTimeStats = useSelector((state: RootState) => state.analyzer?.calculatedMetrics?.responseTimeStats);

  const steps = [
    'Select Report Template',
    'Department Information',
    'AI Analysis',
    'Generate Report'
  ];

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setActiveStep(0);
      setSelectedTemplate(null);
      setAiInsights(null);
    }
  }, [open]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setAiEnhanced(template.includeAI);
  };

  const handleGenerateAIInsights = async () => {
    if (!responseTimeData.length || !selectedTemplate) return;

    const insights = await generateInsights(responseTimeData);
    if (insights) {
      setAiInsights(insights);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !departmentInfo.name) return;

    setGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call the existing PDF generation service
      // with the AI insights integrated into the report data
      const reportData = {
        template: selectedTemplate,
        department: departmentInfo,
        statistics: responseTimeStats,
        aiInsights: aiEnhanced ? aiInsights : null,
        responseTimeData
      };
      
      console.log('Generated AI-enhanced report:', reportData);
      
      // Close dialog after successful generation
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReportIcon />
        Select Report Template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a professional report template enhanced with AI insights
      </Typography>
      
      <Grid container spacing={2}>
        {reportTemplates.map((template) => (
          <Grid size={{ xs: 12, md: 6 }} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedTemplate?.id === template.id ? 2 : 1,
                borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'grey.300'
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{template.name}</Typography>
                  {template.includeAI && (
                    <Chip icon={<AIIcon />} label="AI Enhanced" color="primary" size="small" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Sections:</Typography>
                  {template.sections.map((section) => (
                    <Chip key={section} label={section} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Target Audience:</Typography>
                  {template.targetAudience.map((audience) => (
                    <Chip key={audience} label={audience} variant="outlined" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDepartmentInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Department Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your department details for the report header
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentInfo.name}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Houston Fire Department"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Fire Chief Name"
            value={departmentInfo.chief}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chief: e.target.value }))}
            placeholder="e.g., Chief John Smith"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Email"
            value={departmentInfo.email}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="chief@firedept.gov"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Phone"
            value={departmentInfo.phone}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="City"
            value={departmentInfo.city}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, city: e.target.value }))}
            placeholder="Houston"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="State"
            value={departmentInfo.state}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, state: e.target.value }))}
            placeholder="TX"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={aiEnhanced}
              onChange={(e) => setAiEnhanced(e.target.checked)}
              disabled={!selectedTemplate?.includeAI}
            />
          }
          label="Include AI-powered insights and recommendations"
        />
      </Box>
    </Box>
  );

  const renderAIAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon />
        AI Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate AI-powered insights for your report
      </Typography>
      
      {!aiInsights && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button
            variant="contained"
            onClick={handleGenerateAIInsights}
            disabled={aiLoading || !responseTimeData.length}
            startIcon={aiLoading ? <CircularProgress size={20} /> : <AIIcon />}
            size="large"
          >
            {aiLoading ? 'Generating AI Insights...' : 'Generate AI Insights'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {responseTimeData.length} incidents will be analyzed
          </Typography>
        </Box>
      )}
      
      {aiInsights && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <InsightIcon color="primary" />
            <Typography variant="h6">AI Analysis Results</Typography>
            <Chip 
              icon={aiInsights.success ? <CheckIcon /> : <WarningIcon />}
              label={aiInsights.success ? 'Success' : 'Error'}
              color={aiInsights.success ? 'success' : 'error'}
              size="small"
            />
            <Chip 
              label={aiInsights.source === 'ai' ? 'AI Analysis' : 'Fallback Analysis'}
              color={aiInsights.source === 'ai' ? 'primary' : 'default'}
              size="small"
            />
          </Box>
          
          {aiInsights.success && aiInsights.insight && (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {aiInsights.insight.substring(0, 500)}...
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="outlined" 
            onClick={handleGenerateAIInsights}
            disabled={aiLoading}
            sx={{ mt: 2 }}
          >
            Regenerate Analysis
          </Button>
        </Paper>
      )}
    </Box>
  );

  const renderGenerateReport = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your selections and generate the AI-enhanced report
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Report Summary</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>Template:</strong> {selectedTemplate?.name}</Typography>
            <Typography variant="body2"><strong>Department:</strong> {departmentInfo.name}</Typography>
            <Typography variant="body2"><strong>AI Enhanced:</strong> {aiEnhanced ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2"><strong>Data Points:</strong> {responseTimeData.length} incidents</Typography>
          </Box>
          
          {aiEnhanced && aiInsights && (
            <Alert severity="info" sx={{ mb: 2 }}>
              AI insights will be integrated throughout the report, providing data-driven recommendations and performance analysis.
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={generatingReport || !selectedTemplate || !departmentInfo.name}
          startIcon={generatingReport ? <CircularProgress size={20} /> : <DownloadIcon />}
          size="large"
        >
          {generatingReport ? 'Generating Report...' : 'Generate AI-Enhanced Report'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        AI-Enhanced Report Generator
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 4 }}>
            {activeStep === 0 && renderTemplateSelection()}
            {activeStep === 1 && renderDepartmentInfo()}
            {activeStep === 2 && renderAIAnalysis()}
            {activeStep === 3 && renderGenerateReport()}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !selectedTemplate) ||
            (activeStep === 1 && !departmentInfo.name) ||
            (activeStep === 2 && aiEnhanced && !aiInsights) ||
            activeStep === 3
          }
        >
          {activeStep === steps.length - 1 ? 'Generate' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIEnhancedReportGenerator;