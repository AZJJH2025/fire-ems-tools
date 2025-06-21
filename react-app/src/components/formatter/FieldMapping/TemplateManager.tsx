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
  Chip,
  Alert,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import useTemplateSync from '@/hooks/useTemplateSync';
import { MappingTemplate } from './FieldMappingContainer';
import { TemplateService } from '@/services/templateService';
import { FieldMappingTemplate, TemplateSuggestion, FieldMapping, SampleData } from '@/types/formatter';
import { seedVendorTemplates } from '@/services/vendorTemplates';

interface TemplateManagerProps {
  currentTemplate: MappingTemplate;
  setCurrentTemplate: (template: MappingTemplate) => void;
  setTemplateDirty: (dirty: boolean) => void;
  onTemplateApplied?: (template: MappingTemplate) => void;
  disabled?: boolean;
  // New template service integration props
  currentMappings?: FieldMapping[];
  sourceFields?: string[];
  sampleData?: SampleData;
  targetTool?: string;
  onApplyFieldMappings?: (mappings: FieldMapping[]) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  currentTemplate,
  setCurrentTemplate,
  setTemplateDirty,
  onTemplateApplied,
  disabled = false,
  currentMappings = [],
  sourceFields = [],
  sampleData = [],
  targetTool = '',
  onApplyFieldMappings
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
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [cadVendor, setCadVendor] = useState<string>('');
  const [departmentName, setDepartmentName] = useState('');
  
  // Template sync hook
  const { loadTemplates, deleteTemplate, saveToServer } = useTemplateSync(currentTemplate, false);
  
  // Load templates on mount
  useEffect(() => {
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
    
    // Load suggestions using new template service if we have source fields
    if (sourceFields.length > 0 && targetTool && sampleData.length > 0) {
      loadTemplateSuggestions();
    }
  }, [sourceFields, targetTool, sampleData]);
  
