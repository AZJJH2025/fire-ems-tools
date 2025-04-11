# Standardized Incident Record Schema v3.0

This document defines the standardized schema for incident records used across FireEMS.ai tools.

## Required Fields

These fields MUST be present for core functionality in most tools.

| Field Name | Data Type | Notes | Required By | Optional For |
|------------|-----------|-------|------------|--------------|
| `incident_id` | string | Unique identifier for the incident (e.g., CAD event ID) | response-time, call-density, incident-logger, fire-map-pro, coverage-gap, isochrone-map | - |
| `call_received_datetime` | datetime | ISO 8601 UTC timestamp when the call was received/created (YYYY-MM-DDThh:mm:ssZ) | response-time, call-density, incident-logger, fire-map-pro, coverage-gap, isochrone-map | - |
| `latitude` | number | Incident location latitude (WGS84 decimal degrees) | response-time, call-density, isochrone-map, coverage-gap, fire-map-pro | incident-logger |
| `longitude` | number | Incident location longitude (WGS84 decimal degrees) | response-time, call-density, isochrone-map, coverage-gap, fire-map-pro | incident-logger |

## Optional Fields

These fields enhance tool functionality but are not strictly required by all.

| Field Name | Data Type | Notes | Required By | Optional For |
|------------|-----------|-------|------------|--------------|
| `incident_type` | string | Standardized code or description (e.g., NFIRS code, ProQA code, local code) | incident-logger | response-time, call-density, fire-map-pro |
| `priority` | string | Incident priority/urgency (e.g., "Emergency", "Non-Emergency", "1", "3A") | - | response-time, incident-logger |
| `address` | string | Full street address | - | incident-logger, fire-map-pro |
| `city` | string | City name | - | incident-logger, fire-map-pro |
| `state` | string | State/province code (e.g., AZ, CA) | - | incident-logger, fire-map-pro |
| `zip_code` | string | Postal code | - | incident-logger, fire-map-pro |
| `station_id` | string | Identifier of the primary responding station | coverage-gap | response-time, incident-logger |
| `unit_id` | string | Identifier of the specific responding unit | - | response-time, isochrone-map, incident-logger |
| `unit_dispatched_datetime` | datetime | ISO 8601 UTC timestamp when unit was dispatched | - | response-time |
| `unit_enroute_datetime` | datetime | ISO 8601 UTC timestamp when unit went en route | - | response-time |
| `unit_onscene_datetime` | datetime | ISO 8601 UTC timestamp when unit arrived on scene | response-time | - |
| `unit_cleared_datetime` | datetime | ISO 8601 UTC timestamp when unit cleared scene | - | response-time |
| `narrative` | string | Text description or notes about the incident | - | incident-logger |
| `detector_activated` | boolean | Was a smoke/fire detector activated? | - | fire-map-pro |
| `sprinkler_activated` | boolean | Was a sprinkler system activated? | - | fire-map-pro |

## Implementation Notes

- All datetime fields MUST be in ISO 8601 UTC format, preferably with the 'Z' suffix (e.g., `2024-03-15T14:35:01Z`). Timezone conversion should happen *before* data is sent to the tools. If only date and time are available separately, they should be combined into a single UTC datetime field during transformation.
- Latitude and Longitude MUST be in WGS84 decimal degrees format.
- When mapping source data, prioritize mapping to required fields first.
- Tools listed under "Required By" will likely fail or produce inaccurate results if the field is missing.
- Tools listed under "Optional For" can use the field to provide richer analysis but can function without it.