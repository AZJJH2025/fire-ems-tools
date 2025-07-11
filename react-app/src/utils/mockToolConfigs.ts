import { ToolConfig, FieldDataType } from '@/types/formatter';

/**
 * Mock tool configurations for development and testing
 */

// Response Time Analyzer tool configuration
// Aligned with NFPA 1710 standards and NEMSIS data requirements
export const responseTimeToolConfig: ToolConfig = {
  id: 'response-time',
  name: 'Response Time Analyzer',
  description: 'Analyze incident response times per NFPA 1710 standards - works with any combination of timestamp data',
  requiredFields: [
    {
      id: 'incident_id',
      name: 'Incident ID',
      description: 'Unique identifier for the incident (NEMSIS: Required)',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    },
    {
      id: 'incident_date',
      name: 'Incident Date',
      description: 'Date when the incident occurred - used as baseline for all time calculations',
      dataType: 'date' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    }
  ],
  optionalFields: [
    // === CRITICAL NFPA 1710 TIMESTAMP FIELDS ===
    // These enable core response time calculations per NFPA standards
    {
      id: 'incident_time',
      name: 'Call Received Date/Time',
      description: 'Time incident call was received (NEMSIS eTimes.01 equivalent) - enables all response time calculations',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      validationRules: []
    },
    {
      id: 'dispatch_time',
      name: 'Dispatch Time',
      description: 'Time units were notified/dispatched (NEMSIS eTimes.02) - enables dispatch time calculation',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      validationRules: []
    },
    {
      id: 'enroute_time',
      name: 'En Route Time',
      description: 'Time units began responding/turnout complete - enables NFPA 1710 turnout time (60 sec standard)',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      validationRules: []
    },
    {
      id: 'arrival_time',
      name: 'Arrival Time',
      description: 'Time first unit arrived on scene - enables NFPA 1710 travel time and total response time',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      validationRules: []
    },
    {
      id: 'clear_time',
      name: 'Unit Clear Time',
      description: 'Time unit cleared scene/back in service (NEMSIS eTimes.13) - enables scene time and total incident duration',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      validationRules: []
    },
    
    // === GEOGRAPHIC FIELDS FOR MAPPING ===
    // Optional but enables geospatial analysis
    {
      id: 'latitude',
      name: 'Latitude',
      description: 'Geographic latitude (optional) - enables incident mapping and geographic analysis',
      dataType: 'number' as FieldDataType,
      isRequired: false,
      validationRules: [
        { type: 'min', params: { min: -90 } },
        { type: 'max', params: { max: 90 } }
      ]
    },
    {
      id: 'longitude',
      name: 'Longitude',
      description: 'Geographic longitude (optional) - enables incident mapping and geographic analysis',
      dataType: 'number' as FieldDataType,
      isRequired: false,
      validationRules: [
        { type: 'min', params: { min: -180 } },
        { type: 'max', params: { max: 180 } }
      ]
    },
    
    // === INCIDENT CLASSIFICATION ===
    {
      id: 'incident_type',
      name: 'Incident Type',
      description: 'Incident classification (Fire, EMS, etc.) - enables performance analysis by incident type',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    
    // === UNIT AND LOCATION DETAILS ===
    {
      id: 'responding_unit',
      name: 'Responding Unit',
      description: 'Primary responding unit identifier - enables unit performance analysis',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'address',
      name: 'Address',
      description: 'Street address of incident location',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'city',
      name: 'City',
      description: 'City where incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'state',
      name: 'State',
      description: 'State where incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'zip_code',
      name: 'ZIP Code',
      description: 'ZIP code where incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    }
  ]
};


// Fire Map Pro tool configuration
export const fireMapProToolConfig: ToolConfig = {
  id: 'fire-map-pro',
  name: 'Fire Map Pro',
  description: 'Professional mapping and visualization for incident locations and analysis',
  requiredFields: [
    {
      id: 'incident_id',
      name: 'Incident ID',
      description: 'Unique identifier for the incident',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    },
    {
      id: 'latitude',
      name: 'Latitude',
      description: 'Geographic latitude of the incident',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -90 } },
        { type: 'max', params: { max: 90 } }
      ]
    },
    {
      id: 'longitude',
      name: 'Longitude',
      description: 'Geographic longitude of the incident',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -180 } },
        { type: 'max', params: { max: 180 } }
      ]
    }
  ],
  optionalFields: [
    {
      id: 'incident_type',
      name: 'Incident Type',
      description: 'Classification of the incident (e.g., Fire, EMS)',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'incident_date',
      name: 'Incident Date',
      description: 'Date when the incident occurred',
      dataType: 'date' as FieldDataType,
      isRequired: false
    },
    {
      id: 'incident_time',
      name: 'Incident Time',
      description: 'Time when the incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'address',
      name: 'Address',
      description: 'Street address of the incident',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'city',
      name: 'City',
      description: 'City where the incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'state',
      name: 'State',
      description: 'State where the incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'priority',
      name: 'Priority',
      description: 'Priority level of the incident',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'station',
      name: 'Station',
      description: 'Responding station identifier',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'response_category',
      name: 'Response Category',
      description: 'Category of response required',
      dataType: 'string' as FieldDataType,
      isRequired: false
    }
  ]
};

