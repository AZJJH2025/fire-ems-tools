import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { FieldMapping } from '@/types/formatter';
import { applyTransformation } from '@/services/transformation/dataTransformer';

interface LiveFieldPreviewProps {
  mapping: FieldMapping | null;
  sampleData: Record<string, any>[];
  onClose?: () => void;
}

/**
 * Component that shows a live preview of field transformations
 * Displays source value -> transformation steps -> result
 */
const LiveFieldPreview: React.FC<LiveFieldPreviewProps> = ({
  mapping,
  sampleData,
  onClose
}) => {
  const theme = useTheme();

  // Get sample values from the first few rows
  const sampleValues = useMemo(() => {
    if (!mapping || !sampleData.length) return [];

    // Take up to 5 sample rows
    return sampleData.slice(0, 5).map(row => ({
      sourceValue: row[mapping.sourceField],
      transformedValue: (mapping.transformations || []).reduce(
        (value, transformation) => applyTransformation(value, transformation, mapping.targetField),
        row[mapping.sourceField]
      )
    }));
  }, [mapping, sampleData]);

  // If no mapping is selected, show empty state
  if (!mapping) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          mt: 2, 
          backgroundColor: alpha(theme.palette.info.light, 0.1),
          border: `1px dashed ${theme.palette.info.main}`,
          borderRadius: 1
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Select a field mapping to see transformation preview
        </Typography>
      </Paper>
    );
  }

  // If no sample data or source field, show empty state
  if (!sampleValues.length || !mapping.sourceField) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          mt: 2, 
          backgroundColor: alpha(theme.palette.warning.light, 0.1),
          border: `1px dashed ${theme.palette.warning.main}`,
          borderRadius: 1
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No sample data available for {mapping.sourceField || 'this field'}
        </Typography>
      </Paper>
    );
  }

  // Get transformation steps (if any)
  const transformationSteps = mapping.transformations || [];
  
  return (
    <Paper
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        position: 'relative'
      }}
    >
      {/* Close button */}
      {onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: theme.palette.grey[500],
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[100], 0.9),
              color: theme.palette.grey[800]
            }
          }}
          aria-label="close preview"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pr: 4 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Field Transformation Preview: {mapping.targetField}
        </Typography>
        <Chip
          size="small"
          label={`${transformationSteps.length} transformation${transformationSteps.length !== 1 ? 's' : ''}`}
          color={transformationSteps.length > 0 ? "primary" : "default"}
          icon={transformationSteps.length > 0 ? <AutoFixHighIcon /> : undefined}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
        {sampleValues.map((sample, index) => {
          const hasSourceValue = sample.sourceValue !== undefined && sample.sourceValue !== null;
          const hasTransformation = transformationSteps.length > 0;
          const sourceType = typeof sample.sourceValue;
          const resultType = typeof sample.transformedValue;
          const typeChanged = sourceType !== resultType;
          
          return (
            <Box 
              key={index}
              sx={{ 
                mb: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: index % 2 === 0 ? alpha(theme.palette.background.default, 0.5) : 'transparent',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* Source value */}
              <Box sx={{ flexBasis: '45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Source ({mapping.sourceField})
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    backgroundColor: hasSourceValue ? alpha(theme.palette.success.light, 0.1) : alpha(theme.palette.error.light, 0.1),
                    p: 0.5,
                    borderRadius: 0.5,
                    wordBreak: 'break-all'
                  }}
                >
                  {hasSourceValue ? String(sample.sourceValue) : '(empty)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sourceType}
                </Typography>
              </Box>
              
              {/* Arrow */}
              <Box sx={{ flexBasis: '10%', textAlign: 'center' }}>
                <ArrowRightAltIcon color={hasTransformation ? "primary" : "action"} />
              </Box>
              
              {/* Result value */}
              <Box sx={{ flexBasis: '45%' }}>
                <Typography variant="caption" color="text.secondary">
                  Result ({mapping.targetField})
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    backgroundColor: sample.transformedValue !== undefined ? alpha(theme.palette.success.light, 0.1) : alpha(theme.palette.error.light, 0.1),
                    p: 0.5,
                    borderRadius: 0.5,
                    wordBreak: 'break-all'
                  }}
                >
                  {sample.transformedValue !== undefined ? String(sample.transformedValue) : '(empty)'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {resultType}
                  </Typography>
                  
                  {typeChanged && (
                    <Chip 
                      size="small" 
                      label={`Type: ${sourceType} → ${resultType}`} 
                      color="warning"
                      variant="outlined"
                      sx={{ height: 16, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
      
      {/* If there are transformation steps, show them */}
      {transformationSteps.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Transformation Steps Applied:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {transformationSteps.map((step, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`
                }}
              >
                <Box sx={{ mr: 1, color: theme.palette.primary.main }}>
                  {index + 1}.
                </Box>
                <Typography variant="body2">
                  <strong>{step.type}:</strong> {' '}
                  {step.type === 'convert' && step.params?.dataType && `Convert to ${step.params.dataType}`}
                  {step.type === 'convert' && step.params?.defaultValue !== undefined && `Set default value to "${step.params.defaultValue}"`}
                  {step.type === 'format' && step.params?.type === 'date' && (step.params?.format || step.params?.dateFormat) && 
                    `Format date as "${step.params.format || step.params.dateFormat}"${step.params.customFormat ? ` (${step.params.customFormat})` : ''}`}
                  {step.type === 'format' && step.params?.pattern && `Format using pattern "${step.params.pattern}"`}
                  {step.type === 'extract' && step.params?.pattern && `Extract using pattern "${step.params.pattern}"`}
                  {step.type === 'replace' && step.params?.from && step.params?.to && `Replace "${step.params.from}" with "${step.params.to}"`}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
      
      {/* Warning if data types don't match expected field type */}
      {mapping.targetField && (
        <Box 
          sx={{ 
            mt: 2,
            p: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 
              sampleValues.some(s => s.transformedValue === undefined || s.transformedValue === null) 
                ? alpha(theme.palette.warning.light, 0.1)
                : alpha(theme.palette.success.light, 0.1)
          }}
        >
          {sampleValues.some(s => s.transformedValue === undefined || s.transformedValue === null) ? (
            <ErrorOutlineIcon color="warning" sx={{ mr: 1 }} />
          ) : (
            <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
          )}
          <Typography variant="body2">
            {sampleValues.some(s => s.transformedValue === undefined || s.transformedValue === null)
              ? 'Some values could not be transformed. Consider adding a default value.'
              : 'All sample values were successfully transformed.'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LiveFieldPreview;