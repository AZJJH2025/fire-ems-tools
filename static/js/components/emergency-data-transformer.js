/**
 * Emergency Data Transformer
 * This is a direct, reliable method to transform data for Response Time Analyzer
 * and other FireEMS.ai tools. It now uses DataMapper when available.
 */

(function() {
  // Register the global transformer
  window.emergencyTransformData = function(originalData, toolId) {
    console.log("🚨 EMERGENCY: Using enhanced data transformer");
    
    if (!originalData || !Array.isArray(originalData) || originalData.length === 0) {
      console.error("No original data to transform");
      return [];
    }
    
    // Default tool to response-time if not specified
    toolId = toolId || 'response-time';
    
    // Log the structure we're working with
    console.log("Original data structure:", Object.keys(originalData[0]));
    
    // Try using DataMapper first if available
    if (window.DataMapper) {
      try {
        console.log("Using DataMapper service for emergency transformation");
        const mapper = new DataMapper();
        
        // Auto-detect mappings based on field names
        const mappings = mapper.suggestMappings(originalData, toolId);
        console.log("Auto-detected mappings:", mappings);
        
        if (Object.keys(mappings).length > 0) {
          // Set the mappings and transform the data
          mapper.setMappings(mappings);
          const result = mapper.transform(originalData, toolId);
          
          // Validate the transformed data
          const validation = mapper.validate(result, toolId);
          if (!validation.valid) {
            console.warn("DataMapper validation issues:", validation.problems);
          }
          
          console.log("DataMapper transformed data successfully:", result[0]);
          return result;
        } else {
          console.warn("No mappings could be auto-detected, falling back to direct transformation");
        }
      } catch (error) {
        console.error("Error using DataMapper:", error);
        console.warn("Falling back to direct transformation");
      }
    }
    
    // Direct transformation as a fallback
    return originalData.map(record => {
      // Create a new object with exactly the fields Response Time Analyzer needs
      const transformed = {
        // Required fields with fallbacks
        "Incident ID": record.Inc_ID || record.IncidentID || record.id || record.Call_ID || record.EventID || "",
        "Latitude": parseFloat(record.GPS_Lat || record.Lat || record.LATITUDE || record.lat || record.Y || 0),
        "Longitude": parseFloat(record.GPS_Lon || record.Lon || record.Long || record.LONGITUDE || record.lon || record.X || 0),
        "Unit": record.Units || record.Unit || record.Unit_ID || record.Apparatus || record.UnitName || "",
        "Unit Dispatched": record.Disp_Time || record["Unit Dispatched"] || record.DispatchTime || record.TimeDispatched || "",
        "Unit Onscene": record.Arriv_Time || record["Unit Onscene"] || record.ArrivalTime || record.TimeArrived || record.OnSceneTime || "",
        "Reported": record.Call_Time || record.Reported || record.Time || record.IncidentTime || record.EventTime || "",
        
        // Copy other useful fields
        "Incident Date": record.Call_Date || record.Date || record.IncidentDate || record.EventDate || "",
        "Incident Time": record.Call_Time || record.Time || record.IncidentTime || record.EventTime || "",
        "Incident Type": record.Call_Type || record.Type || record.Nature || record.IncidentType || record.EventType || "",
        "Address": record.Address_Full || record.Address || record.FullAddress || record.Location || record.StreetAddress || "",
        "Priority": record.Priority || record.Call_Priority || record.CallPriority || "",
        
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
      
      // Also store in tempTransformedData as a backup
      try {
        sessionStorage.setItem('tempTransformedData', JSON.stringify(data));
      } catch (e) {
        console.warn("Could not store backup in tempTransformedData:", e);
      }
      
      console.log("✅ Emergency data stored successfully:", data[0]);
      return true;
    } catch (error) {
      console.error("❌ Emergency storage failed:", error);
      return false;
    }
  };
  
  // Attempt to register this directly when loaded
  console.log("🚨 Enhanced emergency data transformer loaded and ready");
})();