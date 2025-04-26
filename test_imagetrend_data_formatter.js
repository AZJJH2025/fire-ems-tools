/**
 * Test Script for Data Formatter ImageTrend Compatibility
 * 
 * Run this in browser console on the Data Formatter page after loading imagetrend_incidents.csv
 */

// Test data to simulate ImageTrend format based on the sample dataset
const imageTrendTestData = [
  {
    "IncidentPK": "IT001",
    "IncidentDate": "2023-01-01",
    "IncidentTime": "08:15:00",
    "NatureOfCall": "Structure Fire",
    "AlarmLevel": "First Alarm",
    "StreetAddress": "123 Main St",
    "City": "Cityville",
    "State": "AZ",
    "PostalCode": "85001",
    "Latitude": "33.4502",
    "Longitude": "-112.0731",
    "CommonName": "Downtown Apartments",
    "DispatchTime": "08:15:23",
    "EnRouteTime": "08:17:45",
    "ArriveTime": "08:23:12",
    "DepartSceneTime": "10:05:45",
    "InQuartersTime": "10:25:30",
    "VehicleID": "E15",
    "StationID": "Station 3",
    "CrewList": "Smith J, Johnson S, Brown M",
    "RoleOnScene": "First Due",
    "UnitType": "Engine",
    "IncidentTypeCode": "111-Building fire",
    "ActionsTaken": "11-Extinguishment, 12-Salvage",
    "PropertyUse": "429-Multi-family dwelling",
    "ResourceCount": "5",
    "PatientCount": "0",
    "AreaOfOrigin": "Kitchen,11",
    "ItemFirstIgnited": "Cooking materials",
    "IgnitionSource": "Cooking equipment",
    "PresenceOfDetectors": "Present and operated",
    "FormType": "NFIRS Basic",
    "FormVersion": "5.0",
    "FormStatus": "Complete",
    "FormCompletionRate": "100"
  }
];

