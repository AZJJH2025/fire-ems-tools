import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Grid,
  MenuItem,
  FormHelperText,
  Box,
  Chip
} from '@mui/material';
import { TargetField, FieldDataType, FieldMapping } from '@/types/formatter';

interface DefaultValueProviderProps {
  open: boolean;
  onClose: () => void;
  unmappedRequiredFields: TargetField[];
  onAddDefaultMappings: (defaultMappings: FieldMapping[]) => void;
}

// Generate a sensible default value based on field type
const generateDefaultValue = (field: TargetField): string => {
  switch (field.dataType) {
    case 'string':
      return `DEFAULT-${field.name}`;
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'date':
      return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    case 'location':
      return '0.0,0.0';
    default:
      return '';
  }
};

const DefaultValueProvider: React.FC<DefaultValueProviderProps> = ({
  open,
  onClose,
  unmappedRequiredFields,
  onAddDefaultMappings
}) => {
  // Initialize state with default values for each field
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    unmappedRequiredFields.forEach(field => {
      initialValues[field.name] = generateDefaultValue(field);
    });
    return initialValues;
  });

  // Handle changes to default values
  const handleValueChange = (field: string, value: string) => {
    setDefaultValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle submit - create mappings with default values
  const handleSubmit = () => {
    console.log("Creating default mappings for fields:", unmappedRequiredFields);
    console.log("Default values:", defaultValues);
    
    const defaultMappings: FieldMapping[] = unmappedRequiredFields.map(field => {
      const mapping: FieldMapping = {
        sourceField: '__default__', // Special marker for default values
        targetField: field.name,
        transformations: [{
          type: 'convert',
          params: {
            defaultValue: defaultValues[field.name],
            targetType: field.dataType
          }
        }]
      };
      console.log(`Created default mapping for ${field.name}:`, mapping);
      return mapping;
    });
    
    console.log("All default mappings:", defaultMappings);
    onAddDefaultMappings(defaultMappings);
    onClose();
  };

  // Get appropriate input type based on field data type
  const getInputType = (dataType: FieldDataType): string => {
    switch (dataType) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="default-value-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="default-value-dialog-title">
        Set Default Values for Required Fields
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The following required fields don't have mappings. Please provide default values for them.
        </Typography>
        
        <Grid container spacing={3}>
          {unmappedRequiredFields.map(field => (
            <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                  {field.name}
                  <Chip 
                    size="small" 
                    label={field.dataType} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {field.description}
                </Typography>
              </Box>
              
              {field.dataType === 'boolean' ? (
                <TextField
                  select
                  fullWidth
                  value={defaultValues[field.name] || 'false'}
                  onChange={(e) => handleValueChange(field.name, e.target.value)}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  value={defaultValues[field.name] || ''}
                  onChange={(e) => handleValueChange(field.name, e.target.value)}
                  type={getInputType(field.dataType)}
                  variant="outlined"
                  size="small"
                  placeholder={`Enter default value for ${field.name}`}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
              
              <FormHelperText>
                Default value for all records
              </FormHelperText>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Apply Default Values
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefaultValueProvider;