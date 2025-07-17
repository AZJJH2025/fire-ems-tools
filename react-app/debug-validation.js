// Debug script to test validation logic

const mockTargetFields = [
  { id: 'incident_id', name: 'Incident ID', description: 'Unique incident identifier', type: 'string', required: true },
  { id: 'incident_time', name: 'Call Received Date/Time', description: 'Date and time call was received', type: 'datetime', required: true },
  { id: 'dispatch_time', name: 'Dispatch Time', description: 'Time units were dispatched', type: 'time', required: false },
  { id: 'incident_type', name: 'Incident Type', description: 'Type of incident', type: 'string', required: false },
  { id: 'latitude', name: 'Latitude', description: 'Geographic latitude', type: 'number', required: false },
  { id: 'longitude', name: 'Longitude', description: 'Geographic longitude', type: 'number', required: false },
  { id: 'address', name: 'Address', description: 'Street address', type: 'string', required: false },
  { id: 'city', name: 'City', description: 'City name', type: 'string', required: false },
  { id: 'state', name: 'State', description: 'State abbreviation', type: 'string', required: false }
];

function validateFieldMapping(mapping, targetFields) {
  const errors = [];
  const warnings = [];
  
  // Check for required fields
  const requiredFields = targetFields.filter(f => f.required);
  const mappedTargetFields = mapping.map(m => m.targetField);
  
  console.log('Required fields:', requiredFields.map(f => f.id));
  console.log('Mapped target fields:', mappedTargetFields);
  
  for (const requiredField of requiredFields) {
    if (!mappedTargetFields.includes(requiredField.id)) {
      const errorMsg = `Required field '${requiredField.name}' is not mapped`;
      console.log('Adding error:', errorMsg);
      errors.push(errorMsg);
    }
  }
  
  console.log('Errors found:', errors);
  console.log('IsValid:', errors.length === 0);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Test the failing case
const incompleteMapping = [
  { sourceField: 'Dispatch Time', targetField: 'dispatch_time', transformations: [] },
];

console.log('=== Testing incomplete mapping (should fail) ===');
const result = validateFieldMapping(incompleteMapping, mockTargetFields);
console.log('Final result:', result);
console.log('Should be invalid:', !result.isValid);
console.log('Has required field errors:', result.errors.some(e => e.includes('incident_id') || e.includes('incident_time')));