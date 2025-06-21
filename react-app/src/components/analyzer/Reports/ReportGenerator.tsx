import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';

import { generateResponseTimeReport, ReportConfig } from '@/services/pdfReportGenerator';
import { IncidentRecord, ResponseTimeStatistics } from '@/types/analyzer';

interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  incidents: IncidentRecord[];
  statistics: ResponseTimeStatistics;
  dateRange?: { start: string; end: string };
}

// Report template options
const reportTemplates = [
  {
    id: 'compliance',
    name: 'NFPA 1710 Compliance Report',
    description: 'Official compliance report for city council, grants, and regulatory submissions',
    icon: <SecurityIcon />,
    color: 'primary' as const,
    sections: {
      summary: true,
      nfpaCompliance: true,
      incidentDetails: true,
      charts: false,
      recommendations: true
    }
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for chiefs, mayors, and department leadership',
    icon: <BusinessIcon />,
    color: 'secondary' as const,
    sections: {
      summary: true,
      nfpaCompliance: true,
      incidentDetails: false,
      charts: true,
      recommendations: true
    }
  },
  {
    id: 'detailed',
    name: 'Detailed Analysis Report',
    description: 'Comprehensive report with full incident data and analysis',
    icon: <DescriptionIcon />,
    color: 'info' as const,
    sections: {
      summary: true,
      nfpaCompliance: true,
      incidentDetails: true,
      charts: true,
      recommendations: true
    }
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Choose specific sections and customize content',
    icon: <TuneIcon />,
    color: 'warning' as const,
    sections: {
      summary: true,
      nfpaCompliance: false,
      incidentDetails: false,
      charts: false,
      recommendations: false
    }
  }
];

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  open,
  onClose,
  incidents,
  statistics,
  dateRange
}) => {
  // Report configuration state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('compliance');
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    reportType: 'compliance',
    title: 'Response Time Analysis Report',
    subtitle: 'NFPA 1710 Compliance Assessment',
    departmentName: '',
    chiefName: '',
    chiefTitle: 'Fire Chief',
    reportPeriod: {
      startDate: dateRange?.start || new Date().toISOString().split('T')[0],
      endDate: dateRange?.end || new Date().toISOString().split('T')[0]
    },
    includeSections: {
      summary: true,
      nfpaCompliance: true,
      incidentDetails: true,
      charts: false,
      recommendations: true
    }
  });
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<{
    success: boolean;
    message: string;
    filename?: string;
  } | null>(null);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setReportConfig(prev => ({
        ...prev,
        reportType: templateId as any,
        title: template.name,
        subtitle: template.description,
        includeSections: { ...template.sections }
      }));
    }
  };

  // Handle section toggle
  const handleSectionToggle = (section: keyof ReportConfig['includeSections']) => {
    setReportConfig(prev => ({
      ...prev,
      includeSections: {
        ...prev.includeSections!,
        [section]: !prev.includeSections![section]
      }
    }));
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!reportConfig.departmentName?.trim()) {
      setGenerationStatus({
        success: false,
        message: 'Please enter your department name before generating the report.'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(null);

    try {
      const completeConfig: ReportConfig = {
        reportType: reportConfig.reportType || 'compliance',
        title: reportConfig.title || 'Response Time Analysis Report',
        subtitle: reportConfig.subtitle,
        departmentName: reportConfig.departmentName!,
        departmentLogo: reportConfig.departmentLogo, // 🖼️ Include logo in config
        chiefName: reportConfig.chiefName,
        chiefTitle: reportConfig.chiefTitle || 'Fire Chief',
        reportPeriod: reportConfig.reportPeriod!,
        includeSections: reportConfig.includeSections!,
        customText: reportConfig.customText // 🎨 Include custom text
      };

      const reportData = {
        incidents,
        statistics
      };

      const pdfBlob = await generateResponseTimeReport(completeConfig, reportData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${completeConfig.departmentName.replace(/\s+/g, '_')}_Response_Time_Report_${Date.now()}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setGenerationStatus({
        success: true,
        message: 'PDF report generated successfully!',
        filename
      });

    } catch (error) {
      console.error('Error generating PDF report:', error);
      setGenerationStatus({
        success: false,
        message: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate estimated sections
  const selectedSections = Object.entries(reportConfig.includeSections || {})
    .filter(([_, included]) => included)
    .map(([section, _]) => section);

  const estimatedPages = Math.max(2, selectedSections.length + (reportConfig.includeSections?.incidentDetails ? Math.ceil(incidents.length / 25) : 0));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <PictureAsPdfIcon sx={{ mr: 1, color: 'error.main' }} />
        Generate PDF Report
      </DialogTitle>

      <DialogContent>
        {/* Template Selection */}
        <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
          1. Choose Report Template
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {reportTemplates.map(template => (
            <Grid item xs={12} sm={6} key={template.id}>
              <Card 
                variant={selectedTemplate === template.id ? 'elevation' : 'outlined'}
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === template.id ? 2 : 1,
                  borderColor: selectedTemplate === template.id ? `${template.color}.main` : 'divider',
                  '&:hover': { elevation: 2 }
                }}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {template.icon}
                    <Chip 
                      label={template.name} 
                      color={template.color}
                      variant={selectedTemplate === template.id ? 'filled' : 'outlined'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Department Information */}
        <Typography variant="h6" gutterBottom>
          2. Department Information
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Department Name *"
              fullWidth
              value={reportConfig.departmentName || ''}
              onChange={(e) => handleInputChange('departmentName', e.target.value)}
              placeholder="e.g., City Fire Department"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Fire Chief Name"
              fullWidth
              value={reportConfig.chiefName || ''}
              onChange={(e) => handleInputChange('chiefName', e.target.value)}
              placeholder="e.g., John Smith"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Chief Title"
              fullWidth
              value={reportConfig.chiefTitle || ''}
              onChange={(e) => handleInputChange('chiefTitle', e.target.value)}
              placeholder="e.g., Fire Chief, Battalion Chief"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Department Logo
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<BusinessIcon />}
              >
                Upload Logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          handleInputChange('departmentLogo', event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
              {reportConfig.departmentLogo && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ Logo uploaded successfully
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Report Title"
              fullWidth
              value={reportConfig.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Custom Text Section */}
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          📝 Customize Report Text
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Custom Subtitle"
              multiline
              rows={2}
              fullWidth
              value={reportConfig.customText?.customSubtitle || ''}
              onChange={(e) => handleInputChange('customText', {
                ...reportConfig.customText,
                customSubtitle: e.target.value
              })}
              placeholder="Official compliance report for city council, grants, and regulatory submissions"
              helperText="Subtitle that appears below the main title on the cover page"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Report Start Date"
              type="date"
              fullWidth
              value={reportConfig.reportPeriod?.startDate || ''}
              onChange={(e) => handleInputChange('reportPeriod', {
                ...reportConfig.reportPeriod,
                startDate: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
              helperText="Beginning of the reporting period"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Report End Date"
              type="date"
              fullWidth
              value={reportConfig.reportPeriod?.endDate || ''}
              onChange={(e) => handleInputChange('reportPeriod', {
                ...reportConfig.reportPeriod,
                endDate: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
              helperText="End of the reporting period"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Report Purpose Statement"
              multiline
              rows={2}
              fullWidth
              value={reportConfig.customText?.reportPurpose || ''}
              onChange={(e) => handleInputChange('customText', {
                ...reportConfig.customText,
                reportPurpose: e.target.value
              })}
              placeholder={`During the reporting period, ${reportConfig.departmentName || '[Department Name]'} responded to [X] incidents.`}
              helperText="Opening statement that describes the scope and timeframe of this report"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Executive Summary Description"
              multiline
              rows={2}
              fullWidth
              value={reportConfig.customText?.executiveSummaryDescription || ''}
              onChange={(e) => handleInputChange('customText', {
                ...reportConfig.customText,
                executiveSummaryDescription: e.target.value
              })}
              placeholder="High-level overview for mayors and department leadership"
              helperText="Brief description of what this report provides for executive leadership"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Chief's Message (Optional)"
              multiline
              rows={3}
              fullWidth
              value={reportConfig.customText?.chiefMessage || ''}
              onChange={(e) => handleInputChange('customText', {
                ...reportConfig.customText,
                chiefMessage: e.target.value
              })}
              placeholder="Personal message from the Fire Chief about department performance, initiatives, or acknowledgments..."
              helperText="Optional personal message from the Fire Chief that will appear on the title page"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Report Sections */}
        <Typography variant="h6" gutterBottom>
          3. Include Sections
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {[
            { key: 'summary', label: 'Executive Summary', desc: 'Key metrics and overview' },
            { key: 'nfpaCompliance', label: 'NFPA 1710 Compliance', desc: 'Compliance analysis and standards' },
            { key: 'incidentDetails', label: 'Incident Details', desc: 'Detailed incident table' },
            { key: 'charts', label: 'Charts & Graphs', desc: 'Visual data representation' },
            { key: 'recommendations', label: 'Recommendations', desc: 'Action items and suggestions' }
          ].map(section => (
            <Grid item xs={12} sm={6} key={section.key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeSections?.[section.key as keyof ReportConfig['includeSections']] || false}
                    onChange={() => handleSectionToggle(section.key as keyof ReportConfig['includeSections'])}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">{section.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {section.desc}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>

        {/* Report Preview */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Report Preview:</strong>
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`${incidents.length} incidents`} size="small" />
            <Chip label={`${selectedSections.length} sections`} size="small" />
            <Chip label={`~${estimatedPages} pages`} size="small" />
            <Chip 
              label={`${reportConfig.reportPeriod?.startDate} to ${reportConfig.reportPeriod?.endDate}`} 
              size="small" 
            />
          </Stack>
        </Alert>

        {/* Generation Status */}
        {generationStatus && (
          <Alert 
            severity={generationStatus.success ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            icon={generationStatus.success ? <CheckCircleIcon /> : undefined}
          >
            {generationStatus.message}
            {generationStatus.filename && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                File: {generationStatus.filename}
              </Typography>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={isGenerating ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
          onClick={handleGenerateReport}
          disabled={isGenerating || !reportConfig.departmentName?.trim() || selectedSections.length === 0}
        >
          {isGenerating ? 'Generating...' : 'Generate PDF Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportGenerator;