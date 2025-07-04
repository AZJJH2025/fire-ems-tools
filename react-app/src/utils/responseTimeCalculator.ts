import { 
  IncidentRecord, 
  ResponseTimeMetrics, 
  ResponseTimeStatistics 
} from '@/types/analyzer';

/**
 * Parses a date/time string into a Date object
 * Handles various formats including ISO format, time-only strings,
 * and problematic formats like "2020 12:30:28-04-28T04/28/2020 12:30:28"
 */
export const parseDateTime = (
  dateStr: string | undefined, 
  baseDate?: string
): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Process the date string to handle problematic formats
    let processedDateStr = dateStr;
    
    // Handle problematic formats with 'T' separator
    if (processedDateStr.includes('T')) {
      const parts = processedDateStr.split('T');
      
      // Case: "YYYY HH:MM:SS-MM-DD" format in first part (e.g., "2020 12:30:28-04-28T...")
      if (parts[0].includes('-')) {
        const dateParts = parts[0].split('-');
        
        if (dateParts.length >= 2) {
          // First check if second part contains a valid date format
          if (parts.length > 1 && parts[1].includes('/')) {
            // Use MM/DD/YYYY from second part
            const secondPart = parts[1].split(' ')[0];
            if (secondPart.split('/').length === 3) {
              processedDateStr = secondPart;
            }
          } 
          // Otherwise try to reconstruct from parts
          else if (dateParts[0].includes(' ')) {
            const yearTime = dateParts[0].split(' ');
            const year = yearTime[0]; // Extract year (like 2020)
            
            // Handle MM-DD format in second part
            const monthDayParts = dateParts[1].split('-');
            if (monthDayParts.length === 2) {
              const month = monthDayParts[0].padStart(2, '0');
              const day = monthDayParts[1].padStart(2, '0');
              processedDateStr = `${year}-${month}-${day}`;
            }
          }
        }
      }
      // Case: Duplicated date with T - "04/28/2020 12:30:28T04/28/2020 12:30:28"
      else if (parts.length > 1 && parts[0].includes('/')) {
        // Use first part only
        processedDateStr = parts[0];
      }
    }
    
    // If it's just a time string (HH:MM:SS or HH:MM)
    if (processedDateStr.length <= 8 && processedDateStr.includes(':') && 
        !processedDateStr.includes('-') && !processedDateStr.includes('/')) {
      
      if (!baseDate) {
        console.warn("Base date is required for time-only strings:", processedDateStr);
        return null;
      }
      
      // Parse the time components
      const timeParts = processedDateStr.split(':').map(Number);
      const hours = timeParts[0] || 0;
      const minutes = timeParts[1] || 0;
      const seconds = timeParts[2] || 0;
      
      // Create a date object from the base date
      let date: Date;
      try {
        date = new Date(baseDate);
        if (isNaN(date.getTime())) {
          console.warn("Invalid base date:", baseDate);
          return null;
        }
      } catch (e) {
        console.warn("Error parsing base date:", baseDate, e);
        return null;
      }
      
      // Set the time components
      date.setHours(hours, minutes, seconds);
      return date;
    }
    
    // 🔧 HEXAGON DATETIME NORMALIZATION: Handle missing seconds
    // Pattern: "01/20/2024 14:28" should become "01/20/2024 14:28:00"
    if (/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}$/.test(processedDateStr)) {
      processedDateStr = processedDateStr + ':00';
      console.log(`🔧 HEXAGON FIX: Added missing seconds to "${dateStr}" → "${processedDateStr}"`);
    }
    
    // Handle MM/DD/YYYY format - treat as local time, not UTC
    if (processedDateStr.includes('/')) {
      const dateParts = processedDateStr.split('/');
      
      if (dateParts.length === 3) {
        // Extract just the date part if it includes time
        let year = dateParts[2];
        let timePart = '';
        if (year.includes(' ')) {
          const yearTimeParts = year.split(' ');
          year = yearTimeParts[0];
          timePart = yearTimeParts.slice(1).join(' '); // Handle cases with multiple spaces
        }
        
        const month = dateParts[0].trim();
        const day = dateParts[1].trim();
        
        // Validate numeric components
        let yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        
        // Handle 2-digit year conversion: 00-29 = 20xx, 30-99 = 19xx
        if (yearNum >= 0 && yearNum <= 99) {
          if (yearNum <= 29) {
            yearNum += 2000; // 00-29 becomes 2000-2029
          } else {
            yearNum += 1900; // 30-99 becomes 1930-1999
          }
          console.log(`🔧 2-DIGIT YEAR FIX: Converted "${year}" to ${yearNum}`);
        }
        
        if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
          // Create date with local timezone using Date constructor (month is 0-indexed)
          // This ensures the date is treated as local time, not UTC
          const date = new Date(yearNum, monthNum - 1, dayNum);
          
          // If there was a time part, add it as local time
          if (timePart && timePart.includes(':')) {
            const timeComponents = timePart.split(':').map(Number);
            date.setHours(
              timeComponents[0] || 0, 
              timeComponents[1] || 0, 
              timeComponents[2] || 0,
              0 // milliseconds
            );
          }
          
          if (!isNaN(date.getTime())) {
            console.log(`🕒 TIMEZONE FIX: Parsed "${processedDateStr}" as LOCAL time: ${date.toISOString()} (${date.toString()})`);
            return date;
          }
        }
      }
    }
    
    // If it contains both date and time separated by space (e.g., "2025-05-03 14:30:00")
    // Handle as local time to avoid UTC timezone issues
    if (processedDateStr.includes(' ') && processedDateStr.includes('-')) {
      const [datePart, timePart] = processedDateStr.split(' ');
      
      // Parse date part - if in YYYY-MM-DD format, use Date constructor for local time
      let date: Date;
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = datePart.split('-').map(Number);
        date = new Date(year, month - 1, day); // month is 0-indexed, creates local date
      } else {
        date = new Date(datePart); // fallback for other formats
      }
      
      if (!isNaN(date.getTime()) && timePart && timePart.includes(':')) {
        const timeComponents = timePart.split(':').map(Number);
        date.setHours(
          timeComponents[0] || 0, 
          timeComponents[1] || 0, 
          timeComponents[2] || 0,
          0 // milliseconds
        );
        console.log(`🕒 TIMEZONE FIX: Parsed date+time "${processedDateStr}" as LOCAL time: ${date.toISOString()} (${date.toString()})`);
        return date;
      }
    }
    
    // Try direct parsing as a fallback for standard formats
    // IMPORTANT: new Date(string) interprets as UTC if the string contains 'T' or timezone info
    // For local date/time strings without timezone info, this should be treated as local time
    const date = new Date(processedDateStr);
    if (!isNaN(date.getTime())) {
      // Check if this looks like a UTC interpretation that should be local
      if (processedDateStr.includes('/') || (processedDateStr.includes(' ') && !processedDateStr.includes('T') && !processedDateStr.includes('Z') && !processedDateStr.includes('+') && !processedDateStr.includes('-', 10))) {
        console.log(`⚠️ TIMEZONE WARNING: Direct parsing of "${processedDateStr}" may have timezone issues. Result: ${date.toISOString()} (${date.toString()})`);
      } else {
        console.log(`🕒 DIRECT PARSE: "${processedDateStr}" parsed as: ${date.toISOString()} (${date.toString()})`);
      }
      return date;
    }
    
    // Additional validation for specific formats could be added here
    
    console.warn(`Could not parse date string: ${dateStr} (processed as: ${processedDateStr})`);
    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
};

