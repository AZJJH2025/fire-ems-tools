import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import {
  Save,
  Business,
  Settings,
  Security,
  Api,
  Refresh
} from '@mui/icons-material';

interface Department {
  id: number;
  name: string;
  code: string;
  department_type: string;
  is_active: boolean;
  created_at: string;
  user_count: number;
  api_enabled: boolean;
  features_enabled: Record<string, boolean>;
}

interface DepartmentSettingsProps {
  userRole: string | null;
}

const DepartmentSettings: React.FC<DepartmentSettingsProps> = ({ userRole }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/departments', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const result = await response.json();
      if (result.success) {
        setDepartments(result.departments);
      } else {
        throw new Error(result.error || 'Failed to load departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async (departmentId: number, updates: Partial<Department>) => {
    try {
      setSaving(true);
      const response = await fetch(`/admin/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (result.success) {
        setDepartments(prev => prev.map(dept => 
          dept.id === departmentId 
            ? { ...dept, ...updates }
            : dept
        ));
        setSuccessMessage('Department updated successfully');
        setError(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setError(error instanceof Error ? error.message : 'Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  const getDepartmentTypeColor = (type: string) => {
    switch (type) {
      case 'fire':
        return 'error';
      case 'ems':
        return 'info';
      case 'combined':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Department Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDepartments}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Department Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {departments.map((department) => (
          <Card key={department.id}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                  <Business color="primary" />
                  <Typography variant="h6">
                    {department.name}
                  </Typography>
                  <Chip
                    label={department.department_type.toUpperCase()}
                    color={getDepartmentTypeColor(department.department_type)}
                    size="small"
                  />
                  <Chip
                    label={department.is_active ? 'Active' : 'Inactive'}
                    color={department.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Department Code: {department.code} • Created: {formatDate(department.created_at)} • {department.user_count} Users
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Basic Settings */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings fontSize="small" />
                    Basic Settings
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Department Name"
                      fullWidth
                      value={department.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setDepartments(prev => prev.map(dept => 
                          dept.id === department.id 
                            ? { ...dept, name: newName }
                            : dept
                        ));
                      }}
                      size="small"
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Department Type</InputLabel>
                      <Select
                        value={department.department_type}
                        onChange={(e) => {
                          const newType = e.target.value as string;
                          setDepartments(prev => prev.map(dept => 
                            dept.id === department.id 
                              ? { ...dept, department_type: newType }
                              : dept
                          ));
                        }}
                        label="Department Type"
                      >
                        <MenuItem value="fire">Fire</MenuItem>
                        <MenuItem value="ems">EMS</MenuItem>
                        <MenuItem value="combined">Combined Fire/EMS</MenuItem>
                      </Select>
                    </FormControl>

                    {userRole === 'super_admin' && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={department.is_active}
                            onChange={(e) => {
                              const newActive = e.target.checked;
                              setDepartments(prev => prev.map(dept => 
                                dept.id === department.id 
                                  ? { ...dept, is_active: newActive }
                                  : dept
                              ));
                            }}
                          />
                        }
                        label="Department Active"
                      />
                    )}
                  </Box>
                </Box>

                {/* Advanced Settings */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security fontSize="small" />
                    Advanced Settings
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={department.api_enabled}
                          onChange={(e) => {
                            const newApiEnabled = e.target.checked;
                            setDepartments(prev => prev.map(dept => 
                              dept.id === department.id 
                                ? { ...dept, api_enabled: newApiEnabled }
                                : dept
                            ));
                          }}
                        />
                      }
                      label="API Access Enabled"
                    />

                    <Typography variant="subtitle2" gutterBottom>
                      Available Features
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <List dense>
                        {Object.entries(department.features_enabled || {}).map(([feature, enabled]) => (
                          <ListItem key={feature} divider>
                            <ListItemText 
                              primary={feature.replace('_', ' ').toUpperCase()}
                              secondary={enabled ? 'Enabled' : 'Disabled'}
                            />
                            <ListItemSecondaryAction>
                              <Switch
                                edge="end"
                                checked={enabled}
                                onChange={(e) => {
                                  const newFeatures = {
                                    ...department.features_enabled,
                                    [feature]: e.target.checked
                                  };
                                  setDepartments(prev => prev.map(dept => 
                                    dept.id === department.id 
                                      ? { ...dept, features_enabled: newFeatures }
                                      : dept
                                  ));
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                        {Object.keys(department.features_enabled || {}).length === 0 && (
                          <ListItem>
                            <ListItemText 
                              primary="No features configured"
                              secondary="Contact administrator to enable features"
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Save Button */}
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => handleUpdateDepartment(department.id, {
                    name: department.name,
                    department_type: department.department_type,
                    is_active: department.is_active,
                    api_enabled: department.api_enabled,
                    features_enabled: department.features_enabled
                  })}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}

        {departments.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Departments Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userRole === 'super_admin' 
                ? 'Create a new department to get started.'
                : 'Contact your administrator to set up departments.'
              }
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default DepartmentSettings;