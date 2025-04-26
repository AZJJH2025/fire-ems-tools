/**
 * Simple Field Mapper Component
 * 
 * A lightweight React component that uses the MapFieldsManager to provide
 * basic field mapping functionality without the full complexity of the
 * ColumnMappingUI component.
 * 
 * This component can be used in tools that need simple field mapping
 * without the full drag-and-drop interface.
 */

import React, { useState, useEffect } from 'react';

const SimpleMapperComponent = ({ 
  sourceData, 
  targetTool, 
  onMappingComplete,
  className
}) => {
  // State management
  const [sourceFields, setSourceFields] = useState([]);
  const [targetFields, setTargetFields] = useState([]);
  const [mappings, setMappings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract source fields on component mount
  useEffect(() => {
    if (sourceData && sourceData.length > 0) {
      setSourceFields(Object.keys(sourceData[0]));
    }
  }, [sourceData]);

  // Load target fields for the specified tool
  useEffect(() => {
    if (targetTool && window.FireEMS?.Utils?.MapFieldsManager) {
      try {
        const fields = window.FireEMS.Utils.MapFieldsManager.getRequiredFieldsForTool(targetTool);
        setTargetFields(fields);
        setIsLoading(false);
      } catch (err) {
        setError('Error loading target fields: ' + err.message);
        setIsLoading(false);
      }
    }
  }, [targetTool]);

  // Auto-generate mappings when both source and target fields are available
  useEffect(() => {
    if (sourceFields.length && targetFields.length && window.FireEMS?.Utils?.MapFieldsManager) {
      try {
        const autoMappings = window.FireEMS.Utils.MapFieldsManager.autoGenerateMappings(
          sourceFields,
          targetFields,
          { useIndices: false, sampleData: sourceData }
        );
        setMappings(autoMappings);
      } catch (err) {
        setError('Error generating mappings: ' + err.message);
      }
    }
  }, [sourceFields, targetFields, sourceData]);

  // Handle mapping change
  const handleMappingChange = (targetFieldId, sourceField) => {
    setMappings(prev => ({
      ...prev,
      [targetFieldId]: sourceField
    }));
  };

  // Handle apply mappings button click
  const handleApplyMappings = () => {
    if (!window.FireEMS?.Utils?.MapFieldsManager) {
      setError('MapFieldsManager not available');
      return;
    }

    try {
      // Apply the mappings to the source data
      const mappedData = window.FireEMS.Utils.MapFieldsManager.applyMappings(
        sourceData,
        mappings
      );

      // Validate the mapped data for the target tool
      const validationResult = window.FireEMS.Utils.MapFieldsManager.validateMappedData(
        mappedData[0],
        targetTool
      );

      // Call the callback with results
      if (typeof onMappingComplete === 'function') {
        onMappingComplete({
          mappedData,
          mappings,
          validation: validationResult
        });
      }
    } catch (err) {
      setError('Error applying mappings: ' + err.message);
    }
  };

  // UI rendering
  if (isLoading) {
    return <div className={className}>Loading field information...</div>;
  }

  if (error) {
    return <div className={className} style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className={className}>
      <h3>Field Mapping</h3>
      
      {targetFields.length === 0 ? (
        <p>No target fields defined for this tool</p>
      ) : (
        <table className="field-mapping-table">
          <thead>
            <tr>
              <th>Target Field</th>
              <th>Source Field</th>
            </tr>
          </thead>
          <tbody>
            {targetFields.map(field => (
              <tr key={field.id}>
                <td>
                  {field.name} {field.required && <span style={{ color: 'red' }}>*</span>}
                </td>
                <td>
                  <select
                    value={mappings[field.id] || ''}
                    onChange={(e) => handleMappingChange(field.id, e.target.value)}
                  >
                    <option value="">-- Select Field --</option>
                    {sourceFields.map(sourceField => (
                      <option key={sourceField} value={sourceField}>
                        {sourceField}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div className="actions">
        <button
          onClick={handleApplyMappings}
          disabled={targetFields.some(field => field.required && !mappings[field.id])}
        >
          Apply Mappings
        </button>
      </div>
    </div>
  );
};

export default SimpleMapperComponent;