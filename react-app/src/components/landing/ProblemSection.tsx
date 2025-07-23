import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { ErrorOutlineRounded, AccessTimeRounded, AssignmentLateRounded } from '@mui/icons-material';

const ProblemSection: React.FC = () => {
  const painPoints = [
    {
      icon: <AccessTimeRounded sx={{ fontSize: 48, color: '#f44336' }} />,
      title: 'Slow, Manual CAD Exports',
      description: 'Hours spent every month wrestling with CSV files, cleaning data, and manually mapping fields just to generate basic reports.'
    },
    {
      icon: <AssignmentLateRounded sx={{ fontSize: 48, color: '#ff9800' }} />,
      title: 'Compliance Audits in Excel',
      description: 'NFPA 1710 calculations done by hand in spreadsheets. ISO audits approached with anxiety instead of confidence.'
    },
    {
      icon: <ErrorOutlineRounded sx={{ fontSize: 48, color: '#9c27b0' }} />,
      title: 'Missed ISO Points from Avoidable Gaps',
      description: 'Small data issues become major rating problems. Coverage gaps go unnoticed until the audit arrives.'
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 },
      bgcolor: '#f8f9fa',
      position: 'relative'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 3
            }}
          >
            Fire Departments Are Drowning in Static Data
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 6
            }}
          >
            While emergency calls demand split-second decisions, administrative data analysis still takes hours of manual work. Chiefs spend more time fighting spreadsheets than fighting fires.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {painPoints.map((point, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 3 }}>
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

        {/* Agitation Paragraph */}
        <Box sx={{ 
          maxWidth: '900px', 
          mx: 'auto', 
          textAlign: 'center',
          p: 4,
          bgcolor: '#fff3e0',
          borderRadius: 3,
          border: '1px solid #ffcc02',
          position: 'relative'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#e65100',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            The Cost of Status Quo
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.primary',
              lineHeight: 1.7,
              fontSize: '1.1rem'
            }}
          >
            Every month without proper analytics tools means another month of missed opportunities. 
            <strong> ISO ratings stagnate while neighboring departments advance.</strong> Budget requests 
            lack compelling data. NFPA compliance becomes a guessing game instead of a measurable standard. 
            Your department's professionalism is questioned not because of operational failures, 
            but because of <em>data management limitations</em> you shouldn't have to accept.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ProblemSection;