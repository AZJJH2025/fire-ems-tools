/**
 * HIPAA Compliance Module
 * 
 * This module provides HIPAA compliance functionality for the Incident Logger
 */

/**
 * Log access to patient information
 * @param {string} incidentId - Incident ID
 * @param {string} userId - User ID of person accessing
 * @param {string} action - Type of access (view, modify, export)
 * @param {Array|Object} fieldsChanged - Fields that were changed (for modification)
 * @returns {boolean} - Whether the access was successfully logged
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
    
    // Save the incident
    saveIncident(incident);
    
    return true;
  }
  
  console.error(`Could not log access for incident ${incidentId}: Incident not found`);
  return false;
}

/**
 * Check if the current user has PHI access
 * @returns {boolean} - Whether the user has access
 */
function hasPhiAccess() {
  // Get user role from localStorage or use 'basic' as default
  const userRole = localStorage.getItem('user_role') || 'basic';
  
  // Only users with clinical roles can access PHI
  const clinicalRoles = ['paramedic', 'emt', 'doctor', 'nurse', 'admin'];
  
  return clinicalRoles.includes(userRole);
}

/**
 * De-identify an incident for data sharing
 * @param {Object} incident - The incident to de-identify
 * @returns {Object} - De-identified incident object
 */
function deidentifyIncident(incident) {
  // Create a deep copy of the incident to avoid modifying the original
  const deidentified = JSON.parse(JSON.stringify(incident));
  
  // Add metadata about de-identification
  deidentified.meta = {
    ...deidentified.meta,
    deidentified: true,
    deidentification_date: new Date().toISOString(),
    deidentification_method: 'HIPAA Safe Harbor'
  };
  
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

/**
 * Record patient consent
 * @param {string} incidentId - Incident ID
 * @param {number} patientIndex - Index of patient
 * @param {Object} consentData - Consent data
 * @returns {boolean} - Whether consent was successfully recorded
 */
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

/**
 * Create a privacy banner for the UI
 * @returns {HTMLElement} - The banner element
 */
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

/**
 * Create a consent form for the patient
 * @param {number} patientIndex - Index of patient
 * @returns {HTMLElement} - The consent form element
 */
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

/**
 * Get an age range from an exact age
 * @param {number} age - The exact age
 * @returns {string} - Age range
 */
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

/**
 * Get an incident by ID
 * @param {string} incidentId - Incident ID
 * @returns {Object|null} - The incident object or null if not found
 */
function getIncidentById(incidentId) {
  // In a real implementation, this would fetch from storage or API
  // For now we'll use the current incident or try to fetch from localStorage
  if (window.currentIncident && window.currentIncident.id === incidentId) {
    return window.currentIncident;
  }
  
  // Try to get from localStorage
  try {
    const incident = localStorage.getItem(`incident_draft_${incidentId}`) || 
                     localStorage.getItem(`incident_submitted_${incidentId}`);
    
    if (incident) {
      return JSON.parse(incident);
    }
  } catch (error) {
    console.error(`Error loading incident ${incidentId}:`, error);
  }
  
  return null;
}

/**
 * Save an incident
 * @param {Object} incident - Incident object to save
 */
function saveIncident(incident) {
  // In a real implementation, this would save to storage or API
  // For now we'll just update the window variable and localStorage
  window.currentIncident = incident;
  
  try {
    localStorage.setItem(`incident_draft_${incident.id}`, JSON.stringify(incident));
    console.log(`Saved incident ${incident.id} to localStorage`);
  } catch (error) {
    console.error(`Error saving incident ${incident.id}:`, error);
  }
}

// Export the HIPAA compliance functions
export const HIPAACompliance = {
  logAccess: logPatientAccess,
  hasAccess: hasPhiAccess,
  deidentify: deidentifyIncident,
  recordConsent: recordHipaaConsent,
  createBanner: createPrivacyBanner,
  createConsentForm: createConsentForm
};