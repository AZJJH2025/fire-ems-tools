import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useTemplateSync from '@/hooks/useTemplateSync';
import { MappingTemplate } from './FieldMappingContainer';

interface TemplateManagerProps {
  currentTemplate: MappingTemplate;
  setCurrentTemplate: (template: MappingTemplate) => void;
  setTemplateDirty: (dirty: boolean) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  currentTemplate,
  setCurrentTemplate,
  setTemplateDirty
}) => {
  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  
  // Template name in save dialog
  const [templateName, setTemplateName] = useState(currentTemplate.name);
  const [templateDescription, setTemplateDescription] = useState(currentTemplate.description || '');
  
  // Available templates
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  
  // Template sync hook
  const { loadTemplates, deleteTemplate, saveToServer } = useTemplateSync(currentTemplate, false);
  
  // Load templates on mount
  useEffect(() => {
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
  }, []);
  
  // Open menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  // Open save dialog
  const handleOpenSaveDialog = () => {
    setTemplateName(currentTemplate.name);
    setTemplateDescription(currentTemplate.description || '');
    setSaveDialogOpen(true);
    handleMenuClose();
  };
  
  // Open load dialog
  const handleOpenLoadDialog = () => {
    // Refresh templates list
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
    
    setLoadDialogOpen(true);
    handleMenuClose();
  };
  
  // Save template
  const handleSaveTemplate = () => {
    // Create a copy of the current template with updated name and description
    const updatedTemplate: MappingTemplate = {
      ...currentTemplate,
      name: templateName,
      description: templateDescription,
      lastModified: Date.now()
    };
    
    // Update current template
    setCurrentTemplate(updatedTemplate);
    
    // Save to server
    saveToServer();
    
    // Reset dirty flag
    setTemplateDirty(false);
    
    // Close dialog
    setSaveDialogOpen(false);
  };
  
  // Load template
  const handleLoadTemplate = (template: MappingTemplate) => {
    // Update current template
    setCurrentTemplate(template);
    
    // Reset dirty flag
    setTemplateDirty(false);
    
    // Close dialog
    setLoadDialogOpen(false);
  };
  
  // Delete template
  const handleDeleteTemplate = (templateId: string) => {
    // Delete template
    deleteTemplate(templateId);
    
    // Refresh templates list
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
  };
  
  // Duplicate template
  const handleDuplicateTemplate = (template: MappingTemplate) => {
    // Create a copy with a new ID and updated name
    const duplicatedTemplate: MappingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastModified: Date.now()
    };
    
    // Save the duplicated template
    localStorage.setItem(`tmpl:${duplicatedTemplate.id}`, JSON.stringify(duplicatedTemplate));
    
    // Refresh templates list
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleMenuOpen}
        startIcon={<FolderOpenIcon />}
      >
        Templates
      </Button>
      
      {/* Template Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenSaveDialog}>
          <SaveIcon fontSize="small" sx={{ mr: 1 }} />
          Save Template As...
        </MenuItem>
        <MenuItem onClick={handleOpenLoadDialog}>
          <FolderOpenIcon fontSize="small" sx={{ mr: 1 }} />
          Load Template
        </MenuItem>
      </Menu>
      
      {/* Save Template Dialog */}
      <Dialog 
        open={saveDialogOpen} 
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Mapping Template</DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={templateDescription}
            onChange={e => setTemplateDescription(e.target.value)}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Load Template Dialog */}
      <Dialog 
        open={loadDialogOpen} 
        onClose={() => setLoadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load Mapping Template</DialogTitle>
        
        <DialogContent>
          {templates.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No saved templates found.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create and save a template to see it here.
              </Typography>
            </Box>
          ) : (
            <List>
              {templates.map(template => (
                <React.Fragment key={template.id}>
                  <ListItem
                    button
                    onClick={() => handleLoadTemplate(template)}
                    sx={{ py: 2 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {template.name}
                          {template.toolId && (
                            <Typography 
                              component="span" 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              ({template.toolId})
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {template.description && (
                            <Typography variant="body2">
                              {template.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Last modified: {formatDate(template.lastModified)}
                            {template.mappings && (
                              ` • ${template.mappings.length} mappings`
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDuplicateTemplate(template)}
                        sx={{ mr: 1 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplateManager;