# MapFieldsManager

The MapFieldsManager is a centralized utility for managing field mapping operations throughout the FireEMS.ai application. It provides a consistent API for creating and applying mappings between different data schemas.

## Overview

When working with emergency services data, different systems and file formats often use different field names for the same information. For example, one system might use "Latitude" while another uses "LAT" or "Y_COORDINATE". The MapFieldsManager helps standardize these variations by providing tools to:

1. Detect field types and appropriate transformations
2. Map fields between source and target schemas
3. Apply transformations to data during mapping
4. Validate mapped data against tool requirements
5. Provide UI configuration for the field mapping interface

## Key Features

- **Automatic field mapping** - Intelligently maps fields based on names, aliases, and data types
- **Field validation** - Ensures required fields are present and correctly formatted
- **Transformation application** - Applies type-specific transformations during mapping
- **UI configuration** - Provides metadata for building field mapping interfaces
- **Consistent API** - Centralizes field mapping logic that was previously spread across components

## Usage Examples

### Basic Field Mapping

```javascript
// Map fields from a source schema to a target schema
const sourceData = [
  { 
    CALL_NO: "2023-001", 
    INCIDENT_DATE: "2023-06-15", 
    LAT: "40.7128", 
    LONG: "-74.0060" 
  }
];

const fieldMap = {
  "Incident ID": "CALL_NO",
  "Incident Date": "INCIDENT_DATE",
  "Latitude": "LAT",
  "Longitude": "LONG"
};

// Apply the mapping
const mappedData = FireEMS.Utils.MapFieldsManager.applyMappings(
  sourceData, 
  fieldMap
);

// Result:
// [
//   {
//     "Incident ID": "2023-001",
//     "Incident Date": "2023-06-15",
//     "Latitude": "40.7128",
//     "Longitude": "-74.0060"
//   }
// ]
```

### Auto-Generate Mappings

```javascript
// Automatically map fields from source columns to target schema
const sourceColumns = [
  "CALL_NO", "INCIDENT_DATE", "INCIDENT_TIME", 
  "LAT", "LONG", "PRIORITY", "UNIT_ID"
];

const targetSchema = [
  {
    id: "incident_id",
    name: "Incident ID",
    type: "text",
    required: true
  },
  {
    id: "latitude",
    name: "Latitude",
    type: "coordinate",
    required: true
  },
  // ... more fields
];

// Generate mappings automatically
const mappings = FireEMS.Utils.MapFieldsManager.autoGenerateMappings(
  sourceColumns,
  targetSchema
);

// Result:
// {
//   "incident_id": 0,  // Index of "CALL_NO"
//   "latitude": 3      // Index of "LAT"
//   // ... more mappings
// }
```

### Apply Transformations

```javascript
// Apply mappings with transformations
const fieldMap = {
  "Incident ID": "CALL_NO",
  "Incident Date": "INCIDENT_DATE",
  "Latitude": "LAT",
  "Longitude": "LONG"
};

const transformConfigs = {
  "Incident Date": {
    type: "date",
    sourceFormat: "MM/DD/YYYY",
    targetFormat: "ISO8601"
  },
  "Latitude": {
    type: "coordinate",
    format: "decimal"
  }
};

const transformedData = FireEMS.Utils.MapFieldsManager.applyMappings(
  sourceData, 
  fieldMap,
  transformConfigs
);

// Result includes transformed values
```

### Validate Mapped Data

```javascript
// Validate data against tool requirements
const mappedRecord = {
  "Incident ID": "2023-001",
  "Incident Date": "2023-06-15",
  "Latitude": 40.7128,
  "Longitude": -74.0060,
  // Missing required field: "Incident Time"
};

const validationResult = FireEMS.Utils.MapFieldsManager.validateMappedData(
  mappedRecord,
  "response-time" // Tool ID
);

// Result:
// {
//   valid: false,
//   errors: ["Missing required field: Incident Time"],
//   warnings: []
// }
```

## Integration with Data Formatter

The MapFieldsManager is deeply integrated with the Data Formatter tool, providing:

1. Drag-and-drop field mapping interface
2. Field transformation configurations
3. Tool-specific validation
4. Integration with the DataFormatterAPI

## Field Categories

Fields are organized into the following categories:

- **timestamp** - Date and time fields (e.g., Incident Date, Dispatch Time)
- **location** - Geographic location fields (e.g., Latitude, Longitude, Address)
- **incident** - Core incident information (e.g., Incident ID, Incident Type, Priority)
- **nfirs** - NFIRS reporting fields (e.g., NFIRS Type, FDID)
- **patient** - Patient information fields (HIPAA compliant)
- **calculated** - Fields calculated from other fields (e.g., Response Time)
- **other** - Miscellaneous fields that don't fit other categories

## Extended Field Aliases

The utility maintains an extensive list of field aliases to handle the many variations of field names used across different CAD and RMS systems, including:

- Motorola PremierOne
- Tyler New World
- Hexagon/Intergraph
- Central Square
- ImageTrend

## Transformation Types

The following transformation types are supported:

- **text** - String transformations (uppercase, lowercase, capitalize, trim)
- **date** - Date format conversions
- **time** - Time format conversions
- **coordinate** - Coordinate format standardization
- **number** - Numeric format standardization

## API Reference

### Core Functions

- **findMatchingField(record, targetField)** - Find a matching field in a record
- **applyMappings(data, fieldMap, transformConfigs)** - Apply field mappings to data
- **autoGenerateMappings(sourceFields, targetSchema, options)** - Generate mappings automatically
- **validateMappedData(mappedData, toolId)** - Validate mapped data against tool requirements

### Field Metadata Functions

- **getRequiredFieldsForTool(toolId)** - Get required fields for a specific tool
- **findFieldInSchema(fieldName)** - Find a field in the standard schema
- **createStandardizedField(fieldName, sampleValue)** - Create a standardized field object
- **detectFieldType(fieldName, sampleValue)** - Detect field type from name and sample value
- **categorizeField(fieldName)** - Categorize a field based on its name
- **getFieldUIConfig(field)** - Get UI configuration for a field

### Transform Functions

- **applyTransformation(value, config)** - Apply a transformation to a value

### API Helper Functions

- **generateEmptyMapping(targetSchema)** - Generate an empty mapping configuration
- **convertMappingsForAPI(mappings, sourceColumns, targetSchema, transformConfigs)** - Convert mappings to API format

## Shortcuts

Two convenience aliases are provided:

- **FireEMS.Utils.mapFields** - Shortcut for `FireEMS.Utils.MapFieldsManager.applyMappings`
- **FireEMS.Utils.autoMap** - Shortcut for `FireEMS.Utils.MapFieldsManager.autoGenerateMappings`