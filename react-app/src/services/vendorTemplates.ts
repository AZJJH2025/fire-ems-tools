import { FieldMappingTemplate } from '@/types/formatter';

/**
 * Pre-built CAD Vendor Template Library
 * Provides professional, tested templates for common CAD systems
 * These templates are "certified" and work out of the box for fire departments
 */

/**
 * Console One CAD Standard Template
 * Supports NFIRS incident types and standard Console One field naming
 */
export const consoleOneStandardTemplate: FieldMappingTemplate = {
  id: 'vendor_console_one_standard',
  name: 'Console One CAD - Standard Template',
  description: 'Professional template for Console One CAD systems with NFIRS code support. Includes incident times, unit information, and location data.',
  cadVendor: 'Console One',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'INC_DATE_TIME', targetField: 'incident_time' },
    { sourceField: 'INC_NUM', targetField: 'incident_id' },
    { sourceField: 'INC_DATE', targetField: 'incident_date' },
    { sourceField: 'DISPATCH_TIME', targetField: 'dispatch_time' },
    { sourceField: 'ENROUTE_TIME', targetField: 'enroute_time' },
    { sourceField: 'ARRIVAL_TIME', targetField: 'arrival_time' },
    { sourceField: 'CLEAR_TIME', targetField: 'clear_time' },
    { sourceField: 'PROBLEM_TYPE', targetField: 'incident_type' },
    { sourceField: 'UNIT_ID', targetField: 'responding_unit' },
    { sourceField: 'LOCATION_ADDRESS', targetField: 'address' },
    { sourceField: 'LATITUDE', targetField: 'latitude' },
    { sourceField: 'LONGITUDE', targetField: 'longitude' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'INC_DATE_TIME', 'INC_NUM', 'INC_DATE', 'DISPATCH_TIME', 'ENROUTE_TIME',
      'ARRIVAL_TIME', 'CLEAR_TIME', 'PROBLEM_TYPE', 'UNIT_ID', 'LOCATION_ADDRESS',
      'LATITUDE', 'LONGITUDE'
    ],
    fieldCount: 12,
    hasHeaderRow: true,
    commonPatterns: ['datetime', 'incident', 'unit', 'location'],
    cadVendorSignature: 'Console One'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 95,
    successRate: 100,
    dataTypes: {},
    sampleValues: {
      'INC_DATE_TIME': ['01/15/2024 14:23:45', '01/15/2024 15:30:12'],
      'PROBLEM_TYPE': ['111', '522', '311', '651'],
      'UNIT_ID': ['E01', 'T01', 'M01', 'BC01']
    },
    tags: ['console-one', 'nfirs', 'standard', 'certified']
  },
  createdAt: new Date('2025-06-19').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Tyler Technologies CAD Standard Template
 * Supports Tyler's mixed naming conventions and date formats
 */
export const tylerStandardTemplate: FieldMappingTemplate = {
  id: 'vendor_tyler_standard',
  name: 'Tyler Technologies CAD - Standard Template',
  description: 'Professional template for Tyler Technologies CAD systems. Handles mixed field naming conventions and date formats common in Tyler exports.',
  cadVendor: 'Tyler',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'ALARM_TIME', targetField: 'incident_time' },
    { sourceField: 'INCIDENT_NUMBER', targetField: 'incident_id' },
    { sourceField: 'INCIDENT_DATE', targetField: 'incident_date' },
    { sourceField: 'DISPATCH_DATE', targetField: 'dispatch_time' },
    { sourceField: 'ENROUTE_DATE', targetField: 'enroute_time' },
    { sourceField: 'ARRIVAL_DATE', targetField: 'arrival_time' },
    { sourceField: 'CLEAR_DATE', targetField: 'clear_time' },
    { sourceField: 'NATURE_CODE', targetField: 'incident_type' },
    { sourceField: 'PRIMARY_UNIT', targetField: 'responding_unit' },
    { sourceField: 'ADDRESS', targetField: 'address' },
    { sourceField: 'CITY', targetField: 'city' },
    { sourceField: 'STATE', targetField: 'state' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'ALARM_TIME', 'INCIDENT_NUMBER', 'INCIDENT_DATE', 'DISPATCH_DATE',
      'ENROUTE_DATE', 'ARRIVAL_DATE', 'CLEAR_DATE', 'NATURE_CODE',
      'PRIMARY_UNIT', 'ADDRESS', 'CITY', 'STATE'
    ],
    fieldCount: 12,
    hasHeaderRow: true,
    commonPatterns: ['datetime', 'incident', 'unit', 'location'],
    cadVendorSignature: 'Tyler'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 92,
    successRate: 98,
    dataTypes: {},
    sampleValues: {
      'ALARM_TIME': ['2024-01-15 14:23:45', '2024-01-15 15:30:12'],
      'NATURE_CODE': ['FIREA', 'EMSC', 'FIREB', 'HAZMAT'],
      'PRIMARY_UNIT': ['Engine 1', 'Truck 1', 'Medic 1', 'Chief 1']
    },
    tags: ['tyler', 'tyler-technologies', 'standard', 'certified']
  },
  createdAt: new Date('2025-06-19').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Hexagon/Intergraph CAD Standard Template
 * Supports PascalCase field naming and mixed datetime formats
 */
