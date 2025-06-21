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

// Call Density Heatmap tool configuration
export const callDensityToolConfig: ToolConfig = {
  id: 'call-density',
  name: 'Call Density Heatmap',
  description: 'Visualize incident density across geographic areas',
  requiredFields: [
    {
      id: 'incident_id',
      name: 'Incident ID',
      description: 'Unique identifier for the incident',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
        // No additional validation for incident ID, accept any format
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
      id: 'incident_type',
      name: 'Incident Type',
      description: 'Classification of the incident (e.g., Fire, EMS)',
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
      id: 'priority',
      name: 'Priority',
      description: 'Priority level of the incident',
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

// List of all tool configurations
export const toolConfigs: ToolConfig[] = [
  responseTimeToolConfig,
  callDensityToolConfig,
  fireMapProToolConfig
];

// Function to get a tool configuration by ID
export const getToolConfigById = (id: string): ToolConfig | undefined => {
  return toolConfigs.find(config => config.id === id);
};