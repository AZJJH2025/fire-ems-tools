/**
 * Workflow Status Tracker Component
 * Tracks and displays the status of all workflow executions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  Badge
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Delete,
  Visibility,
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Timeline,
  Speed,
  Map,
  Water,
  TrendingUp,
  Build,
  Assessment,
  CloudDownload,
  Share
} from '@mui/icons-material';

import { 
  ToolWorkflowService, 
  WorkflowExecution, 
  ToolWorkflow 
} from '@/services/integration/toolWorkflowService';

interface WorkflowStatusTrackerProps {
  onOpenWorkflow?: (workflowId: string) => void;
  onViewResults?: (execution: WorkflowExecution) => void;
}

const WorkflowStatusTracker: React.FC<WorkflowStatusTrackerProps> = ({
  onOpenWorkflow,
  onViewResults
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [workflows, setWorkflows] = useState<ToolWorkflow[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Load executions and workflows
  useEffect(() => {
    loadExecutions();
    loadWorkflows();
    
    // Set up polling for running executions
    const interval = setInterval(() => {
      loadExecutions();
    }, 2000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadExecutions = () => {
    const allExecutions = ToolWorkflowService.getActiveExecutions();
    setExecutions(allExecutions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    ));
  };

  const loadWorkflows = () => {
    const allWorkflows = ToolWorkflowService.getAvailableWorkflows();
    setWorkflows(allWorkflows);
  };

  const getWorkflowName = (workflowId: string): string => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow ? workflow.name : 'Unknown Workflow';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'running': return <Schedule color="info" />;
      case 'failed': return <Error color="error" />;
      case 'paused': return <Pause color="warning" />;
      default: return <Schedule />;
    }
  };

  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'response-time': return <Speed />;
      case 'fire-map-pro': return <Map />;
      case 'water-supply-coverage': return <Water />;
      case 'station-coverage-optimizer': return <TrendingUp />;
      default: return <Build />;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date): string => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handlePauseExecution = (executionId: string) => {
    // In a real implementation, this would call the service
    console.log('Pausing execution:', executionId);
  };

  const handleResumeExecution = (executionId: string) => {
    // In a real implementation, this would call the service
    console.log('Resuming execution:', executionId);
  };

  const handleStopExecution = (executionId: string) => {
    // In a real implementation, this would call the service
    console.log('Stopping execution:', executionId);
  };

  const handleDeleteExecution = (executionId: string) => {
    // In a real implementation, this would call the service
    const updatedExecutions = executions.filter(e => e.id !== executionId);
    setExecutions(updatedExecutions);
  };

  const handleViewDetails = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setDetailsDialog(true);
  };

  const handleExportResults = (execution: WorkflowExecution) => {
    const exportData = {
      workflowId: execution.workflowId,
      workflowName: getWorkflowName(execution.workflowId),
      executionId: execution.id,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: formatDuration(execution.startTime, execution.endTime),
      status: execution.status,
      progress: execution.progress,
      results: execution.results,
      errors: execution.errors
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-results-${execution.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExecutionSummary = () => {
    const total = executions.length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const running = executions.filter(e => e.status === 'running').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    
    return { total, completed, running, failed };
  };

  const summary = getExecutionSummary();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Workflow Status Tracker
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {summary.total}
              </Typography>
              <Typography variant="body2">
                Total Executions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {summary.completed}
              </Typography>
              <Typography variant="body2">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {summary.running}
              </Typography>
              <Typography variant="body2">
                Running
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {summary.failed}
              </Typography>
              <Typography variant="body2">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Execution List */}
      {executions.length > 0 ? (
        <List>
          {executions.map((execution) => {
            const workflow = workflows.find(w => w.id === execution.workflowId);
            
            return (
              <ListItem
                key={execution.id}
                sx={{
                  mb: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  flexDirection: 'column',
                  alignItems: 'stretch'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <ListItemIcon>
                    {getStatusIcon(execution.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {getWorkflowName(execution.workflowId)}
                        </Typography>
                        <Chip
                          label={execution.status}
                          color={getStatusColor(execution.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Started: {new Date(execution.startTime).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {formatDuration(execution.startTime, execution.endTime)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDetails(execution)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Results">
                      <IconButton 
                        onClick={() => handleExportResults(execution)}
                        disabled={execution.status === 'running'}
                      >
                        <CloudDownload />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteExecution(execution.id)}
                        disabled={execution.status === 'running'}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                
                {/* Progress Bar */}
                <Box sx={{ width: '100%', mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={execution.progress}
                    color={getStatusColor(execution.status)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {execution.progress}% complete
                  </Typography>
                </Box>
                
                {/* Workflow Steps */}
                {workflow && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {workflow.steps.map((step, index) => (
                      <Chip
                        key={step.id}
                        icon={getToolIcon(step.toolId)}
                        label={step.name}
                        size="small"
                        variant={index < execution.currentStep ? 'filled' : 'outlined'}
                        color={index < execution.currentStep ? 'success' : 'default'}
                      />
                    ))}
                  </Box>
                )}
                
                {/* Errors */}
                {execution.errors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Errors: {execution.errors.join(', ')}
                    </Typography>
                  </Alert>
                )}
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Timeline sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No workflow executions found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a workflow to see execution status here
          </Typography>
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedExecution && (
          <>
            <DialogTitle>
              Workflow Execution Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Workflow
                  </Typography>
                  <Typography variant="body2">
                    {getWorkflowName(selectedExecution.workflowId)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedExecution.status}
                    color={getStatusColor(selectedExecution.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Start Time
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedExecution.startTime).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Duration
                  </Typography>
                  <Typography variant="body2">
                    {formatDuration(selectedExecution.startTime, selectedExecution.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedExecution.progress}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2">
                    {selectedExecution.progress}% complete
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Results
                  </Typography>
                  <Box sx={{ 
                    maxHeight: 200, 
                    overflow: 'auto', 
                    border: 1, 
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1
                  }}>
                    <pre style={{ fontSize: '0.8em' }}>
                      {JSON.stringify(selectedExecution.results, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => handleExportResults(selectedExecution)}
                startIcon={<CloudDownload />}
              >
                Export Results
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default WorkflowStatusTracker;