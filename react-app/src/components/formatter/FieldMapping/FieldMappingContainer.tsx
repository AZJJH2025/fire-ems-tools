import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import { RootState } from '@/state/redux/store';
import { 
  setCurrentStep, 
  setMappings,
  setTransformedData,
  setProcessingStatus,
  setSampleData
} from '@/state/redux/formatterSlice';
import { FieldMapping } from '@/types/formatter';
import { transformData } from '../../../services/transformation/dataTransformer';
import { detectDateTimePattern } from '../../../utils/dateTimeDetection';
import SourceFieldsList from './SourceFieldsList';
import TargetFieldsPanel from './TargetFieldsPanel';
import ValidationPanel from './ValidationPanel';
import LivePreviewStrip from './LivePreviewStrip';
import TemplateManager from './TemplateManager';
import useTemplateSync from '@/hooks/useTemplateSync';

// 🔧 FIELD MAPPING MIGRATION HELPERS - For systematic fix
// These helpers ensure safe migration from display names to field IDs

/**
 * Converts a target field identifier to the correct field ID
 * Handles both legacy display names and modern field IDs
 * @param targetField - Either a display name or field ID
 * @param toolConfig - Tool configuration with field definitions
 * @returns The correct field ID
 */
const getFieldId = (targetField: string, toolConfig: any): string => {
  if (!toolConfig) return targetField;
  
  const allFields = [...toolConfig.requiredFields, ...toolConfig.optionalFields];
  
  // Check if it's already a field ID
  const directMatch = allFields.find((f: any) => f.id === targetField);
  if (directMatch) {
    console.log(`✅ Field ID already correct: "${targetField}"`);
    return targetField;
  }
  
  // Check if it's a display name that needs conversion
  const nameMatch = allFields.find((f: any) => f.name === targetField);
  if (nameMatch) {
    console.log(`🔄 Converting display name "${targetField}" to field ID "${nameMatch.id}"`);
    return nameMatch.id;
  }
  
  console.warn(`⚠️ Unknown target field: "${targetField}" - keeping as-is`);
  return targetField;
};

/**
 * Migrates a field mapping array to use field IDs instead of display names
 * @param mappings - Array of field mappings
 * @param toolConfig - Tool configuration
 * @returns Migrated mappings using field IDs
 */
const migrateFieldMappings = (mappings: FieldMapping[], toolConfig: any): FieldMapping[] => {
  if (!toolConfig || !mappings) return mappings;
  
  console.log('🔄 Starting field mapping migration...');
  
  const migratedMappings = mappings.map(mapping => {
    const originalTarget = mapping.targetField;
    const migratedTarget = getFieldId(mapping.targetField, toolConfig);
    
    if (originalTarget !== migratedTarget) {
      console.log(`📋 Migrating: "${mapping.sourceField}" → "${originalTarget}" becomes "${mapping.sourceField}" → "${migratedTarget}"`);
    }
    
    return {
      ...mapping,
      targetField: migratedTarget
    };
  });
  
  console.log('✅ Field mapping migration complete');
  return migratedMappings;
};

/**
 * Validates if a field mapping uses field IDs consistently
 * @param mappings - Array of field mappings to validate
 * @param toolConfig - Tool configuration
 * @returns Validation results
 */
const validateFieldMappingConsistency = (mappings: FieldMapping[], toolConfig: any) => {
  if (!toolConfig || !mappings) return { isConsistent: true, issues: [] };
  
  const allFields = [...toolConfig.requiredFields, ...toolConfig.optionalFields];
  const issues: string[] = [];
  
  mappings.forEach(mapping => {
    const isFieldId = allFields.some((f: any) => f.id === mapping.targetField);
    const isDisplayName = allFields.some((f: any) => f.name === mapping.targetField);
    
    if (isDisplayName && !isFieldId) {
      issues.push(`Mapping "${mapping.sourceField}" → "${mapping.targetField}" uses display name instead of field ID`);
    } else if (!isFieldId && !isDisplayName) {
      issues.push(`Mapping "${mapping.sourceField}" → "${mapping.targetField}" targets unknown field`);
    }
  });
  
  return { isConsistent: issues.length === 0, issues };
};

/**
 * Parse POINT coordinate data to extract longitude and latitude
 * @param pointData - POINT coordinate string like "POINT (-86.554080 34.730369)" or "POINT(-86.554080 34.730369)"
 * @returns Object with longitude and latitude extracted
 */
const parsePOINTCoordinates = (pointData: string): { longitude: number | null; latitude: number | null } => {
  if (!pointData || typeof pointData !== 'string') {
    return { longitude: null, latitude: null };
  }

  const point = pointData.trim();
  
  // POINT coordinate patterns - handle both with and without spaces after POINT
  const patterns = [
    // Standard: POINT(-86.554080 34.730369)
    /^POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)$/i,
    // With comma: POINT(-86.554080, 34.730369)
    /^POINT\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)$/i,
    // Strict format: POINT ( -86.554080 34.730369 )
    /^POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)$/i
  ];
  
  for (const pattern of patterns) {
    const match = point.match(pattern);
    if (match) {
      const longitude = parseFloat(match[1]);
      const latitude = parseFloat(match[2]);
      
      // Validate coordinate ranges
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        console.log(`🌍 POINT COORDINATE PARSING: "${pointData}" → Longitude: ${longitude}, Latitude: ${latitude}`);
        return { longitude, latitude };
      } else {
        console.warn(`🌍 POINT COORDINATE PARSING: Invalid coordinate ranges - Longitude: ${longitude}, Latitude: ${latitude}`);
      }
    }
  }
  
  console.log(`🌍 POINT COORDINATE PARSING FAILED: Could not extract coordinates from "${pointData}"`);
  return { longitude: null, latitude: null };
};

/**
 * Parse US address to extract city and state components
 * @param fullAddress - Full address string like "2805 Navigation Blvd Houston TX"
 * @returns Object with city and state extracted
 */
const parseUSAddress = (fullAddress: string): { city: string | null; state: string | null } => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return { city: null, state: null };
  }

  const address = fullAddress.trim();
  
  // 🔧 ENHANCED ADDRESS PARSING: Handle more edge cases and improve reliability
  
  // Common US state abbreviations for validation
  const validStates = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ]);
  
  // Enhanced patterns with better city/state separation
  const patterns = [
    // Pattern 1: "...City State Zip" with strict city validation
    /^.+\s+([A-Za-z][A-Za-z\s]+?)\s+([A-Z]{2})\s+\d{5}(?:-\d{4})?\s*$/,
    // Pattern 2: "...City State" (no zip) - most common
    /^.+\s+([A-Za-z][A-Za-z\s]+?)\s+([A-Z]{2})\s*$/,
    // Pattern 3: Handle comma separation: "Street, City, State" 
    /^.+,\s*([A-Za-z][A-Za-z\s]+?),?\s+([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/,
    // Pattern 4: Handle multiple spaces: "Street   City   State"
    /^.+\s{2,}([A-Za-z][A-Za-z\s]+?)\s{2,}([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/
  ];
  
  for (const pattern of patterns) {
    const match = address.match(pattern);
    if (match) {
      let city = match[1].trim();
      const state = match[2].trim();
      
      // Enhanced validation
      if (validStates.has(state) && city.length >= 2 && city.length <= 50) {
        // Clean up city name: remove common street suffixes that might be included
        const streetSuffixes = /\b(st|ave|blvd|rd|dr|ln|way|ct|pl|pkwy)\.?$/i;
        city = city.replace(streetSuffixes, '').trim();
        
        // Ensure we still have a valid city after cleanup
        if (city.length >= 2) {
          console.log(`🏠 ENHANCED ADDRESS PARSING: "${fullAddress}" → City: "${city}", State: "${state}"`);
          return { city, state };
        }
      }
    }
  }
  
  // Enhanced fallback: Look for any valid state abbreviation
  const statePattern = new RegExp(`\\s+([A-Z]{2})(?:\\s+\\d{5}(?:-\\d{4})?)?\\s*$`);
  const stateMatch = address.match(statePattern);
  if (stateMatch) {
    const state = stateMatch[1];
    if (validStates.has(state)) {
      // Extract city more intelligently
      const beforeState = address.substring(0, address.lastIndexOf(state)).trim();
      const words = beforeState.split(/\s+/);
      
      // Take last 1-3 words as potential city (skip obvious street components)
      const cityWords = words.slice(-3).filter(word => 
        !/^\d+$/.test(word) && // Not just a number
        !/^(north|south|east|west|n|s|e|w)$/i.test(word) && // Not directions
        !/^(st|ave|blvd|rd|dr|ln|way|ct|pl|pkwy)\.?$/i.test(word) // Not street suffixes
      );
      
      if (cityWords.length > 0) {
        const city = cityWords.join(' ');
        if (city.length >= 2 && city.length <= 50) {
          console.log(`🏠 FALLBACK ADDRESS PARSING: "${fullAddress}" → City: "${city}", State: "${state}"`);
          return { city, state };
        }
      }
    }
  }
  
  console.log(`🏠 ADDRESS PARSING FAILED: Could not extract city/state from "${fullAddress}"`);
  return { city: null, state: null };
};

/**
 * Gets common field name variations for enhanced auto-mapping
 * @param fieldId - Target field ID to find variations for
 * @returns Array of potential field name variations
 */
const getFieldVariations = (fieldId: string): string[] => {
  const variations: Record<string, string[]> = {
    // Incident ID variations
    'incident_id': [
      'incident_number', 'incidentnumber', 'incident_num', 'inc_num', 'incnum',
      'case_number', 'call_number', 'event_id', 'event_number', 'report_number',
      'incidentnum', 'eventnum'
    ],
    
    // Time field variations (Console One CAD support added)
    'incident_time': [
      'call_received_time', 'callreceivedtime', 'received_time', 'call_time',
      'incident_datetime', 'receive_time', 'time_received', 'incident_date',
      'inc_date_time', 'alarm_time', 'calldatetime', 'call_datetime'
      // NOTE: Re-added 'incident_date' for dual mapping - when incident_date contains full datetime,
      // it should map to both incident_date (date-only) AND incident_time (full datetime)
      // NOTE: Added 'inc_date_time' for Console One CAD support
      // NOTE: Added 'alarm_time' for Tyler CAD support
      // NOTE: Added 'calldatetime' for Hexagon CAD support
    ],
    
    'arrival_time': [
      'arrive_time', 'arrivetime', 'on_scene_time', 'onscenetime', 
      'scene_time', 'arrival_datetime', 'on_scene_datetime', 'arrivaldatetime', 'onscenetime'
    ],
    
    'dispatch_time': [
      'dispatched_time', 'dispatchedtime', 'dispatch_datetime',
      'notification_time', 'notified_time', 'dispatchdatetime'
    ],
    
    'enroute_time': [
      'en_route_time', 'enroutetime', 'turnout_time', 'turnouttime',
      'responding_time', 'travel_start_time', 'enroutedatetime'
    ],
    
    'clear_time': [
      'cleared_time', 'clearedtime', 'clear_datetime', 'back_in_service_time',
      'available_time', 'service_time', 'unit_clear_time', 'cleardatetime'
    ],
    
    // Location variations
    'latitude': [
      'lat', 'y_coord', 'y_coordinate', 'gps_lat', 'coord_y', 'ycoord'
    ],
    
    'longitude': [
      'lng', 'lon', 'long', 'x_coord', 'x_coordinate', 'gps_lng', 'gps_lon', 'coord_x', 'xcoord'
    ],
    
    // Address variations
    'address': [
      'incident_address', 'location', 'street_address', 'full_address', 'addr', 'locationaddress'
    ],
    
    // Unit variations (Console One CAD support)
    'responding_unit': [
      'unit', 'primary_unit', 'first_unit', 'apparatus', 'resource',
      'unit_id', 'responding_units', 'primaryunit'
    ],
    
    // Incident Type variations (Console One CAD support)
    'incident_type': [
      'inc_type_code', 'inctypecode', 'inc_type_desc', 'inctypedesc',
      'call_type', 'emergency_type', 'event_type', 'nature_code',
      'problem_type', 'incidenttype', 'incidentcategory', 'calltype'
    ],
    
    // ZIP Code variations  
    'zip_code': [
      'zip', 'zipcode', 'postal_code', 'postcode', 'locationzip'
    ],

    // City variations (enhanced for Hexagon support)
    'city': [
      'incident_city', 'location_city', 'locationcity'
    ],

    // State variations (enhanced for Hexagon support)  
    'state': [
      'incident_state', 'location_state', 'locationstate'
    ],

    // Additional operational fields for comprehensive CAD support
    'priority': [
      'incident_priority', 'call_priority', 'priority_level'
    ],

    'disposition': [
      'incident_disposition', 'final_disposition', 'outcome', 'incident_outcome'
    ],

    'district': [
      'response_district', 'fire_district', 'service_district', 'districts'
    ],

    'cross_streets': [
      'cross_street', 'nearest_intersection', 'intersection'
    ]
  };
  
  return variations[fieldId] || [];
};

// Field mapping context
export interface MappingTemplate {
  id: string;
  name: string;
  description?: string;
  toolId: string;
  mappings: FieldMapping[];
  lastModified: number;
}

const FieldMappingContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    sourceColumns, 
    sampleData, 
    selectedTool, 
    mappings, 
    processingStatus 
  } = useSelector((state: RootState) => state.formatter);
  
  // State for the current active template
  const [currentTemplate, setCurrentTemplate] = useState<MappingTemplate>({
    id: `template-${Date.now()}`,
    name: 'Untitled Mapping',
    toolId: selectedTool?.id || '',
    mappings: mappings || [],
    lastModified: Date.now()
  });
  
  // Track if template has been modified (for sync)
  const [templateDirty, setTemplateDirty] = useState(false);
  
  // Template suggestions based on current mappings
  const [suggestedTemplates, setSuggestedTemplates] = useState<MappingTemplate[]>([]);
  
  // Auto-mapping in progress state
  const [autoMappingInProgress, setAutoMappingInProgress] = useState(false);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[]>([]);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    open: boolean;
  }>({
    message: '',
    severity: 'info',
    open: false
  });
  
  // Search/filter state
  const [sourceFilter, setSourceFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  
  // Flag for showing all fields (vs. categorized)
  const [showAllFields, setShowAllFields] = useState(false);
  
  // Template statistics - will be calculated in useTemplateSync hook
  
  // Load the tool configuration based on selectedTool
  const toolConfig = selectedTool || undefined;
  
  // Use our custom hook for template synchronization
  const { 
    saveToServer, 
    autoSaveTemplate, 
    findSimilarTemplates, 
    getTemplateStats,
    cleanupAutoSaved 
  } = useTemplateSync(currentTemplate, templateDirty);
  
  // Template statistics
  const templateStats = getTemplateStats();
  
  // 🔧 CRITICAL FIX: Clear localStorage templates that use old field names (display names instead of field IDs)
  useEffect(() => {
    const templateKeys = Object.keys(localStorage).filter(key => key.startsWith('tmpl:'));
    templateKeys.forEach(key => {
      const templateJson = localStorage.getItem(key);
      if (templateJson) {
        try {
          const template = JSON.parse(templateJson);
          // Check if any mappings use display names instead of field IDs
          const hasDisplayNames = template.mappings?.some((m: any) => 
            m.targetField && m.targetField.includes(' ') // Display names contain spaces
          );
          if (hasDisplayNames) {
            console.log(`🔧 CLEARING OUTDATED TEMPLATE: ${key} (uses display names instead of field IDs)`);
            localStorage.removeItem(key);
          }
        } catch (e) {
          console.log(`🔧 CLEARING CORRUPTED TEMPLATE: ${key}`);
          localStorage.removeItem(key);
        }
      }
    });
  }, []); // Run once on mount
  
  // FIXED: Clear state synchronization to avoid race conditions
  // This effect synchronizes the Redux mappings state to our local template state
  // It only runs when the Redux mappings change, making it the source of truth
  useEffect(() => {
    console.log("Redux mappings changed:", mappings);
    
    // Update local template state with the Redux mappings
    setCurrentTemplate(prev => {
      const newTemplate = {
        ...prev,
        mappings: [...mappings], // Create a copy to ensure proper reference change
        lastModified: Date.now()
      };
      console.log("Updated template with Redux mappings:", newTemplate);
      return newTemplate;
    });
    
    // Template is considered dirty whenever mappings change
    if (mappings.length > 0) {
      setTemplateDirty(true);
    }
  }, [mappings]); // Only trigger on Redux mappings changes
  
  // 🔧 SYSTEMATIC FIX: Auto-migrate legacy mappings when component loads or tool changes
  useEffect(() => {
    if (!toolConfig || !mappings || mappings.length === 0) return;
    
    console.log('🔄 Checking for legacy mappings that need migration...');
    
    // Check if any mappings are using display names instead of field IDs
    const validation = validateFieldMappingConsistency(mappings, toolConfig);
    
    if (!validation.isConsistent) {
      console.log('🔄 Legacy mappings detected - auto-migrating to field IDs');
      console.log('Issues found:', validation.issues);
      
      // Migrate all mappings to use field IDs
      const migratedMappings = migrateFieldMappings(mappings, toolConfig);
      
      // Only update if mappings actually changed
      const mappingsChanged = JSON.stringify(mappings) !== JSON.stringify(migratedMappings);
      if (mappingsChanged) {
        console.log('✅ Auto-migration complete - updating mappings');
        dispatch(setMappings(migratedMappings));
      }
    } else {
      console.log('✅ All mappings already use field IDs - no migration needed');
    }
  }, [toolConfig, mappings?.length]); // Run when tool changes or mappings array length changes
  
  // Validate mappings whenever they change
  useEffect(() => {
    validateMappings();
  }, [mappings, toolConfig]);
  
  // FIXED: Handle mapping updates - Always use Redux state as source of truth
  const handleMappingChange = (mapping: FieldMapping) => {
    console.log("handleMappingChange called with:", mapping);
    
    try {
      // Always start with the current Redux state
      const newMappings = [...mappings];
      const existingIndex = newMappings.findIndex(m => m.targetField === mapping.targetField);
      
      if (existingIndex >= 0) {
        console.log(`Updating existing mapping for ${mapping.targetField}`);
        newMappings[existingIndex] = mapping;
      } else {
        console.log(`Adding new mapping for ${mapping.targetField}`);
        newMappings.push(mapping);
      }
      
      // Update Redux state - this will trigger the useEffect to update the local state
      dispatch(setMappings(newMappings));
      
      // Provide user feedback
      console.log("Mapping updated successfully:", mapping);
      
      // Show success message to user
      setStatusMessage({
        message: `Mapped ${mapping.sourceField} to ${mapping.targetField}`,
        severity: 'success',
        open: true
      });
    } catch (error) {
      console.error("Error updating mapping:", error);
    }
  };
  
  // FIXED: Handle mapping removal - Always use Redux state as source of truth
  const handleRemoveMapping = (targetField: string) => {
    console.log("handleRemoveMapping called for:", targetField);
    
    try {
      // Always start with the current Redux state
      const newMappings = mappings.filter(m => m.targetField !== targetField);
      
      // Update Redux state - this will trigger the useEffect to update the local state
      dispatch(setMappings(newMappings));
      
      console.log(`Mapping for ${targetField} removed successfully`);
    } catch (error) {
      console.error("Error removing mapping:", error);
    }
  };
  
  // Run validation on current mappings
  const validateMappings = () => {
    if (!toolConfig) return;
    
    // 🔍 FIELD MAPPING AUDIT - Comprehensive logging for systematic fix
    console.log('🔍 FIELD MAPPING AUDIT - Current State Analysis:');
    console.log('==========================================');
    
    console.log('📋 Tool Configuration:');
    console.log('  Required Fields:', toolConfig.requiredFields.map(f => ({ id: f.id, name: f.name })));
    console.log('  Optional Fields:', toolConfig.optionalFields.map(f => ({ id: f.id, name: f.name })));
    
    console.log('🗺️ Current Mappings:');
    console.log('  Mappings Array:', mappings.map(m => ({ source: m.sourceField, target: m.targetField })));
    
    // Analyze if current mappings use display names vs field IDs
    const allFields = [...toolConfig.requiredFields, ...toolConfig.optionalFields];
    const mappingAnalysis = mappings.map(mapping => {
      const matchesFieldId = allFields.find(f => f.id === mapping.targetField);
      const matchesDisplayName = allFields.find(f => f.name === mapping.targetField);
      
      return {
        source: mapping.sourceField,
        target: mapping.targetField,
        isFieldId: !!matchesFieldId,
        isDisplayName: !!matchesDisplayName,
        shouldBeFieldId: matchesDisplayName ? matchesDisplayName.id : mapping.targetField
      };
    });
    
    console.log('🔍 Mapping Analysis:');
    mappingAnalysis.forEach(analysis => {
      console.log(`  "${analysis.source}" → "${analysis.target}"`);
      console.log(`    - Is Field ID: ${analysis.isFieldId}`);
      console.log(`    - Is Display Name: ${analysis.isDisplayName}`);
      if (analysis.isDisplayName && !analysis.isFieldId) {
        console.log(`    - ⚠️ PROBLEM: Should be "${analysis.shouldBeFieldId}" instead`);
      }
    });
    
    // Check for the specific "Call Received Date/Time" issue
    const problematicMapping = mappings.find(m => m.targetField === 'Call Received Date/Time');
    if (problematicMapping) {
      console.log('🚨 SPECIFIC ISSUE DETECTED:');
      console.log(`  Mapping: "${problematicMapping.sourceField}" → "${problematicMapping.targetField}"`);
      console.log(`  Should be: "${problematicMapping.sourceField}" → "incident_time"`);
    }
    
    console.log('==========================================');
    
    const errors: {
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }[] = [];
    
    // Check required fields - SYSTEMATIC FIX: Use field IDs with legacy support
    toolConfig.requiredFields.forEach(field => {
      // 🔧 CRITICAL FIX: Check for mapping by field ID first, then legacy display name
      const mappingById = mappings.find(m => m.targetField === field.id);
      const mappingByName = mappings.find(m => m.targetField === field.name);
      
      console.log(`Checking required field ${field.id} (display: ${field.name})`);
      console.log(`  - Mapping by ID: ${mappingById ? `"${mappingById.sourceField}" → ${mappingById.targetField}` : 'none'}`);
      console.log(`  - Mapping by Name: ${mappingByName ? `"${mappingByName.sourceField}" → ${mappingByName.targetField}` : 'none'}`);
      
      if (mappingById) {
        // Correct mapping found using field ID
        console.log(`  ✅ Correct mapping found for ${field.id}`);
      } else if (mappingByName) {
        // Legacy mapping found using display name - auto-migrate
        console.log(`  🔄 Legacy mapping detected for ${field.id} - migrating from display name to field ID`);
        
        // Update the mapping to use field ID instead of display name
        const mappingIndex = mappings.findIndex(m => m.targetField === field.name);
        if (mappingIndex >= 0) {
          const updatedMappings = [...mappings];
          updatedMappings[mappingIndex] = {
            ...updatedMappings[mappingIndex],
            targetField: field.id
          };
          
          console.log(`  📋 Auto-migrated: "${field.name}" → "${field.id}"`);
          
          // Dispatch the updated mappings
          dispatch(setMappings(updatedMappings));
        }
      } else {
        // No mapping found for this required field
        console.log(`  ❌ No mapping found for required field ${field.id}`);
        errors.push({
          field: field.id, // Use field ID in error reporting
          message: `Required field ${field.name} is not mapped`,
          severity: 'error'
        });
      }
    });
    
    // Add more validation as needed
    
    setValidationErrors(errors);
  };
  
  // Run auto-mapping
  const handleAutoMap = async () => {
    console.log('🔥🔥🔥 AUTO MAP BUTTON CLICKED - DEBUG START');
    console.log('🔥 sourceColumns available:', !!sourceColumns, 'length:', sourceColumns?.length);
    console.log('🔥 toolConfig available:', !!toolConfig, 'id:', toolConfig?.id);
    
    if (!sourceColumns || !toolConfig) {
      console.log('🚨 AUTO MAP BLOCKED: Missing sourceColumns or toolConfig');
      console.log('  - sourceColumns:', sourceColumns);
      console.log('  - toolConfig:', toolConfig);
      return;
    }
    
    console.log('✅ AUTO MAP PROCEEDING: All conditions met');
    setAutoMappingInProgress(true);
    
    try {
      console.log('🔧 AUTO-MAPPING - Starting with systematic fix approach');
      
      // Migrate existing mappings to use field IDs
      const migratedExistingMappings = migrateFieldMappings(currentTemplate.mappings, toolConfig);
      const newMappings: FieldMapping[] = [...migratedExistingMappings];
      
      // Helper function to find if a field is already mapped (using field IDs)
      const isFieldMapped = (fieldId: string) => 
        newMappings.some(m => m.targetField === fieldId);
      
      // Helper to get normalized field name (lowercase, no spaces)
      const normalizeFieldName = (name: string) => 
        name.toLowerCase().replace(/[\s_-]/g, '');
      
      // Get all target fields
      const allTargetFields = [
        ...toolConfig.requiredFields,
        ...toolConfig.optionalFields
      ];
      
      console.log('🔧 AUTO-MAPPING - Available target fields:', allTargetFields.map(f => ({ id: f.id, name: f.name })));
      console.log('🔧 AUTO-MAPPING - Source columns:', sourceColumns);
      console.log('🔧 AUTO-MAPPING - Tool config details:', {
        toolId: toolConfig.id,
        requiredCount: toolConfig.requiredFields.length,
        optionalCount: toolConfig.optionalFields.length,
        totalFields: allTargetFields.length,
        optionalFieldsList: toolConfig.optionalFields.map(f => f.id)
      });

      // 🕐 PHASE 1: SMART DATETIME HANDLER - Auto-detect and handle split vs combined datetime patterns
      console.log('\n🕐 === SMART DATETIME DETECTION: Phase 1 Implementation ===');
      const dateTimeDetection = detectDateTimePattern(sourceColumns, sampleData || []);
      
      console.log('🕐 Detection result:', {
        type: dateTimeDetection.pattern.type,
        confidence: dateTimeDetection.pattern.confidence,
        description: dateTimeDetection.pattern.description
      });

      // Apply smart datetime mappings if confidence is high enough
      if (dateTimeDetection.pattern.confidence > 0.5) {
        console.log('✅ High confidence datetime pattern detected - applying smart mappings');
        
        dateTimeDetection.suggestedMappings.forEach(suggestion => {
          // Check if target field exists in our tool config
          const targetExists = allTargetFields.some(f => f.id === suggestion.targetField);
          if (!targetExists) {
            console.log(`⚠️ Skipping suggestion for ${suggestion.targetField} - not in tool config`);
            return;
          }

          // Check if target field is already mapped
          if (isFieldMapped(suggestion.targetField)) {
            console.log(`🔄 Target ${suggestion.targetField} already mapped - skipping automatic datetime mapping`);
            return;
          }

          // For combination transformations, we'll use the first source field as primary
          // and add transformation metadata to handle the combination
          const primarySourceField = suggestion.sourceFields[0];
          
          if (suggestion.transformationType === 'combine') {
            console.log(`🕐 DATETIME COMBINE: Adding mapping "${primarySourceField}" → "${suggestion.targetField}" (will combine with ${suggestion.sourceFields.join(' + ')})`);
            newMappings.push({
              sourceField: primarySourceField,
              targetField: suggestion.targetField,
              transformations: [{
                type: 'datetime_combine',
                params: {
                  sourceFields: suggestion.sourceFields,
                  description: suggestion.description
                }
              }]
            });
          } else if (suggestion.transformationType === 'extract') {
            console.log(`🕐 DATETIME EXTRACT: Adding mapping "${primarySourceField}" → "${suggestion.targetField}" (will extract date/time component)`);
            newMappings.push({
              sourceField: primarySourceField,
              targetField: suggestion.targetField,
              transformations: [{
                type: 'datetime_extract',
                params: {
                  extractType: suggestion.targetField.includes('date') ? 'date' : 'time',
                  description: suggestion.description
                }
              }]
            });
          } else {
            console.log(`🕐 DATETIME DIRECT: Adding direct mapping "${primarySourceField}" → "${suggestion.targetField}"`);
            newMappings.push({
              sourceField: primarySourceField,
              targetField: suggestion.targetField
            });
          }
        });
        
        console.log('🕐 Smart datetime mappings applied:', newMappings.filter(m => 
          m.transformations?.some(t => t.type.startsWith('datetime_'))
        ).length);
      } else {
        console.log('⚠️ Low confidence datetime pattern - proceeding with standard auto-mapping');
      }
      
      console.log('🕐 === DATETIME DETECTION COMPLETE - Proceeding with standard field mapping ===\n');
      
      allTargetFields.forEach(targetField => {
        console.log(`\n🎯 === DEBUGGING TARGET FIELD: ${targetField.id} (display: "${targetField.name}") ===`);
        console.log(`🎯 Target field info:`, { id: targetField.id, name: targetField.name, dataType: targetField.dataType });
        
        // 🔧 DUAL MAPPING FIX: Don't skip if target field is already mapped - allow dual mapping
        // where same source field can map to multiple target fields (e.g., incident_date → both incident_date AND incident_time)
        if (isFieldMapped(targetField.id)) {
          console.log(`🔄 Target field ${targetField.id} already mapped - checking for dual mapping opportunity`);
        }
        
        console.log(`🔍 Available source columns for matching:`, sourceColumns);
        console.log(`🔍 Attempting to map target field: ${targetField.id} (display: ${targetField.name})`);
        
        // Try exact match with display name first (most common case)
        console.log(`🔍 STEP 1: Trying exact match with display name "${targetField.name}"`);
        const exactMatch = sourceColumns.find(
          sourceField => sourceField.toLowerCase() === targetField.name.toLowerCase()
        );
        console.log(`🔍 Exact match result:`, exactMatch ? `FOUND: "${exactMatch}"` : 'NOT FOUND');
        
        if (exactMatch) {
          // 🔧 DUAL MAPPING: Check if this exact mapping already exists to avoid duplicates
          const existingMapping = newMappings.find(m => 
            m.sourceField === exactMatch && m.targetField === targetField.id
          );
          
          if (!existingMapping) {
            console.log(`✅ EXACT MATCH SUCCESS: "${exactMatch}" → ${targetField.id}`);
            newMappings.push({
              sourceField: exactMatch,
              targetField: targetField.id  // 🔧 CRITICAL FIX: Use field ID, not display name
            });
          } else {
            console.log(`🔄 Dual mapping already exists: "${exactMatch}" → ${targetField.id}`);
          }
          console.log(`🎯 === COMPLETED TARGET FIELD: ${targetField.id} (exact match) ===\n`);
          return;
        }
        
        // Try normalized match with display name (e.g., 'call received date/time' matches 'Call Received Date/Time')
        console.log(`🔍 STEP 2: Trying normalized match with display name`);
        const normalizedTargetName = normalizeFieldName(targetField.name);
        console.log(`🔍 Normalized target name: "${targetField.name}" → "${normalizedTargetName}"`);
        
        const normalizedMatch = sourceColumns.find(
          sourceField => {
            const normalizedSource = normalizeFieldName(sourceField);
            console.log(`🔍   Testing source "${sourceField}" → "${normalizedSource}" against "${normalizedTargetName}"`);
            return normalizedSource === normalizedTargetName;
          }
        );
        console.log(`🔍 Normalized match result:`, normalizedMatch ? `FOUND: "${normalizedMatch}"` : 'NOT FOUND');
        
        if (normalizedMatch) {
          // 🔧 DUAL MAPPING: Check if this exact mapping already exists to avoid duplicates
          const existingMapping = newMappings.find(m => 
            m.sourceField === normalizedMatch && m.targetField === targetField.id
          );
          
          if (!existingMapping) {
            console.log(`✅ NORMALIZED MATCH SUCCESS: "${normalizedMatch}" → ${targetField.id}`);
            newMappings.push({
              sourceField: normalizedMatch,
              targetField: targetField.id  // 🔧 CRITICAL FIX: Use field ID, not display name
            });
          } else {
            console.log(`🔄 Dual mapping already exists: "${normalizedMatch}" → ${targetField.id}`);
          }
          console.log(`🎯 === COMPLETED TARGET FIELD: ${targetField.id} (normalized match) ===\n`);
          return;
        }
        
        // Try normalized match with field ID (e.g., 'incident_time' matches 'incidenttime')
        console.log(`🔍 STEP 3: Trying normalized match with field ID`);
        const normalizedFieldId = normalizeFieldName(targetField.id);
        console.log(`🔍 Normalized field ID: "${targetField.id}" → "${normalizedFieldId}"`);
        
        const fieldIdMatch = sourceColumns.find(
          sourceField => {
            const normalizedSource = normalizeFieldName(sourceField);
            console.log(`🔍   Testing source "${sourceField}" → "${normalizedSource}" against "${normalizedFieldId}"`);
            return normalizedSource === normalizedFieldId;
          }
        );
        console.log(`🔍 Field ID match result:`, fieldIdMatch ? `FOUND: "${fieldIdMatch}"` : 'NOT FOUND');
        
        if (fieldIdMatch) {
          // 🔧 DUAL MAPPING: Check if this exact mapping already exists to avoid duplicates
          const existingMapping = newMappings.find(m => 
            m.sourceField === fieldIdMatch && m.targetField === targetField.id
          );
          
          if (!existingMapping) {
            console.log(`✅ FIELD ID MATCH SUCCESS: "${fieldIdMatch}" → ${targetField.id}`);
            newMappings.push({
              sourceField: fieldIdMatch,
              targetField: targetField.id  // 🔧 CRITICAL FIX: Use field ID, not display name
            });
          } else {
            console.log(`🔄 Dual mapping already exists: "${fieldIdMatch}" → ${targetField.id}`);
          }
          console.log(`🎯 === COMPLETED TARGET FIELD: ${targetField.id} (field ID match) ===\n`);
          return;
        }
        
        // Try field name variation matching (common mismatches)
        console.log(`🔍 STEP 4: Trying field variation matching`);
        const fieldVariations = getFieldVariations(targetField.id);
        console.log(`🔍 Field variations for ${targetField.id}:`, fieldVariations);
        
        let variationMatch: string | undefined = undefined;
        
        for (const variation of fieldVariations) {
          console.log(`🔍   Testing variation: "${variation}"`);
          variationMatch = sourceColumns.find(
            sourceField => {
              const normalizedSource = normalizeFieldName(sourceField);
              const normalizedVariation = normalizeFieldName(variation);
              console.log(`🔍     Source "${sourceField}" → "${normalizedSource}" vs variation "${normalizedVariation}"`);
              return normalizedSource === normalizedVariation;
            }
          );
          if (variationMatch) {
            console.log(`🔍   VARIATION MATCH FOUND: "${variationMatch}" via variation "${variation}"`);
            // 🔧 DUAL MAPPING: Check if this exact mapping already exists to avoid duplicates
            const existingMapping = newMappings.find(m => 
              m.sourceField === variationMatch && m.targetField === targetField.id
            );
            
            if (!existingMapping) {
              console.log(`✅ FIELD VARIATION SUCCESS: "${variationMatch}" → ${targetField.id} (via variation "${variation}")`);
              newMappings.push({
                sourceField: variationMatch,
                targetField: targetField.id
              });
            } else {
              console.log(`🔄 Dual mapping already exists: "${variationMatch}" → ${targetField.id}`);
            }
            console.log(`🎯 === COMPLETED TARGET FIELD: ${targetField.id} (variation match) ===\n`);
            return;
          }
        }
        console.log(`🔍 No variation matches found for ${targetField.id}`);
        
        console.log(`❌ NO MATCH FOUND for target field: ${targetField.id}`);
        console.log(`🎯 === COMPLETED TARGET FIELD: ${targetField.id} (no match) ===\n`);
        
        // Try fuzzy match with display name
        const normalizedSourceFields = sourceColumns.map(normalizeFieldName);
        const partialMatchIndex = normalizedSourceFields.findIndex(
          sourceField => sourceField.includes(normalizedTargetName) || 
                         normalizedTargetName.includes(sourceField)
        );
        
        if (partialMatchIndex >= 0) {
          console.log(`✅ Partial match found: "${sourceColumns[partialMatchIndex]}" → ${targetField.id}`);
          newMappings.push({
            sourceField: sourceColumns[partialMatchIndex],
            targetField: targetField.id  // 🔧 CRITICAL FIX: Use field ID, not display name
          });
          return;
        }
        
        // 🏠 SMART ADDRESS PARSING: If no direct match found, check for address parsing opportunities
        if ((targetField.id === 'city' || targetField.id === 'state') && !isFieldMapped(targetField.id)) {
          const addressMatch = sourceColumns.find(sourceField => 
            normalizeFieldName(sourceField).includes('address') ||
            normalizeFieldName(sourceField).includes('location') ||
            normalizeFieldName(sourceField).includes('addr')
          );
          
          if (addressMatch && sampleData && sampleData.length > 0) {
            const sampleAddress = sampleData[0][addressMatch];
            if (typeof sampleAddress === 'string' && sampleAddress.trim()) {
              const parsedAddress = parseUSAddress(sampleAddress);
              
              if (targetField.id === 'city' && parsedAddress.city) {
                console.log(`🏠 Smart address parsing: Extracting city "${parsedAddress.city}" from "${addressMatch}"`);
                newMappings.push({
                  sourceField: addressMatch,
                  targetField: targetField.id,
                  transformations: [{
                    type: 'extract',
                    params: {
                      pattern: '\\s+([A-Za-z\\s]+)\\s+[A-Z]{2}\\s*$',
                      description: `Extract city from full address`
                    }
                  }]
                });
                return;
              }
              
              if (targetField.id === 'state' && parsedAddress.state) {
                console.log(`🏠 Smart address parsing: Extracting state "${parsedAddress.state}" from "${addressMatch}"`);
                newMappings.push({
                  sourceField: addressMatch,
                  targetField: targetField.id,
                  transformations: [{
                    type: 'extract',
                    params: {
                      pattern: '\\s+([A-Z]{2})\\s*$',
                      description: `Extract state from full address`
                    }
                  }]
                });
                return;
              }
            }
          }
        }
        
        // 🌍 SMART COORDINATE PARSING: If no direct match found, check for POINT coordinate parsing opportunities
        console.log(`🌍 COORDINATE PARSING ENTRY: Checking if ${targetField.id} is longitude/latitude`, targetField.id === 'longitude' || targetField.id === 'latitude');
        if (targetField.id === 'longitude' || targetField.id === 'latitude') {
          console.log(`🌍 COORDINATE PARSING DEBUG: Evaluating ${targetField.id} field`);
          console.log(`🌍 COORDINATE PARSING DEBUG: Field already mapped?`, isFieldMapped(targetField.id));
          console.log(`🌍 COORDINATE PARSING DEBUG: Current mappings:`, newMappings.filter(m => m.targetField === targetField.id));
          
          if (!isFieldMapped(targetField.id)) {
            console.log(`🌍 COORDINATE PARSING DEBUG: Checking ${targetField.id} field for coordinate opportunities`);
            console.log(`🌍 COORDINATE PARSING DEBUG: Available source columns:`, sourceColumns);
            console.log(`🌍 COORDINATE PARSING DEBUG: Sample data available:`, !!sampleData && sampleData.length > 0);
            
            const coordinateMatch = sourceColumns.find(sourceField => 
              normalizeFieldName(sourceField).includes('geom') ||
              normalizeFieldName(sourceField).includes('geometry') ||
              normalizeFieldName(sourceField).includes('point') ||
              normalizeFieldName(sourceField).includes('coordinates') ||
              normalizeFieldName(sourceField).includes('coord') ||
              normalizeFieldName(sourceField).includes('location')
            );
            
            console.log(`🌍 COORDINATE PARSING DEBUG: Found coordinate field match:`, coordinateMatch);
            
            if (coordinateMatch && sampleData && sampleData.length > 0) {
              const sampleCoordinate = sampleData[0][coordinateMatch];
              console.log(`🌍 COORDINATE PARSING DEBUG: Sample coordinate value:`, sampleCoordinate);
              console.log(`🌍 COORDINATE PARSING DEBUG: Sample coordinate type:`, typeof sampleCoordinate);
              
              if (typeof sampleCoordinate === 'string' && sampleCoordinate.trim()) {
                console.log(`🌍 COORDINATE PARSING DEBUG: Attempting to parse POINT coordinates from:`, sampleCoordinate.trim());
                const parsedCoordinates = parsePOINTCoordinates(sampleCoordinate);
                console.log(`🌍 COORDINATE PARSING DEBUG: Parsed result:`, parsedCoordinates);
                
                if (targetField.id === 'longitude' && parsedCoordinates.longitude !== null) {
                  console.log(`🌍 Smart coordinate parsing: Extracting longitude "${parsedCoordinates.longitude}" from "${coordinateMatch}"`);
                  newMappings.push({
                    sourceField: coordinateMatch,
                    targetField: targetField.id,
                    transformations: [{
                      type: 'parseCoordinates',
                      params: {
                        format: 'point',
                        component: 'longitude',
                        description: `Extract longitude from POINT coordinate data`
                      }
                    }]
                  });
                  console.log(`🌍 SUCCESS: Added longitude mapping for ${coordinateMatch} → ${targetField.id}`);
                  return;
                }
                
                if (targetField.id === 'latitude' && parsedCoordinates.latitude !== null) {
                  console.log(`🌍 Smart coordinate parsing: Extracting latitude "${parsedCoordinates.latitude}" from "${coordinateMatch}"`);
                  newMappings.push({
                    sourceField: coordinateMatch,
                    targetField: targetField.id,
                    transformations: [{
                      type: 'parseCoordinates',
                      params: {
                        format: 'point',
                        component: 'latitude',
                        description: `Extract latitude from POINT coordinate data`
                      }
                    }]
                  });
                  console.log(`🌍 SUCCESS: Added latitude mapping for ${coordinateMatch} → ${targetField.id}`);
                  return;
                }
                
                console.log(`🌍 COORDINATE PARSING DEBUG: No valid coordinates extracted for ${targetField.id}`);
              } else {
                console.log(`🌍 COORDINATE PARSING DEBUG: Sample coordinate is not a valid string:`, sampleCoordinate);
              }
            } else {
              console.log(`🌍 COORDINATE PARSING DEBUG: No coordinate match or sample data unavailable`);
            }
          } else {
            console.log(`🌍 COORDINATE PARSING DEBUG: ${targetField.id} field already mapped - skipping coordinate parsing`);
          }
        }
        
        console.log(`❌ No match found for target field: ${targetField.id}`);
      });
      
      console.log('🔧 AUTO-MAPPING - Final mappings:', newMappings.map(m => ({ source: m.sourceField, target: m.targetField })));
      
      // Validate the new mappings for consistency
      const validation = validateFieldMappingConsistency(newMappings, toolConfig);
      if (!validation.isConsistent) {
        console.warn('⚠️ AUTO-MAPPING - Consistency issues detected:', validation.issues);
      }
      
      // Update mappings
      dispatch(setMappings(newMappings));
      
      // Auto-save template if significant mappings were created
      if (newMappings.length >= 3 && selectedTool?.id) {
        console.log('🔧 AUTO-SAVING TEMPLATE: Significant mappings detected');
        autoSaveTemplate(newMappings, selectedTool.id);
        cleanupAutoSaved(); // Clean up old auto-saved templates
      }
      
      // Find similar templates for suggestions
      if (selectedTool?.id) {
        const similar = findSimilarTemplates(newMappings, selectedTool.id);
        setSuggestedTemplates(similar.slice(0, 3)); // Show top 3 suggestions
        console.log('🔧 TEMPLATE SUGGESTIONS:', similar.length, 'similar templates found');
      }
      
    } finally {
      setAutoMappingInProgress(false);
    }
  };
  
  // Handle template save
  const handleSaveTemplate = async () => {
    try {
      await saveToServer();
      setTemplateDirty(false);
      // Show success message
    } catch (error) {
      // Handle error
      console.error('Failed to save template:', error);
    }
  };
  
  // Handle navigation to previous/next step
  const handleBack = () => {
    dispatch(setCurrentStep(0)); // Go back to file upload
  };
  
  const handleNext = () => {
    try {
      // Transform the data based on current mappings
      dispatch(setProcessingStatus('transforming'));
      
      console.log("🔧 TRANSFORMATION DEBUG: Using Redux mappings directly for transformation");
      console.log("Redux mappings:", mappings);
      console.log("currentTemplate.mappings:", currentTemplate.mappings);
      console.log("Sample data:", sampleData);

      // CRITICAL FIX: Use Redux mappings directly instead of currentTemplate.mappings
      // This ensures we always use the latest transformations including those just configured
      
      // 🔍 COMPREHENSIVE DEBUG: Log everything before transformation
      console.log("🔍 PRE-TRANSFORMATION DEBUG:");
      console.log("  Sample data keys:", sampleData.length > 0 ? Object.keys(sampleData[0]) : []);
      console.log("  Sample data first row:", sampleData[0]);
      console.log("  Mappings to apply:", mappings);
      console.log("  Mappings breakdown:");
      mappings.forEach((mapping, index) => {
        const sampleValue = sampleData[0]?.[mapping.sourceField];
        console.log(`    ${index + 1}. "${mapping.sourceField}" → "${mapping.targetField}" | Sample: "${sampleValue}"`);
      });
      
      const transformed = transformData(sampleData, mappings);
      
      console.log("✅ Transformed data with latest mappings:", transformed);
      console.log("🔍 POST-TRANSFORMATION DEBUG:");
      if (transformed.length > 0) {
        console.log("  Transformed data keys:", Object.keys(transformed[0]));
        console.log("  Transformed data first row:", transformed[0]);
        
        // Check specific fields that are problematic
        console.log("  Specific field checks:");
        console.log(`    incident_time: "${transformed[0].incident_time}"`);
        console.log(`    incident_date: "${transformed[0].incident_date}"`);
        console.log(`    incident_id: "${transformed[0].incident_id}"`);
      }
      
      // Update the Redux store with transformed data
      dispatch(setTransformedData(transformed));
      
      // Proceed to the next step
      dispatch(setProcessingStatus('mapping'));
      dispatch(setCurrentStep(2)); // Go to preview & validate
    } catch (error) {
      console.error("Error transforming data:", error);
      dispatch(setProcessingStatus('error'));
      
      setStatusMessage({
        message: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        open: true
      });
    }
  };
  
  // Check if we can proceed (all required fields mapped)
  const canProceed = useMemo(() => {
    // Re-compute this whenever validationErrors or mappings change
    console.log("Checking if can proceed with validationErrors:", validationErrors);
    console.log("Current mappings:", mappings);
    
    // Check if all required fields have been mapped
    if (toolConfig) {
      const unmappedRequiredFields = toolConfig.requiredFields.filter(
        field => !mappings.some(mapping => mapping.targetField === field.id) // 🔧 CRITICAL FIX: Use field.id instead of field.name
      );
      console.log("Unmapped required fields:", unmappedRequiredFields);
      return unmappedRequiredFields.length === 0;
    }
    
    return validationErrors.every(error => error.severity !== 'error');
  }, [validationErrors, mappings, toolConfig]);
  
  // We no longer need the dnd-kit drag end handler as we're using HTML5 drag/drop
  
  // Handle manual drag and drop (HTML5 native)
  const handleManualDragDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    // Get the source field ID from the dragged element
    const sourceField = event.dataTransfer.getData('text/plain');
    if (!sourceField) {
      setStatusMessage({
        message: 'Drag and drop error: No source field data found',
        severity: 'error',
        open: true
      });
      return;
    }
    
    // Get the target field from the drop target
    const targetElement = event.target as HTMLElement;
    const targetField = targetElement.closest('[data-target-field]')?.getAttribute('data-target-field');
    
    if (!targetField) {
      setStatusMessage({
        message: 'Drag and drop error: No target field found. Try dropping directly on a target field.',
        severity: 'warning',
        open: true
      });
      return;
    }
    
    // Update the mapping
    handleMappingChange({
      sourceField,
      targetField
    });
    
    setStatusMessage({
      message: `Mapped ${sourceField} to ${targetField}`,
      severity: 'success',
      open: true
    });
  };
  
  // If we have no source columns or tool config, show error/loading state
  if (!sourceColumns.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          No source columns available. Please upload a file first.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back to Upload
        </Button>
      </Box>
    );
  }
  
  if (!toolConfig) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          No tool selected. Please select a tool first.
        </Alert>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back to Upload
        </Button>
      </Box>
    );
  }
  
  if (processingStatus === 'uploading') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Processing file data...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Map Fields for {toolConfig.name}</Typography>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSaveTemplate}
            disabled={!templateDirty}
          >
            Save Template
          </Button>
          
          <TemplateManager
            currentTemplate={currentTemplate}
            setCurrentTemplate={(template) => {
              setCurrentTemplate(template);
              // Apply template mappings to Redux state
              if (template.mappings && template.mappings.length > 0) {
                dispatch(setMappings(template.mappings));
                setStatusMessage({
                  message: `Applied template "${template.name}" with ${template.mappings.length} field mappings`,
                  severity: 'success',
                  open: true
                });
              }
            }}
            setTemplateDirty={setTemplateDirty}
            disabled={!selectedTool || sourceColumns.length === 0}
            // New template service integration props
            currentMappings={mappings}
            sourceFields={sourceColumns}
            sampleData={sampleData}
            targetTool={selectedTool?.id || ''}
            onApplyFieldMappings={(fieldMappings) => {
              // Apply FieldMapping[] from TemplateService
              dispatch(setMappings(fieldMappings));
              setStatusMessage({
                message: `Applied template with ${fieldMappings.length} field mappings`,
                severity: 'success',
                open: true
              });
            }}
          />
        </Stack>
      </Box>
      
      {/* Template Suggestions */}
      {suggestedTemplates.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Smart Template Suggestions
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Found {suggestedTemplates.length} template{suggestedTemplates.length !== 1 ? 's' : ''} with similar field patterns:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestedTemplates.map(template => (
              <Button
                key={template.id}
                variant="outlined"
                size="small"
                onClick={() => {
                  setCurrentTemplate(template);
                  dispatch(setMappings(template.mappings));
                  setTemplateDirty(false);
                  setSuggestedTemplates([]); // Clear suggestions after applying
                  setStatusMessage({
                    message: `Applied suggested template "${template.name}"`,
                    severity: 'success',
                    open: true
                  });
                }}
                sx={{ textTransform: 'none' }}
              >
                {template.name}
                <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  ({template.mappings.length} mappings)
                </Typography>
              </Button>
            ))}
          </Box>
        </Alert>
      )}
      
      {/* Template Statistics */}
      {templateStats.total > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📁 You have {templateStats.total} saved template{templateStats.total !== 1 ? 's' : ''} 
            ({templateStats.totalMappings} total field mappings). 
            {templateStats.byTool[selectedTool?.id || ''] && (
              <strong>{templateStats.byTool[selectedTool?.id || '']} template{templateStats.byTool[selectedTool?.id || ''] !== 1 ? 's' : ''} for {selectedTool?.name}</strong>
            )}
          </Typography>
        </Alert>
      )}
      
      <Box sx={{
        display: 'flex',
        gap: 2,
        height: '700px',
        minHeight: '700px',
        border: '1px solid #eaeaea',
        borderRadius: '4px',
        padding: '4px'
      }}>
        {/* Left side: Source fields with independent scroll */}
        <Box sx={{
          width: '35%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRight: '1px solid #eaeaea',
          paddingRight: '8px'
        }}>
          <Typography
            variant="h6"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#fff',
              paddingBottom: '8px',
              borderBottom: '2px solid #1976d2',
              marginBottom: '8px',
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Source Fields Panel ↕️ (Scrollable)
          </Typography>
          <SourceFieldsList
            sourceColumns={sourceColumns}
            filter={sourceFilter}
            setFilter={setSourceFilter}
            mappings={mappings}
            sampleData={sampleData}
            onAddParsedFields={(columnName, parsedFields) => {
              console.log('🤖 PARENT: Received parsed fields for column:', columnName, parsedFields);
              
              // Update parent sampleData with parsed field data
              if (sampleData && sampleData.length > 0 && parsedFields.length > 0) {
                const updatedSampleData = sampleData.map((row, index) => {
                  const newRow = { ...row };
                  
                  // Add parsed field data to this row
                  parsedFields.forEach(parsedField => {
                    if (parsedField.data[index] !== null) {
                      // Extract fieldId from parsedField.id (format: "ColumnName_fieldId")
                      const fieldId = parsedField.id.split('_').slice(1).join('_');
                      // Add parsed value with special key format that data transformer will recognize
                      const parsedFieldKey = `${columnName}_parsed_${fieldId}`;
                      newRow[parsedFieldKey] = parsedField.data[index];
                      console.log(`🤖 PARENT: Injecting parsed data: ${parsedFieldKey} = "${parsedField.data[index]}"`);
                    }
                  });
                  
                  return newRow;
                });
                
                // Update the sample data in Redux state so the data transformer can access it
                console.log('🤖 PARENT: Updating Redux sampleData with parsed fields');
                dispatch(setSampleData(updatedSampleData));
                
                setStatusMessage({
                  message: `Added ${parsedFields.length} parsed fields for ${columnName}`,
                  severity: 'success',
                  open: true
                });
              }
            }}
          />
        </Box>

        {/* Right side: Target fields and validation with independent scroll */}
        <Box
          sx={{
            width: '65%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
          onDragOver={(e) => {
            // Only prevent default if no child element is handling this
            if (e.target === e.currentTarget) {
              e.preventDefault();
              console.log("Parent container dragOver");
            }
          }}
          onDrop={(e) => {
            // Only handle drop if no child element has handled it
            if (e.target === e.currentTarget) {
              e.preventDefault();
              handleManualDragDrop(e);
              console.log("Parent container drop");
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#fff',
              paddingBottom: '8px',
              borderBottom: '2px solid #1976d2',
              marginBottom: '8px',
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Target Fields Panel ↕️ (Scrollable)
          </Typography>
          <TargetFieldsPanel
            toolConfig={toolConfig}
            showAllFields={showAllFields}
            setShowAllFields={setShowAllFields}
            filter={targetFilter}
            setFilter={setTargetFilter}
            mappings={mappings}
            onMappingChange={handleMappingChange}
            onRemoveMapping={handleRemoveMapping}
            validationErrors={validationErrors}
            sampleData={sampleData}
            sourceColumns={sourceColumns}
          />

          {validationErrors.length > 0 && (
            <Box sx={{
              flexShrink: 0,
              marginTop: 'auto',
              borderTop: '1px solid #eaeaea',
              paddingTop: '8px'
            }}>
              <ValidationPanel
                validationErrors={validationErrors}
                jumpToField={(field) => {
                  // Logic to scroll to the specified field
                  const element = document.getElementById(`target-field-${field}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-field');
                    setTimeout(() => {
                      element.classList.remove('highlight-field');
                    }, 2000);
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Live preview at the bottom */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <LivePreviewStrip
          sampleData={sampleData}
          mappings={mappings}
          toolConfig={toolConfig}
        />
      </Paper>
      
      {/* Bottom action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Box>
          {console.log('🎯 AUTO MAP BUTTON RENDER STATE:', {
            autoMappingInProgress,
            sourceColumnsLength: sourceColumns?.length,
            buttonDisabled: autoMappingInProgress || !sourceColumns.length,
            sourceColumns: sourceColumns
          })}
          <Button
            variant="outlined"
            onClick={(e) => {
              console.log('🚨🚨🚨 AUTO MAP BUTTON CLICKED!!! 🚨🚨🚨');
              console.log('🔥 BUTTON CLICK DETECTED - Raw event:', e);
              console.log('🔥 Button disabled state:', autoMappingInProgress || !sourceColumns.length);
              console.log('🔥 autoMappingInProgress:', autoMappingInProgress);
              console.log('🔥 sourceColumns.length:', sourceColumns.length);
              console.log('🚨 ABOUT TO CALL handleAutoMap() - DEBUG MARKER');
              handleAutoMap();
              console.log('🚨 CALLED handleAutoMap() - DEBUG MARKER');
            }}
            disabled={autoMappingInProgress || !sourceColumns.length}
            sx={{ mr: 1 }}
          >
            {autoMappingInProgress ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Auto-mapping...
              </>
            ) : (
              'Auto-Map Fields'
            )}
          </Button>
          
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={handleNext}
            disabled={!canProceed}
          >
            Continue
          </Button>
        </Box>
      </Box>
      
      {/* Status message snackbar */}
      <Snackbar
        open={statusMessage.open}
        autoHideDuration={6000}
        onClose={() => setStatusMessage({...statusMessage, open: false})}
      >
        <Alert 
          onClose={() => setStatusMessage({...statusMessage, open: false})} 
          severity={statusMessage.severity}
        >
          {statusMessage.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FieldMappingContainer;