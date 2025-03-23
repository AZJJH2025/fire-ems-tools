/**
 * FireEMS.ai Incident Logger - Validator Component
 * 
 * This component handles data validation for the Incident Logger.
 */

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
        }
    },
    
    // Location validation
    location: {
        address: {
            required: true,
            message: "Incident address is required"
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
    }
};

/**
 * Validate an entire incident
 * @param {Object} incident - The incident data to validate
 * @returns {Object} - Object with isValid flag and array of errors
 */
function validateIncident(incident) {
    const errors = [];
    
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
    
    return {
        isValid: errors.length === 0,
        errors: errors
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
 */
function applyValidationErrors(errors) {
    // Clear existing errors first
    clearValidationErrors();
    
    errors.forEach(error => {
        // Try to find the input element
        const fieldParts = error.field.split('.');
        const fieldName = fieldParts[fieldParts.length - 1];
        
        let element = document.getElementById(fieldName) || 
                      document.getElementById(error.field) ||
                      document.querySelector(`[name="${fieldName}"]`) ||
                      document.querySelector(`[name="${error.field}"]`);
        
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
        
        if (element) {
            // Mark element as having an error
            element.classList.add('error');
            
            // Add error message
            const errorMsgId = `${element.id || element.name}-error`;
            if (!document.getElementById(errorMsgId)) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.id = errorMsgId;
                errorMsg.textContent = error.message;
                
                // Insert after the element
                element.parentNode.insertBefore(errorMsg, element.nextSibling);
            }
        } else {
            console.warn(`Could not find element for field ${error.field}`);
        }
    });
}

/**
 * Clear all validation error styling
 */
function clearValidationErrors() {
    // Remove error class from all elements
    document.querySelectorAll('.error').forEach(element => {
        element.classList.remove('error');
    });
    
    // Remove all error messages
    document.querySelectorAll('.error-message').forEach(element => {
        element.remove();
    });
}
