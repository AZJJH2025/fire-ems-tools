/**
 * Phoenix Fire Department Incident Generator
 * Generates 5000 realistic incidents in Motorola PremierOne CAD format
 * 
 * This script creates a large dataset of realistic PFD incidents with:
 * - Proper incident numbers (PFD-YYYYMMDD-XXXX format)
 * - Realistic timestamps for call received, dispatch, and arrival times
 * - Appropriate response times based on district and time of day
 * - Accurate Phoenix locations and districts
 * - Complete unit status progressions (D→ER→OS→AQ/AH)
 */

// Constants and configuration
const INCIDENTS_TO_GENERATE = 5000;
const OUTPUT_FILE = '../data/incidents/phoenix_motorola_cad_incidents.csv';
const START_DATE = new Date('2025-02-28');
const END_DATE = new Date('2025-03-30'); // Approximately 30 days

// Phoenix districts (1-8) with their boundaries and common street addresses
const PHOENIX_DISTRICTS = {
  1: {
    center: { lat: 33.4599, lon: -112.0703 },
    radius: 0.03,
    addresses: [
      "1025 N 3rd St", "401 W Clarendon Ave", "615 E Portland St", "800 N Central Ave", 
      "920 E Van Buren St", "222 E Roosevelt St", "1101 N Central Ave", "1 E Washington St",
      "333 E Jefferson St", "555 N 7th St"
    ]
  },
  2: {
    center: { lat: 33.4047, lon: -112.1307 },
    radius: 0.04,
    addresses: [
      "4235 S 35th Pl", "3800 S Central Ave", "5802 S 16th St", "4444 S 7th Ave", 
      "3660 W Southern Ave", "5220 S 7th Ave", "3501 E Broadway Rd", "6239 S 7th St",
      "4747 S Central Ave", "3636 S 43rd Ave"
    ]
  },
  3: {
    center: { lat: 33.3052, lon: -111.9774 },
    radius: 0.03,
    addresses: [
      "4848 E Chandler Blvd", "2020 W Baseline Rd", "4510 E Ray Rd", "4747 E Elliot Rd", 
      "3232 E Chandler Blvd", "5050 E Warner Rd", "4747 E Warner Rd", "4747 E Guadalupe Rd",
      "3901 E Baseline Rd", "2080 W Frye Rd"
    ]
  },
  4: {
    center: { lat: 33.4855, lon: -112.0308 },
    radius: 0.035,
    addresses: [
      "3602 N 24th St", "4001 N 24th St", "2950 N 24th St", "2827 E Indian School Rd", 
      "3350 N 3rd Ave", "2333 E Thomas Rd", "2800 N 7th St", "3550 N Central Ave",
      "2020 E Thomas Rd", "2345 E Thomas Rd"
    ]
  },
  5: {
    center: { lat: 33.5091, lon: -112.0453 },
    radius: 0.045,
    addresses: [
      "1645 E Camelback Rd", "4747 E Thomas Rd", "2140 E Camelback Rd", "3110 N Central Ave", 
      "5050 N 7th St", "4510 N 16th St", "2601 N Central Ave", "4747 N 22nd St",
      "4925 N 7th Ave", "2020 E Highland Ave"
    ]
  },
  6: {
    center: { lat: 33.6103, lon: -112.1008 },
    radius: 0.05,
    addresses: [
      "1820 W Thunderbird Rd", "8125 N 23rd Ave", "2020 W Bell Rd", "3131 W Peoria Ave", 
      "8240 N 27th Ave", "7575 N 19th Ave", "3939 W Thunderbird Rd", "2555 W Cactus Rd",
      "4040 W Peoria Ave", "7171 N 35th Ave"
    ]
  },
  7: {
    center: { lat: 33.4653, lon: -112.1702 },
    radius: 0.06,
    addresses: [
      "W McDowell Rd & N 51st Ave", "W Thomas Rd & N 67th Ave", "W Indian School Rd & N 75th Ave", 
      "5151 W McDowell Rd", "6767 W Thomas Rd", "7575 W Indian School Rd", "6060 W Encanto Blvd",
      "7171 W Thomas Rd", "5050 W Camelback Rd", "W Camelback Rd & N 75th Ave"
    ]
  },
  8: {
    center: { lat: 33.7965, lon: -112.1141 },
    radius: 0.07,
    addresses: [
      "2501 W Carefree Hwy", "12627 N Tatum Blvd", "4747 E Bell Rd", "34444 N 7th St", 
      "2020 W Happy Valley Rd", "24800 N 7th St", "7171 E Princess Dr", "3131 E Thunderbird Rd",
      "4848 E Greenway Rd", "3939 E Bell Rd"
    ]
  }
};

