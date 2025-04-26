/**
 * Incident Form Component - ES6 Module
 * 
 * This module handles form-specific functionality for the Incident Logger.
 */

// Import required utilities
import { Storage } from '../../utils/storage.js';
import { Toast } from '../../utils/toast.js';
import { Modal } from '../../utils/modal.js';

/**
 * Incident Form class to handle form functionality
 */
class IncidentForm {
  constructor() {
    // Store current incident ID if editing
    this.currentIncidentId = null;
    
    // Flag to track form initialization
    this.initialized = false;
    
    // Store incident data
    this.incidentData = null;
  }
  
  /**
   * Initialize the form and its event handlers
   */
  initialize() {
    if (this.initialized) {
      console.log('Incident form already initialized');
      return;
    }
    
    this.setupEventListeners();
    this.initialized = true;
    console.log('Incident form initialized');
  }
  
  /**
   * Set up event listeners for the form
   */
  setupEventListeners() {
    // Wait for DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachFormHandlers());
    } else {
      // DOM already loaded
      this.attachFormHandlers();
    }
  }
  
  /**
   * Attach all form event handlers
   */
  attachFormHandlers() {
    // Form navigation
    this.setupFormNavigation();
    
    // Form sections
    this.setupIncidentTypeHandlers();
    this.setupLocationHandlers();
    this.setupUnitHandlers();
    this.setupPatientHandlers();
    this.setupAttachmentHandlers();
    this.setupDispositionHandlers();
    this.setupNarrativeHandlers();
    
    // Form actions
    this.setupFormActions();
    
    console.log('Incident form handlers attached');
  }
  
  /**
   * Setup form navigation handlers
   */
  setupFormNavigation() {
    // Next/prev buttons
    document.querySelectorAll('.next-step').forEach(button => {
      button.addEventListener('click', () => {
        const currentStep = parseInt(button.closest('.form-step').dataset.step);
        this.navigateToStep(currentStep + 1);
      });
    });
    
    document.querySelectorAll('.prev-step').forEach(button => {
      button.addEventListener('click', () => {
        const currentStep = parseInt(button.closest('.form-step').dataset.step);
        this.navigateToStep(currentStep - 1);
      });
    });
    
    // Step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        const step = parseInt(indicator.dataset.step);
        this.navigateToStep(step);
      });
    });
  }
  
  /**
   * Navigate to a specific step in the form
   * @param {number} stepNumber - The step number to navigate to
   */
  navigateToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
      step.style.display = 'none';
    });
    
    // Show the selected step
    const selectedStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (selectedStep) {
      selectedStep.style.display = 'block';
      
      // Update step indicators
      document.querySelectorAll('.step-indicator').forEach(indicator => {
        const indicatorStep = parseInt(indicator.dataset.step);
        
        if (indicatorStep < stepNumber) {
          indicator.className = 'step-indicator completed';
        } else if (indicatorStep === stepNumber) {
          indicator.className = 'step-indicator current';
        } else {
          indicator.className = 'step-indicator';
        }
      });
    }
  }
  
  /**
   * Setup incident type form handlers
   */
  setupIncidentTypeHandlers() {
    const primaryType = document.getElementById('incident-primary-type');
    if (primaryType) {
      primaryType.addEventListener('change', () => this.updateSecondaryTypes());
    }
    
    const secondaryType = document.getElementById('incident-secondary-type');
    if (secondaryType) {
      secondaryType.addEventListener('change', () => this.updateSpecificTypes());
    }
  }
  
  /**
   * Update secondary incident types based on primary type selection
   */
  updateSecondaryTypes() {
    const primaryType = document.getElementById('incident-primary-type').value;
    const secondaryTypeSelect = document.getElementById('incident-secondary-type');
    
    // Clear existing options
    secondaryTypeSelect.innerHTML = '<option value="">Select Secondary Type</option>';
    
    // Also clear specific type
    document.getElementById('incident-specific-type').innerHTML = '<option value="">Select Specific Type</option>';
    
    // If no primary type selected, just return
    if (!primaryType) return;
    
    // Define secondary types based on primary selection
    const secondaryTypes = {
      'FIRE': [
        'Structure Fire',
        'Vehicle Fire',
        'Wildland Fire',
        'Trash Fire',
        'Explosion',
        'Fire Alarm'
      ],
      'EMS': [
        'Medical Emergency',
        'Trauma',
        'Cardiac',
        'Respiratory',
        'Stroke',
        'Psychiatric',
        'Overdose'
      ],
      'HAZMAT': [
        'Gas Leak',
        'Chemical Spill',
        'Fuel Spill',
        'Carbon Monoxide',
        'Radiation Incident'
      ],
      'RESCUE': [
        'Vehicle Extrication',
        'Water Rescue',
        'High Angle Rescue',
        'Confined Space',
        'Trench Rescue',
        'Structural Collapse'
      ],
      'SERVICE': [
        'Public Assist',
        'Lift Assist',
        'Lockout',
        'Water Problem',
        'Animal Problem'
      ],
      'OTHER': [
        'Mutual Aid',
        'Standby',
        'Investigation',
        'Cancelled',
        'False Alarm'
      ]
    };
    
    // Add options based on primary type
    if (secondaryTypes[primaryType]) {
      secondaryTypes[primaryType].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        secondaryTypeSelect.appendChild(option);
      });
    }
  }
  
  /**
   * Update specific incident types based on secondary type selection
   */
  updateSpecificTypes() {
    const primaryType = document.getElementById('incident-primary-type').value;
    const secondaryType = document.getElementById('incident-secondary-type').value;
    const specificTypeSelect = document.getElementById('incident-specific-type');
    
    // Clear existing options
    specificTypeSelect.innerHTML = '<option value="">Select Specific Type</option>';
    
    // If no secondary type selected, just return
    if (!secondaryType) return;
    
    // Define specific types based on primary and secondary selection
    const specificTypes = {
      'FIRE': {
        'Structure Fire': [
          'Single Family Dwelling',
          'Multi-Family Dwelling',
          'Commercial Building',
          'Industrial Building',
          'High-Rise',
          'Outbuilding'
        ],
        'Vehicle Fire': [
          'Passenger Vehicle',
          'Commercial Vehicle',
          'Recreational Vehicle',
          'Marine Vessel',
          'Aircraft'
        ],
        'Wildland Fire': [
          'Brush/Grass',
          'Forest',
          'Agricultural',
          'Interface'
        ],
        'Fire Alarm': [
          'Smoke Detector',
          'Heat Detector',
          'Sprinkler Activation',
          'Pull Station',
          'Carbon Monoxide'
        ]
      },
      'EMS': {
        'Medical Emergency': [
          'Sick Person',
          'Unconscious Person',
          'Allergic Reaction',
          'Diabetic Problem',
          'Headache',
          'Seizure',
          'Abdominal Pain'
        ],
        'Trauma': [
          'Fall',
          'Assault',
          'Penetrating Trauma',
          'Blunt Trauma',
          'Burns',
          'Electrocution'
        ],
        'Cardiac': [
          'Chest Pain',
          'Cardiac Arrest',
          'Palpitations',
          'Hypertension',
          'Syncope'
        ],
        'Respiratory': [
          'Shortness of Breath',
          'Respiratory Arrest',
          'Asthma',
          'COPD',
          'Airway Obstruction'
        ],
        'Stroke': [
          'CVA',
          'TIA',
          'Facial Droop',
          'Slurred Speech',
          'Weakness'
        ]
      }
    };
    
    // Add options based on primary and secondary type
    if (specificTypes[primaryType] && specificTypes[primaryType][secondaryType]) {
      specificTypes[primaryType][secondaryType].forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        specificTypeSelect.appendChild(option);
      });
    }
  }
  
  /**
   * Setup location form handlers
   */
  setupLocationHandlers() {
    // This would handle location-related functionality
    // Map initialization usually happens in a separate component
  }
  
  /**
   * Setup unit form handlers
   */
  setupUnitHandlers() {
    // Add unit button
    const addUnitButton = document.getElementById('add-unit-btn');
    if (addUnitButton) {
      addUnitButton.addEventListener('click', () => this.addUnitEntry());
    }
    
    // Remove unit button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.remove-unit-btn')) {
        const unitEntry = event.target.closest('.unit-entry');
        if (unitEntry) {
          unitEntry.remove();
        }
      }
    });
    
    // Add personnel button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.add-personnel-btn')) {
        const unitEntry = event.target.closest('.unit-entry');
        if (unitEntry) {
          const unitIndex = Array.from(document.querySelectorAll('.unit-entry')).indexOf(unitEntry) + 1;
          this.addPersonnel(unitIndex);
        }
      }
    });
    
    // Remove personnel button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.remove-personnel-btn')) {
        const personnelEntry = event.target.closest('.personnel-entry');
        if (personnelEntry) {
          personnelEntry.remove();
        }
      }
    });
  }
  
  /**
   * Setup patient form handlers
   */
  setupPatientHandlers() {
    // Patient count change
    const patientCount = document.getElementById('patient-count');
    if (patientCount) {
      patientCount.addEventListener('change', () => {
        this.updatePatientCount(parseInt(patientCount.value));
      });
    }
    
    // Add patient button
    const addPatientButton = document.getElementById('add-patient-btn');
    if (addPatientButton) {
      addPatientButton.addEventListener('click', () => {
        this.addPatientEntry();
      });
    }
    
    // Add vitals button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.add-vital-btn')) {
        const patientEntry = event.target.closest('.patient-entry');
        if (patientEntry) {
          const patientIndex = parseInt(event.target.dataset.patient);
          this.addVitalSigns(patientIndex);
        }
      }
    });
    
    // Remove vitals button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.remove-vital-btn')) {
        const vitalRow = event.target.closest('.vitals-row');
        if (vitalRow) {
          vitalRow.remove();
        }
      }
    });
    
    // Add treatment button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.add-treatment-btn')) {
        const patientEntry = event.target.closest('.patient-entry');
        if (patientEntry) {
          const patientIndex = parseInt(event.target.dataset.patient);
          this.addTreatment(patientIndex);
        }
      }
    });
    
    // Remove treatment button delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.remove-treatment-btn')) {
        const treatmentEntry = event.target.closest('.treatment-entry');
        if (treatmentEntry) {
          treatmentEntry.remove();
        }
      }
    });
  }
  
  /**
   * Add a new unit entry to the form
   */
  addUnitEntry() {
    const unitsContainer = document.getElementById('units-container');
    if (!unitsContainer) return;
    
    const unitCount = unitsContainer.querySelectorAll('.unit-entry').length + 1;
    
    const unitEntry = document.createElement('div');
    unitEntry.className = 'unit-entry';
    unitEntry.innerHTML = `
      <div class="form-section">
        <h4>Unit #${unitCount}</h4>
        <button type="button" class="remove-unit-btn secondary-btn small-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      <div class="form-group">
        <label for="unit-id-${unitCount}">Unit ID</label>
        <input type="text" id="unit-id-${unitCount}" name="unit-id-${unitCount}" placeholder="E12, M7, etc." required>
      </div>
      
      <div class="form-group">
        <label for="unit-type-${unitCount}">Unit Type</label>
        <select id="unit-type-${unitCount}" name="unit-type-${unitCount}" required>
          <option value="">Select Type</option>
          <option value="Engine">Engine</option>
          <option value="Ladder">Ladder</option>
          <option value="Ambulance">Ambulance</option>
          <option value="Rescue">Rescue</option>
          <option value="Battalion">Battalion</option>
          <option value="Hazmat">Hazmat</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Personnel</label>
        <div class="personnel-list">
          <div class="personnel-entry">
            <input type="text" name="personnel-${unitCount}-1" placeholder="Name/ID">
            <button type="button" class="remove-personnel-btn secondary-btn small-btn">
              <i class="fas fa-minus"></i>
            </button>
          </div>
        </div>
        <button type="button" class="add-personnel-btn secondary-btn small-btn">
          <i class="fas fa-plus"></i> Add Personnel
        </button>
      </div>
    `;
    
    unitsContainer.appendChild(unitEntry);
  }
  
  /**
   * Add personnel entry to a unit
   * @param {number} unitIndex - The index of the unit
   */
  addPersonnel(unitIndex) {
    const unitEntry = document.querySelectorAll('.unit-entry')[unitIndex - 1];
    if (!unitEntry) return;
    
    const personnelList = unitEntry.querySelector('.personnel-list');
    const personnelCount = personnelList.querySelectorAll('.personnel-entry').length + 1;
    
    const personnelEntry = document.createElement('div');
    personnelEntry.className = 'personnel-entry';
    personnelEntry.innerHTML = `
      <input type="text" name="personnel-${unitIndex}-${personnelCount}" placeholder="Name/ID">
      <button type="button" class="remove-personnel-btn secondary-btn small-btn">
        <i class="fas fa-minus"></i>
      </button>
    `;
    
    personnelList.appendChild(personnelEntry);
  }
  
  /**
   * Update the number of patient entries based on the patient count
   * @param {number} count - The number of patients
   */
  updatePatientCount(count) {
    const patientsContainer = document.getElementById('patients-container');
    if (!patientsContainer) return;
    
    const currentCount = patientsContainer.querySelectorAll('.patient-entry').length;
    
    if (count > currentCount) {
      // Add more patient entries
      for (let i = currentCount + 1; i <= count; i++) {
        this.addPatientEntry();
      }
    } else if (count < currentCount) {
      // Remove excess patient entries
      const entries = patientsContainer.querySelectorAll('.patient-entry');
      for (let i = count; i < currentCount; i++) {
        entries[i].remove();
      }
    }
  }
  
  /**
   * Add a new patient entry to the form
   */
  addPatientEntry() {
    const patientsContainer = document.getElementById('patients-container');
    if (!patientsContainer) return;
    
    const patientCount = patientsContainer.querySelectorAll('.patient-entry').length + 1;
    
    // Get the patient template and replace placeholders
    const template = document.getElementById('patient-template');
    if (!template) {
      console.error('Patient template not found');
      return;
    }
    
    const patientHtml = template.innerHTML.replace(/\{\{index\}\}/g, patientCount);
    
    // Create a temporary container to hold the HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = patientHtml;
    
    // Append the new patient entry
    patientsContainer.appendChild(tempContainer.firstElementChild);
    
    // Update the patient count input
    const patientCountInput = document.getElementById('patient-count');
    if (patientCountInput) {
      patientCountInput.value = patientCount;
    }
    
    // Trigger custom event for other components to react
    document.dispatchEvent(new CustomEvent('patientAdded', {
      detail: { patientIndex: patientCount }
    }));
  }
  
  /**
   * Add a vital signs row to a patient
   * @param {number} patientIndex - The index of the patient
   */
  addVitalSigns(patientIndex) {
    const vitalsTable = document.getElementById(`vitals-rows-${patientIndex}`);
    if (!vitalsTable) return;
    
    const vitalCount = vitalsTable.querySelectorAll('.vitals-row').length + 1;
    
    const row = document.createElement('tr');
    row.className = 'vitals-row';
    row.innerHTML = `
      <td>
        <input type="datetime-local" name="vital-time-${patientIndex}-${vitalCount}">
      </td>
      <td>
        <input type="text" name="vital-bp-${patientIndex}-${vitalCount}" placeholder="120/80">
      </td>
      <td>
        <input type="number" name="vital-pulse-${patientIndex}-${vitalCount}" min="20" max="250" placeholder="80">
      </td>
      <td>
        <input type="number" name="vital-resp-${patientIndex}-${vitalCount}" min="4" max="60" placeholder="16">
      </td>
      <td>
        <input type="number" name="vital-spo2-${patientIndex}-${vitalCount}" min="50" max="100" placeholder="99">
      </td>
      <td>
        <input type="number" name="vital-gcs-${patientIndex}-${vitalCount}" min="3" max="15" placeholder="15">
      </td>
      <td>
        <button type="button" class="remove-vital-btn secondary-btn small-btn">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    vitalsTable.appendChild(row);
  }
  
  /**
   * Add a treatment entry to a patient
   * @param {number} patientIndex - The index of the patient
   */
  addTreatment(patientIndex) {
    const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
    if (!treatmentsContainer) return;
    
    const treatmentCount = treatmentsContainer.querySelectorAll('.treatment-entry').length + 1;
    
    const treatmentEntry = document.createElement('div');
    treatmentEntry.className = 'treatment-entry';
    treatmentEntry.innerHTML = `
      <div class="form-group">
        <label for="treatment-time-${patientIndex}-${treatmentCount}">Time</label>
        <input type="datetime-local" id="treatment-time-${patientIndex}-${treatmentCount}" name="treatment-time-${patientIndex}-${treatmentCount}">
      </div>
      <div class="form-group">
        <label for="treatment-procedure-${patientIndex}-${treatmentCount}">Procedure</label>
        <input type="text" id="treatment-procedure-${patientIndex}-${treatmentCount}" name="treatment-procedure-${patientIndex}-${treatmentCount}">
      </div>
      <div class="form-group">
        <label for="treatment-notes-${patientIndex}-${treatmentCount}">Notes</label>
        <textarea id="treatment-notes-${patientIndex}-${treatmentCount}" name="treatment-notes-${patientIndex}-${treatmentCount}"></textarea>
      </div>
      <button type="button" class="remove-treatment-btn secondary-btn small-btn">
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    treatmentsContainer.appendChild(treatmentEntry);
  }
  
  /**
   * Setup attachment form handlers
   */
  setupAttachmentHandlers() {
    // File upload handler
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.addEventListener('change', event => this.handleFileUpload(event));
    }
    
    // Take photo button
    const takePhotoButton = document.getElementById('take-photo-btn');
    if (takePhotoButton) {
      takePhotoButton.addEventListener('click', () => this.activateCamera());
    }
    
    // Remove attachment delegation
    document.addEventListener('click', event => {
      if (event.target.closest('.remove-attachment-btn')) {
        const attachmentItem = event.target.closest('.attachment-item');
        if (attachmentItem) {
          attachmentItem.remove();
        }
      }
    });
  }
  
  /**
   * Handle file upload for attachments
   * @param {Event} event - The file input change event
   */
  handleFileUpload(event) {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    // Process each file
    Array.from(files).forEach(file => {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Toast.show(`File ${file.name} exceeds 5MB limit.`, 'error');
        return;
      }
      
      // Create attachment entry
      const attachmentsList = document.getElementById('attachments-list');
      if (!attachmentsList) return;
      
      const attachment = document.createElement('div');
      attachment.className = 'attachment-item';
      
      // Determine icon based on file type
      let icon = 'file';
      if (file.type.startsWith('image/')) {
        icon = 'image';
      } else if (file.type.startsWith('video/')) {
        icon = 'video';
      } else if (file.type.startsWith('audio/')) {
        icon = 'music';
      } else if (file.type.includes('pdf')) {
        icon = 'file-pdf';
      }
      
      attachment.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span class="attachment-name">${file.name}</span>
        <span class="attachment-size">${this.formatFileSize(file.size)}</span>
        <button type="button" class="remove-attachment-btn secondary-btn small-btn">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      attachmentsList.appendChild(attachment);
      
      // If it's an image, create a preview
      if (file.type.startsWith('image/')) {
        this.createImagePreview(file, attachment);
      }
    });
    
    // Clear the file input
    event.target.value = '';
  }
  
  /**
   * Format file size in a human-readable format
   * @param {number} size - The file size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(size) {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
  
  /**
   * Create an image preview for an image attachment
   * @param {File} file - The image file
   * @param {HTMLElement} container - The attachment container
   */
  createImagePreview(file, container) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const preview = document.createElement('div');
      preview.className = 'attachment-preview';
      preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
      
      container.appendChild(preview);
    };
    
    reader.readAsDataURL(file);
  }
  
  /**
   * Activate device camera for photo capture
   */
  activateCamera() {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Toast.show('Camera access not supported in this browser.', 'error');
      return;
    }
    
    // Create camera modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'camera-modal';
    modalContent.innerHTML = `
      <div class="camera-container">
        <video id="camera-preview" autoplay></video>
        <canvas id="camera-canvas" style="display:none;"></canvas>
      </div>
      <div class="camera-controls">
        <button id="take-photo-btn" class="primary-btn">
          <i class="fas fa-camera"></i> Take Photo
        </button>
        <button id="switch-camera-btn" class="secondary-btn">
          <i class="fas fa-sync"></i> Switch Camera
        </button>
      </div>
    `;
    
    // Show modal
    Modal.show('Capture Photo', modalContent, 
      // Cancel callback
      () => {
        // Stop camera stream
        if (window.cameraStream) {
          window.cameraStream.getTracks().forEach(track => track.stop());
          window.cameraStream = null;
        }
      }, 
      // Confirm callback
      null
    );
    
    // Hide confirm button
    const confirmButton = document.getElementById('modal-confirm');
    if (confirmButton) {
      confirmButton.style.display = 'none';
    }
    
    // Initialize camera
    let facingMode = 'environment'; // Use rear camera first if available
    this.initCamera(facingMode);
    
    // Add event listeners
    const takePhotoBtn = document.getElementById('take-photo-btn');
    if (takePhotoBtn) {
      takePhotoBtn.addEventListener('click', () => this.takePhoto());
    }
    
    const switchCameraBtn = document.getElementById('switch-camera-btn');
    if (switchCameraBtn) {
      switchCameraBtn.addEventListener('click', () => {
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        this.initCamera(facingMode);
      });
    }
  }
  
  /**
   * Initialize the camera stream
   * @param {string} facingMode - The camera to use ("environment" or "user")
   */
  initCamera(facingMode) {
    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    // Stop any existing stream
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach(track => track.stop());
    }
    
    // Get video element
    const video = document.getElementById('camera-preview');
    if (!video) return;
    
    // Access the camera
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        // Store stream for later use
        window.cameraStream = stream;
        
        // Set video source
        video.srcObject = stream;
      })
      .catch(function(error) {
        console.error('Camera error:', error);
        Toast.show('Error accessing camera: ' + error.message, 'error');
      });
  }
  
  /**
   * Take a photo from the camera stream
   */
  takePhoto() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    
    if (!video || !canvas) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to a data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    // Add the image as an attachment
    this.addImageAttachment(imageDataUrl, 'Camera Photo');
    
    // Close the modal
    Modal.close();
    
    // Stop the camera stream
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach(track => track.stop());
      window.cameraStream = null;
    }
  }
  
  /**
   * Add an image attachment from a data URL
   * @param {string} dataUrl - The image data URL
   * @param {string} name - The image name
   */
  addImageAttachment(dataUrl, name) {
    // Create attachment entry
    const attachmentsList = document.getElementById('attachments-list');
    if (!attachmentsList) return;
    
    const attachment = document.createElement('div');
    attachment.className = 'attachment-item';
    attachment.innerHTML = `
      <i class="fas fa-image"></i>
      <span class="attachment-name">${name}</span>
      <span class="attachment-size">Camera Photo</span>
      <button type="button" class="remove-attachment-btn secondary-btn small-btn">
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    // Add image preview
    const preview = document.createElement('div');
    preview.className = 'attachment-preview';
    preview.innerHTML = `<img src="${dataUrl}" alt="${name}">`;
    
    attachment.appendChild(preview);
    attachmentsList.appendChild(attachment);
    
    // Store the image data (would normally be uploaded to the server)
    // For local storage demo, we would convert to a smaller size or just store the reference
    
    Toast.show('Photo captured and attached', 'success');
  }
  
  /**
   * Setup disposition form handlers
   */
  setupDispositionHandlers() {
    // Transported checkbox
    const transportedCheckbox = document.getElementById('transported');
    if (transportedCheckbox) {
      transportedCheckbox.addEventListener('change', () => {
        document.getElementById('transport-details').style.display = 
          transportedCheckbox.checked ? 'block' : 'none';
        document.getElementById('no-transport-details').style.display = 
          transportedCheckbox.checked ? 'none' : 'block';
      });
    }
    
    // Destination select
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) {
      destinationSelect.addEventListener('change', () => {
        document.getElementById('destination-other').style.display = 
          destinationSelect.value === 'Other' ? 'block' : 'none';
      });
    }
    
    // No transport reason select
    const noTransportReasonSelect = document.getElementById('no-transport-reason');
    if (noTransportReasonSelect) {
      noTransportReasonSelect.addEventListener('change', () => {
        document.getElementById('no-transport-other').style.display = 
          noTransportReasonSelect.value === 'Other' ? 'block' : 'none';
      });
    }
  }
  
  /**
   * Setup narrative form handlers
   */
  setupNarrativeHandlers() {
    // Narrative text area
    const narrativeTextarea = document.getElementById('incident-narrative');
    if (narrativeTextarea) {
      narrativeTextarea.addEventListener('input', () => this.updateNarrativeCharCount());
      narrativeTextarea.addEventListener('keyup', () => this.updateNarrativeCharCount());
    }
    
    // Quick text buttons
    document.querySelectorAll('.quicktext-btn').forEach(button => {
      button.addEventListener('click', () => {
        const narrativeTextarea = document.getElementById('incident-narrative');
        if (narrativeTextarea) {
          this.insertTextAtCursor(narrativeTextarea, button.dataset.text);
        }
      });
    });
  }
  
  /**
   * Update the character count for the narrative textarea
   */
  updateNarrativeCharCount() {
    const narrative = document.getElementById('incident-narrative');
    const charCount = document.getElementById('narrative-char-count');
    
    if (!narrative || !charCount) return;
    
    const count = narrative.value.length;
    charCount.textContent = `${count} ${count === 1 ? 'character' : 'characters'}`;
    
    // Add visual feedback for minimum length
    if (count < 20) {
      charCount.style.color = '#ff3b30';
    } else {
      charCount.style.color = '';
    }
  }
  
  /**
   * Insert text at the current cursor position in a textarea
   * @param {HTMLElement} textarea - The textarea element
   * @param {string} text - The text to insert
   */
  insertTextAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos);
    
    // Set cursor position after the inserted text
    textarea.selectionStart = startPos + text.length;
    textarea.selectionEnd = startPos + text.length;
    
    // Focus the textarea
    textarea.focus();
    
    // Update character count
    if (textarea.id === 'incident-narrative') {
      this.updateNarrativeCharCount();
    }
  }
  
  /**
   * Setup form action buttons
   */
  setupFormActions() {
    // Save draft button
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', e => {
        e.preventDefault();
        this.saveForm(false);
      });
    }
    
    // Submit button
    const submitBtn = document.getElementById('submit-incident-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', e => {
        e.preventDefault();
        this.saveForm(true);
      });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', e => {
        e.preventDefault();
        this.confirmCancel();
      });
    }
  }
  
  /**
   * Confirm before canceling form
   */
  confirmCancel() {
    Modal.confirm(
      'Cancel Incident Report',
      'Are you sure you want to cancel? All unsaved changes will be lost.',
      () => {
        // Go back to list or home page
        window.location.href = '/incident-list';
      }
    );
  }
  
  /**
   * Save form data
   * @param {boolean} isSubmit - Whether this is a final submission or draft
   */
  saveForm(isSubmit = false) {
    try {
      // Collect all form data
      const formData = this.collectFormData();
      
      // Validate the form if submitting
      if (isSubmit) {
        const validationResults = this.validateForm(formData);
        if (!validationResults.isValid) {
          Toast.show(`Please fix the following errors: ${validationResults.errors[0].message}`, 'error');
          
          // Navigate to the step with the error
          if (validationResults.errors[0].step) {
            this.navigateToStep(validationResults.errors[0].step);
          }
          
          return;
        }
      }
      
      // Generate ID if new
      if (!formData.id) {
        formData.id = this.generateIncidentId();
      }
      
      // Set timestamp
      formData.timestamp = new Date().toISOString();
      
      // Set status
      formData.status = isSubmit ? 'Submitted' : 'Draft';
      
      // Save to storage
      const key = isSubmit 
        ? `incident_submitted_${formData.id}`
        : `incident_draft_${formData.id}`;
      
      // Save to storage
      const saved = Storage.save(key, formData);
      
      if (saved) {
        Toast.show(
          isSubmit 
            ? 'Incident report submitted successfully!' 
            : 'Incident report saved as draft.',
          'success'
        );
        
        // Redirect to list page if submitted
        if (isSubmit) {
          setTimeout(() => {
            window.location.href = '/incident-list';
          }, 1500);
        }
      } else {
        Toast.show('Error saving incident report.', 'error');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      Toast.show(`Error saving form: ${error.message}`, 'error');
    }
  }
  
  /**
   * Collect all form data into a structured object
   * @returns {Object} - Collected form data
   */
  collectFormData() {
    const formData = {
      id: document.getElementById('incident-id').value || null,
      timestamp: document.getElementById('incident-timestamp').value || new Date().toISOString(),
      status: document.getElementById('incident-status').value || 'Draft',
      
      // Incident type
      incident_type: {
        primary: document.getElementById('incident-primary-type').value || null,
        secondary: document.getElementById('incident-secondary-type').value || null,
        specific: document.getElementById('incident-specific-type').value || null
      },
      
      // Caller info
      caller_info: {
        name: document.getElementById('caller-name').value || null,
        phone: document.getElementById('caller-phone').value || null,
        relationship: document.getElementById('caller-relationship').value || null
      },
      
      // Location
      location: this.collectLocationData(),
      
      // Dispatch times
      dispatch: this.collectDispatchData(),
      
      // Units
      units: this.collectUnitsData(),
      
      // Patients
      patient_info: this.collectPatientData(),
      
      // Narrative
      narrative: document.getElementById('incident-narrative').value || null,
      
      // Disposition
      disposition: this.collectDispositionData(),
      
      // Created by
      created_by: document.getElementById('created-by').value || 'Current User',
      
      // Attachments would go here
      attachments: []
    };
    
    return formData;
  }
  
  /**
   * Collect location data from the form
   * @returns {Object} - Location data
   */
  collectLocationData() {
    return {
      address: document.getElementById('incident-address').value || null,
      city: document.getElementById('incident-city').value || null,
      state: document.getElementById('incident-state').value || null,
      zip: document.getElementById('incident-zip').value || null,
      latitude: document.getElementById('incident-latitude').value || null,
      longitude: document.getElementById('incident-longitude').value || null,
      location_type: document.getElementById('location-type').value || null,
      notes: document.getElementById('location-notes').value || null
    };
  }
  
  /**
   * Collect dispatch times data from the form
   * @returns {Object} - Dispatch times data
   */
  collectDispatchData() {
    return {
      time_received: document.getElementById('time-received').value || null,
      time_dispatched: document.getElementById('time-dispatched').value || null,
      time_enroute: document.getElementById('time-enroute').value || null,
      time_arrived: document.getElementById('time-arrived').value || null,
      time_transported: document.getElementById('time-transported').value || null,
      time_at_hospital: document.getElementById('time-at-hospital').value || null,
      time_cleared: document.getElementById('time-cleared').value || null,
      response_time: document.getElementById('response-time').value || null,
      on_scene_time: document.getElementById('on-scene-time').value || null,
      transport_time: document.getElementById('transport-time').value || null,
      total_time: document.getElementById('total-time').value || null
    };
  }
  
  /**
   * Collect units data from the form
   * @returns {Array} - Units data array
   */
  collectUnitsData() {
    const units = [];
    const unitEntries = document.querySelectorAll('.unit-entry');
    
    unitEntries.forEach((unitEntry, index) => {
      const unitIndex = index + 1;
      const unitId = document.getElementById(`unit-id-${unitIndex}`);
      const unitType = document.getElementById(`unit-type-${unitIndex}`);
      
      if (!unitId || !unitType) return;
      
      // Collect personnel
      const personnelList = unitEntry.querySelectorAll('.personnel-entry input');
      const personnel = Array.from(personnelList).map(input => input.value).filter(val => val);
      
      units.push({
        id: unitId.value,
        type: unitType.value,
        personnel: personnel
      });
    });
    
    return units;
  }
  
  /**
   * Collect patient data from the form
   * @returns {Object} - Patient data
   */
  collectPatientData() {
    const patientCount = parseInt(document.getElementById('patient-count').value) || 0;
    const patients = {
      count: patientCount,
      details: []
    };
    
    for (let i = 1; i <= patientCount; i++) {
      const patientEntry = {
        age: document.getElementById(`patient-age-${i}`)?.value || null,
        gender: document.getElementById(`patient-gender-${i}`)?.value || null,
        chief_complaint: document.getElementById(`patient-complaint-${i}`)?.value || null,
        
        // Medical history, medications, and allergies would be collected here
        // This assumes custom methods to get selected values from multi-selects
        medical_history: this.getSelectValues(`medical-history-${i}`),
        medications: this.getSelectValues(`medications-${i}`),
        allergies: this.getSelectValues(`allergies-${i}`),
        nkda: document.getElementById(`nkda-${i}`)?.checked || false,
        
        // Vitals
        vitals: this.collectVitalsData(i),
        
        // Treatments
        treatment: this.collectTreatmentsData(i)
      };
      
      patients.details.push(patientEntry);
    }
    
    return patients;
  }
  
  /**
   * Get selected values from a multi-select element
   * @param {string} id - The ID of the select element
   * @returns {Array} - Array of selected values
   */
  getSelectValues(id) {
    const select = document.getElementById(id);
    if (!select) return [];
    
    return Array.from(select.selectedOptions).map(option => option.value);
  }
  
  /**
   * Collect vitals data for a patient
   * @param {number} patientIndex - The patient index
   * @returns {Array} - Vitals data array
   */
  collectVitalsData(patientIndex) {
    const vitals = [];
    const vitalsRows = document.getElementById(`vitals-rows-${patientIndex}`);
    
    if (!vitalsRows) return vitals;
    
    const rows = vitalsRows.querySelectorAll('.vitals-row');
    
    rows.forEach((row, index) => {
      const vitalIndex = index + 1;
      const time = row.querySelector(`input[name="vital-time-${patientIndex}-${vitalIndex}"]`)?.value;
      const bp = row.querySelector(`input[name="vital-bp-${patientIndex}-${vitalIndex}"]`)?.value;
      const pulse = row.querySelector(`input[name="vital-pulse-${patientIndex}-${vitalIndex}"]`)?.value;
      const resp = row.querySelector(`input[name="vital-resp-${patientIndex}-${vitalIndex}"]`)?.value;
      const spo2 = row.querySelector(`input[name="vital-spo2-${patientIndex}-${vitalIndex}"]`)?.value;
      const gcs = row.querySelector(`input[name="vital-gcs-${patientIndex}-${vitalIndex}"]`)?.value;
      
      // Only add if at least one value is present
      if (time || bp || pulse || resp || spo2 || gcs) {
        vitals.push({
          time: time || null,
          bp: bp || null,
          pulse: pulse || null,
          respiration: resp || null,
          spo2: spo2 || null,
          gcs: gcs || null
        });
      }
    });
    
    return vitals;
  }
  
  /**
   * Collect treatments data for a patient
   * @param {number} patientIndex - The patient index
   * @returns {Array} - Treatments data array
   */
  collectTreatmentsData(patientIndex) {
    const treatments = [];
    const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
    
    if (!treatmentsContainer) return treatments;
    
    const treatmentEntries = treatmentsContainer.querySelectorAll('.treatment-entry');
    
    treatmentEntries.forEach((entry, index) => {
      const treatmentIndex = index + 1;
      const time = document.getElementById(`treatment-time-${patientIndex}-${treatmentIndex}`)?.value;
      const procedure = document.getElementById(`treatment-procedure-${patientIndex}-${treatmentIndex}`)?.value;
      const notes = document.getElementById(`treatment-notes-${patientIndex}-${treatmentIndex}`)?.value;
      
      // Only add if at least one value is present
      if (time || procedure || notes) {
        treatments.push({
          time: time || null,
          procedure: procedure || null,
          notes: notes || null
        });
      }
    });
    
    return treatments;
  }
  
  /**
   * Collect disposition data from the form
   * @returns {Object} - Disposition data
   */
  collectDispositionData() {
    const transported = document.getElementById('transported')?.checked || false;
    
    if (transported) {
      // Get destination
      let destination = document.getElementById('destination')?.value || null;
      
      if (destination === 'Other') {
        destination = document.getElementById('destination-other-input')?.value || 'Other';
      }
      
      return {
        transported: true,
        destination: destination,
        reason: document.getElementById('transport-reason')?.value || null
      };
    } else {
      // Get no-transport reason
      let reason = document.getElementById('no-transport-reason')?.value || null;
      
      if (reason === 'Other') {
        reason = document.getElementById('no-transport-other-input')?.value || 'Other';
      }
      
      return {
        transported: false,
        reason: reason
      };
    }
  }
  
  /**
   * Validate the form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Validation results {isValid, errors}
   */
  validateForm(formData) {
    const errors = [];
    
    // Check required fields
    // Step 1: Incident Info
    if (!formData.incident_type.primary) {
      errors.push({
        field: 'incident-primary-type',
        message: 'Primary incident type is required',
        step: 1
      });
    }
    
    // Step 2: Location
    if (!formData.location.address) {
      errors.push({
        field: 'incident-address',
        message: 'Incident address is required',
        step: 2
      });
    }
    
    // Step 3: Dispatch
    if (!formData.dispatch.time_received) {
      errors.push({
        field: 'time-received',
        message: 'Time received is required',
        step: 3
      });
    }
    
    // Step 4: Units
    if (formData.units.length === 0) {
      errors.push({
        field: 'units-container',
        message: 'At least one unit is required',
        step: 4
      });
    }
    
    // Step 7: Narrative
    if (!formData.narrative || formData.narrative.length < 20) {
      errors.push({
        field: 'incident-narrative',
        message: 'Narrative must be at least 20 characters',
        step: 7
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Generate a unique incident ID
   * @returns {string} - Generated incident ID
   */
  generateIncidentId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INC-${timestamp}-${random}`;
  }
  
  /**
   * Load incident data into the form for editing
   * @param {string} incidentId - The incident ID to load
   * @returns {boolean} - Whether the incident was successfully loaded
   */
  loadIncident(incidentId) {
    // Try to load from localStorage
    const incident = Storage.load(`incident_draft_${incidentId}`) || 
                     Storage.load(`incident_submitted_${incidentId}`);
    
    if (!incident) {
      Toast.show(`Incident ${incidentId} not found.`, 'error');
      return false;
    }
    
    this.loadIncidentIntoForm(incident);
    return true;
  }
  
  /**
   * Load incident data into the form
   * @param {Object} incident - The incident data to load
   */
  loadIncidentIntoForm(incident) {
    if (!incident) return;
    
    // Store current incident ID
    this.currentIncidentId = incident.id;
    
    // Reset form first
    this.resetForm();
    
    // Basic info
    document.getElementById('incident-id').value = incident.id;
    document.getElementById('incident-timestamp').value = incident.timestamp || '';
    document.getElementById('incident-status').value = incident.status || '';
    
    // Incident type
    if (incident.incident_type) {
      document.getElementById('incident-primary-type').value = incident.incident_type.primary || '';
      this.updateSecondaryTypes();
      document.getElementById('incident-secondary-type').value = incident.incident_type.secondary || '';
      this.updateSpecificTypes();
      document.getElementById('incident-specific-type').value = incident.incident_type.specific || '';
    }
    
    // Caller info
    if (incident.caller_info) {
      document.getElementById('caller-name').value = incident.caller_info.name || '';
      document.getElementById('caller-phone').value = incident.caller_info.phone || '';
      document.getElementById('caller-relationship').value = incident.caller_info.relationship || '';
    }
    
    // Location
    this.loadLocationData(incident.location);
    
    // Dispatch times
    if (incident.dispatch) {
      document.getElementById('time-received').value = incident.dispatch.time_received || '';
      document.getElementById('time-dispatched').value = incident.dispatch.time_dispatched || '';
      document.getElementById('time-enroute').value = incident.dispatch.time_enroute || '';
      document.getElementById('time-arrived').value = incident.dispatch.time_arrived || '';
      document.getElementById('time-transported').value = incident.dispatch.time_transported || '';
      document.getElementById('time-at-hospital').value = incident.dispatch.time_at_hospital || '';
      document.getElementById('time-cleared').value = incident.dispatch.time_cleared || '';
      
      // Calculate response times
      this.calculateResponseTimes();
    }
    
    // Units
    this.loadUnitsData(incident.units);
    
    // Patients
    this.loadPatientsData(incident.patient_info);
    
    // Narrative
    document.getElementById('incident-narrative').value = incident.narrative || '';
    this.updateNarrativeCharCount();
    
    // Disposition
    this.loadDispositionData(incident.disposition);
    
    // Created by
    document.getElementById('created-by').value = incident.created_by || '';
    
    // Navigate to first step
    this.navigateToStep(1);
  }
  
  /**
   * Load location data into the form
   * @param {Object} location - The location data
   */
  loadLocationData(location) {
    if (!location) return;
    
    document.getElementById('incident-address').value = location.address || '';
    document.getElementById('incident-city').value = location.city || '';
    document.getElementById('incident-state').value = location.state || '';
    document.getElementById('incident-zip').value = location.zip || '';
    document.getElementById('incident-latitude').value = location.latitude || '';
    document.getElementById('incident-longitude').value = location.longitude || '';
    document.getElementById('location-type').value = location.location_type || '';
    document.getElementById('location-notes').value = location.notes || '';
  }
  
  /**
   * Load units data into the form
   * @param {Array} units - The units data array
   */
  loadUnitsData(units) {
    if (!units || !units.length) return;
    
    // Clear existing units
    const unitsContainer = document.getElementById('units-container');
    if (!unitsContainer) return;
    
    unitsContainer.innerHTML = '';
    
    // Add each unit
    units.forEach((unit, index) => {
      // Add unit entry
      this.addUnitEntry();
      
      // Set unit data
      const unitIndex = index + 1;
      document.getElementById(`unit-id-${unitIndex}`).value = unit.id || '';
      document.getElementById(`unit-type-${unitIndex}`).value = unit.type || '';
      
      // Clear default personnel entry
      const unitContainer = document.querySelectorAll('.unit-entry')[index];
      unitContainer.querySelector('.personnel-list').innerHTML = '';
      
      // Add personnel entries
      if (unit.personnel && unit.personnel.length) {
        unit.personnel.forEach((person, personIndex) => {
          const personnelEntry = document.createElement('div');
          personnelEntry.className = 'personnel-entry';
          personnelEntry.innerHTML = `
            <input type="text" name="personnel-${unitIndex}-${personIndex + 1}" placeholder="Name/ID" value="${person}">
            <button type="button" class="remove-personnel-btn secondary-btn small-btn">
              <i class="fas fa-minus"></i>
            </button>
          `;
          
          unitContainer.querySelector('.personnel-list').appendChild(personnelEntry);
        });
      } else {
        // Add one empty personnel entry
        const personnelEntry = document.createElement('div');
        personnelEntry.className = 'personnel-entry';
        personnelEntry.innerHTML = `
          <input type="text" name="personnel-${unitIndex}-1" placeholder="Name/ID">
          <button type="button" class="remove-personnel-btn secondary-btn small-btn">
            <i class="fas fa-minus"></i>
          </button>
        `;
        
        unitContainer.querySelector('.personnel-list').appendChild(personnelEntry);
      }
    });
  }
  
  /**
   * Load patients data into the form
   * @param {Object} patientInfo - The patient info data
   */
  loadPatientsData(patientInfo) {
    if (!patientInfo || !patientInfo.details || !patientInfo.details.length) return;
    
    // Set patient count
    document.getElementById('patient-count').value = patientInfo.count || patientInfo.details.length;
    
    // Clear patients container
    const patientsContainer = document.getElementById('patients-container');
    if (!patientsContainer) return;
    
    patientsContainer.innerHTML = '';
    
    // Add each patient
    patientInfo.details.forEach((patient, index) => {
      // Add patient entry
      this.addPatientEntry();
      
      // Set patient data
      const patientIndex = index + 1;
      document.getElementById(`patient-age-${patientIndex}`).value = patient.age || '';
      document.getElementById(`patient-gender-${patientIndex}`).value = patient.gender || '';
      document.getElementById(`patient-complaint-${patientIndex}`).value = patient.chief_complaint || '';
      
      // Set medical data
      this.setPatientMedicalData(patientIndex, patient);
      
      // Clear default vitals entry
      const vitalsTable = document.getElementById(`vitals-rows-${patientIndex}`);
      if (vitalsTable) {
        vitalsTable.innerHTML = '';
        
        // Add vitals entries
        if (patient.vitals && patient.vitals.length) {
          patient.vitals.forEach((vital, vitalIndex) => {
            this.addVitalSignsWithData(patientIndex, vitalIndex + 1, vital);
          });
        } else {
          // Add one empty vitals entry
          this.addVitalSigns(patientIndex);
        }
      }
      
      // Clear default treatments entry
      const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
      if (treatmentsContainer) {
        treatmentsContainer.innerHTML = '';
        
        // Add treatment entries
        if (patient.treatment && patient.treatment.length) {
          patient.treatment.forEach((treatment, treatIndex) => {
            this.addTreatmentWithData(patientIndex, treatIndex + 1, treatment);
          });
        } else {
          // Add one empty treatment entry
          this.addTreatment(patientIndex);
        }
      }
    });
  }
  
  /**
   * Set medical data for a patient
   * @param {number} patientIndex - The patient index
   * @param {Object} patient - The patient data
   */
  setPatientMedicalData(patientIndex, patient) {
    // Set medical history
    const medHistorySelect = document.getElementById(`medical-history-${patientIndex}`);
    if (medHistorySelect && patient.medical_history) {
      this.setMultiSelectValues(medHistorySelect, patient.medical_history);
    }
    
    // Set medications
    const medicationsSelect = document.getElementById(`medications-${patientIndex}`);
    if (medicationsSelect && patient.medications) {
      this.setMultiSelectValues(medicationsSelect, patient.medications);
    }
    
    // Set NKDA
    const nkdaCheckbox = document.getElementById(`nkda-${patientIndex}`);
    if (nkdaCheckbox) {
      nkdaCheckbox.checked = patient.nkda || false;
      
      // Trigger change event
      const event = new Event('change');
      nkdaCheckbox.dispatchEvent(event);
    }
    
    // Set allergies if not NKDA
    if (!patient.nkda) {
      const allergiesSelect = document.getElementById(`allergies-${patientIndex}`);
      if (allergiesSelect && patient.allergies) {
        this.setMultiSelectValues(allergiesSelect, patient.allergies);
      }
    }
  }
  
  /**
   * Set values for a multi-select element
   * @param {HTMLSelectElement} select - The select element
   * @param {Array} values - The values to set
   */
  setMultiSelectValues(select, values) {
    if (!select || !values || !Array.isArray(values)) return;
    
    // Deselect all options first
    for (let i = 0; i < select.options.length; i++) {
      select.options[i].selected = false;
    }
    
    // Select values that exist
    values.forEach(value => {
      // Check if option exists
      let option = Array.from(select.options).find(opt => opt.value === value);
      
      // If not, create it (if it appears to be a select with tags support)
      if (!option && (select.classList.contains('select2-hidden-accessible') || 
                     select.classList.contains('medical-history-select') || 
                     select.classList.contains('medications-select') || 
                     select.classList.contains('allergies-select'))) {
        option = new Option(value, value);
        select.appendChild(option);
      }
      
      // Select the option
      if (option) {
        option.selected = true;
      }
    });
    
    // Trigger change event for Select2
    if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
      $(select).trigger('change');
    }
  }
  
  /**
   * Add vital signs with data
   * @param {number} patientIndex - The patient index
   * @param {number} vitalIndex - The vital index
   * @param {Object} vital - The vital data
   */
  addVitalSignsWithData(patientIndex, vitalIndex, vital) {
    const vitalsTable = document.getElementById(`vitals-rows-${patientIndex}`);
    if (!vitalsTable) return;
    
    const row = document.createElement('tr');
    row.className = 'vitals-row';
    row.innerHTML = `
      <td>
        <input type="datetime-local" name="vital-time-${patientIndex}-${vitalIndex}" value="${vital.time || ''}">
      </td>
      <td>
        <input type="text" name="vital-bp-${patientIndex}-${vitalIndex}" placeholder="120/80" value="${vital.bp || ''}">
      </td>
      <td>
        <input type="number" name="vital-pulse-${patientIndex}-${vitalIndex}" min="20" max="250" value="${vital.pulse || ''}">
      </td>
      <td>
        <input type="number" name="vital-resp-${patientIndex}-${vitalIndex}" min="4" max="60" value="${vital.respiration || ''}">
      </td>
      <td>
        <input type="number" name="vital-spo2-${patientIndex}-${vitalIndex}" min="50" max="100" value="${vital.spo2 || ''}">
      </td>
      <td>
        <input type="number" name="vital-gcs-${patientIndex}-${vitalIndex}" min="3" max="15" value="${vital.gcs || ''}">
      </td>
      <td>
        <button type="button" class="remove-vital-btn secondary-btn small-btn">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    vitalsTable.appendChild(row);
  }
  
  /**
   * Add treatment with data
   * @param {number} patientIndex - The patient index
   * @param {number} treatmentIndex - The treatment index
   * @param {Object} treatment - The treatment data
   */
  addTreatmentWithData(patientIndex, treatmentIndex, treatment) {
    const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
    if (!treatmentsContainer) return;
    
    const treatmentEntry = document.createElement('div');
    treatmentEntry.className = 'treatment-entry';
    treatmentEntry.innerHTML = `
      <div class="form-group">
        <label for="treatment-time-${patientIndex}-${treatmentIndex}">Time</label>
        <input type="datetime-local" id="treatment-time-${patientIndex}-${treatmentIndex}" name="treatment-time-${patientIndex}-${treatmentIndex}" value="${treatment.time || ''}">
      </div>
      <div class="form-group">
        <label for="treatment-procedure-${patientIndex}-${treatmentIndex}">Procedure</label>
        <input type="text" id="treatment-procedure-${patientIndex}-${treatmentIndex}" name="treatment-procedure-${patientIndex}-${treatmentIndex}" value="${treatment.procedure || ''}">
      </div>
      <div class="form-group">
        <label for="treatment-notes-${patientIndex}-${treatmentIndex}">Notes</label>
        <textarea id="treatment-notes-${patientIndex}-${treatmentIndex}" name="treatment-notes-${patientIndex}-${treatmentIndex}">${treatment.notes || ''}</textarea>
      </div>
      <button type="button" class="remove-treatment-btn secondary-btn small-btn">
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    treatmentsContainer.appendChild(treatmentEntry);
  }
  
  /**
   * Load disposition data into the form
   * @param {Object} disposition - The disposition data
   */
  loadDispositionData(disposition) {
    if (!disposition) return;
    
    // Set transported checkbox
    const transportedCheckbox = document.getElementById('transported');
    if (transportedCheckbox) {
      transportedCheckbox.checked = disposition.transported || false;
      
      // Show/hide relevant sections
      document.getElementById('transport-details').style.display = disposition.transported ? 'block' : 'none';
      document.getElementById('no-transport-details').style.display = disposition.transported ? 'none' : 'block';
    }
    
    if (disposition.transported) {
      // Set transport details
      if (disposition.destination) {
        const selectElement = document.getElementById('destination');
        if (selectElement) {
          const destinationExists = Array.from(selectElement.options).some(option => option.value === disposition.destination);
          
          if (destinationExists) {
            selectElement.value = disposition.destination;
          } else {
            selectElement.value = 'Other';
            document.getElementById('destination-other').style.display = 'block';
            document.getElementById('destination-other-input').value = disposition.destination;
          }
        }
      }
      
      const transportReason = document.getElementById('transport-reason');
      if (transportReason) {
        transportReason.value = disposition.reason || '';
      }
    } else {
      // Set no-transport reason
      if (disposition.reason) {
        const selectElement = document.getElementById('no-transport-reason');
        if (selectElement) {
          const reasonExists = Array.from(selectElement.options).some(option => option.value === disposition.reason);
          
          if (reasonExists) {
            selectElement.value = disposition.reason;
          } else {
            selectElement.value = 'Other';
            document.getElementById('no-transport-other').style.display = 'block';
            document.getElementById('no-transport-other-input').value = disposition.reason;
          }
        }
      }
    }
  }
  
  /**
   * Calculate response times based on timestamp inputs
   */
  calculateResponseTimes() {
    // Get time inputs
    const timeReceived = document.getElementById('time-received').value;
    const timeDispatched = document.getElementById('time-dispatched').value;
    const timeEnroute = document.getElementById('time-enroute').value;
    const timeArrived = document.getElementById('time-arrived').value;
    const timeTransported = document.getElementById('time-transported').value;
    const timeAtHospital = document.getElementById('time-at-hospital').value;
    const timeCleared = document.getElementById('time-cleared').value;
    
    // Function to calculate difference in minutes
    const diffMinutes = (timeStr1, timeStr2) => {
      if (!timeStr1 || !timeStr2) return '';
      
      const time1 = new Date(timeStr1);
      const time2 = new Date(timeStr2);
      
      if (isNaN(time1) || isNaN(time2)) return '';
      
      const diffMs = time2 - time1;
      return Math.round(diffMs / 60000);
    };
    
    // Calculate times
    const responseTime = diffMinutes(timeDispatched, timeArrived);
    const onSceneTime = diffMinutes(timeArrived, timeTransported || timeCleared);
    const transportTime = diffMinutes(timeTransported, timeAtHospital);
    const totalTime = diffMinutes(timeReceived, timeCleared);
    
    // Update calculated fields
    document.getElementById('response-time').value = responseTime;
    document.getElementById('on-scene-time').value = onSceneTime;
    document.getElementById('transport-time').value = transportTime;
    document.getElementById('total-time').value = totalTime;
  }
  
  /**
   * Reset the form to its initial state
   */
  resetForm() {
    // Reset current incident ID
    this.currentIncidentId = null;
    
    // Get the form element
    const form = document.getElementById('incident-form');
    if (form) {
      form.reset();
    }
    
    // Clear dynamic content
    const unitsContainer = document.getElementById('units-container');
    if (unitsContainer) {
      unitsContainer.innerHTML = '';
      this.addUnitEntry(); // Add one empty unit
    }
    
    const patientsContainer = document.getElementById('patients-container');
    if (patientsContainer) {
      patientsContainer.innerHTML = '';
      this.addPatientEntry(); // Add one empty patient
    }
    
    const attachmentsList = document.getElementById('attachments-list');
    if (attachmentsList) {
      attachmentsList.innerHTML = '';
    }
    
    // Navigate to first step
    this.navigateToStep(1);
  }
}

// Create and export the IncidentForm instance
const incidentForm = new IncidentForm();
export default incidentForm;