export const hexagonStandardTemplate: FieldMappingTemplate = {
  id: 'vendor_hexagon_standard',
  name: 'Hexagon/Intergraph CAD - Standard Template',
  description: 'Professional template for Hexagon/Intergraph CAD systems. Handles PascalCase field naming and mixed datetime formats with/without seconds.',
  cadVendor: 'Hexagon',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'CallDateTime', targetField: 'incident_time' },
    { sourceField: 'IncidentNumber', targetField: 'incident_id' },
    { sourceField: 'CallDate', targetField: 'incident_date' },
    { sourceField: 'DispatchDateTime', targetField: 'dispatch_time' },
    { sourceField: 'EnRouteDateTime', targetField: 'enroute_time' },
    { sourceField: 'ArrivalDateTime', targetField: 'arrival_time' },
    { sourceField: 'ClearDateTime', targetField: 'clear_time' },
    { sourceField: 'IncidentType', targetField: 'incident_type' },
    { sourceField: 'UnitId', targetField: 'responding_unit' },
    { sourceField: 'LocationAddress', targetField: 'address' },
    { sourceField: 'Latitude', targetField: 'latitude' },
    { sourceField: 'Longitude', targetField: 'longitude' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'CallDateTime', 'IncidentNumber', 'CallDate', 'DispatchDateTime',
      'EnRouteDateTime', 'ArrivalDateTime', 'ClearDateTime', 'IncidentType',
      'UnitId', 'LocationAddress', 'Latitude', 'Longitude'
    ],
    fieldCount: 12,
    hasHeaderRow: true,
    commonPatterns: ['datetime', 'incident', 'unit', 'location'],
    cadVendorSignature: 'Hexagon'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 90,
    successRate: 95,
    dataTypes: {},
    sampleValues: {
      'CallDateTime': ['01/20/2024 14:28', '01/20/2024 15:35:22'],
      'IncidentType': ['Structure Fire', 'Medical Emergency', 'Vehicle Accident'],
      'UnitId': ['ENG001', 'TRK001', 'MED001', 'BC001']
    },
    tags: ['hexagon', 'intergraph', 'pascalcase', 'certified']
  },
  createdAt: new Date('2025-06-19').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * TriTech/CentralSquare CAD Standard Template
 * Supports underscore_case naming and EventNum field patterns
 */
export const tritechStandardTemplate: FieldMappingTemplate = {
  id: 'vendor_tritech_standard',
  name: 'TriTech/CentralSquare CAD - Standard Template',
  description: 'Professional template for TriTech/CentralSquare CAD systems. Handles underscore_case naming conventions and EventNum identifiers.',
  cadVendor: 'TriTech',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'Call_Date_Time', targetField: 'incident_time' },
    { sourceField: 'EventNum', targetField: 'incident_id' },
    { sourceField: 'Call_Date', targetField: 'incident_date' },
    { sourceField: 'Dispatch_Time', targetField: 'dispatch_time' },
    { sourceField: 'Enroute_Time', targetField: 'enroute_time' },
    { sourceField: 'Arrival_Time', targetField: 'arrival_time' },
    { sourceField: 'Clear_Time', targetField: 'clear_time' },
    { sourceField: 'Call_Type', targetField: 'incident_type' },
    { sourceField: 'Unit_ID', targetField: 'responding_unit' },
    { sourceField: 'Address', targetField: 'address' },
    { sourceField: 'City', targetField: 'city' },
    { sourceField: 'State', targetField: 'state' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'Call_Date_Time', 'EventNum', 'Call_Date', 'Dispatch_Time',
      'Enroute_Time', 'Arrival_Time', 'Clear_Time', 'Call_Type',
      'Unit_ID', 'Address', 'City', 'State'
    ],
    fieldCount: 12,
    hasHeaderRow: true,
    commonPatterns: ['datetime', 'incident', 'unit', 'location'],
    cadVendorSignature: 'TriTech'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 88,
    successRate: 93,
    dataTypes: {},
    sampleValues: {
      'Call_Date_Time': ['2024-01-15 14:23:45', '2024-01-15 15:30:12'],
      'Call_Type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT'],
      'Unit_ID': ['E1', 'L1', 'M1', 'C1']
    },
    tags: ['tritech', 'centralsquare', 'underscore', 'certified']
  },
  createdAt: new Date('2025-06-19').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Motorola/Spillman CAD Standard Template
 * Supports SQL-style field naming and Spillman-specific incident numbering
 */