/**
 * Calculates response time metrics for a single incident
 */
export const calculateIncidentMetrics = (
  incident: IncidentRecord
): ResponseTimeMetrics => {
  // Initialize metrics with null values
  const metrics: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  try {
    // Base date to use for time-only strings - ensure it's a valid date
    const baseDate = incident.incidentDate;
    if (!baseDate) {
      console.warn("No incident date available for parsing time-only strings");
      return metrics;
    }
    
    // Log the incident data for debugging
    console.log("=== Processing incident:", incident.incidentId, "===");
    console.log("Base Date:", baseDate);
    console.log("Raw incident data:", {
      incidentTime: incident.incidentTime,
      dispatchTime: incident.dispatchTime,
      enRouteTime: incident.enRouteTime,
      arrivalTime: incident.arrivalTime,
      clearTime: incident.clearTime
    });
    console.log("🧪 CHATGPT DEBUG - Calculator receives incident:", JSON.stringify(incident, null, 2));
    
    // Parse all timestamps with better error handling
    let incidentTime: Date | null = null;
    console.log(`=== INCIDENT TIME PROCESSING DEBUG ===`);
    console.log(`incident object keys:`, Object.keys(incident));
    console.log(`incident.incidentTime value: "${incident.incidentTime}" (type: ${typeof incident.incidentTime})`);
    console.log(`incident.incidentTime is null: ${incident.incidentTime === null}`);
    console.log(`incident.incidentTime is undefined: ${incident.incidentTime === undefined}`);
    console.log(`incident.incidentTime is empty string: ${incident.incidentTime === ''}`);
    console.log(`🔍 FIELD CHECK - Call Receive Time:`, (incident as any)['Call Receive Time']);
    console.log(`🔍 FIELD CHECK - call receive time:`, (incident as any)['call receive time']);
    console.log(`🔍 FIELD CHECK - Incident Time:`, (incident as any)['Incident Time']);
    console.log(`🔍 FIELD CHECK - incident time:`, (incident as any)['incident time']);
    console.log(`🔍 FULL INCIDENT OBJECT:`, JSON.stringify(incident, null, 2));
    
    if (incident.incidentTime && incident.incidentTime !== '' && incident.incidentTime !== null && incident.incidentTime !== undefined) {
      // Check if incident time is date-only format (no time component)
      // Patterns: "12/05/2021", "5/17/2020", "03/22/23", "1/15/2024", "2023-03-22", "03-22-2023"
      const isDateOnlyFormat = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})$/.test(incident.incidentTime.trim());
      
      if (isDateOnlyFormat) {
        console.log(`📅 DATE-ONLY FORMAT DETECTED: incidentTime is "${incident.incidentTime}" - contains no time component`);
        console.log(`📊 DATA QUALITY DECISION: Skipping dispatch time calculation for this incident to maintain data integrity`);
        console.log(`✅ PRESERVING OTHER METRICS: Turnout, travel, scene time, and total incident time will still be calculated where possible`);
        
        // Set incidentTime to null to skip dispatch time calculation
        // This is more honest than using midnight which creates massive time differences
        incidentTime = null;
        console.log(`🚨 INCIDENT TIME SET TO NULL: Dispatch time calculation will be skipped for data integrity`);
      } else {
        incidentTime = parseDateTime(incident.incidentTime, baseDate);
        console.log(`✅ SUCCESS: Using incidentTime: "${incident.incidentTime}" -> ${incidentTime?.toISOString() || 'null'}`);
      }
    } else {
      // If no specific incident time, use the incident date with time set to 00:00:00
      incidentTime = parseDateTime(baseDate, baseDate);
      console.log(`🚨 FALLBACK TRIGGERED: Using incidentDate as fallback (incidentTime was missing/empty): "${baseDate}" -> ${incidentTime?.toISOString() || 'null'}`);
      console.log(`🚨 WHY FALLBACK? incidentTime validation failed:`, {
        'truthy': !!incident.incidentTime,
        'not empty string': incident.incidentTime !== '',
        'not null': incident.incidentTime !== null,
        'not undefined': incident.incidentTime !== undefined,
        'combined': !!(incident.incidentTime && incident.incidentTime !== '' && incident.incidentTime !== null && incident.incidentTime !== undefined)
      });
    }
    console.log(`=== END INCIDENT TIME PROCESSING DEBUG ===`);
    
    const dispatchTime = parseDateTime(incident.dispatchTime, baseDate);
    console.log(`Parsed dispatchTime: ${incident.dispatchTime} -> ${dispatchTime?.toISOString() || 'null'}`);
    
    const enRouteTime = parseDateTime(incident.enRouteTime, baseDate);
    console.log(`Parsed enRouteTime: ${incident.enRouteTime} -> ${enRouteTime?.toISOString() || 'null'}`);
    
    const arrivalTime = parseDateTime(incident.arrivalTime, baseDate);
    console.log(`Parsed arrivalTime: ${incident.arrivalTime} -> ${arrivalTime?.toISOString() || 'null'}`);
    
    const clearTime = parseDateTime(incident.clearTime, baseDate);
    console.log(`Parsed clearTime: ${incident.clearTime} -> ${clearTime?.toISOString() || 'null'}`);
    
    // Calculate time intervals in seconds with validation
    if (incidentTime && dispatchTime) {
      const diff = (dispatchTime.getTime() - incidentTime.getTime()) / 1000;
      // Only accept positive, reasonable values (less than 24 hours)
      if (diff > 0 && diff < 86400) {
        metrics.dispatchTime = diff;
      } else {
        console.warn(`Invalid dispatch time interval: ${diff} seconds`);
      }
    }
    
    if (dispatchTime && enRouteTime) {
      const diff = (enRouteTime.getTime() - dispatchTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400) {
        metrics.turnoutTime = diff;
      } else {
        console.warn(`Invalid turnout time interval: ${diff} seconds`);
      }
    }
    
    if (enRouteTime && arrivalTime) {
      const diff = (arrivalTime.getTime() - enRouteTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400) {
        metrics.travelTime = diff;
      } else {
        console.warn(`Invalid travel time interval: ${diff} seconds`);
      }
    }
    
    if (incidentTime && arrivalTime) {
      const diff = (arrivalTime.getTime() - incidentTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400) {
        metrics.totalResponseTime = diff;
      } else {
        console.warn(`Invalid total response time interval: ${diff} seconds`);
      }
    } else if (!incidentTime && arrivalTime) {
      console.log(`⏭️ SKIPPING TOTAL RESPONSE TIME: incidentTime was null (likely 00:00:00 case), cannot calculate total response time`);
    }
    
    if (arrivalTime && clearTime) {
      let adjustedClearTime = clearTime;
      
      // 🔧 MIDNIGHT ROLLOVER FIX: Handle clear times that cross midnight
      // If clear time appears to be before arrival time, it likely rolled over to next day
      if (clearTime.getTime() < arrivalTime.getTime()) {
        // Add 24 hours to clear time
        adjustedClearTime = new Date(clearTime.getTime() + 86400000); // 24 hours in milliseconds
        console.log(`🌅 MIDNIGHT ROLLOVER FIX: Clear time "${incident.clearTime}" appears to be next day. Adjusted from ${clearTime.toISOString()} to ${adjustedClearTime.toISOString()}`);
      }
      
      const diff = (adjustedClearTime.getTime() - arrivalTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400 * 3) { // Allow up to 3 days for scene time
        metrics.sceneTime = diff;
        console.log(`✅ Scene time calculated: ${diff} seconds (${Math.round(diff/60)} minutes)`);
      } else {
        console.warn(`Invalid scene time interval: ${diff} seconds (arrival: ${arrivalTime.toISOString()}, clear: ${adjustedClearTime.toISOString()})`);
      }
    }
    
    if (incidentTime && clearTime) {
      let adjustedClearTime = clearTime;
      
      // 🔧 MIDNIGHT ROLLOVER FIX: Handle clear times that cross midnight for total incident time
      if (clearTime.getTime() < incidentTime.getTime()) {
        adjustedClearTime = new Date(clearTime.getTime() + 86400000); // Add 24 hours
        console.log(`🌅 MIDNIGHT ROLLOVER FIX (Total): Clear time "${incident.clearTime}" appears to be next day for total incident time calculation`);
      }
      
      const diff = (adjustedClearTime.getTime() - incidentTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400 * 3) { // Allow up to 3 days for total incident time
        metrics.totalIncidentTime = diff;
        console.log(`✅ Total incident time calculated: ${diff} seconds (${Math.round(diff/60)} minutes)`);
      } else {
        console.warn(`Invalid total incident time interval: ${diff} seconds (incident: ${incidentTime.toISOString()}, clear: ${adjustedClearTime.toISOString()})`);
      }
    } else if (!incidentTime && clearTime) {
      console.log(`⏭️ SKIPPING TOTAL INCIDENT TIME: incidentTime was null (likely 00:00:00 case), cannot calculate total incident time`);
    }
  } catch (error) {
    console.error("Error calculating metrics for incident", incident.incidentId, error);
  }
  
  // Log the calculated metrics for debugging
  console.log("Calculated metrics for incident", incident.incidentId, metrics);
  
  return metrics;
};

