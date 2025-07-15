import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Alert,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SettingsIcon from '@mui/icons-material/Settings';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ValidationError, FieldMapping, TargetField } from '../../../types/formatter';

interface ValidationActionPanelProps {
  errors: ValidationError[];
  targetFields: TargetField[];
  mappings: FieldMapping[];
  onAddDefaultValue: (mapping: FieldMapping) => void;
  onJumpToMapping: (fieldName: string) => void;
}

// Helper to get datatype-specific default values
const getTypedDefaultValue = (dataType: string): string => {
  switch (dataType) {
    case 'string':
      return 'Default Value';
    case 'number':
      return '0';
    case 'date':
      return new Date().toISOString().split('T')[0];
    case 'boolean':
      return 'false';
    case 'location':
      return '0.0,0.0';
    default:
      return '';
  }
};

/**
 * A component that analyzes validation errors and suggests actions to resolve them
 */
const ValidationActionPanel: React.FC<ValidationActionPanelProps> = ({
  errors,
  targetFields,
  mappings,
  onAddDefaultValue,
  onJumpToMapping
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<TargetField | null>(null);
  const [defaultValue, setDefaultValue] = useState('');

  // Group errors by field and type
  const errorsByField = useMemo(() => {
    const result: Record<string, { errors: ValidationError[], count: number }> = {};
    
    errors.forEach(error => {
      if (!result[error.field]) {
        result[error.field] = { errors: [], count: 0 };
      }
      result[error.field].errors.push(error);
      result[error.field].count++;
    });
    
    return result;
  }, [errors]);

  // Create actionable items from errors
  const actionableErrors = useMemo(() => {
    return Object.entries(errorsByField)
      // Sort by error count (most errors first)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([fieldName, data]) => {
        // Find the field definition
        const fieldDef = targetFields.find(f => f.name === fieldName);
        if (!fieldDef) return null;

        // Check if this field already has a mapping
        const hasMapping = mappings.some(m => m.targetField === fieldName);
        
        // Check if the mapping is a default value
        const hasDefaultMapping = mappings.some(
          m => m.targetField === fieldName && m.sourceField === '__default__'
        );
        
        // Check if there are required field errors
        const hasRequiredError = data.errors.some(e => e.type === 'required');
        
        // Determine the most appropriate action
        let actionType = 'unknown';
        if (hasRequiredError && !hasMapping) {
          actionType = 'map_field';
        } else if (hasRequiredError && !hasDefaultMapping) {
          actionType = 'add_default';
        } else if (!hasRequiredError && hasMapping) {
          actionType = 'fix_transformation';
        }
        
        return {
          fieldName,
          fieldDef,
          errorCount: data.count,
          errors: data.errors,
          hasMapping,
          hasDefaultMapping,
          actionType
        };
      })
      .filter(Boolean); // Remove null items
  }, [errorsByField, targetFields, mappings]);

  // Count how many errors we can fix with default values
  const fixableWithDefaultsCount = useMemo(() => {
    return actionableErrors.filter(item => 
      item?.actionType === 'add_default'
    ).length;
  }, [actionableErrors]);

  // Open the default value dialog for a field
  const handleAddDefault = (field: TargetField) => {
    setSelectedField(field);
    setDefaultValue(getTypedDefaultValue(field.dataType));
    setDialogOpen(true);
  };

  // Handle saving a default value
  const handleSaveDefault = () => {
    if (!selectedField) return;
    
    // Create a default value mapping
    const mapping: FieldMapping = {
      sourceField: '__default__',
      targetField: selectedField.name,
      transformations: [{
        type: 'convert',
        params: {
          defaultValue: defaultValue,
          targetType: selectedField.dataType
        }
      }]
    };
    
    onAddDefaultValue(mapping);
    setDialogOpen(false);
  };

  if (errors.length === 0) {
    return (
      <Alert severity="success" sx={{ my: 2 }}>
        No validation errors detected. Your data is ready for export!
      </Alert>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 0, 
        my: 2, 
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
      elevation={2}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.error.dark, 0.2) 
          : alpha(theme.palette.error.light, 0.1),
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorOutlineIcon color="error" />
          Validation Solutions
          <Chip 
            label={`${errors.length} ${errors.length === 1 ? 'issue' : 'issues'}`}
            color="error"
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {fixableWithDefaultsCount > 0 
            ? `${fixableWithDefaultsCount} ${fixableWithDefaultsCount === 1 ? 'issue' : 'issues'} can be fixed with default values.`
            : 'Review the suggested actions to resolve validation issues.'
          }
        </Typography>
      </Box>

      <List sx={{ py: 0 }}>
        {fixableWithDefaultsCount > 0 && (
          <ListItem 
            sx={{ 
              bgcolor: alpha(theme.palette.success.light, 0.1),
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.success.light, 0.2),
              }
            }}
          >
            <ListItemIcon>
              <AutoFixHighIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Fix Required Fields with Default Values"
              secondary={`Add default values to ${fixableWithDefaultsCount} unmapped required ${fixableWithDefaultsCount === 1 ? 'field' : 'fields'}`}
            />
            <ListItemSecondaryAction>
              <Button 
                variant="outlined" 
                color="success" 
                size="small"
                onClick={() => {
                  const firstFixable = actionableErrors.find(item => 
                    item?.actionType === 'add_default'
                  );
                  if (firstFixable?.fieldDef) {
                    handleAddDefault(firstFixable.fieldDef);
                  }
                }}
              >
                Set Default Values
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        )}

        {actionableErrors.map((item, index) => {
          if (!item) return null;
          
          // Determine the action icon and text
          let actionIcon = <ErrorOutlineIcon color="error" />;
          // let actionText = 'Review field'; // Reserved for future action buttons
          let actionColor = 'error';
          let actionSecondaryText = '';
          
          switch (item.actionType) {
            case 'map_field':
              actionIcon = <FormatListNumberedIcon color="info" />;
              // actionText = 'Map this field';
              actionColor = 'info';
              actionSecondaryText = 'Field requires mapping to source data';
              break;
            case 'add_default':
              actionIcon = <AddCircleOutlineIcon color="success" />;
              // actionText = 'Add default value';
              actionColor = 'success';
              actionSecondaryText = 'Field requires a value, add a default';
              break;
            case 'fix_transformation':
              actionIcon = <SettingsIcon color="warning" />;
              // actionText = 'Fix transformation';
              actionColor = 'warning';
              actionSecondaryText = 'Field has validation issues with current mapping';
              break;
          }
          
          return (
            <React.Fragment key={item.fieldName}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 1.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.light, 0.05),
                  }
                }}
              >
                <ListItemIcon>
                  {actionIcon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{item.fieldName}</Typography>
                      <Chip 
                        size="small" 
                        label={`${item.errorCount} ${item.errorCount === 1 ? 'error' : 'errors'}`}
                        color="error"
                        variant="outlined"
                      />
                      {item.fieldDef && (
                        <Chip 
                          size="small" 
                          label={item.fieldDef.dataType}
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {actionSecondaryText}
                      </Typography>
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                        {item.errors[0]?.message}
                        {item.errors.length > 1 && ` (+ ${item.errors.length - 1} more)`}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {item.actionType === 'add_default' && item.fieldDef && (
                    <Button
                      variant="outlined"
                      color={actionColor as any}
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => handleAddDefault(item.fieldDef as TargetField)}
                    >
                      Add Default
                    </Button>
                  )}
                  
                  {(item.actionType === 'map_field' || item.actionType === 'fix_transformation') && (
                    <Button
                      variant="outlined"
                      color={actionColor as any}
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => onJumpToMapping(item.fieldName)}
                    >
                      {item.actionType === 'map_field' ? 'Map Field' : 'Fix Mapping'}
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
      
      {/* Default value dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Set Default Value for {selectedField?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              {selectedField?.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="caption">Data Type:</Typography>
              <Chip 
                size="small" 
                label={selectedField?.dataType}
                color="primary"
                variant="outlined"
              />
            </Box>
            
            {selectedField?.dataType === 'boolean' ? (
              <TextField
                select
                fullWidth
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                label="Default Value"
                variant="outlined"
                margin="normal"
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </TextField>
            ) : (
              <TextField
                fullWidth
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                label="Default Value"
                variant="outlined"
                margin="normal"
                type={selectedField?.dataType === 'number' ? 'number' : 'text'}
                helperText={`This value will be used for all records where ${selectedField?.name} is not mapped or empty`}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveDefault} 
            variant="contained" 
            color="primary"
            startIcon={<AutoFixHighIcon />}
          >
            Apply Default Value
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ValidationActionPanel;