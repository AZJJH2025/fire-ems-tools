import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  LocalFireDepartment,
  CheckCircle,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DepartmentInfo {
  departmentName: string;
  departmentType: 'volunteer' | 'career' | 'combination';
  chiefName: string;
  email: string;
  password: string;
  confirmPassword: string;
  population: string;
  stations: string;
  city: string;
  state: string;
}

interface PricingPlan {
  id: 'trial' | 'professional';
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '30 Days Free',
    badge: 'Start Here',
    features: [
      'Full access to all 6 tools',
      'Unlimited PDF reports',
      'All professional features',
      'No credit card required',
      'Cancel anytime'
    ],
    recommended: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$59/month',
    features: [
      'Everything in trial',
      'Unlimited departments',
      'Template sharing',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'NFPA compliance reports'
    ]
  }
];

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'professional'>('trial');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo>({
    departmentName: '',
    departmentType: 'career',
    chiefName: '',
    email: '',
    password: '',
    confirmPassword: '',
    population: '',
    stations: '',
    city: '',
    state: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof DepartmentInfo, value: string) => {
    setDepartmentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: string[] = [];

    if (stepNumber === 1) {
      if (!departmentInfo.departmentName.trim()) newErrors.push('Department name is required');
      if (!departmentInfo.chiefName.trim()) newErrors.push('Fire Chief name is required');
      if (!departmentInfo.email.trim()) newErrors.push('Email is required');
      if (!departmentInfo.email.includes('@')) newErrors.push('Valid email is required');
    }

    if (stepNumber === 2) {
      if (!departmentInfo.password) newErrors.push('Password is required');
      if (departmentInfo.password.length < 8) newErrors.push('Password must be at least 8 characters');
      if (departmentInfo.password !== departmentInfo.confirmPassword) newErrors.push('Passwords do not match');
      if (!departmentInfo.city.trim()) newErrors.push('City is required');
      if (!departmentInfo.state.trim()) newErrors.push('State is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(3, prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    try {
      const response = await fetch('/auth/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: departmentInfo.email,
          password: departmentInfo.password,
          name: departmentInfo.chiefName,
          departmentName: departmentInfo.departmentName,
          departmentType: departmentInfo.departmentType
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Registration successful:', result.user);
        // Redirect to login with success message
        navigate('/login?signup=success');
      } else {
        // Handle registration error
        alert(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0', mb: 3 }}>
              Department Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Fire Department Name"
                  value={departmentInfo.departmentName}
                  onChange={(e) => handleInputChange('departmentName', e.target.value)}
                  placeholder="e.g., Houston Fire Department"
                  required
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Department Type</InputLabel>
                  <Select
                    value={departmentInfo.departmentType}
                    onChange={(e) => handleInputChange('departmentType', e.target.value)}
                    label="Department Type"
                  >
                    <MenuItem value="volunteer">Volunteer</MenuItem>
                    <MenuItem value="career">Career</MenuItem>
                    <MenuItem value="combination">Combination</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Estimated Population Served"
                  value={departmentInfo.population}
                  onChange={(e) => handleInputChange('population', e.target.value)}
                  placeholder="e.g., 25000"
                  type="number"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Fire Chief Name"
                  value={departmentInfo.chiefName}
                  onChange={(e) => handleInputChange('chiefName', e.target.value)}
                  placeholder="e.g., Chief John Smith"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={departmentInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="chief@department.gov"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0', mb: 3 }}>
              Account Security & Location
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={departmentInfo.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  helperText="Minimum 8 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={departmentInfo.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={departmentInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Houston"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={departmentInfo.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., TX"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Number of Stations"
                  value={departmentInfo.stations}
                  onChange={(e) => handleInputChange('stations', e.target.value)}
                  placeholder="e.g., 3"
                  type="number"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0', mb: 3 }}>
              Choose Your Plan
            </Typography>
            
            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
              {pricingPlans.map((plan) => (
                <Grid size={{ xs: 12, md: 6 }} key={plan.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      border: selectedPlan === plan.id ? '2px solid #1565c0' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {(plan.recommended || plan.badge) && (
                      <Chip
                        label={plan.badge || "Recommended"}
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 1,
                          bgcolor: plan.badge ? '#4caf50' : '#1565c0',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ pb: 1, pt: plan.recommended ? 3 : 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {plan.price}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {plan.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircle sx={{ color: '#4caf50', fontSize: 18, mr: 1 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Start with a full 30-day free trial - no credit card required. Cancel anytime or continue with our affordable Professional plan.
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      {/* Header */}
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <LocalFireDepartment sx={{ fontSize: 40, color: '#1565c0', mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
            FireEMS.AI
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="text" 
            onClick={() => navigate('/login')}
            sx={{ color: '#1565c0', fontWeight: 'bold' }}
          >
            Already have an account? Sign In
          </Button>
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[1, 2, 3].map((stepNumber) => (
              <Box key={stepNumber} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: step >= stepNumber ? '#1565c0' : '#e0e0e0',
                    color: step >= stepNumber ? 'white' : '#757575',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {stepNumber}
                </Box>
                {stepNumber < 3 && (
                  <Box
                    sx={{
                      width: 60,
                      height: 2,
                      bgcolor: step > stepNumber ? '#1565c0' : '#e0e0e0',
                      mx: 1
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
          <Typography variant="body2" align="center" color="text.secondary">
            Step {step} of 3: {step === 1 ? 'Department Info' : step === 2 ? 'Account Setup' : 'Choose Plan'}
          </Typography>
        </Box>

        {/* Main Content */}
        <Paper sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Box>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2">• {error}</Typography>
                ))}
              </Box>
            </Alert>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={step === 1 ? () => navigate('/') : handleBack}
              sx={{ minWidth: 120 }}
            >
              {step === 1 ? 'Back to Home' : 'Back'}
            </Button>
            
            <Button
              variant="contained"
              onClick={step === 3 ? handleSubmit : handleNext}
              sx={{ minWidth: 120 }}
            >
              {step === 3 ? 'Create Account' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUpPage;