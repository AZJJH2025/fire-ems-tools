import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, Button, Chip, 
  IconButton, Tooltip, Accordion, AccordionSummary,
  AccordionDetails, LinearProgress, CircularProgress
} from '@material-ui/core';
import { 
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  DragIndicator as DragIndicatorIcon,
  Settings as SettingsIcon
} from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useData, ActionTypes } from '../context/DataContext';
import TransformConfig from './TransformConfig';

const ColumnMappingUI = ({ onMappingComplete }) => {
  const { state, dispatch } = useData();
  const { 
    sourceColumns, sampleData, targetFields, expandedCategories,
    mappings, selectedTool, fileId
  } = state;
  
  // Debug logs for troubleshooting
  console.log('ColumnMappingUI rendered with:', { 
    sourceColumnsLength: sourceColumns?.length || 0,
    sampleDataLength: sampleData?.length || 0,
    targetFieldsLength: targetFields?.length || 0,
    mappingsLength: mappings?.length || 0,
    selectedTool,
    fileId
  });
  
  // Local state for transform configuration UI
  const [transformConfigOpen, setTransformConfigOpen] = useState(false);
  const [currentFieldConfig, setCurrentFieldConfig] = useState(null);
  const [transformConfigs, setTransformConfigs] = useState({});
  
  // Group target fields by category
  const fieldsByCategory = targetFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {});
  
  // Categories for fields (order matters for display)
  const categories = [
    { id: 'timestamp', label: 'Timestamp Fields', icon: 'access_time' },
    { id: 'location', label: 'Location Fields', icon: 'place' },
    { id: 'incident', label: 'Incident Fields', icon: 'local_fire_department' },
    { id: 'nfirs', label: 'NFIRS Fields', icon: 'assignment' },
    { id: 'other', label: 'Other Fields', icon: 'more_horiz' }
  ];
  
  // Handle drag end event
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // Exit if dropped outside a droppable area or in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Handle drag from source columns to target field
    if (source.droppableId === 'source-columns' && 
        destination.droppableId.startsWith('target-field-')) {
      
      // Get the target field ID from the droppable ID
      const targetFieldId = destination.droppableId.replace('target-field-', '');
      const sourceColumn = sourceColumns[parseInt(draggableId.replace('source-column-', ''))];
      
      // Find the target field details
      const targetField = targetFields.find(field => field.id === targetFieldId);
      
      if (targetField && sourceColumn) {
        // Create a new mapping
        const newMapping = {
          sourceField: sourceColumn,
          targetField: targetField.name,
          required: targetField.required,
          transformConfig: getDefaultTransformConfig(targetField)
        };
        
        // Update mappings in state
        const existingMapping = mappings.find(m => m.targetField === targetField.name);
        
        if (existingMapping) {
          // Update existing mapping
          dispatch({
            type: ActionTypes.UPDATE_MAPPING,
            payload: newMapping
          });
        } else {
          // Add new mapping
          dispatch({
            type: ActionTypes.ADD_MAPPING,
            payload: newMapping
          });
        }
        
        // Add default transform config
        setTransformConfigs(prev => ({
          ...prev,
          [targetFieldId]: getDefaultTransformConfig(targetField)
        }));
      }
    }
  };
  
  // Get default transform config based on field type
  const getDefaultTransformConfig = (field) => {
    if (!field) return {};
    
    switch (field.type) {
      case 'date':
      case 'datetime':
        return {
          type: 'date',
          sourceFormat: 'auto',
          targetFormat: 'ISO8601'
        };
        
      case 'coordinates':
        return {
          type: 'coordinates',
          format: 'decimal'
        };
        
      default:
        return {
          type: 'text',
          textTransform: 'none'
        };
    }
  };
  
  // Clear mapping for a target field
  const handleClearMapping = (targetFieldId) => {
    const targetField = targetFields.find(f => f.id === targetFieldId);
    
    if (targetField) {
      dispatch({
        type: ActionTypes.REMOVE_MAPPING,
        payload: { targetField: targetField.name }
      });
      
      // Remove transform config
      setTransformConfigs(prev => {
        const newConfigs = { ...prev };
        delete newConfigs[targetFieldId];
        return newConfigs;
      });
    }
  };
  
  // Toggle category expansion
  const handleToggleCategory = (categoryId) => {
    dispatch({
      type: ActionTypes.TOGGLE_CATEGORY,
      payload: categoryId
    });
  };
  
  // Open transform config dialog
  const handleOpenTransformConfig = (fieldId) => {
    const field = targetFields.find(f => f.id === fieldId);
    const config = transformConfigs[fieldId] || getDefaultTransformConfig(field);
    
    setCurrentFieldConfig({ fieldId, field, config });
    setTransformConfigOpen(true);
  };
  
  // Save transform config
  const handleSaveTransformConfig = (fieldId, config) => {
    // Update transform configs
    setTransformConfigs(prev => ({
      ...prev,
      [fieldId]: config
    }));
    
    // Update mapping with new transform config
    const field = targetFields.find(f => f.id === fieldId);
    if (field) {
      const existingMapping = mappings.find(m => m.targetField === field.name);
      
      if (existingMapping) {
        dispatch({
          type: ActionTypes.UPDATE_MAPPING,
          payload: {
            ...existingMapping,
            transformConfig: config
          }
        });
      }
    }
    
    setTransformConfigOpen(false);
    setCurrentFieldConfig(null);
  };
  
  // Check if all required fields are mapped
  const areRequiredFieldsMapped = () => {
    const requiredFields = targetFields.filter(field => field.required);
    return requiredFields.every(field => 
      mappings.some(mapping => mapping.targetField === field.name)
    );
  };
  
  // Get mapping progress percentage
  const getMappingProgress = () => {
    const requiredFields = targetFields.filter(field => field.required);
    if (requiredFields.length === 0) return 100;
    
    const mappedRequiredFields = requiredFields.filter(field => 
      mappings.some(mapping => mapping.targetField === field.name)
    );
    
    return Math.round((mappedRequiredFields.length / requiredFields.length) * 100);
  };
  
  // Handle apply and preview button click
  const handleApplyAndPreview = () => {
    // Check if all required fields are mapped
    const allMapped = areRequiredFieldsMapped();
    
    // If required fields are missing, show a warning with confirmation dialog
    if (!allMapped) {
      // Find which required fields are missing
      const requiredFields = targetFields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        !mappings.some(mapping => mapping.targetField === field.name)
      );
      
      // Create descriptions of potential impacts
      const impacts = [];
      const hasCoordinates = missingFields.some(f => f.id === 'latitude' || f.id === 'longitude');
      const hasTimeFields = missingFields.some(f => 
        f.id === 'incident_date' || f.id === 'incident_time' || 
        f.id === 'dispatch_time' || f.id === 'en_route_time' || f.id === 'on_scene_time'
      );
      
      if (hasCoordinates) {
        impacts.push("Map visualizations may not be available");
      }
      if (hasTimeFields) {
        impacts.push("Time-based analysis may be limited");
      }
      if (impacts.length === 0) {
        impacts.push("Some features may be limited or unavailable");
      }
      
      // Show confirmation dialog
      const confirmMessage = `
Warning: Missing Required Fields

The following required fields are not mapped:
${missingFields.map(f => '- ' + f.name).join('\n')}

Impact:
${impacts.map(i => '- ' + i).join('\n')}

Do you want to continue anyway?
      `;
      
      if (!window.confirm(confirmMessage)) {
        return; // User cancelled
      }
      
      // If user confirmed, continue but store information about missing fields
      try {
        // Store in session storage to be used during send to tool 
        sessionStorage.setItem('warnedMissingFields', 
          JSON.stringify(missingFields.map(f => f.name))
        );
        sessionStorage.setItem('warnedMissingFieldsTimestamp', new Date().toISOString());
        
        // Log the decision
        console.warn("User proceeded with missing required fields:", 
          missingFields.map(f => f.name).join(', ')
        );
      } catch (err) {
        console.warn("Could not store missing fields info:", err);
      }
    }
    
    // Create the final mappings array with transform configs
    const finalMappings = mappings.map(mapping => {
      const targetField = targetFields.find(field => field.name === mapping.targetField);
      
      return {
        ...mapping,
        transformConfig: targetField ? 
          transformConfigs[targetField.id] || getDefaultTransformConfig(targetField) : 
          null
      };
    });
    
    // Call the mapping complete callback
    if (typeof onMappingComplete === 'function') {
      onMappingComplete(finalMappings);
    }
  };
  
  // Check if source column is already mapped
  const isSourceColumnMapped = (columnIndex) => {
    const column = sourceColumns[columnIndex];
    return mappings.some(mapping => mapping.sourceField === column);
  };
  
  // Find which target field a source column is mapped to
  const findMappedTargetField = (columnIndex) => {
    const column = sourceColumns[columnIndex];
    const mapping = mappings.find(m => m.sourceField === column);
    
    if (mapping) {
      const targetField = targetFields.find(tf => tf.name === mapping.targetField);
      return targetField ? targetField.name : null;
    }
    
    return null;
  };
  
  return (
    <Grid container spacing={3}>
      {/* Left panel: Source columns */}
      <Grid item xs={12} md={5}>
        <Paper elevation={2} style={{ padding: 16, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Source Columns
          </Typography>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="source-columns">
              {(provided, snapshot) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  bgcolor={snapshot.isDraggingOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
                  p={1}
                  minHeight={400}
                  maxHeight={500}
                  overflow="auto"
                  border="1px solid #e0e0e0"
                  borderRadius={4}
                >
                  {sourceColumns.map((column, index) => {
                    const isMapped = isSourceColumnMapped(index);
                    const mappedToField = isMapped ? findMappedTargetField(index) : null;
                    
                    return (
                      <Draggable
                        key={`source-column-${index}`}
                        draggableId={`source-column-${index}`}
                        index={index}
                        isDragDisabled={isMapped}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            mb={1}
                            p={1.5}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            bgcolor={isMapped ? '#e3f2fd' : 'white'}
                            border={`1px solid ${isMapped ? '#90caf9' : '#e0e0e0'}`}
                            borderRadius={1}
                            boxShadow={snapshot.isDragging ? 2 : 0}
                            opacity={snapshot.isDragging ? 0.7 : 1}
                          >
                            <Box display="flex" alignItems="center">
                              <DragIndicatorIcon color="action" style={{ marginRight: 8, opacity: 0.6 }} />
                              <Typography variant="body2">{column}</Typography>
                            </Box>
                            
                            {isMapped && (
                              <Tooltip title={`Mapped to ${mappedToField || 'a field'}`}>
                                <Chip
                                  label="Mapped"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  
                  {sourceColumns.length === 0 && (
                    <Box p={2} textAlign="center" color="text.secondary">
                      <Typography variant="body2">No source columns available</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
          
          {/* Sample data preview */}
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Sample Data
            </Typography>
            
            <Box 
              border="1px solid #e0e0e0" 
              borderRadius={1} 
              overflow="auto"
              maxHeight={200}
            >
              {sampleData && sampleData.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      {Object.keys(sampleData[0]).map((key, i) => (
                        <th key={i} style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} style={{ padding: 8, borderBottom: '1px solid #e0e0e0' }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Box p={2} textAlign="center" color="text.secondary">
                  <Typography variant="body2">No sample data available</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* Right panel: Target fields */}
      <Grid item xs={12} md={7}>
        <Paper elevation={2} style={{ padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            Target Fields for {selectedTool ? selectedTool.replace('-', ' ') : 'Selected Tool'}
          </Typography>
          
          {/* Mapping progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">
                Required Fields Mapped: {getMappingProgress()}%
              </Typography>
              <Typography variant="body2">
                {mappings.filter(m => m.required).length} of {targetFields.filter(f => f.required).length}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getMappingProgress()} 
              color="primary"
              style={{ 
                backgroundColor: getMappingProgress() === 100 ? '#e8f5e9' : '#fff3cd'
              }}
            />
          </Box>
          
          <Box maxHeight={500} overflow="auto" pb={2}>
            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Display fields grouped by category */}
              {categories.map(category => {
                const categoryFields = fieldsByCategory[category.id] || [];
                
                if (categoryFields.length === 0) {
                  return null;
                }
                
                return (
                  <Accordion
                    key={category.id}
                    expanded={expandedCategories[category.id] || false}
                    onChange={() => handleToggleCategory(category.id)}
                    style={{ marginBottom: 8 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${category.id}-content`}
                      id={`${category.id}-header`}
                    >
                      <Typography variant="subtitle1">
                        <Box component="span" mr={1}>
                          <i className="material-icons">{category.icon}</i>
                        </Box>
                        {category.label} ({categoryFields.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ display: 'block' }}>
                      {categoryFields.map(field => {
                        const mappedValue = mappings.find(m => m.targetField === field.name);
                        const hasTransform = !!transformConfigs[field.id];
                        
                        return (
                          <Box mb={2} key={field.id}>
                            <Paper
                              elevation={1}
                              style={{
                                padding: 12,
                                backgroundColor: mappedValue ? '#e8f5e9' : '#f9f9f9',
                                borderLeft: field.required ? `4px solid ${mappedValue ? '#4caf50' : '#ff9800'}` : 'none'
                              }}
                            >
                              <Grid container alignItems="center" justifyContent="space-between">
                                <Grid item xs={5}>
                                  <Typography variant="body1">
                                    {field.name}
                                    {field.required && (
                                      <Tooltip title="Recommended field for full functionality">
                                        <span style={{ color: mappedValue ? '#4caf50' : '#ff9800', marginLeft: '4px' }}>*</span>
                                      </Tooltip>
                                    )}
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
                                  <Droppable droppableId={`target-field-${field.id}`} isDropDisabled={!!mappedValue}>
                                    {(provided, snapshot) => (
                                      <Box
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        p={mappedValue ? 0 : 1}
                                        border={mappedValue ? 'none' : '1px dashed #ccc'}
                                        borderRadius={1}
                                        bgcolor={snapshot.isDraggingOver ? '#e3f2fd' : 'transparent'}
                                        minHeight={mappedValue ? 'auto' : 36}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent={mappedValue ? 'flex-start' : 'center'}
                                      >
                                        {mappedValue ? (
                                          <Box display="flex" alignItems="center">
                                            <Chip
                                              label={mappedValue.sourceField}
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
                                              onClick={() => handleOpenTransformConfig(field.id)}
                                              style={{ marginLeft: 4 }}
                                            >
                                              <SettingsIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        ) : (
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            style={{ fontSize: '0.85rem' }}
                                          >
                                            Drag a column here
                                          </Typography>
                                        )}
                                        {provided.placeholder}
                                      </Box>
                                    )}
                                  </Droppable>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </DragDropContext>
          </Box>
          
          {/* Action buttons */}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyAndPreview}
              // Always enable the button but will show a warning if fields are missing
            >
              Apply and Preview
            </Button>
          </Box>
        </Paper>
      </Grid>
      
      {/* Transform configuration dialog */}
      {transformConfigOpen && currentFieldConfig && (
        <TransformConfig
          open={transformConfigOpen}
          fieldConfig={currentFieldConfig}
          onClose={() => setTransformConfigOpen(false)}
          onSave={(config) => handleSaveTransformConfig(currentFieldConfig.fieldId, config)}
        />
      )}
    </Grid>
  );
};

export default ColumnMappingUI;