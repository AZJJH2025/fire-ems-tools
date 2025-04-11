import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // Source data
  sourceColumns: [],
  sampleData: [],
  selectedTool: null,
  fileId: null,
  
  // Mapping state
  mappings: [],
  
  // UI state
  isLoading: false,
  error: null,
  
  // Schema state
  schema: null,
  targetFields: [],
  expandedCategories: {
    timestamp: true,
    location: true,
    incident: true,
    nfirs: false,
    other: false
  }
};

// Action types
export const ActionTypes = {
  SET_SOURCE_DATA: 'SET_SOURCE_DATA',
  SET_SELECTED_TOOL: 'SET_SELECTED_TOOL',
  SET_FILE_ID: 'SET_FILE_ID',
  ADD_MAPPING: 'ADD_MAPPING',
  REMOVE_MAPPING: 'REMOVE_MAPPING',
  UPDATE_MAPPING: 'UPDATE_MAPPING',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SCHEMA: 'SET_SCHEMA',
  SET_TARGET_FIELDS: 'SET_TARGET_FIELDS',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
function dataReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_SOURCE_DATA:
      return {
        ...state,
        sourceColumns: action.payload.sourceColumns || state.sourceColumns,
        sampleData: action.payload.sampleData || state.sampleData
      };
      
    case ActionTypes.SET_SELECTED_TOOL:
      return {
        ...state,
        selectedTool: action.payload
      };
      
    case ActionTypes.SET_FILE_ID:
      return {
        ...state,
        fileId: action.payload
      };
      
    case ActionTypes.ADD_MAPPING:
      return {
        ...state,
        mappings: [...state.mappings, action.payload]
      };
      
    case ActionTypes.REMOVE_MAPPING:
      return {
        ...state,
        mappings: state.mappings.filter(mapping => 
          mapping.targetField !== action.payload.targetField
        )
      };
      
    case ActionTypes.UPDATE_MAPPING:
      return {
        ...state,
        mappings: state.mappings.map(mapping => 
          mapping.targetField === action.payload.targetField
            ? { ...mapping, ...action.payload }
            : mapping
        )
      };
      
    case ActionTypes.TOGGLE_CATEGORY:
      return {
        ...state,
        expandedCategories: {
          ...state.expandedCategories,
          [action.payload]: !state.expandedCategories[action.payload]
        }
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
      
    case ActionTypes.SET_SCHEMA:
      return {
        ...state,
        schema: action.payload
      };
      
    case ActionTypes.SET_TARGET_FIELDS:
      return {
        ...state,
        targetFields: action.payload
      };
      
    case ActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
}

// Create context
const DataContext = createContext();

/**
 * Data Provider component to wrap the application
 */
export const DataProvider = ({ children, initialData = {} }) => {
  // Merge initial data with defaults
  const mergedInitialState = {
    ...initialState,
    sourceColumns: initialData.sourceColumns || [],
    sampleData: initialData.sampleData || [],
    selectedTool: initialData.selectedTool || null,
    fileId: initialData.fileId || null
  };
  
  const [state, dispatch] = useReducer(dataReducer, mergedInitialState);
  
  // Load schema when the component mounts
  useEffect(() => {
    const loadSchema = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      try {
        const response = await fetch('/static/standardized_incident_record_schema.json');
        if (!response.ok) {
          throw new Error(`Failed to load schema: ${response.status}`);
        }
        
        const schema = await response.json();
        dispatch({ type: ActionTypes.SET_SCHEMA, payload: schema });
        
        // Process target fields from schema
        const targetFields = processSchema(schema);
        dispatch({ type: ActionTypes.SET_TARGET_FIELDS, payload: targetFields });
        
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      } catch (error) {
        console.error('Error loading schema:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };
    
    loadSchema();
  }, []);
  
  // Process schema to extract target fields
  const processSchema = (schema) => {
    const fields = [];
    
    if (schema.schemaVersion === "3.0") {
      // Process v3.0 schema format
      if (schema.requiredFields && Array.isArray(schema.requiredFields)) {
        schema.requiredFields.forEach(field => {
          fields.push({
            name: field.fieldName,
            id: field.fieldName.toLowerCase().replace(/\s+/g, '_'),
            type: field.dataType,
            description: field.formatNotes,
            required: true,
            category: field.category || categorizeField(field.fieldName)
          });
        });
      }
      
      if (schema.optionalFields && Array.isArray(schema.optionalFields)) {
        schema.optionalFields.forEach(field => {
          fields.push({
            name: field.fieldName,
            id: field.fieldName.toLowerCase().replace(/\s+/g, '_'),
            type: field.dataType,
            description: field.formatNotes,
            required: false,
            category: field.category || categorizeField(field.fieldName)
          });
        });
      }
    } else {
      // Process legacy schema format (v2.0)
      if (schema.requiredFields && Array.isArray(schema.requiredFields)) {
        schema.requiredFields.forEach(field => {
          fields.push({
            ...field,
            id: field.name.replace(/\s+/g, '_').toLowerCase(),
            required: true,
            category: field.category || categorizeField(field.name)
          });
        });
      }
      
      if (schema.optionalFields && Array.isArray(schema.optionalFields)) {
        schema.optionalFields.forEach(field => {
          fields.push({
            ...field,
            id: field.name.replace(/\s+/g, '_').toLowerCase(),
            required: false,
            category: field.category || categorizeField(field.name)
          });
        });
      }
    }
    
    // Sort fields by required status and then alphabetically within each category
    return fields.sort((a, b) => {
      // First sort by category
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Then sort by required status (required fields first)
      if (a.required !== b.required) {
        return a.required ? -1 : 1;
      }
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  };
  
  // Helper function to categorize fields
  const categorizeField = (fieldName) => {
    const lowerField = fieldName.toLowerCase();
    
    // Timestamp fields
    if (lowerField.includes('time') || lowerField.includes('date') || lowerField.includes('timestamp')) {
      return 'timestamp';
    }
    
    // Location fields
    if (lowerField.includes('address') || lowerField.includes('location') || 
        lowerField.includes('latitude') || lowerField.includes('longitude') || 
        lowerField.includes('geo') || lowerField.includes('coordinates')) {
      return 'location';
    }
    
    // NFIRS fields
    if (lowerField.includes('nfirs') || lowerField.includes('fdid')) {
      return 'nfirs';
    }
    
    // Incident fields
    if (lowerField.includes('incident') || lowerField.includes('call') || 
        lowerField.includes('emergency') || lowerField.includes('response') || 
        lowerField.includes('dispatch') || lowerField.includes('unit') || 
        lowerField.includes('type')) {
      return 'incident';
    }
    
    // Default to other
    return 'other';
  };
  
  // Context value
  const contextValue = {
    state,
    dispatch
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the data context
export const useData = () => {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
};