// Unit types by district
const UNITS_BY_DISTRICT = {
  1: ["E1", "R1", "L1", "BC1"],
  2: ["E22", "E24", "E35", "R22", "L22", "BC2"],
  3: ["E30", "E28", "R30", "L30", "BC3"],
  4: ["E11", "E8", "R11", "L11", "BC1"],
  5: ["E9", "E5", "R5", "L9", "BC1"],
  6: ["E21", "E7", "E6", "R21", "R7", "L7", "BC2"],
  7: ["E41", "E43", "R41", "L41", "BC2"],
  8: ["E56", "E34", "E5", "R56", "R5", "BC3"]
};

// Special unit types (not assigned to specific districts)
const SPECIAL_UNITS = ["HM4", "HM1", "W1", "LR44", "USAR9"];

// Incident types with their codes, descriptions, and priorities
const INCIDENT_TYPES = [
  { code: "321", desc: "EMS-DIFFICULTY BREATHING", priority: 1, frequency: 15 },
  { code: "322", desc: "EMS-CHEST PAIN", priority: 1, frequency: 15 },
  { code: "323", desc: "EMS-FALL VICTIM", priority: 2, frequency: 12 },
  { code: "324", desc: "EMS-UNCONSCIOUS PERSON", priority: 1, frequency: 10 },
  { code: "325", desc: "EMS-LACERATION", priority: 2, frequency: 8 },
  { code: "326", desc: "EMS-SICK PERSON", priority: 2, frequency: 12 },
  { code: "327", desc: "EMS-ABDOMINAL PAIN", priority: 2, frequency: 8 },
  { code: "328", desc: "EMS-SEIZURE", priority: 1, frequency: 7 },
  { code: "329", desc: "EMS-BEHAVIORAL", priority: 1, frequency: 5 },
  { code: "330", desc: "EMS-OVERDOSE", priority: 1, frequency: 5 },
  { code: "100", desc: "STRUCTURE FIRE", priority: 1, frequency: 3 },
  { code: "111", desc: "RESIDENTIAL FIRE", priority: 1, frequency: 4 },
  { code: "121", desc: "COMMERCIAL FIRE", priority: 1, frequency: 2 },
  { code: "131", desc: "BRUSH FIRE", priority: 2, frequency: 3 },
  { code: "140", desc: "VEHICLE FIRE", priority: 2, frequency: 4 },
  { code: "550", desc: "SERVICE CALL", priority: 3, frequency: 8 },
  { code: "650", desc: "HAZMAT", priority: 1, frequency: 2 },
  { code: "700", desc: "FALSE ALARM", priority: 3, frequency: 7 },
  { code: "730", desc: "AUTOMATIC ALARM", priority: 2, frequency: 6 },
  { code: "531", desc: "VEHICLE ACCIDENT", priority: 1, frequency: 10 },
  { code: "532", desc: "VEHICLE ACCIDENT WITH INJURIES", priority: 1, frequency: 8 },
  { code: "533", desc: "VEHICLE ACCIDENT WITH ENTRAPMENT", priority: 1, frequency: 2 }
];

// Unit status codes and definitions
const UNIT_STATUSES = [
  { code: "D", desc: "Dispatched" },  // Always first
  { code: "ER", desc: "En Route" },   // Always after D
  { code: "OS", desc: "On Scene" },   // Always after ER
  { code: "AH", desc: "At Hospital", frequency: 30 }, // Only for R units, after OS
  { code: "AQ", desc: "Available in Quarters", frequency: 70 } // Always last
];

// Helper function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get weighted incident type based on frequency
function getWeightedIncidentType() {
  const totalWeight = INCIDENT_TYPES.reduce((sum, type) => sum + type.frequency, 0);
  let random = Math.random() * totalWeight;
  
  for (const type of INCIDENT_TYPES) {
    random -= type.frequency;
    if (random <= 0) {
      return type;
    }
  }
  return INCIDENT_TYPES[0]; // Fallback
}

// Helper function to get random date between start and end
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random coordinates within a district
function getRandomLocationInDistrict(district) {
  const center = PHOENIX_DISTRICTS[district].center;
  const radius = PHOENIX_DISTRICTS[district].radius;
  
  // Random angle and distance within radius
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;
  
  // Convert to lat/lon offset (approximate)
  const lat = center.lat + (distance * Math.cos(angle) * 0.9);
  const lon = center.lon + (distance * Math.sin(angle) * 1.1);
  
  return { lat, lon };
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to format time as HH:MM:SS
function formatTime(date) {
  return date.toTimeString().split(' ')[0];
}

// Helper function to format datetime as YYYY-MM-DD HH:MM:SS
function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Helper function to add seconds to a date
function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

// Helper function to calculate appropriate response times based on district and time
function calculateResponseTimes(district, incidentDate) {
  const hour = incidentDate.getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
  const isNighttime = hour >= 22 || hour <= 5;
  
  let baseDispatchTime = Math.floor(Math.random() * 30) + 45; // 45-75 seconds
  let baseEnRouteTime = Math.floor(Math.random() * 30) + 30; // 30-60 seconds
  let baseOnSceneTime = 0;
  
  // Adjust by district (outer districts take longer)
  if (district >= 6) {
    baseOnSceneTime = Math.floor(Math.random() * 120) + 240; // 4-6 minutes
  } else if (district >= 4) {
    baseOnSceneTime = Math.floor(Math.random() * 90) + 210; // 3.5-5 minutes
  } else {
    baseOnSceneTime = Math.floor(Math.random() * 60) + 180; // 3-4 minutes
  }
  
  // Adjust for time of day
  if (isRushHour) {
    baseOnSceneTime += Math.floor(Math.random() * 120); // Add up to 2 minutes during rush hour
  }
  
  if (isNighttime) {
    baseOnSceneTime -= Math.floor(Math.random() * 60); // Subtract up to 1 minute at night
  }
  
  // Add some randomness between units from same incident
  function getUnitVariation(base, isLate = false) {
    const variation = Math.floor(Math.random() * 45); // Up to 45 seconds variation
    return isLate ? base + variation : base - variation;
  }
  
  return {
    dispatchTime: baseDispatchTime,
    enRouteTime: baseEnRouteTime,
    onSceneTime: baseOnSceneTime,
    getUnitVariation
  };
}

// Helper function to determine which units respond based on incident type
function getRespondingUnits(incidentType, district) {
  const units = [];
  
  // Get basic units from the district
  const districtUnits = UNITS_BY_DISTRICT[district];
  
  // Default EMS response: Engine + Rescue (Medical unit)
  if (incidentType.code.startsWith("3")) {
    // Find an engine and rescue unit
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    const rescueUnits = districtUnits.filter(u => u.startsWith("R"));
    
    if (engineUnits.length > 0) units.push(getRandomElement(engineUnits));
    if (rescueUnits.length > 0) units.push(getRandomElement(rescueUnits));
    
    // For priority 1 EMS, sometimes add BC
    if (incidentType.priority === 1 && Math.random() < 0.1) {
      const bcUnits = districtUnits.filter(u => u.startsWith("BC"));
      if (bcUnits.length > 0) units.push(getRandomElement(bcUnits));
    }
  } 
  // Structure fires get more units
  else if (incidentType.code === "100" || incidentType.code === "111" || incidentType.code === "121") {
    // Add 2-3 engines
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    const ladderUnits = districtUnits.filter(u => u.startsWith("L"));
    const bcUnits = districtUnits.filter(u => u.startsWith("BC"));
    
    // Add first engine
    if (engineUnits.length > 0) units.push(getRandomElement(engineUnits));
    
    // Add second engine from nearby district if possible
    const nearbyDistrict = district < 4 ? district + 1 : district - 1;
    if (UNITS_BY_DISTRICT[nearbyDistrict]) {
      const nearbyEngines = UNITS_BY_DISTRICT[nearbyDistrict].filter(u => u.startsWith("E"));
      if (nearbyEngines.length > 0) units.push(getRandomElement(nearbyEngines));
    }
    
    // Add ladder truck
    if (ladderUnits.length > 0) units.push(getRandomElement(ladderUnits));
    
    // Add battalion chief
    if (bcUnits.length > 0) units.push(getRandomElement(bcUnits));
    
    // Sometimes add rescue unit for medical standby
    if (Math.random() < 0.3) {
      const rescueUnits = districtUnits.filter(u => u.startsWith("R"));
      if (rescueUnits.length > 0) units.push(getRandomElement(rescueUnits));
    }
  }
  // Hazmat gets special unit
  else if (incidentType.code === "650") {
    // Add engine and hazmat unit
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    if (engineUnits.length > 0) units.push(getRandomElement(engineUnits));
    units.push("HM4"); // Special hazmat unit
    
    // Add BC
    const bcUnits = districtUnits.filter(u => u.startsWith("BC"));
    if (bcUnits.length > 0) units.push(getRandomElement(bcUnits));
  }
  // Brush fire response
  else if (incidentType.code === "131") {
    // Add 2 engines
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    if (engineUnits.length > 0) {
      units.push(getRandomElement(engineUnits));
      if (engineUnits.length > 1) units.push(getRandomElement(engineUnits.filter(u => !units.includes(u))));
      else if (UNITS_BY_DISTRICT[district === 8 ? 7 : district + 1]) {
        const nearbyEngines = UNITS_BY_DISTRICT[district === 8 ? 7 : district + 1].filter(u => u.startsWith("E"));
        if (nearbyEngines.length > 0) units.push(getRandomElement(nearbyEngines));
      }
    }
    
    // Add BC for larger brush fires
    if (Math.random() < 0.7) {
      const bcUnits = districtUnits.filter(u => u.startsWith("BC"));
      if (bcUnits.length > 0) units.push(getRandomElement(bcUnits));
    }
  }
  // Vehicle accident
  else if (incidentType.code.startsWith("53")) {
    // Add engine and rescue
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    const rescueUnits = districtUnits.filter(u => u.startsWith("R"));
    
    if (engineUnits.length > 0) units.push(getRandomElement(engineUnits));
    if (rescueUnits.length > 0) units.push(getRandomElement(rescueUnits));
    
    // For entrapment, add ladder and BC
    if (incidentType.code === "533") {
      const ladderUnits = districtUnits.filter(u => u.startsWith("L"));
      const bcUnits = districtUnits.filter(u => u.startsWith("BC"));
      
      if (ladderUnits.length > 0) units.push(getRandomElement(ladderUnits));
      if (bcUnits.length > 0) units.push(getRandomElement(bcUnits));
    }
  }
  // Default response: just send one engine
  else {
    const engineUnits = districtUnits.filter(u => u.startsWith("E"));
    if (engineUnits.length > 0) units.push(getRandomElement(engineUnits));
    
    // For alarms, add ladder sometimes
    if (incidentType.code === "730" && Math.random() < 0.5) {
      const ladderUnits = districtUnits.filter(u => u.startsWith("L"));
      if (ladderUnits.length > 0) units.push(getRandomElement(ladderUnits));
    }
  }
  
  // If no units were selected (shouldn't happen), default to an engine
  if (units.length === 0) {
    const districtNumber = district.toString().padStart(2, '0');
    units.push(`E${districtNumber}`);
  }
  
  return units;
}

// Function to generate a single incident and all its unit status records
function generateIncident(incidentNumber) {
  // Generate incident basics
  const incidentDate = getRandomDate(START_DATE, END_DATE);
  const district = Math.floor(Math.random() * 8) + 1; // Districts 1-8
  const incidentType = getWeightedIncidentType();
  
  // Get location for the incident
  let location, address;
  if (Math.random() < 0.7) {
    // Use predefined address 70% of the time
    address = getRandomElement(PHOENIX_DISTRICTS[district].addresses);
    location = getRandomLocationInDistrict(district);
  } else {
    // Generate random location within district
    location = getRandomLocationInDistrict(district);
    address = `${Math.floor(1000 + Math.random() * 9000)} ${getRandomElement(["N", "S", "E", "W"])} ${Math.floor(1 + Math.random() * 99)}${getRandomElement(["th", "rd", "st"])} ${getRandomElement(["St", "Ave", "Rd", "Dr", "Ln", "Blvd"])}`;
  }
  
  // Determine call taker ID
  const callTakerId = `PFD-${Math.floor(100 + Math.random() * 100)}`;
  
  // Generate timestamps
  const callReceivedDate = incidentDate;
  const callReceivedDateStr = formatDate(callReceivedDate);
  const callReceivedTimeStr = formatTime(callReceivedDate);
  
  // Calculate response times
  const responseTimes = calculateResponseTimes(district, callReceivedDate);
  
  // Dispatch time (45-75 seconds after call received)
  const dispatchDate = addSeconds(callReceivedDate, responseTimes.dispatchTime);
  const dispatchDateStr = formatDate(dispatchDate);
  const dispatchTimeStr = formatTime(dispatchDate);
  
  // Calculate typical arrival time (first unit)
  const firstArrivalDate = addSeconds(dispatchDate, responseTimes.onSceneTime);
  const arrivalDateStr = formatDate(firstArrivalDate);
  const arrivalTimeStr = formatTime(firstArrivalDate);
  
  // Response time in seconds
  const responseTimeSec = Math.floor((firstArrivalDate - dispatchDate) / 1000);
  
  // Determine responding units
  const respondingUnits = getRespondingUnits(incidentType, district);
  
  // Generate CSV rows for each unit's status changes
  const rows = [];
  
  respondingUnits.forEach((unit, unitIndex) => {
    let lastDate = dispatchDate;
    let isRescueUnit = unit.startsWith("R");
    
    // Each unit goes through all standard statuses
    UNIT_STATUSES.forEach((status, statusIndex) => {
      // Skip AH status for non-rescue units
      if (status.code === "AH" && !isRescueUnit) return;
      
      // Skip AH status randomly based on frequency (only for rescue units)
      if (status.code === "AH" && Math.random() * 100 > status.frequency) return;
      
      // Calculate status time
      let statusDate;
      if (status.code === "D") {
        // All units dispatched at the same time
        statusDate = dispatchDate;
      } else if (status.code === "ER") {
        // Enroute time with some variation by unit (30-75 seconds after dispatch)
        const enRouteDelay = responseTimes.enRouteTime + unitIndex * 10;
        statusDate = addSeconds(lastDate, enRouteDelay);
      } else if (status.code === "OS") {
        // On scene time with variation by unit
        let onSceneDelay = responseTimes.onSceneTime;
        // First unit is fastest, others follow
        if (unitIndex > 0) {
          onSceneDelay = responseTimes.getUnitVariation(onSceneDelay, true);
        }
        statusDate = addSeconds(dispatchDate, onSceneDelay);
      } else if (status.code === "AH") {
        // At hospital (only for rescue units) - 15-30 minutes after on scene
        const hospitalTransportTime = Math.floor(Math.random() * 900) + 900; // 15-30 minutes
        statusDate = addSeconds(lastDate, hospitalTransportTime);
      } else if (status.code === "AQ") {
        // Available in quarters - 20-60 minutes after on scene or AH
        const clearanceTime = Math.floor(Math.random() * 2400) + 1200; // 20-60 minutes
        statusDate = addSeconds(lastDate, clearanceTime);
      }
      
      // Create CSV row for this status
      rows.push({
        INCIDENT_NO: incidentNumber,
        CALL_RECEIVED_DATE: callReceivedDateStr,
        CALL_RECEIVED_TIME: callReceivedTimeStr,
        DISPATCH_DATE: dispatchDateStr,
        DISPATCH_TIME: dispatchTimeStr,
        ARRIVAL_DATE: arrivalDateStr,
        ARRIVAL_TIME: arrivalTimeStr,
        INCIDENT_TYPE_CD: incidentType.code,
        INCIDENT_TYPE_DESC: incidentType.desc,
        PRIORITY_CD: incidentType.priority,
        LOCATION_ADDR: address,
        LOCATION_CITY: "Phoenix",
        LOCATION_ST: "AZ",
        LAT: location.lat.toFixed(4),
        LON: location.lon.toFixed(4),
        UNIT_ID: unit,
        UNIT_STATUS_CD: status.code,
        STATUS_DTTM: formatDateTime(statusDate),
        DISPOSITION_CD: "CMP",
        DISPOSITION_DESC: "Completed",
        DISTRICT_CD: district,
        CALL_TAKER_ID: callTakerId,
        RESPONSE_TIME_SEC: responseTimeSec
      });
      
      // Update last date for next status
      lastDate = statusDate;
    });
  });
  
  return rows;
}

// Convert array of objects to CSV
function convertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';

  // Add header row
  const headers = Object.keys(array[0]);
  str += headers.join(',') + '\n';

  // Add data rows
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in headers) {
      if (line !== '') line += ',';
      
      // Handle values with commas by quoting
      const value = array[i][headers[index]];
      if (value && typeof value === 'string' && value.includes(',')) {
        line += `"${value}"`;
      } else {
        line += value;
      }
    }
    
    str += line + '\n';
  }
  
  return str;
}

