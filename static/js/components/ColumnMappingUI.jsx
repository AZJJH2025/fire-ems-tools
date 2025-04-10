import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  LinearProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel
} from '@material-ui/core';
import { 
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  DragHandle as DragHandleIcon,
  Settings as SettingsIcon
} from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * Column Mapping UI Component for Data Formatter
 * 
 * @param {Object} props
 * @param {Array} props.sourceColumns - Array of column names from source data
 * @param {Array} props.sampleData - Sample data for preview
 * @param {string} props.fileId - The ID of the uploaded file
 * @param {Function} props.onMappingComplete - Callback when mapping is completed
 */
const ColumnMappingUI = ({ sourceColumns = [], sampleData = [], fileId = null, onMappingComplete }) => {
  // State management
  const [mappings, setMappings] = useState({});
  const [targetFields, setTargetFields] = useState([]);
  const [isSchemaLoading, setIsSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    timestamp: true,
    location: true,
    incident: true,
    nfirs: true,
    other: true
  });
  
  // Transform configurations for mapped fields
  const [transformConfigs, setTransformConfigs] = useState({});
  
  // For transform configuration popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFieldConfig, setCurrentFieldConfig] = useState(null);
  
  // Categories for organizing fields
  const categories = [
    { id: 'timestamp', label: 'Timestamp Fields', icon: 'access_time' },
    { id: 'location', label: 'Location Fields', icon: 'place' },
    { id: 'incident', label: 'Incident Fields', icon: 'local_fire_department' },
    { id: 'nfirs', label: 'NFIRS Fields', icon: 'assignment' },
    { id: 'other', label: 'Other Fields', icon: 'more_horiz' }
  ];

  // Load schema on component mount
  useEffect(() => {
    loadSchema();
  }, []);

  // Load the standardized schema from JSON file
  const loadSchema = async () => {
    setIsSchemaLoading(true);
    try {
      const response = await fetch('/public/standardized_incident_record_schema.json');
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status} ${response.statusText}`);
      }
      const schema = await response.json();
      processSchema(schema);
      setIsSchemaLoading(false);
    } catch (error) {
      console.error('Error loading schema:', error);
      setSchemaError(error.message);
      setIsSchemaLoading(false);
    }
  };

  // Process the loaded schema to extract and categorize fields
  const processSchema = (schema) => {
    const fields = [];
    
    // Process required fields
    if (schema.requiredFields && Array.isArray(schema.requiredFields)) {
      schema.requiredFields.forEach(field => {
        fields.push({
          ...field,
          id: field.name.replace(/\s+/g, '_').toLowerCase(),
          required: true,
          category: field.category || categorizeField(field.name)
        });
      });
    }
    
    // Process optional fields
    if (schema.optionalFields && Array.isArray(schema.optionalFields)) {
      schema.optionalFields.forEach(field => {
        fields.push({
          ...field,
          id: field.name.replace(/\s+/g, '_').toLowerCase(),
          required: false,
          category: field.category || categorizeField(field.name)
        });
      });
    }
    
    // Sort fields by required status and then alphabetically within each category
    const sortedFields = fields.sort((a, b) => {
      // First sort by category
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Then sort by required status (required fields first)
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    setTargetFields(sortedFields);
  };

  // Categorize a field based on its name
  const categorizeField = (fieldName) => {
    const lowerField = fieldName.toLowerCase();
    
    // Timestamp fields
    if (lowerField.includes('time') || lowerField.includes('date') || lowerField.includes('timestamp')) {
      return 'timestamp';
    }
    
    // Location fields
    if (lowerField.includes('address') || lowerField.includes('location') || 
        lowerField.includes('latitude') || lowerField.includes('longitude') || 
        lowerField.includes('geo') || lowerField.includes('coordinates')) {
      return 'location';
    }
    
    // NFIRS fields
    if (lowerField.includes('nfirs') || lowerField.includes('fdid')) {
      return 'nfirs';
    }
    
    // Incident fields
    if (lowerField.includes('incident') || lowerField.includes('call') || 
        lowerField.includes('emergency') || lowerField.includes('response') || 
        lowerField.includes('dispatch') || lowerField.includes('unit') || 
        lowerField.includes('type')) {
      return 'incident';
    }
    
    // Default to other
    return 'other';
  };

  // Handle the drag end event for drag-and-drop
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // Exit if dropped outside a droppable area or in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // If dragging from source columns to target field
    if (source.droppableId === 'source-columns' && 
        destination.droppableId.startsWith('target-field-')) {
      
      // Get the target field ID from the droppable ID
      const targetFieldId = destination.droppableId.replace('target-field-', '');
      const sourceColumnId = draggableId.replace('source-column-', '');
      
      // Update mappings state
      setMappings(prevMappings => ({
        ...prevMappings,
        [targetFieldId]: parseInt(sourceColumnId)
      }));
      
      // Initialize transform config if needed
      setTransformConfigs(prevConfigs => {
        const targetField = targetFields.find(field => field.id === targetFieldId);
        if (!prevConfigs[targetFieldId] && targetField) {
          // Set default transform config based on field type
          if (targetField.type === 'date' || targetField.type === 'datetime') {
            return {
              ...prevConfigs,
              [targetFieldId]: {
                type: 'date',
                sourceFormat: 'auto',
                targetFormat: 'ISO8601'
              }
            };
          } else if (targetField.type === 'coordinates') {
            return {
              ...prevConfigs,
              [targetFieldId]: {
                type: 'coordinates',
                format: 'decimal'
              }
            };
          }
        }
        return prevConfigs;
      });
    }
  };

  // Clear the mapping for a target field
  const handleClearMapping = (targetFieldId) => {
    setMappings(prevMappings => {
      const newMappings = { ...prevMappings };
      delete newMappings[targetFieldId];
      return newMappings;
    });
    
    setTransformConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      delete newConfigs[targetFieldId];
      return newConfigs;
    });
  };

  // Toggle a category's expanded state
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Open transform configuration popover
  const handleOpenTransformConfig = (event, fieldId) => {
    setAnchorEl(event.currentTarget);
    const field = targetFields.find(f => f.id === fieldId);
    const config = transformConfigs[fieldId] || getDefaultConfig(field);
    setCurrentFieldConfig({ fieldId, field, config });
  };

  // Close transform configuration popover
  const handleCloseTransformConfig = () => {
    setAnchorEl(null);
    setCurrentFieldConfig(null);
  };

  // Save transform configuration
  const handleSaveTransformConfig = () => {
    if (!currentFieldConfig) return;
    
    setTransformConfigs(prev => ({
      ...prev,
      [currentFieldConfig.fieldId]: currentFieldConfig.config
    }));
    
    handleCloseTransformConfig();
  };

  // Update current transform config (for popover form)
  const updateCurrentConfig = (updates) => {
    if (!currentFieldConfig) return;
    
    setCurrentFieldConfig({
      ...currentFieldConfig,
      config: {
        ...currentFieldConfig.config,
        ...updates
      }
    });
  };

  // Get default transform config based on field type
  const getDefaultConfig = (field) => {
    if (!field) return {};
    
    if (field.type === 'date' || field.type === 'datetime') {
      return {
        type: 'date',
        sourceFormat: 'auto',
        targetFormat: 'ISO8601'
      };
    } else if (field.type === 'coordinates') {
      return {
        type: 'coordinates',
        format: 'decimal'
      };
    } else {
      return {
        type: 'text',
        textTransform: 'none'
      };
    }
  };

  // Check if all required fields are mapped
  const areRequiredFieldsMapped = () => {
    const requiredFields = targetFields.filter(field => field.required);
    return requiredFields.every(field => mappings[field.id] !== undefined);
  };

  // Get progress percentage for required fields
  const getMappingProgress = () => {
    const requiredFields = targetFields.filter(field => field.required);
    if (requiredFields.length === 0) return 100;
    
    const mappedRequiredFields = requiredFields.filter(field => mappings[field.id] !== undefined);
    return Math.round((mappedRequiredFields.length / requiredFields.length) * 100);
  };

  // Generate transform configuration form based on field type
  const renderTransformConfigForm = () => {
    if (!currentFieldConfig || !currentFieldConfig.field) return null;
    
    const { field, config } = currentFieldConfig;
    
    if (field.type === 'date' || field.type === 'datetime') {
      return (
        <Box p={2} width={320}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Date Format
          </Typography>
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Source Format</InputLabel>
            <Select
              value={config.sourceFormat || 'auto'}
              onChange={(e) => updateCurrentConfig({ sourceFormat: e.target.value })}
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
              onChange={(e) => updateCurrentConfig({ customFormat: e.target.value })}
              helperText="Use: YYYY=year, MM=month, DD=day, HH=hour, mm=minute, ss=second"
            />
          )}
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Target Format</InputLabel>
            <Select
              value={config.targetFormat || 'ISO8601'}
              onChange={(e) => updateCurrentConfig({ targetFormat: e.target.value })}
            >
              <MenuItem value="ISO8601">ISO8601 (YYYY-MM-DD)</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
            </Select>
          </FormControl>
        </Box>
      );
    } else if (field.type === 'coordinates') {
      return (
        <Box p={2} width={320}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Coordinate Format
          </Typography>
          
          <FormControl fullWidth component="fieldset" margin="normal">
            <RadioGroup
              value={config.format || 'decimal'}
              onChange={(e) => updateCurrentConfig({ format: e.target.value })}
            >
              <FormControlLabel
                value="decimal"
                control={<Radio color="primary" />}
                label="Decimal Degrees (e.g., 40.7128, -74.0060)"
              />
              <FormControlLabel
                value="dms"
                control={<Radio color="primary" />}
                label="Degrees Minutes Seconds (e.g., 40°42'46"N, 74°00'21"W)"
              />
            </RadioGroup>
          </FormControl>
        </Box>
      );
    } else {
      // Default text transformations
      return (
        <Box p={2} width={320}>
          <Typography variant="subtitle1" gutterBottom>
            Configure Text Transformation
          </Typography>
          
          <FormControl fullWidth component="fieldset" margin="normal">
            <RadioGroup
              value={config.textTransform || 'none'}
              onChange={(e) => updateCurrentConfig({ textTransform: e.target.value })}
            >
              <FormControlLabel
                value="none"
                control={<Radio color="primary" />}
                label="None"
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
            </RadioGroup>
          </FormControl>
        </Box>
      );
    }
  };

  // Format a field name for display
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // State for API-related status
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformError, setTransformError] = useState(null);

  // Handle Apply and Preview button click
  const handleApplyAndPreview = async () => {
    if (!areRequiredFieldsMapped()) {
      alert('Please map all required fields before continuing.');
      return;
    }
    
    // Create the final mapping object with transform configs
    const finalMappings = Object.entries(mappings).map(([targetId, sourceIdx]) => {
      const targetField = targetFields.find(field => field.id === targetId);
      return {
        sourceField: sourceColumns[sourceIdx],
        targetField: targetField.name,
        required: targetField.required,
        transformConfig: transformConfigs[targetId] || null
      };
    });
    
    // Reset any previous errors
    setTransformError(null);
    
    // If fileId is provided, use the API to transform data
    if (fileId && window.DataFormatterAPI) {
      setIsTransforming(true);
      try {
        // Call the API to transform the data
        const result = await window.DataFormatterAPI.transformData(fileId, finalMappings);
        
        // Call the callback with both the mappings and the transform result
        if (typeof onMappingComplete === 'function') {
          onMappingComplete(finalMappings, result);
        }
      } catch (error) {
        console.error('Error transforming data:', error);
        setTransformError(error.message || 'Failed to transform data. Please try again.');
        
        // Still call the callback with just the mappings so the UI can continue
        if (typeof onMappingComplete === 'function') {
          onMappingComplete(finalMappings);
        }
      } finally {
        setIsTransforming(false);
      }
    } else {
      // Fallback to client-side transformation if no fileId
      console.log('No fileId provided, using client-side transformation');
      if (typeof onMappingComplete === 'function') {
        onMappingComplete(finalMappings);
      }
    }
  };

  // Helper component for target field drop zones
  const TargetFieldDropZone = ({ field }) => {
    const isMapped = mappings[field.id] !== undefined;
    const mappedSourceName = isMapped ? sourceColumns[mappings[field.id]] : null;
    const hasTransform = field.id in transformConfigs;
    
    return (
      <Paper 
        elevation={1} 
        style={{ 
          padding: '12px',
          marginBottom: '10px',
          backgroundColor: isMapped ? '#e8f5e9' : '#f9f9f9',
          borderLeft: field.required ? `4px solid ${isMapped ? '#4caf50' : '#f44336'}` : 'none'
        }}
      >
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={5}>
            <Typography variant="body1">
              {field.name}{field.required ? ' *' : ''}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              <Chip 
                label={field.type || 'text'} 
                size="small" 
                style={{ marginRight: 8, backgroundColor: '#e0e0e0' }} 
              />
              {field.description && (
                <Tooltip title={field.description}>
                  <InfoIcon fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={7}>
            <Droppable droppableId={`target-field-${field.id}`} isDropDisabled={isMapped}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    padding: isMapped ? '0' : '8px',
                    border: isMapped ? 'none' : '1px dashed #ccc',
                    borderRadius: '4px',
                    backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                    minHeight: isMapped ? 'auto' : '36px'
                  }}
                >
                  {isMapped ? (
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={mappedSourceName}
                        color="primary"
                        onDelete={() => handleClearMapping(field.id)}
                        deleteIcon={<DeleteIcon />}
                      />
                      {hasTransform && (
                        <Tooltip title="Transformation configured">
                          <Chip
                            icon={<SettingsIcon />}
                            size="small"
                            label="Transform"
                            style={{ marginLeft: 8, backgroundColor: '#ff9800', color: 'white' }}
                          />
                        </Tooltip>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleOpenTransformConfig(e, field.id)}
                        style={{ marginLeft: 4 }}
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      color="#999"
                      fontSize="0.85rem"
                    >
                      Drag a column here
                    </Box>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Show loading state
  if (isSchemaLoading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <Typography variant="body1" style={{ marginTop: 16 }}>
          Loading schema...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (schemaError) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="error" gutterBottom>
          Error loading schema
        </Typography>
        <Typography variant="body1" paragraph>
          {schemaError}
        </Typography>
        <Button variant="contained" color="primary" onClick={loadSchema}>
          Retry
        </Button>
      </Box>
    );
  }

  // Main component render
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Grid container spacing={3}>
        {/* Left panel: Source columns */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} style={{ padding: 16 }}>
            <Typography variant="h6" gutterBottom>
              Source Columns
            </Typography>
            
            <Droppable droppableId="source-columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    padding: '8px',
                    minHeight: '200px',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {sourceColumns.map((column, index) => {
                    const isUsed = Object.values(mappings).includes(index);
                    return (
                      <Draggable 
                        key={`source-column-${index}`}
                        draggableId={`source-column-${index}`}
                        index={index}
                        isDragDisabled={isUsed}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              userSelect: 'none',
                              padding: '8px 16px',
                              margin: '0 0 8px 0',
                              backgroundColor: isUsed ? '#f0f7ff' : 'white',
                              border: `1px solid ${isUsed ? '#90caf9' : '#ddd'}`,
                              borderRadius: '4px',
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.6 : 1
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">{column}</Typography>
                              {isUsed && (
                                <Chip
                                  label="Mapped"
                                  size="small"
                                  style={{ 
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    backgroundColor: '#1976d2',
                                    color: 'white'
                                  }}
                                />
                              )}
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  {sourceColumns.length === 0 && (
                    <Box p={2} textAlign="center" color="#999">
                      <Typography variant="body2">No source columns available</Typography>
                    </Box>
                  )}
                </div>
              )}
            </Droppable>
            
            <Typography variant="h6" style={{ marginTop: 24, marginBottom: 8 }}>
              Sample Data
            </Typography>
            
            <Box 
              style={{ 
                maxHeight: '300px', 
                overflowX: 'auto', 
                overflowY: 'auto',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #eee'
              }}
            >
              {sampleData.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {sourceColumns.map((col, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            borderBottom: '2px solid #ddd',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {sourceColumns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            style={{
                              padding: '6px 8px',
                              borderBottom: '1px solid #eee',
                              fontSize: '0.85rem',
                              maxWidth: '150px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={row[col]}
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Box p={2} textAlign="center" color="#999">
                  <Typography variant="body2">No sample data available</Typography>
                </Box>
              )}
            </Box>
            {sampleData.length > 3 && (
              <Typography variant="caption" style={{ display: 'block', textAlign: 'right', marginTop: 4 }}>
                Showing 3 of {sampleData.length} records
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Right panel: Target fields */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} style={{ padding: 16 }}>
            <Typography variant="h6" gutterBottom>
              Target Fields
            </Typography>
            
            <Box mb={2}>
              <LinearProgress 
                variant="determinate" 
                value={getMappingProgress()} 
                style={{ height: 8, borderRadius: 4 }}
                color={getMappingProgress() === 100 ? "primary" : "secondary"}
              />
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="textSecondary">
                  {targetFields.filter(f => f.required && mappings[f.id] !== undefined).length}/{targetFields.filter(f => f.required).length} required fields mapped
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {getMappingProgress()}%
                </Typography>
              </Box>
            </Box>
            
            <Box 
              style={{ 
                maxHeight: '500px', 
                overflowY: 'auto',
                marginBottom: 16
              }}
            >
              {categories.map(category => {
                const categoryFields = targetFields.filter(f => f.category === category.id);
                if (categoryFields.length === 0) return null;
                
                return (
                  <Accordion 
                    key={category.id}
                    expanded={expandedCategories[category.id]}
                    onChange={() => toggleCategory(category.id)}
                    style={{ marginBottom: 8 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      style={{ backgroundColor: '#f5f5f5' }}
                    >
                      <Box display="flex" alignItems="center">
                        <Box mr={1}>{category.icon}</Box>
                        <Typography variant="subtitle1">{category.label}</Typography>
                        <Chip 
                          size="small" 
                          label={categoryFields.length}
                          style={{ marginLeft: 8, backgroundColor: '#e0e0e0' }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: '8px 16px', display: 'block' }}>
                      {categoryFields.map(field => (
                        <TargetFieldDropZone key={field.id} field={field} />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
            
            <Box display="flex" justifyContent="flex-end" mt={2}>
              {transformError && (
                <Typography variant="body2" color="error" style={{ marginRight: 16, alignSelf: 'center' }}>
                  {transformError}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                disabled={!areRequiredFieldsMapped() || isTransforming}
                onClick={handleApplyAndPreview}
              >
                {isTransforming ? 'Transforming...' : 'Apply & Preview Transformation'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Transform configuration popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseTransformConfig}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {renderTransformConfigForm()}
        <Box display="flex" justifyContent="flex-end" p={1}>
          <Button onClick={handleCloseTransformConfig} size="small" style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTransformConfig} 
            color="primary" 
            variant="contained"
            size="small"
          >
            Apply
          </Button>
        </Box>
      </Popover>
    </DragDropContext>
  );
};

export default ColumnMappingUI;