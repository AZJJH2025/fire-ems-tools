import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { AccessTimeRounded, TrendingUpRounded, SecurityRounded } from '@mui/icons-material';
import { trackCTA } from '../../utils/analytics';

const CTASection: React.FC = () => {
  const handleGetAccess = () => {
    // Analytics tracking
    trackCTA.finalButton();

    // Scroll to beta signup form
    const betaForm = document.getElementById('beta-signup-form');
    if (betaForm) {
      betaForm.scrollIntoView({ behavior: 'smooth' });
      trackCTA.scrollToBeta();
    }
  };

  const urgencyPoints = [
    {
      icon: <AccessTimeRounded sx={{ fontSize: 32, color: '#f44336' }} />,
      title: 'ISO Audits Are Coming',
      description: 'Don\'t get caught with incomplete data analysis'
    },
    {
      icon: <TrendingUpRounded sx={{ fontSize: 32, color: '#4caf50' }} />,
      title: 'Budget Season Approaches',
      description: 'Present compelling data to secure resources'
    },
    {
      icon: <SecurityRounded sx={{ fontSize: 32, color: '#ff9800' }} />,
      title: 'NFPA Compliance Deadlines',
      description: 'Automated reporting saves hours of manual work'
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 },
      bgcolor: '#f5f5f5',
      position: 'relative'
    }}>
      <Container maxWidth="lg">
        {/* Main CTA Content */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 3,
              lineHeight: 1.1
            }}
          >
            Get Ahead of ISO Audits and NFPA Reviews
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              lineHeight: 1.5,
              mb: 6,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Join our early access beta and shape the future of fire data analytics. 
            Free access during beta with direct input on development priorities.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleGetAccess}
            sx={{
              bgcolor: '#ff6b35',
              color: 'white',
              py: 2.5,
              px: 5,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(255,107,53,0.4)',
              '&:hover': {
                bgcolor: '#e55a2b',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 32px rgba(255,107,53,0.5)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Request Access — Free During Beta
          </Button>

          <Typography 
            variant="body1" 
            sx={{ 
              mt: 3,
              color: 'text.secondary',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            ⏰ Limited beta spots available • 🔒 No credit card required • 🎯 Early access priority
          </Typography>
        </Box>

        {/* Urgency Points */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {urgencyPoints.map((point, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: '#ff6b35',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(255,107,53,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {point.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      color: 'text.primary'
                    }}
                  >
                    {point.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.6
                    }}
                  >
                    {point.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Final Push */}
        <Box sx={{ 
          textAlign: 'center',
          p: 6,
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 3
            }}
          >
            Don't Wait for the Next Audit Cycle
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.primary',
              fontSize: '1.2rem',
              lineHeight: 1.6,
              maxWidth: '700px',
              mx: 'auto',
              mb: 4
            }}
          >
            Every day you wait is another day of manual data work, missed optimization opportunities, 
            and presenting weak analytics to decision-makers who control your department's future.
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ff6b35',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            Beta access is limited. Reserve your spot today.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;