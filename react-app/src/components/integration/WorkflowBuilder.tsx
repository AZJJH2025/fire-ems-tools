/**
 * Workflow Builder Component
 * Allows users to create custom tool integration workflows
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Grid
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  DragIndicator,
  ExpandMore,
  Save,
  Preview,
  Build,
  Speed,
  Map,
  Water,
  TrendingUp,
  Assessment,
  Insights,
  PlayArrow,
  Stop,
  Info
} from '@mui/icons-material';

import { 
  ToolWorkflowService, 
  ToolWorkflow, 
  WorkflowStep 
} from '@/services/integration/toolWorkflowService';
import { mockToolConfigs } from '@/utils/mockToolConfigs';
import { ToolConfig } from '@/types/formatter';

interface WorkflowBuilderProps {
  onWorkflowCreated?: (workflow: ToolWorkflow) => void;
  onClose?: () => void;
}

interface StepFormData {
  id: string;
  toolId: string;
  name: string;
  description: string;
  inputFields: string[];
  outputFields: string[];
  optional: boolean;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onWorkflowCreated,
  onClose
}) => {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowCategory, setWorkflowCategory] = useState<'analysis' | 'reporting' | 'optimization' | 'visualization'>('analysis');
  const [workflowTags, setWorkflowTags] = useState<string[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<StepFormData[]>([]);
  const [editingStep, setEditingStep] = useState<StepFormData | null>(null);
  const [stepDialog, setStepDialog] = useState(false);
  const [availableTools, setAvailableTools] = useState<ToolConfig[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load available tools
  useEffect(() => {
    setAvailableTools(mockToolConfigs);
  }, []);

  // Validate workflow
  useEffect(() => {
    const errors: string[] = [];
    
    if (!workflowName.trim()) {
      errors.push('Workflow name is required');
    }
    
    if (!workflowDescription.trim()) {
      errors.push('Workflow description is required');
    }
    
    if (workflowSteps.length === 0) {
      errors.push('At least one step is required');
    }
    
    // Check for duplicate step IDs
    const stepIds = workflowSteps.map(s => s.id);
    if (stepIds.length !== new Set(stepIds).size) {
      errors.push('Step IDs must be unique');
    }
    
    // Check for field flow compatibility
    for (let i = 1; i < workflowSteps.length; i++) {
      const currentStep = workflowSteps[i];
      const previousStep = workflowSteps[i - 1];
      
      const missingFields = currentStep.inputFields.filter(field => 
        !previousStep.outputFields.includes(field)
      );
      
      if (missingFields.length > 0 && !currentStep.optional) {
        errors.push(`Step "${currentStep.name}" requires fields not provided by previous step: ${missingFields.join(', ')}`);
      }
    }
    
    setValidationErrors(errors);
  }, [workflowName, workflowDescription, workflowSteps]);

  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'response-time': return <Speed />;
      case 'fire-map-pro': return <Map />;
      case 'water-supply-coverage': return <Water />;
      case 'station-coverage-optimizer': return <TrendingUp />;
      default: return <Build />;
    }
  };

  const handleAddStep = () => {
    setEditingStep({
      id: `step-${Date.now()}`,
      toolId: '',
      name: '',
      description: '',
      inputFields: [],
      outputFields: [],
      optional: false
    });
    setStepDialog(true);
  };

  const handleEditStep = (step: StepFormData) => {
    setEditingStep({ ...step });
    setStepDialog(true);
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflowSteps(prev => prev.filter(s => s.id !== stepId));
  };

  const handleSaveStep = () => {
    if (!editingStep) return;
    
    const existingIndex = workflowSteps.findIndex(s => s.id === editingStep.id);
    if (existingIndex >= 0) {
      // Update existing step
      setWorkflowSteps(prev => 
        prev.map((s, i) => i === existingIndex ? editingStep : s)
      );
    } else {
      // Add new step
      setWorkflowSteps(prev => [...prev, editingStep]);
    }
    
    setStepDialog(false);
    setEditingStep(null);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !workflowTags.includes(currentTag.trim())) {
      setWorkflowTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setWorkflowTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...workflowSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      setWorkflowSteps(newSteps);
    }
  };

  const handleSaveWorkflow = () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }
    
    try {
      const workflow: Omit<ToolWorkflow, 'id'> = {
        name: workflowName,
        description: workflowDescription,
        category: workflowCategory,
        estimatedDuration: Math.max(workflowSteps.length * 5, 10),
        complexity: workflowSteps.length <= 2 ? 'simple' : 
                   workflowSteps.length <= 4 ? 'intermediate' : 'advanced',
        tags: workflowTags,
        steps: workflowSteps.map(step => ({
          id: step.id,
          toolId: step.toolId,
          name: step.name,
          description: step.description,
          inputFields: step.inputFields,
          outputFields: step.outputFields,
          optional: step.optional
        }))
      };
      
      const savedWorkflow = ToolWorkflowService.createCustomWorkflow(workflow);
      
      if (onWorkflowCreated) {
        onWorkflowCreated(savedWorkflow);
      }
      
      alert('Workflow saved successfully!');
      
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const StepDialog: React.FC = () => {
    if (!editingStep) return null;
    
    const selectedTool = availableTools.find(t => t.id === editingStep.toolId);
    const availableInputFields = selectedTool ? 
      [...selectedTool.requiredFields, ...selectedTool.optionalFields].map(f => f.id) : [];
    
    return (
      <Dialog open={stepDialog} onClose={() => setStepDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {workflowSteps.find(s => s.id === editingStep.id) ? 'Edit Step' : 'Add Step'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Step Name"
                value={editingStep.name}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, name: e.target.value } : null)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tool</InputLabel>
                <Select
                  value={editingStep.toolId}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, toolId: e.target.value } : null)}
                >
                  {availableTools.map(tool => (
                    <MenuItem key={tool.id} value={tool.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getToolIcon(tool.id)}
                        <Typography sx={{ ml: 1 }}>{tool.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={editingStep.description}
                onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Input Fields
              </Typography>
              <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                {availableInputFields.map(field => (
                  <div key={field}>
                    <label>
                      <input
                        type="checkbox"
                        checked={editingStep.inputFields.includes(field)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingStep(prev => prev ? {
                            ...prev,
                            inputFields: checked 
                              ? [...prev.inputFields, field]
                              : prev.inputFields.filter(f => f !== field)
                          } : null);
                        }}
                      />
                      {field}
                    </label>
                  </div>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Output Fields
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter output fields (comma-separated)"
                value={editingStep.outputFields.join(', ')}
                onChange={(e) => setEditingStep(prev => prev ? {
                  ...prev,
                  outputFields: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                } : null)}
              />
            </Grid>
            <Grid item xs={12}>
              <label>
                <input
                  type="checkbox"
                  checked={editingStep.optional}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, optional: e.target.checked } : null)}
                />
                Optional Step
              </label>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStep}>
            Save Step
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Workflow Builder
        </Typography>
        <Box>
          <Button
            startIcon={<Preview />}
            onClick={() => setPreviewMode(!previewMode)}
            sx={{ mr: 1 }}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          {onClose && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </Box>
      </Box>

      {!previewMode ? (
        <Box>
          {/* Workflow Details */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Workflow Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Workflow Name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={workflowCategory}
                      onChange={(e) => setWorkflowCategory(e.target.value as any)}
                    >
                      <MenuItem value="analysis">Analysis</MenuItem>
                      <MenuItem value="reporting">Reporting</MenuItem>
                      <MenuItem value="optimization">Optimization</MenuItem>
                      <MenuItem value="visualization">Visualization</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    multiline
                    rows={3}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TextField
                      label="Add Tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      size="small"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag();
                        }
                      }}
                    />
                    <Button onClick={handleAddTag} variant="outlined" size="small">
                      Add
                    </Button>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {workflowTags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Workflow Steps */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Workflow Steps</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Configure the sequence of tools in your workflow
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddStep}
                  variant="outlined"
                >
                  Add Step
                </Button>
              </Box>

              {workflowSteps.length > 0 ? (
                <List>
                  {workflowSteps.map((step, index) => (
                    <ListItem key={step.id} sx={{ mb: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <ListItemIcon>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                          >
                            <DragIndicator />
                          </IconButton>
                          {getToolIcon(step.toolId)}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {index + 1}. {step.name}
                            </Typography>
                            {step.optional && (
                              <Chip label="Optional" size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {step.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Tool: {step.toolId} • 
                              Input: {step.inputFields.join(', ')} • 
                              Output: {step.outputFields.join(', ')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => handleEditStep(step)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteStep(step.id)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No steps added yet. Click "Add Step" to begin building your workflow.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Validation */}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Validation Errors:
              </Typography>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveWorkflow}
              disabled={validationErrors.length > 0}
            >
              Save Workflow
            </Button>
          </Box>
        </Box>
      ) : (
        /* Preview Mode */
        <Box>
          <Typography variant="h6" gutterBottom>
            Workflow Preview
          </Typography>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {workflowName || 'Untitled Workflow'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {workflowDescription || 'No description provided'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label={workflowCategory} size="small" />
                <Chip label={`${workflowSteps.length} steps`} size="small" />
                <Chip label={`~${Math.max(workflowSteps.length * 5, 10)} min`} size="small" />
                {workflowTags.map(tag => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Stepper orientation="vertical">
            {workflowSteps.map((step, index) => (
              <Step key={step.id} active>
                <StepLabel icon={getToolIcon(step.toolId)}>
                  {step.name}
                  {step.optional && <Chip label="Optional" size="small" sx={{ ml: 1 }} />}
                </StepLabel>
                <Box sx={{ ml: 4, pb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {step.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tool: {step.toolId} • 
                    Input: {step.inputFields.join(', ')} • 
                    Output: {step.outputFields.join(', ')}
                  </Typography>
                </Box>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <StepDialog />
    </Paper>
  );
};

export default WorkflowBuilder;