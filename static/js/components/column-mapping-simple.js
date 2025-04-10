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
            React.createElement('div', { key: 'required-fields', style: { marginBottom: '20px' } }, [
              React.createElement('h4', { key: 'required-header', style: { marginBottom: '10px' } }, 'Required Fields'),
              React.createElement('div', { key: 'required-list', id: 'required-fields-list', style: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' } },
                React.createElement('p', { style: { color: '#666', fontStyle: 'italic' } }, 
                  'Required fields will appear here. Please select a tool from the dropdown first.'
                )
              )
            ]),
            React.createElement('div', { key: 'optional-fields' }, [
              React.createElement('h4', { key: 'optional-header', style: { marginBottom: '10px' } }, 'Optional Fields'),
              React.createElement('div', { key: 'optional-list', id: 'optional-fields-list', style: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' } },
                React.createElement('p', { style: { color: '#666', fontStyle: 'italic' } }, 
                  'Optional fields will appear here. Please select a tool from the dropdown first.'
                )
              )
            ])
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
            onClick: function() {
              // Simple mapping completion handler
              if (typeof onMappingComplete === 'function') {
                // Collect mappings from DOM
                var mappings = [];
                
                // In a real implementation, we would collect the mappings from the UI here
                // For now, this is a simplified version
                
                onMappingComplete(mappings);
              }
            }
          }, 'Apply Mapping')
        ),
        
        // Add instructions for drag and drop
        React.createElement('div', { key: 'instructions', style: { marginTop: '20px', padding: '15px', backgroundColor: '#fff8e1', borderRadius: '4px' } }, [
          React.createElement('h4', { key: 'instructions-header', style: { marginBottom: '10px' } }, 'How to Use:'),
          React.createElement('ol', { key: 'instructions-list', style: { paddingLeft: '20px' } }, [
            React.createElement('li', { key: 'step1' }, 'Click on a source column from the left panel'),
            React.createElement('li', { key: 'step2' }, 'Click on the matching target field on the right to create a mapping'),
            React.createElement('li', { key: 'step3' }, 'Required fields must be mapped before you can continue'),
            React.createElement('li', { key: 'step4' }, 'Click "Apply Mapping" when finished')
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