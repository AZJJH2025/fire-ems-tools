/**
 * Simplified Column Mapping UI for Data Formatter
 * 
 * This is a non-JSX version of the ColumnMappingUI component that can be loaded
 * directly without requiring Babel transformation. It's a simplified version but
 * provides the core functionality.
 */

(function() {
  // Register the component globally
  window.SimpleColumnMappingUI = function(props) {
    // Destructure props with defaults
    const sourceColumns = props.sourceColumns || [];
    const sampleData = props.sampleData || [];
    const fileId = props.fileId || null;
    const onMappingComplete = props.onMappingComplete;
    
    // Set up React hooks manually
    const [targetFields, setTargetFields] = React.useState([]);
    const [mappings, setMappings] = React.useState({});
    const [isSchemaLoading, setIsSchemaLoading] = React.useState(true);
    
    // Load schema on component mount
    React.useEffect(function() {
      loadSchema();
    }, []);
    
    // Function to load schema
    function loadSchema() {
      setIsSchemaLoading(true);
      
      fetch('/public/standardized_incident_record_schema.json')
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Failed to load schema: ' + response.status);
          }
          return response.json();
        })
        .then(function(schema) {
          console.log('Schema loaded successfully:', schema);
          processSchema(schema);
          setIsSchemaLoading(false);
        })
        .catch(function(error) {
          console.error('Error loading schema:', error);
          setIsSchemaLoading(false);
          
          // Create some default fields as fallback
          const defaultFields = [
            { id: 'incident_id', name: 'Incident ID', required: true, category: 'incident' },
            { id: 'incident_date', name: 'Incident Date', required: true, category: 'timestamp' },
            { id: 'incident_time', name: 'Incident Time', required: true, category: 'timestamp' },
            { id: 'latitude', name: 'Latitude', required: true, category: 'location' },
            { id: 'longitude', name: 'Longitude', required: true, category: 'location' },
            { id: 'incident_type', name: 'Incident Type', required: true, category: 'incident' },
            { id: 'address', name: 'Address', required: false, category: 'location' },
            { id: 'city', name: 'City', required: false, category: 'location' },
            { id: 'state', name: 'State', required: false, category: 'location' },
            { id: 'zip_code', name: 'ZIP Code', required: false, category: 'location' }
          ];
          
          setTargetFields(defaultFields);
        });
    }
    
    // Process schema data
    function processSchema(schema) {
      const fields = [];
      
      // Process required fields
      if (schema.requiredFields && Array.isArray(schema.requiredFields)) {
        schema.requiredFields.forEach(function(field) {
          fields.push({
            ...field,
            id: field.name.replace(/\s+/g, '_').toLowerCase(),
            required: true,
            category: field.category || categorizeField(field.name)
          });
        });
      }
      
      // Process optional fields
      if (schema.optionalFields && Array.isArray(schema.optionalFields)) {
        schema.optionalFields.forEach(function(field) {
          fields.push({
            ...field,
            id: field.name.replace(/\s+/g, '_').toLowerCase(),
            required: false,
            category: field.category || categorizeField(field.name)
          });
        });
      }
      
      setTargetFields(fields);
    }
    
    // Simple categorize function
    function categorizeField(fieldName) {
      const lowerField = fieldName.toLowerCase();
      
      if (lowerField.includes('time') || lowerField.includes('date')) {
        return 'timestamp';
      } else if (lowerField.includes('address') || lowerField.includes('location') || 
                lowerField.includes('latitude') || lowerField.includes('longitude')) {
        return 'location';
      } else if (lowerField.includes('incident') || lowerField.includes('call')) {
        return 'incident';
      } else {
        return 'other';
      }
    }
    
    // Handler for mapping a source column to a target field
    function handleMapField(sourceIndex, targetId) {
      console.log('Mapping source', sourceIndex, 'to target', targetId);
      setMappings(function(prevMappings) {
        const newMappings = { ...prevMappings };
        newMappings[targetId] = parseInt(sourceIndex);
        return newMappings;
      });
    }
    
    // Handler for clearing a mapping
    function handleClearMapping(targetId) {
      console.log('Clearing mapping for', targetId);
      setMappings(function(prevMappings) {
        const newMappings = { ...prevMappings };
        delete newMappings[targetId];
        return newMappings;
      });
    }
    
    // Handler for applying the mappings
    function applyMappings() {
      console.log('Applying mappings:', mappings);
      
      // Create the final mapping object
      const finalMappings = Object.entries(mappings).map(function([targetId, sourceIdx]) {
        const targetField = targetFields.find(field => field.id === targetId);
        return {
          sourceField: sourceColumns[sourceIdx],
          targetField: targetField.name,
          required: targetField.required,
          transformConfig: null  // No transformations in the simple version
        };
      });
      
      // Call the callback function with the mappings
      if (typeof onMappingComplete === 'function') {
        onMappingComplete(finalMappings);
      }
    }
    
    // Create component using React.createElement
    return React.createElement(
      'div', 
      { className: 'column-mapping-container' },
      [
        // Header section
        React.createElement('h2', { key: 'header', style: { marginBottom: '20px' } }, 'Map Your Data Columns'),
        
        // Description
        React.createElement('p', { key: 'description', style: { marginBottom: '20px' } }, 
          'Drag source columns from the left panel to the matching target fields on the right. Required fields are marked with an asterisk (*).'
        ),
        
        // Main grid
        React.createElement('div', { key: 'grid', style: { display: 'flex', flexWrap: 'wrap' } }, [
          // Left panel - Source columns
          React.createElement('div', { key: 'source-panel', style: { flex: '1', minWidth: '300px', marginRight: '20px', marginBottom: '20px' } }, [
            React.createElement('h3', { key: 'source-header' }, 'Source Columns'),
            React.createElement('div', { key: 'source-list', style: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' } },
              sourceColumns.map((column, index) => 
                React.createElement('div', { 
                  key: `source-${index}`,
                  className: 'draggable-source',
                  'data-index': index,
                  'data-column': column,
                  style: { 
                    padding: '8px 12px',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }
                }, column)
              )
            ),
            
            // Sample data preview
            React.createElement('h3', { key: 'sample-header', style: { marginTop: '20px' } }, 'Sample Data'),
            React.createElement('div', { key: 'sample-preview', style: { overflowX: 'auto', maxHeight: '200px', border: '1px solid #eee', borderRadius: '4px' } },
              sampleData.length > 0 ? 
                React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } }, [
                  // Table header
                  React.createElement('thead', { key: 'thead' },
                    React.createElement('tr', {},
                      sourceColumns.map((col, i) => 
                        React.createElement('th', { 
                          key: `th-${i}`,
                          style: { 
                            padding: '8px', 
                            backgroundColor: '#f5f5f5', 
                            borderBottom: '2px solid #ddd',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }
                        }, col)
                      )
                    )
                  ),
                  // Table body
                  React.createElement('tbody', { key: 'tbody' },
                    sampleData.slice(0, 3).map((row, rowIndex) => 
                      React.createElement('tr', { key: `row-${rowIndex}` },
                        sourceColumns.map((col, colIndex) => 
                          React.createElement('td', { 
                            key: `td-${rowIndex}-${colIndex}`,
                            style: {
                              padding: '6px 8px',
                              borderBottom: '1px solid #eee',
                              fontSize: '0.85rem',
                              maxWidth: '150px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            },
                            title: row[col]
                          }, row[col])
                        )
                      )
                    )
                  )
                ]) : 
                React.createElement('div', { style: { padding: '20px', textAlign: 'center', color: '#999' } }, 'No sample data available')
            )
          ]),
          
          // Right panel - Target fields
          React.createElement('div', { key: 'target-panel', style: { flex: '1', minWidth: '300px' } }, [
            React.createElement('h3', { key: 'target-header' }, 'Target Fields'),
            
            // Show loading indicator or target fields
            isSchemaLoading ? 
              React.createElement('div', { key: 'loading', style: { padding: '20px', textAlign: 'center' } },
                React.createElement('p', { style: { color: '#666' } }, 'Loading schema fields...')
              ) :
              [
                // Required fields section
                React.createElement('div', { key: 'required-fields', style: { marginBottom: '20px' } }, [
                  React.createElement('h4', { key: 'required-header', style: { marginBottom: '10px' } }, 'Required Fields'),
                  React.createElement('div', { key: 'required-list', style: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' } },
                    targetFields.filter(field => field.required).length > 0 ?
                      targetFields.filter(field => field.required).map(function(field, index) {
                        const isMapped = mappings[field.id] !== undefined;
                        const mappedSourceName = isMapped ? sourceColumns[mappings[field.id]] : null;
                        
                        return React.createElement('div', {
                          key: `req-field-${index}`,
                          style: {
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: isMapped ? '#e8f5e9' : '#fff',
                            border: '1px solid #ddd',
                            borderLeft: '4px solid ' + (isMapped ? '#4caf50' : '#f44336'),
                            borderRadius: '4px',
                            position: 'relative'
                          }
                        }, [
                          // Field name and required indicator
                          React.createElement('div', { key: 'name', style: { fontWeight: 'bold', marginBottom: '5px' } },
                            field.name + ' *'
                          ),
                          
                          // Field type and category
                          React.createElement('div', { key: 'meta', style: { fontSize: '0.85rem', color: '#666', marginBottom: '10px' } },
                            (field.type || 'text') + ' • ' + field.category
                          ),
                          
                          // Mapping display
                          isMapped ? 
                            React.createElement('div', { key: 'mapping', style: { display: 'flex', alignItems: 'center' } }, [
                              React.createElement('span', { 
                                key: 'mapped', 
                                style: { 
                                  backgroundColor: '#1976d2', 
                                  color: 'white', 
                                  padding: '3px 8px', 
                                  borderRadius: '16px',
                                  fontSize: '0.85rem',
                                  marginRight: '8px'
                                } 
                              }, mappedSourceName),
                              
                              // Clear button
                              React.createElement('button', {
                                key: 'clear',
                                onClick: function() { handleClearMapping(field.id); },
                                style: {
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#f44336',
                                  fontSize: '0.85rem'
                                }
                              }, 'Clear')
                            ]) :
                            
                            // Select source column dropdown
                            React.createElement('select', {
                              key: 'select-source',
                              onChange: function(e) { handleMapField(e.target.value, field.id); },
                              style: {
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }
                            }, [
                              React.createElement('option', { key: 'placeholder', value: '' }, '-- Select source column --'),
                              
                              // Options for each source column
                              sourceColumns.map(function(col, idx) {
                                return React.createElement('option', { key: `src-${idx}`, value: idx }, col);
                              })
                            ])
                        ]);
                      }) :
                      React.createElement('p', { style: { color: '#666', fontStyle: 'italic' } }, 
                        'No required fields found in schema.'
                      )
                  )
                ]),
                
                // Optional fields section
                React.createElement('div', { key: 'optional-fields' }, [
                  React.createElement('h4', { key: 'optional-header', style: { marginBottom: '10px' } }, 'Optional Fields'),
                  React.createElement('div', { key: 'optional-list', style: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' } },
                    targetFields.filter(field => !field.required).length > 0 ?
                      targetFields.filter(field => !field.required).slice(0, 5).map(function(field, index) {
                        const isMapped = mappings[field.id] !== undefined;
                        const mappedSourceName = isMapped ? sourceColumns[mappings[field.id]] : null;
                        
                        return React.createElement('div', {
                          key: `opt-field-${index}`,
                          style: {
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: isMapped ? '#e8f5e9' : '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            position: 'relative'
                          }
                        }, [
                          // Field name
                          React.createElement('div', { key: 'name', style: { fontWeight: 'bold', marginBottom: '5px' } },
                            field.name
                          ),
                          
                          // Field type and category
                          React.createElement('div', { key: 'meta', style: { fontSize: '0.85rem', color: '#666', marginBottom: '10px' } },
                            (field.type || 'text') + ' • ' + field.category
                          ),
                          
                          // Mapping display
                          isMapped ? 
                            React.createElement('div', { key: 'mapping', style: { display: 'flex', alignItems: 'center' } }, [
                              React.createElement('span', { 
                                key: 'mapped', 
                                style: { 
                                  backgroundColor: '#1976d2', 
                                  color: 'white', 
                                  padding: '3px 8px', 
                                  borderRadius: '16px',
                                  fontSize: '0.85rem',
                                  marginRight: '8px'
                                } 
                              }, mappedSourceName),
                              
                              // Clear button
                              React.createElement('button', {
                                key: 'clear',
                                onClick: function() { handleClearMapping(field.id); },
                                style: {
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#f44336',
                                  fontSize: '0.85rem'
                                }
                              }, 'Clear')
                            ]) :
                            
                            // Select source column dropdown
                            React.createElement('select', {
                              key: 'select-source',
                              onChange: function(e) { handleMapField(e.target.value, field.id); },
                              style: {
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }
                            }, [
                              React.createElement('option', { key: 'placeholder', value: '' }, '-- Select source column --'),
                              
                              // Options for each source column
                              sourceColumns.map(function(col, idx) {
                                return React.createElement('option', { key: `src-${idx}`, value: idx }, col);
                              })
                            ])
                        ]);
                      }) :
                      React.createElement('p', { style: { color: '#666', fontStyle: 'italic' } }, 
                        'No optional fields found in schema.'
                      )
                  )
                ])
              ]
          ])
        ]),
        
        // Actions
        React.createElement('div', { key: 'actions', style: { marginTop: '30px', textAlign: 'right' } },
          React.createElement('button', {
            id: 'apply-mapping-btn',
            className: 'primary-btn',
            style: {
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            },
            // Check if any required fields are unmapped
            disabled: targetFields.filter(f => f.required && mappings[f.id] === undefined).length > 0,
            onClick: function() {
              applyMappings();
            }
          }, 'Apply & Preview Transformation')
        ),
        
        // Add instructions for mapping
        React.createElement('div', { key: 'instructions', style: { marginTop: '20px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '4px' } }, [
          React.createElement('h4', { key: 'instructions-header', style: { marginBottom: '10px' } }, 'How to Use:'),
          React.createElement('ol', { key: 'instructions-list', style: { paddingLeft: '20px' } }, [
            React.createElement('li', { key: 'step1' }, 'Select a source column from the dropdown for each target field'),
            React.createElement('li', { key: 'step2' }, 'Match data types when possible (e.g., date columns to date fields)'),
            React.createElement('li', { key: 'step3' }, 'All required fields (marked with *) must be mapped before continuing'),
            React.createElement('li', { key: 'step4' }, 'Click "Apply & Preview Transformation" when finished')
          ])
        ]),
        
        // Note about full version
        React.createElement('p', { key: 'note', style: { marginTop: '20px', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' } },
          'Note: This is a simplified version of the column mapping UI. The full version includes drag-and-drop functionality and field transformations.'
        )
      ]
    );
  };
  
  // Notify that the component is available
  console.log('SimpleColumnMappingUI component registered successfully');
})();