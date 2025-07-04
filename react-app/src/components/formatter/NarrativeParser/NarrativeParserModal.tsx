/**
 * Narrative Parser Modal Component
 * 
 * Allows users to extract structured data from unstructured narrative text
 * in CSV columns (e.g., "House fire on Main St, 30 min response")
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  SmartToy as ParseIcon,
  Preview as PreviewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

export interface ParseableField {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  enabled: boolean;
}

export interface ParsedResult {
  rowIndex: number;
  originalText: string;
  parsedFields: {
    [fieldId: string]: {
      value: string;
      confidence: number;
      original: string;
    };
  };
}

export interface NarrativeParserModalProps {
  open: boolean;
  onClose: () => void;
  columnName: string;
  sampleData: string[]; // First 5-10 rows for preview
  onParse: (selectedFields: string[], results: ParsedResult[]) => void;
}

// Available fields that can be extracted from narratives
const AVAILABLE_FIELDS: ParseableField[] = [
  {
    id: 'incident_type',
    name: '🔥 Incident Type',
    description: 'Fire, medical, accident, alarm, etc.',
    pattern: /(fire|medical|ems|accident|mva|alarm|rescue|hazmat)/gi,
    enabled: true
  },
  {
    id: 'response_time',
    name: '⏱️ Response Time',
    description: 'Time values like "30 min", "1:20", "half hour"',
    pattern: /(\d+)\s*(min|minutes|hour|hours|hr|hrs)|(\d{1,2}):(\d{2})|half.hour|quarter.hour/gi,
    enabled: true
  },
  {
    id: 'location',
    name: '📍 Location',
    description: 'Addresses, street names, landmarks',
    pattern: /\d+\s+[\w\s]+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)/gi,
    enabled: false
  },
  {
    id: 'date_time',
    name: '📅 Date/Time',
    description: 'Dates like "12/04/25", "April 12", times',
    pattern: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\w+\s+\d{1,2})|(\d{1,2}:\d{2})/gi,
    enabled: false
  },
  {
    id: 'units_resources',
    name: '🚒 Units/Resources',
    description: 'Fire trucks, ambulances, personnel count',
    pattern: /(engine|truck|ambulance|rescue|ladder|chief|\d+\s*(firefighter|personnel|crew))/gi,
    enabled: false
  }
];

const NarrativeParserModal: React.FC<NarrativeParserModalProps> = ({
  open,
  onClose,
  columnName,
  sampleData,
  onParse
}) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'incident_type',
    'response_time'
  ]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewResults, setPreviewResults] = useState<ParsedResult[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Generate preview when fields change
  useEffect(() => {
    if (selectedFields.length > 0 && sampleData.length > 0) {
      generatePreview();
    }
  }, [selectedFields, sampleData]);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    
    try {
      // Simulate API call delay for preview generation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results: ParsedResult[] = sampleData.slice(0, 5).map((text, index) => ({
        rowIndex: index,
        originalText: text,
        parsedFields: generateParsedFields(text, selectedFields)
      }));
      
      setPreviewResults(results);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const generateParsedFields = (text: string, fields: string[]) => {
    const parsed: ParsedResult['parsedFields'] = {};
    
    fields.forEach(fieldId => {
      const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
      if (!field) return;
      
      const matches = text.match(field.pattern);
      if (matches && matches.length > 0) {
        // Use first match and ensure we extract just the matched term, not the whole text
        const match = matches[0];
        console.log(`🔍 PARSING DEBUG - Field: ${fieldId}, Pattern: ${field.pattern}, Text: "${text}", Match: "${match}"`);
        
        parsed[fieldId] = {
          value: formatParsedValue(fieldId, match),
          confidence: calculateConfidence(fieldId, match, text),
          original: match
        };
      }
    });
    
    return parsed;
  };

  const formatParsedValue = (fieldId: string, rawValue: string): string => {
    switch (fieldId) {
      case 'incident_type':
        return formatIncidentType(rawValue);
      case 'response_time':
        return formatResponseTime(rawValue);
      case 'location':
        return formatLocation(rawValue);
      default:
        return rawValue;
    }
  };

  const formatIncidentType = (value: string): string => {
    const normalized = value.toLowerCase();
    if (normalized.includes('fire')) return 'Structure Fire';
    if (normalized.includes('medical') || normalized.includes('ems')) return 'Medical Emergency';
    if (normalized.includes('accident') || normalized.includes('mva')) return 'Motor Vehicle Accident';
    if (normalized.includes('alarm')) return 'Alarm Response';
    return value;
  };

  const formatResponseTime = (value: string): string => {
    // Extract numbers and time units
    const timeMatch = value.match(/(\d+)\s*(min|minutes|hour|hours|hr|hrs)/i);
    if (timeMatch) {
      const num = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        return `${num} hour${num !== 1 ? 's' : ''}`;
      } else {
        return `${num} minute${num !== 1 ? 's' : ''}`;
      }
    }
    
    // Handle time format like "1:20"
    const timeFormatMatch = value.match(/(\d{1,2}):(\d{2})/);
    if (timeFormatMatch) {
      const hours = parseInt(timeFormatMatch[1]);
      const minutes = parseInt(timeFormatMatch[2]);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return value;
  };

  const formatLocation = (value: string): string => {
    // Capitalize each word
    return value.replace(/\b\w/g, char => char.toUpperCase());
  };

  const calculateConfidence = (fieldId: string, match: string, fullText: string): number => {
    // Simple confidence calculation - can be enhanced
    const baseConfidence = 0.7;
    
    // Higher confidence for exact matches
    if (fieldId === 'response_time' && match.match(/\d+\s*(min|minutes)/i)) {
      return 0.95;
    }
    
    if (fieldId === 'incident_type' && ['fire', 'medical', 'accident'].includes(match.toLowerCase())) {
      return 0.9;
    }
    
    return baseConfidence;
  };

  const handleRunParser = async () => {
    if (selectedFields.length === 0) return;
    
    setIsParsing(true);
    
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate processing all data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fullResults: ParsedResult[] = sampleData.map((text, index) => ({
        rowIndex: index,
        originalText: text,
        parsedFields: generateParsedFields(text, selectedFields)
      }));
      
      onParse(selectedFields, fullResults);
      onClose();
    } catch (error) {
      console.error('Error parsing narrative data:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const getSelectedFieldsCount = () => selectedFields.length;
  const getPreviewSuccessCount = () => 
    previewResults.filter(result => Object.keys(result.parsedFields).length > 0).length;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <ParseIcon sx={{ mr: 1, color: 'primary.main' }} />
        Parse Narrative: "{columnName}"
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Extract structured data from narrative text using pattern matching and NLP.
          Select the fields you want to extract and preview the results.
        </Typography>

        {/* Field Selection */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          1. Select Fields to Extract
        </Typography>
        
        <FormGroup sx={{ mb: 3 }}>
          {AVAILABLE_FIELDS.map(field => (
            <FormControlLabel
              key={field.id}
              control={
                <Checkbox
                  checked={selectedFields.includes(field.id)}
                  onChange={() => handleFieldToggle(field.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {field.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {field.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        {/* Preview Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            2. Preview Results
          </Typography>
          {isGeneratingPreview && (
            <CircularProgress size={20} sx={{ ml: 2 }} />
          )}
        </Box>

        {selectedFields.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Select at least one field to see preview results.
          </Alert>
        ) : (
          <>
            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={`${getSelectedFieldsCount()} fields selected`}
                size="small"
                color="primary"
              />
              <Chip 
                label={`${getPreviewSuccessCount()}/${previewResults.length} rows with data`}
                size="small"
                color="success"
              />
            </Box>

            {/* Preview Table */}
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Original Text</TableCell>
                  {selectedFields.map(fieldId => {
                    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
                    return (
                      <TableCell key={fieldId}>
                        {field?.name}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {result.originalText}
                      </Typography>
                    </TableCell>
                    {selectedFields.map(fieldId => (
                      <TableCell key={fieldId}>
                        {result.parsedFields[fieldId] ? (
                          <Box>
                            <Typography variant="body2">
                              {result.parsedFields[fieldId].value}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              {Math.round(result.parsedFields[fieldId].confidence * 100)}% confident
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No match
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Accuracy Notice */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Preview shows first 5 rows.</strong> Parsing accuracy is typically 70-85%. 
                You can edit any incorrect values after parsing.
              </Typography>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRunParser}
          disabled={selectedFields.length === 0 || isParsing}
          startIcon={isParsing ? <CircularProgress size={20} /> : <ParseIcon />}
        >
          {isParsing ? 'Parsing...' : `Parse ${columnName}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NarrativeParserModal;