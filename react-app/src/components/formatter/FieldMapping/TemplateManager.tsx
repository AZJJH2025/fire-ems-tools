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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import Share from '@mui/icons-material/Share';
import useTemplateSync from '@/hooks/useTemplateSync';
import { TemplateService } from '@/services/templateService';
import { FieldMappingTemplate, TemplateSuggestion, FieldMapping, SampleData } from '@/types/formatter';
import { seedVendorTemplates } from '@/services/vendorTemplates';
import TemplateSharing from './TemplateSharing';

interface TemplateManagerProps {
  currentTemplate: FieldMappingTemplate;
  setCurrentTemplate: (template: FieldMappingTemplate) => void;
  setTemplateDirty: (dirty: boolean) => void;
  onTemplateApplied?: (template: FieldMappingTemplate) => void;
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
  onTemplateApplied: _onTemplateApplied,
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
  const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
  
  // Template name in save dialog
  const [templateName, setTemplateName] = useState(currentTemplate.name);
  const [templateDescription, setTemplateDescription] = useState(currentTemplate.description || '');
  
  // Available templates
  const [templates, setTemplates] = useState<FieldMappingTemplate[]>([]);
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  
  // Enhanced template browsing state
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
  
  // Save template with enhanced features
  const handleSaveTemplate = async () => {
    try {
      // Check if template name already exists
      const existingTemplate = templates.find(t => t.name === templateName);
      
      if (existingTemplate && existingTemplate.id !== currentTemplate.id) {
        // Ask user if they want to create a new version or overwrite
        const shouldCreateVersion = window.confirm(
          `A template named "${templateName}" already exists. ` +
          'Click OK to create a new version, or Cancel to overwrite the existing template.'
        );
        
        if (shouldCreateVersion) {
          const version = existingTemplate.metadata?.version || '1.0.0';
          const [major, minor, patch] = version.split('.').map(Number);
          const newVersion = `${major}.${minor}.${patch + 1}`;
          
          // Update template name to include version
          const versionedName = `${templateName} (v${newVersion})`;
          setTemplateName(versionedName);
        }
      }

      // If we have current field mappings, save using TemplateService
      if (currentMappings.length > 0 && sourceFields.length > 0 && targetTool) {
        const savedTemplate = await TemplateService.saveTemplate(
          templateName,
          templateDescription,
          currentMappings,
          sourceFields,
          sampleData,
          targetTool,
          departmentName || undefined,
          cadVendor || undefined
        );
        
        console.log(`✅ Template saved with quality score: ${savedTemplate.metadata?.qualityScore || 0}%`);
        console.log(`🏷️ Auto-generated tags: ${savedTemplate.metadata.tags?.join(', ')}`);
      } else {
        // Fallback to legacy template save
        const updatedTemplate: FieldMappingTemplate = {
          ...currentTemplate,
          name: templateName,
          description: templateDescription,
          lastUsed: new Date().toISOString()
        };
        
        setCurrentTemplate(updatedTemplate);
        saveToServer();
      }
      
      // Reset dirty flag
      setTemplateDirty(false);
      
      // Refresh templates
      const storedTemplates = loadTemplates();
      setTemplates(storedTemplates);
      
      // Close dialog and show success message
      setSaveDialogOpen(false);
      
      // Optional: Show success toast or snackbar
      console.log(`🎉 Template "${templateName}" saved successfully!`);
      
    } catch (error) {
      console.error('Error saving template:', error);
      // Optional: Show error message to user
      alert(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
  const handleDuplicateTemplate = (template: FieldMappingTemplate) => {
    // Create a copy with a new ID and updated name
    const duplicatedTemplate: FieldMappingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastUsed: new Date().toISOString()
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
  const getTemplateCategory = (template: FieldMappingTemplate): string => {
    const name = template.name.toLowerCase();
    const desc = (template.description || '').toLowerCase();
    const text = `${name} ${desc}`;
    
    // Check if it's a vendor template (starts with vendor_ or has certified tag)
    if (template.id.startsWith('vendor_') || template.metadata?.tags?.includes('certified')) {
      return 'Vendor';
    }
    
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
      case 'Vendor': return 'primary';
      case 'CAD System': return 'primary';
      case 'Monthly Report': return 'success';
      case 'Response Time': return 'info';
      case 'Fire Map': return 'warning';
      case 'Test Data': return 'secondary';
      default: return 'secondary';
    }
  };
  
  // Filter and search templates
  const filteredTemplates = templates.filter(template => {
    // Filter by category
    if (templateFilter !== 'all') {
      const category = getTemplateCategory(template);
      if (category !== templateFilter) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = template.name.toLowerCase().includes(query);
      const matchesDescription = template.description?.toLowerCase().includes(query);
      const matchesTags = template.metadata?.tags?.some(tag => tag.toLowerCase().includes(query));
      const matchesDepartment = template.departmentName?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesDescription && !matchesTags && !matchesDepartment) {
        return false;
      }
    }
    
    return true;
  });

  // Group filtered templates by tool and category
  const groupedTemplates = filteredTemplates.reduce((groups, template) => {
    const key = template.targetTool || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(template);
    return groups;
  }, {} as Record<string, FieldMappingTemplate[]>);

  // Get available filter categories
  const availableCategories = ['all', ...new Set(templates.map(getTemplateCategory))];
  
  // Get template statistics
  const templateStats = {
    total: templates.length,
    certified: templates.filter(t => t.metadata?.tags?.includes('certified')).length,
    myTemplates: templates.filter(t => !t.id?.startsWith('vendor_')).length,
    filtered: filteredTemplates.length
  };
  
  // Generate smart template name suggestions
  const getSmartTemplateName = (): string => {
    const toolName = currentTemplate.targetTool || 'Tool';
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    if (currentTemplate.fieldMappings.length > 0) {
      // Look for patterns in source field names
      const sourceFields = currentTemplate.fieldMappings.map(m => m.sourceField.toLowerCase());
      if (sourceFields.some(f => f.includes('tyler'))) {
        return `Tyler CAD Export - ${month} ${currentDate.getFullYear()}`;
      }
      if (sourceFields.some(f => f.includes('dispatch') || f.includes('call'))) {
        return `${toolName} Monthly Export - ${month}`;
      }
    }
    
    return `${toolName} Mapping Template`;
  };

  // Handle template import from sharing
  const handleTemplateImported = (importedTemplates: FieldMappingTemplate[]) => {
    // Refresh templates list to include imported templates
    const storedTemplates = loadTemplates();
    setTemplates(storedTemplates);
    
    console.log(`📥 Imported ${importedTemplates.length} templates successfully`);
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
          // Filter to show only vendor templates
          setTemplateFilter('vendor');
          setLoadDialogOpen(true);
          handleMenuClose();
          console.log('🌱 Vendor templates seeded and filtered');
        }}>
          <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
          Load Vendor Templates
        </MenuItem>
        <MenuItem onClick={() => {
          // Open template discovery browser
          setLoadDialogOpen(true);
          // Focus on browsing all templates
          const storedTemplates = loadTemplates();
          setTemplates(storedTemplates);
        }}>
          <AutoAwesome fontSize="small" sx={{ mr: 1 }} />
          Browse Template Library
        </MenuItem>
        <MenuItem onClick={() => {
          try {
            setSharingDialogOpen(true);
            const storedTemplates = loadTemplates();
            setTemplates(storedTemplates);
          } catch (error) {
            console.error('Error opening sharing dialog:', error);
            alert('Template sharing feature is temporarily unavailable. Please try again later.');
          }
        }}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Share & Collaborate
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
                Tool: {currentTemplate.targetTool || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mappings: {currentTemplate.fieldMappings.length} field mappings
              </Typography>
              {currentTemplate.fieldMappings.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sample mappings: {currentTemplate.fieldMappings.slice(0, 3).map(m => `${m.sourceField} → ${m.targetField}`).join(', ')}
                    {currentTemplate.fieldMappings.length > 3 && ` +${currentTemplate.fieldMappings.length - 3} more`}
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
          {/* Template Discovery & Filtering Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome sx={{ mr: 1, fontSize: 20 }} />
              Template Library
              <Chip 
                label={`${templateStats.filtered}/${templateStats.total}`} 
                size="small" 
                sx={{ ml: 1 }} 
                color={templateStats.filtered === templateStats.total ? 'default' : 'primary'}
              />
            </Typography>
            
            {/* Search and Filter Controls */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search templates..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: <AutoAwesome sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                select
                label="Category"
                size="small"
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                {availableCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            
            {/* Template Statistics */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip 
                label={`${templateStats.certified} Certified`}
                color="primary"
                size="small"
                icon={<VerifiedIcon />}
              />
              <Chip 
                label={`${templateStats.myTemplates} My Templates`}
                color="secondary"
                size="small"
              />
              {searchQuery && (
                <Chip 
                  label={`${templateStats.filtered} Found`}
                  color="success"
                  size="small"
                  onDelete={() => setSearchQuery('')}
                />
              )}
            </Stack>
          </Box>

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
                {suggestions.map((suggestion, _index) => (
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
          
          {filteredTemplates.length === 0 && suggestions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchQuery || templateFilter !== 'all' ? 'No templates match your criteria' : 'No saved templates found'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchQuery || templateFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find more templates.'
                  : 'Templates save your field mapping configurations for reuse with similar data exports.'
                }
              </Typography>
              
              {searchQuery || templateFilter !== 'all' ? (
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setSearchQuery('')}
                    disabled={!searchQuery}
                  >
                    Clear Search
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => setTemplateFilter('all')}
                    disabled={templateFilter === 'all'}
                  >
                    Show All Categories
                  </Button>
                </Stack>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Pro Tip:</strong> After mapping fields for your CAD system, save it as a template. 
                    Next month's export will auto-map instantly!
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : filteredTemplates.length > 0 && (
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
                          onClick={() => handleApplyFieldMappingTemplate(template)}
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
                                    {template.lastUsed ? formatDate(new Date(template.lastUsed).getTime()) : 'Never used'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {template.fieldMappings?.length || 0} field mappings
                                  </Typography>
                                </Stack>
                                {template.fieldMappings && template.fieldMappings.length > 0 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Fields: {template.fieldMappings.slice(0, 2).map(m => m.sourceField).join(', ')}
                                    {template.fieldMappings.length > 2 && ` +${template.fieldMappings.length - 2} more`}
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

      {/* Template Sharing Dialog */}
      <TemplateSharing
        open={sharingDialogOpen}
        onClose={() => setSharingDialogOpen(false)}
        allTemplates={templates}
        onTemplateImported={handleTemplateImported}
        departmentName={departmentName || 'Unknown Department'}
      />
    </>
  );
};

export default TemplateManager;