/**
 * Calculates response time statistics for a collection of incidents
 */
export const calculateResponseTimeStatistics = (
  incidents: IncidentRecord[]
): ResponseTimeStatistics => {
  console.log(`Calculating statistics for ${incidents.length} incidents`);
  
  if (!incidents || !incidents.length) {
    console.warn("No incidents provided for statistics calculation");
    return createEmptyStatistics();
  }
  
  try {
    // Validate input data
    const validIncidents = incidents.filter(incident => {
      // Basic validation - must have at least an ID and date
      if (!incident.incidentId || !incident.incidentDate) {
        console.warn(`Skipping incident missing required fields: ${JSON.stringify(incident)}`);
        return false;
      }
      return true;
    });
    
    if (validIncidents.length === 0) {
      console.warn("No valid incidents found for statistics calculation");
      return createEmptyStatistics();
    }
    
    if (validIncidents.length < incidents.length) {
      console.warn(`Filtered out ${incidents.length - validIncidents.length} invalid incidents`);
    }
    
    // Calculate metrics for each incident
    const allMetrics = validIncidents.map(calculateIncidentMetrics);
    
    // Filter out any metrics that couldn't be calculated
    const validMetrics = allMetrics.filter(metric => {
      // At least one of the metrics should be non-null
      return metric.dispatchTime !== null || 
             metric.turnoutTime !== null || 
             metric.travelTime !== null || 
             metric.totalResponseTime !== null;
    });
    
    if (validMetrics.length === 0) {
      console.warn("No valid metrics could be calculated");
      return createEmptyStatistics();
    }
    
    console.log(`Calculated valid metrics for ${validMetrics.length} out of ${validIncidents.length} incidents`);
    
    // Calculate statistics
    return {
      mean: calculateMean(validMetrics),
      median: calculateMedian(validMetrics),
      ninetiethPercentile: calculatePercentile(validMetrics, 90),
      standardDeviation: calculateStandardDeviation(validMetrics),
      min: calculateMin(validMetrics),
      max: calculateMax(validMetrics),
      count: validMetrics.length
    };
  } catch (error) {
    console.error("Error calculating response time statistics:", error);
    return createEmptyStatistics();
  }
};

