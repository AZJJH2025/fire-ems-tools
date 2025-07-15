/**
 * ISO Score Calculator Component
 * 
 * Implements the complete Fire Suppression Rating Schedule (FSRS) scoring system
 * with 105.5 total points across four categories:
 * - Fire Department Operations (50 points)
 * - Water Supply (40 points)  
 * - Emergency Communications (10 points)
 * - Community Risk Reduction (5.5 bonus points)
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Security as ISOIcon,
  LocalFireDepartment as FireDeptIcon,
  Water as WaterIcon,
  Phone as CommunicationsIcon,
  School as CommunityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface ISOAssessment {
  fireDepartment: {
    staffing: number;           // Personnel deployment and availability
    equipment: number;          // NFPA 1901 apparatus and equipment requirements
    training: number;           // Training hours and certification programs
    distribution: number;       // Station coverage and response capabilities
  };
  waterSupply: {
    capacity: number;           // Flow rates, pressure, and reliability
    distribution: number;       // Hydrant spacing and coverage areas
    alternative: number;        // Dry hydrants, tanker operations, rural supplies
  };
  communications: {
    dispatch: number;           // 911 center capabilities and response times
    alerting: number;          // Notification and radio systems
  };
  communityRiskReduction: {
    prevention: number;         // Fire prevention and code enforcement
    education: number;          // Public education and outreach programs
    investigation: number;      // Fire investigation capabilities
  };
}

interface ISOScoreCalculatorProps {
  assessment: ISOAssessment | null;
  currentScore: number;
  classification: number;
  sidebarOpen: boolean;
  isMobile: boolean;
}

const ISOScoreCalculator: React.FC<ISOScoreCalculatorProps> = ({
  assessment,
  currentScore: _currentScore,
  classification: _classification,
  sidebarOpen: _sidebarOpen,
  isMobile: _isMobile
}) => {
  
  /**
   * Calculate Fire Department score (50 points maximum)
   */
  const calculateFireDepartmentScore = (): number => {
    if (!assessment) return 0;
    
    const { staffing, equipment, training, distribution } = assessment.fireDepartment;
    
    // Each subcategory worth 12.5 points (50 / 4)
    const staffingScore = Math.min(staffing, 12.5);
    const equipmentScore = Math.min(equipment, 12.5);
    const trainingScore = Math.min(training, 12.5);
    const distributionScore = Math.min(distribution, 12.5);
    
    return staffingScore + equipmentScore + trainingScore + distributionScore;
  };
  
  /**
   * Calculate Water Supply score (40 points maximum)
   */
  const calculateWaterSupplyScore = (): number => {
    if (!assessment) return 0;
    
    const { capacity, distribution, alternative } = assessment.waterSupply;
    
    // Water supply breakdown: capacity (20), distribution (15), alternative (5)
    const capacityScore = Math.min(capacity, 20);
    const distributionScore = Math.min(distribution, 15);
    const alternativeScore = Math.min(alternative, 5);
    
    return capacityScore + distributionScore + alternativeScore;
  };
  
  /**
   * Calculate Emergency Communications score (10 points maximum)
   */
  const calculateCommunicationsScore = (): number => {
    if (!assessment) return 0;
    
    const { dispatch, alerting } = assessment.communications;
    
    // Communications breakdown: dispatch (7), alerting (3)
    const dispatchScore = Math.min(dispatch, 7);
    const alertingScore = Math.min(alerting, 3);
    
    return dispatchScore + alertingScore;
  };
  
  /**
   * Calculate Community Risk Reduction score (5.5 bonus points maximum)
   */
  const calculateCommunityRiskReductionScore = (): number => {
    if (!assessment) return 0;
    
    const { prevention, education, investigation } = assessment.communityRiskReduction;
    
    // CRR breakdown: prevention (2.5), education (2), investigation (1)
    const preventionScore = Math.min(prevention, 2.5);
    const educationScore = Math.min(education, 2);
    const investigationScore = Math.min(investigation, 1);
    
    return preventionScore + educationScore + investigationScore;
  };
  
  /**
   * Calculate total ISO score with divergence adjustment
   */
  const calculateTotalScore = (): number => {
    const fireDeptScore = calculateFireDepartmentScore();
    const waterSupplyScore = calculateWaterSupplyScore();
    const communicationsScore = calculateCommunicationsScore();
    const crrScore = calculateCommunityRiskReductionScore();
    
    let baseScore = fireDeptScore + waterSupplyScore + communicationsScore;
    
    // Apply divergence adjustment if fire dept and water supply scores differ significantly
    const fireDeptPercent = fireDeptScore / 50;
    const waterSupplyPercent = waterSupplyScore / 40;
    const divergence = Math.abs(fireDeptPercent - waterSupplyPercent);
    
    if (divergence > 0.1) {
      // Apply downward adjustment for significant divergence
      const adjustment = divergence * 10; // Simplified divergence formula
      baseScore = Math.max(0, baseScore - adjustment);
    }
    
    return baseScore + crrScore;
  };
  
  /**
   * Determine ISO classification from score
   */
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
  
  /**
   * Get performance level based on percentage score
   */
  const getPerformanceLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) {
      return { 
        level: 'EXCELLENT', 
        color: '#1b5e20', 
        bg: '#e8f5e8', 
        icon: <CheckIcon />,
        description: 'Top 10% of departments'
      };
    } else if (percentage >= 75) {
      return { 
        level: 'GOOD', 
        color: '#2e7d32', 
        bg: '#f1f8e9', 
        icon: <CheckIcon />,
        description: 'Above average performance'
      };
    } else if (percentage >= 60) {
      return { 
        level: 'NEEDS IMPROVEMENT', 
        color: '#ff8f00', 
        bg: '#fff8e1', 
        icon: <WarningIcon />,
        description: 'Below average - opportunity exists'
      };
    } else {
      return { 
        level: 'CRITICAL', 
        color: '#d32f2f', 
        bg: '#ffebee', 
        icon: <ErrorIcon />,
        description: 'Major deficiency affecting rating'
      };
    }
  };

  /**
   * Get classification color and description
   */
  const getClassificationInfo = (classification: number) => {
    switch (classification) {
      case 1:
        return { color: '#1b5e20', bg: '#e8f5e8', desc: 'Superior Protection', icon: <CheckIcon />, benchmark: 'Elite - Top 1% of departments' };
      case 2:
      case 3:
        return { color: '#2e7d32', bg: '#f1f8e9', desc: 'Excellent Protection', icon: <CheckIcon />, benchmark: 'Top 25% of departments' };
      case 4:
      case 5:
        return { color: '#558b2f', bg: '#f9fbe7', desc: 'Good Protection', icon: <CheckIcon />, benchmark: 'Above average for community size' };
      case 6:
      case 7:
        return { color: '#ff8f00', bg: '#fff8e1', desc: 'Fair Protection', icon: <WarningIcon />, benchmark: 'Below average - improvement needed' };
      case 8:
      case 9:
        return { color: '#f57c00', bg: '#fff3e0', desc: 'Poor Protection', icon: <WarningIcon />, benchmark: 'Bottom 25% - significant gaps' };
      case 10:
      default:
        return { color: '#d32f2f', bg: '#ffebee', desc: 'Inadequate Protection', icon: <ErrorIcon />, benchmark: 'Critical deficiencies present' };
    }
  };

  /**
   * Get improvement recommendations for specific categories
   */
  // const _getImprovementRecommendations = (_categoryScore: number, _maxScore: number, _category: string) => {
  //   const percentage = (categoryScore / maxScore) * 100;
  //   const missingPoints = maxScore - categoryScore;
  //   
  //   if (percentage >= 90) return null; // No recommendations needed
  //   
  //   const recommendations: string[] = [];
  //   
  //   switch (category) {
  //     case 'staffing':
  //       if (percentage < 75) {
  //         recommendations.push(`Add ${Math.ceil(missingPoints / 2)} firefighters per shift`);
  //         recommendations.push('Implement automatic mutual aid agreements');
  //       }
  //       break;
  //     case 'training':
  //       if (percentage < 75) {
  //         recommendations.push('Document monthly training hours (need 20+ hrs)');
  //         recommendations.push('Implement structured training record system');
  //       }
  //       break;
  //     case 'waterSupply':
  //       if (percentage < 75) {
  //         recommendations.push('Install additional hydrants in coverage gaps');
  //         recommendations.push('Upgrade water main capacity');
  //       }
  //       break;
  //     case 'communications':
  //       if (percentage < 75) {
  //         recommendations.push('Improve dispatch protocols and training');
  //         recommendations.push('Upgrade radio communication systems');
  //       }
  //       break;
  //   }
  //   
  //   return recommendations;
  // };
  
  // Calculate current scores
  const fireDeptScore = calculateFireDepartmentScore();
  const waterSupplyScore = calculateWaterSupplyScore();
  const communicationsScore = calculateCommunicationsScore();
  const crrScore = calculateCommunityRiskReductionScore();
  const totalScore = calculateTotalScore();
  const calculatedClassification = getClassificationFromScore(totalScore);
  const classificationInfo = getClassificationInfo(calculatedClassification);
  
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ISOIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          ISO Fire Rating Assessment
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Fire Suppression Rating Schedule (FSRS) Analysis - 105.5 Point System
        </Typography>
      </Box>
      
      {/* Current Classification Display */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(135deg, ${classificationInfo.bg} 0%, #ffffff 100%)`,
          border: `2px solid ${classificationInfo.color}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" sx={{ color: classificationInfo.color, fontWeight: 'bold', mb: 1 }}>
                {calculatedClassification}
              </Typography>
              <Chip 
                icon={classificationInfo.icon}
                label={`Class ${calculatedClassification}`}
                sx={{ 
                  bgcolor: classificationInfo.color, 
                  color: 'white',
                  fontSize: '1.1rem',
                  px: 2,
                  py: 1
                }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ color: classificationInfo.color, mb: 1 }}>
              {classificationInfo.desc}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontStyle: 'italic' }}>
              📊 {classificationInfo.benchmark}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Total Score: {totalScore.toFixed(1)} / 105.5 points
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(totalScore / 105.5) * 100}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: classificationInfo.color
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {((totalScore / 105.5) * 100).toFixed(1)}% of maximum possible score
            </Typography>
            
            {/* Next Class Target */}
            {calculatedClassification > 1 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  🎯 Path to Class {calculatedClassification - 1}:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need {(Math.ceil((calculatedClassification - 1) * 10.55) - totalScore).toFixed(1)} more points
                  {calculatedClassification === 5 && " (90+ points for Class 4 - significant insurance savings)"}
                  {calculatedClassification === 2 && " (95+ points for Class 1 - elite rating)"}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Score Breakdown Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Fire Department Operations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FireDeptIcon sx={{ color: '#ff5722', mr: 1 }} />
                  <Typography variant="h6">Fire Department Operations</Typography>
                </Box>
                {(() => {
                  const performanceLevel = getPerformanceLevel(fireDeptScore, 50);
                  return (
                    <Chip 
                      icon={performanceLevel.icon}
                      label={performanceLevel.level}
                      size="small"
                      sx={{ 
                        bgcolor: performanceLevel.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })()}
              </Box>
              
              <Typography variant="h4" sx={{ color: '#ff5722', mb: 1 }}>
                {fireDeptScore.toFixed(1)} / 50
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {((fireDeptScore / 50) * 100).toFixed(0)}% • {getPerformanceLevel(fireDeptScore, 50).description}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(fireDeptScore / 50) * 100}
                sx={{ 
                  mb: 2,
                  '& .MuiLinearProgress-bar': { bgcolor: '#ff5722' }
                }}
              />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const staffingPerf = getPerformanceLevel(assessment?.fireDepartment?.staffing || 0, 12.5);
                      return <Box sx={{ color: staffingPerf.color }}>{staffingPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Staffing: ${assessment?.fireDepartment?.staffing?.toFixed(1) || '0.0'} / 12.5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Engine Company:</strong> Minimum 3 firefighters + 1 officer (4 total)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Ladder Company:</strong> Minimum 3 firefighters + 1 officer (4 total)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>On-Duty Staffing:</strong> 24/7 coverage with sufficient personnel
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Response Goal:</strong> 15 firefighters within 8 minutes for structure fires
                        </Typography>
                        {assessment?.fireDepartment?.staffing && assessment.fireDepartment.staffing < 9.5 && (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            💡 Need: +{Math.ceil((9.5 - assessment.fireDepartment.staffing) / 2)} firefighters per shift
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const equipmentPerf = getPerformanceLevel(assessment?.fireDepartment?.equipment || 0, 12.5);
                      return <Box sx={{ color: equipmentPerf.color }}>{equipmentPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Equipment: ${assessment?.fireDepartment?.equipment?.toFixed(1) || '0.0'} / 12.5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Equipment Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Engine Companies:</strong> 1,000+ GPM pump, 300+ gallons water tank
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Ladder Companies:</strong> 75-100 ft aerial ladder or platform
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Ground Ladders:</strong> 115 ft total (various lengths)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>SCBA:</strong> 10 sets minimum per engine/ladder company
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Hose:</strong> 3,000 ft of 2½" hose per engine company
                        </Typography>
                        {assessment?.fireDepartment?.equipment && assessment.fireDepartment.equipment >= 10 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Equipment meets community requirements
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ⚠️ Review apparatus compliance with NFPA 1901 standards
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const trainingPerf = getPerformanceLevel(assessment?.fireDepartment?.training || 0, 12.5);
                      return <Box sx={{ color: trainingPerf.color }}>{trainingPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Training: ${assessment?.fireDepartment?.training?.toFixed(1) || '0.0'} / 12.5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Training Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Structure Fire:</strong> 20+ hours per firefighter per month
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Basic Training:</strong> Firefighter I & II certification required
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Officer Training:</strong> Fire Officer I minimum for company officers
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Specialized Training:</strong> Hazmat, rescue, EMS as applicable
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Documentation:</strong> Detailed training records maintained
                        </Typography>
                        {assessment?.fireDepartment?.training && assessment.fireDepartment.training < 9.5 ? (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            📚 Need: +{Math.ceil((10 - assessment.fireDepartment.training) * 2)} additional training hours/month
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Training program meets ISO standards
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const distributionPerf = getPerformanceLevel(assessment?.fireDepartment?.distribution || 0, 12.5);
                      return <Box sx={{ color: distributionPerf.color }}>{distributionPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Distribution: ${assessment?.fireDepartment?.distribution?.toFixed(1) || '0.0'} / 12.5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Distribution Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Engine Coverage:</strong> ≤1.5 mile road distance for engines
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Ladder Coverage:</strong> ≤2.5 mile road distance for aerials
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Response Time:</strong> ≤5 minutes (240 seconds) travel time
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>First Due Area:</strong> ≤5 square miles per engine company
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Station Location:</strong> Strategically placed for optimal coverage
                        </Typography>
                        {assessment?.fireDepartment?.distribution && assessment.fireDepartment.distribution >= 10 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Station distribution meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            📍 Consider additional station or relocate existing station
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Water Supply */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WaterIcon sx={{ color: '#2196f3', mr: 1 }} />
                  <Typography variant="h6">Water Supply</Typography>
                </Box>
                {(() => {
                  const performanceLevel = getPerformanceLevel(waterSupplyScore, 40);
                  return (
                    <Chip 
                      icon={performanceLevel.icon}
                      label={performanceLevel.level}
                      size="small"
                      sx={{ 
                        bgcolor: performanceLevel.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })()}
              </Box>
              
              <Typography variant="h4" sx={{ color: '#2196f3', mb: 1 }}>
                {waterSupplyScore.toFixed(1)} / 40
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {((waterSupplyScore / 40) * 100).toFixed(0)}% • {getPerformanceLevel(waterSupplyScore, 40).description}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(waterSupplyScore / 40) * 100}
                sx={{ 
                  mb: 2,
                  '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                }}
              />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const capacityPerf = getPerformanceLevel(assessment?.waterSupply?.capacity || 0, 20);
                      return <Box sx={{ color: capacityPerf.color }}>{capacityPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Capacity: ${assessment?.waterSupply?.capacity?.toFixed(1) || '0.0'} / 20`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Water Flow Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Minimum Flow:</strong> 250 GPM for 2 hours (Class 8B areas)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Residential:</strong> 500-750 GPM for typical single-family homes
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Commercial:</strong> 1,500-3,500+ GPM for large buildings
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Pressure:</strong> 20 PSI residual minimum during flow test
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Duration:</strong> Maintain flow for minimum 2 hours
                        </Typography>
                        {assessment?.waterSupply?.capacity && assessment.waterSupply.capacity >= 15 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Water system meets ISO flow requirements
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            💧 Need: Water main upgrades or booster pump systems
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const distributionPerf = getPerformanceLevel(assessment?.waterSupply?.distribution || 0, 15);
                      return <Box sx={{ color: distributionPerf.color }}>{distributionPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Distribution: ${assessment?.waterSupply?.distribution?.toFixed(1) || '0.0'} / 15`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Hydrant Distribution Standards:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Spacing:</strong> ≤1,000 ft from any point to nearest hydrant
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Commercial Areas:</strong> ≤500 ft spacing between hydrants
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Residential Areas:</strong> ≤800 ft spacing between hydrants
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Arterial Streets:</strong> ≤600 ft maximum spacing
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Dead End Streets:</strong> ≤500 ft from end of street
                        </Typography>
                        {assessment?.waterSupply?.distribution && assessment.waterSupply.distribution >= 12 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Hydrant distribution meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            🔧 Need: {Math.ceil((12 - (assessment?.waterSupply?.distribution || 0)) * 2)} additional hydrants
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const alternativePerf = getPerformanceLevel(assessment?.waterSupply?.alternative || 0, 5);
                      return <Box sx={{ color: alternativePerf.color }}>{alternativePerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Alternative: ${assessment?.waterSupply?.alternative?.toFixed(1) || '0.0'} / 5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Alternative Water Supply Options:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Dry Hydrants:</strong> 6" minimum diameter, 500+ GPM capacity
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Tanker Shuttles:</strong> 1,000+ gallon capacity per tanker
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Static Sources:</strong> Ponds, lakes with ≥30,000 gallons
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Mobile Supply:</strong> Portable tanks, fold-a-tanks for operations
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Fill Sites:</strong> Designated locations for tanker refill
                        </Typography>
                        {assessment?.waterSupply?.alternative && assessment.waterSupply.alternative >= 3 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Alternative water supply systems adequate
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            🚛 Need: Additional tankers or dry hydrant installation
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Emergency Communications */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CommunicationsIcon sx={{ color: '#9c27b0', mr: 1 }} />
                  <Typography variant="h6">Emergency Communications</Typography>
                </Box>
                {(() => {
                  const performanceLevel = getPerformanceLevel(communicationsScore, 10);
                  return (
                    <Chip 
                      icon={performanceLevel.icon}
                      label={performanceLevel.level}
                      size="small"
                      sx={{ 
                        bgcolor: performanceLevel.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })()}
              </Box>
              
              <Typography variant="h4" sx={{ color: '#9c27b0', mb: 1 }}>
                {communicationsScore.toFixed(1)} / 10
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {((communicationsScore / 10) * 100).toFixed(0)}% • {getPerformanceLevel(communicationsScore, 10).description}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(communicationsScore / 10) * 100}
                sx={{ 
                  mb: 2,
                  '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0' }
                }}
              />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const dispatchPerf = getPerformanceLevel(assessment?.communications?.dispatch || 0, 7);
                      return <Box sx={{ color: dispatchPerf.color }}>{dispatchPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Dispatch: ${assessment?.communications?.dispatch?.toFixed(1) || '0.0'} / 7`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO 911 Dispatch Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>24/7 Operations:</strong> Full-time dispatchers on duty
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Call Processing:</strong> Emergency calls answered within 15 seconds
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Dispatch Time:</strong> Units dispatched within 60 seconds
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Equipment:</strong> CAD system, mapping, multiple phone lines
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Training:</strong> EMD certification, continuing education
                        </Typography>
                        {assessment?.communications?.dispatch && assessment.communications.dispatch >= 6 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Dispatch center meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            📞 Need: Enhanced dispatch training and equipment upgrades
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const alertingPerf = getPerformanceLevel(assessment?.communications?.alerting || 0, 3);
                      return <Box sx={{ color: alertingPerf.color }}>{alertingPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Alerting: ${assessment?.communications?.alerting?.toFixed(1) || '0.0'} / 3`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Alerting System Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Radio System:</strong> VHF/UHF digital trunked preferred
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Coverage:</strong> 95%+ mobile and portable coverage area
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Backup Power:</strong> 24-hour minimum battery backup
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Station Alerting:</strong> Automated station notification systems
                        </Typography>
                        {assessment?.communications?.alerting && assessment.communications.alerting >= 2.5 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Communication systems meet ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            📡 Need: Radio system upgrades or coverage improvements
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Community Risk Reduction */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CommunityIcon sx={{ color: '#4caf50', mr: 1 }} />
                  <Typography variant="h6">Community Risk Reduction</Typography>
                  <Chip label="BONUS" size="small" sx={{ ml: 1, bgcolor: '#4caf50', color: 'white' }} />
                </Box>
                {(() => {
                  const performanceLevel = getPerformanceLevel(crrScore, 5.5);
                  return (
                    <Chip 
                      icon={performanceLevel.icon}
                      label={performanceLevel.level}
                      size="small"
                      sx={{ 
                        bgcolor: performanceLevel.color, 
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })()}
              </Box>
              
              <Typography variant="h4" sx={{ color: '#4caf50', mb: 1 }}>
                {crrScore.toFixed(1)} / 5.5
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                {((crrScore / 5.5) * 100).toFixed(0)}% • Bonus points toward total score
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(crrScore / 5.5) * 100}
                sx={{ 
                  mb: 2,
                  '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }
                }}
              />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const preventionPerf = getPerformanceLevel(assessment?.communityRiskReduction?.prevention || 0, 2.5);
                      return <Box sx={{ color: preventionPerf.color }}>{preventionPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Prevention: ${assessment?.communityRiskReduction?.prevention?.toFixed(1) || '0.0'} / 2.5`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Fire Prevention Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Fire Inspector:</strong> Certified fire inspector on staff
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Code Enforcement:</strong> Adopt current fire codes (IFC/NFPA)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Plan Review:</strong> Review building plans for fire safety
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Inspections:</strong> Annual inspections of commercial buildings
                        </Typography>
                        {assessment?.communityRiskReduction?.prevention && assessment.communityRiskReduction.prevention >= 2 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Fire prevention program meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            🔍 Need: Certified fire inspector and active inspection program
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const educationPerf = getPerformanceLevel(assessment?.communityRiskReduction?.education || 0, 2);
                      return <Box sx={{ color: educationPerf.color }}>{educationPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Education: ${assessment?.communityRiskReduction?.education?.toFixed(1) || '0.0'} / 2`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Public Education Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>School Programs:</strong> Fire safety education in schools K-12
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Public Outreach:</strong> Community fire safety events/programs
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>High-Risk Groups:</strong> Senior citizens, disabled residents
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Documentation:</strong> Maintain records of education activities
                        </Typography>
                        {assessment?.communityRiskReduction?.education && assessment.communityRiskReduction.education >= 1.5 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Public education program meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            🏫 Need: Expand school programs and community outreach
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {(() => {
                      const investigationPerf = getPerformanceLevel(assessment?.communityRiskReduction?.investigation || 0, 1);
                      return <Box sx={{ color: investigationPerf.color }}>{investigationPerf.icon}</Box>;
                    })()}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Investigation: ${assessment?.communityRiskReduction?.investigation?.toFixed(1) || '0.0'} / 1`}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          <strong>ISO Fire Investigation Requirements:</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          • <strong>Trained Investigator:</strong> Fire investigator certification
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Origin & Cause:</strong> Determine fire cause and origin
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Documentation:</strong> Detailed investigation reports
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          • <strong>Evidence Collection:</strong> Proper evidence handling procedures
                        </Typography>
                        {assessment?.communityRiskReduction?.investigation && assessment.communityRiskReduction.investigation >= 0.8 ? (
                          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            ✅ Fire investigation program meets ISO standards
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ff8f00', display: 'block', mt: 1, fontWeight: 'bold' }}>
                            🔍 Need: Train certified fire investigator
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Assessment Status */}
      {!assessment && (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Assessment Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Use the sidebar to input your fire department's capabilities and generate an ISO score assessment.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ISOScoreCalculator;