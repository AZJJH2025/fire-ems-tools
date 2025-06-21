/**
 * Water Supply Professional Report Generator Component
 * 
 * Provides a wizard-style interface for creating professional water supply coverage reports
 * Supports PA 17 compliance, coverage assessment, and planning documents
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
  CardActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  LocalFireDepartment as TankIcon,
  WaterDrop as HydrantIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  BusinessCenter,
  Gavel as ComplianceIcon
} from '@mui/icons-material';

import {
  selectTanks,
  selectHydrants,
  selectAllSupplies,
  selectCoverageZones,
  selectActiveAnalysis
} from '../../state/redux/waterSupplyCoverageSlice';

import { 
  generateWaterSupplyReport, 
  WaterSupplyReportConfig, 
  WaterSupplyReportData 
} from '../../services/waterSupplyReportGenerator';

interface WaterSupplyReportGeneratorProps {
  open: boolean;
  onClose: () => void;
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
    tankInventory: boolean;
    hydrantInventory: boolean;
    coverageAnalysis: boolean;
    gapAssessment: boolean;
    recommendations: boolean;
    compliance: boolean;
  };
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'pa17_compliance',
    name: 'PA 17 Compliance Report',
    description: 'Official Pennsylvania Act 17 compliance documentation',
    targetAudience: 'State Fire Marshal, Insurance Commissioners',
    estimatedPages: 8,
    icon: <ComplianceIcon color="primary" />,
    sections: {
      summary: true,
      tankInventory: true,
      hydrantInventory: true,
      coverageAnalysis: true,
      gapAssessment: false,
      recommendations: true,
      compliance: true
    }
  },
  {
    id: 'coverage_assessment',
    name: 'Water Supply Coverage Assessment',
    description: 'Comprehensive analysis of water supply distribution and effectiveness',
    targetAudience: 'Fire Chief, City Manager, Planning Commission',
    estimatedPages: 12,
    icon: <ReportIcon color="secondary" />,
    sections: {
      summary: true,
      tankInventory: true,
      hydrantInventory: true,
      coverageAnalysis: true,
      gapAssessment: true,
      recommendations: true,
      compliance: false
    }
  },
  {
    id: 'planning_document',
    name: 'Strategic Planning Document',
    description: 'Long-term water supply infrastructure planning and budgeting',
    targetAudience: 'City Council, Budget Committee, Grant Reviewers',
    estimatedPages: 16,
    icon: <BusinessCenter color="success" />,
    sections: {
      summary: true,
      tankInventory: true,
      hydrantInventory: true,
      coverageAnalysis: true,
      gapAssessment: true,
      recommendations: true,
      compliance: false
    }
  },
  {
    id: 'inventory_report',
    name: 'Water Supply Inventory Report',
    description: 'Detailed inventory of all water supply assets and capabilities',
    targetAudience: 'Department Personnel, Maintenance Staff',
    estimatedPages: 6,
    icon: <TankIcon color="warning" />,
    sections: {
      summary: true,
      tankInventory: true,
      hydrantInventory: true,
      coverageAnalysis: false,
      gapAssessment: false,
      recommendations: false,
      compliance: false
    }
  }
];

const WaterSupplyReportGenerator: React.FC<WaterSupplyReportGeneratorProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<Blob | null>(null);
  
  // Debug logging
  React.useEffect(() => {
    console.log('🔥 WATER SUPPLY REPORT GENERATOR - Dialog state changed:', { open });
  }, [open]);
  
  // Department information
  const [departmentInfo, setDepartmentInfo] = useState({
    name: 'Fire Department',
    chiefName: '',
    chiefTitle: 'Fire Chief',
    logo: ''
  });
  
  // Report customization
  const [customText, setCustomText] = useState({
    executiveSummary: '',
    reportPurpose: '',
    chiefMessage: ''
  });
  
  // Redux selectors
  const tanks = useSelector(selectTanks);
  const hydrants = useSelector(selectHydrants);
  const coverageZones = useSelector(selectCoverageZones);
  const activeAnalysis = useSelector(selectActiveAnalysis);
  
  const steps = ['Select Template', 'Department Info', 'Customize Report', 'Generate & Download'];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    handleNext();
  };
  
  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
    try {
      // Prepare report configuration
      const config: WaterSupplyReportConfig = {
        reportType: selectedTemplate.id.includes('compliance') ? 'compliance' : 
                   selectedTemplate.id.includes('planning') ? 'planning' : 'coverage',
        title: selectedTemplate.name,
        subtitle: selectedTemplate.description,
        departmentName: departmentInfo.name,
        departmentLogo: departmentInfo.logo || undefined,
        chiefName: departmentInfo.chiefName || undefined,
        chiefTitle: departmentInfo.chiefTitle || undefined,
        includeSections: selectedTemplate.sections,
        customText: customText.executiveSummary || customText.reportPurpose || customText.chiefMessage ? {
          executiveSummary: customText.executiveSummary || undefined,
          reportPurpose: customText.reportPurpose || undefined,
          chiefMessage: customText.chiefMessage || undefined
        } : undefined
      };
      
      // Prepare report data
      const data: WaterSupplyReportData = {
        tanks: tanks.map(tank => ({
          id: tank.id,
          name: tank.name,
          location: tank.location,
          capacity: tank.capacity,
          type: tank.type,
          accessRating: tank.accessRating,
          operationalStatus: tank.operationalStatus,
          owner: tank.owner,
          notes: tank.notes
        })),
        hydrants: hydrants.map(hydrant => ({
          id: hydrant.id,
          name: hydrant.name,
          location: hydrant.location,
          flowRate: hydrant.flowRate,
          staticPressure: hydrant.staticPressure,
          residualPressure: hydrant.residualPressure,
          type: hydrant.type,
          size: hydrant.size,
          operationalStatus: hydrant.operationalStatus,
          owner: hydrant.owner,
          notes: hydrant.notes
        })),
        coverageZones: coverageZones || [],
        analysis: activeAnalysis || undefined
      };
      
      // Generate the PDF
      const blob = await generateWaterSupplyReport(config, data);
      setGeneratedReport(blob);
      
      // Download the report
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      handleNext();
      
    } catch (error) {
      console.error('Failed to generate water supply report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleClose = () => {
    setActiveStep(0);
    setSelectedTemplate(null);
    setGeneratedReport(null);
    setIsGenerating(false);
    onClose();
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderTemplateSelection();
      case 1:
        return renderDepartmentInfo();
      case 2:
        return renderCustomization();
      case 3:
        return renderCompletion();
      default:
        return null;
    }
  };
  
  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Report Template
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select the type of water supply report you need to generate. Each template is designed for specific audiences and compliance requirements.
      </Typography>
      
      <Grid container spacing={2}>
        {REPORT_TEMPLATES.map((template) => (
          <Grid item xs={12} md={6} key={template.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { elevation: 4 },
                border: selectedTemplate?.id === template.id ? 2 : 0,
                borderColor: 'primary.main'
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {template.icon}
                  <Box>
                    <Typography variant="h6" component="div">
                      {template.name}
                    </Typography>
                    <Chip 
                      label={`~${template.estimatedPages} pages`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  <strong>Target Audience:</strong> {template.targetAudience}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button size="small" onClick={() => handleTemplateSelect(template)}>
                  Select Template
                </Button>
              </CardActions>
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
        Enter your department information to personalize the report. This information will appear on the title page and throughout the document.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentInfo.name}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fire Chief Name"
            value={departmentInfo.chiefName}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chiefName: e.target.value }))}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Chief Title"
            value={departmentInfo.chiefTitle}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chiefTitle: e.target.value }))}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Department Logo (Base64)"
            value={departmentInfo.logo}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, logo: e.target.value }))}
            placeholder="data:image/png;base64,..."
            helperText="Optional: Paste base64 encoded image data for department logo"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderCustomization = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customize Report Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add custom text to personalize your report. All fields are optional.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Executive Summary"
            value={customText.executiveSummary}
            onChange={(e) => setCustomText(prev => ({ ...prev, executiveSummary: e.target.value }))}
            multiline
            rows={3}
            helperText="Custom introduction for the executive summary section"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Report Purpose"
            value={customText.reportPurpose}
            onChange={(e) => setCustomText(prev => ({ ...prev, reportPurpose: e.target.value }))}
            multiline
            rows={2}
            helperText="Specific purpose or context for this report"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Chief's Message"
            value={customText.chiefMessage}
            onChange={(e) => setCustomText(prev => ({ ...prev, chiefMessage: e.target.value }))}
            multiline
            rows={4}
            helperText="Personal message from the Fire Chief for the title page"
          />
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Report Preview:</strong> Your report will include {tanks.length} tanks, {hydrants.length} hydrants, 
            and estimated {selectedTemplate?.estimatedPages} pages of professional analysis.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
  
  const renderCompletion = () => (
    <Box textAlign="center">
      {isGenerating ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Generating Report...
          </Typography>
          <LinearProgress sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Creating professional water supply coverage report
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom color="success.main">
            ✅ Report Generated Successfully
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your professional water supply coverage report has been generated and downloaded.
          </Typography>
          
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
            <Button 
              variant="contained" 
              onClick={handleGenerateReport}
              startIcon={<DownloadIcon />}
            >
              Download Again
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReportIcon />
          Professional Water Supply Report Generator
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        
        {activeStep === 1 && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!departmentInfo.name}
          >
            Next
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            startIcon={<DownloadIcon />}
          >
            Generate Report
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WaterSupplyReportGenerator;