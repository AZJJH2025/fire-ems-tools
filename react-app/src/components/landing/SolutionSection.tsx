import React from 'react';
import { Box, Container, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { CheckCircleRounded, PsychologyRounded, AssessmentRounded, SpeedRounded, SecurityRounded } from '@mui/icons-material';

const SolutionSection: React.FC = () => {
  const benefits = [
    {
      icon: <AssessmentRounded sx={{ color: '#1976d2' }} />,
      title: '6 Enterprise-Grade Tools',
      description: 'Complete analytics suite from data formatting to ISO optimization'
    },
    {
      icon: <SecurityRounded sx={{ color: '#2e7d32' }} />,
      title: 'NFPA/ISO Compliance Automation',
      description: 'Automated calculations and reporting for regulatory requirements'
    },
    {
      icon: <PsychologyRounded sx={{ color: '#ed6c02' }} />,
      title: 'AI-Enhanced Decision Support',
      description: 'Intelligent insights and recommendations based on your data'
    },
    {
      icon: <SpeedRounded sx={{ color: '#d32f2f' }} />,
      title: 'One-Click PDF Reports',
      description: 'Professional reports ready for city councils and grant applications'
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 },
      bgcolor: 'background.default'
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          {/* Left Column - Content */}
          <Grid item xs={12} lg={7}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 3
              }}
            >
              FireEMS.ai: Analytics Built for Chiefs, by Chiefs
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                lineHeight: 1.6,
                mb: 4,
                fontSize: '1.2rem'
              }}
            >
              After 25 years as a fire chief and paramedic, Joe built the analytics suite he wished he'd had. 
              No more Excel nightmares. No more manual compliance calculations. No more presenting weak data 
              to city councils who control your budget.
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.primary',
                lineHeight: 1.7,
                mb: 4,
                fontSize: '1.1rem'
              }}
            >
              FireEMS.ai automates the tedious data work so you can focus on what matters: 
              <strong> leading your department, improving response times, and securing the resources 
              your community deserves.</strong>
            </Typography>

            {/* Benefits List */}
            <List sx={{ mb: 4 }}>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Avatar sx={{ bgcolor: 'background.paper', boxShadow: 2 }}>
                      {benefit.icon}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {benefit.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {benefit.description}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Right Column - Chief Photo Placeholder */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ 
              textAlign: 'center',
              p: 4,
              bgcolor: 'primary.main',
              borderRadius: 4,
              color: 'white',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '3rem'
                }}
              >
                👨‍🚒
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                Chief Joe Hester
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                25-Year Fire Service Veteran
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                "I built FireEMS.ai because I was tired of fighting spreadsheets 
                instead of focusing on what really matters - serving our community 
                and leading our department."
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SolutionSection;