/**
 * Creates empty statistics object with all values set to null
 */
const createEmptyStatistics = (): ResponseTimeStatistics => {
  const emptyMetrics: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  return {
    mean: { ...emptyMetrics },
    median: { ...emptyMetrics },
    ninetiethPercentile: { ...emptyMetrics },
    standardDeviation: { ...emptyMetrics },
    min: { ...emptyMetrics },
    max: { ...emptyMetrics },
    count: 0
  };
};

/**
 * Calculates the mean for each metric across all incidents
 */
const calculateMean = (metrics: ResponseTimeMetrics[]): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  // For each metric type
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    // Filter out null values
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null);
    
    if (validValues.length) {
      const sum = validValues.reduce((acc, val) => acc + val, 0);
      result[key] = sum / validValues.length;
    }
  });
  
  return result;
};

/**
 * Calculates the median for each metric
 */
const calculateMedian = (metrics: ResponseTimeMetrics[]): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);
    
    if (validValues.length) {
      const mid = Math.floor(validValues.length / 2);
      result[key] = validValues.length % 2 === 0
        ? (validValues[mid - 1] + validValues[mid]) / 2
        : validValues[mid];
    }
  });
  
  return result;
};

/**
 * Calculates a percentile value for each metric
 */
const calculatePercentile = (
  metrics: ResponseTimeMetrics[],
  percentile: number
): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);
    
    if (validValues.length) {
      const index = Math.ceil((percentile / 100) * validValues.length) - 1;
      result[key] = validValues[Math.max(0, Math.min(index, validValues.length - 1))];
    }
  });
  
  return result;
};

