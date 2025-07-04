import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  Person,
  Edit,
  Security,
  Settings,
  Close,
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Error,
  Business,
  Email,
  Phone,
  LocationOn,
  Notifications,
  Schedule
} from '@mui/icons-material';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate?: (updatedUser: any) => void;
}

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onClose,
  user,
  onUserUpdate
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || '',
    employee_id: user?.employee_id || ''
  });

  // Department Information State
  const [departmentInfo, setDepartmentInfo] = useState({
    department_id: user?.department_id || '',
    station_assignment: user?.station_assignment || '',
    shift: user?.shift || '',
    rank: user?.rank || ''
  });

  // Account Preferences State
  const [preferences, setPreferences] = useState({
    timezone: user?.timezone || 'America/Phoenix',
    email_notifications: user?.email_notifications !== false,
    sms_notifications: user?.sms_notifications !== false,
    report_notifications: user?.report_notifications !== false,
    language: user?.language || 'en',
    date_format: user?.date_format || 'MM/DD/YYYY'
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Available departments (would come from API)
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        title: user.title || '',
        employee_id: user.employee_id || ''
      });
      
      setDepartmentInfo({
        department_id: user.department_id || '',
        station_assignment: user.station_assignment || '',
        shift: user.shift || '',
        rank: user.rank || ''
      });
      
      setPreferences({
        timezone: user.timezone || 'America/Phoenix',
        email_notifications: user.email_notifications !== false,
        sms_notifications: user.sms_notifications !== false,
        report_notifications: user.report_notifications !== false,
        language: user.language || 'en',
        date_format: user.date_format || 'MM/DD/YYYY'
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    const errors = validatePassword(password);
    const score = ((4 - errors.length) / 4) * 100;
    
    if (score === 100) return { score, label: 'Strong', color: 'success' };
    if (score >= 75) return { score, label: 'Good', color: 'info' };
    if (score >= 50) return { score, label: 'Fair', color: 'warning' };
    return { score, label: 'Weak', color: 'error' };
  };

  const handlePersonalInfoSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch('/auth/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: 'personal',
          data: personalInfo
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Personal information updated successfully');
        if (onUserUpdate) {
          onUserUpdate({ ...user, ...personalInfo });
        }
      } else {
        setError(data.message || 'Failed to update personal information');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch('/auth/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          section: 'preferences',
          data: preferences
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Preferences updated successfully');
        if (onUserUpdate) {
          onUserUpdate({ ...user, ...preferences });
        }
      } else {
        setError(data.message || 'Failed to update preferences');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setError('');
    setLoading(true);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const response = await fetch('/auth/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="primary" />
            <Typography variant="h6">
              User Profile
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="profile tabs">
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Business />} label="Department" />
          <Tab icon={<Settings />} label="Preferences" />
          <Tab icon={<Security />} label="Security" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, maxHeight: '60vh', overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }} icon={<Error />}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ m: 2 }} icon={<CheckCircle />}>
            {success}
          </Alert>
        )}

        {/* Personal Information Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Job Title"
                value={personalInfo.title}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                value={personalInfo.employee_id}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, employee_id: e.target.value }))}
                fullWidth
                disabled={loading}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handlePersonalInfoSubmit}
              disabled={loading}
              startIcon={<CheckCircle />}
            >
              Save Personal Information
            </Button>
          </Box>
        </TabPanel>

        {/* Department Information Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Department Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current department: {user?.department_name || 'No department assigned'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Station Assignment"
                value={departmentInfo.station_assignment}
                onChange={(e) => setDepartmentInfo(prev => ({ ...prev, station_assignment: e.target.value }))}
                fullWidth
                disabled={loading}
                placeholder="Station 1, Station 2, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Shift</InputLabel>
                <Select
                  value={departmentInfo.shift}
                  label="Shift"
                  onChange={(e) => setDepartmentInfo(prev => ({ ...prev, shift: e.target.value }))}
                >
                  <MenuItem value="A">A Shift</MenuItem>
                  <MenuItem value="B">B Shift</MenuItem>
                  <MenuItem value="C">C Shift</MenuItem>
                  <MenuItem value="Day">Day Shift</MenuItem>
                  <MenuItem value="Night">Night Shift</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rank/Position"
                value={departmentInfo.rank}
                onChange={(e) => setDepartmentInfo(prev => ({ ...prev, rank: e.target.value }))}
                fullWidth
                disabled={loading}
                placeholder="Firefighter, Lieutenant, Captain, etc."
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Preferences
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={preferences.timezone}
                  label="Timezone"
                  onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <MenuItem value="America/Phoenix">America/Phoenix (MST)</MenuItem>
                  <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
                  <MenuItem value="America/Denver">America/Denver (MST)</MenuItem>
                  <MenuItem value="America/Chicago">America/Chicago (CST)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={preferences.date_format}
                  label="Date Format"
                  onChange={(e) => setPreferences(prev => ({ ...prev, date_format: e.target.value }))}
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.email_notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email_notifications: e.target.checked }))}
                    disabled={loading}
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive email notifications for important updates and reports
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.report_notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, report_notifications: e.target.checked }))}
                    disabled={loading}
                  />
                }
                label="Report Generation Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Get notified when reports are ready for download
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handlePreferencesSubmit}
              disabled={loading}
              startIcon={<CheckCircle />}
            >
              Save Preferences
            </Button>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {passwordData.newPassword && (
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Password Strength</Typography>
                    <Typography variant="body2" color={`${passwordStrength.color}.main`}>
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.300',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${passwordStrength.score}%`,
                        bgcolor: `${passwordStrength.color}.main`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                fullWidth
                disabled={loading}
                error={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={
                  passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handlePasswordSubmit}
              disabled={loading}
              startIcon={<Security />}
            >
              Change Password
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Account Security
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={user?.has_temp_password ? "Temporary Password" : "Secure Password"} 
              color={user?.has_temp_password ? "warning" : "success"}
              size="small"
            />
            {user?.last_login && (
              <Typography variant="body2" color="text.secondary">
                Last login: {new Date(user.last_login).toLocaleString()}
              </Typography>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileModal;