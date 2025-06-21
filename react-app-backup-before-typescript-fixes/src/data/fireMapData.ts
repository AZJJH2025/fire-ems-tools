/**
 * Fire Map Pro - Real Data for Fire/EMS Operations
 * 
 * Provides actual geospatial data that fire chiefs and EMS coordinators need.
 * This creates immediate value and eliminates the "empty map" problem.
 */

import { MapFeature, MapLayer } from '@/types/fireMapPro';

// Simple SVG icons without Unicode characters
const fireStationSVG = 'data:image/svg+xml,%3Csvg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="32" height="32" fill="%23DC2626"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EFS%3C/text%3E%3C/svg%3E';

const hospitalSVG = 'data:image/svg+xml,%3Csvg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="32" height="32" fill="%234488FF"/%3E%3Cpath d="M15 10h2v12h-2v-12zM10 15h12v2H10v-2z" fill="white"/%3E%3C/svg%3E';

const hydrantSVG = 'data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="8" fill="%23FF6600"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EH%3C/text%3E%3C/svg%3E';

const fireSVG = 'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23DC2626"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8px" fill="white" font-weight="bold"%3EF%3C/text%3E%3C/svg%3E';

const medicalSVG = 'data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="12" cy="12" r="10" fill="%2344FF44"/%3E%3Cpath d="M11 8h2v8h-2v-8zM8 11h8v2H8v-2z" fill="white"/%3E%3C/svg%3E';

// Empty fire stations array - users can add their own data
const sampleFireStations: MapFeature[] = [];

// Empty hospitals array - users can add their own data
const sampleHospitals: MapFeature[] = [];

// Empty hydrants array - users can add their own data
const sampleHydrants: MapFeature[] = [];

// Empty incidents array - users can add their own data
const sampleIncidents: MapFeature[] = [];

// Empty response zones array - users can add their own data
const sampleResponseZones: MapFeature[] = [];

// Pre-defined layers that provide immediate value
export const defaultMapLayers: MapLayer[] = [
  {
    id: 'fire-stations',
    name: 'Fire Stations',
    visible: false, // Hidden by default when empty
    opacity: 1,
    zIndex: 3,
    type: 'feature',
    features: sampleFireStations,
    metadata: {
      description: 'Add your fire stations using the drawing tools or data import',
      source: 'User Data',
      created: new Date(),
      featureCount: sampleFireStations.length
    }
  },
  {
    id: 'hospitals',
    name: 'Medical Facilities',
    visible: false, // Hidden by default when empty
    opacity: 1,
    zIndex: 2,
    type: 'feature',
    features: sampleHospitals,
    metadata: {
      description: 'Add hospitals and medical facilities to your map',
      source: 'User Data',
      created: new Date(),
      featureCount: sampleHospitals.length
    }
  },
  {
    id: 'hydrants',
    name: 'Fire Hydrants',
    visible: false, // Hidden by default when empty
    opacity: 1,
    zIndex: 1,
    type: 'feature',
    features: sampleHydrants,
    metadata: {
      description: 'Map fire hydrants with flow rates and inspection data',
      source: 'User Data',
      created: new Date(),
      featureCount: sampleHydrants.length
    }
  },
  {
    id: 'recent-incidents',
    name: 'Incidents',
    visible: false, // Hidden by default when empty
    opacity: 1,
    zIndex: 4,
    type: 'feature',
    features: sampleIncidents,
    metadata: {
      description: 'Track emergency incidents and responses',
      source: 'User Data',
      created: new Date(),
      featureCount: sampleIncidents.length
    }
  },
  {
    id: 'response-zones',
    name: 'Response Zones',
    visible: false,
    opacity: 0.6,
    zIndex: 0,
    type: 'feature',
    features: sampleResponseZones,
    metadata: {
      description: 'Define coverage areas and response zones',
      source: 'User Data',
      created: new Date(),
      featureCount: sampleResponseZones.length
    }
  }
];

// Sample data for testing file import functionality
export const sampleCSVData = `Station,Latitude,Longitude,Type,Apparatus
Station 3,39.8400,-98.5600,Engine,Engine 3
Station 4,39.8100,-98.5400,Ladder,Ladder 4
Station 5,39.8500,-98.5800,Tanker,Tanker 5`;

export const sampleGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-98.5600, 39.8400]
      },
      "properties": {
        "name": "Station 3",
        "type": "Fire Station"
      }
    }
  ]
};