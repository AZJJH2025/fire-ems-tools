/**
 * Standalone Medical Section Fix
 * 
 * This is a combined script that includes all the fixes for medical sections
 * in a single file without requiring webpack or module bundling.
 */

(function() {
  console.log("Standalone Medical Section Fix loaded");
  
  // Create namespace if it doesn't exist
  window.FireEMS = window.FireEMS || {};
  window.FireEMS.MedicalFix = {};
  
  // Storage utility functions
  const Storage = {
    // Save data to localStorage with error handling
    save(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(`Error saving to localStorage (key=${key}):`, error);
        return false;
      }
    },
    
    // Get data from localStorage with error handling
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
      } catch (error) {
        console.error(`Error reading from localStorage (key=${key}):`, error);
        return defaultValue;
      }
    },
    
    // Get all keys matching a pattern
    getKeysMatching(pattern) {
      const keys = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (pattern.test(key)) {
            keys.push(key);
          }
        }
      } catch (error) {
        console.error(`Error getting keys matching pattern:`, error);
      }
      return keys;
    },
    
    // Get all incident drafts
    getAllIncidentDrafts() {
      const draftPattern = /^incident_draft_/;
      const keys = this.getKeysMatching(draftPattern);
      
      const drafts = [];
      keys.forEach(key => {
        const draft = this.get(key);
        if (draft) {
          drafts.push({
            key: key,
            data: draft,
            timestamp: draft.timestamp || new Date().toISOString()
          });
        }
      });
      
      return drafts.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }
  };
  
  // Toast notification helper
  const Toast = {
    show(message, type = 'info') {
      console.log(`TOAST [${type}]: ${message}`);
      
      // If toast function exists in global scope, use it
      if (typeof showToast === 'function') {
        showToast(message, type);
        return;
      }
      
      // Otherwise create a simple toast element
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      // Style the toast
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        background: type === 'error' ? '#f44336' : '#4CAF50',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });
      
      // Add to document
      document.body.appendChild(toast);
      
      // Fade in
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);
      
      // Auto remove
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  };
  
  // Medical section fix module
  const MedicalSectionFix = {
    // Initialize the fix
    initialize() {
      console.log("Initializing Medical Section Fix");
      this.attachEventListeners();
      
      // Run fix with a delay to ensure DOM is fully loaded
      setTimeout(() => {
        this.checkAndFixMedicalSections();
      }, 1000);
      
      // Expose global function for manual fixing
      window.fixMissingMedicalSections = () => {
        this.checkAndFixMedicalSections();
      };
      
      // Store on namespace
      window.FireEMS.MedicalFix = this;
    },
    
    // Attach event listeners for dynamic content
    attachEventListeners() {
      // Listen for add patient button clicks
      document.addEventListener('click', event => {
        if (event.target && (
            event.target.id === 'add-patient-btn' || 
            event.target.classList.contains('add-patient-btn')
        )) {
          console.log("Add Patient button clicked, will fix in 1 second");
          setTimeout(() => {
            this.checkAndFixMedicalSections();
          }, 1000);
        }
      });
      
      // Listen for custom event that might be triggered when patient is added
      document.addEventListener('patientAdded', () => {
        console.log("Patient added event detected, fixing medical sections");
        setTimeout(() => {
          this.checkAndFixMedicalSections();
        }, 500);
      });
    },
    
    // Check and fix all patient entries
    checkAndFixMedicalSections() {
      console.log("Checking and fixing medical sections");
      const patientEntries = document.querySelectorAll('.patient-entry');
      console.log(`Found ${patientEntries.length} patient entries`);
      
      let fixedCount = 0;
      
      patientEntries.forEach((patientEntry, index) => {
        const patientId = index + 1;
        
        // Skip if already has medical sections
        if (patientEntry.querySelector('.medical-section-added') || 
            patientEntry.querySelector('.medical-history-container')) {
          console.log(`Patient #${patientId} already has medical sections`);
          return;
        }
        
        console.log(`Adding medical sections to patient #${patientId}`);
        this.addMedicalSectionsToPatient(patientEntry, patientId);
        fixedCount++;
      });
      
      // Initialize Select2 if needed
      this.initializeSelect2();
      
      if (fixedCount > 0) {
        Toast.show(`Fixed medical sections for ${fixedCount} patient(s)`, 'success');
      }
      
      return fixedCount;
    },
    
    // Add medical sections to a specific patient
    addMedicalSectionsToPatient(patientEntry, patientId) {
      // Define medical history options
      const medicalHistoryOptions = `
        <option value="hypertension">Hypertension</option>
        <option value="diabetes">Diabetes</option>
        <option value="asthma">Asthma</option>
        <option value="copd">COPD</option>
        <option value="chf">Congestive Heart Failure</option>
        <option value="cad">Coronary Artery Disease</option>
        <option value="mi">Prior MI</option>
        <option value="stroke">Prior Stroke</option>
        <option value="seizure">Seizure Disorder</option>
        <option value="cancer">Cancer</option>
        <option value="renal">Renal Disease</option>
        <option value="psychiatric">Psychiatric Disorder</option>
        <option value="alzheimers">Alzheimer's/Dementia</option>
        <option value="substance">Substance Use Disorder</option>
      `;
      
      // Define medication options
      const medicationOptions = `
        <option value="aspirin">Aspirin</option>
        <option value="plavix">Plavix (Clopidogrel)</option>
        <option value="warfarin">Warfarin (Coumadin)</option>
        <option value="xarelto">Xarelto (Rivaroxaban)</option>
        <option value="eliquis">Eliquis (Apixaban)</option>
        <option value="metoprolol">Metoprolol</option>
        <option value="atenolol">Atenolol</option>
        <option value="lisinopril">Lisinopril</option>
        <option value="losartan">Losartan</option>
        <option value="amlodipine">Amlodipine</option>
        <option value="hydrochlorothiazide">Hydrochlorothiazide</option>
        <option value="furosemide">Furosemide (Lasix)</option>
        <option value="metformin">Metformin</option>
        <option value="insulin">Insulin</option>
        <option value="albuterol">Albuterol</option>
        <option value="prednisone">Prednisone</option>
        <option value="levothyroxine">Levothyroxine (Synthroid)</option>
        <option value="acetaminophen">Acetaminophen (Tylenol)</option>
        <option value="ibuprofen">Ibuprofen (Advil, Motrin)</option>
        <option value="omeprazole">Omeprazole (Prilosec)</option>
        <option value="gabapentin">Gabapentin (Neurontin)</option>
        <option value="oxycodone">Oxycodone</option>
      `;
      
      // Define allergy options
      const allergyOptions = `
        <option value="penicillin">Penicillin</option>
        <option value="sulfa">Sulfa Drugs</option>
        <option value="cephalosporins">Cephalosporins</option>
        <option value="nsaids">NSAIDs</option>
        <option value="aspirin">Aspirin</option>
        <option value="morphine">Morphine</option>
        <option value="codeine">Codeine</option>
        <option value="iodine">Iodine/Contrast Dye</option>
        <option value="latex">Latex</option>
        <option value="eggs">Eggs</option>
        <option value="nuts">Tree Nuts</option>
        <option value="peanuts">Peanuts</option>
        <option value="shellfish">Shellfish</option>
        <option value="soy">Soy</option>
        <option value="wheat">Wheat</option>
      `;
      
      // Create the HTML for medical sections
      const sectionsHTML = `
        <\!-- Medical History Section -->
        <div class="form-section medical-section-added" data-patient="${patientId}">
          <h5>Medical History</h5>
          <div class="medical-history-container">
            <div class="form-group">
              <label for="medical-history-${patientId}">Past Medical History</label>
              <select id="medical-history-${patientId}" name="patient-medical-history-${patientId}" class="medical-history-select" multiple>
                ${medicalHistoryOptions}
              </select>
            </div>
          </div>
        </div>
        
        <\!-- Medications Section -->
        <div class="form-section medical-section-added" data-patient="${patientId}">
          <h5>Medications</h5>
          <div class="medications-container">
            <div class="form-group">
              <label for="medications-${patientId}">Current Medications</label>
              <select id="medications-${patientId}" name="patient-medications-${patientId}" class="medications-select" multiple>
                ${medicationOptions}
              </select>
            </div>
          </div>
        </div>
        
        <\!-- Allergies Section -->
        <div class="form-section medical-section-added" data-patient="${patientId}">
          <h5>Allergies</h5>
          <div class="allergies-container">
            <div class="form-group">
              <div class="nkda-checkbox">
                <input type="checkbox" id="nkda-${patientId}" name="patient-nkda-${patientId}">
                <label for="nkda-${patientId}">NKDA (No Known Drug Allergies)</label>
              </div>
            </div>
            <div class="form-group allergy-select-group">
              <label for="allergies-${patientId}">Allergies</label>
              <select id="allergies-${patientId}" name="patient-allergies-${patientId}" class="allergies-select" multiple>
                ${allergyOptions}
              </select>
            </div>
          </div>
        </div>
      `;
      
      // Find the insertion point
      const phiSection = patientEntry.querySelector('.phi-section');
      const basicInfo = patientEntry.querySelector('.patient-basic-info');
      const vitalsSection = patientEntry.querySelector('.vitals-section');
      
      let insertionPoint;
      let insertMethod = 'afterend';
      
      if (phiSection) {
        insertionPoint = phiSection;
        console.log(`Using PHI section as insertion point for patient #${patientId}`);
      } else if (basicInfo) {
        insertionPoint = basicInfo;
        console.log(`Using basic info as insertion point for patient #${patientId}`);
      } else if (vitalsSection) {
        insertionPoint = vitalsSection;
        insertMethod = 'beforebegin';
        console.log(`Using vitals section as insertion point for patient #${patientId}`);
      } else {
        // Fallback - just add to the end
        insertionPoint = patientEntry;
        insertMethod = 'beforeend';
        console.log(`No insertion point found, appending to patient #${patientId}`);
      }
      
      // Insert the sections
      insertionPoint.insertAdjacentHTML(insertMethod, sectionsHTML);
      console.log(`Added medical sections to patient #${patientId}`);
      
      // Attach NKDA checkbox handler
      const nkdaCheckbox = document.getElementById(`nkda-${patientId}`);
      if (nkdaCheckbox) {
        nkdaCheckbox.addEventListener('change', function() {
          const allergySelect = document.getElementById(`allergies-${patientId}`);
          if (this.checked && allergySelect) {
            // Clear allergies when NKDA is checked
            if (typeof $ \!== 'undefined' && $.fn && $.fn.select2) {
              $(allergySelect).val(null).trigger('change');
            } else {
              // Vanilla JS fallback
              for (let i = 0; i < allergySelect.options.length; i++) {
                allergySelect.options[i].selected = false;
              }
            }
            allergySelect.disabled = true;
            allergySelect.closest('.allergy-select-group').style.opacity = '0.5';
          } else if (allergySelect) {
            allergySelect.disabled = false;
            allergySelect.closest('.allergy-select-group').style.opacity = '1';
          }
        });
      }
    },
    
    // Initialize Select2 for enhanced dropdowns
    initializeSelect2() {
      if (typeof $ \!== 'undefined' && $.fn && $.fn.select2) {
        console.log("Initializing Select2 for medical selects");
        
        try {
          $('.medical-history-select, .medications-select, .allergies-select').select2({
            placeholder: 'Select or type here...',
            tags: true,
            width: '100%'
          });
          console.log("Select2 initialized successfully");
        } catch (error) {
          console.error("Error initializing Select2:", error);
        }
      } else {
        console.log("Select2 not available, skipping enhanced dropdown initialization");
      }
    },
    
    // Update an existing incident in localStorage with fixed structure
    fixIncidentData(incidentId) {
      const key = `incident_draft_${incidentId}`;
      const incident = Storage.get(key);
      
      if (\!incident) {
        console.log(`No incident found with ID: ${incidentId}`);
        return false;
      }
      
      console.log(`Fixing incident data structure for ID: ${incidentId}`);
      
      // Ensure patients array exists
      if (\!incident.patients || \!Array.isArray(incident.patients)) {
        incident.patients = [];
      }
      
      // Fix each patient's medical data
      incident.patients.forEach((patient, index) => {
        // Ensure medical data structure
        if (\!patient.medical_history) patient.medical_history = [];
        if (\!patient.medications) patient.medications = [];
        if (\!patient.allergies) patient.allergies = [];
        if (typeof patient.nkda === 'undefined') patient.nkda = false;
        
        console.log(`Fixed medical data structure for patient #${index + 1}`);
      });
      
      // Save back to storage
      const saved = Storage.save(key, incident);
      if (saved) {
        console.log(`Successfully saved fixed incident data for ID: ${incidentId}`);
        return true;
      } else {
        console.error(`Failed to save fixed incident data for ID: ${incidentId}`);
        return false;
      }
    },
    
    // Fix all drafts in localStorage
    fixAllDrafts() {
      const drafts = Storage.getAllIncidentDrafts();
      console.log(`Found ${drafts.length} incident drafts`);
      
      let fixedCount = 0;
      
      drafts.forEach(draft => {
        const incidentId = draft.key.replace('incident_draft_', '');
        const fixed = this.fixIncidentData(incidentId);
        if (fixed) fixedCount++;
      });
      
      if (fixedCount > 0) {
        Toast.show(`Fixed data structure for ${fixedCount} incident drafts`, 'success');
      }
      
      return fixedCount;
    }
  };
  
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(function() {
      MedicalSectionFix.initialize();
    }, 500);
  });
  
  // Export to global namespace for legacy code
  window.FireEMS.Storage = Storage;
  window.FireEMS.Toast = Toast;
  window.FireEMS.MedicalSectionFix = MedicalSectionFix;
  
  // Allow jQuery-less operation
  if (typeof $ === 'undefined') {
    console.log('jQuery not detected, using vanilla JS fallbacks');
  }
})();
