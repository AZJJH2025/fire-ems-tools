/**
 * Medical Sections Module
 * 
 * This module handles the creation and management of medical history,
 * medications, and allergies sections for patients in the incident logger.
 */

/**
 * Medical Sections class manages the creation and maintenance of 
 * patient medical sections in the UI
 */
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
  
  /**
   * Initialize the medical sections manager
   */
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
  
  /**
   * Set up event listeners for patient changes
   */
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
  
  /**
   * Check for missing medical sections and add them
   */
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
  
  /**
   * Add medical sections to a specific patient
   * @param {HTMLElement} patientEntry - The patient entry element
   * @param {number} patientId - The patient's ID/index
   */
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
  
  /**
   * Set up the NKDA checkbox handler
   * @param {number} patientId - The patient's ID/index
   */
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
  
  /**
   * Initialize Select2 for dropdowns if jQuery and Select2 are available
   */
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
  
  /**
   * Get data from medical sections for a specific patient
   * @param {number} patientId - The patient's ID/index
   * @returns {Object} Medical data object
   */
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
  
  /**
   * Set medical data for a specific patient
   * @param {number} patientId - The patient's ID/index
   * @param {Object} data - The medical data to set
   */
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
  
  /**
   * Helper to set values in a multi-select element
   * @param {HTMLSelectElement} selectElement - The select element
   * @param {Array} values - Array of values to select
   */
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

// Create and export the instance
const medicalSections = new MedicalSectionsManager();

// Export the MedicalSections module
export const MedicalSections = medicalSections;

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    medicalSections.initialize();
  });
}