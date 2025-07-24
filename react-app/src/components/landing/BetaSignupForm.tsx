import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { trackBetaSignup, trackFunnel, trackConversion } from '../../utils/analytics';

interface FormData {
  departmentName: string;
  contactName: string;
  email: string;
  state: string;
  phone?: string;
  position?: string;
}

const BetaSignupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    departmentName: '',
    contactName: '',
    email: '',
    state: '',
    phone: '',
    position: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [hasStartedForm, setHasStartedForm] = useState(false);

  // Track form view when component mounts
  useEffect(() => {
    trackBetaSignup.formView();
    trackFunnel.betaFormView();
  }, []);

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming'
  ];

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Track form start on first input change
    if (!hasStartedForm) {
      setHasStartedForm(true);
      trackBetaSignup.formStart();
    }

    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const validateForm = (): boolean => {
    return !!(
      formData.departmentName.trim() && 
      formData.contactName.trim() && 
      formData.email.trim() && 
      formData.state
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Analytics tracking
    trackBetaSignup.formSubmit(formData.departmentName, formData.state);
    trackFunnel.betaFormSubmit();

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'landing_page',
          userAgent: navigator.userAgent
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you! We\'ll be in touch soon with beta access details.');
        
        // Analytics tracking for successful conversion
        trackBetaSignup.formSuccess();
        trackConversion({
          departmentName: formData.departmentName,
          state: formData.state,
          email: formData.email,
          source: 'landing_page'
        });
        
        // Clear form
        setFormData({
          departmentName: '',
          contactName: '',
          email: '',
          state: '',
          phone: '',
          position: ''
        });
      } else {
        // Handle specific error responses
        const errorData = await response.json();
        
        if (response.status === 409) {
          // Email already registered - show as success since they're already on the list
          setSubmitStatus('success');
          setSubmitMessage(errorData.message || 'This email is already on our beta list. We\'ll be in touch soon!');
        } else {
          // Other errors (400, 500, etc.)
          setSubmitStatus('error');
          setSubmitMessage(errorData.error || 'Something went wrong. Please try again or contact us directly.');
        }
        return; // Don't throw error, we handled it
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Something went wrong. Please try again or contact us directly.');
      
      // Track form errors
      trackBetaSignup.formError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      id="beta-signup-form"
      sx={{ 
        py: { xs: 8, md: 12 },
        bgcolor: 'primary.main',
        color: 'white',
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Request Beta Access
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Join select fire departments testing the future of fire service analytics. 
            <strong>Selected departments receive 6 months of premium access — 100% free</strong> with direct input on feature development.
          </Typography>
        </Box>

        <Card sx={{ 
          maxWidth: '600px', 
          mx: 'auto',
          borderRadius: 4,
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {submitStatus && (
              <Alert 
                severity={submitStatus} 
                sx={{ mb: 3 }}
                onClose={() => setSubmitStatus(null)}
              >
                {submitMessage}
              </Alert>
            )}

            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: 'rgba(25, 118, 210, 0.1)', 
              borderRadius: 2,
              border: '1px solid rgba(25, 118, 210, 0.3)'
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '1.1rem'
                }}
              >
                🎯 Selected departments receive 6 months of premium access — 100% free
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  textAlign: 'center',
                  mt: 1
                }}
              >
                Prove ROI and value with zero investment. No contracts, no commitments.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Fire Department Name"
                    required
                    value={formData.departmentName}
                    onChange={handleInputChange('departmentName')}
                    placeholder="e.g., Metro Fire District"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    required
                    value={formData.contactName}
                    onChange={handleInputChange('contactName')}
                    placeholder="Chief John Smith"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Position/Title"
                    value={formData.position}
                    onChange={handleInputChange('position')}
                    placeholder="Fire Chief, Assistant Chief, etc."
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="chief@metrofire.gov"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="(555) 123-4567"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="State"
                    required
                    value={formData.state}
                    onChange={handleInputChange('state')}
                  >
                    <MenuItem value="">Select State</MenuItem>
                    {usStates.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || !validateForm()}
                    sx={{
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      bgcolor: '#ff6b35',
                      '&:hover': {
                        bgcolor: '#e55a2b',
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                        Submitting...
                      </>
                    ) : (
                      'Request Beta Invite'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center',
                mt: 3,
                color: 'text.secondary',
                fontSize: '0.9rem'
              }}
            >
              We respect your privacy. Your information is only used for beta program 
              communication and will never be shared.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BetaSignupForm;