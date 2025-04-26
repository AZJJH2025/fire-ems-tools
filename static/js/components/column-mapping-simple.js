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
    const [suggestions, setSuggestions] = React.useState({});
    
    // Load schema on component mount
    React.useEffect(function() {
      loadSchema();
    }, []);
    
    // Function to load schema
    function loadSchema() {
      setIsSchemaLoading(true);
      
      fetch('/static/standardized_incident_record_schema.json')
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
          
          // Auto-suggest mappings if we have data
          if (window.originalData && window.originalData.length > 0) {
            generateSuggestions(window.originalData, schema);
          }
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
    
    // Generate mapping suggestions using DataMapper
    function generateSuggestions(data, schema) {
      try {
        // Check if we have the DataMapper service available
        if (window.DataMapper) {
          console.log("Using DataMapper service for auto suggestions");
          // Create a new DataMapper instance with the schema
          const mapper = new DataMapper(schema);
          
          // Get suggestions for the current tool 
          const selectedTool = document.getElementById('target-tool')?.value || 'response-time';
          const mappingSuggestions = mapper.suggestMappings(data, selectedTool);
          
          console.log("Mapping suggestions:", mappingSuggestions);
          
          // Convert the suggested mappings to our format
          const convertedSuggestions = {};
          Object.entries(mappingSuggestions).forEach(([fieldPath, sourceField]) => {
            // Find source column index
            const sourceIndex = sourceColumns.findIndex(col => col === sourceField);
            if (sourceIndex !== -1) {
              // Get field ID from path
              const [category, field] = fieldPath.split('.');
              const fieldId = `${category}_${field}`;
              convertedSuggestions[fieldId] = sourceIndex;
            }
          });
          
          console.log("Converted suggestions:", convertedSuggestions);
          setSuggestions(convertedSuggestions);
          
          // Apply suggestions automatically only if we have good coverage
          const requiredFields = targetFields.filter(f => f.required);
          const suggestedRequiredCount = requiredFields
            .filter(f => convertedSuggestions[f.id] !== undefined)
            .length;
          
          // If we have suggestions for at least half of the required fields, apply them automatically
          if (requiredFields.length > 0 && suggestedRequiredCount >= Math.ceil(requiredFields.length / 2)) {
            console.log(`Auto-applying ${suggestedRequiredCount}/${requiredFields.length} required field suggestions`);
            setMappings(convertedSuggestions);
            
            // Log auto-mapping for user
            if (window.appendLog && typeof window.appendLog === 'function') {
              window.appendLog(`Auto-mapped ${Object.keys(convertedSuggestions).length} fields based on detected field names.`);
            }
          } else {
            console.log("Not enough required fields detected for auto-apply");
            // Don't auto-apply, but keep suggestions available
          }
        }
      } catch (error) {
        console.error("Error generating suggestions:", error);
      }
    }
    
    // Process schema data
    function processSchema(schema) {
      const fields = [];
      
      // Check if we have the new schema format with coreMappings
      if (schema.coreMappings) {
        console.log("Processing new schema format with coreMappings");
        
        // Get the selected tool
        const selectedTool = document.getElementById('target-tool')?.value || 'response-time';
        console.log("Selected tool for requirements:", selectedTool);
        
        // Get required fields for this tool
        const requiredFieldPaths = schema.toolRequirements?.[selectedTool] || [];
        console.log("Required field paths:", requiredFieldPaths);
        
        // Process all core mappings
        Object.entries(schema.coreMappings).forEach(([category, categoryFields]) => {
          Object.entries(categoryFields).forEach(([fieldName, fieldDef]) => {
            const fieldPath = `${category}.${fieldName}`;
            const isRequired = requiredFieldPaths.includes(fieldPath);
            
            fields.push({
              id: `${category}_${fieldName}`,
              name: fieldDef.name,
              required: isRequired,
              category: category,
              type: fieldDef.type || 'string',
              aliases: fieldDef.aliases,
              path: fieldPath
            });
          });
        });
      } else {
        // Fall back to old schema format
        console.log("Falling back to old schema format");
        
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
    
    // Handler for applying all suggestions
    function applyAllSuggestions() {
      console.log('Applying all suggestions:', suggestions);
      setMappings(suggestions);
    }
    
    // Handler for applying the mappings
    function applyMappings() {
      console.log('Applying mappings:', mappings);
      
      // Create the source to schema mappings object for DataMapper
      const schemaFieldMappings = {};
      
      // Get the selected tool from the dropdown
      const selectedTool = document.getElementById('target-tool')?.value || 'response-time';
      
      targetFields.forEach(field => {
        if (mappings[field.id] !== undefined) {
          const sourceField = sourceColumns[mappings[field.id]];
          
          // If field has a path property, use it for DataMapper format
          if (field.path) {
            schemaFieldMappings[field.path] = sourceField;
          } else {
            // Fallback for old format
            schemaFieldMappings[field.name] = sourceField;
          }
        }
      });
      
      // Check if DataMapper is available for transforming data
      if (window.DataMapper && window.originalData && window.originalData.length > 0) {
        console.log("Using DataMapper service for transformation");
        
        try {
          // Create a new DataMapper instance
          const mapper = new DataMapper();
          
          // Set our field mappings
          mapper.setMappings(schemaFieldMappings);
          
          // Log the user-defined mappings for diagnostics
          console.log("User-defined mappings for DataMapper:", schemaFieldMappings);
          
          // Log the transformation start for the user
          if (window.appendLog) {
            window.appendLog(`Transforming ${window.originalData.length} records using schema-based mapping...`);
          }
          
          // Transform the data for the selected tool
          const transformedResult = mapper.transform(window.originalData, selectedTool);
          
          // Validate the transformed data
          const validation = mapper.validate(transformedResult, selectedTool);
          
          // Log the validation results
          console.log("Validation results:", validation);
          
          if (!validation.valid) {
            console.warn("Validation detected issues:", validation.problems);
            
            // Group issues by type for better reporting
            const missingFields = new Set();
            const invalidNumbers = new Set();
            
            validation.problems.forEach(problem => {
              if (problem.issue === 'missing_value') {
                missingFields.add(problem.field);
              } else if (problem.issue === 'invalid_number') {
                invalidNumbers.add(problem.field);
              }
            });
            
            // Log detailed warnings to help the user fix issues
            if (window.appendLog) {
              if (missingFields.size > 0) {
                window.appendLog(`Warning: Missing values detected for ${Array.from(missingFields).join(', ')}`, 'warning');
              }
              
              if (invalidNumbers.size > 0) {
                window.appendLog(`Warning: Invalid number format detected for ${Array.from(invalidNumbers).join(', ')}`, 'warning');
              }
              
              // Specific help for coordinate issues since they're common and critical
              if (missingFields.has('Latitude') || missingFields.has('Longitude') || 
                  invalidNumbers.has('Latitude') || invalidNumbers.has('Longitude')) {
                window.appendLog('Tip: For mapping applications, valid numeric coordinates are required.', 'info');
              }
            }
          } else {
            if (window.appendLog) {
              window.appendLog('Validation successful! All required fields are properly mapped.', 'success');
            }
          }
          
          // Store transformed data globally
          window.transformedData = transformedResult;
          
          console.log("Data transformed successfully using DataMapper");
          console.log("First record sample:", transformedResult[0]);
          
          // Log success for the user
          if (window.appendLog) {
            window.appendLog(`Successfully transformed ${transformedResult.length} records using the DataMapper service.`);
          }
        } catch (error) {
          console.error("Error using DataMapper:", error);
          
          // Log error for the user
          if (window.appendLog) {
            window.appendLog(`Error using DataMapper: ${error.message}. Trying alternative method...`, 'error');
          }
          
          // Fall back to the original transformation method
          createLegacyTransformedData();
        }
      } else {
        // Log the fallback for the user
        if (window.appendLog) {
          window.appendLog('DataMapper service not available, using legacy transformation method.', 'info');
        }
        
        // Use the original transformation method if DataMapper is not available
        createLegacyTransformedData();
      }
      
      // Call the callback function with the mappings
      if (typeof onMappingComplete === 'function') {
        onMappingComplete(schemaFieldMappings);
      }
      
      // Show the formatted panel and enable buttons
      showFormattedPanel();
    }
    
    // Legacy transformation method
    function createLegacyTransformedData() {
      console.log("Using legacy transformation method");
      
      // Create the final mapping object for legacy processing
      const finalMappings = Object.entries(mappings).map(function([targetId, sourceIdx]) {
        const targetField = targetFields.find(field => field.id === targetId);
        return {
          sourceField: sourceColumns[sourceIdx],
          targetField: targetField.name,
          required: targetField.required,
          transformConfig: null  // No transformations in the simple version
        };
      });
      
      // Generate transformed data
      let transformedData = [];
      
      // Only generate data if we have original data to work with
      if (window.originalData && window.originalData.length > 0) {
        // For each row in the original data
        window.originalData.forEach(originalRow => {
          const transformedRow = {};
          
          // Apply each mapping
          Object.entries(mappings).forEach(([targetId, sourceIdx]) => {
            const targetField = targetFields.find(field => field.id === targetId);
            const sourceField = sourceColumns[sourceIdx];
            
            if (targetField && sourceField) {
              // Copy the value from source to target
              transformedRow[targetField.name] = originalRow[sourceField];
            }
          });
          
          // For Response Time Analyzer specifically - add required fields
          // Handle coordinates for mapping
          if (originalRow.GPS_Lat && !transformedRow['Latitude']) {
            transformedRow['Latitude'] = originalRow.GPS_Lat;
          }
          
          if (originalRow.GPS_Lon && !transformedRow['Longitude']) {
            transformedRow['Longitude'] = originalRow.GPS_Lon;
          }
          
          // Handle unit information
          if (originalRow.Units && !transformedRow['Unit']) {
            transformedRow['Unit'] = originalRow.Units;
          }
          
          // Handle time fields for response time analysis
          if (originalRow.Disp_Time && !transformedRow['Unit Dispatched']) {
            transformedRow['Unit Dispatched'] = originalRow.Disp_Time;
          }
          
          if (originalRow.Enr_Time && !transformedRow['Unit Enroute']) {
            transformedRow['Unit Enroute'] = originalRow.Enr_Time;
          }
          
          if (originalRow.Arriv_Time && !transformedRow['Unit Onscene']) {
            transformedRow['Unit Onscene'] = originalRow.Arriv_Time;
          }
          
          // Call time or Reported Time
          if (originalRow.Call_Time && !transformedRow['Reported']) {
            transformedRow['Reported'] = originalRow.Call_Time;
          }
          
          transformedData.push(transformedRow);
        });
        
        // Double-check for Response Time Analyzer required fields
        console.log('Checking for required fields in first record:', 
          transformedData.length > 0 ? JSON.stringify(transformedData[0]) : 'No records');
        
        if (transformedData.length > 0) {
          const first = transformedData[0];
          const required = ['Latitude', 'Longitude', 'Unit', 'Unit Dispatched', 'Unit Onscene', 'Reported'];
          const missing = required.filter(field => !first[field]);
          
          if (missing.length > 0) {
            console.warn(`Still missing fields: ${missing.join(', ')}. Adding direct mappings.`);
            
            // Direct field mapping for all records as fallback
            transformedData = transformedData.map(record => {
              const r = {...record};
              const src = window.originalData.find(o => o.Inc_ID === record['Incident ID']) || {};
              
              if (!r.Latitude && src.GPS_Lat) r.Latitude = src.GPS_Lat;
              if (!r.Longitude && src.GPS_Lon) r.Longitude = src.GPS_Lon;
              if (!r.Unit && src.Units) r.Unit = src.Units;
              if (!r['Unit Dispatched'] && src.Disp_Time) r['Unit Dispatched'] = src.Disp_Time;
              if (!r['Unit Onscene'] && src.Arriv_Time) r['Unit Onscene'] = src.Arriv_Time;
              if (!r.Reported && src.Call_Time) r.Reported = src.Call_Time;
              
              return r;
            });
          }
        }
        
        // Store the transformed data for download/send
        window.transformedData = transformedData;
      }
    }
    
    // Function to show formatted panel and enable buttons
    function showFormattedPanel() {
      console.log('Completing mapping operation and preparing output preview');
      
      // Make sure transformed data is globally accessible for other scripts
      if (window.transformedData && typeof sessionStorage !== 'undefined') {
        try {
          sessionStorage.setItem('tempTransformedData', JSON.stringify(window.transformedData));
          console.log('Stored transformed data in sessionStorage as backup');
        } catch (e) {
          console.error('Failed to store in sessionStorage:', e);
        }
      }
      
      // Show formatter panels (using the global function) - do this BEFORE showing preview
      if (window.showFormatterPanels && typeof window.showFormatterPanels === 'function') {
        window.showFormatterPanels();
      } else {
        // Fallback if the global function isn't available
        const formatterPanels = document.querySelectorAll('.formatter-panel');
        formatterPanels.forEach(panel => {
          panel.style.display = 'block';
        });
        
        // Also hide the mapping container
        const mappingContainer = document.getElementById('column-mapping-container');
        if (mappingContainer) {
          mappingContainer.style.display = 'none';
        }
      }
      
      // Now show the preview if we have data
      if (window.transformedData && window.transformedData.length > 0) {
        // Show output preview if the function exists
        if (window.showOutputPreview && typeof window.showOutputPreview === 'function') {
          console.log('Showing output preview with', window.transformedData.length, 'records');
          window.showOutputPreview(window.transformedData);
        }
      }
      
      // Enable download and send buttons (using the global function)
      if (window.enableDownloadButtons && typeof window.enableDownloadButtons === 'function') {
        window.enableDownloadButtons();
      } else {
        // Fallback if the global function isn't available
        const downloadBtn = document.getElementById('download-btn');
        const sendToToolBtn = document.getElementById('send-to-tool-btn');
        
        if (downloadBtn) {
          downloadBtn.disabled = false;
          console.log('Download button enabled');
        }
        
        if (sendToToolBtn) {
          sendToToolBtn.disabled = false;
          console.log('Send to tool button enabled');
        }
      }
      
      // Log the success
      if (window.appendLog && typeof window.appendLog === 'function') {
        const recordCount = window.transformedData ? window.transformedData.length : 0;
        window.appendLog(`Data formatting complete. ${recordCount} records transformed successfully.`);
        window.appendLog('You can now download the data or send it to another tool.');
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
          'Map source columns from your data to the matching target fields. Required fields are marked with an asterisk (*).'
        ),
        
        // Auto-suggestion button (only show if suggestions are available)
        Object.keys(suggestions).length > 0 ?
          React.createElement('div', { key: 'auto-suggest', style: { marginBottom: '20px' } },
            React.createElement('button', {
              className: 'auto-suggest-btn',
              onClick: applyAllSuggestions,
              style: {
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                marginRight: '10px'
              }
            }, 'Apply Auto-Suggested Mappings'),
            React.createElement('span', { style: { fontSize: '0.9rem', color: '#666' } },
              `(${Object.keys(suggestions).length} fields can be auto-mapped)`
            )
          ) : null,
        
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
                        const isSuggested = suggestions[field.id] !== undefined && mappings[field.id] === undefined;
                        const mappedSourceName = isMapped ? sourceColumns[mappings[field.id]] : null;
                        
                        return React.createElement('div', {
                          key: `req-field-${index}`,
                          style: {
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: isMapped ? '#e8f5e9' : (isSuggested ? '#fff8e1' : '#fff'),
                            border: '1px solid #ddd',
                            borderLeft: '4px solid ' + (isMapped ? '#4caf50' : (isSuggested ? '#ff9800' : '#f44336')),
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
                            
                            // Select source column dropdown with suggestion if available
                            React.createElement('div', { key: 'selection', style: { width: '100%' } }, [
                              // Suggestion indicator if available
                              isSuggested ? 
                                React.createElement('div', { 
                                  key: 'suggestion', 
                                  style: { 
                                    marginBottom: '5px',
                                    fontSize: '0.85rem',
                                    color: '#ff9800',
                                    display: 'flex',
                                    alignItems: 'center'
                                  } 
                                }, [
                                  React.createElement('span', { key: 'suggestion-text' }, 
                                    `Suggested: ${sourceColumns[suggestions[field.id]]}`
                                  ),
                                  React.createElement('button', {
                                    key: 'apply',
                                    onClick: function() { handleMapField(suggestions[field.id], field.id); },
                                    style: {
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#1976d2',
                                      marginLeft: '8px',
                                      fontSize: '0.85rem',
                                      textDecoration: 'underline'
                                    }
                                  }, 'Apply')
                                ]) : null,
                              
                              // Dropdown for selection
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
                      targetFields.filter(field => !field.required).slice(0, 8).map(function(field, index) {
                        const isMapped = mappings[field.id] !== undefined;
                        const isSuggested = suggestions[field.id] !== undefined && mappings[field.id] === undefined;
                        const mappedSourceName = isMapped ? sourceColumns[mappings[field.id]] : null;
                        
                        return React.createElement('div', {
                          key: `opt-field-${index}`,
                          style: {
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: isMapped ? '#e8f5e9' : (isSuggested ? '#fff8e1' : '#fff'),
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
                            
                            // Select source column dropdown with suggestion if available
                            React.createElement('div', { key: 'selection', style: { width: '100%' } }, [
                              // Suggestion indicator if available
                              isSuggested ? 
                                React.createElement('div', { 
                                  key: 'suggestion', 
                                  style: { 
                                    marginBottom: '5px',
                                    fontSize: '0.85rem',
                                    color: '#ff9800',
                                    display: 'flex',
                                    alignItems: 'center'
                                  } 
                                }, [
                                  React.createElement('span', { key: 'suggestion-text' }, 
                                    `Suggested: ${sourceColumns[suggestions[field.id]]}`
                                  ),
                                  React.createElement('button', {
                                    key: 'apply',
                                    onClick: function() { handleMapField(suggestions[field.id], field.id); },
                                    style: {
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#1976d2',
                                      marginLeft: '8px',
                                      fontSize: '0.85rem',
                                      textDecoration: 'underline'
                                    }
                                  }, 'Apply')
                                ]) : null,
                              
                              // Dropdown for selection
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
            React.createElement('li', { key: 'step1' }, 'Yellow fields have auto-suggested mappings you can apply with one click'),
            React.createElement('li', { key: 'step2' }, 'Select a source column from the dropdown for each target field'),
            React.createElement('li', { key: 'step3' }, 'Match data types when possible (e.g., date columns to date fields)'),
            React.createElement('li', { key: 'step4' }, 'All required fields (marked with *) must be mapped before continuing'),
            React.createElement('li', { key: 'step5' }, 'Click "Apply & Preview Transformation" when finished')
          ])
        ])
      ]
    );
  };
  
  // Notify that the component is available
  console.log('SimpleColumnMappingUI component registered successfully');
})();