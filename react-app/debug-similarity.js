// Debug script to test field similarity calculation

function normalizeFieldName(fieldName) {
  if (!fieldName) return '';
  
  return fieldName
    .toLowerCase()
    .replace(/[_\-\.]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function calculateFieldSimilarity(field1, field2) {
  const norm1 = normalizeFieldName(field1);
  const norm2 = normalizeFieldName(field2);
  
  console.log(`Comparing: "${field1}" (normalized: "${norm1}") vs "${field2}" (normalized: "${norm2}")`);
  
  // Handle empty strings first
  if (!norm1 || !norm2) return 0;
  
  // Check for exact matches
  if (norm1 === norm2) {
    console.log('Exact match found: 100%');
    return 100;
  }
  
  // Check for exact word matches
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  console.log(`Words1: [${words1.join(', ')}], Words2: [${words2.join(', ')}]`);
  
  const commonWords = words1.filter(word => words2.includes(word));
  if (commonWords.length > 0) {
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    console.log(`Common words found: [${commonWords.join(', ')}], similarity: ${Math.round(similarity)}%`);
    return Math.round(similarity);
  }
  
  // Check for partial matches using Levenshtein distance
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  console.log(`Levenshtein distance: ${distance}, max length: ${maxLength}, similarity: ${Math.round(similarity)}%`);
  
  // Only return similarity if it's above a meaningful threshold
  const roundedSimilarity = Math.round(similarity);
  return roundedSimilarity >= 20 ? roundedSimilarity : 0;
}

// Test the specific case that's failing
console.log('=== Testing: Incident Number vs incident_id ===');
const result1 = calculateFieldSimilarity('Incident Number', 'incident_id');
console.log(`Final result: ${result1}%\n`);

console.log('=== Testing: Incident Number vs Incident ID ===');
const result2 = calculateFieldSimilarity('Incident Number', 'Incident ID');
console.log(`Final result: ${result2}%\n`);

// Check the target field structure
const mockTargetField = { id: 'incident_id', name: 'Incident ID', description: 'Unique incident identifier', type: 'string', required: true };
console.log('=== Testing against both field ID and display name ===');
const idSimilarity = calculateFieldSimilarity('Incident Number', mockTargetField.id);
const nameSimilarity = calculateFieldSimilarity('Incident Number', mockTargetField.name);
console.log(`ID similarity: ${idSimilarity}%, Name similarity: ${nameSimilarity}%`);
console.log(`Max similarity: ${Math.max(idSimilarity, nameSimilarity)}%`);