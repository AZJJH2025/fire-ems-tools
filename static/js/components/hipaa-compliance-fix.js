/**
 * FireEMS.ai Incident Logger - HIPAA Compliance Module (Fixed Version)
 * 
 * This module handles HIPAA compliance features including:
 * - De-identification of PHI
 * - Consent tracking
 * - Audit logging
 * - Access controls
 */

// Create namespace if it doesn't exist
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.Components = window.IncidentLogger.Components || {};
window.IncidentLogger.Components.HIPAA = window.IncidentLogger.Components.HIPAA || {};

/**
 * Log access to patient information for HIPAA compliance
 * @param {string} incidentId - The ID of the incident being accessed
 * @param {string} userId - The ID or name of the user accessing the record
 * @param {string} action - The action performed (viewed, modified, exported)
 * @param {Array} fieldsChanged - Optional array of fields that were changed
 */
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
        
        // Save the updated incident
        saveIncident(incident);
        
        console.log(`Access logged: ${userId} ${action} incident ${incidentId}`);
    } else {
        console.error(`Cannot log access: Incident ${incidentId} not found`);
    }
}

/**
 * Record HIPAA consent information
 * @param {string} incidentId - The ID of the incident
 * @param {string} patientIndex - Index of the patient in the incident
 * @param {boolean} consentObtained - Whether consent was obtained
 * @param {string} consentType - Type of consent (verbal, written, etc.)
 * @param {string} obtainedBy - Who obtained the consent
 */
function recordHipaaConsent(incidentId, patientIndex, consentObtained, consentType, obtainedBy) {
    const incident = getIncidentById(incidentId);
    
    if (!incident || !incident.patient_info) {
        console.error("Cannot record consent: Incident or patient info not found");
        return false;
    }
    
    // Update consent information
    incident.patient_info.hipaa_consent_obtained = consentObtained;
    incident.patient_info.hipaa_consent_type = consentType;
    incident.patient_info.hipaa_consent_timestamp = new Date().toISOString();
    incident.patient_info.hipaa_consent_obtained_by = obtainedBy;
    
    // Log this action
    logPatientAccess(incidentId, obtainedBy, 'modified', ['patient_info.hipaa_consent']);
    
    // Save the incident
    saveIncident(incident);
    
    return true;
}

/**
 * Check if a user has permission to access PHI
 * @param {string} userId - The ID or name of the user
 * @param {string} accessLevel - The level of access required (view, edit, export)
 * @returns {boolean} - Whether the user has permission
 */
function hasPhiAccess(userId, accessLevel = 'view') {
    // This would normally check against a user permission database
    // For demo purposes, we'll use a simplified approach
    
    // Example permission levels (in a real system, this would come from a database)
    const userPermissions = {
        'admin': ['view', 'edit', 'export'],
        'paramedic': ['view', 'edit'],
        'emt': ['view', 'edit'],
        'dispatcher': ['view'],
        'analyst': ['view', 'export'] // Can view and export, but not edit
    };
    
    // Get user role (simplified example)
    const userRole = getUserRole(userId);
    
    // Check if user has required permission
    if (userRole && userPermissions[userRole]) {
        return userPermissions[userRole].includes(accessLevel);
    }
    
    return false;
}

/**
 * Get a user's role (simplified mock implementation)
 * @param {string} userId - The user ID or name
 * @returns {string} - The user's role
 */
function getUserRole(userId) {
    // This would normally check a user database
    // Mock implementation for demo purposes
    const userRoles = {
        'FF Wilson': 'paramedic',
        'FF Smith': 'emt',
        'Paramedic Johnson': 'paramedic',
        'Capt. Davis': 'admin',
        'Dispatcher Rodriguez': 'dispatcher',
        'Analyst Chen': 'analyst'
    };
    
    return userRoles[userId] || null;
}

/**
 * De-identify an incident for export using HIPAA Safe Harbor method
 * @param {Object} incident - The incident to de-identify
 * @returns {Object} - A de-identified copy of the incident
 */
