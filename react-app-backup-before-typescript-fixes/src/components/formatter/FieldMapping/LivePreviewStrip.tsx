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
  Paper,
  Divider
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FieldMapping } from '@/types/formatter';
import { transformValue } from '@/services/transformation/fieldTransformer';

interface LivePreviewStripProps {
  sampleData: Record<string, any>[];
  mappings: FieldMapping[];
}

const LivePreviewStrip: React.FC<LivePreviewStripProps> = ({
  sampleData,
  mappings
}) => {
  // Get a sample row (the first one)
  const sampleRow = useMemo(() => {
    return sampleData.length > 0 ? sampleData[0] : null;
  }, [sampleData]);
  
  // Get the transformed row
  const transformedRow = useMemo(() => {
    if (!sampleRow) return null;
    
    const result: Record<string, any> = {};
    
    // Apply mappings
    mappings.forEach(mapping => {
      if (mapping.sourceField && sampleRow[mapping.sourceField] !== undefined) {
        // Get the source value
        let value = sampleRow[mapping.sourceField];
        
        // Apply transformations if any
        if (mapping.transformations && mapping.transformations.length > 0) {
          mapping.transformations.forEach(transform => {
            value = transformValue(value, transform);
          });
        }
        
        // Set the transformed value
        result[mapping.targetField] = value;
      }
    });
    
    return result;
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
  
  // Get source columns to display (up to 6)
  const sourceColumns = Object.keys(sampleRow).slice(0, 6);
  
  // Get target columns to display (up to 6)
  const targetColumns = Object.keys(transformedRow).slice(0, 6);
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Live Preview
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Showing sample data transformation
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Source data */}
        <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {sourceColumns.map(column => (
                  <TableCell key={column}>
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
                  <TableCell key={column}>
                    <Typography variant="caption">
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2 }}>
          <ArrowForwardIcon color="primary" />
        </Box>
        
        {/* Transformed data */}
        <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {targetColumns.map(column => (
                  <TableCell key={column}>
                    <Typography variant="caption" fontWeight="bold">
                      {column}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {targetColumns.map(column => (
                  <TableCell key={column}>
                    <Typography variant="caption">
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