/**
 * Calculates standard deviation for each metric
 */
const calculateStandardDeviation = (metrics: ResponseTimeMetrics[]): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  const means = calculateMean(metrics);
  
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    const mean = means[key];
    if (mean === null) return;
    
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null);
    
    if (validValues.length) {
      const squaredDiffs = validValues.map(value => Math.pow(value - mean, 2));
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / validValues.length;
      result[key] = Math.sqrt(variance);
    }
  });
  
  return result;
};

/**
 * Finds the minimum value for each metric
 */
const calculateMin = (metrics: ResponseTimeMetrics[]): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null);
    
    if (validValues.length) {
      result[key] = Math.min(...validValues);
    }
  });
  
  return result;
};

/**
 * Finds the maximum value for each metric
 */
const calculateMax = (metrics: ResponseTimeMetrics[]): ResponseTimeMetrics => {
  const result: ResponseTimeMetrics = {
    dispatchTime: null,
    turnoutTime: null,
    travelTime: null,
    totalResponseTime: null,
    sceneTime: null,
    totalIncidentTime: null
  };
  
  (Object.keys(result) as Array<keyof ResponseTimeMetrics>).forEach(key => {
    const validValues = metrics
      .map(m => m[key])
      .filter((value): value is number => value !== null);
    
    if (validValues.length) {
      result[key] = Math.max(...validValues);
    }
  });
  
  return result;
};

