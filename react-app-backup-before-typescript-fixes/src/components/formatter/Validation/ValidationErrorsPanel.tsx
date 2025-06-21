import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ValidationError } from '@/types/formatter';
import { groupErrorsByField, getErrorStats } from '@/services/validation/dataValidator';

interface ValidationErrorsPanelProps {
  errors: ValidationError[];
  onJumpToError?: (rowIndex: number, field: string) => void;
}

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
      id={`validation-tabpanel-${index}`}
      aria-labelledby={`validation-tab-${index}`}
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

const ValidationErrorsPanel: React.FC<ValidationErrorsPanelProps> = ({ 
  errors, 
  onJumpToError 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Group errors by field for easier review
  const errorsByField = groupErrorsByField(errors);
  const errorStats = getErrorStats(errors);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter errors based on search term
  const filteredErrors = errors.filter(error => 
    error.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get filtered errors by field
  const filteredErrorsByField: Record<string, ValidationError[]> = {};
  filteredErrors.forEach(error => {
    if (!filteredErrorsByField[error.field]) {
      filteredErrorsByField[error.field] = [];
    }
    filteredErrorsByField[error.field].push(error);
  });

  // Create error type labels with colors
  const getErrorTypeChip = (type: string) => {
    let color: 'error' | 'warning' | 'info' | 'default' = 'default';
    
    switch (type) {
      case 'required':
        color = 'error';
        break;
      case 'pattern':
      case 'min':
      case 'max':
        color = 'warning';
        break;
      case 'oneOf':
      case 'custom':
        color = 'info';
        break;
    }
    
    return <Chip size="small" label={type} color={color} />;
  };

  return (
    <Paper sx={{ p: 0, mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: errors.length > 0 ? '#ffebee' : '#e8f5e9', borderRadius: '4px 4px 0 0' }}>
        <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorOutlineIcon />
          Validation Results
          <Chip 
            label={`${errors.length} ${errors.length === 1 ? 'error' : 'errors'}`} 
            color={errors.length > 0 ? 'error' : 'success'}
            sx={{ ml: 2 }}
          />
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="validation tabs">
          <Tab label="Summary" id="validation-tab-0" aria-controls="validation-tabpanel-0" />
          <Tab label="By Field" id="validation-tab-1" aria-controls="validation-tabpanel-1" />
          <Tab label="All Errors" id="validation-tab-2" aria-controls="validation-tabpanel-2" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {errors.length === 0 ? (
          <Alert severity="success">
            No validation errors found. Your data is ready for export!
          </Alert>
        ) : (
          <>
            <Alert severity="warning">
              Found {errors.length} validation {errors.length === 1 ? 'error' : 'errors'} that need to be addressed before export.
            </Alert>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Error Distribution by Field
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.entries(errorStats.byField).map(([field, count]) => (
                  <Chip 
                    key={field}
                    label={`${field}: ${count}`}
                    color="error"
                    variant="outlined"
                    onClick={() => setTabValue(1)} // Switch to "By Field" tab
                  />
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Error Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(errorStats.byType).map(([type, count]) => (
                  <Chip 
                    key={type}
                    label={`${type}: ${count}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TextField
          fullWidth
          placeholder="Search errors by field or message"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {Object.keys(filteredErrorsByField).length === 0 ? (
          <Alert severity="info">No errors match your search criteria.</Alert>
        ) : (
          Object.entries(filteredErrorsByField).map(([field, fieldErrors]) => (
            <Accordion key={field} defaultExpanded={Object.keys(filteredErrorsByField).length === 1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography>{field}</Typography>
                  <Chip 
                    size="small" 
                    label={fieldErrors.length} 
                    color="error" 
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense disablePadding>
                  {fieldErrors.map((error, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem
                        secondaryAction={
                          error.rowIndex !== undefined && onJumpToError && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => onJumpToError(error.rowIndex, error.field)}
                            >
                              Jump to Row
                            </Button>
                          )
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {error.message}
                              {getErrorTypeChip(error.type)}
                            </Box>
                          }
                          secondary={error.rowIndex !== undefined ? `Row ${error.rowIndex + 1}` : 'Global error'}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <TextField
          fullWidth
          placeholder="Search errors by field or message"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <List dense>
          {filteredErrors.length === 0 ? (
            <Alert severity="info">No errors match your search criteria.</Alert>
          ) : (
            filteredErrors.map((error, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    error.rowIndex !== undefined && onJumpToError && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => onJumpToError(error.rowIndex, error.field)}
                      >
                        Jump to Row
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" sx={{ fontWeight: 500 }}>
                          {error.field}:
                        </Typography>
                        {error.message}
                        {getErrorTypeChip(error.type)}
                      </Box>
                    }
                    secondary={error.rowIndex !== undefined ? `Row ${error.rowIndex + 1}` : 'Global error'}
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </TabPanel>
    </Paper>
  );
};

export default ValidationErrorsPanel;