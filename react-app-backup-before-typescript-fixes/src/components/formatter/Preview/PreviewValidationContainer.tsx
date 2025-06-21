import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import DataPreviewTable from './DataPreviewTable';
import ValidationErrorsPanel from '../Validation/ValidationErrorsPanel';
import ValidationActionPanel from '../Validation/ValidationActionPanel';
import { RootState } from '@/state/redux/store';
import {
  setValidationErrors,
  setCurrentStep,
  setProcessingStatus,
  addMapping
} from '@/state/redux/formatterSlice';
import { validateData } from '@/services/validation/dataValidator';
import { TargetField } from '@/types/formatter';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PreviewValidationContainer: React.FC = () => {
  const dispatch = useDispatch();
  const {
    sourceFile,
    transformedData,
    validationErrors,
    processingStatus,
    selectedTool,
    mappings
  } = useSelector((state: RootState) => state.formatter);

  const [tabValue, setTabValue] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [fieldToHighlight, setFieldToHighlight] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    dispatch(setCurrentStep(1)); // Go back to Field Mapping
  };

  // Navigate to next step
  const handleNextStep = () => {
    dispatch(setCurrentStep(3)); // Go to Export
  };

  // Function to validate the transformed data
  const validateTransformedData = () => {
    if (!transformedData || !selectedTool) return;

    setIsValidating(true);

    try {
      // Combine required and optional fields
      const allFields = [
        ...selectedTool.requiredFields,
        ...selectedTool.optionalFields
      ];

      // Get field mappings from Redux state to check for default values
      const mappings = useSelector((state: RootState) => state.formatter.mappings);

      // Check for default value fields before validation
      const fieldsWithDefaults: Record<string, boolean> = {};

      if (mappings) {
        mappings.forEach(mapping => {
          if (mapping.sourceField === '__default__' && mapping.transformations) {
            const defaultTransform = mapping.transformations.find(t =>
              t.type === 'convert' && t.params && t.params.defaultValue !== undefined
            );

            if (defaultTransform) {
              fieldsWithDefaults[mapping.targetField] = true;
              console.log(`Field ${mapping.targetField} has default value: ${defaultTransform.params.defaultValue}`);
            }
          }
        });
      }

      // Create a copy of the data with default values applied for validation
      const dataForValidation = transformedData.map(row => {
        const newRow = { ...row };

        // For each field with default, if the value is empty, consider it valid
        Object.keys(fieldsWithDefaults).forEach(fieldName => {
          // Mark field as having a default in the registry
          if (typeof window !== 'undefined' && window.defaultValueRegistry) {
            window.defaultValueRegistry.register(fieldName, true);
          }
        });

        return newRow;
      });

      // Validate the data against the field definitions
      const errors = validateData(dataForValidation, allFields);

      // Update the state with validation results
      dispatch(setValidationErrors(errors));

      if (errors.length === 0) {
        dispatch(setProcessingStatus('complete'));
      } else {
        dispatch(setProcessingStatus('error'));
      }
    } catch (error) {
      console.error('Validation error:', error);
      dispatch(setProcessingStatus('error'));
    } finally {
      setIsValidating(false);
    }
  };

  // Jump to a specific row in the data table
  const handleJumpToError = (rowIndex: number, field: string) => {
    // Switch to the Preview tab
    setTabValue(0);

    // Scroll to the table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // TODO: Highlight the specific cell with error (would require enhancing the table component)
  };

  // Handle adding a default value mapping
  const handleAddDefaultValue = (mapping: FieldMapping) => {
    console.log('Adding default value mapping:', mapping);
    dispatch(addMapping(mapping));

    // Revalidate after adding default value
    setTimeout(() => {
      validateTransformedData();
    }, 100);
  };

  // Jump to field mapping tab and highlight the field
  const handleJumpToMapping = (fieldName: string) => {
    setFieldToHighlight(fieldName);
    dispatch(setCurrentStep(1)); // Go back to Field Mapping step
  };

  // Run validation when component mounts or when transformedData changes
  useEffect(() => {
    if (transformedData && transformedData.length > 0) {
      validateTransformedData();
    }
  }, [transformedData]);

  // Check if we have data to display
  if (!transformedData || transformedData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>No Data Available</AlertTitle>
          There is no transformed data to preview. Please go back to the field mapping step.
        </Alert>
        <Button
          variant="contained"
          startIcon={<NavigateBeforeIcon />}
          onClick={handlePrevStep}
        >
          Back to Field Mapping
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Preview & Validate Data
      </Typography>
      
      {/* Data summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Source File
              </Typography>
              <Typography variant="body1">
                {sourceFile?.name || 'No file'} ({sourceFile?.type})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Records
              </Typography>
              <Typography variant="body1">
                {transformedData.length} records processed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Validation Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isValidating ? (
                  <>
                    <CircularProgress size={20} />
                    <Typography>Validating data...</Typography>
                  </>
                ) : validationErrors.length === 0 ? (
                  <>
                    <CheckCircleOutlineIcon color="success" />
                    <Typography color="success.main">
                      Data validation passed! Ready for export.
                    </Typography>
                  </>
                ) : (
                  <>
                    <WarningAmberIcon color="error" />
                    <Typography color="error">
                      {validationErrors.length} validation {validationErrors.length === 1 ? 'error' : 'errors'} found
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tab navigation for Preview/Validation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="preview and validation tabs">
          <Tab label="Data Preview" id="preview-tab-0" aria-controls="preview-tabpanel-0" />
          <Tab
            label={`Validation & Solutions ${validationErrors.length > 0 ? `(${validationErrors.length})` : ''}`}
            id="preview-tab-1"
            aria-controls="preview-tabpanel-1"
            sx={{ color: validationErrors.length > 0 ? 'error.main' : 'inherit' }}
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Box ref={tableRef}>
          <DataPreviewTable data={transformedData} validationErrors={validationErrors} />
        </Box>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {/* Action panel to fix validation issues */}
        {validationErrors.length > 0 && selectedTool && (
          <ValidationActionPanel
            errors={validationErrors}
            targetFields={[...selectedTool.requiredFields, ...selectedTool.optionalFields]}
            mappings={mappings}
            onAddDefaultValue={handleAddDefaultValue}
            onJumpToMapping={handleJumpToMapping}
          />
        )}

        {/* Detailed validation errors panel */}
        <ValidationErrorsPanel
          errors={validationErrors}
          onJumpToError={handleJumpToError}
        />
      </TabPanel>
      
      {/* Navigation buttons */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={handlePrevStep}
        >
          Back to Field Mapping
        </Button>
        
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          onClick={handleNextStep}
          disabled={validationErrors.length > 0}
        >
          Continue to Export
        </Button>
      </Box>
    </Box>
  );
};

export default PreviewValidationContainer;