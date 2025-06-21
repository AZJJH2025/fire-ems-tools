import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Collapse
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface ValidationPanelProps {
  validationErrors: {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  jumpToField: (field: string) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ validationErrors, jumpToField }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Count errors vs warnings
  const errorCount = validationErrors.filter(error => error.severity === 'error').length;
  const warningCount = validationErrors.filter(error => error.severity === 'warning').length;
  
  // Toggle expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Paper sx={{ p: 2, position: 'sticky', top: 16 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={toggleExpanded}
      >
        <Typography variant="h6" color={errorCount > 0 ? 'error' : 'warning'}>
          Validation Issues {errorCount > 0 ? `(${errorCount} errors, ${warningCount} warnings)` : `(${warningCount} warnings)`}
        </Typography>
        
        <Button 
          size="small"
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>
      
      <Collapse in={expanded}>
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  bgcolor: error.severity === 'error' ? 'error.lightest' : 'warning.lightest',
                  mb: 0.5,
                  borderRadius: 1
                }}
              >
                <ListItemIcon>
                  {error.severity === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : (
                    <WarningIcon color="warning" />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={error.field}
                  secondary={error.message}
                />
                
                <Button
                  size="small"
                  variant="outlined"
                  color={error.severity === 'error' ? 'error' : 'warning'}
                  onClick={() => jumpToField(error.field)}
                >
                  Go to Field
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ValidationPanel;