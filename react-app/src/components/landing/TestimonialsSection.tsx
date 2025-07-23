import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { FormatQuoteRounded } from '@mui/icons-material';

const TestimonialsSection: React.FC = () => {
  // Placeholder testimonial cards for future use
  const placeholderTestimonials = [
    {
      id: 1,
      role: 'Fire Chief',
      department: 'Metro Fire District',
      avatar: '👨‍🚒',
      preview: 'Early beta participant feedback coming soon...'
    },
    {
      id: 2,
      role: 'Assistant Chief',
      department: 'County Fire & Rescue',
      avatar: '👩‍🚒',
      preview: 'Beta testing results will be featured here...'
    },
    {
      id: 3,
      role: 'Training Officer',
      department: 'Municipal Fire Dept',
      avatar: '👨‍🚒',
      preview: 'Department experiences shared after beta...'
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
            Join Early Departments Shaping the Future
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
            Beta participants are working with us to build the analytics platform 
            fire service has been waiting for.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {placeholderTestimonials.map((testimonial) => (
            <Grid size={{ xs: 12, md: 4 }} key={testimonial.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '2px dashed #e0e0e0',
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: '#1976d2',
                    boxShadow: '0 8px 32px rgba(25,118,210,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <FormatQuoteRounded 
                    sx={{ 
                      fontSize: 48, 
                      color: '#e0e0e0', 
                      mb: 2,
                      transform: 'rotate(180deg)'
                    }} 
                  />
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      flexGrow: 1,
                      mb: 3
                    }}
                  >
                    {testimonial.preview}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#f5f5f5',
                        color: 'text.primary',
                        fontSize: '1.5rem'
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {testimonial.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {testimonial.department}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 4,
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e0e0e0'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2
            }}
          >
            Be Among the First
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Beta participants get exclusive access to new features, direct input on development priorities, 
            and the opportunity to showcase their department's forward-thinking approach to data analytics.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;