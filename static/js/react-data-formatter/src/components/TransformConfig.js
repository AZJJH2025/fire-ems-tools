import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  TextField, RadioGroup, Radio, FormControlLabel,
  Typography, Box
} from '@material-ui/core';

const TransformConfig = ({ open, fieldConfig, onClose, onSave }) => {
  const [config, setConfig] = useState({});
  
  // Initialize config when dialog opens
  useEffect(() => {
    if (fieldConfig && fieldConfig.config) {
      setConfig(fieldConfig.config);
    }
  }, [fieldConfig]);
  
  // Handle field changes
  const handleChange = (field, value) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [field]: value
    }));
  };
  
  // Handle save button click
  const handleSave = () => {
    onSave(config);
  };
  
  if (!fieldConfig || !fieldConfig.field) {
    return null;
  }
  
  const { field } = fieldConfig;
  const dialogTitle = `Configure ${field.name} Transformation`;
  
  // Render different configuration forms based on field type
  const renderConfigForm = () => {
    switch (field.type) {
      case 'date':
      case 'datetime':
        return (
          <Box p={1}>
            <Typography variant="subtitle1" gutterBottom>
              Date Format Configuration
            </Typography>
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Source Format</InputLabel>
              <Select
                value={config.sourceFormat || 'auto'}
                onChange={(e) => handleChange('sourceFormat', e.target.value)}
              >
                <MenuItem value="auto">Auto-detect</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
                <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                <MenuItem value="custom">Custom...</MenuItem>
              </Select>
            </FormControl>
            
            {config.sourceFormat === 'custom' && (
              <TextField
                fullWidth
                margin="normal"
                size="small"
                label="Custom Format"
                value={config.customFormat || ''}
                onChange={(e) => handleChange('customFormat', e.target.value)}
                helperText="Use: YYYY=year, MM=month, DD=day, HH=hour, mm=minute, ss=second"
              />
            )}
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Target Format</InputLabel>
              <Select
                value={config.targetFormat || 'ISO8601'}
                onChange={(e) => handleChange('targetFormat', e.target.value)}
              >
                <MenuItem value="ISO8601">ISO8601 (YYYY-MM-DD)</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
        
      case 'coordinates':
        return (
          <Box p={1}>
            <Typography variant="subtitle1" gutterBottom>
              Coordinate Format Configuration
            </Typography>
            
            <FormControl fullWidth component="fieldset" margin="normal">
              <RadioGroup
                value={config.format || 'decimal'}
                onChange={(e) => handleChange('format', e.target.value)}
              >
                <FormControlLabel
                  value="decimal"
                  control={<Radio color="primary" />}
                  label="Decimal Degrees (e.g., 40.7128, -74.0060)"
                />
                <FormControlLabel
                  value="dms"
                  control={<Radio color="primary" />}
                  label="Degrees Minutes Seconds (e.g., 40°42'46\"N, 74°00'21\"W)"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );
        
      default:
        return (
          <Box p={1}>
            <Typography variant="subtitle1" gutterBottom>
              Text Transformation
            </Typography>
            
            <FormControl fullWidth component="fieldset" margin="normal">
              <RadioGroup
                value={config.textTransform || 'none'}
                onChange={(e) => handleChange('textTransform', e.target.value)}
              >
                <FormControlLabel
                  value="none"
                  control={<Radio color="primary" />}
                  label="None (keep original)"
                />
                <FormControlLabel
                  value="uppercase"
                  control={<Radio color="primary" />}
                  label="UPPERCASE"
                />
                <FormControlLabel
                  value="lowercase"
                  control={<Radio color="primary" />}
                  label="lowercase"
                />
                <FormControlLabel
                  value="capitalize"
                  control={<Radio color="primary" />}
                  label="Capitalize First Letter"
                />
                <FormControlLabel
                  value="trim"
                  control={<Radio color="primary" />}
                  label="Trim Whitespace"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="transform-config-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="transform-config-dialog-title">
        {dialogTitle}
      </DialogTitle>
      
      <DialogContent dividers>
        {renderConfigForm()}
        
        {field.description && (
          <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" color="textSecondary">
              <strong>Field description:</strong> {field.description}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransformConfig;