import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { trackPageView, trackFunnel } from '../../utils/analytics';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import FeaturesGrid from './FeaturesGrid';
import PartnershipSection from './PartnershipSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Track landing page view
    trackPageView('/landing', 'FireEMS.ai Beta Landing');
    trackFunnel.landingPageView();
  }, []);

  useEffect(() => {
    // Set page title and meta tags
    document.title = 'FireEMS.ai - Enterprise Fire & EMS Analytics Suite | Beta Access';
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Transform your fire department data into strategic advantage with AI-powered analytics. NFPA compliance, ISO optimization, and executive reporting built by a 25-year fire chief.');
    }
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <PartnershipSection />
      <TestimonialsSection />
      <CTASection />
    </Box>
  );
};

export default LandingPage;