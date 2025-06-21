// Test Hexagon Combined DateTime Detection
const fs = require('fs');

console.log('🕐 TESTING HEXAGON COMBINED DATETIME DETECTION');
console.log('='.repeat(60));

// Mock the detection module (using our actual logic)
const detectCombinedDateTimePattern = (columnNames, sampleRow) => {
  console.log('🔍 Testing combined datetime pattern (Hexagon/CentralSquare style)...');
  
  // Combined field patterns from our actual code
  const combinedFieldPatterns = [
    /^calldatetime$/i,
    /^call_datetime$/i,
    /^incident_datetime$/i,
    /^event_datetime$/i,
    /^call_received_date\/time$/i,
    /^call.*time$/i,
    /^received.*time$/i
  ];

  let combinedField;
  let confidence = 0;

  // Find combined datetime field by name pattern
  for (const column of columnNames) {
    for (const pattern of combinedFieldPatterns) {
      if (pattern.test(column)) {
        combinedField = column;
        confidence += 0.4;
        console.log(`📅⏰ Found potential combined datetime field: "${column}"`);
        break;
      }
    }
    if (combinedField) break;
  }

  // Also check for fields that might contain combined datetime based on content
  if (!combinedField) {
    for (const column of columnNames) {
      const value = sampleRow[column];
      if (value && typeof value === 'string') {
        // Check if it contains both date and time components
        const combinedPattern = /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}/;
        if (combinedPattern.test(value.trim())) {
          combinedField = column;
          confidence += 0.3;
          console.log(`📅⏰ Found combined datetime by content analysis: "${column}" = "${value}"`);
          break;
        }
      }
    }
  }

  // Validate with sample data
  if (combinedField && sampleRow[combinedField]) {
    const combinedValue = String(sampleRow[combinedField]);
    console.log(`🧪 Sample data validation for combined field "${combinedField}": "${combinedValue}"`);

    // Check for full datetime pattern
    const fullDateTimePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}$/,
      /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,
    ];

    const isFullDateTime = fullDateTimePatterns.some(pattern => pattern.test(combinedValue.trim()));
    
    if (isFullDateTime) {
      confidence += 0.4;
      console.log(`✅ Data validation passed - full datetime pattern confirmed`);
    } else {
      console.log(`⚠️ Data validation failed - not a full datetime pattern`);
    }
  }

  return {
    type: 'combined',
    confidence,
    combinedField,
    description: confidence > 0.7
      ? `Combined datetime pattern detected: "${combinedField}" contains full date and time`
      : `Potential combined pattern found but low confidence`
  };
};

// Read and parse CSV
const csvContent = fs.readFileSync('test-hexagon-datetime.csv', 'utf8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');
const sampleRow = {};

// Parse first data row
if (lines.length > 1) {
  const values = lines[1].split(',');
  headers.forEach((header, index) => {
    sampleRow[header] = values[index];
  });
}

console.log('📋 CSV Headers:', headers);
console.log('🧪 Sample Row:', sampleRow);
console.log('');

// Test combined datetime detection
const result = detectCombinedDateTimePattern(headers, sampleRow);

console.log('📊 DETECTION RESULTS:');
console.log('  Type:', result.type);
console.log('  Confidence:', result.confidence);
console.log('  Combined Field:', result.combinedField);
console.log('  Description:', result.description);
console.log('');

if (result.confidence > 0.7) {
  console.log('✅ SUCCESS: Hexagon combined datetime pattern detected!');
  console.log('🎯 EXPECTED MAPPING BEHAVIOR:');
  console.log(`  - "${result.combinedField}" should map directly to incident_time`);
  console.log(`  - Extract date portion from "${result.combinedField}" for incident_date`);
  console.log('  - Response Time Analyzer should receive: "01/15/2024 08:30:45"');
  console.log('  - Expected dispatch times: 30-45 seconds (realistic)');
} else {
  console.log('❌ DETECTION FAILED: Low confidence score');
  console.log('🔧 DEBUG INFO:');
  console.log('  - Field name patterns tested but no strong matches');
  console.log('  - Content analysis may have failed');
  console.log('  - Check confidence scoring thresholds');
}