// Run test for the Response Time Analyzer tool
function testImageTrendResponseTimeMapping() {
  console.log("TESTING IMAGETREND DATA FOR RESPONSE TIME ANALYZER");
  console.log("--------------------------------------------------");
  
  // First confirm the function exists
  if (typeof identifyCADSystem !== 'function') {
    console.error("⚠️ identifyCADSystem function not found - are you on the Data Formatter page?");
    return;
  }
  
  // First test if the ImageTrend format is correctly detected
  const detectedSystem = identifyCADSystem(imageTrendTestData[0]);
  console.log(`CAD System Detection: ${detectedSystem}`);
  let systemDetected = detectedSystem === 'ImageTrend';
  
  // Test fields that should be processed for the Response Time Analyzer
  if (typeof processImageTrendData !== 'function') {
    console.error("⚠️ processImageTrendData function not found - has it been implemented?");
    return;
  }
  
  // Call processImageTrendData directly to test it
  const processed = processImageTrendData(imageTrendTestData, 'response-time');
  
  // Check for expected field mappings
  const requiredFields = [
    { source: "IncidentPK", target: "Incident ID" },
    { source: "IncidentPK", target: "Run No" },
    { source: "IncidentDate", target: "Incident Date" },
    { source: "IncidentTime", target: "Incident Time" },
    { source: "IncidentTime", target: "Reported" },
    { source: "DispatchTime", target: "Unit Dispatched" },
    { source: "EnRouteTime", target: "Unit Enroute" },
    { source: "ArriveTime", target: "Unit Onscene" },
    { source: "StreetAddress", target: "Full Address" },
    { source: "City", target: "Incident City" },
    { source: "Latitude", target: "Latitude" },
    { source: "Longitude", target: "Longitude" },
    { source: "IncidentTypeCode", target: "Incident Type" },
    { source: "NatureOfCall", target: "Nature" },
    { source: "VehicleID", target: "Unit" },
    { source: "StationID", target: "Station" }
  ];
  
  // Verify the field mappings one by one
  console.log("Field Mapping Results:");
  console.log("--------------------");
  
  let allMappingsCorrect = true;
  
  requiredFields.forEach(field => {
    const item = processed[0];
    const sourceValue = imageTrendTestData[0][field.source];
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
  if (typeof processed[0]['Latitude'] === 'number' && typeof processed[0]['Longitude'] === 'number') {
    console.log("✅ Coordinates properly converted to numbers");
  } else {
    console.log("❌ Coordinates not properly converted to numbers");
    allMappingsCorrect = false;
  }
  
  return systemDetected && allMappingsCorrect;
}

// Test for the Call Density Heatmap tool
function testImageTrendCallDensityMapping() {
  console.log("TESTING IMAGETREND DATA FOR CALL DENSITY HEATMAP");
  console.log("-----------------------------------------------");
  
  // Call processImageTrendData directly to test it
  const processed = processImageTrendData(imageTrendTestData, 'call-density');
  
  // Check for expected field mappings
  const requiredFields = [
    { source: "IncidentPK", target: "Incident ID" },
    { source: "IncidentDate", target: "Incident Date" },
    { source: "IncidentTime", target: "Incident Time" },
    { source: "Latitude", target: "Latitude" },
    { source: "Longitude", target: "Longitude" },
    { source: "IncidentTypeCode", target: "Incident Type" }
  ];
  
  // Verify the field mappings one by one
  console.log("Field Mapping Results:");
  console.log("--------------------");
  
  let allMappingsCorrect = true;
  
  requiredFields.forEach(field => {
    const item = processed[0];
    const sourceValue = imageTrendTestData[0][field.source];
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
  
  return allMappingsCorrect;
}

// Test for the Incident Logger tool
function testImageTrendIncidentLoggerMapping() {
  console.log("TESTING IMAGETREND DATA FOR INCIDENT LOGGER");
  console.log("------------------------------------------");
  
  // Call processImageTrendData directly to test it
  const processed = processImageTrendData(imageTrendTestData, 'incident-logger');
  
  // Check for expected field mappings
  const requiredFields = [
    { source: "IncidentPK", target: "Incident ID" },
    { source: "IncidentDate", target: "Incident Date" },
    { source: "IncidentTime", target: "Incident Time" },
    { source: "IncidentTypeCode", target: "Incident Type" },
    { source: "StreetAddress", target: "Address" },
    { source: "VehicleID", target: "Unit ID" },
    { source: "Latitude", target: "Latitude" },
    { source: "Longitude", target: "Longitude" },
    { source: "PatientCount", target: "Patient Info" }
  ];
  
  // Verify the field mappings one by one
  console.log("Field Mapping Results:");
  console.log("--------------------");
  
  let allMappingsCorrect = true;
  
  requiredFields.forEach(field => {
    const item = processed[0];
    const sourceValue = imageTrendTestData[0][field.source];
    const targetValue = item[field.target];
    
    // Special handling for the Patient Info field which is a composite field
    let result = false;
    if (field.target === "Patient Info") {
      result = item[field.target] && item[field.target].includes(sourceValue);
    } else {
      result = sourceValue != null && targetValue != null;
    }
    
    console.log(`${field.source} → ${field.target}: ${result ? "✓" : "✗"}`);
    console.log(`  Source: ${sourceValue}`);
    console.log(`  Target: ${targetValue}`);
    
    if (!result) {
      allMappingsCorrect = false;
    }
  });
  
  console.log("");
  console.log(`Overall Result: ${allMappingsCorrect ? "✅ PASS" : "❌ FAIL"}`);
  
  return allMappingsCorrect;
}

// Run all tests
function runTests() {
  console.log("=== RUNNING IMAGETREND DATA FORMATTER COMPATIBILITY TESTS ===");
  console.log("");
  
  const results = [
    testImageTrendResponseTimeMapping(),
    testImageTrendCallDensityMapping(),
    testImageTrendIncidentLoggerMapping()
  ];
  
  console.log("");
  console.log("=== TEST SUMMARY ===");
  console.log(`${results.filter(r => r).length} of ${results.length} tests passing`);
  console.log("");
  console.log("For testing with actual data files, upload imagetrend_incidents.csv");
  console.log("and select different target tools to verify compatibility.");
}

// Execute tests
runTests();