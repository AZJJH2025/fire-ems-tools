import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
 
  Button, 
  Chip,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { 
  Assessment, 
  Map, 
  TableChart, 
  LocalFireDepartment,
  Security,
  Timeline,
  CheckCircle,
  MenuBook,
  PlayArrow,
  AdminPanelSettings,
  Download,
  VideoLibrary,
  HelpOutline,
  Description,
  Launch,
  Person,
  Logout,
  Settings,
  Dashboard,
  Psychology
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon';
  path?: string;
  features: string[];
  audience: string;
  requiresAuth?: boolean;
  aiEnhanced?: boolean;
}

const ToolCard: React.FC<ToolCardProps & { isAuthenticated: boolean }> = ({ 
  title, 
  description, 
  icon, 
  status, 
  path, 
  features, 
  audience: _audience,
  requiresAuth = false,
  isAuthenticated
}) => {
  const navigate = useNavigate();
  
  const isAccessible = status === 'available' && (!requiresAuth || isAuthenticated);
  
  const handleClick = () => {
    if (!isAccessible) {
      if (requiresAuth && !isAuthenticated) {
        navigate('/login');
        return;
      }
      return;
    }
    
    if (path) {
      // Special handling for documentation - open in new tab
      if (title === 'User Guides & Documentation') {
        window.open(path, '_blank');
      } else {
        navigate(path);
      }
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
        cursor: isAccessible ? 'pointer' : 'default',
        borderTop: isAccessible ? '4px solid #4caf50' : requiresAuth && !isAuthenticated ? '4px solid #9e9e9e' : status === 'available' ? '4px solid #4caf50' : '4px solid #ff9800',
        opacity: requiresAuth && !isAuthenticated ? 0.7 : 1,
        minHeight: '250px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': isAccessible ? {
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
          bgcolor: requiresAuth && !isAuthenticated ? '#9e9e9e' : status === 'available' ? '#4caf50' : '#ff9800',
          color: 'white',
          px: 0.8,
          py: 0.4,
          borderRadius: 0.8,
          zIndex: 10
        }}
      >
        {requiresAuth && !isAuthenticated ? '🔒 LOGIN REQUIRED' : status === 'available' ? 'READY' : 'COMING SOON'}
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
          {/* AI Enhanced Badge */}
          {title === 'Response Time Analyzer' && (
            <Box 
              sx={{
                bgcolor: '#FFD700',
                color: '#1565c0',
                px: 1.25,
                py: 0.5,
                fontSize: '0.8rem',
                borderRadius: 15,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Psychology sx={{ fontSize: 12 }} />
              AI-Enhanced
            </Box>
          )}
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

        {/* Action Buttons */}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexDirection: 'column' }}>
          <Button 
            variant="contained" 
            size="small"
            disabled={!isAccessible}
            sx={{
              bgcolor: isAccessible ? '#2196f3' : '#9e9e9e',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: isAccessible ? '#1976d2' : '#9e9e9e'
              },
              '&:disabled': {
                bgcolor: '#9e9e9e',
                color: 'white'
              }
            }}
            startIcon={<Box component="span" className="material-icons" sx={{ fontSize: '18px' }}>
              {requiresAuth && !isAuthenticated ? 'lock' : 'open_in_new'}
            </Box>}
          >
            {requiresAuth && !isAuthenticated ? 'Sign In to Access' : status === 'available' ? 'Open Tool' : 'Coming Soon'}
          </Button>
          
          {/* Read Guide Button - only show for tools with guides, not for the documentation tile itself */}
          {title !== 'User Guides & Documentation' && (
            <Button 
              variant="outlined" 
              size="small"
              sx={{
                borderColor: '#2196f3',
                color: '#2196f3',
                fontSize: '12px',
                fontWeight: 500,
                px: 2,
                py: 0.5,
                '&:hover': {
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  bgcolor: 'rgba(33, 150, 243, 0.04)'
                }
              }}
              startIcon={<Description sx={{ fontSize: '16px' }} />}
              onClick={(e) => {
                e.stopPropagation();
                const guideMap: Record<string, string> = {
                  'Data Formatter': '/docs/users/DATA_FORMATTER',
                  'Response Time Analyzer': '/docs/users/RESPONSE_TIME_ANALYZER',
                  'Fire Map Pro': '/docs/users/FIRE_MAP_PRO',
                  'Water Supply Coverage Analysis': '/docs/users/WATER_SUPPLY_COVERAGE',
                  'ISO Credit Calculator': '/docs/users/ISO_CREDIT_CALCULATOR',
                  'Station Coverage Optimizer': '/docs/users/STATION_COVERAGE_OPTIMIZER'
                };
                const guidePath = guideMap[title];
                if (guidePath) {
                  window.open(guidePath, '_blank');
                }
              }}
            >
              Read Guide
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const FireEMSHomepage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/auth/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Refresh the page to clear auth state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const tools: ToolCardProps[] = [
    {
      title: 'Data Formatter',
      description: 'Transform any CAD export into standardized format for seamless tool integration. Features AI-powered field detection and smart address parsing for Console One, Tyler, Hexagon, and TriTech CAD systems.',
      icon: <TableChart />,
      status: 'available',
      path: '/data-formatter',
      audience: 'Fire Chiefs, IT Staff, Analysts',
      requiresAuth: true,
      features: [
        'Universal CAD vendor support',
        'AI-powered field mapping with 95% auto-detection',
        'Smart address parsing and geocoding',
        'Professional certified templates',
        'Quality validation and error prevention'
      ]
    },
    {
      title: 'Response Time Analyzer',
      description: 'Professional NFPA 1710 compliance analysis with AI-powered insights and executive-ready reports. Generate regulatory documentation and grant application materials with intelligent recommendations.',
      icon: <Assessment />,
      status: 'available',
      path: '/response-time-analyzer',
      audience: 'Fire Chiefs, City Managers, Grant Writers',
      requiresAuth: true,
      aiEnhanced: true,
      features: [
        'NFPA 1710 compliance reporting',
        'AI-powered performance insights',
        'Professional PDF templates',
        'Executive summary generation',
        'City council presentation materials',
        'Intelligent recommendations'
      ]
    },
    {
      title: 'Fire Map Pro',
      description: 'Advanced mapping and spatial analysis for incident visualization, coverage planning, and geographic reporting with professional export capabilities.',
      icon: <Map />,
      status: 'available',
      path: '/fire-map-pro',
      audience: 'Fire Chiefs, Operations Commanders, Planners',
      requiresAuth: true,
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
      requiresAuth: true,
      features: [
        'Tank and hydrant management',
        'Coverage area calculations',
        'Water supply adequacy analysis',
        'Rural response planning'
      ]
    },
    {
      title: 'ISO Credit Calculator',
      description: 'Calculate your fire department\'s ISO classification (1-10 scale) and identify improvement opportunities that reduce community insurance costs. AI-enhanced analysis provides intelligent recommendations for rating improvements.',
      icon: <Security />,
      status: 'available',
      path: '/iso-credit-calculator',
      audience: 'Fire Chiefs, Community Leaders, Insurance Coordinators',
      requiresAuth: true,
      features: [
        'Complete 105.5-point ISO scoring',
        'AI-powered improvement recommendations',
        'Fire department assessment tools',
        'Water supply scoring calculator',
        'Professional improvement reports'
      ]
    },
    {
      title: 'Station Coverage Optimizer',
      description: 'Enterprise station placement and coverage analysis with NFPA compliance assessment. AI-powered optimization algorithms identify gaps, optimize placement, and generate intelligent placement recommendations.',
      icon: <Timeline />,
      status: 'available',
      path: '/station-coverage-optimizer',
      audience: 'Fire Chiefs, Operations Commanders, City Planners',
      requiresAuth: true,
      features: [
        'NFPA 1710/1720 coverage analysis',
        'AI-optimized station placement',
        'Intelligent coverage gap identification',
        'Smart optimization algorithms',
        'Professional optimization reports'
      ]
    },
    {
      title: 'User Guides & Documentation',
      description: 'Comprehensive training materials and professional guides designed specifically for fire departments. Get up and running quickly with step-by-step instructions.',
      icon: <MenuBook />,
      status: 'available',
      path: '/docs/users/DOCUMENTATION_HUB',
      audience: 'All Fire Department Personnel',
      features: [
        '15-minute quick start guide',
        'Tool-specific user guides',
        'Professional training materials',
        'Complete documentation hub'
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
          
          {/* AI Capabilities Highlight */}
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', 
            backdropFilter: 'blur(10px)',
            px: 4, 
            py: 2, 
            borderRadius: 3,
            mb: 4,
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '600px',
            mx: 'auto'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Psychology sx={{ fontSize: 32, color: '#FFD700' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                Now with AI-Powered Analytics
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
              Intelligent insights, automated recommendations, and AI-enhanced reporting for smarter fire department decisions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 4 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              6 Professional Tools
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,215,0,0.3)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500, border: '1px solid rgba(255,215,0,0.5)' }}>
              🧠 AI-Enhanced
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              NFPA Compliant
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 3, py: 1, borderRadius: 20, fontSize: '0.95rem', fontWeight: 500 }}>
              Production Ready
            </Box>
          </Box>

          {/* Authentication Section */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : isAuthenticated && user ? (
            /* Authenticated User Info */
            <Box sx={{ mt: 6 }}>
              <Paper 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  px: 4,
                  py: 3,
                  borderRadius: 3,
                  maxWidth: 600,
                  mx: 'auto',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                      <Person sx={{ color: 'white' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Welcome back, {user.name}!
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {user.department_name || 'Fire Department'} • {user.role}
                      </Typography>
                    </Box>
                  </Box>
                  {user.has_temp_password && (
                    <Chip 
                      label="Password Reset Required" 
                      color="warning" 
                      size="small"
                      sx={{ bgcolor: '#ff9800', color: 'white' }}
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <Button
                      variant="contained"
                      startIcon={<Dashboard />}
                      onClick={() => navigate('/admin')}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Admin Console
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Profile Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </Paper>
            </Box>
          ) : (
            /* Non-authenticated buttons */
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
          )}
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
            From AI-powered NFPA compliance analysis to ISO credit optimization, transform your CAD data into actionable 
            insights for executive reporting, regulatory compliance, and strategic planning.
          </Typography>
          
          {/* Key Benefits */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology sx={{ color: '#FFD700', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>AI-Powered Analytics</Typography>
            </Box>
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
            mb: 8
          }}
        >
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} isAuthenticated={isAuthenticated} />
          ))}
        </Box>

        {/* AI Features Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'linear-gradient(135deg, #f0f4ff 0%, #e3f2fd 100%)', 
            borderRadius: 3, 
            p: 6, 
            mb: 8,
            border: '2px solid #FFD700',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* AI Background Pattern */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            opacity: 0.1, 
            fontSize: '200px',
            color: '#1565c0',
            pointerEvents: 'none'
          }}>
            <Psychology />
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: '#1565c0',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <Psychology sx={{ fontSize: 40, color: '#FFD700' }} />
              AI-Powered Fire Analytics
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto', 
                fontSize: '1.1rem',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Leverage artificial intelligence to transform your fire department data into actionable insights. 
              Our AI analyzes patterns, predicts trends, and provides intelligent recommendations to optimize operations and improve response times.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#FFD700', color: '#1565c0' }}>
                      <Psychology />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Intelligent Analysis
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI automatically analyzes response time patterns, identifies performance bottlenecks, 
                    and provides data-driven recommendations for improvement.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Automated pattern recognition" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Performance trend analysis" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Predictive insights" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', color: 'white' }}>
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      NFPA Compliance AI
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI-powered NFPA 1710 compliance analysis with intelligent recommendations 
                    for achieving and maintaining regulatory standards.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Automated compliance checking" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Gap analysis and recommendations" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Improvement strategy planning" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', color: 'white' }}>
                      <Assessment />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Smart Reporting
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    AI-enhanced reports with intelligent insights, automated recommendations, 
                    and executive-ready presentations for city leadership.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Intelligent report generation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Automated recommendations" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Executive-ready insights" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1565c0' }}>
              Available in Response Time Analyzer
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Psychology />}
              onClick={() => isAuthenticated ? navigate('/response-time-analyzer') : navigate('/login')}
              sx={{
                bgcolor: '#FFD700',
                color: '#1565c0',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(255,215,0,0.3)',
                '&:hover': {
                  bgcolor: '#FFC107',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255,215,0,0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Try AI Analytics {!isAuthenticated && '(Sign In Required)'}
            </Button>
          </Box>
        </Paper>

        {/* Documentation & Getting Started Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: '#f8f9fa', 
            borderRadius: 3, 
            p: 6, 
            mb: 8,
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                color: '#1565c0',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <MenuBook sx={{ fontSize: 40 }} />
              Complete User Documentation
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '800px', 
                mx: 'auto', 
                fontSize: '1.1rem',
                lineHeight: 1.6,
                mb: 4
              }}
            >
              Professional guides and training materials designed specifically for fire departments. 
              Get up and running quickly with step-by-step instructions, video tutorials, and comprehensive documentation.
            </Typography>
          </Box>

          {/* Quick Start Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              🚀 Getting Started (15 Minutes)
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <PlayArrow />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        15-Minute Quick Start Guide
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Upload CAD data → Generate NFPA compliance reports → Present to city council. 
                      Complete workflow in under 15 minutes.
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Upload and validate CAD export data" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Auto-map fields with professional templates" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Generate executive-ready NFPA reports" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="contained" 
                      startIcon={<Description />} 
                      sx={{ mt: 2 }}
                      onClick={() => window.open('/docs/users/QUICK_START', '_blank')}
                    >
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2} sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#ff5722' }}>
                        <VideoLibrary />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Video Tutorial: Complete Workflow
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      <strong>Video Content Plan:</strong> Screen recording showing complete fire department workflow 
                      from CAD export to final compliance report presentation.
                    </Typography>
                    <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        <strong>Suggested Video Script (8-12 minutes):</strong><br/>
                        • Opening: "Welcome Fire Chiefs - this is your complete 15-minute workflow"<br/>
                        • Demo uploading real CAD export file<br/>
                        • Show auto-field mapping with Console One/Tyler examples<br/>
                        • Generate NFPA 1710 compliance report<br/>
                        • Show professional PDF suitable for city council<br/>
                        • End with "You're now ready for monthly compliance reporting"
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<VideoLibrary />} 
                      disabled
                      sx={{ mt: 1 }}
                    >
                      Video Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Tool Documentation Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              📚 Tool Documentation
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChart color="primary" />
                      Data Formatter Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Complete guide to field mapping, template management, and CAD vendor integration. 
                      Covers Console One, Tyler, Hexagon, and TriTech systems.
                    </Typography>
                    <Chip size="small" label="400+ pages" color="primary" variant="outlined" sx={{ mr: 1, mb: 2 }} />
                    <Chip size="small" label="Beginner-Advanced" color="secondary" variant="outlined" sx={{ mb: 2 }} />
                    <Box>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Launch />} 
                        sx={{ mr: 1 }}
                        onClick={() => window.open('/docs/users/DATA_FORMATTER', '_blank')}
                      >
                        Read Guide
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment color="primary" />
                      Response Time Analyzer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      NFPA 1710 compliance analysis, professional report generation, and executive 
                      summary creation for city council presentations.
                    </Typography>
                    <Chip size="small" label="Complete Guide" color="primary" variant="outlined" sx={{ mr: 1, mb: 2 }} />
                    <Chip size="small" label="Fire Chiefs" color="secondary" variant="outlined" sx={{ mb: 2 }} />
                    <Box>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Launch />} 
                        sx={{ mr: 1 }}
                        onClick={() => window.open('/docs/users/RESPONSE_TIME_ANALYZER', '_blank')}
                      >
                        Read Guide
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Map color="primary" />
                      Fire Map Pro Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Advanced mapping, spatial analysis, and professional map exports for 
                      operational planning and coverage assessment.
                    </Typography>
                    <Chip size="small" label="Complete Guide" color="primary" variant="outlined" sx={{ mr: 1, mb: 2 }} />
                    <Chip size="small" label="Operations" color="secondary" variant="outlined" sx={{ mb: 2 }} />
                    <Box>
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<Launch />} 
                        sx={{ mr: 1 }}
                        onClick={() => window.open('/docs/users/FIRE_MAP_PRO', '_blank')}
                      >
                        Read Guide
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Video Training Library */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              🎥 Video Training Library (Coming Soon)
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2} sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Data Formatter Deep Dive (Planned)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Suggested Video Content (15-20 minutes):</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="CAD Vendor Specifics" 
                          secondary="Show actual exports from Console One, Tyler, Hexagon with real field mapping"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="Template Management" 
                          secondary="Create, save, and share department templates for monthly workflows"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="Advanced Features" 
                          secondary="Smart address parsing, data quality validation, error resolution"
                        />
                      </ListItem>
                    </List>
                    <Button variant="outlined" disabled startIcon={<VideoLibrary />} sx={{ mt: 2 }}>
                      Video Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2} sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Professional Report Generation (Planned)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Suggested Video Content (10-12 minutes):</strong>
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="Executive Reports" 
                          secondary="Generate city council presentations, grant applications, compliance docs"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="NFPA 1710 Analysis" 
                          secondary="Understand compliance metrics, performance thresholds, improvement areas"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><VideoLibrary color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText 
                          primary="Department Branding" 
                          secondary="Add logos, customize headers, create professional branded reports"
                        />
                      </ListItem>
                    </List>
                    <Button variant="outlined" disabled startIcon={<VideoLibrary />} sx={{ mt: 2 }}>
                      Video Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Admin Documentation */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              ⚙️ Administration & Setup
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AdminPanelSettings color="primary" />
                      Admin Console Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Complete admin console user guide covering user management, department settings, 
                      and approval workflows for three-tier admin hierarchy.
                    </Typography>
                    <Chip size="small" label="Comprehensive" color="primary" variant="outlined" sx={{ mr: 1, mb: 2 }} />
                    <Chip size="small" label="Department Admins" color="secondary" variant="outlined" sx={{ mb: 2 }} />
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Launch />}
                      onClick={() => window.open('/docs/admin-console/ADMIN_CONSOLE', '_blank')}
                    >
                      Admin Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color="primary" />
                      System Administrator
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Installation, deployment, database management, security configuration, 
                      and maintenance procedures for IT administrators.
                    </Typography>
                    <Chip size="small" label="Technical" color="primary" variant="outlined" sx={{ mr: 1, mb: 2 }} />
                    <Chip size="small" label="IT Staff" color="secondary" variant="outlined" sx={{ mb: 2 }} />
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Launch />}
                      onClick={() => window.open('/docs/admin/SYSTEM_ADMIN_GUIDE', '_blank')}
                    >
                      System Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card elevation={2} sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoLibrary color="primary" />
                      Admin Training Videos (Planned)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Suggested Video Content (20-25 minutes):</strong><br/>
                      • Department setup and configuration<br/>
                      • User management and role assignments<br/>
                      • Approval workflow demonstration<br/>
                      • Template sharing between departments
                    </Typography>
                    <Button variant="outlined" disabled startIcon={<VideoLibrary />}>
                      Video Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Support & Resources */}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
              🆘 Support & Resources
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HelpOutline color="primary" />
                      Troubleshooting Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Common issues, error codes, and step-by-step solutions for fire department users.
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="CAD data upload issues" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Field mapping problems" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Report generation errors" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Launch />} 
                      sx={{ mt: 2 }}
                      onClick={() => window.open('/docs/admin/TROUBLESHOOTING', '_blank')}
                    >
                      Get Help
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Download color="primary" />
                      Sample Data & Templates
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Download sample CAD exports and professional templates for training and testing.
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Download color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Console One sample data" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Download color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Tyler CAD sample exports" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Download color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Professional report templates" />
                      </ListItem>
                    </List>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<Download />} 
                      sx={{ mt: 2 }}
                      onClick={() => window.open('/docs/examples/SAMPLE_DATA', '_blank')}
                    >
                      Download Samples
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

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