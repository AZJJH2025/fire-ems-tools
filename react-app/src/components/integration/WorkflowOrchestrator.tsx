/**
 * Workflow Orchestrator Component
 * Provides seamless tool integration workflows for FireEMS
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow,
  Info,
  CheckCircle,
  Schedule,
  Timeline,
  AutoAwesome,
  Build,
  Insights,
  Map,
  Water,
  Speed,
  TrendingUp,
  Assessment,
  Visibility
} from '@mui/icons-material';

import { 
  ToolWorkflowService, 
  ToolWorkflow, 
  WorkflowExecution, 
  WorkflowTemplate
} from '@/services/integration/toolWorkflowService';

interface WorkflowOrchestratorProps {
  data: any[];
  onWorkflowComplete?: (results: any) => void;
  onToolRedirect?: (toolId: string, data: any) => void;
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

const WorkflowOrchestrator: React.FC<WorkflowOrchestratorProps> = ({
  data,
  onWorkflowComplete,
  onToolRedirect
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [workflows, setWorkflows] = useState<ToolWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [suggestedWorkflows, setSuggestedWorkflows] = useState<ToolWorkflow[]>([]);
  const [_selectedWorkflow, setSelectedWorkflow] = useState<ToolWorkflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [detailsDialog, setDetailsDialog] = useState<WorkflowTemplate | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load workflows and templates
  useEffect(() => {
    const loadedWorkflows = ToolWorkflowService.getAvailableWorkflows();
    const loadedTemplates = ToolWorkflowService.getWorkflowTemplates();
    const suggested = ToolWorkflowService.getSuggestedWorkflows(data);

    setWorkflows(loadedWorkflows);
    setTemplates(loadedTemplates);
    setSuggestedWorkflows(suggested);
  }, [data]);

  // Poll for execution updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (execution && execution.status === 'running') {
      interval = setInterval(() => {
        const updated = ToolWorkflowService.getExecution(execution.id);
        if (updated) {
          setExecution(updated);
          
          if (updated.status === 'completed') {
            setIsExecuting(false);
            if (onWorkflowComplete) {
              onWorkflowComplete(updated.results);
            }
          } else if (updated.status === 'failed') {
            setIsExecuting(false);
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [execution, onWorkflowComplete]);

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      setIsExecuting(true);
      const newExecution = await ToolWorkflowService.executeWorkflow(workflowId, data);
      setExecution(newExecution);
      
      const workflow = workflows.find(w => w.id === workflowId);
      setSelectedWorkflow(workflow || null);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      setIsExecuting(false);
    }
  };

  const handleExecuteStep = async (stepIndex: number) => {
    if (!execution) return;
    
    try {
      const updatedExecution = await ToolWorkflowService.executeStep(execution.id, stepIndex);
      setExecution(updatedExecution);
    } catch (error) {
      console.error('Failed to execute step:', error);
    }
  };

  const handleRedirectToTool = (toolId: string, stepData: any) => {
    if (onToolRedirect) {
      onToolRedirect(toolId, stepData);
    }
  };

  const getWorkflowIcon = (category: string) => {
    switch (category) {
      case 'analysis': return <Insights />;
      case 'reporting': return <Assessment />;
      case 'optimization': return <TrendingUp />;
      case 'visualization': return <Map />;
      default: return <Build />;
    }
  };

  const getStepIcon = (toolId: string) => {
    switch (toolId) {
      case 'response-time': return <Speed />;
      case 'fire-map-pro': return <Map />;
      case 'water-supply-coverage': return <Water />;
      case 'station-coverage-optimizer': return <TrendingUp />;
      default: return <Build />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const WorkflowCard: React.FC<{ workflow: ToolWorkflow; isTemplate?: boolean }> = ({ workflow, isTemplate }) => {
    const compatibility = ToolWorkflowService.validateWorkflowCompatibility(workflow.id, data);
    
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getWorkflowIcon(workflow.category)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {workflow.name}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {workflow.description}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip 
              label={workflow.category} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={workflow.complexity} 
              size="small" 
              color={getComplexityColor(workflow.complexity)}
            />
            <Chip 
              label={`${workflow.estimatedDuration}min`} 
              size="small" 
              icon={<Schedule />}
            />
          </Stack>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Steps ({workflow.steps.length})
            </Typography>
            <Stack spacing={1}>
              {workflow.steps.map((step, index) => (
                <Box key={step.id} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>
                    {getStepIcon(step.toolId)}
                  </Box>
                  <Typography variant="body2">
                    {index + 1}. {step.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          
          {!compatibility.compatible && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Missing fields: {compatibility.missingFields.join(', ')}
              </Typography>
            </Alert>
          )}
          
          {compatibility.compatible && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Compatible with your data
              </Typography>
            </Alert>
          )}
        </CardContent>
        
        <CardActions>
          <Button 
            variant="contained" 
            startIcon={<PlayArrow />}
            onClick={() => handleExecuteWorkflow(workflow.id)}
            disabled={!compatibility.compatible || isExecuting}
          >
            Execute
          </Button>
          {isTemplate && (
            <Button 
              size="small" 
              startIcon={<Info />}
              onClick={() => setDetailsDialog(templates.find(t => t.workflow.id === workflow.id) || null)}
            >
              Details
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

  const ExecutionMonitor: React.FC<{ execution: WorkflowExecution }> = ({ execution }) => {
    const workflow = workflows.find(w => w.id === execution.workflowId);
    if (!workflow) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Workflow Execution: {workflow.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Status: 
          </Typography>
          <Chip 
            label={execution.status} 
            color={getStatusColor(execution.status)}
            size="small"
          />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Progress: {execution.progress}%
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={execution.progress} 
          sx={{ mb: 2 }}
        />
        
        <Stepper activeStep={execution.currentStep} orientation="vertical">
          {workflow.steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel 
                icon={getStepIcon(step.toolId)}
                optional={
                  <Typography variant="caption">
                    {step.toolId}
                  </Typography>
                }
              >
                {step.name}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {step.description}
                </Typography>
                
                {index < execution.currentStep && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="success.main">
                      Completed
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ ml: 2 }}
                      onClick={() => {
                        const stepResult = execution.results[step.id];
                        if (stepResult) {
                          handleRedirectToTool(step.toolId, stepResult.transformedData);
                        }
                      }}
                    >
                      View Results
                    </Button>
                  </Box>
                )}
                
                {index === execution.currentStep && execution.status === 'running' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LinearProgress sx={{ mr: 1, flex: 1 }} />
                    <Typography variant="body2">
                      Running...
                    </Typography>
                  </Box>
                )}
                
                {index === execution.currentStep && execution.status === 'paused' && (
                  <Box sx={{ mb: 1 }}>
                    <Button 
                      size="small" 
                      startIcon={<PlayArrow />}
                      onClick={() => handleExecuteStep(index)}
                    >
                      Continue
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {execution.errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Errors: {execution.errors.join(', ')}
            </Typography>
          </Alert>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<AutoAwesome />} label="Suggested Workflows" />
          <Tab icon={<Timeline />} label="All Workflows" />
          <Tab icon={<Assessment />} label="Templates" />
          {execution && <Tab icon={<Visibility />} label="Execution Monitor" />}
        </Tabs>
      </Box>

      {/* Suggested Workflows Tab */}
      <TabPanel value={currentTab} index={0}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recommended Workflows for Your Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            These workflows are optimized for your current data structure and common use cases.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {suggestedWorkflows.map((workflow) => (
            <Grid size={{xs: 12, md: 6, lg: 4}} key={workflow.id}>
              <WorkflowCard workflow={workflow} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* All Workflows Tab */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            All Available Workflows
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete library of FireEMS tool integration workflows.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid size={{xs: 12, md: 6, lg: 4}} key={workflow.id}>
              <WorkflowCard workflow={workflow} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={2}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Popular Workflow Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pre-configured workflows for common fire department operations.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid size={{xs: 12, md: 6, lg: 4}} key={template.id}>
              <WorkflowCard workflow={template.workflow} isTemplate />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Execution Monitor Tab */}
      {execution && (
        <TabPanel value={currentTab} index={3}>
          <ExecutionMonitor execution={execution} />
        </TabPanel>
      )}

      {/* Template Details Dialog */}
      <Dialog 
        open={!!detailsDialog} 
        onClose={() => setDetailsDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {detailsDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getWorkflowIcon(detailsDialog.workflow.category)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {detailsDialog.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {detailsDialog.description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Use Case
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {detailsDialog.useCase}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Workflow Steps
              </Typography>
              <List>
                {detailsDialog.workflow.steps.map((step, index) => (
                  <ListItem key={step.id}>
                    <ListItemIcon>
                      {getStepIcon(step.toolId)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${index + 1}. ${step.name}`}
                      secondary={step.description}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Author: {detailsDialog.author} • 
                  Popularity: {detailsDialog.popularityScore}% • 
                  Updated: {new Date(detailsDialog.lastUpdated).toLocaleDateString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(null)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />}
                onClick={() => {
                  handleExecuteWorkflow(detailsDialog.workflow.id);
                  setDetailsDialog(null);
                }}
              >
                Execute Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default WorkflowOrchestrator;