/**
 * FireEMS.ai Incident Logger - NFIRS Validator
 * 
 * This module provides validation functions for NFIRS data fields,
 * ensuring that entered data conforms to NFIRS standards.
 */

import NFIRS_CODES from './nfirs-codes.js';

/**
 * Validate NFIRS-related fields in an incident record
 * @param {Object} incident - The incident record to validate
 * @returns {Object} - Validation results with isValid flag and array of errors
 */
function validateNFIRSCompliance(incident) {
    const errors = [];
    const warnings = [];
    
    // Required fields for basic NFIRS module
    const requiredFields = [
        {
            field: "incident_type",
            path: "incident_type.primary",
            message: "NFIRS Incident Type is required",
            validate: (value) => value && NFIRS_CODES.incidentTypes[value]
        },
        {
            field: "property_use",
            path: "incident_type.property_use",
            message: "NFIRS Property Use is required",
            validate: (value) => value && NFIRS_CODES.propertyUse[value]
        },
        {
            field: "address",
            path: "location.address",
            message: "Address is required for NFIRS reporting",
            validate: (value) => value && value.trim() !== ""
        },
        {
            field: "city",
            path: "location.city",
            message: "City is required for NFIRS reporting",
            validate: (value) => value && value.trim() !== ""
        },
        {
            field: "state",
            path: "location.state",
            message: "State is required for NFIRS reporting",
            validate: (value) => value && value.trim() !== ""
        },
        {
            field: "zip",
            path: "location.zip",
            message: "ZIP code is required for NFIRS reporting",
            validate: (value) => value && /^\d{5}(-\d{4})?$/.test(value)
        },
        {
            field: "aid_given_received",
            path: "aid_given_received",
            message: "Aid Given or Received is required for NFIRS reporting",
            validate: (value) => value && NFIRS_CODES.aidGivenReceived[value]
        }
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
        const value = getValueByPath(incident, field.path);
        if (!field.validate(value)) {
            errors.push({
                field: field.field,
                message: field.message,
                value: value
            });
        }
    });
    
    // Check action taken - required for most incidents
    if (!incident.actions || !incident.actions.length) {
        errors.push({
            field: "actions",
            message: "At least one Action Taken is required for NFIRS reporting",
            value: null
        });
    } else {
        // Validate each action taken code
        incident.actions.forEach((action, index) => {
            if (!action.code || !NFIRS_CODES.actionTaken[action.code]) {
                errors.push({
                    field: `actions[${index}].code`,
                    message: `Action Taken code ${action.code} is not a valid NFIRS code`,
                    value: action.code
                });
            }
        });
    }
    
    // Validate fire-specific fields for fire incidents
    const isFireIncident = incident.incident_type && 
                         incident.incident_type.primary && 
                         incident.incident_type.primary >= 100 && 
                         incident.incident_type.primary <= 199;
    
    if (isFireIncident) {
        // Check fire module required fields
        if (!incident.fire_module) {
            errors.push({
                field: "fire_module",
                message: "Fire Module data is required for fire incidents",
                value: null
            });
        } else {
            // Check specific fire module fields
            const fireRequiredFields = [
                {
                    field: "area_of_origin",
                    path: "fire_module.area_of_origin",
                    message: "Area of Fire Origin is required for fire incidents",
                    validate: (value) => value && value.trim() !== ""
                },
                {
                    field: "heat_source",
                    path: "fire_module.heat_source",
                    message: "Heat Source is required for fire incidents",
                    validate: (value) => value && value.trim() !== ""
                },
                {
                    field: "item_first_ignited",
                    path: "fire_module.item_first_ignited",
                    message: "Item First Ignited is required for fire incidents",
                    validate: (value) => value && value.trim() !== ""
                },
                {
                    field: "fire_spread",
                    path: "fire_module.fire_spread",
                    message: "Fire Spread is required for fire incidents",
                    validate: (value) => value !== undefined && value !== null
                }
            ];
            
            fireRequiredFields.forEach(field => {
                const value = getValueByPath(incident, field.path);
                if (!field.validate(value)) {
                    errors.push({
                        field: field.field,
                        message: field.message,
                        value: value
                    });
                }
            });
        }
    }
    
    // For EMS incidents, validate EMS module data
    const isEMSIncident = incident.incident_type && 
                        incident.incident_type.primary && 
                        (incident.incident_type.primary >= 300 && 
                         incident.incident_type.primary <= 399);
    
    if (isEMSIncident) {
        // Check for patient info section
        if (!incident.patient_info || !incident.patient_info.details || !incident.patient_info.details.length) {
            warnings.push({
                field: "patient_info",
                message: "Patient information should be provided for EMS incidents",
                value: null
            });
        }
    }
    
    // Validate detector presence for structure fires
    const isStructureFire = incident.incident_type && 
                          incident.incident_type.primary && 
                          (incident.incident_type.primary === 111 || 
                           incident.incident_type.primary === 120 || 
                           incident.incident_type.primary === 121 || 
                           incident.incident_type.primary === 122 || 
                           incident.incident_type.primary === 123);
    
    if (isStructureFire) {
        if (!incident.detector || !NFIRS_CODES.detector[incident.detector]) {
            errors.push({
                field: "detector",
                message: "Detector Presence is required for structure fires",
                value: incident.detector
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

/**
 * Get a value from a nested object using a dot-notation path
 * @param {Object} obj - The object to search
 * @param {string} path - The dot-notation path (e.g., "incident_type.primary")
 * @returns {*} - The value at the path, or undefined if not found
 */
function getValueByPath(obj, path) {
    if (!obj || !path) return undefined;
    
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
        if (value === undefined || value === null) return undefined;
        value = value[part];
    }
    
    return value;
}

/**
 * Check if an incident record is complete for NFIRS reporting
 * @param {Object} incident - The incident record to check
 * @returns {boolean} - Whether the incident is ready for NFIRS export
 */
function isNFIRSReadyForExport(incident) {
    const validationResult = validateNFIRSCompliance(incident);
    return validationResult.isValid;
}

/**
 * Get a list of missing NFIRS-required fields for an incident
 * @param {Object} incident - The incident record to check
 * @returns {Array} - Array of field names that are missing
 */
function getMissingNFIRSFields(incident) {
    const validationResult = validateNFIRSCompliance(incident);
    return validationResult.errors.map(error => error.field);
}

/**
 * Format a string as a valid NFIRS field value (proper capitalization, etc.)
 * @param {string} value - The raw field value
 * @param {string} fieldType - The type of field (e.g., "address", "city", etc.)
 * @returns {string} - The formatted value
 */
function formatNFIRSFieldValue(value, fieldType) {
    if (!value) return '';
    
    value = value.toString().trim();
    
    switch (fieldType) {
        case 'address':
            // Convert address to uppercase for NFIRS
            return value.toUpperCase();
        
        case 'city':
            // Title case for city names
            return value.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        
        case 'state':
            // Uppercase for state abbreviations
            return value.toUpperCase();
        
        case 'zip':
            // Format ZIP code as 5 or 9 digits
            const zipMatch = value.match(/^(\d{5})(-?\d{4})?$/);
            if (zipMatch) {
                if (zipMatch[2]) {
                    // 9-digit ZIP
                    return zipMatch[1] + '-' + zipMatch[2].replace('-', '');
                } else {
                    // 5-digit ZIP
                    return zipMatch[1];
                }
            }
            return value;
        
        default:
            return value;
    }
}

/**
 * Get a display-friendly label for an NFIRS code
 * @param {string} code - The NFIRS code
 * @param {string} codeType - The type of code (e.g., "incidentTypes", "propertyUse")
 * @returns {string} - The display label or the original code if not found
 */
function getNFIRSCodeLabel(code, codeType) {
    if (!code || !codeType || !NFIRS_CODES[codeType]) {
        return code || '';
    }
    
    return NFIRS_CODES[codeType][code] || code;
}

/**
 * Get a display-friendly combined code and label
 * @param {string} code - The NFIRS code
 * @param {string} codeType - The type of code (e.g., "incidentTypes", "propertyUse")
 * @returns {string} - The formatted display string (e.g., "111 - Building fire")
 */
function formatNFIRSCodeDisplay(code, codeType) {
    if (!code) return '';
    
    const label = getNFIRSCodeLabel(code, codeType);
    
    if (label === code) {
        return code;
    } else {
        return `${code} - ${label}`;
    }
}

/**
 * Find all NFIRS codes matching a search term
 * @param {string} searchTerm - The search term to match against codes or descriptions
 * @param {string} codeType - The type of code (e.g., "incidentTypes", "propertyUse")
 * @returns {Array} - Array of matching codes with their descriptions
 */
function searchNFIRSCodes(searchTerm, codeType) {
    if (!searchTerm || !codeType || !NFIRS_CODES[codeType]) {
        return [];
    }
    
    searchTerm = searchTerm.toLowerCase();
    
    const results = [];
    const codes = NFIRS_CODES[codeType];
    
    for (const code in codes) {
        const description = codes[code];
        
        if (code.toLowerCase().includes(searchTerm) || 
            description.toLowerCase().includes(searchTerm)) {
            results.push({
                code: code,
                description: description,
                display: `${code} - ${description}`
            });
        }
    }
    
    return results;
}

export {
    validateNFIRSCompliance,
    isNFIRSReadyForExport,
    getMissingNFIRSFields,
    formatNFIRSFieldValue,
    getNFIRSCodeLabel,
    formatNFIRSCodeDisplay,
    searchNFIRSCodes
};