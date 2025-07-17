// Debug script to test warning generation

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

// Simple version of the functions for testing
function normalizeFieldName(fieldName) {
  if (!fieldName) return '';
  return fieldName.toLowerCase().replace(/[_\-\.]/g, ' ').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function calculateFieldSimilarity(field1, field2) {
  const norm1 = normalizeFieldName(field1);
  const norm2 = normalizeFieldName(field2);
  
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 100;
  
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  
  if (commonWords.length > 0) {
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    return Math.round(similarity);
  }
  
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  const roundedSimilarity = Math.round(similarity);
  return roundedSimilarity >= 20 ? roundedSimilarity : 0;
}

function suggestFieldMapping(sourceFields, targetFields, minConfidence = 30) {
  const suggestions = [];
  
  for (const sourceField of sourceFields) {
    let bestMatch = null;
    let bestScore = 0;
    const reasons = [];
    
    for (const targetField of targetFields) {
      const idSimilarity = calculateFieldSimilarity(sourceField, targetField.id);
      const nameSimilarity = calculateFieldSimilarity(sourceField, targetField.name);
      const maxSimilarity = Math.max(idSimilarity, nameSimilarity);
      
      if (maxSimilarity > bestScore) {
        bestMatch = targetField;
        bestScore = maxSimilarity;
        reasons.length = 0;
        
        if (idSimilarity > nameSimilarity) {
          reasons.push(`Field ID similarity: ${idSimilarity}%`);
        } else {
          reasons.push(`Display name similarity: ${nameSimilarity}%`);
        }
        
        if (maxSimilarity === 100) {
          reasons.push('Exact match found');
        }
        
        if (targetField.required && maxSimilarity > 50) {
          reasons.push('Required field prioritized');
        }
      }
    }
    
    suggestions.push({
      sourceField,
      targetField: bestScore >= minConfidence ? bestMatch : null,
      confidence: bestScore,
      reasons: bestScore >= minConfidence ? reasons : ['No suitable match found']
    });
  }
  
  return suggestions;
}

function validateFieldMapping(mapping, targetFields) {
  const errors = [];
  const warnings = [];
  
  // Check for low-confidence mappings
  const sourceFields = mapping.map(m => m.sourceField);
  console.log('Source fields for suggestions:', sourceFields);
  
  const suggestions = suggestFieldMapping(sourceFields, targetFields, 70);
  console.log('Suggestions generated:', suggestions);
  
  for (const suggestion of suggestions) {
    console.log(`Checking suggestion: ${suggestion.sourceField} -> ${suggestion.targetField?.id} (confidence: ${suggestion.confidence}%)`);
    if (suggestion.confidence < 70 && suggestion.targetField) {
      const warningMsg = `Low confidence mapping: ${suggestion.sourceField} → ${suggestion.targetField.name}`;
      console.log('Adding warning:', warningMsg);
      warnings.push(warningMsg);
    }
  }
  
  console.log('Final warnings:', warnings);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Test the failing case
const lowConfidenceMapping = [
  { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
  { sourceField: 'Call Received Date/Time', targetField: 'incident_time', transformations: [] },
  { sourceField: 'Completely Random Unrelated Field Name', targetField: 'city', transformations: [] },
];

console.log('=== Testing low confidence mapping (should generate warnings) ===');
const result = validateFieldMapping(lowConfidenceMapping, mockTargetFields);
console.log('Final result:', result);
console.log('Should have warnings:', result.warnings.length > 0);