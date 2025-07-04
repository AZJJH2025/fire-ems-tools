import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../state/redux/store';
import { updateLayoutElement, removeLayoutElement } from '../../../../state/redux/fireMapProSlice/index';

const PropertiesPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedElement, elements } = useSelector((state: RootState) => {
    const selectedElementId = state.fireMapPro.export.configuration.layout.selectedElementId;
    const layoutElements = state.fireMapPro.export.configuration.layout.elements;
    
    return {
      selectedElement: selectedElementId ? layoutElements.find(el => el.id === selectedElementId) : null,
      elements: layoutElements
    };
  });

  if (!selectedElement) {
    return (
      <Box sx={{ padding: 1, height: '100%', backgroundColor: '#fafafa' }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Properties
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60%',
          color: '#999',
          textAlign: 'center'
        }}>
          <Box sx={{ fontSize: '32px', marginBottom: 1 }}>🎛️</Box>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
            Select an element to edit its properties
          </Typography>
        </Box>
      </Box>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    dispatch(updateLayoutElement({
      id: selectedElement.id,
      updates: { [property]: value }
    }));
  };

  const handleDeleteElement = () => {
    dispatch(removeLayoutElement(selectedElement.id));
  };

  const getElementTypeLabel = (type: string) => {
    switch (type) {
      case 'map': return 'Map Frame';
      case 'title': return 'Title';
      case 'subtitle': return 'Subtitle';
      case 'legend': return 'Legend';
      case 'north-arrow': return 'North Arrow';
      case 'scale-bar': return 'Scale Bar';
      case 'text': return 'Text Box';
      case 'image': return 'Image';
      case 'shape': return 'Shape';
      default: return 'Element';
    }
  };

  return (
    <Box sx={{ 
      padding: 1, 
      height: '100%', 
      backgroundColor: '#fafafa',
      overflowY: 'auto'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Properties
        </Typography>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteElement}
          sx={{ minWidth: 'auto', px: 1 }}
        >
          Del
        </Button>
      </Box>

      <Typography variant="subtitle2" color="primary" gutterBottom>
        {getElementTypeLabel(selectedElement.type)}
      </Typography>

      {/* Position & Size */}
      <Accordion defaultExpanded sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { margin: '8px 0' } }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Position & Size</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 1 }}>
            <TextField
              label="X"
              type="number"
              size="small"
              value={Math.round(selectedElement.x * 100) / 100}
              onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
            <TextField
              label="Y"
              type="number"
              size="small"
              value={Math.round(selectedElement.y * 100) / 100}
              onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 1 }}>
            <TextField
              label="Width"
              type="number"
              size="small"
              value={Math.round(selectedElement.width * 100) / 100}
              onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) || 1)}
              inputProps={{ min: 1, max: 100, step: 0.1 }}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
            <TextField
              label="Height"
              type="number"
              size="small"
              value={Math.round(selectedElement.height * 100) / 100}
              onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value) || 1)}
              inputProps={{ min: 1, max: 100, step: 0.1 }}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
          </Box>
          <Box sx={{ marginBottom: 1 }}>
            <Typography gutterBottom>Layer Order</Typography>
            <Slider
              value={selectedElement.zIndex}
              onChange={(_, value) => handlePropertyChange('zIndex', value)}
              min={1}
              max={elements.length + 5}
              step={1}
              marks
              valueLabelDisplay="on"
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={selectedElement.visible}
                onChange={(e) => handlePropertyChange('visible', e.target.checked)}
              />
            }
            label="Visible"
          />
        </AccordionDetails>
      </Accordion>

      {/* Content Properties */}
      {(selectedElement.type === 'title' || selectedElement.type === 'subtitle' || selectedElement.type === 'text' || selectedElement.type === 'legend') && (
        <Accordion sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { margin: '8px 0' } }}>
            <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {selectedElement.type === 'legend' ? 'Legend Content' : 'Text Content'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 1 }}>
            <TextField
              label={selectedElement.type === 'legend' ? 'Legend Title' : 'Text'}
              multiline
              rows={2}
              fullWidth
              size="small"
              value={selectedElement.content?.text || ''}
              onChange={(e) => handlePropertyChange('content', { ...selectedElement.content, text: e.target.value })}
              sx={{ marginBottom: 1, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 1, marginBottom: 1 }}>
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Font</InputLabel>
                <Select
                  value={selectedElement.content?.fontFamily || 'Arial'}
                  onChange={(e) => handlePropertyChange('content', { ...selectedElement.content, fontFamily: e.target.value })}
                  sx={{ fontSize: '0.85rem' }}
                >
                  <MenuItem value="Arial" sx={{ fontSize: '0.85rem' }}>Arial</MenuItem>
                  <MenuItem value="Times New Roman" sx={{ fontSize: '0.85rem' }}>Times</MenuItem>
                  <MenuItem value="Helvetica" sx={{ fontSize: '0.85rem' }}>Helvetica</MenuItem>
                  <MenuItem value="Georgia" sx={{ fontSize: '0.85rem' }}>Georgia</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Size"
                type="number"
                size="small"
                value={selectedElement.content?.fontSize || 12}
                onChange={(e) => handlePropertyChange('content', { ...selectedElement.content, fontSize: parseInt(e.target.value) || 12 })}
                inputProps={{ min: 6, max: 72 }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 1 }}>
              <FormControl size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Align</InputLabel>
                <Select
                  value={selectedElement.content?.textAlign || 'left'}
                  onChange={(e) => handlePropertyChange('content', { ...selectedElement.content, textAlign: e.target.value })}
                  sx={{ fontSize: '0.85rem' }}
                >
                  <MenuItem value="left" sx={{ fontSize: '0.85rem' }}>Left</MenuItem>
                  <MenuItem value="center" sx={{ fontSize: '0.85rem' }}>Center</MenuItem>
                  <MenuItem value="right" sx={{ fontSize: '0.85rem' }}>Right</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Color"
                type="color"
                size="small"
                value={selectedElement.content?.color || '#000000'}
                onChange={(e) => handlePropertyChange('content', { ...selectedElement.content, color: e.target.value })}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem', p: 0.5 } }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Map Frame Properties */}
      {selectedElement.type === 'map' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Map Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement.showBorder !== false}
                  onChange={(e) => handlePropertyChange('showBorder', e.target.checked)}
                />
              }
              label="Show Border"
              sx={{ marginBottom: 1 }}
            />
            <TextField
              label="Border Width (px)"
              type="number"
              size="small"
              fullWidth
              value={selectedElement.borderWidth || 1}
              onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value) || 1)}
              inputProps={{ min: 0, max: 10 }}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Border Color"
              type="color"
              size="small"
              fullWidth
              value={selectedElement.borderColor || '#000000'}
              onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Legend Properties */}
      {selectedElement.type === 'legend' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Legend Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Title"
              fullWidth
              size="small"
              value={selectedElement.legendTitle || 'Legend'}
              onChange={(e) => handlePropertyChange('legendTitle', e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Style</InputLabel>
              <Select
                value={selectedElement.legendStyle || 'standard'}
                onChange={(e) => handlePropertyChange('legendStyle', e.target.value)}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement.showLegendBorder !== false}
                  onChange={(e) => handlePropertyChange('showLegendBorder', e.target.checked)}
                />
              }
              label="Show Border"
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* North Arrow Properties */}
      {selectedElement.type === 'north-arrow' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">North Arrow Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Style</InputLabel>
              <Select
                value={selectedElement.arrowStyle || 'classic'}
                onChange={(e) => handlePropertyChange('arrowStyle', e.target.value)}
              >
                <MenuItem value="classic">Classic</MenuItem>
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="compass">Compass</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Rotation (degrees)"
              type="number"
              size="small"
              fullWidth
              value={selectedElement.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 360 }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Scale Bar Properties */}
      {selectedElement.type === 'scale-bar' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Scale Bar Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Units</InputLabel>
              <Select
                value={selectedElement.units || 'feet'}
                onChange={(e) => handlePropertyChange('units', e.target.value)}
              >
                <MenuItem value="feet">Feet</MenuItem>
                <MenuItem value="meters">Meters</MenuItem>
                <MenuItem value="miles">Miles</MenuItem>
                <MenuItem value="kilometers">Kilometers</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Style</InputLabel>
              <Select
                value={selectedElement.scaleStyle || 'bar'}
                onChange={(e) => handlePropertyChange('scaleStyle', e.target.value)}
              >
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="alternating">Alternating</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Number of Divisions"
              type="number"
              size="small"
              fullWidth
              value={selectedElement.divisions || 4}
              onChange={(e) => handlePropertyChange('divisions', parseInt(e.target.value) || 4)}
              inputProps={{ min: 2, max: 10 }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Image Properties */}
      {selectedElement.type === 'image' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Image Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* File Upload */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem', color: '#666' }}>
                Upload Image File
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePropertyChange('content', { 
                      ...selectedElement.content, 
                      imageSrc: file 
                    });
                  }
                }}
                style={{ 
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}
              />
              {selectedElement.content?.imageSrc && (selectedElement.content.imageSrc as any) instanceof File && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#666' }}>
                  Selected: {(selectedElement.content.imageSrc as unknown as File).name}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Image URL Alternative */}
            <TextField
              label="Image URL (alternative to file upload)"
              fullWidth
              size="small"
              value={typeof selectedElement.content?.imageSrc === 'string' ? selectedElement.content.imageSrc : ''}
              onChange={(e) => handlePropertyChange('content', { 
                ...selectedElement.content, 
                imageSrc: e.target.value 
              })}
              sx={{ marginBottom: 2, '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
              placeholder="https://example.com/image.jpg"
            />
            
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel sx={{ fontSize: '0.85rem' }}>Image Fit</InputLabel>
              <Select
                value={selectedElement.content?.imageFit || 'cover'}
                onChange={(e) => handlePropertyChange('content', { 
                  ...selectedElement.content, 
                  imageFit: e.target.value 
                })}
                sx={{ fontSize: '0.85rem' }}
              >
                <MenuItem value="cover" sx={{ fontSize: '0.85rem' }}>Cover</MenuItem>
                <MenuItem value="contain" sx={{ fontSize: '0.85rem' }}>Contain</MenuItem>
                <MenuItem value="fill" sx={{ fontSize: '0.85rem' }}>Fill</MenuItem>
                <MenuItem value="scale-down" sx={{ fontSize: '0.85rem' }}>Scale Down</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Alt Text"
              fullWidth
              size="small"
              value={selectedElement.content?.altText || ''}
              onChange={(e) => handlePropertyChange('content', { 
                ...selectedElement.content, 
                altText: e.target.value 
              })}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Shape Properties */}
      {selectedElement.type === 'shape' && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Shape Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl size="small" fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Shape Type</InputLabel>
              <Select
                value={selectedElement.shapeType || 'rectangle'}
                onChange={(e) => handlePropertyChange('shapeType', e.target.value)}
              >
                <MenuItem value="rectangle">Rectangle</MenuItem>
                <MenuItem value="circle">Circle</MenuItem>
                <MenuItem value="ellipse">Ellipse</MenuItem>
                <MenuItem value="triangle">Triangle</MenuItem>
                <MenuItem value="line">Line</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, marginBottom: 2 }}>
              <TextField
                label="Fill Color"
                type="color"
                size="small"
                value={selectedElement.fillColor || '#ffffff'}
                onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Stroke Color"
                type="color"
                size="small"
                value={selectedElement.strokeColor || '#000000'}
                onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              label="Stroke Width (px)"
              type="number"
              size="small"
              fullWidth
              value={selectedElement.strokeWidth || 1}
              onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 1)}
              inputProps={{ min: 0, max: 20 }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      <Divider sx={{ margin: '16px 0' }} />
      
      {/* Element Info */}
      <Box sx={{ fontSize: '12px', color: '#666' }}>
        <Typography variant="caption" display="block">
          Element ID: {selectedElement.id}
        </Typography>
        <Typography variant="caption" display="block">
          Type: {selectedElement.type}
        </Typography>
        <Typography variant="caption" display="block">
          Position: {Math.round(selectedElement.x)}%, {Math.round(selectedElement.y)}%
        </Typography>
        <Typography variant="caption" display="block">
          Size: {Math.round(selectedElement.width)}% × {Math.round(selectedElement.height)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;