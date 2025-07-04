import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { FieldMapping, FieldTransformation } from '@/types/formatter';

interface FieldTransformationSettingsProps {
  open: boolean;
  onClose: () => void;
  fieldName: string;
  mapping?: FieldMapping;
  sampleData: Record<string, any>[];
  onSave: (fieldName: string, transformations: FieldTransformation[]) => void;
}

const FieldTransformationSettings: React.FC<FieldTransformationSettingsProps> = ({
  open,
  onClose,
  fieldName,
  mapping,
  sampleData,
  onSave
}) => {
  // Current tab
  const [tab, setTab] = useState(0);
  
  // Sample data values for the mapped source field
  const [sampleValues, setSampleValues] = useState<any[]>([]);
  
  // Date format transformation settings
  const [dateFormat, setDateFormat] = useState('auto');
  const [customDateFormat, setCustomDateFormat] = useState('');
  
  // Split/join transformation settings
  const [splitDelimiter, setSplitDelimiter] = useState(',');
  const [splitIndex, setSplitIndex] = useState(0);
  
  // Type conversion settings
  const [convertToType, setConvertToType] = useState('string');
  
  // Initialize transformations from current mapping
  useEffect(() => {
    if (!mapping) return;
    
    // Get sample values for the source field
    if (mapping.sourceField && sampleData.length > 0) {
      const values = sampleData
        .map(item => item[mapping.sourceField])
        .filter(value => value !== undefined && value !== null)
        .slice(0, 5);
      
      setSampleValues(values);
    }
    
    // Load existing transformations
    if (mapping.transformations && mapping.transformations.length > 0) {
      mapping.transformations.forEach(transform => {
        switch (transform.type) {
          case 'format':
            // Handle both old format (dateFormat) and new format (format) parameters
            const formatValue = transform.params.format || transform.params.dateFormat;
            if (formatValue) {
              if (formatValue === 'custom') {
                setDateFormat('custom');
                setCustomDateFormat(transform.params.customFormat || '');
              } else {
                setDateFormat(formatValue);
              }
            }
            break;
          case 'split':
            setSplitDelimiter(transform.params.delimiter || ',');
            setSplitIndex(transform.params.index || 0);
            break;
          case 'convert':
            setConvertToType(transform.params.toType || 'string');
            break;
        }
      });
    }
  }, [mapping, sampleData]);
  
  // Change tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
  // Handle save
  const handleSave = () => {
    const transformations: FieldTransformation[] = [];
    
    // Add date format transformation if not auto
    if (tab === 0 && dateFormat !== 'auto') {
      transformations.push({
        type: 'format',
        params: {
          type: 'date', // Add the type field that the processor expects
          format: dateFormat, // Use 'format' instead of 'dateFormat' to match processor
          fieldName, // Include field name for context-aware transformations
          ...(dateFormat === 'custom' ? { customFormat: customDateFormat } : {})
        }
      });
    }
    
    // Add split transformation
    if (tab === 1) {
      transformations.push({
        type: 'split',
        params: {
          delimiter: splitDelimiter,
          index: splitIndex
        }
      });
    }
    
    // Add convert transformation
    if (tab === 2) {
      transformations.push({
        type: 'convert',
        params: {
          toType: convertToType
        }
      });
    }
    
    onSave(fieldName, transformations);
  };
  
  // Check if fields can be previewed
  const canPreview = sampleValues.length > 0;
  
  // Preview transformation results
  const getPreviewResults = () => {
    if (!canPreview) return [];
    
    switch (tab) {
      case 0: // Date format
        return sampleValues.map(value => {
          if (!value) return 'N/A';
          
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            // Check if original value contains time component (HH:MM:SS pattern)
            // const originalStr = String(value);
            // const hasTimeComponent = /\d{1,2}:\d{2}(:\d{2})?/.test(originalStr);
            
            // Determine if time should be preserved based on field name and user intent
            // const fieldNameLower = fieldName.toLowerCase();
            // const isDateField = fieldNameLower.includes('date') && !fieldNameLower.includes('time');
            // const shouldPreserveTime = hasTimeComponent && !isDateField;
            
            // Helper function to format time component
            // const formatTime = (d: Date) => {
            //   const hours = d.getHours().toString().padStart(2, '0');
            //   const minutes = d.getMinutes().toString().padStart(2, '0');
            //   const seconds = d.getSeconds().toString().padStart(2, '0');
            //   return `${hours}:${minutes}:${seconds}`;
            // };
            
            switch (dateFormat) {
              case 'auto':
                return date.toLocaleString();
              case 'MM/DD/YYYY':
                // Always strip time for explicit date-only formats
                const mmddyyyy = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                return mmddyyyy;
              case 'YYYY-MM-DD':
                // Always strip time for explicit date-only formats
                const yyyymmdd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                return yyyymmdd;
              case 'DD/MM/YYYY':
                // Always strip time for explicit date-only formats
                const ddmmyyyy = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                return ddmmyyyy;
              case 'date-only':
                // Strip time and use original date format but date-only
                const originalDate = new Date(value);
                return originalDate.toLocaleDateString();
              case 'custom':
                // Very basic custom formatting - would need a full library in production
                return customDateFormat
                  .replace('YYYY', date.getFullYear().toString())
                  .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
                  .replace('DD', date.getDate().toString().padStart(2, '0'))
                  .replace('HH', date.getHours().toString().padStart(2, '0'))
                  .replace('mm', date.getMinutes().toString().padStart(2, '0'))
                  .replace('ss', date.getSeconds().toString().padStart(2, '0'));
              default:
                return date.toLocaleString();
            }
          } catch (e) {
            return 'Error formatting date';
          }
        });
      
      case 1: // Split
        return sampleValues.map(value => {
          if (!value) return 'N/A';
          
          try {
            const parts = value.toString().split(splitDelimiter);
            return parts[splitIndex] || `Index ${splitIndex} not found`;
          } catch (e) {
            return 'Error splitting value';
          }
        });
      
      case 2: // Convert
        return sampleValues.map(value => {
          if (value === undefined || value === null) return 'N/A';
          
          try {
            switch (convertToType) {
              case 'string':
                return String(value);
              case 'number':
                return Number(value);
              case 'boolean':
                return Boolean(value).toString();
              default:
                return String(value);
            }
          } catch (e) {
            return 'Error converting value';
          }
        });
    }
    
    return [];
  };
  
  // Get preview results
  const previewResults = getPreviewResults();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Transform Field: {fieldName}
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tab} 
              onChange={handleTabChange}
              aria-label="transformation tabs"
            >
              <Tab label="Date/Time Format" />
              <Tab label="Split/Extract" />
              <Tab label="Type Conversion" />
            </Tabs>
          </Box>
          
          {/* Date Format Tab */}
          <Box role="tabpanel" hidden={tab !== 0} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Date Format Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose how date and time values should be formatted. Date-only formats automatically strip time components.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="date-format-label">Date Format</InputLabel>
              <Select
                labelId="date-format-label"
                id="date-format-select"
                value={dateFormat}
                label="Date Format"
                onChange={e => setDateFormat(e.target.value)}
              >
                <MenuItem value="auto">Auto-detect</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (date only)</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (date only)</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (date only)</MenuItem>
                <MenuItem value="date-only">Date Only (strip time)</MenuItem>
                <MenuItem value="custom">Custom Format</MenuItem>
              </Select>
            </FormControl>
            
            {dateFormat === 'custom' && (
              <TextField
                fullWidth
                label="Custom Format"
                value={customDateFormat}
                onChange={e => setCustomDateFormat(e.target.value)}
                helperText="Use YYYY for year, MM for month, DD for day, HH for hour, mm for minute, ss for second"
                sx={{ mb: 2 }}
              />
            )}
          </Box>
          
          {/* Split/Extract Tab */}
          <Box role="tabpanel" hidden={tab !== 1} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Split or Extract Value
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Split a field by a delimiter and extract a specific part.
            </Typography>
            
            <TextField
              fullWidth
              label="Delimiter"
              value={splitDelimiter}
              onChange={e => setSplitDelimiter(e.target.value)}
              helperText="Character or text that separates the parts"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Index"
              type="number"
              value={splitIndex}
              onChange={e => setSplitIndex(parseInt(e.target.value) || 0)}
              helperText="Position of the part to extract (0 = first part)"
              sx={{ mb: 2 }}
            />
          </Box>
          
          {/* Type Conversion Tab */}
          <Box role="tabpanel" hidden={tab !== 2} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Type Conversion
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Convert the value to a different data type.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="convert-type-label">Convert To</InputLabel>
              <Select
                labelId="convert-type-label"
                id="convert-type-select"
                value={convertToType}
                label="Convert To"
                onChange={e => setConvertToType(e.target.value)}
              >
                <MenuItem value="string">Text (String)</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="boolean">True/False (Boolean)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Preview Section - Visible for all tabs */}
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Preview
          </Typography>
          
          {canPreview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ width: '50%' }}>
                  Original Value
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ width: '50%' }}>
                  Transformed Value
                </Typography>
              </Box>
              
              {sampleValues.map((value, index) => (
                <Box key={index} sx={{ display: 'flex', py: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2" sx={{ width: '50%' }}>
                    {value === null || value === undefined ? 'Null/Empty' : String(value)}
                  </Typography>
                  <Typography variant="body2" sx={{ width: '50%' }}>
                    {previewResults[index]}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No sample data available for preview.
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Apply Transformation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldTransformationSettings;