/**
 * Tool Workflow Service
 * Orchestrates seamless workflows between multiple FireEMS tools
 */

import DataTransformer from './dataTransformer';
import { toolConfigs } from '@/utils/mockToolConfigs';

export interface WorkflowStep {
  id: string;
  toolId: string;
  name: string;
  description: string;
  inputFields: string[];
  outputFields: string[];
  transformations?: string[];
  optional?: boolean;
}

export interface ToolWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  category: 'analysis' | 'reporting' | 'optimization' | 'visualization';
  estimatedDuration: number; // in minutes
  complexity: 'simple' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  startTime: Date;
  endTime?: Date;
  results: Record<string, any>;
  errors: string[];
  progress: number; // 0-100
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  workflow: ToolWorkflow;
  useCase: string;
  popularityScore: number;
  lastUpdated: Date;
  author: string;
}

export class ToolWorkflowService {
  private static readonly WORKFLOW_STORAGE_KEY = 'fireems_tool_workflows';
  private static readonly EXECUTION_STORAGE_KEY = 'fireems_workflow_executions';
  private static readonly TEMPLATE_STORAGE_KEY = 'fireems_workflow_templates';

  /**
   * Get all available tool workflows
   */
  static getAvailableWorkflows(): ToolWorkflow[] {
    try {
      const stored = localStorage.getItem(this.WORKFLOW_STORAGE_KEY);
      const workflows = stored ? JSON.parse(stored) : [];
      
      // Add default workflows if none exist
      if (workflows.length === 0) {
        const defaultWorkflows = this.getDefaultWorkflows();
        localStorage.setItem(this.WORKFLOW_STORAGE_KEY, JSON.stringify(defaultWorkflows));
        return defaultWorkflows;
      }
      
      return workflows;
    } catch (error) {
      console.error('Error loading workflows:', error);
      return this.getDefaultWorkflows();
    }
  }

  /**
   * Get workflow templates (popular, pre-configured workflows)
   */
  static getWorkflowTemplates(): WorkflowTemplate[] {
    try {
      const stored = localStorage.getItem(this.TEMPLATE_STORAGE_KEY);
      const templates = stored ? JSON.parse(stored) : [];
      
      // Add default templates if none exist
      if (templates.length === 0) {
        const defaultTemplates = this.getDefaultTemplates();
        localStorage.setItem(this.TEMPLATE_STORAGE_KEY, JSON.stringify(defaultTemplates));
        return defaultTemplates;
      }
      
      return templates;
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Create a new workflow execution
   */
  static createExecution(workflowId: string, inputData: any): WorkflowExecution {
    const workflow = this.getAvailableWorkflows().find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId,
      status: 'pending',
      currentStep: 0,
      startTime: new Date(),
      results: { inputData },
      errors: [],
      progress: 0
    };

    // Store execution
    const executions = this.getActiveExecutions();
    executions.push(execution);
    localStorage.setItem(this.EXECUTION_STORAGE_KEY, JSON.stringify(executions));

    return execution;
  }

  /**
   * Execute a workflow step
   */
  static async executeStep(executionId: string, stepIndex: number): Promise<WorkflowExecution> {
    const execution = this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const workflow = this.getAvailableWorkflows().find(w => w.id === execution.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${execution.workflowId} not found`);
    }

    if (stepIndex >= workflow.steps.length) {
      throw new Error(`Step ${stepIndex} out of bounds`);
    }

    const step = workflow.steps[stepIndex];
    const tool = toolConfigs.find(t => t.id === step.toolId);
    if (!tool) {
      throw new Error(`Tool ${step.toolId} not found`);
    }

    try {
      execution.status = 'running';
      execution.currentStep = stepIndex;
      execution.progress = Math.round((stepIndex / workflow.steps.length) * 100);

      // Get input data from previous step or initial data
      const inputData = stepIndex === 0 
        ? execution.results.inputData 
        : execution.results[workflow.steps[stepIndex - 1].id];

      // Transform data for the current tool
      let transformedData: any;
      switch (step.toolId) {
        case 'fire-map-pro':
          const fireMapResult = DataTransformer.transformToFireMapPro(inputData);
          transformedData = fireMapResult.success ? fireMapResult.data : inputData;
          break;
        case 'response-time-analyzer':
          const responseTimeResult = DataTransformer.transformToResponseTimeAnalyzer(inputData);
          transformedData = responseTimeResult.success ? responseTimeResult.data : inputData;
          break;
        default:
          // For other tools, use the data as-is
          transformedData = inputData;
      }

      // Store step result
      execution.results[step.id] = {
        toolId: step.toolId,
        transformedData,
        timestamp: new Date(),
        metadata: {
          recordCount: Array.isArray(transformedData) ? transformedData.length : 1,
          fieldCount: Object.keys(transformedData[0] || {}).length
        }
      };

      // Check if this is the last step
      if (stepIndex === workflow.steps.length - 1) {
        execution.status = 'completed';
        execution.endTime = new Date();
        execution.progress = 100;
      }

      // Update execution
      this.updateExecution(execution);
      
      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.updateExecution(execution);
      throw error;
    }
  }

  /**
   * Execute entire workflow
   */
  static async executeWorkflow(workflowId: string, inputData: any): Promise<WorkflowExecution> {
    const execution = this.createExecution(workflowId, inputData);
    const workflow = this.getAvailableWorkflows().find(w => w.id === workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    try {
      // Execute all steps in sequence
      for (let i = 0; i < workflow.steps.length; i++) {
        await this.executeStep(execution.id, i);
      }

      return execution;

    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Get workflow execution by ID
   */
  static getExecution(executionId: string): WorkflowExecution | null {
    const executions = this.getActiveExecutions();
    return executions.find(e => e.id === executionId) || null;
  }

  /**
   * Get all active executions
   */
  static getActiveExecutions(): WorkflowExecution[] {
    try {
      const stored = localStorage.getItem(this.EXECUTION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading executions:', error);
      return [];
    }
  }

  /**
   * Update execution status
   */
  static updateExecution(execution: WorkflowExecution): void {
    const executions = this.getActiveExecutions();
    const index = executions.findIndex(e => e.id === execution.id);
    
    if (index >= 0) {
      executions[index] = execution;
      localStorage.setItem(this.EXECUTION_STORAGE_KEY, JSON.stringify(executions));
    }
  }

  /**
   * Create custom workflow
   */
  static createCustomWorkflow(workflow: Omit<ToolWorkflow, 'id'>): ToolWorkflow {
    const newWorkflow: ToolWorkflow = {
      ...workflow,
      id: `custom-${Date.now()}`
    };

    const workflows = this.getAvailableWorkflows();
    workflows.push(newWorkflow);
    localStorage.setItem(this.WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));

    return newWorkflow;
  }

  /**
   * Validate workflow compatibility with data
   */
  static validateWorkflowCompatibility(workflowId: string, data: any[]): {
    compatible: boolean;
    missingFields: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const workflow = this.getAvailableWorkflows().find(w => w.id === workflowId);
    if (!workflow) {
      return {
        compatible: false,
        missingFields: [],
        warnings: ['Workflow not found'],
        suggestions: []
      };
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check each step's requirements
    for (const step of workflow.steps) {
      const tool = toolConfigs.find(t => t.id === step.toolId);
      if (!tool) {
        warnings.push(`Tool ${step.toolId} not found`);
        continue;
      }

      // Check required fields
      for (const field of tool.requiredFields) {
        const hasField = data.some(row => row.hasOwnProperty(field.id));
        if (!hasField && !step.optional) {
          missingFields.push(field.name);
        }
      }
    }

    // Generate suggestions
    if (missingFields.length > 0) {
      suggestions.push('Consider using a simpler workflow that doesn\'t require all fields');
      suggestions.push('Map additional fields from your source data');
    }

    return {
      compatible: missingFields.length === 0 && warnings.length === 0,
      missingFields,
      warnings,
      suggestions
    };
  }

  /**
   * Get suggested workflows for data
   */
  static getSuggestedWorkflows(data: any[], userGoals?: string[]): ToolWorkflow[] {
    const workflows = this.getAvailableWorkflows();
    const dataFields = data.length > 0 ? Object.keys(data[0]) : [];

    return workflows
      .map(workflow => {
        const compatibility = this.validateWorkflowCompatibility(workflow.id, data);
        const fieldMatch = workflow.steps.reduce((acc, step) => {
          const tool = toolConfigs.find(t => t.id === step.toolId);
          if (!tool) return acc;
          
          const requiredFields = tool.requiredFields.length;
          const availableFields = tool.requiredFields.filter(f => 
            dataFields.includes(f.id)
          ).length;
          
          return acc + (availableFields / requiredFields);
        }, 0) / workflow.steps.length;

        const goalMatch = userGoals ? workflow.tags.filter(tag => 
          userGoals.some(goal => goal.toLowerCase().includes(tag.toLowerCase()))
        ).length : 0;

        return {
          workflow,
          score: fieldMatch * 0.6 + goalMatch * 0.4 + (compatibility.compatible ? 0.2 : 0),
          compatibility
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.workflow);
  }

  /**
   * Get default workflows
   */
  private static getDefaultWorkflows(): ToolWorkflow[] {
    return [
      {
        id: 'monthly-analysis',
        name: 'Monthly Performance Analysis',
        description: 'Complete monthly analysis including response times, coverage, and reporting',
        category: 'analysis',
        estimatedDuration: 15,
        complexity: 'intermediate',
        tags: ['monthly', 'analysis', 'performance', 'reporting'],
        steps: [
          {
            id: 'response-analysis',
            toolId: 'response-time',
            name: 'Response Time Analysis',
            description: 'Analyze response time performance',
            inputFields: ['incident_id', 'incident_time', 'arrival_time'],
            outputFields: ['response_time', 'performance_rating'],
            transformations: ['calculateResponseTime', 'categorizePerformance']
          },
          {
            id: 'coverage-analysis',
            toolId: 'station-coverage-optimizer',
            name: 'Station Coverage Analysis',
            description: 'Analyze station coverage effectiveness',
            inputFields: ['latitude', 'longitude', 'incident_type'],
            outputFields: ['coverage_rating', 'gap_analysis'],
            transformations: ['calculateCoverage', 'identifyGaps']
          },
          {
            id: 'map-visualization',
            toolId: 'fire-map-pro',
            name: 'Generate Performance Maps',
            description: 'Create visual maps of performance data',
            inputFields: ['latitude', 'longitude', 'response_time', 'coverage_rating'],
            outputFields: ['map_features', 'heatmap_data'],
            transformations: ['createMapFeatures', 'generateHeatmap']
          }
        ]
      },
      {
        id: 'incident-investigation',
        name: 'Incident Investigation Workflow',
        description: 'Comprehensive investigation of specific incidents',
        category: 'analysis',
        estimatedDuration: 10,
        complexity: 'simple',
        tags: ['incident', 'investigation', 'analysis'],
        steps: [
          {
            id: 'map-location',
            toolId: 'fire-map-pro',
            name: 'Map Incident Location',
            description: 'Visualize incident location and context',
            inputFields: ['latitude', 'longitude', 'incident_type', 'address'],
            outputFields: ['map_features', 'context_analysis'],
            transformations: ['createIncidentMap', 'analyzeContext']
          },
          {
            id: 'response-analysis',
            toolId: 'response-time',
            name: 'Response Time Analysis',
            description: 'Analyze response performance for this incident',
            inputFields: ['incident_time', 'dispatch_time', 'arrival_time'],
            outputFields: ['response_metrics', 'performance_comparison'],
            transformations: ['calculateMetrics', 'compareToStandards']
          }
        ]
      },
      {
        id: 'water-supply-assessment',
        name: 'Water Supply Assessment',
        description: 'Comprehensive water supply infrastructure analysis',
        category: 'optimization',
        estimatedDuration: 20,
        complexity: 'advanced',
        tags: ['water', 'supply', 'infrastructure', 'optimization'],
        steps: [
          {
            id: 'coverage-analysis',
            toolId: 'water-supply-coverage',
            name: 'Water Supply Coverage Analysis',
            description: 'Analyze water supply coverage and capacity',
            inputFields: ['asset_id', 'latitude', 'longitude', 'capacity'],
            outputFields: ['coverage_map', 'capacity_analysis'],
            transformations: ['analyzeCoverage', 'calculateCapacity']
          },
          {
            id: 'optimization',
            toolId: 'station-coverage-optimizer',
            name: 'Coverage Optimization',
            description: 'Optimize station placement based on water supply',
            inputFields: ['coverage_map', 'capacity_analysis', 'demand_data'],
            outputFields: ['optimization_recommendations', 'placement_suggestions'],
            transformations: ['optimizePlacement', 'generateRecommendations']
          },
          {
            id: 'visualization',
            toolId: 'fire-map-pro',
            name: 'Water Supply Visualization',
            description: 'Create comprehensive water supply maps',
            inputFields: ['coverage_map', 'optimization_recommendations'],
            outputFields: ['water_supply_map', 'optimization_overlay'],
            transformations: ['createWaterSupplyMap', 'addOptimizationOverlay']
          }
        ]
      }
    ];
  }

  /**
   * Get default workflow templates
   */
  private static getDefaultTemplates(): WorkflowTemplate[] {
    const workflows = this.getDefaultWorkflows();
    return workflows.map(workflow => ({
      id: `template-${workflow.id}`,
      name: workflow.name,
      description: workflow.description,
      workflow,
      useCase: this.getUseCaseForWorkflow(workflow),
      popularityScore: Math.floor(Math.random() * 100) + 50, // Simulated popularity
      lastUpdated: new Date(),
      author: 'FireEMS System'
    }));
  }

  /**
   * Get use case description for workflow
   */
  private static getUseCaseForWorkflow(workflow: ToolWorkflow): string {
    switch (workflow.id) {
      case 'monthly-analysis':
        return 'Perfect for monthly performance reviews and compliance reporting';
      case 'incident-investigation':
        return 'Ideal for investigating specific incidents and understanding response patterns';
      case 'water-supply-assessment':
        return 'Essential for water supply infrastructure planning and optimization';
      default:
        return 'General purpose workflow for fire department operations';
    }
  }
}