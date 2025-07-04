import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FieldMapping } from '@/types/formatter';
import { transformData } from '../../../services/transformation/dataTransformer';

interface LivePreviewStripProps {
  sampleData: Record<string, any>[];
  mappings: FieldMapping[];
  toolConfig?: any; // Add tool config to get display names
}

const LivePreviewStrip: React.FC<LivePreviewStripProps> = ({
  sampleData,
  mappings,
  toolConfig
}) => {
  // Get a sample row (the first one)
  const sampleRow = useMemo(() => {
    return sampleData.length > 0 ? sampleData[0] : null;
  }, [sampleData]);
  
  // Get the transformed row using the same logic as the main transformData function
  const transformedRow = useMemo(() => {
    if (!sampleRow || !mappings.length) return null;
    
    // Use the main transformData function to ensure consistency
    const transformedData = transformData([sampleRow], mappings);
    return transformedData.length > 0 ? transformedData[0] : null;
  }, [sampleRow, mappings]);
  
  // No data to preview
  if (!sampleRow || !transformedRow) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No data available for preview. Upload a file and map fields to see a live preview.
        </Typography>
      </Box>
    );
  }
  
  // Get ALL source columns from the sample data
  const sourceColumns = Object.keys(sampleRow);
  
  // Get ALL target columns from the transformed data (all mapped fields)
  const targetColumns = Object.keys(transformedRow);
  
  // Debug logging
  console.log(`🔍 LIVE PREVIEW DEBUG: Transformed row keys:`, targetColumns);
  console.log(`🔍 LIVE PREVIEW DEBUG: Mappings count:`, mappings.length);
  console.log(`🔍 LIVE PREVIEW DEBUG: Mappings:`, mappings.map(m => `${m.sourceField} → ${m.targetField}`));
  console.log(`🔍 LIVE PREVIEW DEBUG: Tool config available:`, !!toolConfig);
  console.log(`🔍 LIVE PREVIEW DEBUG: Field ID → Display Name conversions incoming...`);
  
  // Helper function to get display name for a field ID
  const getFieldDisplayName = (fieldId: string): string => {
    if (!toolConfig) {
      console.log(`🔍 LIVE PREVIEW: No toolConfig for field ${fieldId}`);
      return fieldId;
    }
    
    const allFields = [...(toolConfig.requiredFields || []), ...(toolConfig.optionalFields || [])];
    const field = allFields.find((f: any) => f.id === fieldId);
    
    console.log(`🔍 LIVE PREVIEW: Converting field ID "${fieldId}" → display name "${field ? field.name : fieldId}"`);
    return field ? field.name : fieldId;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Live Preview
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Showing all mapped fields • Scroll horizontally to see more →
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto' }}>
        {/* Source data */}
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            minWidth: '400px',
            maxHeight: '200px',
            overflowX: 'auto'
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {sourceColumns.map(column => (
                  <TableCell key={column} sx={{ minWidth: '120px', whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" fontWeight="bold">
                      {column}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {sourceColumns.map(column => (
                  <TableCell key={column} sx={{ minWidth: '120px' }}>
                    <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                      {sampleRow[column] !== null && sampleRow[column] !== undefined ? 
                        String(sampleRow[column]) : 'null'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Arrow */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          px: 2,
          flexShrink: 0
        }}>
          <ArrowForwardIcon color="primary" />
        </Box>
        
        {/* Transformed data */}
        <TableContainer 
          component={Paper} 
          variant="outlined" 
          sx={{ 
            flex: 1, 
            minWidth: '400px',
            maxHeight: '200px',
            overflowX: 'auto'
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {targetColumns.map(column => (
                  <TableCell key={column} sx={{ minWidth: '120px', whiteSpace: 'nowrap' }}>
                    <Typography variant="caption" fontWeight="bold">
                      {getFieldDisplayName(column)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {targetColumns.map(column => (
                  <TableCell key={column} sx={{ minWidth: '120px' }}>
                    <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                      {transformedRow[column] !== null && transformedRow[column] !== undefined ? 
                        String(transformedRow[column]) : 'null'}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default LivePreviewStrip;