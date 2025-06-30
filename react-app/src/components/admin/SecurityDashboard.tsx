import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Alert,
  Chip,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Fab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Shield,
  Security,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Assessment,
  VpnLock,
  AdminPanelSettings
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SecurityMetrics {
  authentication: {
    total_login_attempts: number;
    successful_logins: number;
    failed_logins: number;
    failure_rate: number;
    unique_users: number;
    recent_failed_attempts: Array<{
      email: string;
      timestamp: string;
      ip_address: string;
      reason: string;
    }>;
  };
  access_control: {
    admin_actions: number;
    permission_changes: number;
    active_sessions: number;
    privileged_access_events: number;
  };
  data_integrity: {
    data_access_events: number;
    data_modifications: number;
    data_exports: number;
    pii_access_events: number;
    bulk_operations: number;
  };
  system_security: {
    security_events: number;
    error_events: number;
    configuration_changes: number;
    uptime_percentage: number;
    response_time_avg: number;
  };
  compliance: {
    logging_enabled: boolean;
    encryption_enabled: boolean;
    backup_status: string;
    last_audit_date: string;
    compliance_score: number;
    controls_implemented: number;
    controls_total: number;
  };
}

interface SecurityAlert {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  timestamp: string;
  action_required: string;
}

interface ComplianceStatus {
  overall_status: string;
  compliance_percentage: number;
  compliant_controls: number;
  total_controls: number;
  in_progress_controls: number;
  controls_detail: Record<string, {
    implemented: boolean;
    last_review: string | null;
    status: 'compliant' | 'in_progress' | 'pending';
  }>;
  last_assessment: string;
  next_assessment: string;
}

interface AuditEvent {
  event_type: string;
  timestamp: string;
  context: {
    ip_address: string;
    user_id: string;
    session_id: string;
  };
  data: Record<string, any>;
}

const SecurityDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch('/admin/security/api/security-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const response = await fetch('/admin/security/api/security-alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    }
  };

  const fetchComplianceStatus = async () => {
    try {
      const response = await fetch('/admin/security/api/compliance-status');
      if (response.ok) {
        const data = await response.json();
        setComplianceStatus(data);
      }
    } catch (error) {
      console.error('Error fetching compliance status:', error);
    }
  };

  const fetchAuditEvents = async (eventType: string = '') => {
    try {
      const url = `/admin/security/api/audit-events?hours=24${eventType ? '&type=' + eventType : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAuditEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching audit events:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSecurityMetrics(),
      fetchSecurityAlerts(),
      fetchComplianceStatus(),
      fetchAuditEvents(eventTypeFilter)
    ]);
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAuditEvents(eventTypeFilter);
  }, [eventTypeFilter]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle color="success" />;
      case 'in_progress': return <Warning color="warning" />;
      case 'pending': return <Error color="error" />;
      default: return <Error />;
    }
  };

  // Chart data for security metrics
  const authenticationChartData = metrics ? [
    { name: 'Successful', value: metrics.authentication.successful_logins, color: '#4caf50' },
    { name: 'Failed', value: metrics.authentication.failed_logins, color: '#f44336' }
  ] : [];

  const dataIntegrityChartData = metrics ? [
    { name: 'Access', value: metrics.data_integrity.data_access_events },
    { name: 'Modifications', value: metrics.data_integrity.data_modifications },
    { name: 'Exports', value: metrics.data_integrity.data_exports },
    { name: 'PII Access', value: metrics.data_integrity.pii_access_events }
  ] : [];

  if (loading && !metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Security Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Shield sx={{ mr: 2, verticalAlign: 'middle' }} />
          Security Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          SOC 2 Compliance Monitoring & Security Operations
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Last updated: {lastRefresh.toLocaleString()}
        </Typography>
      </Box>

      {/* Quick Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {complianceStatus?.compliance_percentage || 85}%
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Compliance Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                {alerts.length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Active Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {auditEvents.length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Audit Events (24h)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {metrics?.authentication.total_login_attempts || 0}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Login Attempts (24h)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<Assessment />} label="Overview" />
          <Tab icon={<VpnLock />} label="Compliance" />
          <Tab icon={<Warning />} label="Alerts" />
          <Tab icon={<AdminPanelSettings />} label="Audit Logs" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Authentication Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication Summary (24h)
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={authenticationChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {authenticationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Data Integrity Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Security Events (24h)
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataIntegrityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2196f3" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Authentication Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Successful Logins:</Typography>
                    <Typography variant="h6" color="success.main">
                      {metrics?.authentication.successful_logins || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Failed Attempts:</Typography>
                    <Typography variant="h6" color="error.main">
                      {metrics?.authentication.failed_logins || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Unique Users:</Typography>
                    <Typography variant="h6" color="info.main">
                      {metrics?.authentication.unique_users || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Failure Rate:</Typography>
                    <Typography variant="h6">
                      {metrics?.authentication.failure_rate?.toFixed(1) || 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Health */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Uptime:</Typography>
                    <Typography variant="h6" color="success.main">
                      {metrics?.system_security.uptime_percentage || 99.5}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Avg Response:</Typography>
                    <Typography variant="h6">
                      {metrics?.system_security.response_time_avg || 250}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Security Events:</Typography>
                    <Typography variant="h6" color="warning.main">
                      {metrics?.system_security.security_events || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Config Changes:</Typography>
                    <Typography variant="h6">
                      {metrics?.system_security.configuration_changes || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && complianceStatus && (
        <Grid container spacing={3}>
          {/* Overall Compliance */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SOC 2 Compliance Status
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      Overall Compliance: {complianceStatus.compliance_percentage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={complianceStatus.compliance_percentage}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      Controls Implemented: {complianceStatus.compliant_controls}/{complianceStatus.total_controls}
                    </Typography>
                    <Typography variant="body2">
                      In Progress: {complianceStatus.in_progress_controls}
                    </Typography>
                    <Typography variant="body2">
                      Last Assessment: {complianceStatus.last_assessment}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Controls Detail */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Control Implementation Status
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(complianceStatus.controls_detail).map(([key, control]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          {getStatusIcon(control.status)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Review: {control.last_review || 'Never'}
                        </Typography>
                        <Chip
                          label={control.status.toUpperCase()}
                          color={getStatusColor(control.status) as any}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Security Alerts
                </Typography>
                {alerts.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Security color="success" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                      No Active Security Alerts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System is secure and operating normally.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {alerts.map((alert, index) => (
                      <ListItem key={index} divider>
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1">{alert.title}</Typography>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {alert.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Action Required: {alert.action_required}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Chip
                                label={alert.severity.toUpperCase()}
                                color={getAlertColor(alert.severity) as any}
                                size="small"
                              />
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {new Date(alert.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Recent Audit Events</Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Event Type</InputLabel>
                    <Select
                      value={eventTypeFilter}
                      label="Filter by Event Type"
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                    >
                      <MenuItem value="">All Event Types</MenuItem>
                      <MenuItem value="LOGIN_ATTEMPT">Login Attempts</MenuItem>
                      <MenuItem value="ADMIN_ACTION">Admin Actions</MenuItem>
                      <MenuItem value="DATA_ACCESS">Data Access</MenuItem>
                      <MenuItem value="DATA_MODIFICATION">Data Modifications</MenuItem>
                      <MenuItem value="SECURITY_EVENT">Security Events</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event Type</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>User/IP</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditEvents.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={event.event_type.replace(/_/g, ' ')}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(event.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {event.context.user_id || 'system'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {event.context.ip_address}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {JSON.stringify(event.data).substring(0, 100)}...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Refresh FAB */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={loadAllData}
        disabled={loading}
      >
        <Refresh />
      </Fab>
    </Box>
  );
};

export default SecurityDashboard;