import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { RootState } from '@/state/redux/store';
import { 
  setCurrentStep, 
  setMappings,
  setTransformedData,
  setProcessingStatus
} from '@/state/redux/formatterSlice';
import { FieldMapping } from '@/types/formatter';
import { getToolConfigById } from '@/utils/mockToolConfigs';
import { transformData } from '@/services/transformation/dataTransformer';
import SourceFieldsList from './SourceFieldsList';
import TargetFieldsPanel from './TargetFieldsPanel';
import ValidationPanel from './ValidationPanel';
import LivePreviewStrip from './LivePreviewStrip';
import TemplateManager from './TemplateManager';
import useTemplateSync from '@/hooks/useTemplateSync';

// Field mapping context
export interface MappingTemplate {
  id: string;
  name: string;
  description?: string;
  toolId: string;
  mappings: FieldMapping[];
  lastModified: number;
}

const FieldMappingContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    sourceColumns, 
    sampleData, 
    selectedTool, 
    mappings, 
    processingStatus 
  } = useSelector((state: RootState) => state.formatter);
  
  // State for the current active template
  const [currentTemplate, setCurrentTemplate] = useState<MappingTemplate>({
    id: `template-${Date.now()}`,
    name: 'Untitled Mapping',
    toolId: selectedTool?.id || '',
    mappings: mappings || [],
    lastModified: Date.now()
  });
  
  // Track if template has been modified (for sync)
  const [templateDirty, setTemplateDirty] = useState(false);
  
  // Auto-mapping in progress state
  const [autoMappingInProgress, setAutoMappingInProgress] = useState(false);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[]>([]);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    open: boolean;
  }>({
    message: '',
    severity: 'info',
    open: false
  });
  
  // Search/filter state
  const [sourceFilter, setSourceFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  
  // Flag for showing all fields (vs. categorized)
  const [showAllFields, setShowAllFields] = useState(false);
  
  // Load the tool configuration based on selectedTool
  const toolConfig = selectedTool ? selectedTool : 
    (selectedTool?.id ? getToolConfigById(selectedTool.id) : undefined);
  
  // Use our custom hook for template synchronization
  const { saveToServer } = useTemplateSync(currentTemplate, templateDirty);
  
  // FIXED: Clear state synchronization to avoid race conditions
  // This effect synchronizes the Redux mappings state to our local template state
  // It only runs when the Redux mappings change, making it the source of truth
  useEffect(() => {
    console.log("Redux mappings changed:", mappings);
    
    // Update local template state with the Redux mappings
    setCurrentTemplate(prev => {
      const newTemplate = {
        ...prev,
        mappings: [...mappings], // Create a copy to ensure proper reference change
        lastModified: Date.now()
      };
      console.log("Updated template with Redux mappings:", newTemplate);
      return newTemplate;
    });
    
    // Template is considered dirty whenever mappings change
    if (mappings.length > 0) {
      setTemplateDirty(true);
    }
  }, [mappings]); // Only trigger on Redux mappings changes
  
  // Validate mappings whenever they change
  useEffect(() => {
    validateMappings();
  }, [mappings, toolConfig]);
  
  // FIXED: Handle mapping updates - Always use Redux state as source of truth
  const handleMappingChange = (mapping: FieldMapping) => {
    console.log("handleMappingChange called with:", mapping);
    
    try {
      // Always start with the current Redux state
      const newMappings = [...mappings];
      const existingIndex = newMappings.findIndex(m => m.targetField === mapping.targetField);
      
      if (existingIndex >= 0) {
        console.log(`Updating existing mapping for ${mapping.targetField}`);
        newMappings[existingIndex] = mapping;
      } else {
        console.log(`Adding new mapping for ${mapping.targetField}`);
        newMappings.push(mapping);
      }
      
      // Update Redux state - this will trigger the useEffect to update the local state
      dispatch(setMappings(newMappings));
      
      // Provide user feedback
      console.log("Mapping updated successfully:", mapping);
      
      // Show success message to user
      setStatusMessage({
        message: `Mapped ${mapping.sourceField} to ${mapping.targetField}`,
        severity: 'success',
        open: true
      });
    } catch (error) {
      console.error("Error updating mapping:", error);
    }
  };
  
  // FIXED: Handle mapping removal - Always use Redux state as source of truth
  const handleRemoveMapping = (targetField: string) => {
    console.log("handleRemoveMapping called for:", targetField);
    
    try {
      // Always start with the current Redux state
      const newMappings = mappings.filter(m => m.targetField !== targetField);
      
      // Update Redux state - this will trigger the useEffect to update the local state
      dispatch(setMappings(newMappings));
      
      console.log(`Mapping for ${targetField} removed successfully`);
    } catch (error) {
      console.error("Error removing mapping:", error);
    }
  };
  
  // Run validation on current mappings
  const validateMappings = () => {
    if (!toolConfig) return;
    
    const errors: {
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }[] = [];
    
    // Check required fields
    toolConfig.requiredFields.forEach(field => {
      // Check if there is a mapping for this field
      const mapping = mappings.find(m => m.targetField === field.name);
      console.log(`Checking required field ${field.name}, mapping:`, mapping);
      
      if (!mapping) {
        errors.push({
          field: field.name,
          message: `Required field ${field.name} is not mapped`,
          severity: 'error'
        });
      }
    });
    
    // Add more validation as needed
    
    setValidationErrors(errors);
  };
  
  // Run auto-mapping
  const handleAutoMap = async () => {
    if (!sourceColumns || !toolConfig) return;
    
    setAutoMappingInProgress(true);
    
    try {
      // Simple auto-mapping for now - match on exact names (case-insensitive)
      const newMappings: FieldMapping[] = [...currentTemplate.mappings];
      
      // Helper function to find if a field is already mapped
      const isFieldMapped = (targetField: string) => 
        newMappings.some(m => m.targetField === targetField);
      
      // Helper to get normalized field name (lowercase, no spaces)
      const normalizeFieldName = (name: string) => 
        name.toLowerCase().replace(/[\s_-]/g, '');
      
      // First, try exact matches (case-insensitive)
      const allTargetFields = [
        ...toolConfig.requiredFields,
        ...toolConfig.optionalFields
      ];
      
      allTargetFields.forEach(targetField => {
        // Skip if already mapped
        if (isFieldMapped(targetField.name)) return;
        
        // Try exact match first
        const exactMatch = sourceColumns.find(
          sourceField => sourceField.toLowerCase() === targetField.name.toLowerCase()
        );
        
        if (exactMatch) {
          newMappings.push({
            sourceField: exactMatch,
            targetField: targetField.name
          });
          return;
        }
        
        // Try normalized match (e.g., 'incident_date' matches 'IncidentDate')
        const normalizedTargetName = normalizeFieldName(targetField.name);
        const normalizedMatch = sourceColumns.find(
          sourceField => normalizeFieldName(sourceField) === normalizedTargetName
        );
        
        if (normalizedMatch) {
          newMappings.push({
            sourceField: normalizedMatch,
            targetField: targetField.name
          });
          return;
        }
        
        // Try fuzzy match (more advanced versions would go here)
        // For now, we'll just look for partial matches
        const normalizedSourceFields = sourceColumns.map(normalizeFieldName);
        const partialMatchIndex = normalizedSourceFields.findIndex(
          sourceField => sourceField.includes(normalizedTargetName) || 
                         normalizedTargetName.includes(sourceField)
        );
        
        if (partialMatchIndex >= 0) {
          newMappings.push({
            sourceField: sourceColumns[partialMatchIndex],
            targetField: targetField.name
          });
        }
      });
      
      // Update mappings
      dispatch(setMappings(newMappings));
      
    } finally {
      setAutoMappingInProgress(false);
    }
  };
  
  // Handle template save
  const handleSaveTemplate = async () => {
    try {
      await saveToServer();
      setTemplateDirty(false);
      // Show success message
    } catch (error) {
      // Handle error
      console.error('Failed to save template:', error);
    }
  };
  
  // Handle navigation to previous/next step
  const handleBack = () => {
    dispatch(setCurrentStep(0)); // Go back to file upload
  };
  
  const handleNext = () => {
    try {
      // Transform the data based on current mappings
      dispatch(setProcessingStatus('transforming'));
      
      console.log("Transforming data with mappings:", currentTemplate.mappings);
      console.log("Sample data:", sampleData);

      const transformed = transformData(sampleData, currentTemplate.mappings);
      
      console.log("Transformed data:", transformed);
      
      // Update the Redux store with transformed data
      dispatch(setTransformedData(transformed));
      
      // Proceed to the next step
      dispatch(setProcessingStatus('mapping'));
      dispatch(setCurrentStep(2)); // Go to preview & validate
    } catch (error) {
      console.error("Error transforming data:", error);
      dispatch(setProcessingStatus('error'));
      
      setStatusMessage({
        message: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        open: true
      });
    }
  };
  
  // Check if we can proceed (all required fields mapped)
  // Check if we can proceed (all required fields mapped)
  const canProceed = useMemo(() => {
    // Re-compute this whenever validationErrors or mappings change
    console.log("Checking if can proceed with validationErrors:", validationErrors);
    console.log("Current mappings:", mappings);
    
    // Check if all required fields have been mapped
    if (toolConfig) {
      const unmappedRequiredFields = toolConfig.requiredFields.filter(
        field => !mappings.some(mapping => mapping.targetField === field.name)
      );
      console.log("Unmapped required fields:", unmappedRequiredFields);
      return unmappedRequiredFields.length === 0;
    }
    
    return validationErrors.every(error => error.severity !== 'error');
  }, [validationErrors, mappings, toolConfig]);
  
  // We no longer need the dnd-kit drag end handler as we're using HTML5 drag/drop
  
  // Handle manual drag and drop (HTML5 native)
  const handleManualDragDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    // Get the source field ID from the dragged element
    const sourceField = event.dataTransfer.getData('text/plain');
    if (!sourceField) {
      setStatusMessage({
        message: 'Drag and drop error: No source field data found',
        severity: 'error',
        open: true
      });
      return;
    }
    
    // Get the target field from the drop target
    const targetElement = event.target as HTMLElement;
    const targetField = targetElement.closest('[data-target-field]')?.getAttribute('data-target-field');
    
    if (!targetField) {
      setStatusMessage({
        message: 'Drag and drop error: No target field found. Try dropping directly on a target field.',
        severity: 'warning',
        open: true
      });
      return;
    }
    
    // Update the mapping
    handleMappingChange({
      sourceField,
      targetField
    });
    
    setStatusMessage({
      message: `Mapped ${sourceField} to ${targetField}`,
      severity: 'success',
      open: true
    });
  };
  
  // If we have no source columns or tool config, show error/loading state
  if (!sourceColumns.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          No source columns available. Please upload a file first.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back to Upload
        </Button>
      </Box>
    );
  }
  
  if (!toolConfig) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          No tool selected. Please select a tool first.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back to Upload
        </Button>
      </Box>
    );
  }
  
  if (processingStatus === 'uploading') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Processing file data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Map Fields for {toolConfig.name}</Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            disabled={!templateDirty}
          >
            Save Template
          </Button>
          
          <TemplateManager
            currentTemplate={currentTemplate}
            setCurrentTemplate={setCurrentTemplate}
            setTemplateDirty={setTemplateDirty}
          />
        </Stack>
      </Box>
      
      <Box sx={{
        display: 'flex',
        gap: 2,
        height: '700px',
        minHeight: '700px',
        border: '1px solid #eaeaea',
        borderRadius: '4px',
        padding: '4px'
      }}>
        {/* Left side: Source fields with independent scroll */}
        <Box sx={{
          width: '35%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRight: '1px solid #eaeaea',
          paddingRight: '8px'
        }}>
          <Typography
            variant="h6"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#fff',
              paddingBottom: '8px',
              borderBottom: '2px solid #1976d2',
              marginBottom: '8px',
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Source Fields Panel ↕️ (Scrollable)
          </Typography>
          <SourceFieldsList
            sourceColumns={sourceColumns}
            filter={sourceFilter}
            setFilter={setSourceFilter}
            mappings={currentTemplate.mappings}
            sampleData={sampleData}
          />
        </Box>

        {/* Right side: Target fields and validation with independent scroll */}
        <Box
          sx={{
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
          onDragOver={(e) => {
            // Only prevent default if no child element is handling this
            if (e.target === e.currentTarget) {
              e.preventDefault();
              console.log("Parent container dragOver");
            }
          }}
          onDrop={(e) => {
            // Only handle drop if no child element has handled it
            if (e.target === e.currentTarget) {
              e.preventDefault();
              handleManualDragDrop(e);
              console.log("Parent container drop");
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#fff',
              paddingBottom: '8px',
              borderBottom: '2px solid #1976d2',
              marginBottom: '8px',
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Target Fields Panel ↕️ (Scrollable)
          </Typography>
          <TargetFieldsPanel
            toolConfig={toolConfig}
            showAllFields={showAllFields}
            setShowAllFields={setShowAllFields}
            filter={targetFilter}
            setFilter={setTargetFilter}
            mappings={currentTemplate.mappings}
            onMappingChange={handleMappingChange}
            onRemoveMapping={handleRemoveMapping}
            validationErrors={validationErrors}
            sampleData={sampleData}
            sourceColumns={sourceColumns}
          />

          {validationErrors.length > 0 && (
            <Box sx={{
              flexShrink: 0,
              marginTop: 'auto',
              borderTop: '1px solid #eaeaea',
              paddingTop: '8px'
            }}>
              <ValidationPanel
                validationErrors={validationErrors}
                jumpToField={(field) => {
                  // Logic to scroll to the specified field
                  const element = document.getElementById(`target-field-${field}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-field');
                    setTimeout(() => {
                      element.classList.remove('highlight-field');
                    }, 2000);
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Live preview at the bottom */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <LivePreviewStrip
          sampleData={sampleData}
          mappings={currentTemplate.mappings}
        />
      </Paper>
      
      {/* Bottom action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Box>
          <Button
            variant="outlined"
            onClick={handleAutoMap}
            disabled={autoMappingInProgress || !sourceColumns.length}
            sx={{ mr: 1 }}
          >
            {autoMappingInProgress ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Auto-mapping...
              </>
            ) : (
              'Auto-Map Fields'
            )}
          </Button>
          
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            disabled={!canProceed}
          >
            Continue
          </Button>
        </Box>
      </Box>
      
      {/* Status message snackbar */}
      <Snackbar
        open={statusMessage.open}
        autoHideDuration={6000}
        onClose={() => setStatusMessage({...statusMessage, open: false})}
      >
        <Alert 
          onClose={() => setStatusMessage({...statusMessage, open: false})} 
          severity={statusMessage.severity}
        >
          {statusMessage.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FieldMappingContainer;