// Water Supply Coverage tool configuration
export const waterSupplyCoverageToolConfig: ToolConfig = {
  id: 'water-supply-coverage',
  name: 'Water Supply Coverage Analysis',
  description: 'Comprehensive water supply analysis including tanks, hydrants, and mixed infrastructure for all fire department types',
  requiredFields: [
    {
      id: 'asset_id',
      name: 'Asset ID',
      description: 'Unique identifier for the water supply asset (tank, hydrant, etc.)',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    },
    {
      id: 'latitude',
      name: 'Latitude',
      description: 'Geographic latitude of the water supply asset',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -90 } },
        { type: 'max', params: { max: 90 } }
      ]
    },
    {
      id: 'longitude',
      name: 'Longitude',
      description: 'Geographic longitude of the water supply asset',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -180 } },
        { type: 'max', params: { max: 180 } }
      ]
    }
  ],
  optionalFields: [
    {
      id: 'asset_type',
      name: 'Asset Type',
      description: 'Type of water supply (Tank, Hydrant, Dry Hydrant, etc.)',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'capacity',
      name: 'Capacity',
      description: 'Water capacity in gallons (for tanks) or flow rate in GPM (for hydrants)',
      dataType: 'number' as FieldDataType,
      isRequired: false
    },
    {
      id: 'address',
      name: 'Address',
      description: 'Street address of the water supply location',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'city',
      name: 'City',
      description: 'City where the water supply is located',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'state',
      name: 'State',
      description: 'State where the water supply is located',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'status',
      name: 'Status',
      description: 'Operational status (Active, Out of Service, Maintenance, etc.)',
      dataType: 'string' as FieldDataType,
      isRequired: false
    }
  ]
};

// Station Coverage Optimizer tool configuration
export const stationCoverageToolConfig: ToolConfig = {
  id: 'station-coverage-optimizer',
  name: 'Station Coverage Optimizer',
  description: 'Enterprise station placement and coverage analysis with NFPA compliance assessment for optimal response coverage',
  requiredFields: [
    {
      id: 'station_id',
      name: 'Station ID',
      description: 'Unique identifier for the fire station',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    },
    {
      id: 'latitude',
      name: 'Latitude',
      description: 'Geographic latitude of the fire station',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -90 } },
        { type: 'max', params: { max: 90 } }
      ]
    },
    {
      id: 'longitude',
      name: 'Longitude',
      description: 'Geographic longitude of the fire station',
      dataType: 'number' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} },
        { type: 'min', params: { min: -180 } },
        { type: 'max', params: { max: 180 } }
      ]
    }
  ],
  optionalFields: [
    {
      id: 'station_name',
      name: 'Station Name',
      description: 'Name or designation of the fire station',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'station_type',
      name: 'Station Type',
      description: 'Type of station (Career, Volunteer, Combination)',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'apparatus_count',
      name: 'Apparatus Count',
      description: 'Number of apparatus stationed at this location',
      dataType: 'number' as FieldDataType,
      isRequired: false
    },
    {
      id: 'staffing_level',
      name: 'Staffing Level',
      description: 'Average number of personnel on duty',
      dataType: 'number' as FieldDataType,
      isRequired: false
    },
    {
      id: 'address',
      name: 'Address',
      description: 'Street address of the fire station',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'city',
      name: 'City',
      description: 'City where the station is located',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'state',
      name: 'State',
      description: 'State where the station is located',
      dataType: 'string' as FieldDataType,
      isRequired: false
    }
  ]
};

// List of all tool configurations
export const toolConfigs: ToolConfig[] = [
  responseTimeToolConfig,
  fireMapProToolConfig,
  waterSupplyCoverageToolConfig,
  stationCoverageToolConfig
];

// Function to get a tool configuration by ID
export const getToolConfigById = (id: string): ToolConfig | undefined => {
  return toolConfigs.find(config => config.id === id);
};