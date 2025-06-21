import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { 
  setSourceFile, 
  setSourceColumns, 
  setSampleData,
  setProcessingStatus,
  setCurrentStep 
} from '@/state/redux/formatterSlice';
import { SourceFile, FileType } from '@/types/formatter';
import { parseFile } from '@/services/parser/fileParser';
import { RootState } from '@/state/redux/store';
import ToolSelector from './ToolSelector';

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sourceFile, sourceColumns, selectedTool } = useSelector((state: RootState) => state.formatter);
  
  const [selectedFileType, setSelectedFileType] = useState<FileType>('csv');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  // Handle file type selection
  const handleFileTypeChange = (event: SelectChangeEvent) => {
    setSelectedFileType(event.target.value as FileType);
  };
  
  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFileName(file.name);
    setIsUploading(true);
    setError(null);
    
    try {
      dispatch(setProcessingStatus('uploading'));
      
      // Create source file object
      const sourceFile: SourceFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: selectedFileType,
        size: file.size,
        lastModified: file.lastModified
      };
      
      // Parse the file
      const { columns, data } = await parseFile(file, selectedFileType);
      
      // Update state
      dispatch(setSourceFile(sourceFile));
      dispatch(setSourceColumns(columns));
      dispatch(setSampleData(data));
      dispatch(setProcessingStatus('idle'));
      
      // Move to the next step
      setTimeout(() => {
        dispatch(setCurrentStep(1));
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      dispatch(setProcessingStatus('error'));
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle the button click to open file dialog
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    
    // Update the file input for consistency
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleContinue = () => {
    dispatch(setCurrentStep(1)); // Navigate to mapping step
  };
  
  // Check if can continue to next step
  const canContinue = sourceColumns.length > 0 && selectedTool !== null;
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Upload Data File
      </Typography>
      
      <Typography variant="body1" paragraph>
        Select a file to upload. The formatter supports CSV, Excel (.xlsx, .xls, .xlsm), PDF, JSON, XML, and plain text files.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="file-type-select-label">File Type</InputLabel>
            <Select
              labelId="file-type-select-label"
              id="file-type-select"
              value={selectedFileType}
              label="File Type"
              onChange={handleFileTypeChange}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="excel">Excel (.xlsx/.xls/.xlsm)</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="xml">XML</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="txt">Text File</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept={
              selectedFileType === 'csv' ? '.csv' :
              selectedFileType === 'excel' ? '.xlsx,.xls,.xlsm' :
              selectedFileType === 'json' ? '.json' :
              selectedFileType === 'xml' ? '.xml' :
              selectedFileType === 'pdf' ? '.pdf' :
              selectedFileType === 'txt' ? '.txt' :
              undefined
            }
          />
          
          <Paper
            elevation={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: '#f8f9fa',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
            onClick={handleBrowseClick}
          >
            {isUploading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Processing file...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CloudUploadIcon fontSize="large" color="primary" />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {selectedFileName ? `Selected: ${selectedFileName}` : 'Drag & drop file here or click to browse'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Supports {selectedFileType === 'csv' ? 'CSV' : 
                           selectedFileType === 'excel' ? 'Excel (.xlsx, .xls, .xlsm)' : 
                           selectedFileType === 'json' ? 'JSON' : 
                           selectedFileType === 'xml' ? 'XML' :
                           selectedFileType === 'pdf' ? 'PDF' :
                           'Text'} files
                </Typography>
              </Box>
            )}
          </Paper>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {selectedFileName && !isUploading && !error && (
            <Alert severity="success" sx={{ mt: 2 }}>
              File selected: {selectedFileName}
            </Alert>
          )}
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleBrowseClick}
            startIcon={<CloudUploadIcon />}
            disabled={isUploading}
          >
            Browse Files
          </Button>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Tool selection section */}
      <ToolSelector />
      
      {/* Continue button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<NavigateNextIcon />}
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue to Field Mapping
        </Button>
      </Box>
      
      {/* Helper message if continue button is disabled */}
      {!canContinue && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'right' }}>
          {!sourceColumns.length ? 'Upload a file to continue' : 'Select a target tool to continue'}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;