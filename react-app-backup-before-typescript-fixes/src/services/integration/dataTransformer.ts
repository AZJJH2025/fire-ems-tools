/**
 * Data Transformer Service for Tool Integration
 * 
 * Transforms data between different tools in the Fire/EMS ecosystem.
 * Handles data format conversion, field mapping, and validation.
 */

import { MapFeature, MapLayer, FeatureType } from '@/types/fireMapPro';
import { IncidentRecord } from '@/types/analyzer';

// Tool-specific data transformation interfaces
export interface ToolTransformOptions {
  toolId: string;
  dataMapping?: Record<string, string>;
  customTransforms?: Record<string, (value: any) => any>;
}

export interface TransformResult<T = any> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  metadata: {
    totalRecords: number;
    successfulRecords: number;
    skippedRecords: number;
  };
}

// Incident type to icon mapping for Fire Map Pro
const incidentTypeIcons: Record<string, { category: string; color: string; icon: string }> = {
  'fire': { category: 'fire', color: '#dc2626', icon: 'fire' },
  'structure fire': { category: 'fire', color: '#dc2626', icon: 'fire' },
  'vehicle fire': { category: 'fire', color: '#ff6600', icon: 'fire' },
  'wildfire': { category: 'fire', color: '#ff4444', icon: 'fire' },
  'medical': { category: 'medical', color: '#22c55e', icon: 'medical' },
  'ems': { category: 'medical', color: '#22c55e', icon: 'medical' },
  'cardiac': { category: 'medical', color: '#ef4444', icon: 'medical' },
  'respiratory': { category: 'medical', color: '#3b82f6', icon: 'medical' },
  'rescue': { category: 'rescue', color: '#f59e0b', icon: 'rescue' },
  'vehicle accident': { category: 'rescue', color: '#f59e0b', icon: 'rescue' },
  'hazmat': { category: 'hazmat', color: '#8b5cf6', icon: 'hazmat' },
  'alarm': { category: 'alarm', color: '#6b7280', icon: 'alarm' },
  'false alarm': { category: 'alarm', color: '#9ca3af', icon: 'alarm' }
};

// SVG icon templates
const createSVGIcon = (type: string, color: string): string => {
  const icons: Record<string, string> = {
    fire: `data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EF%3C/text%3E%3C/svg%3E`,
    medical: `data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}"/%3E%3Cpath d="M11 8h2v8h-2v-8zM8 11h8v2H8v-2z" fill="white"/%3E%3C/svg%3E`,
    rescue: `data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3ER%3C/text%3E%3C/svg%3E`,
    hazmat: `data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EH%3C/text%3E%3C/svg%3E`,
    alarm: `data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="${encodeURIComponent(color)}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E`
  };
  
  return icons[type] || icons.fire;
};

export class DataTransformer {
  /**
   * Transform incident data to Fire Map Pro format
   */
  static transformToFireMapPro(
    incidents: Record<string, any>[],
    options: ToolTransformOptions = { toolId: 'fire-map-pro' }
  ): TransformResult<{ layer: MapLayer; features: MapFeature[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const features: MapFeature[] = [];
    let successfulRecords = 0;
    let skippedRecords = 0;

    incidents.forEach((incident, index) => {
      try {
        // Validate required fields
        const incidentId = incident['Incident ID'] || incident['incidentId'] || incident['id'];
        const latitude = parseFloat(incident['Latitude'] || incident['latitude'] || incident['lat']);
        const longitude = parseFloat(incident['Longitude'] || incident['longitude'] || incident['lng'] || incident['lon']);

        if (!incidentId) {
          errors.push(`Row ${index + 1}: Missing Incident ID`);
          skippedRecords++;
          return;
        }

        if (isNaN(latitude) || isNaN(longitude)) {
          errors.push(`Row ${index + 1}: Invalid or missing coordinates`);
          skippedRecords++;
          return;
        }

        // Extract incident details
        const incidentType = incident['Incident Type'] || incident['incidentType'] || incident['type'] || 'Unknown';
        const incidentDate = incident['Incident Date'] || incident['incidentDate'] || incident['date'];
        const incidentTime = incident['Incident Time'] || incident['incidentTime'] || incident['time'];
        const address = incident['Address'] || incident['address'] || '';
        const city = incident['City'] || incident['city'] || '';
        const state = incident['State'] || incident['state'] || '';
        const priority = incident['Priority'] || incident['priority'] || '';
        const station = incident['Station'] || incident['station'] || '';
        const responseCategory = incident['Response Category'] || incident['responseCategory'] || '';

        // Determine icon based on incident type
        const typeKey = incidentType.toLowerCase();
        const iconConfig = incidentTypeIcons[typeKey] || incidentTypeIcons['fire'];

        // Create MapFeature
        const feature: MapFeature = {
          id: `incident-${incidentId}`,
          type: 'marker' as FeatureType,
          title: `${incidentType} - ${incidentId}`,
          description: `${incidentType} incident${address ? ` at ${address}` : ''}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`,
          coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
          style: {
            color: iconConfig.color,
            icon: {
              id: `${iconConfig.icon}-icon`,
              name: iconConfig.icon,
              category: iconConfig.category as any,
              url: createSVGIcon(iconConfig.icon, iconConfig.color),
              size: 'medium' as any,
              color: iconConfig.color,
              anchor: [12, 24],
              popupAnchor: [0, -24]
            }
          },
          properties: {
            incidentId,
            incidentType,
            incidentDate,
            incidentTime,
            address,
            city,
            state,
            priority,
            station,
            responseCategory,
            coordinates: { latitude, longitude },
            // Add formatted display properties
            fullAddress: [address, city, state].filter(Boolean).join(', '),
            dateTime: incidentDate && incidentTime ? `${incidentDate} ${incidentTime}` : incidentDate || '',
            displayText: `${incidentType}${priority ? ` (${priority})` : ''}${station ? ` - Station ${station}` : ''}`
          },
          layerId: 'imported-incidents',
          created: new Date(),
          modified: new Date()
        };

        features.push(feature);
        successfulRecords++;

        // Add warnings for missing optional fields
        if (!incidentDate) {
          warnings.push(`Row ${index + 1}: Missing incident date`);
        }
        if (!address && !city) {
          warnings.push(`Row ${index + 1}: Missing address information`);
        }

      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skippedRecords++;
      }
    });

    // Create the map layer
    const layer: MapLayer = {
      id: 'imported-incidents',
      name: `Imported Incidents (${features.length})`,
      visible: true,
      opacity: 1,
      zIndex: 1000,
      type: 'feature',
      features,
      style: {
        defaultStyle: {
          color: '#dc2626',
          fillColor: '#dc2626',
          fillOpacity: 0.7,
          weight: 2,
          opacity: 1
        }
      },
      metadata: {
        description: `Incident data imported from Data Formatter - ${features.length} incidents`,
        source: 'Data Formatter',
        created: new Date(),
        featureCount: features.length,
        bounds: features.length > 0 ? this.calculateBounds(features) : undefined
      }
    };

    return {
      success: errors.length === 0 || successfulRecords > 0,
      data: { layer, features },
      errors,
      warnings,
      metadata: {
        totalRecords: incidents.length,
        successfulRecords,
        skippedRecords
      }
    };
  }

  /**
   * Transform incident data to Response Time Analyzer format
   */
  static transformToResponseTimeAnalyzer(
    incidents: Record<string, any>[],
    options: ToolTransformOptions = { toolId: 'response-time-analyzer' }
  ): TransformResult<IncidentRecord[]> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const records: IncidentRecord[] = [];
    let successfulRecords = 0;
    let skippedRecords = 0;

    incidents.forEach((incident, index) => {
      try {
        // Validate required fields
        const incidentId = incident['Incident ID'] || incident['incidentId'] || incident['id'];
        const incidentDate = incident['Incident Date'] || incident['incidentDate'] || incident['date'];

        if (!incidentId) {
          errors.push(`Row ${index + 1}: Missing Incident ID`);
          skippedRecords++;
          return;
        }

        if (!incidentDate) {
          errors.push(`Row ${index + 1}: Missing Incident Date`);
          skippedRecords++;
          return;
        }

        // Create IncidentRecord
        const record: IncidentRecord = {
          incidentId: String(incidentId),
          incidentDate: String(incidentDate),
          incidentTime: incident['Incident Time'] || incident['incidentTime'] || incident['time'],
          dispatchTime: incident['Dispatch Time'] || incident['dispatchTime'],
          enRouteTime: incident['En Route Time'] || incident['enRouteTime'],
          arrivalTime: incident['Arrival Time'] || incident['arrivalTime'] || incident['On Scene Time'],
          clearTime: incident['Clear Time'] || incident['clearTime'],
          latitude: parseFloat(incident['Latitude'] || incident['latitude']),
          longitude: parseFloat(incident['Longitude'] || incident['longitude']),
          incidentType: incident['Incident Type'] || incident['incidentType'] || incident['type'],
          respondingUnit: incident['Station'] || incident['station'] || incident['unit'],
          address: incident['Address'] || incident['address'],
          city: incident['City'] || incident['city'],
          state: incident['State'] || incident['state'],
          zipCode: incident['Zip Code'] || incident['zipCode'],
          priority: incident['Priority'] || incident['priority']
        };

        records.push(record);
        successfulRecords++;

      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        skippedRecords++;
      }
    });

    return {
      success: errors.length === 0 || successfulRecords > 0,
      data: records,
      errors,
      warnings,
      metadata: {
        totalRecords: incidents.length,
        successfulRecords,
        skippedRecords
      }
    };
  }

  /**
   * Calculate bounds for a set of map features
   */
  private static calculateBounds(features: MapFeature[]) {
    const coords = features
      .filter(f => f.type === 'marker')
      .map(f => f.coordinates as [number, number]);

    if (coords.length === 0) return undefined;

    const lats = coords.map(c => c[1]);
    const lngs = coords.map(c => c[0]);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }

  /**
   * Validate data compatibility with a specific tool
   */
  static validateDataForTool(
    data: Record<string, any>[],
    toolRequirements: { requiredFields: string[]; optionalFields?: string[] }
  ): { compatible: boolean; missingFields: string[]; availableOptionalFields: string[] } {
    if (!data || data.length === 0) {
      return { compatible: false, missingFields: toolRequirements.requiredFields, availableOptionalFields: [] };
    }

    const dataFields = Object.keys(data[0]);
    const missingFields = toolRequirements.requiredFields.filter(
      field => !dataFields.includes(field)
    );

    const availableOptionalFields = toolRequirements.optionalFields
      ? toolRequirements.optionalFields.filter(field => dataFields.includes(field))
      : [];

    return {
      compatible: missingFields.length === 0,
      missingFields,
      availableOptionalFields
    };
  }
}

export default DataTransformer;