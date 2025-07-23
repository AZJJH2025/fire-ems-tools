import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Chip } from '@mui/material';
import { SchoolRounded, LocalFireDepartmentRounded, PolicyRounded } from '@mui/icons-material';

const PartnershipSection: React.FC = () => {
  return (
    <Box sx={{ 
      py: { xs: 8, md: 12 },
      bgcolor: 'background.default',
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
            Built with Chiefs and Public Policy Experts
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 2
            }}
          >
            Real-world fire service experience meets academic public policy strategy.
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              color: 'text.primary',
              fontSize: '1.1rem',
              fontWeight: 500
            }}
          >
            Your beta participation helps shape the future of fire service analytics.
          </Typography>
        </Box>

        <Grid container spacing={6} justifyContent="center">
          {/* Joe - Fire Chief */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid #1976d2',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}>
                <Chip 
                  label="Founder & Fire Chief" 
                  sx={{ 
                    bgcolor: '#1976d2', 
                    color: 'white',
                    fontWeight: 'bold',
                    px: 2
                  }} 
                />
              </Box>
              
              <CardContent sx={{ p: 4, pt: 5, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 3,
                    bgcolor: '#1976d2',
                    fontSize: '3rem'
                  }}
                >
                  👨‍🚒
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Chief Joe Hester
                </Typography>
                
                <Typography variant="h6" sx={{ color: '#1976d2', mb: 3, fontWeight: 600 }}>
                  25-Year Fire Service Veteran
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip 
                    icon={<LocalFireDepartmentRounded />}
                    label="Fire Chief" 
                    sx={{ mr: 1, mb: 1 }} 
                    variant="outlined" 
                  />
                  <Chip 
                    label="Paramedic" 
                    sx={{ mr: 1, mb: 1 }} 
                    variant="outlined" 
                  />
                  <Chip 
                    label="Assistant Chief" 
                    sx={{ mb: 1 }} 
                    variant="outlined" 
                  />
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}
                >
                  "Built by someone who's lived through budget meetings, ISO audits, 
                  and compliance reporting. FireEMS.ai solves the problems I faced 
                  every day as a chief."
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Dena - PhD Public Policy */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid #7b1fa2',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}>
                <Chip 
                  label="Strategic Advisor" 
                  sx={{ 
                    bgcolor: '#7b1fa2', 
                    color: 'white',
                    fontWeight: 'bold',
                    px: 2
                  }} 
                />
              </Box>
              
              <CardContent sx={{ p: 4, pt: 5, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 3,
                    bgcolor: '#7b1fa2',
                    fontSize: '3rem'
                  }}
                >
                  👩‍🎓
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Dr. Dena
                </Typography>
                
                <Typography variant="h6" sx={{ color: '#7b1fa2', mb: 3, fontWeight: 600 }}>
                  PhD in Public Policy
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip 
                    icon={<SchoolRounded />}
                    label="PhD Public Policy" 
                    sx={{ mr: 1, mb: 1 }} 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<PolicyRounded />}
                    label="Municipal Strategy" 
                    sx={{ mr: 1, mb: 1 }} 
                    variant="outlined" 
                  />
                  <Chip 
                    label="Beta Advisor" 
                    sx={{ mb: 1 }} 
                    variant="outlined" 
                  />
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}
                >
                  "Working directly with beta departments to ensure FireEMS.ai 
                  meets the strategic needs of modern fire service leadership 
                  and municipal decision-making."
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Statement */}
        <Box sx={{ 
          textAlign: 'center', 
          mt: 8,
          p: 4,
          bgcolor: 'primary.main',
          borderRadius: 4,
          color: 'white'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Your Voice Shapes the Platform
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1.1rem',
              opacity: 0.9,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Beta participants work directly with our team to prioritize features, 
            test new capabilities, and ensure FireEMS.ai serves the real needs 
            of fire service professionals.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PartnershipSection;