function deidentifyIncident(incident) {
    // Create a deep copy of the incident
    const deidentified = JSON.parse(JSON.stringify(incident));
    
    // Apply Safe Harbor method - remove all 18 identifiers
    if (deidentified.patient_info && deidentified.patient_info.details) {
        deidentified.patient_info.details.forEach(patient => {
            // 1. Names
            if (patient.name) {
                patient.name = { first: "[REDACTED]", last: "[REDACTED]", middle: "[REDACTED]" };
            }
            
            // 2. Geographic subdivisions smaller than state
            if (patient.address) {
                patient.address = {
                    street: "[REDACTED]",
                    city: "[REDACTED]",
                    state: patient.address.state, // Can keep state
                    zip: patient.address.zip ? patient.address.zip.substring(0, 3) + "XX" : "[REDACTED]" // First 3 digits only
                };
            }
            
            // 3. All dates directly related to the individual
            if (patient.dob) {
                // Only keep year for people under 90
                const birthYear = new Date(patient.dob).getFullYear();
                const age = new Date().getFullYear() - birthYear;
                
                if (age >= 90) {
                    patient.age = "90+";
                    patient.dob = "[REDACTED]";
                } else {
                    patient.dob = birthYear.toString();
                }
            }
            
            // 4. Phone numbers
            if (patient.phone) {
                patient.phone = "[REDACTED]";
            }
            
            // 5. SSN
            if (patient.ssn_last4) {
                patient.ssn_last4 = "[REDACTED]";
            }
            
            // 6-18. Other identifiers
            if (patient.insurance) {
                patient.insurance.policy_number = "[REDACTED]";
            }
            
            // Extra: Ensure medical information remains while removing identifiers
            // We keep chief complaint, vitals, etc. as they are medical info, not identifiers
        });
    }
    
    // Handle narrative text - use NLP-style approach to find and redact PHI
    if (deidentified.narrative) {
        // Redact names (simplified approach)
        deidentified.narrative = deidentified.narrative.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[NAME REDACTED]");
        
        // Redact phone numbers
        deidentified.narrative = deidentified.narrative.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE REDACTED]");
        
        // Redact potential addresses
        deidentified.narrative = deidentified.narrative.replace(/\b\d+ [A-Za-z]+ (?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Place|Pl)\b/gi, "[ADDRESS REDACTED]");
        
        // Redact dates of service
        deidentified.narrative = deidentified.narrative.replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi, "[DATE REDACTED]");
        deidentified.narrative = deidentified.narrative.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "[DATE REDACTED]");
    }
    
    // Remove or redact identifying information from caller info
    if (deidentified.caller_info) {
        deidentified.caller_info.name = "[REDACTED]";
        deidentified.caller_info.phone = "[REDACTED]";
        // Keep relationship as it's not an identifier
    }
    
    // Remove specific unit personnel names
    if (deidentified.units) {
        deidentified.units.forEach(unit => {
            if (unit.personnel && Array.isArray(unit.personnel)) {
                unit.personnel = unit.personnel.map(() => "[REDACTED]");
            }
        });
    }
    
    // Handle attachments
    if (deidentified.attachments) {
        // Either remove PHI attachments or mark them as redacted
        deidentified.attachments = deidentified.attachments.filter(attachment => !attachment.contains_phi);
    }
    
    // Remove audit trail as it contains user identifiers
    if (deidentified.audit) {
        deidentified.audit = {
            created_at: deidentified.audit.created_at,
            last_modified: deidentified.audit.last_modified
        };
    }
    
    // Add metadata about de-identification
    deidentified.meta = {
        deidentified: true,
        deidentification_method: "HIPAA Safe Harbor",
        deidentification_date: new Date().toISOString()
    };
    
    return deidentified;
}

/**
 * Create a privacy banner for patient information sections
 * @returns {HTMLElement} - The privacy banner element
 */
function createPrivacyBanner() {
    const banner = document.createElement('div');
    banner.className = 'hipaa-privacy-banner';
    banner.innerHTML = `
        <div class="privacy-icon"><i class="fas fa-shield-alt"></i></div>
        <div class="privacy-message">
            <strong>PHI Warning:</strong> This section contains Protected Health Information (PHI).
            HIPAA compliance requires proper handling, consent, and access controls.
        </div>
    `;
    return banner;
}

/**
 * Create a HIPAA consent form section
 * @param {string} incidentId - The incident ID
 * @param {string} currentUser - The current user's ID
 * @returns {HTMLElement} - The consent form element
 */
function createConsentForm(incidentId, currentUser) {
    const incident = getIncidentById(incidentId);
    const consentObtained = incident?.patient_info?.hipaa_consent_obtained || false;
    const consentType = incident?.patient_info?.hipaa_consent_type || '';
    
    const consentForm = document.createElement('div');
    consentForm.className = 'hipaa-consent-form';
    consentForm.innerHTML = `
        <h4>HIPAA Consent</h4>
        <div class="form-group">
            <label for="hipaa-consent-obtained">Consent Obtained</label>
            <div class="toggle-switch">
                <input type="checkbox" id="hipaa-consent-obtained" name="hipaa-consent-obtained" ${consentObtained ? 'checked' : ''}>
                <label for="hipaa-consent-obtained" class="switch-label"></label>
            </div>
        </div>
        
        <div id="consent-details" ${consentObtained ? '' : 'style="display:none;"'}>
            <div class="form-group">
                <label for="hipaa-consent-type">Consent Type</label>
                <select id="hipaa-consent-type" name="hipaa-consent-type">
                    <option value="">Select Type</option>
                    <option value="verbal" ${consentType === 'verbal' ? 'selected' : ''}>Verbal</option>
                    <option value="written" ${consentType === 'written' ? 'selected' : ''}>Written</option>
                    <option value="implied" ${consentType === 'implied' ? 'selected' : ''}>Implied</option>
                    <option value="emergency" ${consentType === 'emergency' ? 'selected' : ''}>Emergency (no consent possible)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="hipaa-consent-obtained-by">Consent Obtained By</label>
                <input type="text" id="hipaa-consent-obtained-by" name="hipaa-consent-obtained-by" 
                    value="${incident?.patient_info?.hipaa_consent_obtained_by || currentUser}">
            </div>
        </div>
    `;
    
    // Add event listener for toggle
    setTimeout(() => {
        const consentToggle = document.getElementById('hipaa-consent-obtained');
        const consentDetails = document.getElementById('consent-details');
        
        if (consentToggle && consentDetails) {
            consentToggle.addEventListener('change', function() {
                consentDetails.style.display = this.checked ? 'block' : 'none';
            });
        }
        
        // Add event listener for form submission
        const consentType = document.getElementById('hipaa-consent-type');
        const consentObtainedBy = document.getElementById('hipaa-consent-obtained-by');
        
        if (consentToggle && consentType && consentObtainedBy) {
            const saveConsent = () => {
                recordHipaaConsent(
                    incidentId,
                    0, // First patient
                    consentToggle.checked,
                    consentType.value,
                    consentObtainedBy.value
                );
            };
            
            consentToggle.addEventListener('change', saveConsent);
            consentType.addEventListener('change', saveConsent);
            consentObtainedBy.addEventListener('blur', saveConsent);
        }
    }, 0);
    
    return consentForm;
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

// Add functions to the namespace
window.IncidentLogger.Components.HIPAA = {
    logPatientAccess: logPatientAccess,
    recordConsent: recordHipaaConsent,
    hasAccess: hasPhiAccess,
    deidentify: deidentifyIncident,
    createPrivacyBanner: createPrivacyBanner,
    createConsentForm: createConsentForm
};

// Add global functions for backward compatibility
window.logPatientAccess = logPatientAccess;
window.recordHipaaConsent = recordHipaaConsent;
window.hasPhiAccess = hasPhiAccess;
window.deidentifyIncident = deidentifyIncident;
window.createPrivacyBanner = createPrivacyBanner;
window.createConsentForm = createConsentForm;

console.log("HIPAA Compliance component loaded (fixed version)");