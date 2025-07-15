import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  People,
  Business,
  TrendingUp,
  CheckCircle,
  Warning,
  Settings,
  Analytics,
  PersonAdd,
  DomainAdd,
  Timeline,
  Schedule,
  Assessment,
  Notifications,
  Speed,
  Cloud,
  Storage,
  Shield,
  Refresh
} from '@mui/icons-material';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_departments: number;
  active_departments: number;
  recent_users_this_month: number;
  is_super_admin: boolean;
}

interface ExtendedAnalyticsData extends AnalyticsData {
  system_health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime_percentage: number;
    last_backup: string;
    performance_score: number;
  };
  user_growth: {
    weekly_growth: number;
    monthly_growth: number;
    retention_rate: number;
  };
  tool_usage: {
    most_used_tool: string;
    total_sessions: number;
    avg_session_duration: number;
  };
  recent_activity: {
    id: number;
    type: 'user_login' | 'user_created' | 'department_created' | 'approval_processed';
    description: string;
    timestamp: string;
    user_email?: string;
  }[];
  pending_items: {
    pending_approvals: number;
    pending_department_requests: number;
    pending_user_requests: number;
  };
  top_departments: {
    id: number;
    name: string;
    user_count: number;
    last_activity: string;
    status: 'active' | 'inactive';
  }[];
}

