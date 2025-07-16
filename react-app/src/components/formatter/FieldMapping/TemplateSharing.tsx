/**
 * Template Sharing Component
 * Provides UI for sharing templates between fire departments
 * Includes export, import, community sharing, and collaborative features
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Rating,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Stack,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Share,
  Download,
  Upload,
  People,
  ContentCopy,
  Email,
  Star,
  Verified,
  ThumbUp,
  Search,
  FilterList,
  CloudUpload,
  GetApp,
  Info
} from '@mui/icons-material';

import { FieldMappingTemplate, TemplateSuggestion } from '@/types/formatter';
import { TemplateSharingService, ShareableTemplate, TemplateExportData } from '@/services/templateSharingService';
import { TemplateService } from '@/services/templateService';
import { MappingTemplate } from './FieldMappingContainer';

// Helper function to convert MappingTemplate to FieldMappingTemplate
const convertMappingTemplateToFieldMappingTemplate = (template: MappingTemplate): FieldMappingTemplate => {
  // Safely handle missing or undefined properties
  const safeMappings = template.mappings || [];
  const safeLastModified = template.lastModified || Date.now();
  
  return {
    id: template.id || `template_${Date.now()}`,
    name: template.name || 'Untitled Template',
    description: template.description || '',
    departmentName: undefined,
    cadVendor: undefined,
    targetTool: template.toolId || 'unknown',
    fieldMappings: safeMappings,
    sourceFieldPattern: {
      fieldNames: safeMappings.map(m => m.sourceField || ''),
      fieldCount: safeMappings.length,
      hasHeaderRow: true,
      commonPatterns: [],
      cadVendorSignature: ''
    },
    metadata: {
      version: '1.0.0',
      compatibility: [],
      qualityScore: 100,
      successRate: 100,
      dataTypes: {},
      sampleValues: {},
      tags: []
    },
    createdAt: new Date(safeLastModified).toISOString(),
    lastUsed: new Date(safeLastModified).toISOString(),
    useCount: 0,
    isPublic: true
  };
};

interface TemplateSharingProps {
  open: boolean;
  onClose: () => void;
  currentTemplate?: MappingTemplate;
  allTemplates: MappingTemplate[];
  onTemplateImported: (templates: FieldMappingTemplate[]) => void;
  departmentName: string;
  contactEmail?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
);

const TemplateSharing: React.FC<TemplateSharingProps> = ({
  open,
  onClose,
  currentTemplate,
  allTemplates,
  onTemplateImported,
  departmentName,
  contactEmail
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [shareLink, setShareLink] = useState<string>('');
  const [communityTemplates, setCommunityTemplates] = useState<ShareableTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importData, setImportData] = useState<TemplateExportData | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load community templates
  useEffect(() => {
    if (open) {
      loadCommunityTemplates();
    }
  }, [open]);

  const loadCommunityTemplates = () => {
    const templates = TemplateSharingService.getCommunityTemplates();
    setCommunityTemplates(templates);
  };

  const handleTemplateSelection = (templateId: string, selected: boolean) => {
    if (selected) {
      setSelectedTemplates(prev => [...prev, templateId]);
    } else {
      setSelectedTemplates(prev => prev.filter(id => id !== templateId));
    }
  };

  const handleExportTemplates = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template to export');
      return;
    }

    setExporting(true);
    try {
      // Safely filter and convert templates
      const templatesToExport = allTemplates.filter(template => 
        template && template.id && selectedTemplates.includes(template.id)
      );
      
      if (templatesToExport.length === 0) {
        alert('No valid templates found to export');
        return;
      }
      
      // Convert MappingTemplate to FieldMappingTemplate for export
      const convertedTemplates = templatesToExport.map(template => {
        try {
          return convertMappingTemplateToFieldMappingTemplate(template);
        } catch (error) {
          console.error('Error converting template:', template.name, error);
          return null;
        }
      }).filter(Boolean); // Remove null values
      
      if (convertedTemplates.length === 0) {
        alert('Failed to convert templates for export');
        return;
      }
      
      // Store converted templates temporarily for export
      const existingTemplates = TemplateService.getTemplates();
      const tempTemplates = [...existingTemplates, ...convertedTemplates];
      localStorage.setItem('fireems_field_mapping_templates', JSON.stringify(tempTemplates));
      
      const exportData = TemplateSharingService.exportTemplates(
        selectedTemplates,
        departmentName,
        false // Don't include private data
      );

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fireems-templates-${departmentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export templates: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template to share');
      return;
    }

    try {
      // Safely filter and convert templates
      const templatesToShare = allTemplates.filter(template => 
        template && template.id && selectedTemplates.includes(template.id)
      );
      
      if (templatesToShare.length === 0) {
        alert('No valid templates found to share');
        return;
      }
      
      // Convert MappingTemplate to FieldMappingTemplate for sharing
      const convertedTemplates = templatesToShare.map(template => {
        try {
          return convertMappingTemplateToFieldMappingTemplate(template);
        } catch (error) {
          console.error('Error converting template for sharing:', template.name, error);
          return null;
        }
      }).filter(Boolean); // Remove null values
      
      if (convertedTemplates.length === 0) {
        alert('Failed to convert templates for sharing');
        return;
      }
      
      // Store converted templates temporarily for sharing
      const existingTemplates = TemplateService.getTemplates();
      const tempTemplates = [...existingTemplates, ...convertedTemplates];
      localStorage.setItem('fireems_field_mapping_templates', JSON.stringify(tempTemplates));
      
      const link = TemplateSharingService.generateShareLink(selectedTemplates, departmentName);
      setShareLink(link);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data: TemplateExportData = JSON.parse(text);
      setImportData(data);
      setCurrentTab(1); // Switch to import tab
    } catch (error) {
      console.error('Failed to parse import file:', error);
      alert('Invalid template file format');
    } finally {
      setImporting(false);
    }
  };

  const handleImportTemplates = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const result = TemplateSharingService.importTemplates(importData, {
        overwriteExisting: false,
        onlyHighQuality: true,
        minimumQuality: 60
      });

      if (result.imported.length > 0) {
        onTemplateImported(result.imported);
        alert(`Successfully imported ${result.imported.length} templates!`);
      }

      if (result.conflicts.length > 0) {
        alert(`${result.conflicts.length} templates had name conflicts and were skipped.`);
      }

      if (result.skipped.length > 0) {
        alert(`${result.skipped.length} templates were skipped due to quality filters.`);
      }

      setImportData(null);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import templates: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setImporting(false);
    }
  };

  const handleSubmitToCommunity = async (template: MappingTemplate) => {
    try {
      // Convert MappingTemplate to FieldMappingTemplate for submission
      const convertedTemplate = convertMappingTemplateToFieldMappingTemplate(template);
      
      const shareableTemplate = TemplateSharingService.submitToCommunity(
        convertedTemplate,
        departmentName,
        contactEmail
      );
      
      setCommunityTemplates(prev => [...prev, shareableTemplate]);
      alert(`Template "${template.name}" submitted to community!`);
    } catch (error) {
      console.error('Failed to submit to community:', error);
      alert('Failed to submit template to community');
    }
  };

  const handleDownloadCommunityTemplate = (shareableTemplate: ShareableTemplate) => {
    try {
      const result = TemplateSharingService.importTemplates(
        {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          exportedBy: shareableTemplate.sharedBy.departmentName,
          templates: [shareableTemplate.template],
          metadata: {
            totalTemplates: 1,
            averageQuality: shareableTemplate.template.metadata.qualityScore || 0,
            cadVendors: shareableTemplate.template.cadVendor ? [shareableTemplate.template.cadVendor] : [],
            tools: [shareableTemplate.template.targetTool]
          }
        },
        { overwriteExisting: false }
      );

      if (result.imported.length > 0) {
        onTemplateImported(result.imported);
        alert(`Successfully downloaded "${shareableTemplate.template.name}"!`);
        
        // Update download count (simulated)
        shareableTemplate.shareMetadata.downloadCount++;
        setCommunityTemplates(prev => [...prev]);
      } else if (result.conflicts.length > 0) {
        alert('Template name conflicts with existing template. Please rename and try again.');
      }
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template');
    }
  };

  const filteredCommunityTemplates = communityTemplates.filter(template => {
    if (!searchQuery) return true;
    
    const searchText = `${template.template.name} ${template.template.description} ${template.sharedBy.departmentName}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Share />
          Template Sharing & Collaboration
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<Upload />} label="Export & Share" />
          <Tab icon={<Download />} label="Import" />
          <Tab icon={<People />} label="Community" />
        </Tabs>

        {/* Export & Share Tab */}
        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Export Templates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select templates to export and share with other fire departments
          </Typography>

          <List>
            {allTemplates.map((template) => (
              <ListItem key={template.id} sx={{ px: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onChange={(e) => handleTemplateSelection(template.id, e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={`${template.metadata.qualityScore || 0}% quality`}
                          color={getQualityColor(template.metadata.qualityScore || 0)}
                          size="small"
                        />
                        {template.cadVendor && (
                          <Chip label={template.cadVendor} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={handleExportTemplates}
              disabled={selectedTemplates.length === 0 || exporting}
            >
              {exporting ? 'Exporting...' : 'Export as File'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleGenerateShareLink}
              disabled={selectedTemplates.length === 0}
            >
              Generate Share Link
            </Button>
          </Box>

          {shareLink && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Share Link Generated
                </Typography>
                <TextField
                  fullWidth
                  value={shareLink}
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={handleCopyShareLink}>
                        <ContentCopy />
                      </IconButton>
                    )
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Share this link with other fire departments to let them import your templates
                </Typography>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Import Tab */}
        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Import Templates
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import templates from other fire departments
          </Typography>

          <Box sx={{ mb: 3 }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-file"
              type="file"
              onChange={handleImportFile}
            />
            <label htmlFor="import-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                disabled={importing}
              >
                {importing ? 'Loading...' : 'Select Template File'}
              </Button>
            </label>
          </Box>

          {importData && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Template Package from {importData.exportedBy}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {importData.metadata.totalTemplates} templates • 
                  Average quality: {importData.metadata.averageQuality}% • 
                  CAD vendors: {importData.metadata.cadVendors.join(', ') || 'Various'}
                </Typography>
                
                <List dense>
                  {importData.templates.map((template) => (
                    <ListItem key={template.id}>
                      <ListItemText
                        primary={template.name}
                        secondary={template.description}
                      />
                      <Chip 
                        label={`${template.metadata.qualityScore || 0}%`}
                        color={getQualityColor(template.metadata.qualityScore || 0)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={handleImportTemplates}
                  disabled={importing}
                  startIcon={<Download />}
                >
                  {importing ? 'Importing...' : 'Import Templates'}
                </Button>
                <Button onClick={() => setImportData(null)}>
                  Cancel
                </Button>
              </CardActions>
            </Card>
          )}
        </TabPanel>

        {/* Community Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Community Templates
            </Typography>
            <TextField
              size="small"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Share your templates with the community to help other fire departments!
            </Typography>
          </Alert>

          <List>
            {filteredCommunityTemplates.map((shareableTemplate) => (
              <ListItem key={shareableTemplate.template.id} sx={{ px: 0 }}>
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {shareableTemplate.template.name}
                          {shareableTemplate.shareMetadata.verified && (
                            <Verified color="primary" fontSize="small" />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {shareableTemplate.template.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Shared by {shareableTemplate.sharedBy.departmentName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={shareableTemplate.shareMetadata.rating} readOnly size="small" />
                        <Typography variant="body2">
                          ({shareableTemplate.shareMetadata.reviews.length})
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip 
                        label={`${shareableTemplate.template.metadata.qualityScore || 0}% quality`}
                        color={getQualityColor(shareableTemplate.template.metadata.qualityScore || 0)}
                        size="small"
                      />
                      {shareableTemplate.template.cadVendor && (
                        <Chip 
                          label={shareableTemplate.template.cadVendor} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                      <Chip 
                        label={`${shareableTemplate.shareMetadata.downloadCount} downloads`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleDownloadCommunityTemplate(shareableTemplate)}
                    >
                      Download
                    </Button>
                    <Button size="small" startIcon={<Star />}>
                      Rate
                    </Button>
                  </CardActions>
                </Card>
              </ListItem>
            ))}
          </List>

          {filteredCommunityTemplates.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <People sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No community templates found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try a different search term' : 'Be the first to share a template!'}
              </Typography>
            </Box>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSharing;