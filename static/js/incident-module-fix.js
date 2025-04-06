/**
 * Module Fix Script for Incident Logger
 * 
 * This script creates JavaScript namespaces for the different components
 * and loads their functionality without using ES6 import/export syntax.
 */

// Create namespace for all components
window.IncidentLogger = {
    Validator: {},
    HIPAA: {},
    CAD: {},
    NFIRS: {},
    Map: {},
    Export: {}
};

/**
 * HIPAA Compliance Module - Provides functions for HIPAA compliance
 */
(function() {
    // Log access to patient information for HIPAA compliance
    function logPatientAccess(incidentId, userId, action, fieldsChanged = null) {
        const accessLog = {
            user: userId,
            timestamp: new Date().toISOString(),
            action: action
        };
        
        if (fieldsChanged) {
            accessLog.fields_changed = fieldsChanged;
        }
        
        // Get the incident if it exists
        const incident = getIncidentById(incidentId);
        
        if (incident) {
            // Initialize audit log if it doesn't exist
            if (!incident.audit) {
                incident.audit = {
                    created_by: userId,
                    created_at: new Date().toISOString(),
                    last_modified_by: userId,
                    last_modified: new Date().toISOString(),
                    access_log: []
                };
            }
            
            // Add to access log
            incident.audit.access_log.push(accessLog);
            
            // Update last modified if this was a modification
            if (action === 'modified') {
                incident.audit.last_modified_by = userId;
                incident.audit.last_modified = new Date().toISOString();
            }
            
            // Save the incident
            saveIncident(incident);
        }
        
        // Optionally log to server
        if (window.IncidentLogger.Config && window.IncidentLogger.Config.serverLogging) {
            sendLogToServer(incidentId, accessLog);
        }
    }
    
    // Check if the current user has PHI access
    function hasPhiAccess() {
        // In a real implementation, this would check user permissions
        // For this example, we'll use a mock user role from localStorage
        const userRole = localStorage.getItem('user_role') || 'basic';
        
        // Only users with clinical roles can access PHI
        const clinicalRoles = ['paramedic', 'emt', 'doctor', 'nurse', 'admin'];
        
        return clinicalRoles.includes(userRole);
    }
    
    // De-identify an incident for data sharing
    function deidentifyIncident(incident) {
        // Create a deep copy of the incident to avoid modifying the original
        const deidentified = JSON.parse(JSON.stringify(incident));
        
        // Remove or redact PHI
        if (deidentified.caller_info) {
            deidentified.caller_info.name = "[REDACTED]";
            deidentified.caller_info.phone = "[REDACTED]";
        }
        
        // De-identify patient info
        if (deidentified.patient_info && deidentified.patient_info.details) {
            deidentified.patient_info.details.forEach(patient => {
                // Replace with age range instead of exact age
                if (patient.age) {
                    const ageRange = getAgeRange(patient.age);
                    patient.age = ageRange;
                }
                
                // Redact PHI fields
                patient.name = "[REDACTED]";
                patient.medical_history = "[REDACTED]";
                patient.medications = "[REDACTED]";
                patient.allergies = "[REDACTED]";
                
                // Remove any other PHI from patient data
                delete patient.dob;
                delete patient.ssn;
                delete patient.insurance;
                delete patient.address;
                delete patient.phone;
            });
        }
        
        // Remove PHI from narrative by replacing names
        if (deidentified.narrative) {
            deidentified.narrative = deidentified.narrative.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[NAME]");
        }
        
        return deidentified;
    }
    
    // Record patient consent
    function recordHipaaConsent(incidentId, patientIndex, consentData) {
        const incident = getIncidentById(incidentId);
        
        if (!incident) {
            console.error("Incident not found:", incidentId);
            return false;
        }
        
        // Ensure patient info exists
        if (!incident.patient_info || !incident.patient_info.details || 
            !incident.patient_info.details[patientIndex]) {
            console.error("Patient not found:", patientIndex);
            return false;
        }
        
        // Add consent info to patient
        incident.patient_info.details[patientIndex].consent = {
            ...consentData,
            timestamp: new Date().toISOString()
        };
        
        // Save the incident
        saveIncident(incident);
        
        return true;
    }
    
    // Create a privacy banner for the UI
    function createPrivacyBanner() {
        const banner = document.createElement('div');
        banner.className = 'hipaa-banner';
        banner.innerHTML = `
            <div class="hipaa-warning">
                <i class="fas fa-shield-alt"></i>
                <span>HIPAA Protected Health Information (PHI) - Access is logged and monitored</span>
            </div>
            <div class="hipaa-controls">
                <button class="secondary-btn small-btn hipaa-consent-btn">
                    <i class="fas fa-file-signature"></i> Patient Consent
                </button>
                <button class="secondary-btn small-btn hipaa-redact-btn">
                    <i class="fas fa-eye-slash"></i> Redacted View
                </button>
            </div>
        `;
        
        return banner;
    }
    
    // Create a consent form for the patient
    function createConsentForm(patientIndex) {
        const consentForm = document.createElement('div');
        consentForm.className = 'hipaa-consent-form';
        consentForm.innerHTML = `
            <h3>HIPAA Consent Form - Patient #${patientIndex + 1}</h3>
            <div class="form-group">
                <label>Consent Type:</label>
                <select id="consent-type-${patientIndex}">
                    <option value="verbal">Verbal Consent</option>
                    <option value="written">Written Consent</option>
                    <option value="implied">Implied Consent</option>
                    <option value="none">No Consent/Unable</option>
                </select>
            </div>
            <div class="form-group">
                <label>Information Release:</label>
                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" id="consent-treatment-${patientIndex}" checked>
                        Treatment & Care
                    </label>
                    <label>
                        <input type="checkbox" id="consent-billing-${patientIndex}" checked>
                        Billing & Payment
                    </label>
                    <label>
                        <input type="checkbox" id="consent-family-${patientIndex}">
                        Family Members
                    </label>
                    <label>
                        <input type="checkbox" id="consent-research-${patientIndex}">
                        Research (de-identified)
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label for="consent-notes-${patientIndex}">Consent Notes:</label>
                <textarea id="consent-notes-${patientIndex}" rows="3" placeholder="Record any specifics about consent..."></textarea>
            </div>
        `;
        
        // Add to the record button
        const saveButton = document.createElement('button');
        saveButton.className = 'primary-btn';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Record Consent';
        saveButton.addEventListener('click', function() {
            const consentData = {
                type: document.getElementById(`consent-type-${patientIndex}`).value,
                treatment: document.getElementById(`consent-treatment-${patientIndex}`).checked,
                billing: document.getElementById(`consent-billing-${patientIndex}`).checked,
                family: document.getElementById(`consent-family-${patientIndex}`).checked,
                research: document.getElementById(`consent-research-${patientIndex}`).checked,
                notes: document.getElementById(`consent-notes-${patientIndex}`).value,
                recorded_by: localStorage.getItem('user_name') || 'Current User',
                recorded_at: new Date().toISOString()
            };
            
            // Get the current incident ID
            const incidentId = document.getElementById('incident-id').value;
            
            // Record the consent
            if (recordHipaaConsent(incidentId, patientIndex, consentData)) {
                alert('Consent recorded successfully.');
                // Close modal if one is being used
                if (typeof closeModal === 'function') {
                    closeModal();
                }
            } else {
                alert('Failed to record consent.');
            }
        });
        
        consentForm.appendChild(saveButton);
        setTimeout(() => {
            document.getElementById(`consent-type-${patientIndex}`).focus();
        }, 0);
        
        return consentForm;
    }

    // Helper function to get an age range from an exact age
    function getAgeRange(age) {
        if (age < 18) {
            return "Under 18";
        } else if (age < 30) {
            return "18-29";
        } else if (age < 40) {
            return "30-39";
        } else if (age < 50) {
            return "40-49";
        } else if (age < 60) {
            return "50-59";
        } else if (age < 70) {
            return "60-69";
        } else {
            return "70+";
        }
    }
    
    // Helper function to get incident by ID (simplified)
    function getIncidentById(incidentId) {
        // In a real implementation, this would fetch from storage
        // For this example, we'll return a mock
        return window.currentIncident || null;
    }
    
    // Helper function to save incident (simplified)
    function saveIncident(incident) {
        // In a real implementation, this would save to storage
        // For this example, we'll just update the window variable
        window.currentIncident = incident;
        console.log("Saved incident:", incident.id);
    }
    
    // Helper function to send a log to the server (simplified)
    function sendLogToServer(incidentId, log) {
        // In a real implementation, this would send an API request
        console.log(`Sending log to server for incident ${incidentId}:`, log);
    }
    
    // Add functions to the namespace
    window.IncidentLogger.HIPAA = {
        logAccess: logPatientAccess,
        hasAccess: hasPhiAccess,
        deidentify: deidentifyIncident,
        recordConsent: recordHipaaConsent,
        createBanner: createPrivacyBanner,
        createConsentForm: createConsentForm
    };
})();

/**
 * Form Validation Module - Provides functions for validating form data
 */
(function() {
    // Default validation rules
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
        
        // Location validation
        location: {
            address: {
                required: true,
                message: "Incident address is required"
            }
        },
        
        // Unit validation
        unit: {
            id: {
                required: true,
                message: "Unit ID is required"
            },
            type: {
                required: true,
                message: "Unit type is required"
            }
        },
        
        // Narrative validation
        narrative: {
            required: true,
            minLength: 20,
            message: "Narrative is required and must be at least 20 characters"
        }
    };
    
    // Validate an entire incident
    function validateIncident(incident, options = {}) {
        const errors = [];
        const warnings = [];
        const checkNFIRS = options.checkNFIRS || false;
        const currentStep = options.currentStep || null;
        
        // Only validate fields in the current step if specified
        const validateField = (field, fieldPrefix) => {
            if (!currentStep) return true; // Validate all if no step specified
            
            // Map fields to steps
            const fieldToStep = {
                // Step 1: Basic info
                'incident.id': 1, 'incident.timestamp': 1, 'incident.status': 1,
                'incident_type.primary': 1, 'incident_type.secondary': 1,
                
                // Step 2: Location
                'location.address': 2, 'location.city': 2, 'location.state': 2,
                
                // Step 3: Dispatch
                'dispatch.time_received': 3,
                
                // Step 4: Units
                'unit.id': 4, 'unit.type': 4,
                
                // Step 5: Patients
                'patient_info': 5,
                
                // Step 6: Narrative and outcome
                'narrative': 6, 'created_by': 6
            };
            
            const fullFieldName = fieldPrefix ? `${fieldPrefix}${field}` : field;
            const fieldStep = fieldToStep[fullFieldName];
            
            // If field has a step mapping, check if it's the current step
            return fieldStep ? fieldStep === currentStep : true;
        };
        
        // Validate basic incident properties
        if (validateField('incident', '')) {
            validateObject(incident, validationRules.incident, errors, "");
        }
        
        // Validate location if in step 2 or validating all
        if (validateField('location', '')) {
            validateObject(incident.location, validationRules.location, errors, "location.");
        }
        
        // Validate each unit if in step 4 or validating all
        if (validateField('unit', '') && incident.units) {
            incident.units.forEach((unit, index) => {
                validateObject(unit, validationRules.unit, errors, `units[${index}].`);
            });
        }
        
        // Validate narrative if in step 6 or validating all
        if (validateField('narrative', '') && validationRules.narrative.required) {
            if (!incident.narrative || incident.narrative.trim() === "") {
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
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
    
    // Validate an object against rules
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
    
    // Check if a date string is in the future
    function isDateInFuture(dateStr) {
        if (!dateStr) return false;
        
        const inputDate = new Date(dateStr);
        const now = new Date();
        
        return inputDate > now;
    }
    
    // Apply validation error styling to form elements
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
            
            return element;
        };
        
        // Process errors
        errors.forEach(error => {
            const element = findElementByField(error.field);
            
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
        
        // Process warnings
        warnings.forEach(warning => {
            const element = findElementByField(warning.field);
            
            if (element) {
                // Mark element as having a warning
                element.classList.add('warning');
                
                // Add warning message
                const warningMsgId = `${element.id || element.name}-warning`;
                if (!document.getElementById(warningMsgId)) {
                    const warningMsg = document.createElement('div');
                    warningMsg.className = 'warning-message';
                    warningMsg.id = warningMsgId;
                    warningMsg.textContent = warning.message;
                    
                    // Insert after the element
                    element.parentNode.insertBefore(warningMsg, element.nextSibling);
                }
            } else {
                console.warn(`Could not find element for field ${warning.field}`);
            }
        });
    }
    
    // Clear all validation error styling
    function clearValidationErrors() {
        // Remove error classes from all elements
        document.querySelectorAll('.error, .warning').forEach(element => {
            element.classList.remove('error', 'warning');
        });
        
        // Remove all error and warning messages
        document.querySelectorAll('.error-message, .warning-message').forEach(element => {
            element.remove();
        });
    }
    
    // Validate the current form step
    function validateCurrentStep() {
        // Get the currently visible step
        const currentStep = document.querySelector('.form-step:not([style*="display: none"])');
        if (!currentStep) return true;
        
        const stepNumber = parseInt(currentStep.dataset.step);
        
        // Get the current form data
        const formData = collectFormData();
        
        // Validate only the fields in the current step
        const result = validateIncident(formData, { currentStep: stepNumber });
        
        // Apply validation errors
        applyValidationErrors(result.errors, result.warnings);
        
        return result.isValid;
    }
    
    // Collect form data from the current form
    function collectFormData() {
        // Safely get element value, returning empty string if element doesn't exist
        const safeGetValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };
        
        const formData = {
            id: safeGetValue('incident-id'),
            timestamp: safeGetValue('incident-timestamp'),
            status: safeGetValue('incident-status'),
            location: {
                address: safeGetValue('location-address'),
                city: safeGetValue('location-city'),
                state: safeGetValue('location-state'),
                zip: safeGetValue('location-zip')
            },
            units: [],
            narrative: safeGetValue('incident-narrative')
        };
        
        // Collect unit data
        const unitEntries = document.querySelectorAll('.unit-entry');
        unitEntries.forEach((entry, index) => {
            const unitIndex = index + 1;
            const unitId = document.getElementById(`unit-id-${unitIndex}`);
            const unitType = document.getElementById(`unit-type-${unitIndex}`);
            
            if (unitId && unitType) {
                formData.units.push({
                    id: unitId.value,
                    type: unitType.value
                });
            }
        });
        
        // Handle patient info if needed
        try {
            const patientEntries = document.querySelectorAll('.patient-entry');
            if (patientEntries && patientEntries.length > 0) {
                formData.patient_info = { details: [] };
                patientEntries.forEach((entry, index) => {
                    // Add basic patient structure even if we can't get all details
                    formData.patient_info.details.push({
                        id: index + 1,
                        status: 'Unknown'
                    });
                });
            }
        } catch (e) {
            console.error("Error collecting patient data:", e);
        }
        
        return formData;
    }
    
    // Add functions to the namespace
    window.IncidentLogger.Validator = {
        validate: validateIncident,
        validateStep: validateCurrentStep,
        applyErrors: applyValidationErrors,
        clearErrors: clearValidationErrors,
        collectData: collectFormData
    };
})();

/**
 * CAD Integration Module - Provides functions for integrating with CAD systems
 */
(function() {
    // Import CAD data from a file
    function importCadData(file, options = {}) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("No file provided"));
                return;
            }
            
            // Check file type
            if (!file.name.endsWith('.json') && !file.name.endsWith('.xml') && !file.name.endsWith('.csv')) {
                reject(new Error("Unsupported file type. Please use JSON, XML, or CSV."));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    let cadData;
                    
                    // Process based on file type
                    if (file.name.endsWith('.json')) {
                        cadData = JSON.parse(event.target.result);
                    } else if (file.name.endsWith('.xml')) {
                        // Basic XML parsing (would be more robust in production)
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
                        cadData = parseXmlToCadData(xmlDoc);
                    } else if (file.name.endsWith('.csv')) {
                        // Basic CSV parsing (would be more robust in production)
                        cadData = parseCsvToCadData(event.target.result);
                    }
                    
                    // Detect and normalize the CAD format
                    const normalizedData = normalizeCadData(cadData, options.cadSystem);
                    
                    resolve(normalizedData);
                } catch (error) {
                    reject(new Error(`Failed to parse CAD data: ${error.message}`));
                }
            };
            
            reader.onerror = function() {
                reject(new Error("Failed to read file"));
            };
            
            // Read the file
            if (file.name.endsWith('.json') || file.name.endsWith('.xml') || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }
    
    // Apply CAD data to an incident
    function applyCadToIncident(incident, cadData, options = {}) {
        const mode = options.mode || 'update'; // 'update' or 'create'
        
        // Create a new incident or clone the existing one
        const updatedIncident = mode === 'create' ? {} : { ...incident };
        
        // Apply basic incident details
        if (cadData.call_number) {
            updatedIncident.call_number = cadData.call_number;
        }
        
        if (cadData.type) {
            updatedIncident.type = cadData.type;
        }
        
        if (cadData.priority) {
            updatedIncident.priority = parseInt(cadData.priority) || 3;
        }
        
        // Apply location data
        if (cadData.location) {
            updatedIncident.location = {
                ...updatedIncident.location || {},
                ...cadData.location
            };
        }
        
        // Apply caller info
        if (cadData.caller) {
            updatedIncident.caller_info = {
                ...updatedIncident.caller_info || {},
                ...cadData.caller
            };
        }
        
        // Apply dispatch times
        if (cadData.times) {
            updatedIncident.times = {
                ...updatedIncident.times || {},
                ...cadData.times
            };
        }
        
        // Apply units
        if (cadData.units && cadData.units.length > 0) {
            // If creating a new incident, just use the CAD units
            if (mode === 'create') {
                updatedIncident.units = [...cadData.units];
            } else {
                // If updating, merge with existing units
                const existingUnitIds = new Set((updatedIncident.units || []).map(u => u.id));
                
                // Add new units
                cadData.units.forEach(cadUnit => {
                    if (!existingUnitIds.has(cadUnit.id)) {
                        if (!updatedIncident.units) {
                            updatedIncident.units = [];
                        }
                        updatedIncident.units.push(cadUnit);
                    }
                });
            }
        }
        
        // If creating a new incident, set status to active
        if (mode === 'create') {
            updatedIncident.status = 'active';
            updatedIncident.created_at = new Date().toISOString();
        }
        
        // Always update the updated_at timestamp
        updatedIncident.updated_at = new Date().toISOString();
        
        return updatedIncident;
    }
    
    // Create CAD import UI
    function createCadImportUI() {
        const container = document.createElement('div');
        container.className = 'cad-import-container';
        container.innerHTML = `
            <h2>Import CAD Data</h2>
            <div class="form-group">
                <label for="cad-system">CAD System:</label>
                <select id="cad-system">
                    <option value="generic">Generic CAD</option>
                    <option value="zoll">Zoll CAD</option>
                    <option value="eso">ESO CAD</option>
                    <option value="imagetrend">ImageTrend CAD</option>
                    <option value="motorola">Motorola CAD</option>
                </select>
            </div>
            <div class="form-group">
                <label for="cad-file">CAD File:</label>
                <input type="file" id="cad-file" accept=".json,.xml,.csv">
            </div>
            <div class="form-group">
                <label for="cad-import-mode">Import Mode:</label>
                <select id="cad-import-mode">
                    <option value="new">Create New Incident</option>
                    <option value="update">Update Existing Incident</option>
                </select>
            </div>
            <div id="cad-match-container" style="display: none;">
                <div class="form-group">
                    <label for="cad-match-incident">Match to Incident:</label>
                    <select id="cad-match-incident">
                        <option value="">Select Incident...</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button id="cad-preview-btn" class="secondary-btn">Preview</button>
                <button id="cad-import-btn" class="primary-btn">Import</button>
                <button id="cad-cancel-btn" class="secondary-btn">Cancel</button>
            </div>
            <div id="cad-import-preview" class="cad-preview" style="display: none;">
                <h3>Preview</h3>
                <pre id="cad-preview-content"></pre>
            </div>
        `;
        
        return container;
    }
    
    // Helper functions
    function parseXmlToCadData(xmlDoc) {
        // This would be a more robust implementation in production
        // Basic example:
        const cadData = {};
        
        try {
            cadData.call_number = getXmlValue(xmlDoc, 'CallNumber') || getXmlValue(xmlDoc, 'incident_number');
            cadData.type = getXmlValue(xmlDoc, 'Type') || getXmlValue(xmlDoc, 'incident_type');
            cadData.priority = getXmlValue(xmlDoc, 'Priority') || getXmlValue(xmlDoc, 'priority');
            
            // Location
            cadData.location = {
                address: getXmlValue(xmlDoc, 'Address') || getXmlValue(xmlDoc, 'address'),
                city: getXmlValue(xmlDoc, 'City') || getXmlValue(xmlDoc, 'city'),
                state: getXmlValue(xmlDoc, 'State') || getXmlValue(xmlDoc, 'state'),
                zip: getXmlValue(xmlDoc, 'Zip') || getXmlValue(xmlDoc, 'postal_code')
            };
            
            // Caller
            cadData.caller = {
                name: getXmlValue(xmlDoc, 'CallerName') || getXmlValue(xmlDoc, 'caller_name'),
                phone: getXmlValue(xmlDoc, 'CallerPhone') || getXmlValue(xmlDoc, 'caller_phone')
            };
            
            // Units
            const unitNodes = xmlDoc.getElementsByTagName('Unit');
            if (unitNodes.length > 0) {
                cadData.units = [];
                for (let i = 0; i < unitNodes.length; i++) {
                    cadData.units.push({
                        id: getXmlValue(unitNodes[i], 'ID') || unitNodes[i].textContent,
                        type: getXmlValue(unitNodes[i], 'Type') || 'Unknown'
                    });
                }
            }
        } catch (error) {
            console.error("Error parsing XML:", error);
        }
        
        return cadData;
    }
    
    function getXmlValue(xmlDoc, tagName) {
        const elements = xmlDoc.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0].textContent : null;
    }
    
    function parseCsvToCadData(csvText) {
        // This would be a more robust implementation in production
        // Basic example:
        const cadData = {};
        
        try {
            const lines = csvText.split('\n');
            if (lines.length < 2) {
                throw new Error("CSV must have at least a header row and one data row");
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            const values = lines[1].split(',').map(v => v.trim());
            
            // Map CSV fields to CAD data
            const fieldMap = {
                'Call Number': 'call_number',
                'Incident Number': 'call_number',
                'Type': 'type',
                'Incident Type': 'type',
                'Priority': 'priority',
                'Address': 'location.address',
                'City': 'location.city',
                'State': 'location.state',
                'ZIP': 'location.zip',
                'Zip Code': 'location.zip',
                'Caller Name': 'caller.name',
                'Caller Phone': 'caller.phone',
                'Units': 'units'
            };
            
            headers.forEach((header, index) => {
                const value = values[index];
                const field = fieldMap[header];
                
                if (field && value) {
                    if (field.includes('.')) {
                        const [parent, child] = field.split('.');
                        if (!cadData[parent]) {
                            cadData[parent] = {};
                        }
                        cadData[parent][child] = value;
                    } else if (field === 'units') {
                        cadData.units = value.split(';').map(unit => ({
                            id: unit.trim(),
                            type: 'Unknown'
                        }));
                    } else {
                        cadData[field] = value;
                    }
                }
            });
        } catch (error) {
            console.error("Error parsing CSV:", error);
        }
        
        return cadData;
    }
    
    function normalizeCadData(cadData, cadSystem = 'generic') {
        // Normalize based on CAD system
        switch (cadSystem.toLowerCase()) {
            case 'zoll':
                return normalizeZollCadData(cadData);
            case 'eso':
                return normalizeEsoCadData(cadData);
            case 'imagetrend':
                return normalizeImageTrendCadData(cadData);
            case 'motorola':
                return normalizeMotorolaCadData(cadData);
            case 'generic':
            default:
                return normalizeGenericCadData(cadData);
        }
    }
    
    function normalizeGenericCadData(cadData) {
        // Basic normalization for generic CAD format
        return {
            call_number: cadData.call_number || cadData.incident_number || cadData.cad_number,
            type: cadData.type || cadData.call_type || cadData.incident_type,
            priority: cadData.priority,
            location: cadData.location || {
                address: cadData.address,
                city: cadData.city,
                state: cadData.state,
                zip: cadData.zip || cadData.postal_code
            },
            caller: cadData.caller || {
                name: cadData.caller_name,
                phone: cadData.caller_phone
            },
            units: cadData.units || [],
            times: cadData.times || {}
        };
    }
    
    function normalizeZollCadData(cadData) {
        // Normalize Zoll-specific fields
        return {
            call_number: cadData.inc_number || cadData.call_number,
            type: cadData.complaint || cadData.nature,
            priority: cadData.priority ? cadData.priority.replace('P', '') : '3',
            location: {
                address: cadData.address,
                city: cadData.city,
                state: cadData.state,
                zip: cadData.postal || cadData.zip,
                latitude: cadData.lat,
                longitude: cadData.lon
            },
            caller: {
                name: cadData.reporting_party,
                phone: cadData.callback
            },
            units: (cadData.units_assigned || '')
                .split(',')
                .filter(Boolean)
                .map(unit => ({
                    id: unit.trim(),
                    type: guessUnitType(unit.trim())
                })),
            times: {
                received: cadData.received,
                dispatched: cadData.dispatch
            }
        };
    }
    
    function normalizeEsoCadData(cadData) {
        // Normalize ESO-specific fields
        let units = [];
        
        if (cadData.RespondingUnits) {
            if (Array.isArray(cadData.RespondingUnits)) {
                units = cadData.RespondingUnits.map(unit => ({
                    id: unit,
                    type: guessUnitType(unit)
                }));
            } else if (typeof cadData.RespondingUnits === 'string') {
                units = cadData.RespondingUnits
                    .split(',')
                    .filter(Boolean)
                    .map(unit => ({
                        id: unit.trim(),
                        type: guessUnitType(unit.trim())
                    }));
            }
        }
        
        return {
            call_number: cadData.IncidentNumber,
            type: cadData.NatureOfCall || cadData.IncidentType,
            priority: mapEsoPriorityToNumeric(cadData.ResponseLevel),
            location: {
                address: cadData.Location?.StreetAddress,
                city: cadData.Location?.City,
                state: cadData.Location?.State,
                zip: cadData.Location?.PostalCode,
                latitude: cadData.Location?.Latitude,
                longitude: cadData.Location?.Longitude
            },
            caller: {
                name: cadData.Caller?.CallerName,
                phone: cadData.Caller?.ContactNumber
            },
            units: units,
            times: {
                received: cadData.Timestamps?.CallReceived,
                dispatched: cadData.Timestamps?.Dispatched,
                enroute: cadData.Timestamps?.Enroute
            }
        };
    }
    
    function normalizeImageTrendCadData(cadData) {
        // This would be implemented based on ImageTrend's specific format
        // Basic placeholder:
        return normalizeGenericCadData(cadData);
    }
    
    function normalizeMotorolaCadData(cadData) {
        // This would be implemented based on Motorola's specific format
        // Basic placeholder:
        return normalizeGenericCadData(cadData);
    }
    
    function mapEsoPriorityToNumeric(priority) {
        // Map ESO priorities to numeric values
        const mapping = {
            'ECHO': '1',
            'DELTA': '1',
            'CHARLIE': '2',
            'BRAVO': '3',
            'ALPHA': '4',
            'OMEGA': '5'
        };
        
        return mapping[priority] || '3';
    }
    
    function guessUnitType(unitId) {
        // Guess unit type based on ID pattern
        unitId = unitId.toUpperCase();
        
        if (unitId.startsWith('E') || unitId.includes('ENG')) {
            return 'Engine';
        } else if (unitId.startsWith('L') || unitId.startsWith('T') || unitId.includes('LAD') || unitId.includes('TRK')) {
            return 'Ladder';
        } else if (unitId.startsWith('M') || unitId.startsWith('A') || unitId.includes('MED') || unitId.includes('AMB')) {
            return 'Ambulance';
        } else if (unitId.startsWith('R') || unitId.includes('RES')) {
            return 'Rescue';
        } else if (unitId.startsWith('B') || unitId.startsWith('BC') || unitId.includes('BAT')) {
            return 'Battalion';
        } else if (unitId.includes('HAZ') || unitId.includes('HM')) {
            return 'Hazmat';
        } else {
            return 'Other';
        }
    }
    
    // Add functions to the namespace
    window.IncidentLogger.CAD = {
        import: importCadData,
        apply: applyCadToIncident,
        createUI: createCadImportUI
    };
})();

