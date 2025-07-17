function normalizeFieldName(fieldName) {
  if (\!fieldName) return '';
  return fieldName
    .toLowerCase()
    .replace(/[_\-\.]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateFieldSimilarity(field1, field2) {
  const norm1 = normalizeFieldName(field1);
  const norm2 = normalizeFieldName(field2);
  
  console.log('Normalized:', field1, '->', norm1, '|', field2, '->', norm2);
  
  if (norm1 === norm2) return 100;
  if (\!norm1 || \!norm2) return 0;
  
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  console.log('Common words:', commonWords);
  if (commonWords.length > 0) {
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    return Math.round(similarity);
  }
  
  return 9; // This is what the levenshtein would return
}

console.log('Test 1 (incident_number vs incident_id):', calculateFieldSimilarity('incident_number', 'incident_id'));
console.log('Test 2 (incident_id vs temperature):', calculateFieldSimilarity('incident_id', 'temperature')); 
console.log('Test 3 (empty vs empty):', calculateFieldSimilarity('', ''));
