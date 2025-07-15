/**
 * Station Coverage Professional Report Generator Component
 * 
 * Provides a wizard-style interface for creating professional station coverage reports
 * Supports NFPA compliance, gap analysis, and planning documents
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  TextField,
  Alert,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  LocalFireDepartment as StationIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  BusinessCenter,
  Gavel as ComplianceIcon,
  Map as CoverageIcon,
  Warning as GapIcon
} from '@mui/icons-material';

import { 
  generateStationCoverageReport, 
  StationCoverageReportConfig, 
  StationCoverageReportData 
} from '../../services/stationCoverageReportGenerator';

interface StationCoverageReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  stations: any[];
  analysisResults: any;
  coverageStandard: string;
  jurisdictionBoundary?: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  estimatedPages: number;
  icon: React.ReactNode;
  sections: {
    summary: boolean;
    stationInventory: boolean;
    coverageAnalysis: boolean;
    gapAssessment: boolean;
    recommendations: boolean;
    nfpaCompliance: boolean;
    performanceMetrics: boolean;
  };
}

const StationCoverageReportGenerator: React.FC<StationCoverageReportGeneratorProps> = ({
  open,
  onClose,
  stations,
  analysisResults,
  coverageStandard,
  jurisdictionBoundary
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  
  // Form state
  const [departmentInfo, setDepartmentInfo] = useState({
    departmentName: '',
    chiefName: '',
    chiefTitle: 'Fire Chief',
    customTitle: '',
    customSubtitle: '',
    executiveSummary: ''
  });

  const steps = ['Template Selection', 'Department Information', 'Report Configuration', 'Generate Report'];

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'nfpa_compliance',
      name: 'NFPA Compliance Report',
      description: 'Comprehensive NFPA compliance assessment with coverage analysis and gap identification',
      targetAudience: 'Fire Chief, City Council, Insurance Rating Bureau',
      estimatedPages: 12,
      icon: <ComplianceIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      sections: {
        summary: true,
        stationInventory: true,
        coverageAnalysis: true,
        gapAssessment: true,
        recommendations: true,
        nfpaCompliance: true,
        performanceMetrics: true
      }
    },
    {
      id: 'coverage_assessment',
      name: 'Coverage Assessment Report',
      description: 'Geographic coverage analysis with station performance metrics and service area evaluation',
      targetAudience: 'Fire Administration, Emergency Management, City Planning',
      estimatedPages: 8,
      icon: <CoverageIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      sections: {
        summary: true,
        stationInventory: true,
        coverageAnalysis: true,
        gapAssessment: false,
        recommendations: true,
        nfpaCompliance: false,
        performanceMetrics: true
      }
    },
    {
      id: 'gap_analysis',
      name: 'Coverage Gap Analysis',
      description: 'Detailed gap identification with strategic station placement recommendations',
      targetAudience: 'City Council, Budget Committee, Strategic Planning',
      estimatedPages: 10,
      icon: <GapIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      sections: {
        summary: true,
        stationInventory: false,
        coverageAnalysis: true,
        gapAssessment: true,
        recommendations: true,
        nfpaCompliance: false,
        performanceMetrics: false
      }
    },
    {
      id: 'strategic_planning',
      name: 'Strategic Planning Document',
      description: 'Long-term strategic analysis for capital improvement planning and resource allocation',
      targetAudience: 'City Manager, Mayor, Capital Planning Committee',
      estimatedPages: 16,
      icon: <BusinessCenter sx={{ fontSize: 40, color: '#9c27b0' }} />,
      sections: {
        summary: true,
        stationInventory: true,
        coverageAnalysis: true,
        gapAssessment: true,
        recommendations: true,
        nfpaCompliance: true,
        performanceMetrics: true
      }
    }
  ];

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !analysisResults) return;

    setIsGenerating(true);

    try {
      // Prepare report configuration
      const config: StationCoverageReportConfig = {
        reportType: selectedTemplate.id as any,
        title: departmentInfo.customTitle || selectedTemplate.name,
        subtitle: departmentInfo.customSubtitle,
        departmentName: departmentInfo.departmentName,
        chiefName: departmentInfo.chiefName,
        chiefTitle: departmentInfo.chiefTitle,
        includeSections: selectedTemplate.sections,
        customText: {
          executiveSummary: departmentInfo.executiveSummary
        }
      };

      // Prepare report data - fix data structure mapping
      const reportData: StationCoverageReportData = {
        stations: stations.map(station => ({
          station_id: station.station_id,
          station_name: station.station_name,
          latitude: station.latitude,
          longitude: station.longitude,
          station_type: station.station_type || 'Engine Company',
          apparatus_count: station.apparatus_count,
          staffing_level: station.staffing_level,
          operational_status: station.operational_status || 'Active'
        })),
        coverageStandard: coverageStandard as 'nfpa1710' | 'nfpa1720',
        jurisdictionBoundary,
        analysisResults: {
          totalStations: analysisResults?.totalStations || stations.length,
          coverageMetrics: analysisResults?.coverageMetrics || {
            populationCovered: 0,
            areaCovered: 0,
            nfpaCompliance: 0
          },
          // Fix data structure mapping - map root level arrays to nested structure
          identifiedGaps: analysisResults?.gaps || analysisResults?.identifiedGaps || [],
          recommendedStations: analysisResults?.recommendations || analysisResults?.recommendedStations || [],
          analysisDate: analysisResults?.analysisDate || new Date().toISOString()
        }
      };

      console.log('🚀 Generating Station Coverage Report with config:', config);
      console.log('📊 Report data:', reportData);

      // Generate the report
      const pdfBlob = await generateStationCoverageReport(config, reportData);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${departmentInfo.departmentName.replace(/\s+/g, '_')}_Coverage_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Station Coverage Report generated successfully');
      
      // Reset and close
      setActiveStep(0);
      onClose();

    } catch (error) {
      console.error('❌ Failed to generate Station Coverage Report:', error);
      alert('Failed to generate report. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Report Template
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the report template that best matches your needs and target audience.
      </Typography>

      <Grid container spacing={2}>
        {reportTemplates.map((template) => (
          <Grid size={{ xs: 12, md: 6 }} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedTemplate?.id === template.id ? 2 : 1,
                borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {template.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{template.name}</Typography>
                    <Chip 
                      label={`~${template.estimatedPages} pages`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  {template.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>Target Audience:</strong> {template.targetAudience}
                </Typography>
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
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your department details for the report header and branding.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Department Name *"
            value={departmentInfo.departmentName}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, departmentName: e.target.value }))}
            placeholder="Phoenix Fire Department"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Fire Chief Name"
            value={departmentInfo.chiefName}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chiefName: e.target.value }))}
            placeholder="John Smith"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Chief Title"
            value={departmentInfo.chiefTitle}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chiefTitle: e.target.value }))}
            placeholder="Fire Chief"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Custom Report Title"
            value={departmentInfo.customTitle}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, customTitle: e.target.value }))}
            placeholder="Leave blank to use template default"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Report Subtitle"
            value={departmentInfo.customSubtitle}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, customSubtitle: e.target.value }))}
            placeholder="Optional subtitle for the report"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Custom Executive Summary"
            value={departmentInfo.executiveSummary}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, executiveSummary: e.target.value }))}
            placeholder="Leave blank to use auto-generated summary"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderReportConfiguration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Report Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your report settings before generation.
      </Typography>

      {selectedTemplate && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Selected Template: {selectedTemplate.name}
            </Typography>
            <Typography variant="body2" paragraph>
              {selectedTemplate.description}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Included Sections:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(selectedTemplate.sections).map(([key, included]) => 
                included && (
                  <Chip 
                    key={key} 
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                )
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Data Summary:</strong><br />
          • {stations.length} fire stations<br />
          • {coverageStandard.toUpperCase()} compliance standards<br />
          • {analysisResults?.gaps?.length || analysisResults?.identifiedGaps?.length || 0} coverage gaps identified<br />
          • {analysisResults?.recommendations?.length || analysisResults?.recommendedStations?.length || 0} station recommendations
        </Typography>
      </Alert>
    </Box>
  );

  const renderGenerateReport = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      {isGenerating ? (
        <Box>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Generating Professional Report...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we create your PDF report with tables and analysis.
          </Typography>
        </Box>
      ) : (
        <Box>
          <ReportIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Ready to Generate Report
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your professional station coverage report is ready to be generated.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={!departmentInfo.departmentName}
          >
            Generate PDF Report
          </Button>
        </Box>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderTemplateSelection();
      case 1:
        return renderDepartmentInfo();
      case 2:
        return renderReportConfiguration();
      case 3:
        return renderGenerateReport();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { minHeight: 600 } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StationIcon color="primary" />
          <Typography variant="h6">Station Coverage Report Generator</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack} disabled={isGenerating}>
            Back
          </Button>
        )}
        {activeStep < 2 && (
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={!selectedTemplate || (activeStep === 1 && !departmentInfo.departmentName)}
          >
            Next
          </Button>
        )}
        {activeStep === 2 && (
          <Button 
            onClick={() => setActiveStep(3)} 
            variant="contained"
            disabled={!departmentInfo.departmentName}
          >
            Continue to Generate
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StationCoverageReportGenerator;