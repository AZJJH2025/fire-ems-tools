import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import { 
  Assessment, 
  Map, 
  TableChart, 
  LocalFireDepartment,
  AttachMoney,
  Security,
  Timeline,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon';
  path?: string;
  features: string[];
  audience: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  title, 
  description, 
  icon, 
  status, 
  path, 
  features, 
  audience 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (status === 'available' && path) {
      navigate(path);
    }
  };

  return (
    <Box 
      sx={{ 
        bgcolor: 'white',
        borderRadius: 1,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        cursor: status === 'available' ? 'pointer' : 'default',
        borderTop: status === 'available' ? '4px solid #4caf50' : '4px solid #ff9800',
        minHeight: '250px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': status === 'available' ? {
          transform: 'translateY(-5px)',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)'
        } : {}
      }}
      onClick={handleClick}
    >
      {/* Status Badge */}
      <Box 
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          bgcolor: status === 'available' ? '#4caf50' : '#ff9800',
          color: 'white',
          px: 0.8,
          py: 0.4,
          borderRadius: 0.8,
          zIndex: 10
        }}
      >
        {status === 'available' ? 'READY' : 'COMING SOON'}
      </Box>

      {/* Icon */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2196f3 0%, #ff5722 100%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 20,
          left: 20,
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ fontSize: '24px', color: 'white' }}>
          {icon}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 2.5, pl: 12.5, flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontSize: '1.3rem',
            color: '#1976d2',
            mb: 1.25,
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: '0.95rem',
            mb: 2.5,
            lineHeight: 1.5,
            color: '#616161'
          }}
        >
          {description}
        </Typography>
        
        {/* Feature Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          {features.slice(0, 3).map((feature, index) => (
            <Box 
              key={index}
              sx={{
                bgcolor: '#f5f5f5',
                color: '#616161',
                px: 1.25,
                py: 0.5,
                fontSize: '0.8rem',
                borderRadius: 15,
                fontWeight: 500
              }}
            >
              {feature.split(' ').slice(0, 2).join(' ')}
            </Box>
          ))}
        </Box>

        {/* Action Button */}
        <Box sx={{ mt: 'auto' }}>
          <Button 
            variant="contained" 
            size="small"
            disabled={status !== 'available'}
            sx={{
              bgcolor: status === 'available' ? '#2196f3' : '#9e9e9e',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: status === 'available' ? '#1976d2' : '#9e9e9e'
              },
              '&:disabled': {
                bgcolor: '#9e9e9e',
                color: 'white'
              }
            }}
            startIcon={<Box component="span" className="material-icons" sx={{ fontSize: '18px' }}>open_in_new</Box>}
          >
            {status === 'available' ? 'Open Tool' : 'Coming Soon'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const FireEMSHomepage: React.FC = () => {
  const navigate = useNavigate();
  
  const tools: ToolCardProps[] = [
    {
      title: 'Data Formatter',
      description: 'Transform any CAD export into standardized format for seamless tool integration. Handles Console One, Tyler, Hexagon, and TriTech CAD systems with professional templates.',
      icon: <TableChart />,
      status: 'available',
      path: '/data-formatter',
      audience: 'Fire Chiefs, IT Staff, Analysts',
      features: [
        'Universal CAD vendor support',
        'Smart field mapping with 95% auto-detection',
        'Professional certified templates',
        'Quality validation and error prevention'
      ]
    },
    {
      title: 'Response Time Analyzer',
      description: 'Professional NFPA 1710 compliance analysis with executive-ready reports. Generate regulatory documentation and grant application materials.',
      icon: <Assessment />,
      status: 'available',
      path: '/response-time-analyzer',
      audience: 'Fire Chiefs, City Managers, Grant Writers',
      features: [
        'NFPA 1710 compliance reporting',
        'Professional PDF templates',
        'Executive summary generation',
        'City council presentation materials'
      ]
    },
    {
      title: 'Fire Map Pro',
      description: 'Advanced mapping and spatial analysis for incident visualization, coverage planning, and geographic reporting with professional export capabilities.',
      icon: <Map />,
      status: 'available',
      path: '/fire-map-pro',
      audience: 'Fire Chiefs, Operations Commanders, Planners',
      features: [
        'Interactive incident mapping',
        'Coverage area analysis',
        'Professional map exports',
        'Geographic performance metrics'
      ]
    },
    {
      title: 'Water Supply Coverage Analysis',
      description: 'Comprehensive water supply analysis including tanks, hydrants, and mixed infrastructure. Analyze coverage gaps and optimize water supply placement for all fire department types.',
      icon: <LocalFireDepartment />,
      status: 'available',
      path: '/water-supply-coverage',
      audience: 'Fire Chiefs, Water Supply Officers, City Planners',
      features: [
        'Tank and hydrant management',
        'Coverage area calculations',
        'Water supply adequacy analysis',
        'Rural response planning'
      ]
    },
    {
      title: 'ISO Credit Calculator',
      description: 'Calculate your fire department\'s ISO classification (1-10 scale) and identify improvement opportunities that reduce community insurance costs.',
      icon: <Security />,
      status: 'available',
      path: '/iso-credit-calculator',
      audience: 'Fire Chiefs, Community Leaders, Insurance Coordinators',
      features: [
        'Complete 105.5-point ISO scoring',
        'Fire department assessment tools',
        'Water supply scoring calculator',
        'Professional improvement reports'
      ]
    },
    {
      title: 'Station Coverage Optimizer',
      description: 'Enterprise station placement and coverage analysis with NFPA compliance assessment. Identify gaps, optimize placement, and generate professional reports.',
      icon: <Timeline />,
      status: 'available',
      path: '/station-coverage-optimizer',
      audience: 'Fire Chiefs, Operations Commanders, City Planners',
      features: [
        'NFPA 1710/1720 coverage analysis',
        'Interactive station placement',
        'Coverage gap identification',
        'Professional optimization reports'
      ]
    }
  ];


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        square
        sx={{ 
          bgcolor: '#1565c0', 
          color: 'white', 
          py: 8, 
          px: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #1e88e5 100%)',
          position: 'relative'
        }}
      >
        {/* Professional FireEMS.AI Logo Header - White on Blue */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 20,
            left: 20,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LocalFireDepartment sx={{ fontSize: 32, color: 'white', mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
            FireEMS.AI
          </Typography>
        </Box>

        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Fire EMS Tools
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.95, fontWeight: 400, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
            Complete Enterprise Analytics Suite for Fire Departments
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 4 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              6 Professional Tools
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              NFPA Compliant
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              Production Ready
            </Box>
          </Box>

          {/* Authentication Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: '#ffffff',
                color: '#1565c0',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Welcome Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#1565c0',
              mb: 3
            }}
          >
            Complete Enterprise Fire Department Suite
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '900px', 
              mx: 'auto', 
              fontSize: '1.2rem',
              lineHeight: 1.7,
              mb: 4
            }}
          >
            Six professional-grade analytics tools providing comprehensive fire department operations support. 
            From NFPA compliance analysis to ISO credit optimization, transform your CAD data into actionable 
            insights for executive reporting, regulatory compliance, and strategic planning.
          </Typography>
          
          {/* Key Benefits */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Universal CAD Support</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Professional PDF Reports</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Zero Configuration</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Enterprise Grade</Typography>
            </Box>
          </Box>
        </Box>

        {/* Tools Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 4,
            mb: 4
          }}
        >
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 8, pt: 4, textAlign: 'center' }}>
          {/* FireEMS.AI Logo/Branding */}
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1.5,
                bgcolor: '#1565c0',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)'
              }}
            >
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1565c0',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}
              >
                🔥
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.5rem',
                  letterSpacing: '0.5px'
                }}
              >
                FireEMS.AI
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Built for fire departments by professionals who understand your data challenges
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', opacity: 0.7 }}>
            Visit us at <strong>FireEMS.AI</strong> for enterprise solutions
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FireEMSHomepage;