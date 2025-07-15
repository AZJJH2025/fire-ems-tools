/**
 * ISO Credit Calculator Sidebar
 * 
 * Provides input forms for all four ISO assessment categories:
 * - Fire Department Operations (50 points)
 * - Water Supply (40 points)
 * - Emergency Communications (10 points)  
 * - Community Risk Reduction (5.5 bonus points)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Grid,
  Chip,
  FormControlLabel,
  Switch,
  Button,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalFireDepartment as FireDeptIcon,
  Water as WaterIcon,
  Phone as CommunicationsIcon,
  School as CommunityIcon,
  Calculate as CalculateIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';

interface ISOSidebarProps {
  mode?: 'assessment' | 'planning' | 'presentation';
  onAssessmentChange: (assessment: any) => void;
  onScoreChange: (score: number) => void;
  onClassificationChange: (classification: number) => void;
}

const ISOSidebar: React.FC<ISOSidebarProps> = ({
  mode: _mode = 'assessment',
  onAssessmentChange,
  onScoreChange,
  onClassificationChange
}) => {
  // Assessment state
  const [assessment, setAssessment] = useState({
    fireDepartment: {
      staffing: 0,
      equipment: 0,
      training: 0,
      distribution: 0
    },
    waterSupply: {
      capacity: 0,
      distribution: 0,
      alternative: 0
    },
    communications: {
      dispatch: 0,
      alerting: 0
    },
    communityRiskReduction: {
      prevention: 0,
      education: 0,
      investigation: 0
    }
  });

  // UI state
  const [expandedPanel, setExpandedPanel] = useState<string>('fire-department');
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Update parent component when assessment changes
  useEffect(() => {
    onAssessmentChange(assessment);
    
    if (autoCalculate) {
      calculateScore();
    }
  }, [assessment, autoCalculate]);

  const calculateScore = () => {
    // Calculate total score
    const fireDeptScore = Object.values(assessment.fireDepartment).reduce((sum, val) => sum + val, 0);
    const waterSupplyScore = Object.values(assessment.waterSupply).reduce((sum, val) => sum + val, 0);
    const communicationsScore = Object.values(assessment.communications).reduce((sum, val) => sum + val, 0);
    const crrScore = Object.values(assessment.communityRiskReduction).reduce((sum, val) => sum + val, 0);
    
    const totalScore = fireDeptScore + waterSupplyScore + communicationsScore + crrScore;
    const classification = getClassificationFromScore(totalScore);
    
    onScoreChange(totalScore);
    onClassificationChange(classification);
  };

  const getClassificationFromScore = (score: number): number => {
    const percentage = (score / 105.5) * 100;
    
    if (percentage >= 90) return 1;
    if (percentage >= 80) return 2;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 4;
    if (percentage >= 50) return 5;
    if (percentage >= 40) return 6;
    if (percentage >= 30) return 7;
    if (percentage >= 20) return 8;
    if (percentage >= 10) return 9;
    return 10;
  };

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : '');
  };

  const updateFireDepartment = (field: string, value: number) => {
    setAssessment(prev => ({
      ...prev,
      fireDepartment: {
        ...prev.fireDepartment,
        [field]: value
      }
    }));
  };

  const updateWaterSupply = (field: string, value: number) => {
    setAssessment(prev => ({
      ...prev,
      waterSupply: {
        ...prev.waterSupply,
        [field]: value
      }
    }));
  };

  const updateCommunications = (field: string, value: number) => {
    setAssessment(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        [field]: value
      }
    }));
  };

  const updateCommunityRiskReduction = (field: string, value: number) => {
    setAssessment(prev => ({
      ...prev,
      communityRiskReduction: {
        ...prev.communityRiskReduction,
        [field]: value
      }
    }));
  };

  const resetAssessment = () => {
    setAssessment({
      fireDepartment: { staffing: 0, equipment: 0, training: 0, distribution: 0 },
      waterSupply: { capacity: 0, distribution: 0, alternative: 0 },
      communications: { dispatch: 0, alerting: 0 },
      communityRiskReduction: { prevention: 0, education: 0, investigation: 0 }
    });
  };

  const getCurrentTotal = () => {
    return Object.values(assessment.fireDepartment).reduce((sum, val) => sum + val, 0) +
           Object.values(assessment.waterSupply).reduce((sum, val) => sum + val, 0) +
           Object.values(assessment.communications).reduce((sum, val) => sum + val, 0) +
           Object.values(assessment.communityRiskReduction).reduce((sum, val) => sum + val, 0);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          ISO Assessment Input
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your fire department's capabilities to calculate ISO classification
        </Typography>
        
        {/* Current Score Display */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Current Score: {getCurrentTotal().toFixed(1)} / 105.5
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(getCurrentTotal() / 105.5) * 100}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalculateIcon />}
              onClick={calculateScore}
              disabled={autoCalculate}
              fullWidth
            >
              Calculate
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ResetIcon />}
              onClick={resetAssessment}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
        
        <FormControlLabel
          control={
            <Switch
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              size="small"
            />
          }
          label="Auto-calculate"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Assessment Accordions */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Fire Department Operations (50 points) */}
        <Accordion 
          expanded={expandedPanel === 'fire-department'} 
          onChange={handleAccordionChange('fire-department')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <FireDeptIcon sx={{ color: '#ff5722' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">Fire Department</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Object.values(assessment.fireDepartment).reduce((sum, val) => sum + val, 0).toFixed(1)} / 50 points
                </Typography>
              </Box>
              <Chip 
                label="50 pts" 
                size="small" 
                sx={{ bgcolor: '#ff5722', color: 'white' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ space: 2 }}>
              {/* Staffing */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Staffing & Personnel Deployment (12.5 pts)
                </Typography>
                <Slider
                  value={assessment.fireDepartment.staffing}
                  onChange={(_, value) => updateFireDepartment('staffing', value as number)}
                  min={0}
                  max={12.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5722' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Personnel availability, response times, staffing levels
                </Typography>
              </Box>

              {/* Equipment */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Equipment & Apparatus (12.5 pts)
                </Typography>
                <Slider
                  value={assessment.fireDepartment.equipment}
                  onChange={(_, value) => updateFireDepartment('equipment', value as number)}
                  min={0}
                  max={12.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5722' }}
                />
                <Typography variant="caption" color="text.secondary">
                  NFPA 1901 compliance, maintenance, testing
                </Typography>
              </Box>

              {/* Training */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Training Programs (12.5 pts)
                </Typography>
                <Slider
                  value={assessment.fireDepartment.training}
                  onChange={(_, value) => updateFireDepartment('training', value as number)}
                  min={0}
                  max={12.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5722' }}
                />
                <Typography variant="caption" color="text.secondary">
                  20+ hours/month structure fire training = 2.25 pts
                </Typography>
              </Box>

              {/* Distribution */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Station Distribution & Coverage (12.5 pts)
                </Typography>
                <Slider
                  value={assessment.fireDepartment.distribution}
                  onChange={(_, value) => updateFireDepartment('distribution', value as number)}
                  min={0}
                  max={12.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#ff5722' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Station locations, response coverage, mutual aid
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Water Supply (40 points) */}
        <Accordion 
          expanded={expandedPanel === 'water-supply'} 
          onChange={handleAccordionChange('water-supply')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <WaterIcon sx={{ color: '#2196f3' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">Water Supply</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Object.values(assessment.waterSupply).reduce((sum, val) => sum + val, 0).toFixed(1)} / 40 points
                </Typography>
              </Box>
              <Chip 
                label="40 pts" 
                size="small" 
                sx={{ bgcolor: '#2196f3', color: 'white' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ space: 2 }}>
              {/* Capacity */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Water Capacity & Flow (20 pts)
                </Typography>
                <Slider
                  value={assessment.waterSupply.capacity}
                  onChange={(_, value) => updateWaterSupply('capacity', value as number)}
                  min={0}
                  max={20}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#2196f3' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Minimum 250 GPM for 2 hours (Class 8B: 200 GPM for 20 min)
                </Typography>
              </Box>

              {/* Distribution */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Hydrant Distribution (15 pts)
                </Typography>
                <Slider
                  value={assessment.waterSupply.distribution}
                  onChange={(_, value) => updateWaterSupply('distribution', value as number)}
                  min={0}
                  max={15}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#2196f3' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Hydrant spacing max 1,000 feet from incidents
                </Typography>
              </Box>

              {/* Alternative */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Alternative Water Supply (5 pts)
                </Typography>
                <Slider
                  value={assessment.waterSupply.alternative}
                  onChange={(_, value) => updateWaterSupply('alternative', value as number)}
                  min={0}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#2196f3' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Dry hydrants, tanker shuttles, rural supplies
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Emergency Communications (10 points) */}
        <Accordion 
          expanded={expandedPanel === 'communications'} 
          onChange={handleAccordionChange('communications')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <CommunicationsIcon sx={{ color: '#9c27b0' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">Communications</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Object.values(assessment.communications).reduce((sum, val) => sum + val, 0).toFixed(1)} / 10 points
                </Typography>
              </Box>
              <Chip 
                label="10 pts" 
                size="small" 
                sx={{ bgcolor: '#9c27b0', color: 'white' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ space: 2 }}>
              {/* Dispatch */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  911 Dispatch Center (7 pts)
                </Typography>
                <Slider
                  value={assessment.communications.dispatch}
                  onChange={(_, value) => updateCommunications('dispatch', value as number)}
                  min={0}
                  max={7}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#9c27b0' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Call processing, dispatch times, capabilities
                </Typography>
              </Box>

              {/* Alerting */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Alerting Systems (3 pts)
                </Typography>
                <Slider
                  value={assessment.communications.alerting}
                  onChange={(_, value) => updateCommunications('alerting', value as number)}
                  min={0}
                  max={3}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#9c27b0' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Radio systems, pagers, notification equipment
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Community Risk Reduction (5.5 bonus points) */}
        <Accordion 
          expanded={expandedPanel === 'community-risk'} 
          onChange={handleAccordionChange('community-risk')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <CommunityIcon sx={{ color: '#4caf50' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">Community Risk Reduction</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Object.values(assessment.communityRiskReduction).reduce((sum, val) => sum + val, 0).toFixed(1)} / 5.5 points
                </Typography>
              </Box>
              <Chip 
                label="BONUS" 
                size="small" 
                sx={{ bgcolor: '#4caf50', color: 'white' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ space: 2 }}>
              {/* Prevention */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Fire Prevention (2.5 pts)
                </Typography>
                <Slider
                  value={assessment.communityRiskReduction.prevention}
                  onChange={(_, value) => updateCommunityRiskReduction('prevention', value as number)}
                  min={0}
                  max={2.5}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#4caf50' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Code enforcement, inspections, prevention programs
                </Typography>
              </Box>

              {/* Education */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Public Education (2 pts)
                </Typography>
                <Slider
                  value={assessment.communityRiskReduction.education}
                  onChange={(_, value) => updateCommunityRiskReduction('education', value as number)}
                  min={0}
                  max={2}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#4caf50' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Community outreach, education programs
                </Typography>
              </Box>

              {/* Investigation */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Fire Investigation (1 pt)
                </Typography>
                <Slider
                  value={assessment.communityRiskReduction.investigation}
                  onChange={(_, value) => updateCommunityRiskReduction('investigation', value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#4caf50' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Fire investigation capabilities and training
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ISOSidebar;