import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { LocalFireDepartment, TrendingUpRounded, SecurityRounded } from '@mui/icons-material';
import { trackCTA } from '../../utils/analytics';

const HeroSection: React.FC = () => {

  const handleBetaAccess = () => {
    // Analytics tracking
    trackCTA.heroButton();

    // Scroll to beta signup form
    const betaForm = document.getElementById('beta-signup-form');
    if (betaForm) {
      betaForm.scrollIntoView({ behavior: 'smooth' });
      trackCTA.scrollToBeta();
    }
  };

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #1976d2 100%)',
      color: 'white',
      py: { xs: 8, md: 12 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo and Navigation */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 6,
          justifyContent: 'center'
        }}>
          <LocalFireDepartment sx={{ fontSize: 40, color: 'white' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            FireEMS.AI
          </Typography>
        </Box>

        {/* Main Hero Content */}
        <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 'bold',
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Enterprise-Grade Fire & EMS Analytics — Now AI-Powered
          </Typography>

          <Typography 
            variant="h5" 
            sx={{ 
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 400,
              mb: 5,
              opacity: 0.95,
              lineHeight: 1.4,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Smarter insights. Faster compliance. Better planning. FireEMS.ai transforms your data into strategic advantage.
          </Typography>

          {/* Visual Icons */}
          <Stack 
            direction="row" 
            spacing={4} 
            justifyContent="center" 
            sx={{ mb: 6, display: { xs: 'none', md: 'flex' } }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <TrendingUpRounded sx={{ fontSize: 48, mb: 1, color: '#4caf50' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>AI Analytics</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <SecurityRounded sx={{ fontSize: 48, mb: 1, color: '#ff9800' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>NFPA Compliance</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <LocalFireDepartment sx={{ fontSize: 48, mb: 1, color: '#f44336' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>ISO Optimization</Typography>
            </Box>
          </Stack>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleBetaAccess}
            sx={{
              bgcolor: '#ff6b35',
              color: 'white',
              py: 2,
              px: 4,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(255,107,53,0.4)',
              '&:hover': {
                bgcolor: '#e55a2b',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(255,107,53,0.5)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Request Beta Access
          </Button>

          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              opacity: 0.8,
              fontSize: '0.9rem'
            }}
          >
            Free during beta • Built by fire chiefs • Early access limited
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;