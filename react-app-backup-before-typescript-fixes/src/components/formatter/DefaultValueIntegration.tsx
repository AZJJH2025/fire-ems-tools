/**
 * DefaultValueIntegration
 * 
 * This component integrates the default value validation fix into the React
 * application workflow. It ensures that default values are properly applied
 * before validation occurs, fixing issues with required fields validation.
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/state/redux/store';
import { FieldMapping } from '@/types/formatter';
import { defaultValueRegistry } from '@/services/validation/ValidationEnhancer';

// This is a hidden component that integrates with the validation process
const DefaultValueIntegration: React.FC = () => {
  const dispatch = useDispatch();
  const { mappings } = useSelector((state: RootState) => state.formatter);

  // Register all default values whenever mappings change
  useEffect(() => {
    if (mappings && mappings.length > 0) {
      console.log('DefaultValueIntegration: Processing mappings to register default values');
      registerDefaultValues(mappings);
    }
  }, [mappings]);

  // Extract default values from mappings and register them
  const registerDefaultValues = (mappings: FieldMapping[]) => {
    // Process each mapping
    mappings.forEach(mapping => {
      if (mapping.sourceField === '__default__' && mapping.transformations) {
        // Look for default value in transformations
        const defaultTransform = mapping.transformations.find(t => 
          t.type === 'convert' && t.params && t.params.defaultValue !== undefined
        );
        
        if (defaultTransform && defaultTransform.params.defaultValue !== undefined) {
          console.log(`Registering default value for ${mapping.targetField}:`, defaultTransform.params.defaultValue);
          defaultValueRegistry.registerField(
            mapping.targetField, 
            defaultTransform.params.defaultValue
          );
        }
      }
    });
  };

  // This component doesn't render anything
  return null;
};

export default DefaultValueIntegration;