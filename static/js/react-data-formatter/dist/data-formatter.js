/**
 * Data Formatter React Application Bundle
 * This is a simplified version of the bundled application for demonstration
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom'), require('@material-ui/core'), require('react-beautiful-dnd')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom', '@material-ui/core', 'react-beautiful-dnd'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DataFormatterUI = {}, global.React, global.ReactDOM, global.MaterialUI, global.ReactBeautifulDnD));
})(this, (function (exports, React, ReactDOM, MaterialUI, ReactBeautifulDnD) {
  'use strict';

  // Create React Context
  const DataContext = React.createContext();

  // Reducer function
  function dataReducer(state, action) {
    switch (action.type) {
      case 'SET_SOURCE_DATA':
        return {
          ...state,
          sourceColumns: action.payload.sourceColumns || state.sourceColumns,
          sampleData: action.payload.sampleData || state.sampleData
        };
      case 'SET_SELECTED_TOOL':
        return {
          ...state,
          selectedTool: action.payload
        };
      case 'ADD_MAPPING':
        return {
          ...state,
          mappings: [...state.mappings, action.payload]
        };
      case 'REMOVE_MAPPING':
        return {
          ...state,
          mappings: state.mappings.filter(mapping => 
            mapping.targetField !== action.payload.targetField
          )
        };
      case 'UPDATE_MAPPING':
        return {
          ...state,
          mappings: state.mappings.map(mapping => 
            mapping.targetField === action.payload.targetField
              ? { ...mapping, ...action.payload }
              : mapping
          )
        };
      case 'SET_ERROR':
        return {
          ...state,
          error: action.payload
        };
      default:
        return state;
    }
  }

  // Data Provider Component
  function DataProvider({ children, initialData = {} }) {
    const [state, dispatch] = React.useReducer(dataReducer, {
      sourceColumns: initialData.sourceColumns || [],
      sampleData: initialData.sampleData || [],
      selectedTool: initialData.selectedTool || null,
      mappings: [],
      error: null,
      targetFields: [
        { name: "Incident ID", required: true, category: "incident" },
        { name: "Incident Date", required: true, category: "timestamp" },
        { name: "Incident Time", required: true, category: "timestamp" },
        { name: "Dispatch Time", required: false, category: "timestamp" },
        { name: "En Route Time", required: false, category: "timestamp" },
        { name: "On Scene Time", required: false, category: "timestamp" },
        { name: "Latitude", required: true, category: "location" },
        { name: "Longitude", required: true, category: "location" },
        { name: "Address", required: false, category: "location" },
        { name: "Incident Type", required: true, category: "incident" }
      ],
      expandedCategories: {
        timestamp: true,
        location: true,
        incident: true
      }
    });

    return (
      <DataContext.Provider value={{ state, dispatch }}>
        {children}
      </DataContext.Provider>
    );
  }

  // Custom hook to use the data context
  function useData() {
    const context = React.useContext(DataContext);
    if (!context) {
      throw new Error('useData must be used within a DataProvider');
    }
    return context;
  }

  // Error Display Component
  function ErrorDisplay({ error, onRetry }) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <MaterialUI.Typography variant="h5" color="error" gutterBottom>
          Error Occurred
        </MaterialUI.Typography>
        <MaterialUI.Typography variant="body1" paragraph>
          {error}
        </MaterialUI.Typography>
        {onRetry && (
          <MaterialUI.Button 
            variant="contained" 
            color="primary" 
            onClick={onRetry}
          >
            Retry
          </MaterialUI.Button>
        )}
      </div>
    );
  }

  // Column Mapping UI Component
  function ColumnMappingUI() {
    const { state, dispatch } = useData();
    const { sourceColumns, targetFields, mappings, expandedCategories } = state;

    // Group target fields by category
    const fieldsByCategory = targetFields.reduce((acc, field) => {
      const category = field.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    }, {});

    // DND handlers
    const onDragEnd = (result) => {
      const { source, destination } = result;
      
      // Dropped outside the list
      if (!destination) {
        return;
      }
      
      // Get source column and target field
      const sourceField = sourceColumns[source.index];
      const targetField = destination.droppableId;
      
      // Check if this target already has a mapping
      const existingMapping = mappings.find(m => m.targetField === targetField);
      
      if (existingMapping) {
        // Update existing mapping
        dispatch({
          type: 'UPDATE_MAPPING',
          payload: {
            targetField,
            sourceField
          }
        });
      } else {
        // Add new mapping
        dispatch({
          type: 'ADD_MAPPING',
          payload: {
            targetField,
            sourceField
          }
        });
      }
    };

    // Toggle category expansion
    const toggleCategory = (category) => {
      dispatch({
        type: 'TOGGLE_CATEGORY',
        payload: category
      });
    };

    return (
      <MaterialUI.Box p={3}>
        <MaterialUI.Typography variant="h5" gutterBottom>
          Map Your Data Fields
        </MaterialUI.Typography>
        
        <MaterialUI.Grid container spacing={3}>
          {/* Source columns */}
          <MaterialUI.Grid item xs={12} md={4}>
            <MaterialUI.Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
              <MaterialUI.Typography variant="h6" gutterBottom>
                Source Columns
              </MaterialUI.Typography>
              
              <ReactBeautifulDnD.DragDropContext onDragEnd={onDragEnd}>
                <ReactBeautifulDnD.Droppable droppableId="sourceColumns" isDropDisabled={true}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {sourceColumns.map((column, index) => (
                        <ReactBeautifulDnD.Draggable key={column} draggableId={column} index={index}>
                          {(provided) => (
                            <MaterialUI.Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={1}
                              style={{
                                padding: '8px 16px',
                                margin: '8px 0',
                                backgroundColor: '#f5f5f5',
                                ...provided.draggableProps.style
                              }}
                            >
                              {column}
                            </MaterialUI.Paper>
                          )}
                        </ReactBeautifulDnD.Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </ReactBeautifulDnD.Droppable>
              </ReactBeautifulDnD.DragDropContext>
            </MaterialUI.Paper>
          </MaterialUI.Grid>
          
          {/* Target fields by category */}
          <MaterialUI.Grid item xs={12} md={8}>
            <MaterialUI.Paper elevation={2} style={{ padding: '16px' }}>
              <MaterialUI.Typography variant="h6" gutterBottom>
                Target Fields
              </MaterialUI.Typography>
              
              <ReactBeautifulDnD.DragDropContext onDragEnd={onDragEnd}>
                {Object.keys(fieldsByCategory).map((category) => (
                  <MaterialUI.Box key={category} mb={2}>
                    <MaterialUI.Button
                      fullWidth
                      onClick={() => toggleCategory(category)}
                      variant="outlined"
                      style={{ justifyContent: 'space-between', textTransform: 'capitalize' }}
                    >
                      {category}
                      <MaterialUI.Box component="span" ml={1}>
                        {expandedCategories[category] ? '▼' : '►'}
                      </MaterialUI.Box>
                    </MaterialUI.Button>
                    
                    {expandedCategories[category] && (
                      <MaterialUI.Box mt={1}>
                        {fieldsByCategory[category].map((field) => {
                          const mapping = mappings.find(m => m.targetField === field.name);
                          
                          return (
                            <MaterialUI.Box key={field.name} mb={1}>
                              <ReactBeautifulDnD.Droppable droppableId={field.name}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    <MaterialUI.Paper
                                      elevation={1}
                                      style={{
                                        padding: '8px 16px',
                                        backgroundColor: field.required ? '#e3f2fd' : '#fff',
                                        border: mapping ? '2px solid #4caf50' : '1px solid #e0e0e0'
                                      }}
                                    >
                                      <MaterialUI.Grid container alignItems="center">
                                        <MaterialUI.Grid item xs={8}>
                                          <MaterialUI.Typography>
                                            {field.name}
                                            {field.required && (
                                              <MaterialUI.Chip
                                                size="small"
                                                label="Required"
                                                color="primary"
                                                style={{ marginLeft: 8 }}
                                              />
                                            )}
                                          </MaterialUI.Typography>
                                        </MaterialUI.Grid>
                                        <MaterialUI.Grid item xs={4} style={{ textAlign: 'right' }}>
                                          {mapping && (
                                            <MaterialUI.Box display="flex" alignItems="center" justifyContent="flex-end">
                                              <MaterialUI.Typography variant="body2">
                                                {mapping.sourceField}
                                              </MaterialUI.Typography>
                                              <MaterialUI.IconButton 
                                                size="small"
                                                onClick={() => dispatch({
                                                  type: 'REMOVE_MAPPING',
                                                  payload: { targetField: field.name }
                                                })}
                                              >
                                                ✕
                                              </MaterialUI.IconButton>
                                            </MaterialUI.Box>
                                          )}
                                        </MaterialUI.Grid>
                                      </MaterialUI.Grid>
                                    </MaterialUI.Paper>
                                    {provided.placeholder}
                                  </div>
                                )}
                              </ReactBeautifulDnD.Droppable>
                            </MaterialUI.Box>
                          );
                        })}
                      </MaterialUI.Box>
                    )}
                  </MaterialUI.Box>
                ))}
              </ReactBeautifulDnD.DragDropContext>
            </MaterialUI.Paper>
          </MaterialUI.Grid>
        </MaterialUI.Grid>
        
        <MaterialUI.Box mt={3} display="flex" justifyContent="flex-end">
          <MaterialUI.Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (typeof window !== 'undefined' && window.showFormatterPanels) {
                window.showFormatterPanels();
              }
            }}
          >
            Back to Formatter
          </MaterialUI.Button>
          <MaterialUI.Button 
            variant="contained" 
            color="secondary"
            style={{ marginLeft: 16 }}
            onClick={() => {
              if (typeof window !== 'undefined' && window.onMappingComplete) {
                // Convert mappings to the format expected by the backend
                const mappingObj = {};
                mappings.forEach(mapping => {
                  mappingObj[mapping.targetField] = mapping.sourceField;
                });
                window.onMappingComplete(mappingObj);
              }
            }}
          >
            Apply Mappings
          </MaterialUI.Button>
        </MaterialUI.Box>
      </MaterialUI.Box>
    );
  }

  // Main App Component
  function App({ onMappingComplete }) {
    const { state } = useData();
    
    // Save callback to window for later use
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        window.onMappingComplete = onMappingComplete;
      }
    }, [onMappingComplete]);
    
    if (state.error) {
      return <ErrorDisplay error={state.error} />;
    }
    
    if (!state.sourceColumns.length || !state.selectedTool) {
      return (
        <MaterialUI.Box p={3} textAlign="center">
          <MaterialUI.Typography variant="h5" color="error">
            Missing required data
          </MaterialUI.Typography>
          <MaterialUI.Typography variant="body1">
            Please upload data and select a target tool first.
          </MaterialUI.Typography>
        </MaterialUI.Box>
      );
    }
    
    return <ColumnMappingUI />;
  }

  /**
   * Mount the Data Formatter UI component to a container element
   */
  function mount(container, data, onMappingComplete) {
    if (!container) {
      console.error('No container element provided for DataFormatterUI');
      return;
    }

    // Create a theme
    const theme = MaterialUI.createTheme({
      palette: {
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
      }
    });

    ReactDOM.render(
      <MaterialUI.ThemeProvider theme={theme}>
        <DataProvider initialData={data}>
          <App onMappingComplete={onMappingComplete} />
        </DataProvider>
      </MaterialUI.ThemeProvider>,
      container
    );
  }

  /**
   * Unmount the Data Formatter UI component
   */
  function unmount(container) {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }
  }

  // Export the public API
  exports.mount = mount;
  exports.unmount = unmount;

}));