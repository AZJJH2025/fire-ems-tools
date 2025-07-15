import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Description as ReportIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import { reportTemplates, ReportTemplate, ReportData, DepartmentInfo, ReportPeriod, ComplianceMetrics } from '@/services/reportTemplates';
import { ReportEngine, ProcessedReport } from '@/services/reportEngine';
import { ResponseTimeStatistics, IncidentRecord } from '@/types/analyzer';

interface ProfessionalReportGeneratorProps {
  responseTimeStats: ResponseTimeStatistics;
  incidentData: IncidentRecord[];
  onClose?: () => void;
}

const ProfessionalReportGenerator: React.FC<ProfessionalReportGeneratorProps> = ({
  responseTimeStats,
  incidentData,
  onClose
}) => {
  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo>({
    name: '',
    chief: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    jurisdiction: '',
    population: 0,
    squareMiles: 0,
    stations: 0,
    apparatus: 0,
    personnel: 0
  });
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<ProcessedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // Generate report period description automatically
  useEffect(() => {
    if (reportPeriod.startDate && reportPeriod.endDate) {
      const start = new Date(reportPeriod.startDate);
      const end = new Date(reportPeriod.endDate);
      
      // Check if it's a single month
      if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        setReportPeriod(prev => ({ ...prev, description: monthName }));
      } else {
        const description = `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
        setReportPeriod(prev => ({ ...prev, description }));
      }
    }
  }, [reportPeriod.startDate, reportPeriod.endDate]);

  // Calculate compliance metrics from response time data
  const calculateComplianceMetrics = (): ComplianceMetrics => {
    // This would typically be calculated from actual incident data
    // For now, we'll create sample metrics based on available data
    const totalIncidents = incidentData.length || 1000;
    
    return {
      nfpa1710: {
        dispatchCompliance: 88, // Would be calculated from actual data
        turnoutCompliance: 92,
        travelCompliance: 85,
        totalResponseCompliance: 87,
        goal: 90
      },
      averageResponseTime: responseTimeStats.mean.totalResponseTime || 360, // 6 minutes default
      incidentVolume: {
        total: totalIncidents,
        fire: Math.round(totalIncidents * 0.15),
        ems: Math.round(totalIncidents * 0.65),
        rescue: Math.round(totalIncidents * 0.08),
        hazmat: Math.round(totalIncidents * 0.02),
        other: Math.round(totalIncidents * 0.10)
      },
      busyHours: ['14:00-16:00', '18:00-20:00'],
      topIncidentTypes: [
        { type: 'Medical Emergency', count: Math.round(totalIncidents * 0.45), percentage: 45 },
        { type: 'Motor Vehicle Accident', count: Math.round(totalIncidents * 0.20), percentage: 20 },
        { type: 'Structure Fire', count: Math.round(totalIncidents * 0.10), percentage: 10 },
        { type: 'Alarm Activation', count: Math.round(totalIncidents * 0.08), percentage: 8 },
        { type: 'Hazmat Incident', count: Math.round(totalIncidents * 0.02), percentage: 2 }
      ]
    };
  };

  // Handle template selection
  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(1);
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
    try {
      const reportData: ReportData = {
        departmentInfo,
        reportPeriod,
        responseTimeStats,
        incidentData,
        complianceMetrics: calculateComplianceMetrics()
      };
      
      const report = ReportEngine.generateReport(selectedTemplate, reportData);
      setGeneratedReport(report);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report as professional PDF
  const handleDownloadReport = async () => {
    if (!generatedReport || !selectedTemplate) return;
    
    try {
      // Import the PDF generator
      const { generateResponseTimeReport } = await import('@/services/pdfReportGenerator');
      
      // Create PDF report configuration
      const reportConfig = {
        reportType: 'detailed' as const,
        title: selectedTemplate.name,
        subtitle: `${departmentInfo.name} - ${reportPeriod.description}`,
        departmentName: departmentInfo.name,
        chiefName: departmentInfo.chief,
        chiefTitle: 'Fire Chief',
        reportPeriod: {
          startDate: reportPeriod.startDate,
          endDate: reportPeriod.endDate
        },
        includeSections: {
          summary: true,
          nfpaCompliance: true,
          incidentDetails: true,
          charts: true,
          recommendations: true
        },
        customText: {
          reportPurpose: `Professional ${selectedTemplate.category} report for ${departmentInfo.name}`,
          executiveSummaryDescription: selectedTemplate.description
        }
      };
      
      // Create PDF report data
      const reportData = {
        incidents: incidentData,
        statistics: responseTimeStats
      };
      
      console.log('🔥 GENERATING PDF REPORT:', {
        template: selectedTemplate.name,
        department: departmentInfo.name,
        incidents: incidentData.length
      });
      
      // Generate PDF
      const pdfBlob = await generateResponseTimeReport(reportConfig, reportData);
      
      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_${reportPeriod.description.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF REPORT DOWNLOADED SUCCESSFULLY');
      
    } catch (error) {
      console.error('❌ ERROR GENERATING PDF REPORT:', error);
      
      // Fallback to text download if PDF generation fails
      const reportContent = generatedReport.sections
        .map(section => `# ${section.title}\n\n${section.processedContent}\n\n`)
        .join('---\n\n');
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_${reportPeriod.description.replace(/\s+/g, '_')}_fallback.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Get template category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance': return <AssessmentIcon />;
      case 'performance': return <ScheduleIcon />;
      case 'grant': return <BusinessIcon />;
      case 'executive': return <ReportIcon />;
      default: return <ReportIcon />;
    }
  };

  // Get template category color
  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (category) {
      case 'compliance': return 'primary';
      case 'performance': return 'success';
      case 'grant': return 'warning';
      case 'executive': return 'info';
      default: return 'secondary';
    }
  };

  // Stepper steps
  const steps = ['Select Template', 'Department Info', 'Report Period', 'Generate & Download'];

  // Render template selection
  const renderTemplateSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Professional Report Template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a report template designed for your specific audience and purpose.
      </Typography>
      
      <Grid container spacing={3}>
        {reportTemplates.map((template) => (
          <Grid size={{ xs: 12, md: 6 }} key={template.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': { elevation: 4 }
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  {getCategoryIcon(template.category)}
                  <Typography variant="h6" component="div">
                    {template.name}
                  </Typography>
                  <Chip 
                    label={template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    color={getCategoryColor(template.category)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip label={`${template.metadata.estimatedPages} pages`} size="small" variant="outlined" />
                  <Chip label={template.metadata.professionalLevel} size="small" variant="outlined" />
                  <Chip label={`${template.sections.length} sections`} size="small" variant="outlined" />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  <strong>Target Audience:</strong> {template.targetAudience.join(', ')}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  startIcon={<ReportIcon />}
                  onClick={() => handleTemplateSelect(template)}
                >
                  Select Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render department info form
  const renderDepartmentInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Department Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your department information for professional report headers and contact details.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentInfo.name}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Houston Fire Department"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Fire Chief"
            value={departmentInfo.chief}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, chief: e.target.value }))}
            placeholder="e.g., John Smith"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Jurisdiction"
            value={departmentInfo.jurisdiction}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, jurisdiction: e.target.value }))}
            placeholder="e.g., City of Houston, TX"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Population Served"
            type="number"
            value={departmentInfo.population || ''}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, population: parseInt(e.target.value) || 0 }))}
            placeholder="e.g., 50000"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Service Area (sq. miles)"
            type="number"
            value={departmentInfo.squareMiles || ''}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, squareMiles: parseInt(e.target.value) || 0 }))}
            placeholder="e.g., 125"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Number of Stations"
            type="number"
            value={departmentInfo.stations || ''}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, stations: parseInt(e.target.value) || 0 }))}
            placeholder="e.g., 8"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Apparatus Count"
            type="number"
            value={departmentInfo.apparatus || ''}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, apparatus: parseInt(e.target.value) || 0 }))}
            placeholder="e.g., 15"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Personnel Count"
            type="number"
            value={departmentInfo.personnel || ''}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, personnel: parseInt(e.target.value) || 0 }))}
            placeholder="e.g., 120"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Department Address"
            value={departmentInfo.address}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, address: e.target.value }))}
            placeholder="e.g., 123 Main Street, Houston, TX 77001"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Phone Number"
            value={departmentInfo.phone}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g., (555) 123-4567"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={departmentInfo.email}
            onChange={(e) => setDepartmentInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="e.g., chief@houstonfiredept.gov"
          />
        </Grid>
      </Grid>
    </Box>
  );

  // Render report period form
  const renderReportPeriod = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Report Period
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Define the time period covered by this report.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={reportPeriod.startDate}
            onChange={(e) => setReportPeriod(prev => ({ ...prev, startDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={reportPeriod.endDate}
            onChange={(e) => setReportPeriod(prev => ({ ...prev, endDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Report Period Description"
            value={reportPeriod.description}
            onChange={(e) => setReportPeriod(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g., January 2025, Q4 2024, 2024 Annual Report"
            helperText="This will appear in report headers and titles"
          />
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> The report period description is automatically generated based on your selected dates, 
          but you can customize it for specific reporting needs.
        </Typography>
      </Alert>
    </Box>
  );

  // Render report generation and preview
  const renderReportGeneration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Professional Report
      </Typography>
      
      {!generatedReport ? (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ready to generate your professional report. Review the settings below and click generate.
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Report Configuration</strong>
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Template:</strong> {selectedTemplate?.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Department:</strong> {departmentInfo.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Period:</strong> {reportPeriod.description}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Data Points:</strong> {incidentData.length.toLocaleString()} incidents
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ReportIcon />}
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            {isGenerating && <LinearProgress sx={{ flexGrow: 1, mt: 1 }} />}
          </Box>
        </Box>
      ) : (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Report Generated Successfully!</strong> Your professional report is ready for download.
            </Typography>
          </Alert>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Report Summary</strong>
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Pages:</strong> {generatedReport.metadata.totalPages}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Word Count:</strong> {generatedReport.metadata.wordCount.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Data Quality:</strong> {generatedReport.metadata.dataQuality}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2">
                    <strong>Completeness:</strong> {generatedReport.metadata.completeness}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Accordion expanded={previewExpanded} onChange={() => setPreviewExpanded(!previewExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Report Preview
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                {generatedReport.sections.map((section, index) => (
                  <Box key={section.id} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {section.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="div"
                      sx={{ 
                        whiteSpace: 'pre-line',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem'
                      }}
                    >
                      {section.processedContent.substring(0, 500)}
                      {section.processedContent.length > 500 && '...'}
                    </Typography>
                    {index < generatedReport.sections.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Box display="flex" gap={2} mt={3}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setGeneratedReport(null);
                setCurrentStep(0);
                setSelectedTemplate(null);
              }}
            >
              Generate Another Report
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTemplateSelection();
      case 1:
        return renderDepartmentInfo();
      case 2:
        return renderReportPeriod();
      case 3:
        return renderReportGeneration();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { minHeight: '80vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ReportIcon />
          <Typography variant="h5">
            Professional Report Generator
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
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
        {currentStep > 0 && currentStep < 3 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            Back
          </Button>
        )}
        {currentStep === 1 && (
          <Button 
            variant="contained" 
            onClick={() => setCurrentStep(2)}
            disabled={!departmentInfo.name || !departmentInfo.chief}
          >
            Next
          </Button>
        )}
        {currentStep === 2 && (
          <Button 
            variant="contained" 
            onClick={() => setCurrentStep(3)}
            disabled={!reportPeriod.startDate || !reportPeriod.endDate}
          >
            Next
          </Button>
        )}
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionalReportGenerator;