/**
 * Parsed Fields Display Component
 * 
 * Shows parsed fields as draggable chips under the original column
 */

import React from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  IconButton,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Psychology as AiIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

export interface ParsedField {
  id: string;
  name: string;
  sourceColumn: string;
  parsedCount: number;
  totalRows: number;
  confidence: number;
}

export interface ParsedFieldsDisplayProps {
  parsedFields: ParsedField[];
  onFieldDragStart: (event: React.DragEvent, fieldId: string) => void;
  onDeleteParsedField: (fieldId: string) => void;
}

const ParsedFieldsDisplay: React.FC<ParsedFieldsDisplayProps> = ({
  parsedFields,
  onFieldDragStart,
  onDeleteParsedField
}) => {
  if (parsedFields.length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High confidence';
    if (confidence >= 0.7) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <Box sx={{ mt: 1, ml: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AiIcon sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'medium' }}>
          Parsed Fields
        </Typography>
      </Box>
      
      <Stack spacing={0.5}>
        {parsedFields.map(field => (
          <Box 
            key={field.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Chip
              label={field.name}
              size="small"
              color="secondary"
              variant="outlined"
              draggable
              onDragStart={(e) => {
                e.stopPropagation(); // Prevent parent container drag
                onFieldDragStart(e, field.id);
              }}
              sx={{
                cursor: 'grab',
                '&:active': {
                  cursor: 'grabbing'
                },
                '&:hover': {
                  backgroundColor: 'secondary.50'
                }
              }}
              icon={<AiIcon />}
            />
            
            <Tooltip title={`${field.parsedCount}/${field.totalRows} rows parsed`}>
              <Typography variant="caption" color="text.secondary">
                {Math.round((field.parsedCount / field.totalRows) * 100)}%
              </Typography>
            </Tooltip>
            
            <Tooltip title={getConfidenceLabel(field.confidence)}>
              <SuccessIcon 
                sx={{ 
                  fontSize: 14,
                  color: `${getConfidenceColor(field.confidence)}.main`
                }} 
              />
            </Tooltip>
            
            <Tooltip title="Delete parsed field">
              <IconButton
                size="small"
                onClick={() => onDeleteParsedField(field.id)}
                sx={{ 
                  ml: 0.5,
                  '&:hover': {
                    color: 'error.main'
                  }
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Drag parsed fields to target fields →
      </Typography>
    </Box>
  );
};

export default ParsedFieldsDisplay;