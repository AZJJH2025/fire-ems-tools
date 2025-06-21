import { ToolConfig, FieldDataType } from '@/types/formatter';

/**
 * Mock tool configurations for development and testing
 */

// Response Time Analyzer tool configuration
export const responseTimeToolConfig: ToolConfig = {
  id: 'response-time',
  name: 'Response Time Analyzer',
  description: 'Analyze incident response times and visualize performance metrics',
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
      id: 'incident_date',
      name: 'Incident Date',
      description: 'Date when the incident occurred',
      dataType: 'date' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    },
    {
      id: 'incident_time',
      name: 'Incident Time',
      description: 'Time when the incident occurred',
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
    },
    {
      id: 'incident_type',
      name: 'Incident Type',
      description: 'Classification of the incident (e.g., Fire, EMS)',
      dataType: 'string' as FieldDataType,
      isRequired: true,
      validationRules: [
        { type: 'required', params: {} }
      ]
    }
  ],
  optionalFields: [
    {
      id: 'dispatch_time',
      name: 'Dispatch Time',
      description: 'Time when units were dispatched (can include date component)',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      // Custom validation that allows date-time combination
      validationRules: []
    },
    {
      id: 'enroute_time',
      name: 'En Route Time',
      description: 'Time when units began traveling to the incident (can include date component)',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      // Custom validation that allows date-time combination
      validationRules: []
    },
    {
      id: 'arrival_time',
      name: 'Arrival Time',
      description: 'Time when units arrived on scene (can include date component)',
      dataType: 'string' as FieldDataType,
      isRequired: false,
      // Custom validation that allows date-time combination
      validationRules: []
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
      id: 'zip_code',
      name: 'ZIP Code',
      description: 'ZIP code where the incident occurred',
      dataType: 'string' as FieldDataType,
      isRequired: false
    },
    {
      id: 'responding_unit',
      name: 'Responding Unit',
      description: 'Identifier of the unit that responded',
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