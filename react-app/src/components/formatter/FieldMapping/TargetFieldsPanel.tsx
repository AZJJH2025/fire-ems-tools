import React, { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  Button,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import NumbersIcon from '@mui/icons-material/Numbers';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { ToolConfig, FieldMapping, TargetField } from '@/types/formatter';
import FieldTransformationSettings from './FieldTransformationSettings';
import DefaultValueProvider from './DefaultValueProvider';
import LiveFieldPreview from './LiveFieldPreview';
import EnhancedTooltip from '@/components/common/EnhancedTooltip';

interface TargetFieldsProps {
  toolConfig: ToolConfig;
  showAllFields: boolean;
  setShowAllFields: (show: boolean) => void;
  filter: string;
  setFilter: (filter: string) => void;
  mappings: FieldMapping[];
  onMappingChange: (mapping: FieldMapping) => void;
  onRemoveMapping: (targetField: string) => void;
  validationErrors: {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  sampleData: Record<string, any>[];
  sourceColumns?: string[]; // Add source columns prop
}

const TargetFieldsPanel: React.FC<TargetFieldsProps> = ({
  toolConfig,
  showAllFields,
  setShowAllFields,
  filter,
  setFilter,
  mappings,
  onMappingChange,
  onRemoveMapping,
  validationErrors,
  sampleData,
  sourceColumns = [] // Provide default empty array
}) => {
  const theme = useTheme();
  console.log("TargetFieldsPanel received sourceColumns:", sourceColumns);
  console.log("TargetFieldsPanel received toolConfig:", toolConfig);
  console.log("TargetFieldsPanel received mappings:", mappings);
  
  // State for the active transformation settings
  const [transformSettingsField, setTransformSettingsField] = useState<string | null>(null);

  // State for the selected field for preview
  const [selectedFieldForPreview, setSelectedFieldForPreview] = useState<string | null>(null);
  
  // Default expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Timing': true,
    'Location': true,
    'Incident Details': true
  });
  
  // Create map of field validations for quick lookup
  const fieldValidations = useMemo(() => {
    const result: Record<string, { message: string, severity: 'error' | 'warning' }> = {};
    
    validationErrors.forEach(error => {
      result[error.field] = {
        message: error.message,
        severity: error.severity
      };
    });
    
    return result;
  }, [validationErrors]);
  
  // Create map of target fields to mapped source fields
  const targetFieldMappings = useMemo(() => {
    const result: Record<string, string> = {};
    
    mappings.forEach(mapping => {
      result[mapping.targetField] = mapping.sourceField;
    });
    
    return result;
  }, [mappings]);
  
  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const result: Record<string, TargetField[]> = {};
    
    const allFields = [...toolConfig.requiredFields, ...toolConfig.optionalFields];
    
    allFields.forEach(field => {
      // Determine category from field or field.dataType
      let category: string;
      
      if (field.dataType === 'date' || field.name.toLowerCase().includes('time') || field.name.toLowerCase().includes('date')) {
        category = 'Timing';
      } else if (field.dataType === 'location' || field.name.toLowerCase().includes('lat') || field.name.toLowerCase().includes('lon') || field.name.toLowerCase().includes('address')) {
        category = 'Location';
      } else {
        category = 'Incident Details';
      }
      
      // Create category if it doesn't exist
      if (!result[category]) {
        result[category] = [];
      }
      
      // Add field to category
      result[category].push(field);
    });
    
    return result;
  }, [toolConfig]);
  
  // Filter fields based on search term
  const filteredFields = useMemo(() => {
    if (!filter) return showAllFields ? 
      [...toolConfig.requiredFields, ...toolConfig.optionalFields] : fieldsByCategory;
    
    const lowerFilter = filter.toLowerCase();
    const allFields = [...toolConfig.requiredFields, ...toolConfig.optionalFields];
    
    const filtered = allFields.filter(field => 
      field.name.toLowerCase().includes(lowerFilter) ||
      field.description?.toLowerCase().includes(lowerFilter)
    );
    
    if (showAllFields) {
      return filtered;
    }
    
    // Re-categorize filtered fields
    const result: Record<string, TargetField[]> = {};
    
    filtered.forEach(field => {
      // Find which category the field belongs to
      let category: string | undefined;
      
      for (const [cat, fields] of Object.entries(fieldsByCategory)) {
        if (fields.some(f => f.id === field.id)) {
          category = cat;
          break;
        }
      }
      
      if (!category) category = 'Other';
      
      if (!result[category]) {
        result[category] = [];
      }
      
      result[category].push(field);
    });
    
    return result;
  }, [toolConfig, filter, showAllFields, fieldsByCategory]);
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // FIXED: Handle field mapping change from dropdown with proper error handling
  const handleMappingDropdownChange = (targetField: string, sourceField: string) => {
    console.log("Dropdown selection - mapping", sourceField, "to", targetField);
    
    try {
      // If selection is cleared, remove the mapping
      if (!sourceField) {
        onRemoveMapping(targetField);
        return;
      }
      
      // Create or update the mapping
      onMappingChange({
        sourceField,
        targetField
      });
      
      console.log("Mapping updated via dropdown successfully");
    } catch (error) {
      console.error("Error updating mapping via dropdown:", error);
    }
  };
  
  // Handle transformation settings
  const handleTransformSettingsOpen = (field: string) => {
    setTransformSettingsField(field);
  };

  const handleTransformSettingsClose = () => {
    setTransformSettingsField(null);
  };

  // Handle field click to show preview
  const handleShowFieldPreview = (field: string) => {
    setSelectedFieldForPreview(prevField => prevField === field ? null : field);
  };
  
  const handleTransformSettingsSave = (field: string, transformations: any) => {
    const existingMapping = mappings.find(m => m.targetField === field);
    
    if (existingMapping) {
      onMappingChange({
        ...existingMapping,
        transformations
      });
    }
    
    setTransformSettingsField(null);
  };
  
  // Helper function to get data type icon and color
  const getDataTypeConfig = (dataType: string) => {
    switch (dataType) {
      case 'string':
        return { icon: <TextFieldsIcon fontSize="small" />, color: 'info' };
      case 'number':
        return { icon: <NumbersIcon fontSize="small" />, color: 'secondary' };
      case 'date':
        return { icon: <CalendarTodayIcon fontSize="small" />, color: 'warning' };
      case 'boolean':
        return { icon: <CheckBoxIcon fontSize="small" />, color: 'success' };
      case 'location':
        return { icon: <LocationOnIcon fontSize="small" />, color: 'error' };
      default:
        return { icon: <TextFieldsIcon fontSize="small" />, color: 'default' };
    }
  };

  // Render a single target field with tooltips and enhanced UX
  const renderTargetField = (field: TargetField) => {
    // Get the mapped source field from the current mappings
    const mappedSourceField = targetFieldMappings[field.id];  // 🔧 FIX: Use field.id for consistency
    // For validation feedback
    const validation = fieldValidations[field.id];  // 🔧 FIX: Use field.id for consistency


    // Check if this field is selected for preview
    const isSelected = selectedFieldForPreview === field.id;  // 🔧 FIX: Use field.id for consistency

    // Debug logging to help identify mapping issues
    console.log(`🔧 FIELD RENDER: ${field.name} (ID: ${field.id}), mapped to: ${mappedSourceField || 'none'}`);

    // Handle drag/drop events
    const handleDragOver = (e: React.DragEvent) => {
      // This is critical for the drop to work!
      e.preventDefault();
      e.stopPropagation(); // Prevent parent elements from handling this event

      // Set the right drop effect
      e.dataTransfer.dropEffect = 'move';

      // Enhanced visual feedback for drop target
      const element = e.currentTarget as HTMLElement;
      element.style.boxShadow = '0 0 0 2px #1976d2';
      element.style.borderColor = '#1976d2';
      element.style.backgroundColor = '#f0f7ff';
      element.style.transform = 'scale(1.01)';
      element.style.transition = 'all 0.2s ease';

      console.log("DRAG OVER on target field:", field.name);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove visual indicator
      const element = e.currentTarget as HTMLElement;
      element.style.boxShadow = '';
      element.style.borderColor = validation ?
        (validation.severity === 'error' ? '#f44336' : '#ff9800') :
        (mappedSourceField ? '#4caf50' : '#e0e0e0');
      element.style.backgroundColor = validation ?
        (validation.severity === 'error' ? '#fff5f5' : '#fffbf0') :
        (mappedSourceField ? '#f4fbf4' : '#ffffff');
      element.style.transform = '';

      console.log("DRAG LEAVE from field:", field.name);
    };

    // Drop handler with robust error handling
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Critical to prevent parent handlers from running

      console.log("DROP EVENT TRIGGERED on field:", field.name);

      try {
        // Get source field from dataTransfer
        const sourceField = e.dataTransfer.getData('text/plain');
        console.log("Dropped source field data:", sourceField);

        if (!sourceField) {
          console.error("No source field data found in the drop event");
          return;
        }

        // Reset styles first
        const element = e.currentTarget as HTMLElement;
        element.style.boxShadow = '';
        element.style.borderColor = '';
        element.style.backgroundColor = '';
        element.style.transform = '';

        // Create or update mapping - This will update Redux state
        onMappingChange({
          sourceField,
          targetField: field.id  // 🔧 FIX: Use field.id for consistency
        });

        // Auto-select this field for preview
        setSelectedFieldForPreview(field.id);  // 🔧 FIX: Use field.id for consistency

        // Add a success animation with styles
        element.style.boxShadow = '0 0 0 2px #4caf50';
        element.style.borderColor = '#4caf50';
        element.style.backgroundColor = '#f4fbf4';
        element.style.transform = 'scale(1.02)';

        // Update mappedSourceField reference for our setTimeout callback
        const updatedSourceField = sourceField;

        // Remove success styles after a delay
        setTimeout(() => {
          try {
            // Check if there's currently a mapping for this field
            // using our local reference instead of the mappedSourceField closure
            if (updatedSourceField) {
              // Keep the "mapped" style if field was mapped
              element.style.borderColor = '#4caf50';
              element.style.backgroundColor = '#f4fbf4';
            } else {
              element.style.borderColor = validation ?
                (validation.severity === 'error' ? '#f44336' : '#ff9800') :
                '#e0e0e0';
              element.style.backgroundColor = validation ?
                (validation.severity === 'error' ? '#fff5f5' : '#fffbf0') :
                '#ffffff';
            }
            element.style.boxShadow = '';
            element.style.transform = '';
          } catch (timeoutError) {
            console.error("Error in animation cleanup:", timeoutError);
          }
        }, 1000);

        console.log(`Successfully dropped ${sourceField} onto ${field.name}`);
      } catch (error) {
        console.error("Error in drop handler:", error);
      }
    };

    // Handle click to show field preview
    const handleFieldClick = () => {
      if (mappedSourceField) {
        handleShowFieldPreview(field.name);
      }
    };

    // Get field requirements tooltip content
    const getFieldRequirementsTooltip = () => {
      return (
        <Box>
          <Typography variant="body2">
            <strong>Required Format:</strong> {field.format || 'No specific format required'}
          </Typography>
          {field.examples && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Examples:</strong></Typography>
              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                {field.examples.map((example: string, idx: number) => (
                  <Box component="li" key={idx}>
                    <Typography variant="body2" fontFamily="monospace">
                      {example}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {field.validation && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Validation:</strong> {String(field.validation)}
            </Typography>
          )}
        </Box>
      );
    };

    // Get data type tooltip content
    const getDataTypeTooltip = () => {
      let description = '';

      switch(field.dataType) {
        case 'string':
          description = 'Text value. Can contain any characters.';
          break;
        case 'number':
          description = 'Numeric value. Can be integer or decimal.';
          break;
        case 'date':
          description = 'Date value. Should be in a standard format.';
          break;
        case 'boolean':
          description = 'True/False value.';
          break;
        case 'location':
          description = 'Geographic coordinates or address.';
          break;
        default:
          description = `${field.dataType} data type.`;
      }

      return (
        <Box>
          <Typography variant="body2">
            {description}
          </Typography>
          {field.dataType === 'date' && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Common formats: YYYY-MM-DD, MM/DD/YYYY
            </Typography>
          )}
        </Box>
      );
    };

    return (
      <Box
        key={field.id}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: validation ?
            (validation.severity === 'error' ? 'error.main' : 'warning.main') :
            (mappedSourceField ? 'success.light' : 'divider'),
          borderRadius: 1,
          bgcolor: validation ?
            (validation.severity === 'error' ? alpha(theme.palette.error.light, 0.1) : alpha(theme.palette.warning.light, 0.1)) :
            (mappedSourceField ? alpha(theme.palette.success.light, 0.1) : 'background.paper'),
          position: 'relative',
          transition: 'all 0.3s ease',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          cursor: mappedSourceField ? 'pointer' : 'default',
          ...(isSelected && {
            boxShadow: '0 0 0 2px #1976d2',
            border: '1px solid #1976d2',
          }),
          '&:hover': mappedSourceField ? {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          } : {}
        }}
        // The draggable attribute is needed to prevent issues with drag events
        draggable={false}
        id={`target-field-${field.id}`}
        data-target-field={field.id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFieldClick}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            {/* Enhanced tooltip for field name and description */}
            <EnhancedTooltip
              title={`${field.name} Field`}
              content={getFieldRequirementsTooltip()}
              placement="top-start"
              icon={true}
            >
              <Typography variant="subtitle2" component="div" sx={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'help'
              }}>
                {field.name}
                {field.isRequired && (
                  <Chip
                    size="small"
                    label="Required"
                    color="primary"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
                {mappedSourceField && (
                  <Chip
                    size="small"
                    label="Click to preview"
                    color="info"
                    variant="outlined"
                    sx={{
                      ml: 1,
                      height: 20,
                      display: { xs: 'none', sm: 'flex' },
                      animation: isSelected ? 'none' : 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                        '70%': { boxShadow: '0 0 0 6px rgba(33, 150, 243, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
                      }
                    }}
                  />
                )}
              </Typography>
            </EnhancedTooltip>

            {/* Enhanced tooltip for data type */}
            {field.dataType && (
              <EnhancedTooltip
                title={`${field.dataType} Data Type`}
                content={getDataTypeTooltip()}
              >
                <Chip
                  size="small"
                  label={field.dataType}
                  color={getDataTypeConfig(field.dataType).color as any}
                  variant="outlined"
                  icon={getDataTypeConfig(field.dataType).icon}
                  sx={{ mt: 1, mr: 1, height: 20 }}
                />
              </EnhancedTooltip>
            )}

            <Typography variant="body2" color="text.secondary">
              {field.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {validation && (
              <EnhancedTooltip
                title="Validation Issue"
                content={
                  <Typography variant="body2">
                    {validation.message}
                  </Typography>
                }
                type={validation.severity === 'error' ? 'warning' : 'info'}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  {validation.severity === 'error' ? (
                    <ErrorIcon color="error" fontSize="small" />
                  ) : (
                    <WarningIcon color="warning" fontSize="small" />
                  )}
                </Box>
              </EnhancedTooltip>
            )}

            {mappedSourceField && (
              <>
                <EnhancedTooltip
                  title="Edit Transformations"
                  content={
                    <Typography variant="body2">
                      Configure data transformations for this field mapping.
                      Apply operations like splitting, joining, formatting and type conversion.
                    </Typography>
                  }
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering field preview
                      handleTransformSettingsOpen(field.id);
                    }}
                    sx={{ mr: 1 }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </EnhancedTooltip>

                <EnhancedTooltip
                  title="Remove Mapping"
                  content={
                    <Typography variant="body2">
                      Remove the current mapping between source and target fields.
                    </Typography>
                  }
                  type="warning"
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering field preview
                      onRemoveMapping(field.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </EnhancedTooltip>
              </>
            )}
          </Box>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id={`${field.id}-source-label`}>Select source field</InputLabel>
          <Select
            labelId={`${field.id}-source-label`}
            id={`${field.id}-source-select`}
            value={mappedSourceField || ''}
            label="Select source field"
            onChange={(e) => {
              // Wrap in a try-catch to prevent blank screen on errors
              try {
                handleMappingDropdownChange(field.id, e.target.value);

                // Auto-select for preview when mapping is created via dropdown
                if (e.target.value) {
                  setSelectedFieldForPreview(field.name);
                } else {
                  // If clearing the mapping, also clear preview if it was showing this field
                  if (selectedFieldForPreview === field.name) {
                    setSelectedFieldForPreview(null);
                  }
                }
              } catch (error) {
                console.error("Error in dropdown change handler:", error);
              }
            }}
            // Don't block rendering on errors
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              // Critical for preventing crashes on errors
              slotProps: {
                paper: {
                  elevation: 4,
                  style: { maxHeight: 300 }
                }
              }
            }}
            // Fix for double text in Excel files - don't use displayEmpty with a placeholder
            // Using renderValue to control what shows in the select box
            renderValue={(selected) => {
              if (!selected) {
                return <em style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select field or drag from left</em>;
              }
              return selected as string;
            }}
            endAdornment={
              mappedSourceField && (
                <InputAdornment position="end">
                  <EnhancedTooltip
                    title="Field is Mapped"
                    content={
                      <Typography variant="body2">
                        This field is mapped to source field "{mappedSourceField}".
                        Click the field to preview the mapping.
                      </Typography>
                    }
                  >
                    <CheckCircleIcon color="success" fontSize="small" />
                  </EnhancedTooltip>
                </InputAdornment>
              )
            }
            onClick={(e) => e.stopPropagation()} // Prevent triggering field preview when clicking dropdown
          >
            <MenuItem value="">
              <em style={{ color: 'rgba(0, 0, 0, 0.54)' }}>Select field or drag from left</em>
            </MenuItem>
            {/* FIXED: Clear rendering of source columns with error handling */}
            {Array.isArray(sourceColumns) && sourceColumns.length > 0 ? (
              sourceColumns.map(sourceField => {
                // Get sample value for this source field from the first row of data
                const sampleValue = sampleData && sampleData.length > 0
                  ? sampleData[0][sourceField]
                  : undefined;

                // Determine data type
                let dataType = 'Unknown';
                if (sampleValue !== undefined && sampleValue !== null) {
                  if (typeof sampleValue === 'string') {
                    // Check for date patterns
                    const datePatterns = [
                      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
                      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YYYY or DD/MM/YYYY
                    ];

                    if (datePatterns.some(pattern => pattern.test(sampleValue))) {
                      dataType = 'Date';
                    }
                    // Check for time patterns
                    else if (/^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i.test(sampleValue)) {
                      dataType = 'Time';
                    }
                    // Check if it's a number in string form
                    else if (!isNaN(Number(sampleValue))) {
                      dataType = 'Number';
                    }
                    else {
                      dataType = 'Text';
                    }
                  } else {
                    dataType = typeof sampleValue;
                  }
                }

                const getSampleValueString = (value: any): string => {
                  if (value === undefined || value === null) return '';
                  if (typeof value === 'object') return JSON.stringify(value).substring(0, 30);
                  return String(value).substring(0, 30);
                };

                return (
                  <MenuItem key={sourceField} value={sourceField}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography variant="body2">{sourceField}</Typography>
                      {sampleValue !== undefined && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'grey.100',
                              px: 0.5,
                              borderRadius: 0.5,
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'text.secondary'
                            }}
                          >
                            {getSampleValueString(sampleValue)}
                          </Typography>
                          <Chip
                            label={dataType}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.65rem',
                              '& .MuiChip-label': { px: 0.5, py: 0 }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem disabled>
                <em>No source fields available</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>
    );
  };
  
  // Render either categorized or flat list of fields
  const renderFields = () => {
    if (showAllFields) {
      // Flat list of all fields
      const allFields = Array.isArray(filteredFields) ? 
        filteredFields : 
        Object.values(filteredFields).flat();
      
      return (
        <Box>
          {allFields.map(renderTargetField)}
        </Box>
      );
    } else {
      // Categorized fields
      return Object.entries(filteredFields as Record<string, TargetField[]>).map(([category, fields]) => (
        <Accordion
          key={category}
          expanded={expandedCategories[category] || false}
          onChange={() => toggleCategory(category)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{category}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {fields.length} fields
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {fields.map(renderTargetField)}
          </AccordionDetails>
        </Accordion>
      ));
    }
  };
  
  // State for default value provider dialog
  const [defaultValueDialogOpen, setDefaultValueDialogOpen] = useState(false);
  
  // Get unmapped required fields
  const unmappedRequiredFields = useMemo(() => {
    // Get all required fields
    const requiredFields = toolConfig.requiredFields;
    // Filter out fields that already have mappings
    return requiredFields.filter(field => 
      !mappings.some(mapping => mapping.targetField === field.name)
    );
  }, [toolConfig.requiredFields, mappings]);
  
  // Handle adding default mappings from the dialog
  const handleAddDefaultMappings = (defaultMappings: FieldMapping[]) => {
    console.log("Received default mappings:", defaultMappings);
    
    // Call onMappingChange for each default mapping
    defaultMappings.forEach(mapping => {
      console.log("Adding default mapping for:", mapping.targetField, mapping);
      onMappingChange(mapping);
    });
    
    // Log the current mappings after adding defaults
    console.log("Current mappings after adding defaults:", mappings);
  };
  
  return (
    <Paper sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Hide the original title as we now have it in the parent container */}
      {/*
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Target Fields</Typography>
      */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {unmappedRequiredFields.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setDefaultValueDialogOpen(true)}
              color="primary"
            >
              Set Default Values ({unmappedRequiredFields.length})
            </Button>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={showAllFields}
                onChange={(e) => setShowAllFields(e.target.checked)}
                size="small"
              />
            }
            label="Show all fields A-Z"
          />
        </Box>
      {/* </Box> */}

      {unmappedRequiredFields.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setDefaultValueDialogOpen(true)}
            >
              Set Defaults
            </Button>
          }
        >
          {unmappedRequiredFields.length} required {unmappedRequiredFields.length === 1 ? 'field' : 'fields'} not mapped.
          Please map or set default values to continue.
        </Alert>
      )}

      <TextField
        size="small"
        placeholder="Search target fields..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ mb: 2 }} />

      <Box sx={{
        mb: 2,
        p: 1,
        bgcolor: 'rgba(25, 118, 210, 0.08)',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'primary.main'
      }}>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
          Drop source fields onto target fields or use the drop-down menus below
        </Typography>
      </Box>

      {/* Live field preview */}
      {selectedFieldForPreview && (
        <LiveFieldPreview
          mapping={mappings.find(m => m.targetField === selectedFieldForPreview) || null}
          sampleData={sampleData}
          onClose={() => setSelectedFieldForPreview(null)}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          maxHeight: 'calc(100% - 220px)',
          overflow: 'auto',
          scrollbarWidth: 'thin',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2196f3',
            borderRadius: '4px',
            '&:hover': {
              background: '#1976d2',
            },
          },
        }}
      >
        {renderFields()}
      </Box>

      {/* Field transformation settings dialog */}
      {transformSettingsField && (
        <FieldTransformationSettings
          open={!!transformSettingsField}
          onClose={handleTransformSettingsClose}
          fieldName={transformSettingsField}
          mapping={mappings.find(m => m.targetField === transformSettingsField)}
          sampleData={sampleData}
          onSave={handleTransformSettingsSave}
        />
      )}

      {/* Default value provider dialog */}
      <DefaultValueProvider
        open={defaultValueDialogOpen}
        onClose={() => setDefaultValueDialogOpen(false)}
        unmappedRequiredFields={unmappedRequiredFields}
        onAddDefaultMappings={handleAddDefaultMappings}
      />
    </Paper>
  );
};

export default TargetFieldsPanel;