// Main function to generate all incidents
function generateAllIncidents() {
  console.log(`Generating ${INCIDENTS_TO_GENERATE} Phoenix Fire Department incidents...`);
  
  let allRows = [];
  let currentIncident = 1;
  let currentDate = new Date(START_DATE);
  
  while (currentIncident <= INCIDENTS_TO_GENERATE) {
    // Create incident number in format PFD-YYYYMMDD-XXXX
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '').substring(2); // YYMMDD
    const incidentNumber = `PFD-${dateStr}-${currentIncident.toString().padStart(4, '0')}`;
    
    // Generate incident and add rows
    const incidentRows = generateIncident(incidentNumber);
    allRows = allRows.concat(incidentRows);
    
    // Move to next incident
    currentIncident++;
    
    // Every 20 incidents, advance the date slightly to spread incidents across the time period
    if (currentIncident % 20 === 0) {
      currentDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000); // Advance 6 hours
      
      // Don't go past end date
      if (currentDate > END_DATE) {
        currentDate = new Date(START_DATE);
      }
    }
    
    // Log progress
    if (currentIncident % 500 === 0) {
      console.log(`Generated ${currentIncident} incidents...`);
    }
  }
  
  // Convert to CSV and return
  const csv = convertToCSV(allRows);
  return {
    csv,
    rowCount: allRows.length,
    incidentCount: INCIDENTS_TO_GENERATE
  };
}

// Run the generator
const result = generateAllIncidents();
console.log(`Generation complete!`);
console.log(`Generated ${result.incidentCount} incidents with ${result.rowCount} total status records`);
console.log(`CSV size: ${Math.round(result.csv.length / 1024 / 1024 * 100) / 100} MB`);

// Output would normally be written to a file using fs.writeFileSync
// Since this is meant to run in browser, we'll just return the data
console.log('CSV preview (first 500 chars):');
console.log(result.csv.substring(0, 500) + '...');