/**
 * Formats response time in seconds to a human-readable format
 * @param seconds - Time in seconds
 * @param format - Format string: 'full' for "X min Y sec", 'minutes' for "X.Y min", 'seconds' for raw seconds
 */
export const formatResponseTime = (
  seconds: number | null,
  format: 'full' | 'minutes' | 'seconds' = 'full'
): string => {
  if (seconds === null) return 'N/A';
  
  if (format === 'seconds') {
    return `${seconds.toFixed(1)}s`;
  }
  
  if (format === 'minutes') {
    return `${(seconds / 60).toFixed(1)} min`;
  }
  
  // Full format
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  
  if (mins === 0) {
    return `${secs} sec`;
  }
  
  return `${mins} min ${secs} sec`;
};

/**
 * Formats response time with context-appropriate units for statistical tables
 * Uses industry best practices: seconds for dispatch, min:sec for longer times
 * @param seconds - Time in seconds  
 * @param metricType - Type of metric to determine appropriate formatting
 */
export const formatResponseTimeForTable = (
  seconds: number | null,
  metricType: 'dispatch' | 'turnout' | 'travel' | 'total' | 'scene' | 'incident'
): string => {
  if (seconds === null) return 'N/A';
  
  // Dispatch time: Always show in seconds (NFPA standard range: 30-60s)
  if (metricType === 'dispatch') {
    return `${Math.round(seconds)} sec`;
  }
  
  // For all other metrics, use min:sec format when >= 60 seconds
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins} min ${secs} sec`;
  }
  
  // Less than 60 seconds: show in seconds
  return `${Math.round(seconds)} sec`;
};