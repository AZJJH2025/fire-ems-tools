/**
 * ISO Improvement Planner Component
 * 
 * Provides actionable improvement recommendations with cost estimates,
 * priority rankings, and cost-benefit analysis for community insurance savings.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as CostIcon,
  Timeline as ROIIcon,
  LocalFireDepartment as FireDeptIcon,
  Water as WaterIcon,
  Phone as CommunicationsIcon,
  School as CommunityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  PriorityHigh as PriorityIcon,
  AccessTime as TimeIcon,
  Business as InsuranceIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

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

interface ImprovementRecommendation {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  pointsGain: number;
  estimatedCost: number;
  implementationTime: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  difficulty: 'EASY' | 'MODERATE' | 'COMPLEX';
  requirements: string[];
  benefits: string[];
  fundingSources: string[];
}

interface ISOImprovementPlannerProps {
  assessment: ISOAssessment | null;
  currentScore: number;
  classification: number;
  communityProfile: {
    population: number;
    avgHomePremium: number;
    commercialPremiums: number;
  };
}

const ISOImprovementPlanner: React.FC<ISOImprovementPlannerProps> = ({
  assessment,
  currentScore,
  classification,
  communityProfile
}) => {

  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [showCostBenefit, setShowCostBenefit] = useState(false);
  const [showCostCustomization, setShowCostCustomization] = useState(true);
  
  // Customizable cost parameters with realistic ranges
  const [costParameters, setCostParameters] = useState({
    firefighterAnnualCost: 75000,      // $40k - $120k (regional variation)
    apparatusCost: 800000,             // $200k - $3M (engines $200-600k, ladders $750k-$2.7M, multiple units needed)
    trainingProgramCost: 8000,         // $2k - $20k (complexity and resources)
    hydrantInstallationCost: 12000,    // $6k - $25k (soil conditions, depth)
    waterSystemUpgradeCost: 1500000,   // $800k - $5M (scope and infrastructure)
    constructionMultiplier: 1.0,       // 0.7 - 1.8 (regional cost multiplier)
  });

  /**
   * Handle cost parameter changes
   */
  const handleCostParameterChange = (parameter: string, value: number) => {
    setCostParameters(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  /**
   * Generate comprehensive improvement recommendations
   */
  const generateRecommendations = (): ImprovementRecommendation[] => {
    if (!assessment) return [];

    const recommendations: ImprovementRecommendation[] = [];

    // Fire Department Recommendations
    if (assessment.fireDepartment.staffing < 10) {
      recommendations.push({
        category: 'Fire Department',
        subcategory: 'Staffing',
        title: 'Increase Minimum Staffing Levels',
        description: 'Add firefighters to meet NFPA 1720 minimum staffing requirements for initial response',
        pointsGain: 10 - assessment.fireDepartment.staffing,
        estimatedCost: (10 - assessment.fireDepartment.staffing) * costParameters.firefighterAnnualCost,
        implementationTime: '6-12 months',
        priority: 'HIGH',
        difficulty: 'COMPLEX',
        requirements: [
          'Budget approval from city council',
          'Recruitment and hiring process',
          'Training and certification programs',
          'Additional equipment and PPE'
        ],
        benefits: [
          'Faster initial response times',
          'Improved firefighter safety',
          'Better emergency scene management',
          'Enhanced public confidence'
        ],
        fundingSources: [
          'FEMA Assistance to Firefighters Grant (AFG)',
          'FEMA Staffing for Adequate Fire and Emergency Response (SAFER)',
          'State fire department grants',
          'Municipal bond financing'
        ]
      });
    }

    if (assessment.fireDepartment.training < 10) {
      recommendations.push({
        category: 'Fire Department',
        subcategory: 'Training',
        title: 'Implement Structured Training Program',
        description: 'Establish documented training program with minimum 20 hours monthly per firefighter',
        pointsGain: 10 - assessment.fireDepartment.training,
        estimatedCost: costParameters.trainingProgramCost,
        implementationTime: '3-6 months',
        priority: 'HIGH',
        difficulty: 'MODERATE',
        requirements: [
          'Training officer designation',
          'Training facility or agreements',
          'Record keeping system',
          'Curriculum development'
        ],
        benefits: [
          'Improved firefighter competency',
          'Better emergency outcomes',
          'Reduced liability exposure',
          'ISO credit improvement'
        ],
        fundingSources: [
          'FEMA AFG Training grants',
          'State fire training academies',
          'Regional training consortiums',
          'Municipal training budgets'
        ]
      });
    }

    if (assessment.fireDepartment.equipment < 10) {
      recommendations.push({
        category: 'Fire Department',
        subcategory: 'Equipment',
        title: 'Upgrade Apparatus and Equipment',
        description: 'Purchase NFPA 1901 compliant apparatus and maintain proper equipment inventory',
        pointsGain: 10 - assessment.fireDepartment.equipment,
        estimatedCost: costParameters.apparatusCost,
        implementationTime: '12-24 months',
        priority: 'HIGH',
        difficulty: 'COMPLEX',
        requirements: [
          'Capital improvement planning',
          'Specifications development',
          'Procurement process',
          'Training on new equipment'
        ],
        benefits: [
          'Improved fire suppression capability',
          'Enhanced equipment reliability',
          'Better firefighter safety',
          'Community protection upgrade'
        ],
        fundingSources: [
          'FEMA AFG Equipment grants',
          'Municipal bonds',
          'State equipment grants',
          'Regional equipment sharing'
        ]
      });
    }

    // Water Supply Recommendations
    if (assessment.waterSupply.capacity < 15) {
      recommendations.push({
        category: 'Water Supply',
        subcategory: 'Capacity',
        title: 'Improve Water System Capacity',
        description: 'Upgrade water mains and pumping capacity to meet fire flow requirements',
        pointsGain: 15 - assessment.waterSupply.capacity,
        estimatedCost: costParameters.waterSystemUpgradeCost * costParameters.constructionMultiplier,
        implementationTime: '18-36 months',
        priority: 'HIGH',
        difficulty: 'COMPLEX',
        requirements: [
          'Water system engineering study',
          'Municipal utility coordination',
          'Construction permits',
          'Public works coordination'
        ],
        benefits: [
          'Increased fire suppression capability',
          'Better residential water pressure',
          'Enhanced commercial protection',
          'Significant ISO improvement'
        ],
        fundingSources: [
          'EPA Drinking Water State Revolving Fund',
          'USDA Rural Development grants',
          'Municipal utility bonds',
          'State infrastructure grants'
        ]
      });
    }

    if (assessment.waterSupply.distribution < 12) {
      recommendations.push({
        category: 'Water Supply',
        subcategory: 'Distribution',
        title: 'Install Additional Fire Hydrants',
        description: 'Add hydrants to reduce spacing and improve coverage areas',
        pointsGain: 12 - assessment.waterSupply.distribution,
        estimatedCost: (12 - assessment.waterSupply.distribution) * costParameters.hydrantInstallationCost * costParameters.constructionMultiplier,
        implementationTime: '6-12 months',
        priority: 'MEDIUM',
        difficulty: 'MODERATE',
        requirements: [
          'Hydrant spacing analysis',
          'Water main connections',
          'Installation permits',
          'Ongoing maintenance program'
        ],
        benefits: [
          'Reduced hose lay distances',
          'Faster fire attack setup',
          'Better neighborhood protection',
          'Lower insurance rates for residents'
        ],
        fundingSources: [
          'Municipal capital improvements',
          'Water utility funds',
          'Community development grants',
          'Special assessment districts'
        ]
      });
    }

    // Communications Recommendations
    if (assessment.communications.dispatch < 6) {
      recommendations.push({
        category: 'Communications',
        subcategory: 'Dispatch',
        title: 'Improve Dispatch Operations',
        description: 'Upgrade dispatch protocols, training, and equipment for faster call processing',
        pointsGain: 6 - assessment.communications.dispatch,
        estimatedCost: 150000 * costParameters.constructionMultiplier,
        implementationTime: '6-12 months',
        priority: 'MEDIUM',
        difficulty: 'MODERATE',
        requirements: [
          'Dispatch training enhancement',
          'Protocol documentation',
          'Equipment upgrades',
          'Quality assurance program'
        ],
        benefits: [
          'Faster emergency response',
          'Better call processing times',
          'Improved coordination',
          'Enhanced public safety'
        ],
        fundingSources: [
          'FEMA Emergency Communications grants',
          'State 911 improvement funds',
          'Regional communications consortiums',
          'Municipal emergency services budget'
        ]
      });
    }

    // Community Risk Reduction Recommendations
    if (assessment.communityRiskReduction.prevention < 2) {
      recommendations.push({
        category: 'Community Risk Reduction',
        subcategory: 'Prevention',
        title: 'Establish Fire Prevention Program',
        description: 'Implement code enforcement and fire prevention inspection program',
        pointsGain: 2 - assessment.communityRiskReduction.prevention,
        estimatedCost: 85000 * costParameters.constructionMultiplier,
        implementationTime: '6-12 months',
        priority: 'LOW',
        difficulty: 'MODERATE',
        requirements: [
          'Fire prevention officer training',
          'Code adoption and enforcement',
          'Inspection scheduling system',
          'Public education materials'
        ],
        benefits: [
          'Reduced fire incidents',
          'Better building code compliance',
          'Enhanced community safety',
          'Bonus ISO points'
        ],
        fundingSources: [
          'FEMA Fire Prevention grants',
          'Municipal code enforcement budget',
          'State fire prevention programs',
          'Community foundation grants'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      // Sort by priority, then by points gained per dollar
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by efficiency (points per dollar)
      const aEfficiency = a.pointsGain / a.estimatedCost;
      const bEfficiency = b.pointsGain / b.estimatedCost;
      return bEfficiency - aEfficiency;
    });
  };

  /**
   * Calculate potential insurance savings for community
   * Based on industry research: 3-10% savings per classification improvement
   */
  const calculateInsuranceSavings = (classificationsImproved: number): number => {
    // Conservative estimate based on research validation
    const avgSavingsPerClass = 0.07; // 7% per class improvement (validated range: 3-10%)
    const totalSavings = classificationsImproved * avgSavingsPerClass;
    
    // Community-wide annual savings
    const residentialSavings = communityProfile.population * 0.4 * communityProfile.avgHomePremium * totalSavings;
    const commercialSavings = communityProfile.commercialPremiums * totalSavings;
    
    return residentialSavings + commercialSavings;
  };

  /**
   * Calculate total cost and benefits of selected recommendations
   */
  const calculateProjectCosts = () => {
    const recommendations = generateRecommendations();
    const selected = recommendations.filter(rec => selectedRecommendations.includes(rec.title));
    
    const totalCost = selected.reduce((sum, rec) => sum + rec.estimatedCost, 0);
    const totalPointsGain = selected.reduce((sum, rec) => sum + rec.pointsGain, 0);
    const newScore = currentScore + totalPointsGain;
    const currentClass = getClassificationFromScore(currentScore);
    const newClass = getClassificationFromScore(newScore);
    const classImprovement = Math.max(0, currentClass - newClass);
    const annualSavings = calculateInsuranceSavings(classImprovement);
    const paybackPeriod = totalCost / Math.max(annualSavings, 1);

    return {
      totalCost,
      totalPointsGain,
      newScore,
      newClass,
      classImprovement,
      annualSavings,
      paybackPeriod
    };
  };

  /**
   * Get ISO classification from score
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
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '#d32f2f';
      case 'MEDIUM': return '#ff8f00';
      case 'LOW': return '#2e7d32';
      default: return '#757575';
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fire Department': return <FireDeptIcon />;
      case 'Water Supply': return <WaterIcon />;
      case 'Communications': return <CommunicationsIcon />;
      case 'Community Risk Reduction': return <CommunityIcon />;
      default: return <TrendingUpIcon />;
    }
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const recommendations = generateRecommendations();
  const projectCosts = calculateProjectCosts();

  if (!assessment) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Complete your ISO assessment to see improvement recommendations
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          ISO Improvement Planner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Strategic recommendations to improve your ISO classification with cost-benefit analysis
        </Typography>
      </Box>

      {/* Current Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Current Score</Typography>
              <Typography variant="h3" color="primary">{currentScore.toFixed(1)}</Typography>
              <Typography variant="body2">out of 105.5 points</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Current Classification</Typography>
              <Typography variant="h3" color="primary">Class {classification}</Typography>
              <Typography variant="body2">ISO rating</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Improvement Opportunities</Typography>
              <Typography variant="h3" color="secondary">{recommendations.length}</Typography>
              <Typography variant="body2">recommendations available</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Cost Customization Panel */}
      <Accordion sx={{ mb: 3 }} expanded={showCostCustomization} onChange={() => setShowCostCustomization(!showCostCustomization)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TuneIcon color="primary" />
            <Box>
              <Typography variant="h6">Customize Cost Parameters</Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust costs based on your regional market conditions and department specifications
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Firefighter Annual Cost (salary + benefits): {formatCurrency(costParameters.firefighterAnnualCost)}</FormLabel>
                <Slider
                  value={costParameters.firefighterAnnualCost}
                  onChange={(_, value) => handleCostParameterChange('firefighterAnnualCost', value as number)}
                  min={40000}
                  max={120000}
                  step={5000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  marks={[
                    { value: 40000, label: '$40k' },
                    { value: 75000, label: '$75k' },
                    { value: 120000, label: '$120k' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Rural departments: $40-60k | Suburban: $60-85k | Urban/High COL: $85-120k
                </Typography>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Fire Apparatus Cost (per unit): {formatCurrency(costParameters.apparatusCost)}</FormLabel>
                <Slider
                  value={costParameters.apparatusCost}
                  onChange={(_, value) => handleCostParameterChange('apparatusCost', value as number)}
                  min={200000}
                  max={3000000}
                  step={50000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  marks={[
                    { value: 200000, label: '$200k' },
                    { value: 800000, label: '$800k' },
                    { value: 1500000, label: '$1.5M' },
                    { value: 2700000, label: '$2.7M' },
                    { value: 3000000, label: '$3M' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Engine: $200-600k | Pumper: $400-800k | Ladder: $750k-2.7M | Specialty: $1M-3M (cost per apparatus - departments typically need multiple units)
                </Typography>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Training Program Implementation: {formatCurrency(costParameters.trainingProgramCost)}</FormLabel>
                <Slider
                  value={costParameters.trainingProgramCost}
                  onChange={(_, value) => handleCostParameterChange('trainingProgramCost', value as number)}
                  min={2000}
                  max={20000}
                  step={1000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  marks={[
                    { value: 2000, label: '$2k' },
                    { value: 8000, label: '$8k' },
                    { value: 20000, label: '$20k' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Basic program: $2-5k | Comprehensive: $8-15k | Advanced multi-discipline: $15-20k
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Hydrant Installation Cost: {formatCurrency(costParameters.hydrantInstallationCost)}</FormLabel>
                <Slider
                  value={costParameters.hydrantInstallationCost}
                  onChange={(_, value) => handleCostParameterChange('hydrantInstallationCost', value as number)}
                  min={6000}
                  max={25000}
                  step={1000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  marks={[
                    { value: 6000, label: '$6k' },
                    { value: 12000, label: '$12k' },
                    { value: 25000, label: '$25k' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Easy access: $6-10k | Standard: $10-15k | Difficult terrain/deep lines: $15-25k
                </Typography>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Water System Upgrade: {formatCurrency(costParameters.waterSystemUpgradeCost)}</FormLabel>
                <Slider
                  value={costParameters.waterSystemUpgradeCost}
                  onChange={(_, value) => handleCostParameterChange('waterSystemUpgradeCost', value as number)}
                  min={800000}
                  max={5000000}
                  step={100000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  marks={[
                    { value: 800000, label: '$0.8M' },
                    { value: 1500000, label: '$1.5M' },
                    { value: 5000000, label: '$5M' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Minor upgrades: $0.8-1.2M | Major infrastructure: $1.5-3M | Complete overhaul: $3-5M
                </Typography>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Regional Cost Multiplier: {costParameters.constructionMultiplier.toFixed(1)}x</FormLabel>
                <Slider
                  value={costParameters.constructionMultiplier}
                  onChange={(_, value) => handleCostParameterChange('constructionMultiplier', value as number)}
                  min={0.7}
                  max={1.8}
                  step={0.1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 0.7, label: '0.7x' },
                    { value: 1.0, label: '1.0x' },
                    { value: 1.5, label: '1.5x' },
                    { value: 1.8, label: '1.8x' }
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Rural/Low COL: 0.7-0.9x | National average: 1.0x | High COL areas: 1.2-1.8x
                </Typography>
              </FormControl>
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Regional Examples:</strong> Rural Alabama (0.7x), National Average (1.0x), 
              San Francisco Bay Area (1.6x), Manhattan (1.8x). 
              Adjust based on local contractor quotes and labor market conditions.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Recommendations */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Improvement Recommendations
        <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 2 }}>
          (Updated with your cost parameters)
        </Typography>
      </Typography>

      {recommendations.map((rec, index) => (
        <Accordion key={index} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ mr: 2 }}>
                {getCategoryIcon(rec.category)}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{rec.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label={rec.priority} 
                    size="small" 
                    sx={{ backgroundColor: getPriorityColor(rec.priority), color: 'white' }}
                  />
                  <Chip 
                    label={`+${rec.pointsGain} points`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={formatCurrency(rec.estimatedCost)} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1" paragraph>
                  {rec.description}
                </Typography>
                
                <Typography variant="h6" gutterBottom>Requirements</Typography>
                <List dense>
                  {rec.requirements.map((req, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <CheckIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Benefits</Typography>
                <List dense>
                  {rec.benefits.map((benefit, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <TrendingUpIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Project Details</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CostIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Cost:</strong> {formatCurrency(rec.estimatedCost)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TimeIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Timeline:</strong> {rec.implementationTime}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PriorityIcon sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        <strong>Difficulty:</strong> {rec.difficulty}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>Funding Sources</Typography>
                    {rec.fundingSources.map((source, idx) => (
                      <Chip 
                        key={idx}
                        label={source}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Cost-Benefit Analysis Toggle */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<ROIIcon />}
          onClick={() => setShowCostBenefit(!showCostBenefit)}
        >
          {showCostBenefit ? 'Hide' : 'Show'} Cost-Benefit Analysis
        </Button>
      </Box>

      {/* Cost-Benefit Analysis */}
      {showCostBenefit && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Community Insurance Savings Analysis
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Cost-Benefit Analysis Disclaimer:</strong> ISO classification improvements typically reduce property insurance premiums by 3-10% per class improvement (industry-validated). 
              Cost estimates are based on national averages and should be refined with local contractor quotes. 
              Actual savings vary by insurance company - some insurers don't use ISO ratings.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Implementation Costs</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Estimated Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.slice(0, 5).map((rec, index) => (
                      <TableRow key={index}>
                        <TableCell>{rec.title}</TableCell>
                        <TableCell align="right">{formatCurrency(rec.estimatedCost)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell><strong>Total Estimated Cost</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0))}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Projected Benefits</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Classification: Class {classification}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Projected Classification: Class {Math.max(1, classification - 2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Classification Improvement: {Math.min(2, classification - 1)} classes
                </Typography>
              </Box>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InsuranceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Annual Community Savings</Typography>
                  </Box>
                  
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(calculateInsuranceSavings(Math.min(2, classification - 1)))}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Based on {communityProfile.population.toLocaleString()} residents and average premiums
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2">
                    <strong>Payback Period:</strong> {(recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0) / calculateInsuranceSavings(Math.min(2, classification - 1))).toFixed(1)} years
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ISOImprovementPlanner;