/**
 * Add configuration options
 */
window.IncidentLogger.Config = {
    autoSave: true,
    serverLogging: false,
    defaultTimeout: 30000
};

/**
 * Fix save functionality
 */
(function() {
    // Save the current incident
    function saveIncident(isSubmit = false) {
        console.log("Saving incident...");
        
        try {
            // Collect form data
            const formData = window.IncidentLogger.Validator.collectData();
            
            // Validate data
            const validationResult = window.IncidentLogger.Validator.validate(formData);
            
            // If submitting, do full validation and show errors if invalid
            if (isSubmit && !validationResult.isValid) {
                window.IncidentLogger.Validator.applyErrors(validationResult.errors, validationResult.warnings);
                console.error("Validation failed:", validationResult.errors);
                
                // Show error toast
                if (typeof showToast === 'function') {
                    showToast("Please fix the errors before submitting.", "error");
                } else {
                    alert("Please fix the errors before submitting.");
                }
                
                return false;
            }
            
            // For draft saves, proceed even with validation errors
            if (!isSubmit) {
                // Save to localStorage for demonstration
                const draftKey = `incident_draft_${formData.id}`;
                localStorage.setItem(draftKey, JSON.stringify({
                    ...formData,
                    updated_at: new Date().toISOString(),
                    is_draft: true
                }));
                
                console.log("Draft saved to localStorage:", draftKey);
                
                // Show success toast
                if (typeof showToast === 'function') {
                    showToast("Draft saved successfully.", "success");
                } else {
                    alert("Draft saved successfully.");
                }
                
                return true;
            }
            
            // For submit, actually send to server in real implementation
            // For demo, we'll just save a submitted version to localStorage
            const submittedKey = `incident_submitted_${formData.id}`;
            localStorage.setItem(submittedKey, JSON.stringify({
                ...formData,
                submitted_at: new Date().toISOString(),
                is_draft: false
            }));
            
            console.log("Incident submitted:", submittedKey);
            
            // Show success toast
            if (typeof showToast === 'function') {
                showToast("Incident submitted successfully.", "success");
            } else {
                alert("Incident submitted successfully.");
            }
            
            // Clear form after successful submit
            resetForm();
            
            return true;
            
        } catch (error) {
            console.error("Error saving incident:", error);
            
            // Show error toast
            if (typeof showToast === 'function') {
                showToast("Error saving incident: " + error.message, "error");
            } else {
                alert("Error saving incident: " + error.message);
            }
            
            return false;
        }
    }
    
    // Reset the form
    function resetForm() {
        // Reset to first step
        navigateToStep(1);
        
        // Clear form fields (in real implementation)
        document.querySelectorAll('input:not([readonly]), textarea, select').forEach(element => {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            } else {
                element.value = '';
            }
        });
        
        // Reset patient and unit containers
        document.getElementById('patients-container').innerHTML = '';
        document.getElementById('units-container').innerHTML = '';
        
        // Add first empty patient and unit
        addPatientEntry();
        addUnitEntry();
        
        // Generate new incident ID
        generateIncidentId();
    }
    
    // Navigate to a specific form step
    function navigateToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show the selected step
        const selectedStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (selectedStep) {
            selectedStep.style.display = 'block';
        }
        
        // Update step progress
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            if (index + 1 < stepNumber) {
                indicator.className = 'step-indicator completed';
            } else if (index + 1 === stepNumber) {
                indicator.className = 'step-indicator current';
            } else {
                indicator.className = 'step-indicator';
            }
        });
    }
    
    // Generate a new incident ID
    function generateIncidentId() {
        const today = new Date();
        const dateString = today.getFullYear() +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0');
        
        // Generate a random sequence number (in real implementation would be sequential)
        const sequenceNumber = Math.floor(Math.random() * 9000) + 1000;
        
        const incidentId = `INC-${dateString}-${sequenceNumber}`;
        
        // Set the incident ID field
        const idField = document.getElementById('incident-id');
        if (idField) {
            idField.value = incidentId;
        }
        
        return incidentId;
    }
    
    // Add functions to the namespace
    window.IncidentLogger.Form = {
        save: saveIncident,
        reset: resetForm,
        navigate: navigateToStep,
        generateId: generateIncidentId
    };
})();

// Main initialization function
window.initializeIncidentLogger = function() {
    console.log("Initializing Incident Logger...");
    
    // Set up event listeners
    
    // Form navigation buttons
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.form-step').dataset.step);
            
            // Validate current step before proceeding
            if (window.IncidentLogger.Validator.validateStep()) {
                window.IncidentLogger.Form.navigate(currentStep + 1);
            }
        });
    });
    
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.form-step').dataset.step);
            window.IncidentLogger.Form.navigate(currentStep - 1);
        });
    });
    
    // Save and submit buttons
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            window.IncidentLogger.Form.save(false);
        });
    }
    
    const submitBtn = document.getElementById('submit-incident-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            window.IncidentLogger.Form.save(true);
        });
    }
    
    // Autosave
    if (window.IncidentLogger.Config.autoSave) {
        setInterval(function() {
            window.IncidentLogger.Form.save(false);
        }, 60000); // Autosave every minute
    }
    
    // Initialize with a new incident ID
    window.IncidentLogger.Form.generateId();
    
    // For new incidents, set current date/time
    const timestampField = document.getElementById('incident-timestamp');
    if (timestampField && !timestampField.value) {
        const now = new Date();
        const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        timestampField.value = localDatetime;
    }
    
    console.log("Incident Logger initialization complete!");
};

// Initialize when DOM is loaded if the page is incident-logger.html
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('#incident-form-container')) {
            window.initializeIncidentLogger();
        }
    });
} else {
    if (document.querySelector('#incident-form-container')) {
        window.initializeIncidentLogger();
    }
}

// Export the namespace for use in browser console debugging
window.IL = window.IncidentLogger;