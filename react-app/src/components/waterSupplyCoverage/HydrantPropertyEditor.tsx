/**
 * Hydrant Property Editor Dialog
 * 
 * Allows fire chiefs to edit hydrant properties including flow rate,
 * pressure, type, and operational details.
 */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  InputAdornment,
  Divider,
  Alert
} from '@mui/material';
import {
  WaterDrop as HydrantIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import { updateHydrant, addHydrant } from '../../state/redux/waterSupplyCoverageSlice';
import { FireHydrant, HydrantType, HydrantSize, OperationalStatus } from '../../types/tankZoneCoverage';

interface HydrantPropertyEditorProps {
  hydrant: FireHydrant | null;
  open: boolean;
  onClose: () => void;
  isNewHydrant?: boolean;
}

const HydrantPropertyEditor: React.FC<HydrantPropertyEditorProps> = ({
  hydrant,
  open,
  onClose,
  isNewHydrant = false
}) => {
  const dispatch = useDispatch();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    flowRate: 1000,
    staticPressure: 50,
    residualPressure: 20,
    type: 'municipal' as HydrantType,
    size: '4-inch' as HydrantSize,
    operationalStatus: 'active' as OperationalStatus,
    owner: 'Water Department',
    contactInfo: '',
    notes: '',
    elevation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when hydrant changes
  useEffect(() => {
    if (hydrant) {
      setFormData({
        name: hydrant.name || '',
        flowRate: hydrant.flowRate || 1000,
        staticPressure: hydrant.staticPressure || 50,
        residualPressure: hydrant.residualPressure || 20,
        type: hydrant.type || 'municipal',
        size: hydrant.size || '4-inch',
        operationalStatus: hydrant.operationalStatus || 'active',
        owner: hydrant.owner || 'Water Department',
        contactInfo: hydrant.contactInfo || '',
        notes: hydrant.notes || '',
        elevation: hydrant.elevation ? hydrant.elevation.toString() : ''
      });
    }
    setErrors({});
  }, [hydrant]);

  // Handle form field changes
  const handleFieldChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hydrant name is required';
    }

    if (formData.flowRate <= 0) {
      newErrors.flowRate = 'Flow rate must be greater than 0';
    }

    if (formData.flowRate > 5000) {
      newErrors.flowRate = 'Flow rate seems unreasonably high (>5000 GPM)';
    }

    if (formData.staticPressure <= 0) {
      newErrors.staticPressure = 'Static pressure must be greater than 0';
    }

    if (formData.residualPressure <= 0) {
      newErrors.residualPressure = 'Residual pressure must be greater than 0';
    }

    if (formData.residualPressure >= formData.staticPressure) {
      newErrors.residualPressure = 'Residual pressure must be less than static pressure';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner information is required';
    }

    if (formData.elevation && isNaN(Number(formData.elevation))) {
      newErrors.elevation = 'Elevation must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!hydrant || !validateForm()) return;

    if (isNewHydrant) {
      // Create new hydrant
      const newHydrant = {
        name: formData.name.trim(),
        location: hydrant.location,
        flowRate: Number(formData.flowRate),
        staticPressure: Number(formData.staticPressure),
        residualPressure: Number(formData.residualPressure),
        type: formData.type,
        size: formData.size,
        operationalStatus: formData.operationalStatus,
        owner: formData.owner.trim(),
        contactInfo: formData.contactInfo.trim(),
        notes: formData.notes.trim(),
        elevation: formData.elevation ? Number(formData.elevation) : undefined
      };

      dispatch(addHydrant(newHydrant));
      console.log('🆕 New hydrant created:', newHydrant.name, 'flow rate:', newHydrant.flowRate, 'GPM');
    } else {
      // Update existing hydrant
      const updatedHydrant: FireHydrant = {
        ...hydrant,
        name: formData.name.trim(),
        flowRate: Number(formData.flowRate),
        staticPressure: Number(formData.staticPressure),
        residualPressure: Number(formData.residualPressure),
        type: formData.type,
        size: formData.size,
        operationalStatus: formData.operationalStatus,
        owner: formData.owner.trim(),
        contactInfo: formData.contactInfo.trim(),
        notes: formData.notes.trim(),
        elevation: formData.elevation ? Number(formData.elevation) : undefined,
        modified: new Date()
      };

      dispatch(updateHydrant(updatedHydrant));
      console.log('💾 Hydrant updated:', updatedHydrant.name, 'flow rate:', updatedHydrant.flowRate, 'GPM');
    }

    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  if (!hydrant) return null;

  // Common flow rate options for quick selection
  const commonFlowRates = [
    { value: 500, label: '500 GPM (Low Flow)' },
    { value: 1000, label: '1,000 GPM (Standard)' },
    { value: 1500, label: '1,500 GPM (High Flow)' },
    { value: 2000, label: '2,000 GPM (Very High)' },
    { value: 2500, label: '2,500 GPM (Maximum)' }
  ];

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <HydrantIcon color="primary" />
          <Typography variant="h6">
            {isNewHydrant ? 'New Hydrant Properties' : `Edit Hydrant: ${hydrant.name}`}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Location: {hydrant.location?.latitude?.toFixed(6) || 'Unknown'}, {hydrant.location?.longitude?.toFixed(6) || 'Unknown'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hydrant Name"
              value={formData.name}
              onChange={handleFieldChange('name')}
              error={!!errors.name}
              helperText={errors.name || 'e.g., "Main St & 1st Ave", "Station 5 Front"'}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Owner"
              value={formData.owner}
              onChange={handleFieldChange('owner')}
              error={!!errors.owner}
              helperText={errors.owner || 'Who owns/maintains this hydrant'}
              required
            />
          </Grid>

          {/* Hydrant Specifications */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom color="primary">
              Hydrant Specifications
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Flow Rate"
              type="number"
              value={formData.flowRate}
              onChange={handleFieldChange('flowRate')}
              error={!!errors.flowRate}
              helperText={errors.flowRate || 'Maximum flow rate in gallons per minute'}
              InputProps={{
                endAdornment: <InputAdornment position="end">GPM</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Static Pressure"
              type="number"
              value={formData.staticPressure}
              onChange={handleFieldChange('staticPressure')}
              error={!!errors.staticPressure}
              helperText={errors.staticPressure || 'Static pressure when not flowing'}
              InputProps={{
                endAdornment: <InputAdornment position="end">PSI</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Residual Pressure"
              type="number"
              value={formData.residualPressure}
              onChange={handleFieldChange('residualPressure')}
              error={!!errors.residualPressure}
              helperText={errors.residualPressure || 'Pressure at rated flow'}
              InputProps={{
                endAdornment: <InputAdornment position="end">PSI</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Hydrant Type"
              value={formData.type}
              onChange={handleFieldChange('type')}
              helperText="Type of hydrant water source"
            >
              <MenuItem value="municipal">Municipal - Connected to city water system</MenuItem>
              <MenuItem value="industrial">Industrial - Private industrial system</MenuItem>
              <MenuItem value="cistern">Cistern - Fed by underground cistern</MenuItem>
              <MenuItem value="dry">Dry Hydrant - Suction source only</MenuItem>
              <MenuItem value="private">Private - Private water system</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Hydrant Size"
              value={formData.size}
              onChange={handleFieldChange('size')}
              helperText="Main steamer port size"
            >
              <MenuItem value="4-inch">4-inch - Standard steamer port</MenuItem>
              <MenuItem value="5-inch">5-inch - Large steamer port</MenuItem>
              <MenuItem value="6-inch">6-inch - Extra large steamer port</MenuItem>
              <MenuItem value="dual">Dual - Multiple steamer ports</MenuItem>
              <MenuItem value="unknown">Unknown - Size not documented</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Operational Status"
              value={formData.operationalStatus}
              onChange={handleFieldChange('operationalStatus')}
              helperText="Current operational state"
            >
              <MenuItem value="active">Active - Ready for use</MenuItem>
              <MenuItem value="inactive">Inactive - Not currently available</MenuItem>
              <MenuItem value="maintenance">Maintenance - Temporarily out of service</MenuItem>
              <MenuItem value="seasonal">Seasonal - Weather dependent</MenuItem>
              <MenuItem value="unknown">Unknown - Status needs verification</MenuItem>
            </TextField>
          </Grid>

          {/* Quick Flow Rate Selection */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Flow Rate Selection:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {commonFlowRates.map(option => (
                <Button
                  key={option.value}
                  size="small"
                  variant={formData.flowRate === option.value ? "contained" : "outlined"}
                  onClick={() => setFormData(prev => ({ ...prev, flowRate: option.value }))}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {option.label}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom color="primary">
              Additional Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Information"
              value={formData.contactInfo}
              onChange={handleFieldChange('contactInfo')}
              helperText="Phone number or contact for issues"
              placeholder="(555) 123-4567"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Elevation (feet)"
              type="number"
              value={formData.elevation}
              onChange={handleFieldChange('elevation')}
              error={!!errors.elevation}
              helperText={errors.elevation || "Elevation above sea level (optional)"}
              InputProps={{
                endAdornment: <InputAdornment position="end">ft</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={handleFieldChange('notes')}
              helperText="Additional notes about this hydrant (access instructions, restrictions, etc.)"
              placeholder="e.g., 'Located in parking lot', 'Requires special wrench', 'Low pressure area'"
            />
          </Grid>

          {/* Validation Messages */}
          {Object.keys(errors).length > 0 && (
            <Grid item xs={12}>
              <Alert severity="error">
                Please correct the errors above before saving.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleCancel}
          startIcon={<CancelIcon />}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={Object.keys(errors).length > 0}
        >
          Save Hydrant
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HydrantPropertyEditor;