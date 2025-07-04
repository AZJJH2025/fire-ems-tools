import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SourceFile,
  SampleData,
  ToolConfig,
  FieldMapping,
  ValidationError,
  ProcessingStatus
} from '@/types/formatter';
import { responseTimeToolConfig } from '@/utils/mockToolConfigs';

// Define the state interface
interface FormatterState {
  sourceFile: SourceFile | null;
  sourceColumns: string[];
  sampleData: SampleData;
  selectedTool: ToolConfig | null;
  mappings: FieldMapping[];
  transformedData: Record<string, any>[] | null;
  validationErrors: ValidationError[];
  processingStatus: ProcessingStatus;
  currentStep: number;
}

// Define the initial state
const initialState: FormatterState = {
  sourceFile: null,
  sourceColumns: [],
  sampleData: [],
  // Pre-select a tool for demo purposes
  selectedTool: responseTimeToolConfig,
  mappings: [],
  transformedData: null,
  validationErrors: [],
  processingStatus: 'idle',
  currentStep: 0
};

// Create the slice
const formatterSlice = createSlice({
  name: 'formatter',
  initialState,
  reducers: {
    // Set source file info
    setSourceFile: (state, action: PayloadAction<SourceFile>) => {
      state.sourceFile = action.payload;
    },
    
    // Set source columns
    setSourceColumns: (state, action: PayloadAction<string[]>) => {
      state.sourceColumns = action.payload;
    },
    
    // Set sample data
    setSampleData: (state, action: PayloadAction<SampleData>) => {
      state.sampleData = action.payload;
    },
    
    // Set selected tool
    setSelectedTool: (state, action: PayloadAction<ToolConfig>) => {
      state.selectedTool = action.payload;
    },
    
    // Set field mappings
    setMappings: (state, action: PayloadAction<FieldMapping[]>) => {
      state.mappings = action.payload;
    },
    
    // Add a single mapping
    addMapping: (state, action: PayloadAction<FieldMapping>) => {
      // Replace existing mapping for the same target field if it exists
      const index = state.mappings.findIndex(
        m => m.targetField === action.payload.targetField
      );
      
      if (index >= 0) {
        state.mappings[index] = action.payload;
      } else {
        state.mappings.push(action.payload);
      }
    },
    
    // Remove a mapping
    removeMapping: (state, action: PayloadAction<string>) => {
      state.mappings = state.mappings.filter(
        m => m.targetField !== action.payload
      );
    },
    
    // Set transformed data
    setTransformedData: (state, action: PayloadAction<Record<string, any>[]>) => {
      state.transformedData = action.payload;
    },
    
    // Set validation errors
    setValidationErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.validationErrors = action.payload;
    },
    
    // Set processing status
    setProcessingStatus: (state, action: PayloadAction<ProcessingStatus>) => {
      state.processingStatus = action.payload;
    },
    
    // Set current step
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    
    // Reset state (complete reset or keep selected tool)
    resetState: (state, action: PayloadAction<boolean>) => {
      const keepTool = action.payload;
      const selectedTool = keepTool ? state.selectedTool : null;
      
      return {
        ...initialState,
        selectedTool
      };
    }
  }
});

// Export actions and reducer
export const {
  setSourceFile,
  setSourceColumns,
  setSampleData,
  setSelectedTool,
  setMappings,
  addMapping,
  removeMapping,
  setTransformedData,
  setValidationErrors,
  setProcessingStatus,
  setCurrentStep,
  resetState
} = formatterSlice.actions;

export default formatterSlice.reducer;