/**
 * Components Bundle (Manual Build)
 * 
 * This is a manually built bundle for the ES6 module components
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function() {
  // Storage utility module
  const Storage = {
    save(key, data, isTemporary = false) {
      try {
        const serialized = JSON.stringify(data);
        if (isTemporary) {
          sessionStorage.setItem(key, serialized);
        } else {
          localStorage.setItem(key, serialized);
        }
        return true;
      } catch (error) {
        console.error(`Error saving data to ${isTemporary ? 'session' : 'local'} storage:`, error);
        return false;
      }
    },

    load(key, defaultValue = null, isTemporary = false) {
      try {
        const storage = isTemporary ? sessionStorage : localStorage;
        const serialized = storage.getItem(key);
        
        if (serialized === null) {
          return defaultValue;
        }
        
        return JSON.parse(serialized);
      } catch (error) {
        console.error(`Error loading data from ${isTemporary ? 'session' : 'local'} storage:`, error);
        return defaultValue;
      }
    },

    remove(key, isTemporary = false) {
      try {
        if (isTemporary) {
          sessionStorage.removeItem(key);
        } else {
          localStorage.removeItem(key);
        }
        return true;
      } catch (error) {
        console.error(`Error removing data from ${isTemporary ? 'session' : 'local'} storage:`, error);
        return false;
      }
    },

    exists(key, isTemporary = false) {
      const storage = isTemporary ? sessionStorage : localStorage;
      return storage.getItem(key) !== null;
    },

    getKeysMatching(pattern, isTemporary = false) {
      const storage = isTemporary ? sessionStorage : localStorage;
      const keys = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (pattern.test(key)) {
          keys.push(key);
        }
      }
      
      return keys;
    },

    getAllIncidents() {
      const incidents = [];
      const draftKeys = this.getKeysMatching(/^incident_draft_/);
      const submittedKeys = this.getKeysMatching(/^incident_submitted_/);
      
      // Add draft incidents
      draftKeys.forEach(key => {
        const incident = this.load(key);
        if (incident) {
          incidents.push({...incident, is_draft: true});
        }
      });
      
      // Add submitted incidents
      submittedKeys.forEach(key => {
        const incident = this.load(key);
        if (incident) {
          incidents.push({...incident, is_draft: false});
        }
      });
      
      return incidents;
    }
  };

  // Toast utility (for notifications)
  const Toast = {
    show(message, type = 'info', duration = 3000) {
      // Create toast container if it doesn't exist
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
      
      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <div class="toast-content">
          <i class="toast-icon fas fa-${this.getIconForType(type)}"></i>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
      `;
      
      // Add to container
      container.appendChild(toast);
      
      // Show animation
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      // Hide after duration
      const hideTimeout = setTimeout(() => {
        this.hideToast(toast);
      }, duration);
      
      // Close button handler
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          clearTimeout(hideTimeout);
          this.hideToast(toast);
        });
      }
    },
    
    hideToast(toast) {
      toast.classList.remove('show');
      toast.classList.add('hide');
      
      // Remove after animation completes
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    },
    
    getIconForType(type) {
      switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': default: return 'info-circle';
      }
    }
  };

  // Modal utility
  const Modal = {
    show(title, content, onCancel, onConfirm) {
      // Create modal container if it doesn't exist
      let modalContainer = document.getElementById('modal-container');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
      }
      
      // Create modal element
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3>${title}</h3>
            <button id="modal-close" class="modal-close">&times;</button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button id="modal-cancel" class="secondary-btn">Cancel</button>
            <button id="modal-confirm" class="primary-btn">Confirm</button>
          </div>
        </div>
      `;
      
      // Add the content
      if (typeof content === 'string') {
        modal.querySelector('.modal-body').innerHTML = content;
      } else if (content instanceof HTMLElement) {
        modal.querySelector('.modal-body').appendChild(content);
      }
      
      // Add to container
      modalContainer.innerHTML = '';
      modalContainer.appendChild(modal);
      modalContainer.style.display = 'flex';
      
      // Attach close handlers
      const closeBtn = document.getElementById('modal-close');
      const cancelBtn = document.getElementById('modal-cancel');
      const confirmBtn = document.getElementById('modal-confirm');
      
      const closeModal = () => {
        modalContainer.style.display = 'none';
        if (onCancel && typeof onCancel === 'function') {
          onCancel();
        }
      };
      
      closeBtn.addEventListener('click', closeModal);
      cancelBtn.addEventListener('click', closeModal);
      
      confirmBtn.addEventListener('click', () => {
        modalContainer.style.display = 'none';
        if (onConfirm && typeof onConfirm === 'function') {
          onConfirm();
        }
      });
    },
    
    close() {
      const modalContainer = document.getElementById('modal-container');
      if (modalContainer) {
        modalContainer.style.display = 'none';
      }
    },
    
    confirm(title, message, onConfirm, onCancel) {
      this.show(title, `<p>${message}</p>`, onCancel, onConfirm);
    }
  };

  // MedicalSectionsManager class
  class MedicalSectionsManager {
    constructor() {
      // Medical history options - standard list
      this.medicalHistoryOptions = [
        { value: "hypertension", label: "Hypertension" },
        { value: "diabetes", label: "Diabetes" },
        { value: "asthma", label: "Asthma" },
        { value: "copd", label: "COPD" },
        { value: "chf", label: "Congestive Heart Failure" },
        { value: "cad", label: "Coronary Artery Disease" },
        { value: "mi", label: "Prior MI" },
        { value: "stroke", label: "Prior Stroke" },
        { value: "seizure", label: "Seizure Disorder" },
        { value: "cancer", label: "Cancer" },
        { value: "renal", label: "Renal Disease" },
        { value: "psychiatric", label: "Psychiatric Disorder" },
        { value: "alzheimers", label: "Alzheimer's/Dementia" },
        { value: "substance", label: "Substance Use Disorder" }
      ];
      
      // Medication options - standard list
      this.medicationOptions = [
        { value: "aspirin", label: "Aspirin" },
        { value: "plavix", label: "Plavix (Clopidogrel)" },
        { value: "warfarin", label: "Warfarin (Coumadin)" },
        { value: "xarelto", label: "Xarelto (Rivaroxaban)" },
        { value: "eliquis", label: "Eliquis (Apixaban)" },
        { value: "metoprolol", label: "Metoprolol" },
        { value: "atenolol", label: "Atenolol" },
        { value: "lisinopril", label: "Lisinopril" },
        { value: "losartan", label: "Losartan" },
        { value: "amlodipine", label: "Amlodipine" },
        { value: "hydrochlorothiazide", label: "Hydrochlorothiazide" },
        { value: "furosemide", label: "Furosemide (Lasix)" },
        { value: "metformin", label: "Metformin" },
        { value: "insulin", label: "Insulin" },
        { value: "albuterol", label: "Albuterol" },
        { value: "prednisone", label: "Prednisone" },
        { value: "levothyroxine", label: "Levothyroxine (Synthroid)" },
        { value: "acetaminophen", label: "Acetaminophen (Tylenol)" },
        { value: "ibuprofen", label: "Ibuprofen (Advil, Motrin)" },
        { value: "omeprazole", label: "Omeprazole (Prilosec)" },
        { value: "gabapentin", label: "Gabapentin (Neurontin)" },
        { value: "oxycodone", label: "Oxycodone" }
      ];
      
      // Allergy options - standard list
      this.allergyOptions = [
        { value: "penicillin", label: "Penicillin" },
        { value: "sulfa", label: "Sulfa Drugs" },
        { value: "cephalosporins", label: "Cephalosporins" },
        { value: "nsaids", label: "NSAIDs" },
        { value: "aspirin", label: "Aspirin" },
        { value: "morphine", label: "Morphine" },
        { value: "codeine", label: "Codeine" },
        { value: "iodine", label: "Iodine/Contrast Dye" },
        { value: "latex", label: "Latex" },
        { value: "eggs", label: "Eggs" },
        { value: "nuts", label: "Tree Nuts" },
        { value: "peanuts", label: "Peanuts" },
        { value: "shellfish", label: "Shellfish" },
        { value: "soy", label: "Soy" },
        { value: "wheat", label: "Wheat" }
      ];
      
      // Event flag to check if already initialized
      this.isInitialized = false;
    }
    
    initialize() {
      if (this.isInitialized) {
        console.log('Medical Sections Manager already initialized');
        return;
      }
      
      // Set up event listeners for patient management
      this.setupEventListeners();
      
      // Run an initial check for existing patients
      this.checkAndFixMedicalSections();
      
      this.isInitialized = true;
      console.log('Medical Sections Manager initialized');
    }
    
    setupEventListeners() {
      // Listen for DOM content loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.checkAndFixMedicalSections());
      } else {
        // DOM already loaded, check medical sections
        setTimeout(() => this.checkAndFixMedicalSections(), 500);
      }
      
      // Listen for Add Patient button clicks
      document.addEventListener('click', event => {
        if (event.target && (
            event.target.id === 'add-patient-btn' || 
            event.target.classList.contains('add-patient-btn')
        )) {
          console.log("Add Patient button clicked, will fix medical sections shortly");
          setTimeout(() => this.checkAndFixMedicalSections(), 500);
        }
      });
      
      // Custom event for when a patient is programmatically added
      document.addEventListener('patientAdded', () => {
        console.log("Patient added event detected");
        setTimeout(() => this.checkAndFixMedicalSections(), 300);
      });
    }
    
    checkAndFixMedicalSections() {
      console.log('Checking for missing medical sections');
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
      
      console.log(`Fixed medical sections for ${fixedCount} patient(s)`);
      return fixedCount;
    }
    
    addMedicalSectionsToPatient(patientEntry, patientId) {
      // Create HTML for medical history options
      const medicalHistoryOptionsHTML = this.medicalHistoryOptions
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');
      
      // Create HTML for medication options
      const medicationOptionsHTML = this.medicationOptions
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');
      
      // Create HTML for allergy options
      const allergyOptionsHTML = this.allergyOptions
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');
      
      // Create the HTML for medical sections
      const sectionsHTML = `
        <!-- Medical History Section -->
        <div class="form-section medical-section-added" data-patient="${patientId}">
          <h5>Medical History</h5>
          <div class="medical-history-container">
            <div class="form-group">
              <label for="medical-history-${patientId}">Past Medical History</label>
              <select id="medical-history-${patientId}" name="patient-medical-history-${patientId}" class="medical-history-select" multiple>
                ${medicalHistoryOptionsHTML}
              </select>
              <small class="field-help">Select multiple or type to add custom conditions</small>
            </div>
          </div>
        </div>
        
        <!-- Medications Section -->
        <div class="form-section medical-section-added" data-patient="${patientId}">
          <h5>Medications</h5>
          <div class="medications-container">
            <div class="form-group">
              <label for="medications-${patientId}">Current Medications</label>
              <select id="medications-${patientId}" name="patient-medications-${patientId}" class="medications-select" multiple>
                ${medicationOptionsHTML}
              </select>
              <small class="field-help">Select multiple or type to add custom medications</small>
            </div>
          </div>
        </div>
        
        <!-- Allergies Section -->
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
                ${allergyOptionsHTML}
              </select>
              <small class="field-help">Select multiple or type to add custom allergies</small>
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
      this.setupNKDACheckbox(patientId);
    }
    
    setupNKDACheckbox(patientId) {
      const nkdaCheckbox = document.getElementById(`nkda-${patientId}`);
      if (!nkdaCheckbox) return;
      
      nkdaCheckbox.addEventListener('change', function() {
        const allergySelect = document.getElementById(`allergies-${patientId}`);
        if (!allergySelect) return;
        
        if (this.checked) {
          // Clear allergies when NKDA is checked
          if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
            $(allergySelect).val(null).trigger('change');
          } else {
            // Vanilla JS fallback
            for (let i = 0; i < allergySelect.options.length; i++) {
              allergySelect.options[i].selected = false;
            }
          }
          allergySelect.disabled = true;
          const allergyGroup = allergySelect.closest('.allergy-select-group');
          if (allergyGroup) {
            allergyGroup.style.opacity = '0.5';
          }
        } else {
          // Enable allergies when NKDA is unchecked
          allergySelect.disabled = false;
          const allergyGroup = allergySelect.closest('.allergy-select-group');
          if (allergyGroup) {
            allergyGroup.style.opacity = '1';
          }
        }
      });
    }
    
    initializeSelect2() {
      if (typeof $ === 'undefined' || !$.fn || !$.fn.select2) {
        console.log('Select2 not available, using standard dropdowns');
        return;
      }
      
      console.log('Initializing Select2 for medical dropdowns');
      
      try {
        $('.medical-history-select').select2({
          placeholder: 'Select or type here...',
          tags: true,
          width: '100%'
        });
        
        $('.medications-select').select2({
          placeholder: 'Select or type here...',
          tags: true,
          width: '100%'
        });
        
        $('.allergies-select').select2({
          placeholder: 'Select or type here...',
          tags: true,
          width: '100%'
        });
        
        console.log('Select2 initialized successfully');
      } catch (error) {
        console.error('Error initializing Select2:', error);
      }
    }
    
    getMedicalData(patientId) {
      const data = {
        medical_history: [],
        medications: [],
        allergies: [],
        nkda: false
      };
      
      // Medical history
      const medicalHistorySelect = document.getElementById(`medical-history-${patientId}`);
      if (medicalHistorySelect) {
        Array.from(medicalHistorySelect.selectedOptions).forEach(option => {
          data.medical_history.push(option.value);
        });
      }
      
      // Medications
      const medicationsSelect = document.getElementById(`medications-${patientId}`);
      if (medicationsSelect) {
        Array.from(medicationsSelect.selectedOptions).forEach(option => {
          data.medications.push(option.value);
        });
      }
      
      // NKDA
      const nkdaCheckbox = document.getElementById(`nkda-${patientId}`);
      if (nkdaCheckbox) {
        data.nkda = nkdaCheckbox.checked;
      }
      
      // Allergies
      const allergiesSelect = document.getElementById(`allergies-${patientId}`);
      if (allergiesSelect && !data.nkda) {
        Array.from(allergiesSelect.selectedOptions).forEach(option => {
          data.allergies.push(option.value);
        });
      }
      
      return data;
    }
    
    setMedicalData(patientId, data) {
      if (!data) return;
      
      // Medical history
      const medicalHistorySelect = document.getElementById(`medical-history-${patientId}`);
      if (medicalHistorySelect && data.medical_history) {
        this.setSelectValues(medicalHistorySelect, data.medical_history);
      }
      
      // Medications
      const medicationsSelect = document.getElementById(`medications-${patientId}`);
      if (medicationsSelect && data.medications) {
        this.setSelectValues(medicationsSelect, data.medications);
      }
      
      // NKDA & Allergies
      const nkdaCheckbox = document.getElementById(`nkda-${patientId}`);
      const allergiesSelect = document.getElementById(`allergies-${patientId}`);
      
      if (nkdaCheckbox) {
        nkdaCheckbox.checked = data.nkda || false;
        
        // Trigger the change event to update the UI
        const event = new Event('change');
        nkdaCheckbox.dispatchEvent(event);
      }
      
      // Only set allergies if NKDA is not checked
      if (allergiesSelect && data.allergies && !data.nkda) {
        this.setSelectValues(allergiesSelect, data.allergies);
      }
    }
    
    setSelectValues(selectElement, values) {
      if (!Array.isArray(values)) return;
      
      // Reset current selection
      for (let i = 0; i < selectElement.options.length; i++) {
        selectElement.options[i].selected = false;
      }
      
      // Set new values
      values.forEach(value => {
        // Check if option exists
        let option = Array.from(selectElement.options).find(opt => opt.value === value);
        
        // If not, create it (if select supports tags)
        if (!option && selectElement.classList.contains('medical-history-select') || 
            selectElement.classList.contains('medications-select') || 
            selectElement.classList.contains('allergies-select')) {
          option = new Option(value, value);
          selectElement.add(option);
        }
        
        // Select the option if it exists
        if (option) {
          option.selected = true;
        }
      });
      
      // Trigger change event for Select2
      if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
        $(selectElement).trigger('change');
      }
    }
  }

  // Create HIPAACompliance component (placeholder for the actual implementation)
  const HIPAACompliance = {
    validateData(data) {
      console.log('HIPAA Compliance validation running');
      return true;
    },
    
    sanitizeData(data) {
      console.log('HIPAA Compliance data sanitization');
      return data;
    },
    
    hasConsent() {
      return localStorage.getItem('hipaa_consent') === 'true';
    },
    
    getPatientConsent() {
      if (this.hasConsent()) {
        return Promise.resolve(true);
      }
      
      return new Promise((resolve) => {
        Modal.confirm(
          'HIPAA Consent Required',
          'This application collects Protected Health Information (PHI). ' +
          'By clicking Confirm, you acknowledge that you have patient consent to collect this information.',
          () => {
            localStorage.setItem('hipaa_consent', 'true');
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      });
    }
  };

  // Create CADIntegration component (placeholder for the actual implementation)
  const CADIntegration = {
    isAvailable: false,
    
    initialize() {
      this.isAvailable = !!localStorage.getItem('cad_integration_available');
      console.log(`CAD integration ${this.isAvailable ? 'is' : 'is not'} available`);
    },
    
    fetchIncidentData(incidentId) {
      if (!this.isAvailable) {
        return Promise.reject(new Error('CAD integration not available'));
      }
      
      // Simulate CAD data lookup
      console.log(`Fetching CAD data for incident ${incidentId}`);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            incident_id: incidentId,
            cad_number: `CAD-${Math.floor(100000 + Math.random() * 900000)}`,
            dispatch_time: new Date().toISOString(),
            location: {
              address: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zip: '90210'
            },
            caller_info: {
              name: 'John Doe',
              phone: '555-123-4567',
              relationship: 'Bystander'
            },
            units: ['E12', 'M7', 'BC3'],
            nature: 'Medical Emergency'
          });
        }, 500);
      });
    }
  };

  // Create an instance of MedicalSectionsManager
  const medicalSections = new MedicalSectionsManager();

  // Create a simple IncidentValidator (placeholder for now)
  const IncidentValidator = {
    validate(incident) {
      console.log('Validating incident...');
      
      // Add basic validation logic
      const errors = [];
      
      if (!incident) {
        errors.push({ field: 'incident', message: 'Incident data is required' });
        return { valid: false, errors };
      }
      
      if (!incident.incident_type || !incident.incident_type.primary) {
        errors.push({ field: 'incident-primary-type', message: 'Primary incident type is required' });
      }
      
      if (!incident.location || !incident.location.address) {
        errors.push({ field: 'incident-address', message: 'Incident address is required' });
      }
      
      if (!incident.narrative || incident.narrative.length < 20) {
        errors.push({ field: 'incident-narrative', message: 'Narrative must be at least 20 characters' });
      }
      
      return { valid: errors.length === 0, errors };
    }
  };

  // Create empty placeholders for yet-to-implement components
  const IncidentExport = {
    exportAs(incident, format) {
      console.log(`Exporting incident ${incident.id} as ${format}`);
      return Promise.resolve(`Incident data exported as ${format}`);
    }
  };

  const IncidentMap = {
    initialize() {
      console.log('Incident map initialized');
    },
    showLocation(lat, lng) {
      console.log(`Showing location: ${lat}, ${lng}`);
    }
  };

  const IncidentList = {
    initialize() {
      console.log('Incident list initialized');
    },
    loadIncidents() {
      return Storage.getAllIncidents();
    }
  };

  // Simplified IncidentForm for the bundle
  const IncidentForm = {
    initialize() {
      console.log('Incident form initialized via bundle');
      
      // Check if we need to add medical sections
      document.addEventListener('DOMContentLoaded', () => {
        // Initialize medical sections
        if (medicalSections) {
          medicalSections.initialize();
        }
        
        // Initialize other form features
        this.setupEventListeners();
      });
    },
    
    setupEventListeners() {
      console.log('Setting up form event listeners');
      
      // Add basic form submit handler
      const form = document.getElementById('incident-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          console.log('Form submission handled');
          
          // Show success message
          Toast.show('Form data collected successfully', 'success');
        });
      }
      
      // Add patient button handler
      const addPatientBtn = document.getElementById('add-patient-btn');
      if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
          console.log('Add patient clicked');
          // For MedicalSections integration, we rely on the event delegation in MedicalSectionsManager
        });
      }
    }
  };

  // Export components to window namespace
  window.FireEMS = window.FireEMS || {};
  window.FireEMS.Components = {
    HIPAA: HIPAACompliance,
    CAD: CADIntegration,
    Validator: IncidentValidator,
    Export: IncidentExport,
    Map: IncidentMap,
    List: IncidentList,
    Form: IncidentForm,
    Medical: medicalSections
  };

  // For backward compatibility, also expose as IncidentLogger
  window.IncidentLogger = window.IncidentLogger || {};
  window.IncidentLogger.HIPAA = HIPAACompliance;
  window.IncidentLogger.CAD = CADIntegration;
  window.IncidentLogger.Validator = IncidentValidator;
  window.IncidentLogger.Export = IncidentExport;
  window.IncidentLogger.Map = IncidentMap;
  window.IncidentLogger.List = IncidentList;
  window.IncidentLogger.Form = IncidentForm;
  window.IncidentLogger.Medical = medicalSections;
  
  // Auto-initialize Medical Sections
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing medical sections on page load');
    medicalSections.initialize();
  });

  console.log('Components bundle loaded successfully');
})();