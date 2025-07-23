import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { 
  TransformRounded, 
  AccessTimeRounded, 
  MapRounded, 
  WaterDropRounded, 
  StarRounded, 
  LocationOnRounded 
} from '@mui/icons-material';

const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: <TransformRounded />,
      title: 'Data Formatter',
      description: 'Universal CAD data import with intelligent field mapping and validation.',
      color: '#1976d2'
    },
    {
      icon: <AccessTimeRounded />,
      title: 'Response Time Analyzer',
      description: 'NFPA 1710 compliance analysis with professional reporting and trends.',
      color: '#2e7d32'
    },
    {
      icon: <MapRounded />,
      title: 'Fire Map Pro',
      description: 'Advanced incident mapping with heat zones and geographic analysis.',
      color: '#d32f2f'
    },
    {
      icon: <WaterDropRounded />,
      title: 'Water Supply Coverage',
      description: 'Hydrant and tank coverage analysis for rural and urban departments.',
      color: '#0288d1'
    },
    {
      icon: <StarRounded />,
      title: 'ISO Credit Calculator',
      description: 'Insurance rating optimization with gap analysis and improvement planning.',
      color: '#ed6c02'
    },
    {
      icon: <LocationOnRounded />,
      title: 'Station Coverage Optimizer',
      description: 'Strategic station placement analysis for maximum coverage efficiency.',
      color: '#7b1fa2'
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 },
      bgcolor: '#f5f5f5'
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
            6 Professional Tools, 1 Integrated Platform
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '700px',
              mx: 'auto',
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            From raw CAD data to executive presentations, FireEMS.ai provides the complete 
            analytics workflow your department needs to excel.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  border: '1px solid rgba(0,0,0,0.04)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                    borderColor: feature.color,
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mx: 'auto', 
                      mb: 3,
                      bgcolor: feature.color,
                      boxShadow: `0 8px 24px ${feature.color}40`
                    }}
                  >
                    {React.cloneElement(feature.icon, { sx: { fontSize: 32, color: 'white' } })}
                  </Avatar>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      color: 'text.primary'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      flexGrow: 1
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem',
              fontStyle: 'italic'
            }}
          >
            All tools work together seamlessly - format your data once, use it everywhere.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesGrid;