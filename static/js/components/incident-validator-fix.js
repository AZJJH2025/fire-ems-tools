/**
 * FireEMS.ai Incident Logger - Validator Component - Fixed Version
 * 
 * This component handles data validation for the Incident Logger.
 * (Converted from ES6 module import/export to namespace pattern)
 */

// Create namespace if it doesn't exist
window.IncidentLogger = window.IncidentLogger || {};

/**
 * Validation rules for incident data
 */
const validationRules = {
    // Basic info validation
    incident: {
        id: {
            required: true,
            pattern: /^INC-\d{8}-\d{3,4}$/,
            message: "Incident ID must be in format INC-YYYYMMDD-XXX"
        },
        timestamp: {
            required: true,
            future: false,
            message: "Incident date/time is required and cannot be in the future"
        },
        status: {
            required: true,
            values: ["draft", "active", "completed", "cancelled"],
            message: "Valid status is required"
        }
    },
    
    // Incident type validation
    incident_type: {
        primary: {
            required: true,
            message: "Primary incident type is required"
        },
        property_use: {
            required: true,
            message: "NFIRS Property Use code is required"
        }
    },
    
    // Location validation
    location: {
        address: {
            required: true,
            message: "Incident address is required"
        },
        city: {
            required: true,
            message: "City is required"
        },
        state: {
            required: true,
            message: "State is required"
        },
        zip: {
            required: true,
            pattern: /^\d{5}(-\d{4})?$/,
            message: "ZIP code must be in format 12345 or 12345-6789"
        },
        latitude: {
            pattern: /^-?\d{1,2}(\.\d{1,6})?$/,
            message: "Invalid latitude format"
        },
        longitude: {
            pattern: /^-?\d{1,3}(\.\d{1,6})?$/,
            message: "Invalid longitude format"
        }
    },
    
    // Caller validation
    caller: {
        phone: {
            pattern: /^(\+\d{1,3}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
            message: "Invalid phone number format"
        }
    },
    
    // Dispatch time validation
    dispatch: {
        time_received: {
            required: true,
            future: false,
            message: "Time received is required and cannot be in the future"
        },
        time_sequence: {
            custom: validateTimeSequence,
            message: "Times must be in chronological order"
        }
    },
    
    // Patient validation
    patient: {
        age: {
            min: 0,
            max: 120,
            message: "Age must be between 0 and 120"
        },
        vital_signs: {
            bp: {
                pattern: /^\d{2,3}\/\d{2,3}$/,
                message: "BP must be in format 120/80"
            },
            pulse: {
                min: 20,
                max: 250,
                message: "Pulse must be between 20 and 250"
            },
            respiration: {
                min: 4,
                max: 60,
                message: "Respiration must be between 4 and 60"
            },
            spo2: {
                min: 50,
                max: 100,
                message: "SpO2 must be between 50 and 100"
            },
            gcs: {
                min: 3,
                max: 15,
                message: "GCS must be between 3 and 15"
            }
        }
    },
    
    // Narrative validation
    narrative: {
        required: true,
        minLength: 20,
        message: "Narrative is required and must be at least 20 characters"
    },
    
    // Created by validation
    created_by: {
        required: true,
        message: "Report preparer name is required"
    },
    
    // NFIRS-specific validation
    aid_given_received: {
        required: true,
        message: "Aid Given or Received is required for NFIRS compliance"
    },
    
    // Actions taken validation (required for NFIRS)
    actions: {
        required: true,
        message: "At least one Action Taken is required for NFIRS compliance"
    }
};

/**
 * Validate an entire incident
 * @param {Object} incident - The incident data to validate
 * @param {boolean} checkNFIRS - Whether to perform NFIRS validation
 * @returns {Object} - Object with isValid flag and arrays of errors and warnings
 */
function validateIncident(incident, checkNFIRS = false) {
    const errors = [];
    const warnings = [];
    
    // Validate basic incident properties
    validateObject(incident, validationRules.incident, errors, "");
    
    // Validate incident type
    validateObject(incident.incident_type, validationRules.incident_type, errors, "incident_type.");
    
    // Validate location
    validateObject(incident.location, validationRules.location, errors, "location.");
    
    // Validate caller info
    validateObject(incident.caller_info, validationRules.caller, errors, "caller_info.");
    
    // Validate dispatch times
    validateObject(incident.dispatch, validationRules.dispatch, errors, "dispatch.");
    
    // Validate patients
    if (incident.patient_info && incident.patient_info.details) {
        incident.patient_info.details.forEach((patient, index) => {
            validateObject(patient, validationRules.patient, errors, `patient_info.details[${index}].`);
            
            // Validate vital signs
            if (patient.vitals) {
                patient.vitals.forEach((vital, vitalIndex) => {
                    validateObject(vital, validationRules.patient.vital_signs, errors, `patient_info.details[${index}].vitals[${vitalIndex}].`);
                });
            }
        });
    }
    
    // Validate narrative
    if (validationRules.narrative.required && (!incident.narrative || incident.narrative.trim() === "")) {
        errors.push({
            field: "narrative",
            message: validationRules.narrative.message
        });
    } else if (incident.narrative && validationRules.narrative.minLength && 
               incident.narrative.length < validationRules.narrative.minLength) {
        errors.push({
            field: "narrative",
            message: validationRules.narrative.message
        });
    }
    
    // Validate created by
    if (validationRules.created_by.required && (!incident.created_by || incident.created_by.trim() === "")) {
        errors.push({
            field: "created_by",
            message: validationRules.created_by.message
        });
    }
    
    // If NFIRS validation is requested and basic validation passed
    if (checkNFIRS) {
        // Validate aid given/received
        validateObject(incident, validationRules.aid_given_received, errors, "");
        
        // Validate actions taken
        if (!incident.actions || !incident.actions.length) {
            errors.push({
                field: "actions",
                message: validationRules.actions.message
            });
        }
        
        // Run comprehensive NFIRS validation using the namespace version
        try {
            // Use the window.IncidentLogger.NFIRS.Validator namespace instead of import
            const nfirsValidation = window.IncidentLogger.NFIRS.Validator.validate(incident);
            
            // Add NFIRS-specific errors
            nfirsValidation.errors.forEach(nfirsError => {
                // Check if this error is already in our list (to avoid duplicates)
                const exists = errors.some(error => error.field === nfirsError.field);
                if (!exists) {
                    errors.push({
                        field: nfirsError.field,
                        message: nfirsError.message,
                        nfirs: true // Mark as NFIRS-specific error
                    });
                }
            });
            
            // Add NFIRS-specific warnings
            nfirsValidation.warnings.forEach(nfirsWarning => {
                warnings.push({
                    field: nfirsWarning.field,
                    message: nfirsWarning.message,
                    nfirs: true // Mark as NFIRS-specific warning
                });
            });
        } catch (error) {
            console.error("Error during NFIRS validation:", error);
            warnings.push({
                field: "nfirs_validation",
                message: "NFIRS validation could not be completed. Please check NFIRS requirements."
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
 * Validate an object against rules
 * @param {Object} obj - The object to validate
 * @param {Object} rules - The validation rules
 * @param {Array} errors - Array to collect validation errors
 * @param {string} prefix - Field name prefix for nested objects
 */
function validateObject(obj, rules, errors, prefix = "") {
    if (!obj) return;
    
    Object.keys(rules).forEach(field => {
        const value = obj[field];
        const rule = rules[field];
        
        // Skip validation for custom validators
        if (rule.custom) {
            const customResult = rule.custom(obj);
            if (!customResult.isValid) {
                errors.push({
                    field: `${prefix}${field}`,
                    message: customResult.message || rule.message
                });
            }
            return;
        }
        
        // Required check
        if (rule.required && (value === undefined || value === null || value === "")) {
            errors.push({
                field: `${prefix}${field}`,
                message: rule.message
            });
            return;
        }
        
        // Skip further validation if value is empty and not required
        if (value === undefined || value === null || value === "") {
            return;
        }
        
        // Pattern check
        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
                field: `${prefix}${field}`,
                message: rule.message
            });
        }
        
        // Values check
        if (rule.values && !rule.values.includes(value)) {
            errors.push({
                field: `${prefix}${field}`,
                message: rule.message
            });
        }
        
        // Min/max numeric checks
        if ((rule.min !== undefined || rule.max !== undefined) && !isNaN(value)) {
            const numValue = Number(value);
            
            if (rule.min !== undefined && numValue < rule.min) {
                errors.push({
                    field: `${prefix}${field}`,
                    message: rule.message
                });
            }
            
            if (rule.max !== undefined && numValue > rule.max) {
                errors.push({
                    field: `${prefix}${field}`,
                    message: rule.message
                });
            }
        }
        
        // Min/max length checks
        if ((rule.minLength !== undefined || rule.maxLength !== undefined) && value.length !== undefined) {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                errors.push({
                    field: `${prefix}${field}`,
                    message: rule.message
                });
            }
            
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                errors.push({
                    field: `${prefix}${field}`,
                    message: rule.message
                });
            }
        }
        
        // Future date check
        if (rule.future === false && isDateInFuture(value)) {
            errors.push({
                field: `${prefix}${field}`,
                message: rule.message
            });
        }
    });
}

/**
 * Check if a date string is in the future
 * @param {string} dateStr - The date string to check
 * @returns {boolean} - True if the date is in the future
 */
function isDateInFuture(dateStr) {
    if (!dateStr) return false;
    
    const inputDate = new Date(dateStr);
    const now = new Date();
    
    return inputDate > now;
}

/**
 * Validate the sequence of timestamps within dispatch
 * @param {Object} dispatch - The dispatch object with timestamps
 * @returns {Object} - Validation result with isValid flag and message
 */
function validateTimeSequence(dispatch) {
    if (!dispatch) return { isValid: true };
    
    const timeKeys = [
        'time_received',
        'time_dispatched',
        'time_enroute',
        'time_arrived',
        'time_transported',
        'time_at_hospital',
        'time_cleared'
    ];
    
    // Convert all present timestamps to Date objects
    const times = {};
    for (const key of timeKeys) {
        if (dispatch[key]) {
            times[key] = new Date(dispatch[key]);
            
            // Check if this is a valid date
            if (isNaN(times[key])) {
                return {
                    isValid: false,
                    message: `Invalid date/time format for ${key.replace('_', ' ')}`
                };
            }
        }
    }
    
    // Check sequence (only for times that are present)
    let lastTime = null;
    let lastTimeKey = null;
    
    for (const key of timeKeys) {
        if (times[key]) {
            if (lastTime && times[key] < lastTime) {
                return {
                    isValid: false,
                    message: `${key.replace('_', ' ')} must be after ${lastTimeKey.replace('_', ' ')}`
                };
            }
            
            lastTime = times[key];
            lastTimeKey = key;
        }
    }
    
    return { isValid: true };
}

/**
 * Apply validation error styling to form elements
 * @param {Array} errors - Array of validation error objects
 * @param {Array} warnings - Array of validation warning objects
 */
function applyValidationErrors(errors, warnings = []) {
    // Clear existing errors and warnings first
    clearValidationErrors();
    
    // Helper function to find element by field name
    const findElementByField = (field) => {
        const fieldParts = field.split('.');
        const fieldName = fieldParts[fieldParts.length - 1];
        
        let element = document.getElementById(fieldName) || 
                      document.getElementById(field) ||
                      document.querySelector(`[name="${fieldName}"]`) ||
                      document.querySelector(`[name="${field}"]`);
        
        // For nested fields, try constructing the ID
        if (!element && fieldParts.length > 1) {
            // Handle special cases like arrays
            if (fieldParts[0] === 'patient_info' && fieldParts[1] === 'details') {
                const matches = fieldParts[2].match(/\[(\d+)\]/);
                if (matches) {
                    const patientIndex = parseInt(matches[1]) + 1;
                    const propertyName = fieldParts[3];
                    
                    if (fieldParts.length > 4 && fieldParts[3] === 'vitals') {
                        const vitalMatches = fieldParts[4].match(/\[(\d+)\]/);
                        if (vitalMatches) {
                            const vitalIndex = parseInt(vitalMatches[1]) + 1;
                            const vitalProperty = fieldParts[5];
                            
                            element = document.querySelector(`[name="vital-${vitalProperty}-${patientIndex}-${vitalIndex}"]`);
                        }
                    } else {
                        element = document.getElementById(`patient-${propertyName}-${patientIndex}`);
                    }
                }
            }
        }
        
        return element;
    };
    
    // Process errors
    errors.forEach(error => {
        const element = findElementByField(error.field);
        
        if (element) {
            // Mark element as having an error
            element.classList.add('error');
            
            // Add NFIRS specific class for styling if needed
            if (error.nfirs) {
                element.classList.add('nfirs-error');
            }
            
            // Add error message
            const errorMsgId = `${element.id || element.name}-error`;
            if (!document.getElementById(errorMsgId)) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                if (error.nfirs) {
                    errorMsg.className += ' nfirs-error-message';
                }
                errorMsg.id = errorMsgId;
                errorMsg.textContent = error.message;
                
                // Insert after the element
                element.parentNode.insertBefore(errorMsg, element.nextSibling);
            }
        } else {
            console.warn(`Could not find element for field ${error.field}`);
            
            // For NFIRS-specific errors that don't have a direct field mapping,
            // show them in a global NFIRS error section if it exists
            if (error.nfirs) {
                const nfirsErrorsContainer = document.getElementById('nfirs-errors-container');
                if (nfirsErrorsContainer) {
                    const errorItem = document.createElement('div');
                    errorItem.className = 'nfirs-error-item';
                    errorItem.textContent = `${error.field}: ${error.message}`;
                    nfirsErrorsContainer.appendChild(errorItem);
                    nfirsErrorsContainer.style.display = 'block';
                }
            }
        }
    });
    
    // Process warnings
    warnings.forEach(warning => {
        const element = findElementByField(warning.field);
        
        if (element) {
            // Mark element as having a warning
            element.classList.add('warning');
            
            // Add NFIRS specific class for styling if needed
            if (warning.nfirs) {
                element.classList.add('nfirs-warning');
            }
            
            // Add warning message
            const warningMsgId = `${element.id || element.name}-warning`;
            if (!document.getElementById(warningMsgId)) {
                const warningMsg = document.createElement('div');
                warningMsg.className = 'warning-message';
                if (warning.nfirs) {
                    warningMsg.className += ' nfirs-warning-message';
                }
                warningMsg.id = warningMsgId;
                warningMsg.textContent = warning.message;
                
                // Insert after the element
                element.parentNode.insertBefore(warningMsg, element.nextSibling);
            }
        } else {
            console.warn(`Could not find element for field ${warning.field}`);
            
            // For NFIRS-specific warnings that don't have a direct field mapping,
            // show them in a global NFIRS warnings section if it exists
            if (warning.nfirs) {
                const nfirsWarningsContainer = document.getElementById('nfirs-warnings-container');
                if (nfirsWarningsContainer) {
                    const warningItem = document.createElement('div');
                    warningItem.className = 'nfirs-warning-item';
                    warningItem.textContent = `${warning.field}: ${warning.message}`;
                    nfirsWarningsContainer.appendChild(warningItem);
                    nfirsWarningsContainer.style.display = 'block';
                }
            }
        }
    });
}

/**
 * Clear all validation error styling
 */
function clearValidationErrors() {
    // Remove error classes from all elements
    document.querySelectorAll('.error, .nfirs-error, .warning, .nfirs-warning').forEach(element => {
        element.classList.remove('error', 'nfirs-error', 'warning', 'nfirs-warning');
    });
    
    // Remove all error and warning messages
    document.querySelectorAll('.error-message, .warning-message, .nfirs-error-message, .nfirs-warning-message').forEach(element => {
        element.remove();
    });
    
    // Clear any NFIRS error/warning containers
    const nfirsErrorsContainer = document.getElementById('nfirs-errors-container');
    if (nfirsErrorsContainer) {
        nfirsErrorsContainer.innerHTML = '';
        nfirsErrorsContainer.style.display = 'none';
    }
    
    const nfirsWarningsContainer = document.getElementById('nfirs-warnings-container');
    if (nfirsWarningsContainer) {
        nfirsWarningsContainer.innerHTML = '';
        nfirsWarningsContainer.style.display = 'none';
    }
}

// Add to global namespace for compatibility
window.IncidentLogger.FormValidator = {
    validate: validateIncident,
    applyErrors: applyValidationErrors,
    clearErrors: clearValidationErrors
};

console.log("Incident Validator component loaded (fixed version)");