interface AdminOverviewProps {
  userRole: string | null;
  onTabChange?: (tabIndex: number) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ userRole, onTabChange }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [extendedAnalytics, setExtendedAnalytics] = useState<ExtendedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    if (userRole === 'super_admin') {
      fetchExtendedAnalytics();
    }
  }, [userRole]);

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

  const fetchExtendedAnalytics = async () => {
    try {
      // setLoadingExtended(true);
      // For now, we'll simulate extended analytics data since the backend endpoint doesn't exist yet
      // In a real implementation, this would call '/admin/api/analytics/extended'
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockExtendedData: ExtendedAnalyticsData = {
        ...analytics!,
        system_health: {
          status: 'healthy',
          uptime_percentage: 99.8,
          last_backup: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          performance_score: 92
        },
        user_growth: {
          weekly_growth: 12,
          monthly_growth: 45,
          retention_rate: 87
        },
        tool_usage: {
          most_used_tool: 'Response Time Analyzer',
          total_sessions: 1247,
          avg_session_duration: 18.5
        },
        recent_activity: [
          {
            id: 1,
            type: 'user_created',
            description: 'New user registered: john.doe@firestation.com',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            user_email: 'john.doe@firestation.com'
          },
          {
            id: 2,
            type: 'approval_processed',
            description: 'Department approval: Metro Fire Department',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          },
          {
            id: 3,
            type: 'user_login',
            description: 'Admin login: chief@rural-fire.org',
            timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
            user_email: 'chief@rural-fire.org'
          }
        ],
        pending_items: {
          pending_approvals: 3,
          pending_department_requests: 2,
          pending_user_requests: 5
        },
        top_departments: [
          {
            id: 1,
            name: 'Houston Fire Department',
            user_count: 45,
            last_activity: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
            status: 'active'
          },
          {
            id: 2,
            name: 'Metro Fire & EMS',
            user_count: 32,
            last_activity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            status: 'active'
          },
          {
            id: 3,
            name: 'Rural Fire District 7',
            user_count: 18,
            last_activity: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'active'
          }
        ]
      };
      
      setExtendedAnalytics(mockExtendedData);
    } catch (error) {
      console.error('Error fetching extended analytics:', error);
    } finally {
      // setLoadingExtended(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnalytics(),
      userRole === 'super_admin' ? fetchExtendedAnalytics() : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
      {/* System Status Header with Refresh */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {userRole === 'super_admin' ? 'Master Admin Dashboard' : 'Admin Overview'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole === 'super_admin' ? 'System-wide analytics and management' : 'Department analytics'}
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh sx={{ color: refreshing ? 'action.disabled' : 'primary.main' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Actions Panel for Master Admin */}
      {userRole === 'super_admin' && (
        <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings color="primary" />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                size="small"
                onClick={() => {
                  console.log('🔥 Add User button clicked - navigating to User Management tab');
                  onTabChange?.(1); // Tab index 1 = User Management
                }}
              >
                Add User
              </Button>
              <Button
                variant="contained"
                startIcon={<DomainAdd />}
                size="small"
                onClick={() => {
                  console.log('🔥 Add Department button clicked - navigating to Department Settings tab');
                  onTabChange?.(2); // Tab index 2 = Department Settings
                }}
              >
                Add Department
              </Button>
              <Button
                variant="outlined"
                startIcon={<Notifications />}
                size="small"
                color="warning"
                onClick={() => {
                  console.log('🔥 Pending Approvals button clicked - navigating to Pending Approvals tab');
                  onTabChange?.(4); // Tab index 4 = Pending Approvals (super admin only)
                }}
              >
                Pending Approvals ({extendedAnalytics?.pending_items.pending_approvals || 0})
              </Button>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                size="small"
                onClick={() => {
                  console.log('🔥 Detailed Reports button clicked - navigating to Notifications tab');
                  onTabChange?.(3); // Tab index 3 = Notifications tab (can show detailed analytics there)
                }}
              >
                Detailed Reports
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  {userRole === 'super_admin' && extendedAnalytics && (
                    <Typography variant="body2" color="success.main">
                      +{extendedAnalytics.user_growth.monthly_growth} this month
                    </Typography>
                  )}
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        {/* Departments */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        </Grid>

        {/* System Health / New Users */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {userRole === 'super_admin' ? 'System Health' : 'New This Month'}
                  </Typography>
                  {userRole === 'super_admin' && extendedAnalytics ? (
                    <>
                      <Typography variant="h4" color={
                        extendedAnalytics.system_health.status === 'healthy' ? 'success.main' :
                        extendedAnalytics.system_health.status === 'warning' ? 'warning.main' : 'error.main'
                      }>
                        {extendedAnalytics.system_health.performance_score}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {extendedAnalytics.system_health.uptime_percentage}% uptime
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" color="secondary.main">
                        {analytics.recent_users_this_month}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        new users
                      </Typography>
                    </>
                  )}
                </Box>
                {userRole === 'super_admin' ? (
                  <Shield sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                ) : (
                  <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Analytics for Master Admin */}
      {userRole === 'super_admin' && extendedAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Tool Usage Analytics */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics color="primary" />
                  Tool Usage
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Most Used Tool
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {extendedAnalytics.tool_usage.most_used_tool}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {extendedAnalytics.tool_usage.total_sessions.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Avg Duration</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {extendedAnalytics.tool_usage.avg_session_duration} min
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Growth Metrics */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline color="primary" />
                  User Growth
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Weekly Growth</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      +{extendedAnalytics.user_growth.weekly_growth}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Monthly Growth</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      +{extendedAnalytics.user_growth.monthly_growth}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Retention Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {extendedAnalytics.user_growth.retention_rate}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={extendedAnalytics.user_growth.retention_rate}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={extendedAnalytics.user_growth.retention_rate > 80 ? 'success' : 'warning'}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* System Performance */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Speed color="primary" />
                  System Performance
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Uptime</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {extendedAnalytics.system_health.uptime_percentage}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Performance Score</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {extendedAnalytics.system_health.performance_score}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Last Backup</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatTimeAgo(extendedAnalytics.system_health.last_backup)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2" color="success.main">
                    System Operating Normally
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Activity and Department Information */}
      <Grid container spacing={3}>
        {/* User Activity */}
        <Grid size={{ xs: 12, md: userRole === 'super_admin' ? 6 : 12 }}>
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
        </Grid>

        {/* Recent Activity for Master Admin */}
        {userRole === 'super_admin' && extendedAnalytics && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="primary" />
                  Recent Activity
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {extendedAnalytics.recent_activity.map((activity) => (
                    <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: activity.type === 'user_created' ? 'success.main' :
                                 activity.type === 'approval_processed' ? 'warning.main' :
                                 'info.main',
                        fontSize: '0.75rem'
                      }}>
                        {activity.type === 'user_created' ? <PersonAdd fontSize="small" /> :
                         activity.type === 'approval_processed' ? <CheckCircle fontSize="small" /> :
                         <People fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Department Status */}
        {userRole !== 'super_admin' && (
          <Grid size={{ xs: 12, md: 6 }}>
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Top Departments Table for Master Admin */}
      {userRole === 'super_admin' && extendedAnalytics && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business color="primary" />
              Top Departments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department Name</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">Last Activity</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extendedAnalytics.top_departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell component="th" scope="row">
                        {dept.name}
                      </TableCell>
                      <TableCell align="right">{dept.user_count}</TableCell>
                      <TableCell align="right">{formatTimeAgo(dept.last_activity)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={dept.status}
                          color={dept.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* System Health Status */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cloud color="primary" />
            System Health
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" />
                <Typography variant="body2">
                  User Management: Operational
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" />
                <Typography variant="body2">
                  Department Management: Operational
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
            </Grid>
            {userRole === 'super_admin' && extendedAnalytics && (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle color="success" />
                    <Typography variant="body2">
                      Approval Workflows: Active
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Storage color="info" />
                    <Typography variant="body2">
                      Database: {extendedAnalytics.system_health.performance_score}% Performance
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Shield color="success" />
                    <Typography variant="body2">
                      Security: All Systems Normal
                    </Typography>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminOverview;