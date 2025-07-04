/**
 * Layer Manager Component
 * 
 * Manages all map layers with drag-and-drop reordering, visibility controls,
 * and layer-specific settings.
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Collapse,
  Switch,
  Slider,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import {
  Layers as LayersIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandLess,
  ExpandMore,
  Map as MapIcon
} from '@mui/icons-material';

import {
  selectLayers,
  toggleLayerVisibility,
  updateLayerOpacity,
  addLayer,
  updateLayer,
  deleteLayer
} from '@/state/redux/fireMapProSlice';
import { MapLayer, LayerType } from '@/types/fireMapPro';

const LayerManager: React.FC = () => {
  const dispatch = useDispatch();
  const layers = useSelector(selectLayers);
  
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    layerId: string;
  } | null>(null);
  const [createLayerDialog, setCreateLayerDialog] = useState(false);
  const [editLayerDialog, setEditLayerDialog] = useState<string | null>(null);

  // Layer creation/editing state
  const [layerForm, setLayerForm] = useState({
    name: '',
    type: 'feature' as LayerType,
    opacity: 1,
    visible: true
  });

  const handleToggleLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      dispatch(toggleLayerVisibility({ layerId, visible: !layer.visible }));
    }
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    dispatch(updateLayerOpacity({ layerId, opacity: opacity / 100 }));
  };


  const handleExpandLayer = (layerId: string) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const handleContextMenu = (event: React.MouseEvent, layerId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      layerId
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateLayer = () => {
    const newLayer: Omit<MapLayer, 'id'> = {
      name: layerForm.name || 'New Layer',
      visible: layerForm.visible,
      opacity: layerForm.opacity,
      zIndex: layers.length,
      type: layerForm.type,
      features: [],
      metadata: {
        description: '',
        source: 'User Created',
        created: new Date(),
        featureCount: 0
      }
    };
    
    dispatch(addLayer(newLayer));
    setCreateLayerDialog(false);
    setLayerForm({ name: '', type: 'feature', opacity: 1, visible: true });
  };

  const handleEditLayer = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      setLayerForm({
        name: layer.name,
        type: layer.type,
        opacity: layer.opacity,
        visible: layer.visible
      });
      setEditLayerDialog(layerId);
    }
    handleCloseContextMenu();
  };

  const handleUpdateLayer = () => {
    if (editLayerDialog) {
      dispatch(updateLayer({
        layerId: editLayerDialog,
        updates: {
          name: layerForm.name,
          type: layerForm.type,
          opacity: layerForm.opacity,
          visible: layerForm.visible
        }
      }));
      setEditLayerDialog(null);
      setLayerForm({ name: '', type: 'feature', opacity: 1, visible: true });
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    dispatch(deleteLayer(layerId));
    handleCloseContextMenu();
  };

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'base':
        return <MapIcon />;
      case 'overlay':
        return <LayersIcon />;
      case 'reference':
        return <MapIcon />;
      default:
        return <LayersIcon />;
    }
  };

  const getLayerTypeColor = (type: LayerType) => {
    switch (type) {
      case 'base':
        return 'primary';
      case 'overlay':
        return 'secondary';
      case 'reference':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LayersIcon />
          Layers
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setCreateLayerDialog(true)}
          size="small"
          variant="outlined"
        >
          Add
        </Button>
      </Box>

      {/* Layers List */}
      <List dense>
        {layers.map((layer, _index) => (
          <React.Fragment key={layer.id}>
            <ListItem
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper'
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DragIcon sx={{ cursor: 'grab', color: 'text.disabled' }} />
              </ListItemIcon>
              
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getLayerIcon(layer.type)}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {layer.name}
                    </Typography>
                    <Chip
                      label={layer.type}
                      size="small"
                      color={getLayerTypeColor(layer.type) as any}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={`${layer.features.length} features`}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleLayer(layer.id)}
                  color={layer.visible ? 'primary' : 'default'}
                >
                  {layer.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleExpandLayer(layer.id)}
                >
                  {expandedLayers.has(layer.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>

                <IconButton
                  size="small"
                  onClick={(e) => handleContextMenu(e, layer.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </ListItem>

            {/* Layer Details */}
            <Collapse in={expandedLayers.has(layer.id)} timeout="auto">
              <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Opacity: {Math.round(layer.opacity * 100)}%
                </Typography>
                <Slider
                  value={layer.opacity * 100}
                  onChange={(_, value) => handleOpacityChange(layer.id, value as number)}
                  min={0}
                  max={100}
                  size="small"
                  sx={{ mb: 1 }}
                />
                
                {layer.metadata.description && (
                  <Typography variant="caption" color="text.secondary">
                    {layer.metadata.description}
                  </Typography>
                )}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      {layers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No layers yet. Create your first layer to get started.
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => contextMenu && handleEditLayer(contextMenu.layerId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Layer</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => contextMenu && handleDeleteLayer(contextMenu.layerId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Layer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Layer Dialog */}
      <Dialog open={createLayerDialog} onClose={() => setCreateLayerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Layer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layer Name"
            fullWidth
            variant="outlined"
            value={layerForm.name}
            onChange={(e) => setLayerForm({ ...layerForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Layer Type</InputLabel>
            <Select
              value={layerForm.type}
              label="Layer Type"
              onChange={(e) => setLayerForm({ ...layerForm, type: e.target.value as LayerType })}
            >
              <MenuItem value="feature">Feature Layer</MenuItem>
              <MenuItem value="overlay">Overlay Layer</MenuItem>
              <MenuItem value="reference">Reference Layer</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Visible:</Typography>
            <Switch
              checked={layerForm.visible}
              onChange={(e) => setLayerForm({ ...layerForm, visible: e.target.checked })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateLayerDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateLayer} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Layer Dialog */}
      <Dialog open={editLayerDialog !== null} onClose={() => setEditLayerDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Layer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layer Name"
            fullWidth
            variant="outlined"
            value={layerForm.name}
            onChange={(e) => setLayerForm({ ...layerForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Layer Type</InputLabel>
            <Select
              value={layerForm.type}
              label="Layer Type"
              onChange={(e) => setLayerForm({ ...layerForm, type: e.target.value as LayerType })}
            >
              <MenuItem value="feature">Feature Layer</MenuItem>
              <MenuItem value="overlay">Overlay Layer</MenuItem>
              <MenuItem value="reference">Reference Layer</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Visible:</Typography>
            <Switch
              checked={layerForm.visible}
              onChange={(e) => setLayerForm({ ...layerForm, visible: e.target.checked })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditLayerDialog(null)}>Cancel</Button>
          <Button onClick={handleUpdateLayer} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LayerManager;