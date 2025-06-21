// Test Volunteer Department Simple DateTime Detection
const fs = require('fs');

console.log('🕐 TESTING VOLUNTEER DEPARTMENT SIMPLE DATETIME DETECTION');
console.log('='.repeat(60));

// Mock the detection module (using our actual logic)
const detectSimpleDateTimePattern = (columnNames, sampleRow) => {
  console.log('🔍 Testing simple datetime pattern (volunteer department style)...');
  
  // Simple field name patterns for volunteer departments
  const simpleDatePattern = /^date$/i;
  const simpleTimePattern = /^time$/i;

  const dateField = columnNames.find(col => simpleDatePattern.test(col));
  const timeField = columnNames.find(col => simpleTimePattern.test(col));

  let confidence = 0;

  if (dateField && timeField) {
    confidence += 0.4;
    console.log(`📅 Found simple date field: "${dateField}"`);
    console.log(`⏰ Found simple time field: "${timeField}"`);

    // Check sample data
    if (sampleRow[dateField] && sampleRow[timeField]) {
      confidence += 0.3;
      console.log(`🧪 Sample data available for validation`);
      console.log(`  Date value: "${sampleRow[dateField]}"`);
      console.log(`  Time value: "${sampleRow[timeField]}"`);
    }
  }

  return {
    type: 'simple',
    confidence,
    dateField,
    timeField,
    description: confidence > 0.5
      ? `Simple datetime pattern detected: basic "${dateField}" + "${timeField}" fields`
      : `Simple pattern check completed - low confidence`
  };
};

// Read and parse CSV
const csvContent = fs.readFileSync('test-volunteer-datetime.csv', 'utf8');
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

// Test simple datetime detection
const result = detectSimpleDateTimePattern(headers, sampleRow);

console.log('📊 DETECTION RESULTS:');
console.log('  Type:', result.type);
console.log('  Confidence:', result.confidence);
console.log('  Date Field:', result.dateField);
console.log('  Time Field:', result.timeField);
console.log('  Description:', result.description);
console.log('');

if (result.confidence > 0.5) {
  console.log('✅ SUCCESS: Volunteer department simple pattern detected!');
  console.log('🎯 EXPECTED MAPPING BEHAVIOR:');
  console.log(`  - Combine "${result.dateField}" + "${result.timeField}" → incident_time`);
  console.log(`  - Use "${result.dateField}" → incident_date`);
  console.log('  - Response Time Analyzer should receive: "01/15/2024 08:30:45"');
  console.log('  - Expected dispatch times: Realistic values (30-60 seconds)');
} else {
  console.log('❌ DETECTION FAILED: Low confidence score');
  console.log('🔧 DEBUG INFO:');
  console.log('  - Check if simple "Date" + "Time" field names exist');
  console.log('  - Verify sample data is available');
  console.log('  - Review confidence scoring thresholds');
}