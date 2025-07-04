/**
 * Tank Property Editor Dialog
 * 
 * Allows fire chiefs to edit tank properties including capacity,
 * type, access rating, and operational details.
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
  LocalFireDepartment as TankIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import { updateTank, addTank } from '../../state/redux/waterSupplyCoverageSlice';
import { WaterTank, TankType, AccessRating, OperationalStatus } from '../../types/tankZoneCoverage';

interface TankPropertyEditorProps {
  tank: WaterTank | null;
  open: boolean;
  onClose: () => void;
  isNewTank?: boolean;
}

const TankPropertyEditor: React.FC<TankPropertyEditorProps> = ({
  tank,
  open,
  onClose,
  isNewTank = false
}) => {
  const dispatch = useDispatch();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: 25000,
    type: 'municipal' as TankType,
    accessRating: 'good' as AccessRating,
    operationalStatus: 'active' as OperationalStatus,
    owner: 'Fire Department',
    contactInfo: '',
    notes: '',
    elevation: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when tank changes
  useEffect(() => {
    if (tank) {
      setFormData({
        name: tank.name || '',
        capacity: tank.capacity || 25000,
        type: tank.type || 'municipal',
        accessRating: tank.accessRating || 'good',
        operationalStatus: tank.operationalStatus || 'active',
        owner: tank.owner || 'Fire Department',
        contactInfo: tank.contactInfo || '',
        notes: tank.notes || '',
        elevation: tank.elevation ? tank.elevation.toString() : ''
      });
    }
    setErrors({});
  }, [tank]);

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
      newErrors.name = 'Tank name is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.capacity > 1000000) {
      newErrors.capacity = 'Capacity seems unreasonably large (>1M gallons)';
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
    if (!tank || !validateForm()) return;

    if (isNewTank) {
      // Create new tank
      const newTank = {
        name: formData.name.trim(),
        location: tank.location,
        capacity: Number(formData.capacity),
        type: formData.type,
        accessRating: formData.accessRating,
        operationalStatus: formData.operationalStatus,
        owner: formData.owner.trim(),
        contactInfo: formData.contactInfo.trim(),
        notes: formData.notes.trim(),
        elevation: formData.elevation ? Number(formData.elevation) : undefined
      };

      dispatch(addTank(newTank));
      console.log('🆕 New tank created:', newTank.name, 'capacity:', newTank.capacity);
    } else {
      // Update existing tank
      const updatedTank: WaterTank = {
        ...tank,
        name: formData.name.trim(),
        capacity: Number(formData.capacity),
        type: formData.type,
        accessRating: formData.accessRating,
        operationalStatus: formData.operationalStatus,
        owner: formData.owner.trim(),
        contactInfo: formData.contactInfo.trim(),
        notes: formData.notes.trim(),
        elevation: formData.elevation ? Number(formData.elevation) : undefined,
        modified: new Date()
      };

      dispatch(updateTank(updatedTank));
      console.log('💾 Tank updated:', updatedTank.name, 'capacity:', updatedTank.capacity);
    }

    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  if (!tank) return null;

  // Common capacity options for quick selection
  const commonCapacities = [
    { value: 5000, label: '5,000 gallons (Small)' },
    { value: 10000, label: '10,000 gallons' },
    { value: 25000, label: '25,000 gallons (Standard)' },
    { value: 50000, label: '50,000 gallons' },
    { value: 100000, label: '100,000 gallons (Large)' },
    { value: 250000, label: '250,000 gallons (Very Large)' }
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
          <TankIcon color="primary" />
          <Typography variant="h6">
            {isNewTank ? 'New Tank Properties' : `Edit Tank: ${tank.name}`}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Location: {tank.location?.latitude?.toFixed(6) || 'Unknown'}, {tank.location?.longitude?.toFixed(6) || 'Unknown'}
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
              label="Tank Name"
              value={formData.name}
              onChange={handleFieldChange('name')}
              error={!!errors.name}
              helperText={errors.name || 'e.g., "Main Street Tank", "Station 5 Tank"'}
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
              helperText={errors.owner || 'Who owns/maintains this tank'}
              required
            />
          </Grid>

          {/* Tank Specifications */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom color="primary">
              Tank Specifications
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={handleFieldChange('capacity')}
              error={!!errors.capacity}
              helperText={errors.capacity || 'Tank capacity in gallons'}
              InputProps={{
                endAdornment: <InputAdornment position="end">gallons</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Tank Type"
              value={formData.type}
              onChange={handleFieldChange('type')}
              helperText="Primary use classification"
            >
              <MenuItem value="municipal">Municipal</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="industrial">Industrial</MenuItem>
              <MenuItem value="agricultural">Agricultural</MenuItem>
              <MenuItem value="portable">Portable</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Access Rating"
              value={formData.accessRating}
              onChange={handleFieldChange('accessRating')}
              helperText="How easily can fire apparatus access this tank"
            >
              <MenuItem value="excellent">Excellent - Easy access, good road conditions</MenuItem>
              <MenuItem value="good">Good - Accessible but may require coordination</MenuItem>
              <MenuItem value="fair">Fair - Limited access, rough terrain</MenuItem>
              <MenuItem value="poor">Poor - Difficult access, special equipment needed</MenuItem>
              <MenuItem value="restricted">Restricted - Permission required</MenuItem>
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

          {/* Quick Capacity Selection */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Capacity Selection:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {commonCapacities.map(option => (
                <Button
                  key={option.value}
                  size="small"
                  variant={formData.capacity === option.value ? "contained" : "outlined"}
                  onClick={() => setFormData(prev => ({ ...prev, capacity: option.value }))}
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
              helperText="Phone number or contact for access"
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
              helperText="Additional notes about this tank (access instructions, restrictions, etc.)"
              placeholder="e.g., 'Requires key from station office', 'Dry hydrant connection available'"
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
          Save Tank
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TankPropertyEditor;