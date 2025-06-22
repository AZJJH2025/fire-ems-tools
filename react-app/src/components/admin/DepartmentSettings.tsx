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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save,
  Business,
  Settings,
  Security,
  Api,
  Refresh,
  Add
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

// Tool display information mapping
const getToolDisplayInfo = (featureName: string) => {
  const toolMap: Record<string, { name: string; route?: string; description?: string }> = {
    'data-formatter': {
      name: 'Data Formatter',
      route: '/app/data-formatter',
      description: 'Transform CAD exports into standardized formats'
    },
    'response-time-analyzer': {
      name: 'Response Time Analyzer', 
      route: '/app/response-time-analyzer',
      description: 'NFPA 1710 compliance analysis and reporting'
    },
    'fire-map-pro': {
      name: 'Fire Map Pro',
      route: '/app/fire-map-pro', 
      description: 'Advanced incident mapping and geographic analysis'
    },
    'water-supply-coverage': {
      name: 'Water Supply Coverage',
      route: '/water-supply-coverage',
      description: 'Rural water supply coverage analysis'
    },
    'iso-credit-calculator': {
      name: 'ISO Credit Calculator',
      route: '/iso-credit-calculator',
      description: 'Fire Suppression Rating Schedule assessment'
    },
    'station-coverage-optimizer': {
      name: 'Station Coverage Optimizer',
      route: '/station-coverage-optimizer',
      description: 'Optimize station locations and response coverage'
    },
    'admin-console': {
      name: 'Admin Console',
      route: '/app/admin',
      description: 'Department and user management'
    },
    'call-density-heatmap': {
      name: 'Call Density Heatmap',
      description: 'Legacy tool - Geographic incident density analysis'
    },
    'coverage-gap-finder': {
      name: 'Coverage Gap Finder',
      description: 'Legacy tool - Identify response coverage gaps'
    }
  };

  return toolMap[featureName] || {
    name: featureName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Unknown feature'
  };
};

const DepartmentSettings: React.FC<DepartmentSettingsProps> = ({ userRole }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create department dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    department_type: 'combined'
  });

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

  const handleCreateDepartment = async () => {
    try {
      setSaving(true);
      const response = await fetch('/admin/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDepartment),
      });

      const result = await response.json();
      if (result.success) {
        // Add new department to list
        setDepartments(prev => [...prev, result.department]);
        setSuccessMessage('Department created successfully');
        setError(null);
        
        // Reset form and close dialog
        setNewDepartment({ name: '', code: '', department_type: 'combined' });
        setCreateDialogOpen(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      setError(error instanceof Error ? error.message : 'Failed to create department');
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          {userRole === 'super_admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Department
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDepartments}
          >
            Refresh
          </Button>
        </Box>
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
                        {Object.entries(department.features_enabled || {}).map(([feature, enabled]) => {
                          const toolInfo = getToolDisplayInfo(feature);
                          return (
                            <ListItem key={feature} divider>
                              <ListItemText 
                                primary={toolInfo.name}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                      size="small" 
                                      label={enabled ? 'Enabled' : 'Disabled'}
                                      color={enabled ? 'success' : 'default'}
                                      variant={enabled ? 'filled' : 'outlined'}
                                    />
                                    {toolInfo.route && (
                                      <Typography variant="caption" color="text.secondary">
                                        {toolInfo.route}
                                      </Typography>
                                    )}
                                  </Box>
                                }
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
                          );
                        })}
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

      {/* Create Department Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Create New Department
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Department Name"
              fullWidth
              value={newDepartment.name}
              onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Springfield Fire Department"
              required
            />
            
            <TextField
              label="Department Code"
              fullWidth
              value={newDepartment.code}
              onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., SFD"
              required
              helperText="Short unique identifier for the department"
            />

            <FormControl fullWidth>
              <InputLabel>Department Type</InputLabel>
              <Select
                value={newDepartment.department_type}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, department_type: e.target.value as string }))}
                label="Department Type"
              >
                <MenuItem value="fire">Fire Department</MenuItem>
                <MenuItem value="ems">EMS Service</MenuItem>
                <MenuItem value="combined">Combined Fire/EMS</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateDepartment}
            disabled={saving || !newDepartment.name.trim() || !newDepartment.code.trim()}
            startIcon={<Save />}
          >
            {saving ? 'Creating...' : 'Create Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentSettings;