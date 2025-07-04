/**
 * ISO Report Generator Component
 * 
 * Generates professional PDF reports for ISO assessments including:
 * - Current ISO classification analysis
 * - Improvement recommendations
 * - Cost-benefit analysis for community insurance savings
 * - Grant application supporting documentation
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
  Paper,
  Alert,
  TextField,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { ISOReportGenerator as ISOPDFGenerator, ISOReportConfig, ISOReportData } from '../../services/isoReportGenerator';

interface ISOReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  assessment: any;
  score: number;
  classification: number;
}

const ISOReportGenerator: React.FC<ISOReportGeneratorProps> = ({
  open,
  onClose,
  assessment,
  score,
  classification
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [departmentName, setDepartmentName] = useState('Fire Department');
  const [chiefName, setChiefName] = useState('Fire Chief');
  
  const handleGenerateReport = async () => {
    console.log('🏆 Generating ISO Credit Report:', {
      assessment,
      score,
      classification
    });
    
    setIsGenerating(true);
    
    try {
      // Prepare report configuration
      const config: ISOReportConfig = {
        template: 'iso_assessment_report',
        departmentName,
        chiefName,
        reportDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      
      // Prepare report data
      const reportData: ISOReportData = {
        currentScore: score,
        classification,
        assessment,
        communityProfile: {
          population: 25000, // Default values - could be made configurable
          avgHomePremium: 1200,
          commercialPremiums: 125000
        }
      };
      
      // Generate PDF using proven pattern
      const pdfGenerator = new ISOPDFGenerator(config, reportData);
      const pdfBlob = await pdfGenerator.generateReport();
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ISO_Assessment_Report_${departmentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ ISO PDF Report generated successfully');
      
    } catch (error) {
      console.error('❌ ISO PDF generation failed:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">ISO Credit Report Generator</Typography>
          <Button
            onClick={onClose}
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          Generate professional PDF reports for ISO assessments with customizable department information.
        </Alert>
        
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Department Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department Name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                variant="outlined"
                placeholder="Houston Fire Department"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fire Chief Name"
                value={chiefName}
                onChange={(e) => setChiefName(e.target.value)}
                variant="outlined"
                placeholder="Fire Chief John Smith"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Features:
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li><strong>ISO Classification Analysis</strong> - Current score breakdown and classification</li>
              <li><strong>Category Performance</strong> - Fire Department, Water Supply, Communications, CRR</li>
              <li><strong>Compliance Analysis</strong> - Detailed performance assessment</li>
              <li><strong>Improvement Recommendations</strong> - Specific areas for ISO score enhancement</li>
              <li><strong>Professional Tables</strong> - Structured data presentation</li>
              <li><strong>Department Branding</strong> - Custom department information</li>
            </ul>
          </Typography>
        </Paper>

        {assessment && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Assessment Summary:
            </Typography>
            <Typography variant="body1">
              <strong>ISO Classification:</strong> Class {classification}<br />
              <strong>Total Score:</strong> {score.toFixed(1)} / 105.5 points<br />
              <strong>Score Percentage:</strong> {((score / 105.5) * 100).toFixed(1)}%
            </Typography>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          onClick={handleGenerateReport}
          variant="contained"
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          disabled={!assessment || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate PDF Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ISOReportGenerator;