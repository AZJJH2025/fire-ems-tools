/**
 * Test Script for Data Formatter Central Square Compatibility
 * 
 * Run this in browser console on the Data Formatter page after loading test_centralsquare_incidents.csv
 */

// Test data to simulate Central Square CAD format
const centralSquareTestData = [
  {
    "CAD_INCIDENT_ID": "CS2024-40001",
    "REPORTED_DT": "2024-03-01T08:15:23-05:00",
    "DISPATCH_DT": "2024-03-01T08:16:45-05:00",
    "ARRIVAL_DT": "2024-03-01T08:25:12-05:00",
    "CALL_TYPE": "FIRE",
    "CALL_DESCRIPTION": "Structure Fire",
    "PRIORITY": "1",
    "ADDR_STR": "401 Sunrise Blvd",
    "ADDR_CITY": "Miami",
    "ADDR_STATE": "FL",
    "GEOY": "25.7923",
    "GEOX": "-80.1913",
    "APPARATUS_ID": "E401",
    "FIRST_DUE": "MIA1"
  }
];

// Run test for the Response Time Analyzer tool
function testCentralSquareResponseTimeMapping() {
  console.log("TESTING CENTRAL SQUARE DATA FOR RESPONSE TIME ANALYZER");
  console.log("----------------------------------------------------");
  
  // First confirm the function exists
  if (typeof prepareDataForTool !== 'function') {
    console.error("⚠️ prepareDataForTool function not found - are you on the Data Formatter page?");
    return;
  }
  
  // Test the Central Square data with response time analyzer
  const prepared = prepareDataForTool(centralSquareTestData, 'response-time');
  
  // Check for expected field mappings
  const requiredFields = [
    { source: "CAD_INCIDENT_ID", target: "Run No" },
    { source: "REPORTED_DT", target: "Reported" },
    { source: "DISPATCH_DT", target: "Unit Dispatched" },
    { source: "ARRIVAL_DT", target: "Unit Onscene" },
    { source: "CALL_DESCRIPTION", target: "Nature" },
    { source: "APPARATUS_ID", target: "Unit" },
    { source: "ADDR_CITY", target: "Incident City" },
    { source: "ADDR_STR", target: "Full Address" },
    { source: "GEOY", target: "Latitude" },
    { source: "GEOX", target: "Longitude" }
  ];
  
  // Verify the field mappings one by one
  console.log("Field Mapping Results:");
  console.log("--------------------");
  
  let allMappingsCorrect = true;
  
  requiredFields.forEach(field => {
    const item = prepared[0];
    const sourceValue = centralSquareTestData[0][field.source];
    const targetValue = item[field.target];
    
    let result = sourceValue != null && targetValue != null;
    
    console.log(`${field.source} → ${field.target}: ${result ? "✓" : "✗"}`);
    console.log(`  Source: ${sourceValue}`);
    console.log(`  Target: ${targetValue}`);
    
    if (!result) {
      allMappingsCorrect = false;
    }
  });
  
  console.log("");
  console.log(`Overall Result: ${allMappingsCorrect ? "✅ PASS" : "❌ FAIL"}`);
  
  // Check if latitude/longitude are properly converted to numbers
  if (typeof prepared[0]['Latitude'] === 'number' && typeof prepared[0]['Longitude'] === 'number') {
    console.log("✅ Coordinates properly converted to numbers");
  } else {
    console.log("❌ Coordinates not properly converted to numbers");
    allMappingsCorrect = false;
  }
  
  return allMappingsCorrect;
}

// Run all tests
function runTests() {
  console.log("=== RUNNING DATA FORMATTER COMPATIBILITY TESTS ===");
  console.log("");
  
  const results = [
    testCentralSquareResponseTimeMapping()
  ];
  
  console.log("");
  console.log("=== TEST SUMMARY ===");
  console.log(`${results.filter(r => r).length} of ${results.length} tests passing`);
  console.log("");
  console.log("For testing with actual data files, upload test_centralsquare_incidents.csv");
  console.log("and select Response Time Analyzer as the target tool.");
}

// Execute tests
runTests();