  // Load template suggestions using TemplateService
  const loadTemplateSuggestions = () => {
    try {
      const templateSuggestions = TemplateService.suggestTemplates(
        sourceFields,
        sampleData,
        targetTool
      );
      setSuggestions(templateSuggestions);
      
      // Auto-detect CAD vendor
      const detectedVendor = TemplateService.generateCADSignature(sourceFields);
      setCadVendor(detectedVendor);
    } catch (error) {
      console.error('Error loading template suggestions:', error);
    }
  };
  
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
    // Use smart template name if current name is default
    const smartName = currentTemplate.name === 'Untitled Mapping' ? getSmartTemplateName() : currentTemplate.name;
    setTemplateName(smartName);
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
  const handleSaveTemplate = async () => {
    try {
      // If we have current field mappings, save using TemplateService
      if (currentMappings.length > 0 && sourceFields.length > 0 && targetTool) {
        await TemplateService.saveTemplate(
          templateName,
          templateDescription,
          currentMappings,
          sourceFields,
          sampleData,
          targetTool,
          departmentName || undefined,
          cadVendor || undefined
        );
      } else {
        // Fallback to legacy template save
        const updatedTemplate: MappingTemplate = {
          ...currentTemplate,
          name: templateName,
          description: templateDescription,
          lastModified: Date.now()
        };
        
        setCurrentTemplate(updatedTemplate);
        saveToServer();
      }
      
      // Reset dirty flag
      setTemplateDirty(false);
      
      // Refresh templates
      const storedTemplates = loadTemplates();
      setTemplates(storedTemplates);
      
      // Close dialog
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };
  
  // Load template
  const handleLoadTemplate = (template: MappingTemplate) => {
    // Update current template
    setCurrentTemplate(template);
    
    // Reset dirty flag
    setTemplateDirty(false);
    
    // Notify parent component
    if (onTemplateApplied) {
      onTemplateApplied(template);
    }
    
    // Close dialog
    setLoadDialogOpen(false);
  };
  
  // Apply field mapping template from TemplateService
  const handleApplyFieldMappingTemplate = (template: FieldMappingTemplate) => {
    try {
      const appliedMappings = TemplateService.applyTemplate(template, sourceFields);
      if (onApplyFieldMappings) {
        onApplyFieldMappings(appliedMappings);
      }
      setLoadDialogOpen(false);
    } catch (error) {
      console.error('Error applying template:', error);
    }
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get template category based on name/description
  const getTemplateCategory = (template: MappingTemplate): string => {
    const name = template.name.toLowerCase();
    const desc = (template.description || '').toLowerCase();
    const text = `${name} ${desc}`;
    
    if (text.includes('tyler') || text.includes('cad')) return 'CAD System';
    if (text.includes('monthly') || text.includes('export')) return 'Monthly Report';
    if (text.includes('response') || text.includes('time')) return 'Response Time';
    if (text.includes('fire') || text.includes('map')) return 'Fire Map';
    if (text.includes('test') || text.includes('sample')) return 'Test Data';
    return 'General';
  };
  
  // Get category color
  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (category) {
      case 'CAD System': return 'primary';
      case 'Monthly Report': return 'success';
      case 'Response Time': return 'info';
      case 'Fire Map': return 'warning';
      case 'Test Data': return 'secondary';
      default: return 'secondary';
    }
  };
  
  // Group templates by tool and category
  const groupedTemplates = templates.reduce((groups, template) => {
    const key = template.toolId || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(template);
    return groups;
  }, {} as Record<string, MappingTemplate[]>);
  
  // Generate smart template name suggestions
  const getSmartTemplateName = (): string => {
    const toolName = currentTemplate.toolId || 'Tool';
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    if (currentTemplate.mappings.length > 0) {
      // Look for patterns in source field names
      const sourceFields = currentTemplate.mappings.map(m => m.sourceField.toLowerCase());
      if (sourceFields.some(f => f.includes('tyler'))) {
        return `Tyler CAD Export - ${month} ${currentDate.getFullYear()}`;
      }
      if (sourceFields.some(f => f.includes('dispatch') || f.includes('call'))) {
        return `${toolName} Monthly Export - ${month}`;
      }
    }
    
    return `${toolName} Mapping Template`;
  };
  
  return (
    <>
      <Tooltip title={disabled ? "Complete field mapping to access templates" : "Save and load field mapping templates"}>
        <span>
          <Button
            variant="outlined"
            size="small"
            onClick={handleMenuOpen}
            startIcon={<FolderOpenIcon />}
            disabled={disabled}
          >
            Templates
          </Button>
        </span>
      </Tooltip>
      
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
        <MenuItem onClick={() => {
          seedVendorTemplates();
          const storedTemplates = loadTemplates();
          setTemplates(storedTemplates);
          console.log('🌱 Vendor templates seeded manually');
        }}>
          <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
          Load Vendor Templates
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
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Save this field mapping configuration for future use. Templates help you quickly map data from the same source system.
            </Typography>
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., Tyler CAD Monthly Export, Fire Map Pro Standard"
          />
          
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={templateDescription}
            onChange={e => setTemplateDescription(e.target.value)}
            placeholder="e.g., Standard monthly incident export from Tyler Technologies CAD system"
          />
          
          {/* Enhanced template save fields */}
          {currentMappings.length > 0 && (
            <>
              <TextField
                margin="dense"
                label="Department Name (optional)"
                fullWidth
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                placeholder="e.g., Houston Fire Department"
                sx={{ mt: 2 }}
              />
              
              <TextField
                margin="dense"
                label="CAD Vendor"
                fullWidth
                select
                value={cadVendor}
                onChange={e => setCadVendor(e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="Console One">Console One</MenuItem>
                <MenuItem value="Tyler">Tyler Technologies</MenuItem>
                <MenuItem value="Hexagon">Hexagon/Intergraph</MenuItem>
                <MenuItem value="TriTech">TriTech/CentralSquare</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </>
          )}
          
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Template Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tool: {currentTemplate.toolId || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mappings: {currentTemplate.mappings.length} field mappings
              </Typography>
              {currentTemplate.mappings.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sample mappings: {currentTemplate.mappings.slice(0, 3).map(m => `${m.sourceField} → ${m.targetField}`).join(', ')}
                    {currentTemplate.mappings.length > 3 && ` +${currentTemplate.mappings.length - 3} more`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
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
          {/* Template Suggestions Section */}
          {suggestions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AutoAwesome sx={{ mr: 1, fontSize: 20 }} />
                Smart Template Suggestions
                <Chip label={suggestions.length} size="small" sx={{ ml: 1 }} />
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Found {suggestions.length} template{suggestions.length !== 1 ? 's' : ''} that match your data structure. 
                  These are pre-configured for your CAD system type.
                </Typography>
              </Alert>
              
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={suggestion.template.id}
                    component="button"
                    onClick={() => handleApplyFieldMappingTemplate(suggestion.template)}
                    sx={{ 
                      py: 2, 
                      borderRadius: 1, 
                      mb: 1,
                      border: 1,
                      borderColor: suggestion.similarityScore >= 80 ? 'success.main' : 'divider',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {suggestion.template.name}
                            </Typography>
                            {suggestion.template.metadata.tags?.includes('certified') && (
                              <Chip
                                icon={<VerifiedIcon />}
                                label="Certified"
                                color="primary"
                                size="small"
                                variant="filled"
                              />
                            )}
                          </Box>
                          <Chip 
                            label={`${suggestion.similarityScore}% match`}
                            color={suggestion.similarityScore >= 80 ? 'success' : 
                                   suggestion.similarityScore >= 60 ? 'warning' : 'default'}
                            size="small"
                          />
                          {suggestion.template.cadVendor && (
                            <Chip 
                              label={suggestion.template.cadVendor}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {suggestion.template.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Matching fields: {suggestion.matchingFields.join(', ')}
                          </Typography>
                          {suggestion.missingFields.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Missing: {suggestion.missingFields.slice(0, 3).join(', ')}
                              {suggestion.missingFields.length > 3 && ` +${suggestion.missingFields.length - 3} more`}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {templates.length === 0 && suggestions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No saved templates found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Templates save your field mapping configurations for reuse with similar data exports.
              </Typography>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Pro Tip:</strong> After mapping fields for your CAD system, save it as a template. 
                  Next month's export will auto-map instantly!
                </Typography>
              </Alert>
            </Box>
          ) : templates.length > 0 && (
            <Box>
              {suggestions.length > 0 && (
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
                  Your Saved Templates
                </Typography>
              )}
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Found {templates.length} saved template{templates.length !== 1 ? 's' : ''}. 
                  Click any template to apply its field mappings instantly.
                </Typography>
              </Alert>
              
              {Object.entries(groupedTemplates).map(([toolId, toolTemplates]) => (
                <Box key={toolId} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                    {toolId === 'unknown' ? 'General Templates' : `${toolId} Templates`}
                    <Chip 
                      label={toolTemplates.length} 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  
                  <List>
                    {toolTemplates.map(template => (
                      <React.Fragment key={template.id}>
                        <ListItem
                          component="button"
                          onClick={() => handleLoadTemplate(template)}
                          sx={{ 
                            py: 2, 
                            borderRadius: 1, 
                            mb: 1,
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1">
                                  {template.name}
                                </Typography>
                                <Chip 
                                  label={getTemplateCategory(template)}
                                  size="small"
                                  color={getCategoryColor(getTemplateCategory(template))}
                                  variant="outlined"
                                />
                              </Stack>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                {template.description && (
                                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    {template.description}
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <HistoryIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                    {formatDate(template.lastModified)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {template.mappings?.length || 0} field mappings
                                  </Typography>
                                </Stack>
                                {template.mappings && template.mappings.length > 0 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Fields: {template.mappings.slice(0, 2).map(m => m.sourceField).join(', ')}
                                    {template.mappings.length > 2 && ` +${template.mappings.length - 2} more`}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <Tooltip title="Duplicate template">
                              <IconButton 
                                edge="end" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateTemplate(template);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete template">
                              <IconButton 
                                edge="end" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(template.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
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