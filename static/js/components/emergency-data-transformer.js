/**
 * Emergency Data Transformer
 * This is a direct, reliable method to transform data for Response Time Analyzer
 */

(function() {
  // Register the global transformer
  window.emergencyTransformData = function(originalData) {
    console.log("🚨 EMERGENCY: Using direct data transformer");
    
    if (!originalData || !Array.isArray(originalData) || originalData.length === 0) {
      console.error("No original data to transform");
      return [];
    }
    
    // Log the structure we're working with
    console.log("Original data structure:", Object.keys(originalData[0]));
    
    // Transform each record with explicit field mapping
    return originalData.map(record => {
      // Create a new object with exactly the fields Response Time Analyzer needs
      const transformed = {
        // Required fields with fallbacks
        "Incident ID": record.Inc_ID || record.IncidentID || record.id || "",
        "Latitude": parseFloat(record.GPS_Lat) || 0,
        "Longitude": parseFloat(record.GPS_Lon) || 0,
        "Unit": record.Units || record.Unit || "",
        "Unit Dispatched": record.Disp_Time || record["Unit Dispatched"] || "",
        "Unit Onscene": record.Arriv_Time || record["Unit Onscene"] || "",
        "Reported": record.Call_Time || record.Reported || "",
        
        // Copy other useful fields
        "Incident Date": record.Call_Date || record.Date || "",
        "Incident Time": record.Call_Time || record.Time || "",
        "Incident Type": record.Call_Type || record.Type || "",
        "Address": record.Address_Full || record.Address || "",
        "Priority": record.Priority || "",
        
        // Add source tracking for debugging
        "_source": "emergency_transformer"
      };
      
      return transformed;
    });
  };
  
  // Global emergency storage function
  window.storeEmergencyData = function(data, targetTool) {
    console.log("🚨 EMERGENCY: Storing data using reliable method");
    
    try {
      // Direct storage in sessionStorage
      sessionStorage.setItem('formattedData', JSON.stringify(data));
      sessionStorage.setItem('dataSource', 'formatter');
      sessionStorage.setItem('formatterToolId', targetTool);
      sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
      
      // Store debug info
      sessionStorage.setItem('debugInfo', JSON.stringify({
        timestamp: new Date().toISOString(),
        recordCount: data.length,
        firstRecord: data[0],
        dataKeys: Object.keys(data[0]),
        source: "emergency_transformer"
      }));
      
      console.log("✅ Emergency data stored successfully:", data[0]);
      return true;
    } catch (error) {
      console.error("❌ Emergency storage failed:", error);
      return false;
    }
  };
  
  // Attempt to register this directly when loaded
  console.log("🚨 Emergency data transformer loaded and ready");
})();