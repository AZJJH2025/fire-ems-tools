import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  CheckCircle,
  Warning
} from '@mui/icons-material';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_departments: number;
  active_departments: number;
  recent_users_this_month: number;
  is_super_admin: boolean;
}

interface AdminOverviewProps {
  userRole: string | null;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ userRole }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/analytics/overview', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        throw new Error(result.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const userActiveRate = analytics.total_users > 0 
    ? Math.round((analytics.active_users / analytics.total_users) * 100) 
    : 0;

  const departmentActiveRate = analytics.total_departments > 0 
    ? Math.round((analytics.active_departments / analytics.total_departments) * 100) 
    : 0;

  return (
    <Box>
      {/* System Status Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {userRole === 'super_admin' ? 'System-wide analytics' : 'Department analytics'}
        </Typography>
      </Box>

      {/* Key Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {/* Total Users */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {analytics.total_users}
                </Typography>
              </Box>
              <People sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Active Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {analytics.active_users}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userActiveRate}% active
                </Typography>
              </Box>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  {userRole === 'super_admin' ? 'Total Departments' : 'Your Department'}
                </Typography>
                <Typography variant="h4">
                  {analytics.total_departments}
                </Typography>
                {analytics.active_departments < analytics.total_departments && (
                  <Typography variant="body2" color="warning.main">
                    {analytics.total_departments - analytics.active_departments} inactive
                  </Typography>
                )}
              </Box>
              <Business sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>

        {/* New Users This Month */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  New This Month
                </Typography>
                <Typography variant="h4" color="secondary.main">
                  {analytics.recent_users_this_month}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  new users
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Activity Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* User Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Activity
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {analytics.active_users} / {analytics.total_users}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={userActiveRate}
                sx={{ height: 8, borderRadius: 4 }}
                color={userActiveRate > 80 ? 'success' : userActiveRate > 60 ? 'warning' : 'error'}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {userActiveRate}% of users are active
              </Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`${analytics.active_users} Active`}
                color="success"
                variant="outlined"
              />
              {analytics.total_users - analytics.active_users > 0 && (
                <Chip
                  size="small"
                  label={`${analytics.total_users - analytics.active_users} Inactive`}
                  color="default"
                  variant="outlined"
                />
              )}
              {analytics.recent_users_this_month > 0 && (
                <Chip
                  size="small"
                  label={`${analytics.recent_users_this_month} New This Month`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Department Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Status
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Departments
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {analytics.active_departments} / {analytics.total_departments}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={departmentActiveRate}
                sx={{ height: 8, borderRadius: 4 }}
                color={departmentActiveRate > 80 ? 'success' : departmentActiveRate > 60 ? 'warning' : 'error'}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {departmentActiveRate}% of departments are active
              </Typography>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`${analytics.active_departments} Active`}
                color="success"
                variant="outlined"
              />
              {analytics.total_departments - analytics.active_departments > 0 && (
                <Chip
                  size="small"
                  label={`${analytics.total_departments - analytics.active_departments} Inactive`}
                  color="warning"
                  variant="outlined"
                />
              )}
              {userRole === 'super_admin' && (
                <Chip
                  size="small"
                  label="System Admin"
                  color="primary"
                  variant="filled"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* System Health Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Health
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography variant="body2">
                User Management: Operational
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle color="success" />
              <Typography variant="body2">
                Department Management: Operational
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {analytics.recent_users_this_month > 0 ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
              <Typography variant="body2">
                User Registration: {analytics.recent_users_this_month > 0 ? 'Active' : 'Low Activity'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminOverview;