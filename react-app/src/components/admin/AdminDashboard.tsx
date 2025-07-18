import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  AdminPanelSettings,
  HowToReg,
  Notifications,
  Description,
  Security,
  Psychology
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import admin components
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import DepartmentSettings from './DepartmentSettings';
import PendingApprovals from './PendingApprovals';
import NotificationPanel from './NotificationPanel';
import SecurityDashboard from './SecurityDashboard';
import AIAnalysisDashboard from '../ai/AIAnalysisDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check authentication and admin access on component mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and has admin access
      const response = await fetch('/auth/api/me', {
        credentials: 'include'
      });
      
      console.log('🔐 Admin access check - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Authentication required');
      }
      
      const data = await response.json();
      console.log('🔐 Admin access check - Response data:', data);
      
      // Extract user from the response (Flask returns {success: true, user: {...}})
      const user = data.user || data;
      console.log('🔐 Admin access check - Extracted user:', user);
      
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        console.error('🔐 Admin access denied - User role:', user?.role);
        throw new Error('Admin access required');
      }
      
      console.log('🔐 Admin access granted - User role:', user.role);
      setUserRole(user.role === 'super_admin' ? 'super_admin' : 'admin');
      
    } catch (error) {
      console.error('🔐 Admin access check failed:', error);
      
      // Check if it's an authentication issue vs authorization issue
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          setError('Please log in to access the admin console.');
          console.log('🔐 Redirecting to login due to authentication failure');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(error.message);
          console.log('🔐 Authorization error - user may be logged in but lacks admin privileges');
        }
      } else {
        setError('Access denied');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        
        {/* Add quick login form for admin console */}
        {error.includes('log in') && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Admin Login
            </Typography>
            <Box
              component="form"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get('email') as string;
                const password = formData.get('password') as string;
                
                try {
                  const response = await fetch('/auth/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password })
                  });
                  
                  if (response.ok) {
                    // Retry admin access check
                    setError(null);
                    checkAdminAccess();
                  } else {
                    const data = await response.json();
                    setError(data.message || 'Login failed');
                  }
                } catch (err) {
                  setError('Login request failed');
                }
              }}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Button type="submit" variant="contained" color="primary">
                Login to Admin Console
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Admin Console
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage departments, users, and system settings
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to Tools
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="admin navigation tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<Dashboard />} 
            label="Overview" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<People />} 
            label="User Management" 
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<Business />} 
            label="Department Settings" 
            {...a11yProps(2)} 
          />
          <Tab 
            icon={<Notifications />} 
            label="Notifications" 
            {...a11yProps(3)} 
          />
          {userRole === 'super_admin' && (
            <Tab 
              icon={<HowToReg />} 
              label="Pending Approvals" 
              {...a11yProps(4)} 
            />
          )}
          {userRole === 'super_admin' && (
            <Tab 
              icon={<Security />} 
              label="Security Dashboard" 
              {...a11yProps(5)} 
            />
          )}
          {userRole === 'super_admin' && (
            <Tab 
              icon={<Psychology />} 
              label="AI Analysis" 
              {...a11yProps(6)} 
            />
          )}
          {userRole === 'super_admin' && (
            <Tab 
              icon={<Description />} 
              label="System Documentation" 
              {...a11yProps(7)} 
            />
          )}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        <AdminOverview userRole={userRole} onTabChange={setCurrentTab} />
      </TabPanel>
      
      <TabPanel value={currentTab} index={1}>
        <UserManagement userRole={userRole} />
      </TabPanel>
      
      <TabPanel value={currentTab} index={2}>
        <DepartmentSettings userRole={userRole} />
      </TabPanel>
      
      <TabPanel value={currentTab} index={3}>
        <NotificationPanel />
      </TabPanel>
      
      {userRole === 'super_admin' && (
        <TabPanel value={currentTab} index={4}>
          <PendingApprovals />
        </TabPanel>
      )}
      
      {userRole === 'super_admin' && (
        <TabPanel value={currentTab} index={5}>
          <SecurityDashboard />
        </TabPanel>
      )}
      
      {userRole === 'super_admin' && (
        <TabPanel value={currentTab} index={6}>
          <AIAnalysisDashboard />
        </TabPanel>
      )}
      
      {userRole === 'super_admin' && (
        <TabPanel value={currentTab} index={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Description />
              System Administration Documentation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Technical documentation for system administrators and product owners.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      System Admin Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Complete guide for server setup, configuration, and maintenance.
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Description />}
                      onClick={() => window.open('/docs/admin/SYSTEM_ADMIN_GUIDE', '_blank')}
                    >
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Troubleshooting Guide
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Technical troubleshooting, debugging, and issue resolution.
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Description />}
                      onClick={() => window.open('/docs/admin/TROUBLESHOOTING', '_blank')}
                    >
                      Read Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      )}
    </Container>
  );
};

export default AdminDashboard;