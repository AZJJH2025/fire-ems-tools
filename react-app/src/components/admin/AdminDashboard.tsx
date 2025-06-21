import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button,
  Paper
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Settings,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import admin components
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import DepartmentSettings from './DepartmentSettings';

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
      
      if (!response.ok) {
        throw new Error('Authentication required');
      }
      
      const user = await response.json();
      
      if (!user.is_admin && !user.is_super_admin) {
        throw new Error('Admin access required');
      }
      
      setUserRole(user.is_super_admin ? 'super_admin' : 'admin');
      
    } catch (error) {
      console.error('Admin access check failed:', error);
      setError(error instanceof Error ? error.message : 'Access denied');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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
        <Alert severity="error">
          {error}
        </Alert>
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
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        <AdminOverview userRole={userRole} />
      </TabPanel>
      
      <TabPanel value={currentTab} index={1}>
        <UserManagement userRole={userRole} />
      </TabPanel>
      
      <TabPanel value={currentTab} index={2}>
        <DepartmentSettings userRole={userRole} />
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;