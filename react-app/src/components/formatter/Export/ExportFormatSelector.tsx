import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Chip
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface ExportFormatSelectorProps {
  selectedFormat: 'csv' | 'json' | 'excel' | 'pdf';
  onFormatChange: (format: 'csv' | 'json' | 'excel' | 'pdf') => void;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormatChange(event.target.value as 'csv' | 'json' | 'excel');
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Export Format
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="export-format"
            name="export-format"
            value={selectedFormat}
            onChange={handleChange}
          >
            <Box sx={{ mb: 2, p: 1, border: '1px solid', borderColor: selectedFormat === 'csv' ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: selectedFormat === 'csv' ? 'action.hover' : 'transparent' }}>
              <FormControlLabel 
                value="csv" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <TableChartIcon color="primary" />
                    <Typography variant="body1">CSV</Typography>
                    <Chip size="small" label="Most Compatible" color="success" />
                  </Box>
                } 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Comma-separated values format, widely supported by spreadsheet applications like Excel and Google Sheets.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2, p: 1, border: '1px solid', borderColor: selectedFormat === 'json' ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: selectedFormat === 'json' ? 'action.hover' : 'transparent' }}>
              <FormControlLabel 
                value="json" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon color="info" />
                    <Typography variant="body1">JSON</Typography>
                  </Box>
                } 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                JavaScript Object Notation, ideal for programmatic use or importing into other applications.
              </Typography>
            </Box>
            
            <Box sx={{ p: 1, border: '1px solid', borderColor: selectedFormat === 'excel' ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: selectedFormat === 'excel' ? 'action.hover' : 'transparent' }}>
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="success" />
                    <Typography variant="body1">Excel</Typography>
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Export directly to native Excel format (.xlsx) with proper formatting and column sizing.
              </Typography>
            </Box>

            <Box sx={{ p: 1, border: '1px solid', borderColor: selectedFormat === 'pdf' ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: selectedFormat === 'pdf' ? 'action.hover' : 'transparent' }}>
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdfIcon color="error" />
                    <Typography variant="body1">PDF</Typography>
                    <Chip size="small" label="Professional" color="secondary" />
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Create a professional PDF document with formatted data table, ideal for reports and presentations.
              </Typography>
            </Box>
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default ExportFormatSelector;