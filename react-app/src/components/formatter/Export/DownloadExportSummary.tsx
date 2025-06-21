import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DataArrayIcon from '@mui/icons-material/DataArray';
import DataObjectIcon from '@mui/icons-material/DataObject';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

interface DownloadExportSummaryProps {
  dataCount: number;
  fields: string[];
  format: 'csv' | 'json' | 'excel' | 'pdf';
}

const DownloadExportSummary: React.FC<DownloadExportSummaryProps> = ({
  dataCount,
  fields,
  format
}) => {
  // Calculate approximate file size (very rough estimate)
  const getApproxFileSize = (): string => {
    // Different average bytes per field based on format
    let avgBytesPerField = 15; // Default for CSV

    if (format === 'json') {
      // JSON tends to be larger due to field names and formatting
      avgBytesPerField = 25;
    } else if (format === 'excel') {
      // Excel files include formatting overhead
      avgBytesPerField = 30;
    } else if (format === 'pdf') {
      // PDF files include additional formatting, fonts, and metadata
      avgBytesPerField = 40;
    }

    // Calculate total size in bytes
    const totalBytes = dataCount * fields.length * avgBytesPerField;

    // Add base overhead for file format
    let baseOverhead = 0;
    if (format === 'excel') {
      baseOverhead = 5 * 1024; // Excel has ~5KB overhead
    } else if (format === 'pdf') {
      baseOverhead = 15 * 1024; // PDF has larger overhead for fonts, metadata, etc.
    }

    const estimatedSize = totalBytes + baseOverhead;
    
    // Format as KB or MB
    if (estimatedSize < 1024 * 1024) {
      return `${Math.round(estimatedSize / 1024)} KB`;
    } else {
      return `${(estimatedSize / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Get format icon component
  const getFormatIcon = () => {
    switch (format) {
      case 'csv':
        return <DataArrayIcon color="primary" />;
      case 'json':
        return <DataObjectIcon color="info" />;
      case 'excel':
        return <DescriptionIcon color="success" />;
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      default:
        return <DataArrayIcon />;
    }
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Export Summary
        </Typography>
        
        <List disablePadding>
          <ListItem>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              {getFormatIcon()}
            </ListItemIcon>
            <ListItemText 
              primary="Format" 
              secondary={format.toUpperCase()}
            />
          </ListItem>
          
          <Divider component="li" />
          
          <ListItem>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Records" 
              secondary={`${dataCount} records will be exported`}
            />
          </ListItem>
          
          <Divider component="li" />
          
          <ListItem>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Fields" 
              secondary={`${fields.length} fields per record`}
            />
          </ListItem>
          
          <Divider component="li" />
          
          <ListItem>
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Estimated Size" 
              secondary={getApproxFileSize()}
            />
          </ListItem>
        </List>
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Fields included:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {fields.map((field, index) => (
            <Chip key={index} label={field} size="small" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DownloadExportSummary;