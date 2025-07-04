import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { RootState } from '@/state/redux/store';
import { setSelectedTool } from '@/state/redux/formatterSlice';
import { toolConfigs } from '@/utils/mockToolConfigs';

const ToolSelector: React.FC = () => {
  const dispatch = useDispatch();
  const selectedTool = useSelector((state: RootState) => state.formatter.selectedTool);
  
  const handleToolChange = (event: SelectChangeEvent) => {
    const toolId = event.target.value;
    const tool = toolConfigs.find(t => t.id === toolId);
    
    if (tool) {
      dispatch(setSelectedTool(tool));
    }
  };
  
  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select Target Tool
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="tool-select-label">Tool</InputLabel>
            <Select
              labelId="tool-select-label"
              id="tool-select"
              value={selectedTool?.id || ''}
              label="Tool"
              onChange={handleToolChange}
            >
              {toolConfigs.map(tool => (
                <MenuItem key={tool.id} value={tool.id}>
                  {tool.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid size={12}>
          {selectedTool && (
            <Paper 
              variant="outlined" 
              sx={{ p: 2, mt: 2, borderColor: 'primary.light' }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {selectedTool.name}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {selectedTool.description}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Required fields: {selectedTool.requiredFields.map(f => f.name).join(', ')}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ToolSelector;