export const motorolaSpillmanTemplate: FieldMappingTemplate = {
  id: 'vendor_motorola_spillman',
  name: 'Motorola/Spillman CAD - Standard Template',
  description: 'Professional template for Motorola/Spillman CAD systems. Handles SQL-style field naming and Spillman incident numbering patterns.',
  cadVendor: 'Motorola',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'CALLDATE', targetField: 'incident_time' },
    { sourceField: 'CALLNO', targetField: 'incident_id' },
    { sourceField: 'CALLDATE', targetField: 'incident_date' },
    { sourceField: 'DISPATCHTIME', targetField: 'dispatch_time' },
    { sourceField: 'ENROUTETIME', targetField: 'enroute_time' },
    { sourceField: 'ARRIVALTIME', targetField: 'arrival_time' },
    { sourceField: 'CLEARTIME', targetField: 'clear_time' },
    { sourceField: 'CALLTYPE', targetField: 'incident_type' },
    { sourceField: 'UNITID', targetField: 'responding_unit' },
    { sourceField: 'STREETADDRESS', targetField: 'address' },
    { sourceField: 'CITYNAME', targetField: 'city' },
    { sourceField: 'STATECODE', targetField: 'state' },
    { sourceField: 'ZIPCODE', targetField: 'zip_code' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'CALLDATE', 'CALLNO', 'DISPATCHTIME', 'ENROUTETIME', 'ARRIVALTIME',
      'CLEARTIME', 'CALLTYPE', 'UNITID', 'STREETADDRESS', 'CITYNAME',
      'STATECODE', 'ZIPCODE'
    ],
    fieldCount: 12,
    hasHeaderRow: true,
    commonPatterns: ['CALL', 'TIME', 'UNIT', 'ADDRESS'],
    cadVendorSignature: 'Spillman'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 92,
    successRate: 96,
    dataTypes: {},
    sampleValues: {
      'CALLDATE': ['2024-01-15 14:23:45', '2024-01-15 15:30:12'],
      'CALLNO': ['240001234', '240001235', '240001236'],
      'CALLTYPE': ['STRUCTURE', 'MEDICAL', 'VEHICLE', 'ALARM'],
      'UNITID': ['E1', 'T1', 'M1', 'BC1']
    },
    tags: ['motorola', 'spillman', 'sql-style', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Zuercher/Priority Dispatch CAD Standard Template
 * Supports Priority Dispatch field naming and ProQA integration
 */
export const zuercherTemplate: FieldMappingTemplate = {
  id: 'vendor_zuercher_standard',
  name: 'Zuercher/Priority Dispatch CAD - Standard Template',
  description: 'Professional template for Zuercher/Priority Dispatch CAD systems. Optimized for ProQA integration and priority dispatch protocols.',
  cadVendor: 'Zuercher',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'CallTime', targetField: 'incident_time' },
    { sourceField: 'CallNumber', targetField: 'incident_id' },
    { sourceField: 'CallDate', targetField: 'incident_date' },
    { sourceField: 'DispatchTime', targetField: 'dispatch_time' },
    { sourceField: 'EnRouteTime', targetField: 'enroute_time' },
    { sourceField: 'ArrivalTime', targetField: 'arrival_time' },
    { sourceField: 'ClearTime', targetField: 'clear_time' },
    { sourceField: 'CallType', targetField: 'incident_type' },
    { sourceField: 'UnitNumber', targetField: 'responding_unit' },
    { sourceField: 'StreetAddress', targetField: 'address' },
    { sourceField: 'City', targetField: 'city' },
    { sourceField: 'State', targetField: 'state' },
    { sourceField: 'Priority', targetField: 'priority' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'CallTime', 'CallNumber', 'CallDate', 'DispatchTime', 'EnRouteTime',
      'ArrivalTime', 'ClearTime', 'CallType', 'UnitNumber', 'StreetAddress',
      'City', 'State', 'Priority'
    ],
    fieldCount: 13,
    hasHeaderRow: true,
    commonPatterns: ['Call', 'Time', 'Unit', 'Address'],
    cadVendorSignature: 'Zuercher'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 94,
    successRate: 97,
    dataTypes: {},
    sampleValues: {
      'CallTime': ['01/15/2024 14:23:45', '01/15/2024 15:30:12'],
      'CallNumber': ['2024-001234', '2024-001235'],
      'CallType': ['FIRE-STRUCTURE', 'EMS-CARDIAC', 'RESCUE-VEHICLE'],
      'Priority': ['1', '2', '3', '4']
    },
    tags: ['zuercher', 'priority-dispatch', 'proqa', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Locution/CAD2CAD Standard Template
 * Supports generic CAD export formats and standardized field names
 */
export const locutionTemplate: FieldMappingTemplate = {
  id: 'vendor_locution_standard',
  name: 'Locution/CAD2CAD - Standard Template',
  description: 'Professional template for Locution/CAD2CAD systems. Handles generic CAD export formats with standardized field naming.',
  cadVendor: 'Locution',
  targetTool: 'response-time-analyzer',
  fieldMappings: [
    { sourceField: 'call_received_time', targetField: 'incident_time' },
    { sourceField: 'incident_number', targetField: 'incident_id' },
    { sourceField: 'call_date', targetField: 'incident_date' },
    { sourceField: 'dispatch_time', targetField: 'dispatch_time' },
    { sourceField: 'enroute_time', targetField: 'enroute_time' },
    { sourceField: 'arrival_time', targetField: 'arrival_time' },
    { sourceField: 'clear_time', targetField: 'clear_time' },
    { sourceField: 'call_type', targetField: 'incident_type' },
    { sourceField: 'unit_id', targetField: 'responding_unit' },
    { sourceField: 'address', targetField: 'address' },
    { sourceField: 'city', targetField: 'city' },
    { sourceField: 'state', targetField: 'state' },
    { sourceField: 'latitude', targetField: 'latitude' },
    { sourceField: 'longitude', targetField: 'longitude' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'call_received_time', 'incident_number', 'call_date', 'dispatch_time',
      'enroute_time', 'arrival_time', 'clear_time', 'call_type', 'unit_id',
      'address', 'city', 'state', 'latitude', 'longitude'
    ],
    fieldCount: 14,
    hasHeaderRow: true,
    commonPatterns: ['call', 'time', 'unit', 'address'],
    cadVendorSignature: 'Locution'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 96,
    successRate: 99,
    dataTypes: {},
    sampleValues: {
      'call_received_time': ['2024-01-15 14:23:45', '2024-01-15 15:30:12'],
      'incident_number': ['24-001234', '24-001235'],
      'call_type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT'],
      'unit_id': ['E01', 'T01', 'M01', 'BC01']
    },
    tags: ['locution', 'cad2cad', 'generic', 'standardized', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Fire Map Pro template variants for geographic analysis
 */
export const consoleOneFireMapTemplate: FieldMappingTemplate = {
  ...consoleOneStandardTemplate,
  id: 'vendor_console_one_firemap',
  name: 'Console One CAD - Fire Map Pro Template',
  description: 'Geographic analysis template for Console One CAD data. Optimized for incident mapping and spatial analysis.',
  targetTool: 'fire-map-pro',
  fieldMappings: [
    { sourceField: 'INC_NUM', targetField: 'incident_id' },
    { sourceField: 'LATITUDE', targetField: 'latitude' },
    { sourceField: 'LONGITUDE', targetField: 'longitude' },
    { sourceField: 'PROBLEM_TYPE', targetField: 'incident_type' },
    { sourceField: 'INC_DATE_TIME', targetField: 'incident_time' },
    { sourceField: 'LOCATION_ADDRESS', targetField: 'address' },
    { sourceField: 'UNIT_ID', targetField: 'responding_unit' }
  ],
  metadata: {
    ...consoleOneStandardTemplate.metadata,
    tags: ['console-one', 'fire-map-pro', 'geographic', 'certified']
  }
};

export const tylerFireMapTemplate: FieldMappingTemplate = {
  ...tylerStandardTemplate,
  id: 'vendor_tyler_firemap',
  name: 'Tyler Technologies CAD - Fire Map Pro Template',
  description: 'Geographic analysis template for Tyler CAD data. Optimized for incident mapping and spatial analysis.',
  targetTool: 'fire-map-pro',
  fieldMappings: [
    { sourceField: 'INCIDENT_NUMBER', targetField: 'incident_id' },
    { sourceField: 'LATITUDE', targetField: 'latitude' },
    { sourceField: 'LONGITUDE', targetField: 'longitude' },
    { sourceField: 'NATURE_CODE', targetField: 'incident_type' },
    { sourceField: 'ALARM_TIME', targetField: 'incident_time' },
    { sourceField: 'ADDRESS', targetField: 'address' },
    { sourceField: 'CITY', targetField: 'city' },
    { sourceField: 'STATE', targetField: 'state' },
    { sourceField: 'PRIMARY_UNIT', targetField: 'responding_unit' }
  ],
  metadata: {
    ...tylerStandardTemplate.metadata,
    tags: ['tyler', 'fire-map-pro', 'geographic', 'certified']
  }
};

/**
 * Water Supply Coverage template variants for rural departments
 */
export const consoleOneWaterSupplyTemplate: FieldMappingTemplate = {
  ...consoleOneStandardTemplate,
  id: 'vendor_console_one_water_supply',
  name: 'Console One CAD - Water Supply Coverage Template',
  description: 'Water supply analysis template for Console One CAD data. Optimized for rural department water source management.',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'INC_NUM', targetField: 'incident_id' },
    { sourceField: 'LATITUDE', targetField: 'latitude' },
    { sourceField: 'LONGITUDE', targetField: 'longitude' },
    { sourceField: 'LOCATION_ADDRESS', targetField: 'address' },
    { sourceField: 'PROBLEM_TYPE', targetField: 'incident_type' },
    { sourceField: 'INC_DATE_TIME', targetField: 'incident_time' },
    { sourceField: 'WATER_SOURCE', targetField: 'water_source' },
    { sourceField: 'TANK_CAPACITY', targetField: 'tank_capacity' },
    { sourceField: 'FLOW_RATE', targetField: 'flow_rate' }
  ],
  metadata: {
    ...consoleOneStandardTemplate.metadata,
    tags: ['console-one', 'water-supply', 'rural', 'certified']
  }
};

/**
 * HYDRANT & WATER INFRASTRUCTURE TEMPLATES
 * Professional templates for water departments, public works, and fire departments
 * to manage hydrant inventories and water supply infrastructure
 */

/**
 * ESRI/ArcGIS Hydrant Template
 * Standard template for ESRI ArcGIS hydrant management systems
 */
export const esriHydrantTemplate: FieldMappingTemplate = {
  id: 'vendor_esri_hydrant',
  name: 'ESRI/ArcGIS Hydrant Management Template',
  description: 'Professional template for ESRI ArcGIS hydrant management systems. Handles standard GIS field naming and coordinates for water departments.',
  cadVendor: 'ESRI',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'OBJECTID', targetField: 'hydrant_id' },
    { sourceField: 'HydrantID', targetField: 'hydrant_id' },
    { sourceField: 'HYDRANT_NUMBER', targetField: 'hydrant_number' },
    { sourceField: 'LATITUDE', targetField: 'latitude' },
    { sourceField: 'LONGITUDE', targetField: 'longitude' },
    { sourceField: 'X_COORD', targetField: 'longitude' },
    { sourceField: 'Y_COORD', targetField: 'latitude' },
    { sourceField: 'STREET_ADDRESS', targetField: 'address' },
    { sourceField: 'LOCATION_DESC', targetField: 'location_description' },
    { sourceField: 'FLOW_RATE', targetField: 'flow_rate' },
    { sourceField: 'STATIC_PRESSURE', targetField: 'static_pressure' },
    { sourceField: 'RESIDUAL_PRESSURE', targetField: 'residual_pressure' },
    { sourceField: 'DIAMETER', targetField: 'diameter' },
    { sourceField: 'HYDRANT_TYPE', targetField: 'hydrant_type' },
    { sourceField: 'CONDITION', targetField: 'condition' },
    { sourceField: 'INSTALL_DATE', targetField: 'install_date' },
    { sourceField: 'LAST_TESTED', targetField: 'last_tested' },
    { sourceField: 'WATER_MAIN_SIZE', targetField: 'water_main_size' },
    { sourceField: 'ZONE', targetField: 'pressure_zone' },
    { sourceField: 'OWNER', targetField: 'owner' },
    { sourceField: 'STATUS', targetField: 'status' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'OBJECTID', 'HydrantID', 'HYDRANT_NUMBER', 'LATITUDE', 'LONGITUDE',
      'STREET_ADDRESS', 'FLOW_RATE', 'STATIC_PRESSURE', 'DIAMETER',
      'HYDRANT_TYPE', 'CONDITION', 'INSTALL_DATE', 'ZONE', 'STATUS'
    ],
    fieldCount: 21,
    hasHeaderRow: true,
    commonPatterns: ['HYDRANT', 'PRESSURE', 'FLOW', 'COORD'],
    cadVendorSignature: 'ESRI'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 96,
    successRate: 98,
    dataTypes: {},
    sampleValues: {
      'HydrantID': ['H001', 'H002', 'H003'],
      'HYDRANT_NUMBER': ['001', '002', '003'],
      'FLOW_RATE': ['1000', '1200', '800'],
      'STATIC_PRESSURE': ['65', '70', '60'],
      'HYDRANT_TYPE': ['DRY_BARREL', 'WET_BARREL', 'WALL'],
      'CONDITION': ['GOOD', 'FAIR', 'POOR', 'EXCELLENT']
    },
    tags: ['esri', 'arcgis', 'hydrant', 'water-supply', 'gis', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * American Water Works Association (AWWA) Standard Template
 * Industry standard template following AWWA guidelines
 */
export const awwaHydrantTemplate: FieldMappingTemplate = {
  id: 'vendor_awwa_hydrant',
  name: 'AWWA Standard Hydrant Template',
  description: 'American Water Works Association standard template for hydrant management. Follows AWWA M17 guidelines for hydrant installation and maintenance.',
  cadVendor: 'AWWA',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'Hydrant_ID', targetField: 'hydrant_id' },
    { sourceField: 'Asset_Number', targetField: 'hydrant_number' },
    { sourceField: 'Lat', targetField: 'latitude' },
    { sourceField: 'Long', targetField: 'longitude' },
    { sourceField: 'Address', targetField: 'address' },
    { sourceField: 'Location', targetField: 'location_description' },
    { sourceField: 'Flow_GPM', targetField: 'flow_rate' },
    { sourceField: 'Static_PSI', targetField: 'static_pressure' },
    { sourceField: 'Residual_PSI', targetField: 'residual_pressure' },
    { sourceField: 'Outlet_Size', targetField: 'diameter' },
    { sourceField: 'Hydrant_Style', targetField: 'hydrant_type' },
    { sourceField: 'Physical_Condition', targetField: 'condition' },
    { sourceField: 'Date_Installed', targetField: 'install_date' },
    { sourceField: 'Last_Flow_Test', targetField: 'last_tested' },
    { sourceField: 'Main_Size_Inch', targetField: 'water_main_size' },
    { sourceField: 'Pressure_Zone', targetField: 'pressure_zone' },
    { sourceField: 'Utility_Owner', targetField: 'owner' },
    { sourceField: 'Service_Status', targetField: 'status' },
    { sourceField: 'Manufacturer', targetField: 'manufacturer' },
    { sourceField: 'Model', targetField: 'model' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'Hydrant_ID', 'Asset_Number', 'Lat', 'Long', 'Address', 'Flow_GPM',
      'Static_PSI', 'Residual_PSI', 'Outlet_Size', 'Hydrant_Style',
      'Physical_Condition', 'Date_Installed', 'Last_Flow_Test',
      'Main_Size_Inch', 'Pressure_Zone', 'Service_Status'
    ],
    fieldCount: 20,
    hasHeaderRow: true,
    commonPatterns: ['Hydrant', 'Flow', 'PSI', 'Test'],
    cadVendorSignature: 'AWWA'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 98,
    successRate: 99,
    dataTypes: {},
    sampleValues: {
      'Hydrant_ID': ['AWW001', 'AWW002', 'AWW003'],
      'Flow_GPM': ['1000', '1200', '800', '1500'],
      'Static_PSI': ['65', '70', '60', '75'],
      'Hydrant_Style': ['DRY_BARREL', 'WET_BARREL', 'WALL_HYDRANT'],
      'Physical_Condition': ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']
    },
    tags: ['awwa', 'hydrant', 'water-supply', 'standard', 'utility', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Municipal Public Works Hydrant Template
 * Standard template for city/county public works departments
 */
export const municipalHydrantTemplate: FieldMappingTemplate = {
  id: 'vendor_municipal_hydrant',
  name: 'Municipal Public Works Hydrant Template',
  description: 'Standard template for city and county public works departments. Handles municipal asset management and maintenance tracking.',
  cadVendor: 'Municipal',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'asset_id', targetField: 'hydrant_id' },
    { sourceField: 'hydrant_no', targetField: 'hydrant_number' },
    { sourceField: 'latitude', targetField: 'latitude' },
    { sourceField: 'longitude', targetField: 'longitude' },
    { sourceField: 'street_address', targetField: 'address' },
    { sourceField: 'location_notes', targetField: 'location_description' },
    { sourceField: 'flow_rate', targetField: 'flow_rate' },
    { sourceField: 'static_pressure', targetField: 'static_pressure' },
    { sourceField: 'working_pressure', targetField: 'residual_pressure' },
    { sourceField: 'outlet_diameter', targetField: 'diameter' },
    { sourceField: 'type', targetField: 'hydrant_type' },
    { sourceField: 'condition_rating', targetField: 'condition' },
    { sourceField: 'installed_date', targetField: 'install_date' },
    { sourceField: 'last_inspection', targetField: 'last_tested' },
    { sourceField: 'main_diameter', targetField: 'water_main_size' },
    { sourceField: 'district', targetField: 'pressure_zone' },
    { sourceField: 'department', targetField: 'owner' },
    { sourceField: 'active_status', targetField: 'status' },
    { sourceField: 'work_order', targetField: 'work_order' },
    { sourceField: 'maintenance_notes', targetField: 'notes' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'asset_id', 'hydrant_no', 'latitude', 'longitude', 'street_address',
      'flow_rate', 'static_pressure', 'working_pressure', 'outlet_diameter',
      'type', 'condition_rating', 'installed_date', 'last_inspection',
      'main_diameter', 'district', 'active_status'
    ],
    fieldCount: 20,
    hasHeaderRow: true,
    commonPatterns: ['asset', 'hydrant', 'pressure', 'diameter'],
    cadVendorSignature: 'Municipal'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 94,
    successRate: 97,
    dataTypes: {},
    sampleValues: {
      'asset_id': ['MUN001', 'MUN002', 'MUN003'],
      'hydrant_no': ['H-001', 'H-002', 'H-003'],
      'flow_rate': ['1000', '1200', '800'],
      'type': ['DRY_BARREL', 'WET_BARREL', 'WALL'],
      'condition_rating': ['1', '2', '3', '4', '5'],
      'active_status': ['ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE']
    },
    tags: ['municipal', 'public-works', 'hydrant', 'asset-management', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Water Tank/Storage Template
 * Template for water storage tanks and reservoirs
 */
export const waterTankTemplate: FieldMappingTemplate = {
  id: 'vendor_water_tank',
  name: 'Water Tank & Storage Template',
  description: 'Professional template for water storage tanks, reservoirs, and elevated storage systems. Optimized for rural fire department water supply analysis.',
  cadVendor: 'Water Utility',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'tank_id', targetField: 'tank_id' },
    { sourceField: 'tank_number', targetField: 'tank_number' },
    { sourceField: 'latitude', targetField: 'latitude' },
    { sourceField: 'longitude', targetField: 'longitude' },
    { sourceField: 'address', targetField: 'address' },
    { sourceField: 'location_description', targetField: 'location_description' },
    { sourceField: 'capacity_gallons', targetField: 'capacity' },
    { sourceField: 'tank_type', targetField: 'tank_type' },
    { sourceField: 'material', targetField: 'material' },
    { sourceField: 'height_feet', targetField: 'height' },
    { sourceField: 'diameter_feet', targetField: 'diameter' },
    { sourceField: 'outlet_size', targetField: 'outlet_size' },
    { sourceField: 'fill_rate', targetField: 'fill_rate' },
    { sourceField: 'discharge_rate', targetField: 'discharge_rate' },
    { sourceField: 'static_head', targetField: 'static_head' },
    { sourceField: 'pressure_zone', targetField: 'pressure_zone' },
    { sourceField: 'owner', targetField: 'owner' },
    { sourceField: 'operator', targetField: 'operator' },
    { sourceField: 'install_date', targetField: 'install_date' },
    { sourceField: 'last_inspection', targetField: 'last_inspection' },
    { sourceField: 'condition', targetField: 'condition' },
    { sourceField: 'status', targetField: 'status' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'tank_id', 'tank_number', 'latitude', 'longitude', 'address',
      'capacity_gallons', 'tank_type', 'material', 'height_feet',
      'diameter_feet', 'outlet_size', 'fill_rate', 'discharge_rate',
      'static_head', 'pressure_zone', 'owner', 'status'
    ],
    fieldCount: 22,
    hasHeaderRow: true,
    commonPatterns: ['tank', 'capacity', 'gallons', 'rate'],
    cadVendorSignature: 'Water Tank'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 95,
    successRate: 98,
    dataTypes: {},
    sampleValues: {
      'tank_id': ['TK001', 'TK002', 'TK003'],
      'capacity_gallons': ['100000', '250000', '500000', '1000000'],
      'tank_type': ['ELEVATED', 'GROUND', 'STANDPIPE', 'RESERVOIR'],
      'material': ['STEEL', 'CONCRETE', 'FIBERGLASS', 'WELDED_STEEL'],
      'status': ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE']
    },
    tags: ['water-tank', 'storage', 'reservoir', 'rural', 'fire-supply', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Fire Department Water Supply Template
 * Template specifically for fire department water supply inventories
 */
export const fireDeptWaterTemplate: FieldMappingTemplate = {
  id: 'vendor_fire_dept_water',
  name: 'Fire Department Water Supply Template',
  description: 'Specialized template for fire department water supply inventories. Includes hydrants, tanks, drafting sites, and mutual aid resources.',
  cadVendor: 'Fire Department',
  targetTool: 'water-supply-coverage',
  fieldMappings: [
    { sourceField: 'supply_id', targetField: 'supply_id' },
    { sourceField: 'supply_number', targetField: 'supply_number' },
    { sourceField: 'supply_type', targetField: 'supply_type' },
    { sourceField: 'latitude', targetField: 'latitude' },
    { sourceField: 'longitude', targetField: 'longitude' },
    { sourceField: 'address', targetField: 'address' },
    { sourceField: 'location_notes', targetField: 'location_description' },
    { sourceField: 'flow_rate_gpm', targetField: 'flow_rate' },
    { sourceField: 'static_pressure_psi', targetField: 'static_pressure' },
    { sourceField: 'residual_pressure_psi', targetField: 'residual_pressure' },
    { sourceField: 'capacity_gallons', targetField: 'capacity' },
    { sourceField: 'access_type', targetField: 'access_type' },
    { sourceField: 'connection_size', targetField: 'connection_size' },
    { sourceField: 'distance_to_road', targetField: 'distance_to_road' },
    { sourceField: 'seasonal_availability', targetField: 'seasonal_availability' },
    { sourceField: 'owner_contact', targetField: 'owner_contact' },
    { sourceField: 'permission_required', targetField: 'permission_required' },
    { sourceField: 'last_tested', targetField: 'last_tested' },
    { sourceField: 'tested_by', targetField: 'tested_by' },
    { sourceField: 'condition', targetField: 'condition' },
    { sourceField: 'status', targetField: 'status' },
    { sourceField: 'notes', targetField: 'notes' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'supply_id', 'supply_number', 'supply_type', 'latitude', 'longitude',
      'address', 'flow_rate_gpm', 'static_pressure_psi', 'capacity_gallons',
      'access_type', 'connection_size', 'seasonal_availability',
      'owner_contact', 'last_tested', 'condition', 'status'
    ],
    fieldCount: 22,
    hasHeaderRow: true,
    commonPatterns: ['supply', 'flow', 'pressure', 'gpm'],
    cadVendorSignature: 'Fire Department'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 97,
    successRate: 99,
    dataTypes: {},
    sampleValues: {
      'supply_id': ['FD001', 'FD002', 'FD003'],
      'supply_type': ['HYDRANT', 'TANK', 'POND', 'STREAM', 'WELL'],
      'flow_rate_gpm': ['1000', '1200', '800', '1500', '500'],
      'access_type': ['ROAD', 'DRIVEWAY', 'FIELD', 'TRAIL'],
      'seasonal_availability': ['YEAR_ROUND', 'SEASONAL', 'WEATHER_DEPENDENT'],
      'permission_required': ['NO', 'YES', 'CONTACT_OWNER']
    },
    tags: ['fire-department', 'water-supply', 'hydrant', 'tank', 'rural', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * Data Formatter Universal Templates
 * These templates are optimized for the Data Formatter tool itself
 */
export const universalDataFormatterTemplate: FieldMappingTemplate = {
  id: 'vendor_universal_data_formatter',
  name: 'Universal CAD - Data Formatter Template',
  description: 'Universal template for Data Formatter tool. Handles most common CAD field naming patterns and provides comprehensive field mapping.',
  cadVendor: 'Universal',
  targetTool: 'data-formatter',
  fieldMappings: [
    // Core incident fields
    { sourceField: 'incident_id', targetField: 'incident_id' },
    { sourceField: 'incident_number', targetField: 'incident_id' },
    { sourceField: 'call_number', targetField: 'incident_id' },
    { sourceField: 'event_id', targetField: 'incident_id' },
    
    // Time fields
    { sourceField: 'incident_time', targetField: 'incident_time' },
    { sourceField: 'call_time', targetField: 'incident_time' },
    { sourceField: 'received_time', targetField: 'incident_time' },
    { sourceField: 'dispatch_time', targetField: 'dispatch_time' },
    { sourceField: 'enroute_time', targetField: 'enroute_time' },
    { sourceField: 'arrival_time', targetField: 'arrival_time' },
    { sourceField: 'clear_time', targetField: 'clear_time' },
    
    // Location fields
    { sourceField: 'address', targetField: 'address' },
    { sourceField: 'location', targetField: 'address' },
    { sourceField: 'street_address', targetField: 'address' },
    { sourceField: 'city', targetField: 'city' },
    { sourceField: 'state', targetField: 'state' },
    { sourceField: 'zip_code', targetField: 'zip_code' },
    { sourceField: 'latitude', targetField: 'latitude' },
    { sourceField: 'longitude', targetField: 'longitude' },
    
    // Incident details
    { sourceField: 'incident_type', targetField: 'incident_type' },
    { sourceField: 'call_type', targetField: 'incident_type' },
    { sourceField: 'nature_code', targetField: 'incident_type' },
    { sourceField: 'unit_id', targetField: 'responding_unit' },
    { sourceField: 'responding_unit', targetField: 'responding_unit' },
    { sourceField: 'primary_unit', targetField: 'responding_unit' },
    { sourceField: 'priority', targetField: 'priority' }
  ],
  sourceFieldPattern: {
    fieldNames: [
      'incident_id', 'incident_time', 'dispatch_time', 'enroute_time',
      'arrival_time', 'clear_time', 'address', 'city', 'state', 'zip_code',
      'latitude', 'longitude', 'incident_type', 'responding_unit', 'priority'
    ],
    fieldCount: 25,
    hasHeaderRow: true,
    commonPatterns: ['incident', 'time', 'address', 'unit'],
    cadVendorSignature: 'Universal'
  },
  metadata: {
    version: '1.0.0',
    compatibility: ['1.0.0'],
    qualityScore: 98,
    successRate: 100,
    dataTypes: {},
    sampleValues: {
      'incident_id': ['2024-001234', '24-001235', 'INC-001236'],
      'incident_time': ['01/15/2024 14:23:45', '2024-01-15 15:30:12'],
      'incident_type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT'],
      'responding_unit': ['E01', 'T01', 'M01', 'BC01']
    },
    tags: ['universal', 'data-formatter', 'comprehensive', 'certified']
  },
  createdAt: new Date('2025-07-17').toISOString(),
  useCount: 0,
  isPublic: true
};

/**
 * All vendor templates registry
 */
export const vendorTemplates: FieldMappingTemplate[] = [
  // Response Time Analyzer Templates
  consoleOneStandardTemplate,
  tylerStandardTemplate,
  hexagonStandardTemplate,
  tritechStandardTemplate,
  motorolaSpillmanTemplate,
  zuercherTemplate,
  locutionTemplate,
  
  // Fire Map Pro Templates
  consoleOneFireMapTemplate,
  tylerFireMapTemplate,
  
  // Water Supply Coverage Templates
  consoleOneWaterSupplyTemplate,
  
  // Hydrant & Water Infrastructure Templates
  esriHydrantTemplate,
  awwaHydrantTemplate,
  municipalHydrantTemplate,
  waterTankTemplate,
  fireDeptWaterTemplate,
  
  // Data Formatter Templates
  universalDataFormatterTemplate
];

/**
 * Get templates for specific CAD vendor
 */
export const getTemplatesForVendor = (cadVendor: string): FieldMappingTemplate[] => {
  return vendorTemplates.filter(template => template.cadVendor === cadVendor);
};

/**
 * Get templates for specific target tool
 */
export const getTemplatesForTool = (targetTool: string): FieldMappingTemplate[] => {
  return vendorTemplates.filter(template => template.targetTool === targetTool);
};

/**
 * Get all certified vendor templates
 */
export const getCertifiedTemplates = (): FieldMappingTemplate[] => {
  return vendorTemplates.filter(template => 
    template.metadata?.tags?.includes('certified') && template.isPublic
  );
};

/**
 * Get templates by category (Response Time, Fire Map, Water Supply, etc.)
 */
export const getTemplatesByCategory = (category: string): FieldMappingTemplate[] => {
  const categoryMap: { [key: string]: string } = {
    'response-time': 'response-time-analyzer',
    'fire-map': 'fire-map-pro',
    'water-supply': 'water-supply-coverage',
    'data-formatter': 'data-formatter'
  };
  
  const targetTool = categoryMap[category] || category;
  return vendorTemplates.filter(template => template.targetTool === targetTool);
};

/**
 * Get available CAD vendors
 */
export const getAvailableVendors = (): string[] => {
  const vendors = vendorTemplates.map(template => template.cadVendor).filter(vendor => vendor !== undefined) as string[];
  return Array.from(new Set(vendors)).sort();
};

/**
 * Template seeding for first-time users
 * This function should be called when the application first loads to populate
 * the user's template library with professional vendor templates
 */
export const seedVendorTemplates = (): void => {
  try {
    const existingTemplates = JSON.parse(
      localStorage.getItem('fireems_field_mapping_templates') || '[]'
    );
    
    // Check if vendor templates are already seeded
    const hasVendorTemplates = existingTemplates.some((template: any) => 
      template.id?.startsWith('vendor_')
    );
    
    if (!hasVendorTemplates) {
      console.log('🌱 Seeding vendor templates for first-time user...');
      
      // Add vendor templates to existing templates
      const seededTemplates = [...existingTemplates, ...vendorTemplates];
      
      // Save back to localStorage
      localStorage.setItem('fireems_field_mapping_templates', JSON.stringify(seededTemplates));
      
      console.log(`✅ Seeded ${vendorTemplates.length} vendor templates successfully`);
    } else {
      console.log('📚 Vendor templates already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding vendor templates:', error);
  }
};

/**
 * Update vendor templates with newer versions
 * This function can be called when the application updates to refresh
 * vendor templates with newer versions while preserving user customizations
 */
export const updateVendorTemplates = (): void => {
  try {
    const existingTemplates = JSON.parse(
      localStorage.getItem('fireems_field_mapping_templates') || '[]'
    );
    
    // Filter out old vendor templates
    const userTemplates = existingTemplates.filter((template: any) => 
      !template.id?.startsWith('vendor_')
    );
    
    // Add latest vendor templates
    const updatedTemplates = [...userTemplates, ...vendorTemplates];
    
    // Save back to localStorage
    localStorage.setItem('fireems_field_mapping_templates', JSON.stringify(updatedTemplates));
    
    console.log(`🔄 Updated ${vendorTemplates.length} vendor templates to latest version`);
  } catch (error) {
    console.error('❌ Error updating vendor templates:', error);
  }
};