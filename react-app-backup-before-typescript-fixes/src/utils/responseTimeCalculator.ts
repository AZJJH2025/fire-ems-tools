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
    
    // Handle MM/DD/YYYY format
    if (processedDateStr.includes('/')) {
      const dateParts = processedDateStr.split('/');
      
      if (dateParts.length === 3) {
        // Extract just the date part if it includes time
        let year = dateParts[2];
        if (year.includes(' ')) {
          year = year.split(' ')[0];
        }
        
        const month = dateParts[0].trim();
        const day = dateParts[1].trim();
        
        // Validate numeric components
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        
        if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
          // Create date with numeric values (month is 0-indexed)
          const date = new Date(yearNum, monthNum - 1, dayNum);
          
          // If there was a time part, add it
          if (dateParts[2].includes(' ')) {
            const timePart = dateParts[2].split(' ')[1];
            if (timePart && timePart.includes(':')) {
              const timeComponents = timePart.split(':').map(Number);
              date.setHours(
                timeComponents[0] || 0, 
                timeComponents[1] || 0, 
                timeComponents[2] || 0
              );
            }
          }
          
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }
    
    // If it contains both date and time separated by space (e.g., "2025-05-03 14:30:00")
    if (processedDateStr.includes(' ') && processedDateStr.includes('-')) {
      const [datePart, timePart] = processedDateStr.split(' ');
      const date = new Date(datePart);
      
      if (!isNaN(date.getTime()) && timePart && timePart.includes(':')) {
        const timeComponents = timePart.split(':').map(Number);
        date.setHours(
          timeComponents[0] || 0, 
          timeComponents[1] || 0, 
          timeComponents[2] || 0
        );
        return date;
      }
    }
    
    // Try direct parsing as a fallback for standard formats
    const date = new Date(processedDateStr);
    if (!isNaN(date.getTime())) {
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
    console.log("Processing incident:", incident.incidentId, "Date:", baseDate);
    
    // Parse all timestamps with better error handling
    let incidentTime: Date | null = null;
    if (incident.incidentTime) {
      incidentTime = parseDateTime(incident.incidentTime, baseDate);
      console.log(`Parsed incidentTime: ${incident.incidentTime} -> ${incidentTime?.toISOString() || 'null'}`);
    } else {
      // If no specific incident time, use the incident date with time set to 00:00:00
      incidentTime = parseDateTime(baseDate, baseDate);
      console.log(`Using incidentDate as fallback: ${baseDate} -> ${incidentTime?.toISOString() || 'null'}`);
    }
    
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
    }
    
    if (arrivalTime && clearTime) {
      const diff = (clearTime.getTime() - arrivalTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400 * 3) { // Allow up to 3 days for scene time
        metrics.sceneTime = diff;
      } else {
        console.warn(`Invalid scene time interval: ${diff} seconds`);
      }
    }
    
    if (incidentTime && clearTime) {
      const diff = (clearTime.getTime() - incidentTime.getTime()) / 1000;
      if (diff > 0 && diff < 86400 * 3) { // Allow up to 3 days for total incident time
        metrics.totalIncidentTime = diff;
      } else {
        console.warn(`Invalid total incident time interval: ${diff} seconds`);
      }
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