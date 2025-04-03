// Wrap all code in an IIFE to avoid polluting the global namespace
(function() {
// Debug console message to verify script is loading
console.log("incident-logger.js is loading...");

// Add version tracking for debugging
window.INCIDENT_LOGGER_VERSION = '1.1.0';
console.log(`Incident Logger Version: ${window.INCIDENT_LOGGER_VERSION}`);
console.log("Features: NFIRS cascade integration, Nominatim geocoding");

// Track loaded components
window.loadedComponents = {
    map: false,
    nfirs: false
};

// Register when components are loaded
window.registerComponent = function(componentName) {
    if (window.loadedComponents.hasOwnProperty(componentName)) {
        window.loadedComponents[componentName] = true;
        console.log(`Component registered: ${componentName}`);
    }
};

/**
 * Show CAD import interface
 */
function showCadImport() {
    console.log("showCadImport function called");
    // Hide other containers
    document.getElementById("incident-form-container").style.display = "none";
    document.getElementById("incident-list-container").style.display = "none";
    document.getElementById("export-container").style.display = "none";
    document.getElementById("settings-container").style.display = "none";
    
    // Show CAD import container
    document.getElementById("cad-import-container").style.display = "block";
    
    // Reset the form
    document.getElementById("cad-file").value = "";
    document.getElementById("cad-import-mode").value = "new";
    document.getElementById("cad-match-container").style.display = "none";
    document.getElementById("cad-import-preview").style.display = "none";
    
    // Initialize CAD import events if needed
    initializeCadImportListeners();
}

/**
 * Initialize CAD import event listeners
 */
function initializeCadImportListeners() {
    // Check if listeners already initialized
    if (window.cadImportInitialized) return;
    
    // Import mode toggle
    document.getElementById("cad-import-mode").addEventListener("change", function() {
        document.getElementById("cad-match-container").style.display = 
            this.value === "update" ? "block" : "none";
    });
    
    // Import button
    document.getElementById("cad-import-run-btn").addEventListener("click", async function() {
        const fileInput = document.getElementById("cad-file");
        
        if (!fileInput.files || !fileInput.files[0]) {
            showToast("Please select a CAD file to import", "error");
            return;
        }
        
        try {
            // Show loading state
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Import the CAD data
            const importModule = await import('./js/components/cad-integration.js');
            const cadData = await importModule.importCadData(fileInput.files[0]);
            
            // Show preview
            const previewSection = document.getElementById("cad-import-preview");
            const previewContent = document.getElementById("cad-preview-content");
            previewSection.style.display = "block";
            
            // Create preview content
            let previewHtml = '';
            
            if (cadData.length === 0) {
                previewHtml = '<p>No incidents found in the CAD data.</p>';
            } else {
                previewHtml = `<p>Found ${cadData.length} incident(s) in the CAD data.</p>`;
                
                // Show preview table for the first few incidents
                const previewCount = Math.min(cadData.length, 5);
                previewHtml += '<div class="preview-table-container"><table class="preview-table">';
                previewHtml += '<thead><tr><th>CAD ID</th><th>Time</th><th>Type</th><th>Address</th></tr></thead><tbody>';
                
                for (let i = 0; i < previewCount; i++) {
                    const incident = cadData[i];
                    previewHtml += `<tr>
                        <td>${incident.cad_info.cad_incident_id || 'N/A'}</td>
                        <td>${formatDate(new Date(incident.timestamp))}</td>
                        <td>${incident.incident_type.primary} - ${incident.incident_type.specific}</td>
                        <td>${incident.location.address}</td>
                    </tr>`;
                }
                
                previewHtml += '</tbody></table></div>';
                
                if (cadData.length > previewCount) {
                    previewHtml += `<p>...and ${cadData.length - previewCount} more.</p>`;
                }
            }
            
            previewContent.innerHTML = previewHtml;
            
            // Store the imported data for later use
            window.importedCadData = cadData;
            
        } catch (error) {
            console.error('CAD import error:', error);
            showToast(`Error importing CAD data: ${error.message}`, "error");
            document.getElementById("cad-import-preview").style.display = "none";
        } finally {
            // Reset button
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-file-import"></i> Import CAD Data';
        }
    });
    
    // Apply button
    document.getElementById("cad-apply-btn").addEventListener("click", async function() {
        const importMode = document.getElementById("cad-import-mode").value;
        const matchId = document.getElementById("cad-match-id")?.value;
        
        if (!window.importedCadData || window.importedCadData.length === 0) {
            showToast('No CAD data to apply', 'error');
            return;
        }
        
        try {
            const importModule = await import('./js/components/cad-integration.js');
            
            if (importMode === "update") {
                // Update existing incident
                if (!matchId) {
                    showToast('Please enter an incident ID to update', 'error');
                    return;
                }
                
                // Find current incident
                const currentIncident = getIncidentById(matchId);
                if (!currentIncident) {
                    showToast(`Incident ${matchId} not found`, 'error');
                    return;
                }
                
                // Find matching CAD data (use first record for now)
                const cadData = window.importedCadData[0];
                
                // Apply CAD data to current incident
                const updatedIncident = importModule.applyCadToIncident(currentIncident, cadData);
                
                // Save the updated incident
                saveIncident(updatedIncident);
                
                showToast(`Incident ${matchId} updated with CAD data`, 'success');
                
                // Reload the form if we're editing this incident
                if (window.currentIncident && window.currentIncident.id === matchId) {
                    loadIncidentIntoForm(updatedIncident);
                }
                
                // Show form with updated incident
                showNewIncidentForm();
                loadIncidentIntoForm(updatedIncident);
                
            } else {
                // Create new incidents
                const created = [];
                
                // Create each incident from CAD data
                for (const cadData of window.importedCadData) {
                    // Add to incident list
                    incidentList.push(cadData);
                    created.push(cadData.id);
                }
                
                // Save all incidents
                saveIncidents();
                
                showToast(`Created ${created.length} new incidents from CAD data`, 'success');
                
                // Refresh the incident list
                showIncidentList();
            }
            
            // Hide the preview section
            document.getElementById("cad-import-preview").style.display = "none";
            
            // Clear the imported data
            window.importedCadData = null;
            
            // Clear the file input
            document.getElementById("cad-file").value = "";
            
        } catch (error) {
            console.error('Error applying CAD data:', error);
            showToast(`Error applying CAD data: ${error.message}`, 'error');
        }
    });
    
    // Cancel button
    document.getElementById("cad-cancel-btn").addEventListener("click", function() {
        // Hide the preview section
        document.getElementById("cad-import-preview").style.display = "none";
        
        // Clear the imported data
        window.importedCadData = null;
        
        // Clear the file input
        document.getElementById("cad-file").value = "";
    });
    
    // Mark as initialized
    window.cadImportInitialized = true;
}/**
 * FireEMS.ai Incident Logger - Main JavaScript File
 * Version: 1.0.0
 * 
 * This is the main script file for the Incident Logger tool.
 * It coordinates the various components and handles the main application flow.
 */

// Declare global variables for use across components
let currentIncident = null;
let incidentList = [];
let settings = {};
let isOffline = false;

// DOM loaded event listener
document.addEventListener("DOMContentLoaded", () => {
    console.log("Incident Logger initialized");
    
    // Initialize local settings from storage or defaults
    initializeSettings();
    
    // Initialize UI event listeners
    initializeEventListeners();
    
    // Check online status
    checkOnlineStatus();
    
    // Initialize the form with default values
    initializeForm();
    
    // Load incidents from storage
    loadIncidents();
    
    // Set up autosave
    setupAutosave();
});

/**
 * Initialize settings from local storage or use defaults
 */
function initializeSettings() {
    const defaultSettings = {
        defaultStatus: "draft",
        autoSaveInterval: 5, // minutes
        defaultLocation: "",
        itemsPerPage: 25,
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12", // 12 or 24 hour
        storageMode: "local", // local, server, or both
        lastSyncTime: null
    };
    
    // Try to load settings from localStorage
    const storedSettings = localStorage.getItem("incidentLoggerSettings");
    
    if (storedSettings) {
        try {
            settings = JSON.parse(storedSettings);
            console.log("Settings loaded from storage:", settings);
        } catch (error) {
            console.error("Error parsing settings:", error);
            settings = defaultSettings;
        }
    } else {
        settings = defaultSettings;
        saveSettings();
    }
    
    // Apply settings to UI
    applySettings();
}

/**
 * Apply current settings to the UI
 */
function applySettings() {
    document.getElementById("default-status").value = settings.defaultStatus;
    document.getElementById("auto-save").value = settings.autoSaveInterval;
    document.getElementById("default-location").value = settings.defaultLocation;
    document.getElementById("items-per-page").value = settings.itemsPerPage;
    document.getElementById("date-format").value = settings.dateFormat;
    document.getElementById("time-format").value = settings.timeFormat;
    document.getElementById("storage-mode").value = settings.storageMode;
}

/**
 * Save current settings to localStorage
 */
function saveSettings() {
    localStorage.setItem("incidentLoggerSettings", JSON.stringify(settings));
    console.log("Settings saved to storage");
}

/**
 * Initialize all event listeners for the UI
 */
function initializeEventListeners() {
    // Main navigation buttons
    document.getElementById("new-incident-btn").addEventListener("click", showNewIncidentForm);
    document.getElementById("view-incidents-btn").addEventListener("click", showIncidentList);
    document.getElementById("export-btn").addEventListener("click", showExportOptions);
    document.getElementById("settings-btn").addEventListener("click", showSettings);
    document.getElementById("cad-import-btn").addEventListener("click", showCadImport);
    
    // Form navigation buttons
    const nextButtons = document.querySelectorAll(".next-btn");
    nextButtons.forEach(button => {
        button.addEventListener("click", () => {
            const currentStep = parseInt(button.closest(".form-step").dataset.step);
            navigateToStep(currentStep + 1);
        });
    });
    
    const prevButtons = document.querySelectorAll(".prev-btn");
    prevButtons.forEach(button => {
        button.addEventListener("click", () => {
            const currentStep = parseInt(button.closest(".form-step").dataset.step);
            navigateToStep(currentStep - 1);
        });
    });
    
    // Progress step navigation
    const progressSteps = document.querySelectorAll(".progress-step");
    progressSteps.forEach(step => {
        step.addEventListener("click", () => {
            navigateToStep(parseInt(step.dataset.step));
        });
    });
    
    // HIPAA consent form toggle
    const consentToggle = document.getElementById("hipaa-consent-obtained");
    if (consentToggle) {
        consentToggle.addEventListener("change", function() {
            document.getElementById("consent-details").style.display = this.checked ? "block" : "none";
        });
    }
    
    // Form submission
    document.getElementById("incident-form").addEventListener("submit", handleFormSubmit);
    document.getElementById("save-draft-btn").addEventListener("click", saveDraft);
    
    // Location related functionality
    // Use the map component's geocode function if available, otherwise use our local implementation
    const geocodeBtn = document.getElementById("geocode-btn");
    if (geocodeBtn) {
        geocodeBtn.addEventListener("click", function() {
            if (typeof window.mapGeocode === 'function') {
                window.mapGeocode();
            } else {
                geocodeAddress();
            }
        });
    }
    
    const currentLocationBtn = document.getElementById("current-location-btn");
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener("click", getCurrentLocation);
    }
    
    // Dynamic form elements
    document.getElementById("add-unit-btn").addEventListener("click", addUnitEntry);
    document.getElementById("add-patient-btn").addEventListener("click", addPatientEntry);
    document.querySelector(".add-vital-btn").addEventListener("click", function() {
        addVitalSigns(this.dataset.patient);
    });
    document.querySelector(".add-treatment-btn").addEventListener("click", function() {
        addTreatment(this.dataset.patient);
    });
    
    // Dynamic remove buttons (using event delegation)
    document.addEventListener("click", function(e) {
        if (e.target.closest(".remove-unit-btn")) {
            e.target.closest(".unit-entry").remove();
        } else if (e.target.closest(".remove-patient-btn")) {
            e.target.closest(".patient-entry").remove();
        } else if (e.target.closest(".remove-vital-btn")) {
            e.target.closest(".vitals-row").remove();
        } else if (e.target.closest(".remove-treatment-btn")) {
            e.target.closest(".treatment-entry").remove();
        } else if (e.target.closest(".remove-personnel-btn")) {
            e.target.closest(".personnel-entry").remove();
        } else if (e.target.closest(".add-personnel-btn")) {
            const unitEntry = e.target.closest(".unit-entry");
            const unitIndex = Array.from(document.querySelectorAll(".unit-entry")).indexOf(unitEntry) + 1;
            addPersonnel(unitIndex);
        }
    });
    
    // Patient count changes
    document.getElementById("patient-count").addEventListener("change", function() {
        updatePatientCount(parseInt(this.value));
    });
    
    // Narrative character count
    document.getElementById("incident-narrative").addEventListener("input", updateNarrativeCharCount);
    
    // Common phrases for narrative
    document.querySelectorAll(".phrase-btn").forEach(button => {
        button.addEventListener("click", function() {
            insertTextAtCursor(document.getElementById("incident-narrative"), this.textContent + " ");
        });
    });
    
    // Transport toggle
    document.getElementById("transported").addEventListener("change", function() {
        document.getElementById("transport-details").style.display = this.checked ? "block" : "none";
        document.getElementById("no-transport-details").style.display = this.checked ? "none" : "block";
    });
    
    // Destination other toggle
    document.getElementById("destination").addEventListener("change", function() {
        document.getElementById("destination-other").style.display = 
            this.value === "Other" ? "block" : "none";
    });
    
    // No transport other toggle
    document.getElementById("no-transport-reason").addEventListener("change", function() {
        document.getElementById("no-transport-other").style.display = 
            this.value === "Other" ? "block" : "none";
    });
    
    // Settings form
    document.getElementById("save-settings-btn").addEventListener("click", updateSettings);
    document.getElementById("reset-settings-btn").addEventListener("click", resetSettings);
    document.getElementById("clear-data-btn").addEventListener("click", confirmClearData);
    document.getElementById("export-settings-btn").addEventListener("click", exportSettings);
    document.getElementById("import-settings-btn").addEventListener("click", importSettings);
    
    // File attachments
    document.getElementById("attachment-upload").addEventListener("change", handleFileUpload);
    document.getElementById("camera-btn").addEventListener("click", activateCamera);
    
    // Incident list functionality
    document.getElementById("search-btn").addEventListener("click", searchIncidents);
    document.getElementById("search-incidents").addEventListener("keyup", function(e) {
        if (e.key === "Enter") {
            searchIncidents();
        }
    });
    document.getElementById("status-filter").addEventListener("change", filterIncidents);
    document.getElementById("type-filter").addEventListener("change", filterIncidents);
    document.getElementById("date-filter").addEventListener("change", filterIncidents);
    document.getElementById("reset-filters-btn").addEventListener("click", resetFilters);
    
    // Pagination
    document.getElementById("prev-page").addEventListener("click", previousPage);
    document.getElementById("next-page").addEventListener("click", nextPage);
    
    // Export functionality
    document.getElementById("generate-export-btn").addEventListener("click", generateExport);
    
    // Timestamp validation and calculation
    const timeInputs = document.querySelectorAll('input[type="datetime-local"]');
    timeInputs.forEach(input => {
        input.addEventListener("change", validateTimeSequence);
    });
    
    // Incident type hierarchy
    document.getElementById("incident-primary-type").addEventListener("change", updateSecondaryTypes);
    document.getElementById("incident-secondary-type").addEventListener("change", updateSpecificTypes);
}

/**
 * Check if the application is online or offline
 */
function checkOnlineStatus() {
    isOffline = !navigator.onLine;
    
    if (isOffline) {
        showToast("You are currently offline. Changes will be saved locally.", "warning");
    }
    
    // Listen for online/offline events
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
}

/**
 * Handle changes in online status
 */
function handleOnlineStatus(event) {
    isOffline = event.type === "offline";
    
    if (isOffline) {
        showToast("You are now offline. Changes will be saved locally.", "warning");
    } else {
        showToast("You are back online. Syncing changes...", "info");
        syncData();
    }
}

/**
 * Synchronize local data with server
 */
function syncData() {
    if (settings.storageMode === "local") {
        return; // No need to sync if using local storage only
    }
    
    // Implementation for syncing with server
    // This would typically involve sending local changes to the server
    // and retrieving any new changes from the server
    
    console.log("Syncing data with server...");
    
    // Placeholder for server sync logic
    
    settings.lastSyncTime = new Date().toISOString();
    saveSettings();
}

/**
 * Initialize the form with default values
 */
function initializeForm() {
    resetForm();
    
    // Set default incident ID (date-based)
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomId = Math.floor(1000 + Math.random() * 9000);
    document.getElementById("incident-id").value = `INC-${formattedDate}-${randomId}`;
    
    // Set default timestamp to now
    const nowString = now.toISOString().slice(0, 16);
    document.getElementById("incident-timestamp").value = nowString;
    document.getElementById("time-received").value = nowString;
    
    // Set default status
    document.getElementById("incident-status").value = settings.defaultStatus;
    
    // Set default location if configured
    if (settings.defaultLocation) {
        document.getElementById("location-address").value = settings.defaultLocation;
    }
    
    // Initialize the map
    if (typeof initializeMap === 'function') {
        initializeMap('location-map');
    }
}

/**
 * Reset the form to its initial state
 */
function resetForm() {
    document.getElementById("incident-form").reset();
    
    // Clear any dynamic content
    document.getElementById("units-container").innerHTML = `
    <div class="unit-entry">
        <div class="form-section">
            <h4>Unit #1</h4>
            <button type="button" class="remove-unit-btn secondary-btn small-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="form-group">
            <label for="unit-id-1">Unit ID</label>
            <input type="text" id="unit-id-1" name="unit-id-1" placeholder="E12, M7, etc." required>
        </div>
        
        <div class="form-group">
            <label for="unit-type-1">Unit Type</label>
            <select id="unit-type-1" name="unit-type-1" required>
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
                    <input type="text" name="personnel-1-1" placeholder="Name/ID">
                    <button type="button" class="remove-personnel-btn secondary-btn small-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <button type="button" class="add-personnel-btn secondary-btn small-btn">
                <i class="fas fa-plus"></i> Add Personnel
            </button>
        </div>
    </div>
    `;
    
    // Reset patients container to single patient
    resetPatientsContainer();
    
    // Reset attachments
    document.getElementById("attachments-list").innerHTML = "";
    
    // Reset form navigation
    navigateToStep(1);
    
    // Reset current incident
    currentIncident = null;
}

/**
 * Reset patients container to a single patient
 */
function resetPatientsContainer() {
    document.getElementById("patients-container").innerHTML = `
    <div class="patient-entry">
        <div class="form-section">
            <h4>Patient #1</h4>
            <button type="button" class="remove-patient-btn secondary-btn small-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="form-group">
            <label for="patient-age-1">Age</label>
            <input type="number" id="patient-age-1" name="patient-age-1" min="0" max="120">
        </div>
        
        <div class="form-group">
            <label for="patient-gender-1">Gender</label>
            <select id="patient-gender-1" name="patient-gender-1">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unknown">Unknown</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="patient-complaint-1">Chief Complaint</label>
            <textarea id="patient-complaint-1" name="patient-complaint-1"></textarea>
        </div>
        
        <div class="form-section">
            <h5>Vitals</h5>
            <div class="vitals-table">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>BP</th>
                            <th>Pulse</th>
                            <th>Resp</th>
                            <th>SpO2</th>
                            <th>GCS</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="vitals-rows-1">
                        <tr class="vitals-row">
                            <td>
                                <input type="datetime-local" name="vital-time-1-1">
                            </td>
                            <td>
                                <input type="text" name="vital-bp-1-1" placeholder="120/80">
                            </td>
                            <td>
                                <input type="number" name="vital-pulse-1-1" min="20" max="250">
                            </td>
                            <td>
                                <input type="number" name="vital-resp-1-1" min="4" max="60">
                            </td>
                            <td>
                                <input type="number" name="vital-spo2-1-1" min="50" max="100">
                            </td>
                            <td>
                                <input type="number" name="vital-gcs-1-1" min="3" max="15">
                            </td>
                            <td>
                                <button type="button" class="remove-vital-btn secondary-btn small-btn">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button type="button" class="add-vital-btn secondary-btn small-btn" data-patient="1">
                <i class="fas fa-plus"></i> Add Vital Signs
            </button>
        </div>
        
        <div class="form-section">
            <h5>Treatments</h5>
            <div id="treatments-container-1">
                <div class="treatment-entry">
                    <div class="form-group">
                        <label for="treatment-time-1-1">Time</label>
                        <input type="datetime-local" id="treatment-time-1-1" name="treatment-time-1-1">
                    </div>
                    <div class="form-group">
                        <label for="treatment-procedure-1-1">Procedure</label>
                        <input type="text" id="treatment-procedure-1-1" name="treatment-procedure-1-1">
                    </div>
                    <div class="form-group">
                        <label for="treatment-notes-1-1">Notes</label>
                        <textarea id="treatment-notes-1-1" name="treatment-notes-1-1"></textarea>
                    </div>
                    <button type="button" class="remove-treatment-btn secondary-btn small-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <button type="button" class="add-treatment-btn secondary-btn small-btn" data-patient="1">
                <i class="fas fa-plus"></i> Add Treatment
            </button>
        </div>
    </div>
    `;
    
    // Reset patient count
    document.getElementById("patient-count").value = "1";
}

/**
 * Navigate to a specific form step
 */
function navigateToStep(stepNumber) {
    // Validate the current step before proceeding
    const currentStep = document.querySelector(`.form-step[data-step="${stepNumber - 1}"]`);
    if (currentStep && !validateStep(currentStep)) {
        showToast("Please correct the errors before proceeding.", "error");
        return;
    }
    
    // Hide all steps
    const formSteps = document.querySelectorAll(".form-step");
    formSteps.forEach(step => {
        step.style.display = "none";
    });
    
    // Show requested step
    const targetStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.style.display = "block";
    }
    
    // Update progress indicator
    const progressSteps = document.querySelectorAll(".progress-step");
    progressSteps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove("active", "completed");
        
        if (stepNum === stepNumber) {
            step.classList.add("active");
        } else if (stepNum < stepNumber) {
            step.classList.add("completed");
        }
    });
    
    // Special actions for specific steps
    if (stepNumber === 2 && typeof updateMap === 'function') {
        // Refresh map when showing location step
        setTimeout(updateMap, 100);
    }
    
    if (stepNumber === 3) {
        // Recalculate times when showing dispatch step
        calculateResponseTimes();
    }
}

// We already have a DOMContentLoaded handler above, so we'll remove the duplicate one

// Define functions that might be missing but referenced
function validateStep(step) {
    console.log("Validating step:", step);
    // Simple validation - would be expanded in production
    return true;
}

function showToast(message, type) {
    console.log(`Toast (${type}): ${message}`);
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'info'}`;
    toast.innerHTML = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    } else {
        // Fallback to console if container not found
        console.log(`Toast: ${message} (${type})`);
    }
}

function calculateResponseTimes() {
    console.log("Calculating response times...");
    // Implementation would go here
}

function insertTextAtCursor(textArea, text) {
    if (!textArea) return;
    
    const startPos = textArea.selectionStart;
    const endPos = textArea.selectionEnd;
    const before = textArea.value.substring(0, startPos);
    const after = textArea.value.substring(endPos);
    
    textArea.value = before + text + after;
    textArea.selectionStart = textArea.selectionEnd = startPos + text.length;
    textArea.focus();
}

function updateNarrativeCharCount() {
    const narrative = document.getElementById("incident-narrative");
    const charCount = document.getElementById("narrative-char-count");
    
    if (narrative && charCount) {
        const count = narrative.value.length;
        charCount.textContent = `${count} characters`;
    }
}

function updateSecondaryTypes() {
    console.log("Updating secondary types based on primary type selection");
    
    const primaryType = document.getElementById("incident-primary-type").value;
    const secondaryTypeSelect = document.getElementById("incident-secondary-type");
    
    // Clear existing options except the placeholder
    while (secondaryTypeSelect.options.length > 1) {
        secondaryTypeSelect.remove(1);
    }
    
    // Exit if no primary type selected
    if (!primaryType) return;
    
    // Define secondary types based on primary selection
    const secondaryTypes = {
        "FIRE": [
            { value: "STRUCTURE", text: "Structure Fire" },
            { value: "VEHICLE", text: "Vehicle Fire" },
            { value: "WILDLAND", text: "Wildland Fire" },
            { value: "OTHER_FIRE", text: "Other Fire" }
        ],
        "EMS": [
            { value: "MEDICAL", text: "Medical Emergency" },
            { value: "TRAUMA", text: "Trauma" },
            { value: "CARDIAC", text: "Cardiac" },
            { value: "RESPIRATORY", text: "Respiratory" },
            { value: "STROKE", text: "Stroke" },
            { value: "OTHER_EMS", text: "Other EMS" }
        ],
        "HAZMAT": [
            { value: "SPILL", text: "Spill" },
            { value: "LEAK", text: "Leak" },
            { value: "GAS", text: "Gas" },
            { value: "OTHER_HAZMAT", text: "Other HAZMAT" }
        ],
        "RESCUE": [
            { value: "VEHICLE", text: "Vehicle Rescue" },
            { value: "WATER", text: "Water Rescue" },
            { value: "CONFINED_SPACE", text: "Confined Space" },
            { value: "OTHER_RESCUE", text: "Other Rescue" }
        ],
        "SERVICE": [
            { value: "ASSIST", text: "Public Assist" },
            { value: "LOCKOUT", text: "Lockout" },
            { value: "WATER_PROBLEM", text: "Water Problem" },
            { value: "OTHER_SERVICE", text: "Other Service" }
        ],
        "OTHER": [
            { value: "OTHER_INCIDENT", text: "Other Incident Type" }
        ]
    };
    
    // Add appropriate secondary types
    if (secondaryTypes[primaryType]) {
        secondaryTypes[primaryType].forEach(type => {
            const option = document.createElement("option");
            option.value = type.value;
            option.textContent = type.text;
            secondaryTypeSelect.appendChild(option);
        });
    }
    
    // Trigger update of specific types
    updateSpecificTypes();
}

function updateSpecificTypes() {
    console.log("Updating specific types based on secondary type selection");
    
    const secondaryType = document.getElementById("incident-secondary-type").value;
    const specificTypeSelect = document.getElementById("incident-specific-type");
    
    // Clear existing options except the placeholder
    while (specificTypeSelect.options.length > 1) {
        specificTypeSelect.remove(1);
    }
    
    // Exit if no secondary type selected
    if (!secondaryType) return;
    
    // First check if we have mappings for this secondary type in our specificTypeMappings
    if (specificTypeMappings[secondaryType]) {
        console.log(`Using specific type mappings for ${secondaryType} from specificTypeMappings`);
        
        // Add options from the mappings
        specificTypeMappings[secondaryType].forEach(type => {
            const option = document.createElement("option");
            option.value = type.value;
            option.textContent = type.text; 
            specificTypeSelect.appendChild(option);
        });
    } else {
        // Fall back to the default NFIRS code-based specific types
        console.log(`No custom mappings found for ${secondaryType}, using default NFIRS codes`);
        
        // Define specific types based on secondary selection
        const specificTypes = {
            // Fire related specific types
            "STRUCTURE": [
                { value: "111", text: "Building fire (111)" },
                { value: "112", text: "Fires in structures other than building (112)" },
                { value: "113", text: "Cooking fire, confined to container (113)" },
                { value: "114", text: "Chimney or flue fire (114)" },
                { value: "115", text: "Incinerator overload/malfunction (115)" },
                { value: "116", text: "Fuel burner/boiler malfunction (116)" }
            ],
            "VEHICLE": [
                { value: "130", text: "Mobile property (vehicle) fire (130)" },
                { value: "131", text: "Passenger vehicle fire (131)" },
                { value: "132", text: "Road freight/transport vehicle fire (132)" },
                { value: "133", text: "Rail vehicle fire (133)" },
                { value: "134", text: "Water vehicle fire (134)" },
                { value: "135", text: "Aircraft fire (135)" },
                { value: "136", text: "Self-propelled motor home/RV fire (136)" },
                { value: "138", text: "Off-road vehicle/equipment fire (138)" }
            ],
            "WILDLAND": [
                { value: "140", text: "Natural vegetation fire (140)" },
                { value: "141", text: "Forest, woods, or wildland fire (141)" },
                { value: "142", text: "Brush or brush/grass mixture fire (142)" },
                { value: "143", text: "Grass fire (143)" }
            ],
            "OTHER_FIRE": [
                { value: "100", text: "Fire, other (100)" },
                { value: "150", text: "Outside rubbish fire (150)" },
                { value: "154", text: "Dumpster/trash receptacle fire (154)" },
                { value: "160", text: "Special outside fire (160)" },
                { value: "162", text: "Outside equipment fire (162)" },
                { value: "163", text: "Outside gas/vapor explosion (163)" }
            ],
            
            // EMS related specific types
            "MEDICAL": [
                { value: "321", text: "EMS call, excluding vehicle accident with injury (321)" },
                { value: "300", text: "Rescue, EMS call, other (300)" },
                { value: "311", text: "Medical assist, assist EMS crew (311)" }
            ],
            "TRAUMA": [
                { value: "322", text: "Vehicle accident with injuries (322)" },
                { value: "323", text: "Motor vehicle/pedestrian accident (323)" },
                { value: "351", text: "Extrication of victim(s) from building (351)" },
                { value: "352", text: "Extrication of victim(s) from vehicle (352)" },
                { value: "357", text: "Extrication of victim(s) from machinery (357)" }
            ],
            "CARDIAC": [
                { value: "321", text: "EMS call - Cardiac emergency (321)" }
            ],
            "RESPIRATORY": [
                { value: "321", text: "EMS call - Respiratory emergency (321)" }
            ],
            "STROKE": [
                { value: "321", text: "EMS call - Stroke/CVA (321)" }
            ],
            "OTHER_EMS": [
                { value: "320", text: "Emergency medical service incident, other (320)" },
                { value: "381", text: "Rescue or EMS standby (381)" }
            ],
            
            // HAZMAT related specific types
            "SPILL": [
                { value: "411", text: "Gasoline or flammable liquid spill (411)" },
                { value: "413", text: "Oil or combustible liquid spill (413)" }
            ],
            "LEAK": [
                { value: "412", text: "Gas leak (natural gas or LPG) (412)" },
                { value: "422", text: "Chemical spill or leak (422)" },
                { value: "423", text: "Refrigeration leak (423)" }
            ],
            "GAS": [
                { value: "412", text: "Gas leak (natural gas or LPG) (412)" },
                { value: "424", text: "Carbon monoxide incident (424)" }
            ],
            "OTHER_HAZMAT": [
                { value: "400", text: "Hazardous condition, other (400)" },
                { value: "410", text: "Combustible/flammable gas/liquid condition (410)" },
                { value: "420", text: "Toxic condition, other (420)" },
                { value: "421", text: "Chemical hazard (no spill or leak) (421)" },
                { value: "451", text: "Biological hazard, confirmed or suspected (451)" }
            ],
            
            // RESCUE related specific types
            "VEHICLE": [
                { value: "322", text: "Vehicle accident with injuries (322)" },
                { value: "352", text: "Extrication of victim(s) from vehicle (352)" }
            ],
            "WATER": [
                { value: "360", text: "Water & ice related rescue, other (360)" },
                { value: "361", text: "Swimming/recreational water rescue (361)" },
                { value: "362", text: "Ice rescue (362)" },
                { value: "363", text: "Swift water rescue (363)" },
                { value: "364", text: "Surf rescue (364)" },
                { value: "365", text: "Watercraft rescue (365)" }
            ],
            "CONFINED_SPACE": [
                { value: "355", text: "Confined space rescue (355)" }
            ],
            "OTHER_RESCUE": [
                { value: "350", text: "Extrication, rescue, other (350)" },
                { value: "353", text: "Removal of victim(s) from stalled elevator (353)" },
                { value: "354", text: "Trench/below-grade rescue (354)" },
                { value: "356", text: "High angle rescue (356)" },
                { value: "370", text: "Electrical rescue (370)" }
            ],
            
            // SERVICE related specific types
            "ASSIST": [
                { value: "510", text: "Person in distress, other (510)" },
                { value: "551", text: "Assist police or other governmental agency (551)" },
                { value: "553", text: "Public service (553)" },
                { value: "554", text: "Assist invalid (554)" }
            ],
            "LOCKOUT": [
                { value: "511", text: "Lock-out (511)" }
            ],
            "WATER_PROBLEM": [
                { value: "520", text: "Water problem, other (520)" },
                { value: "521", text: "Water evacuation (521)" },
                { value: "522", text: "Water or steam leak (522)" }
            ],
            "OTHER_SERVICE": [
                { value: "500", text: "Service call, other (500)" },
                { value: "531", text: "Smoke or odor removal (531)" },
                { value: "542", text: "Animal rescue (542)" },
                { value: "561", text: "Unauthorized burning (561)" },
                { value: "571", text: "Cover assignment, standby, moveup (571)" }
            ],
            
            // OTHER catch-all specific types
            "OTHER_INCIDENT": [
                { value: "900", text: "Special type of incident, other (900)" },
                { value: "911", text: "Citizen complaint (911)" }
            ]
        };
        
        // Add appropriate specific types
        if (specificTypes[secondaryType]) {
            specificTypes[secondaryType].forEach(type => {
                const option = document.createElement("option");
                option.value = type.value;
                option.textContent = type.text;
                specificTypeSelect.appendChild(option);
            });
        } else {
            console.warn(`No specific types defined for secondary type: ${secondaryType}`);
        }
    }
    
    // If this is the NFIRS-specific field, also update the NFIRS code field
    updateNFIRSIncidentTypeCode();
}

/**
 * Update the NFIRS incident type code field based on selection
 */
function updateNFIRSIncidentTypeCode() {
    console.log("Updating NFIRS incident type code based on specific type selection");
    
    const specificType = document.getElementById("incident-specific-type").value;
    const nfirsCodeSelect = document.getElementById("nfirs-incident-type");
    
    if (!specificType || !nfirsCodeSelect) return;
    
    // Check if the specific type is a numeric NFIRS code (like 111, 321, etc.)
    if (/^\d+$/.test(specificType)) {
        console.log(`Setting NFIRS code to ${specificType} from specific type selection`);
        nfirsCodeSelect.value = specificType;
        
        // Trigger change event to update any dependent fields
        const event = new Event('change');
        nfirsCodeSelect.dispatchEvent(event);
    } else {
        // Look for a mapping in specificTypes to find an NFIRS code
        const secondaryType = document.getElementById("incident-secondary-type").value;
        if (secondaryType && specificTypeMappings[secondaryType]) {
            const mappings = specificTypeMappings[secondaryType];
            for (const mapping of mappings) {
                if (mapping.value === specificType && mapping.nfirsCode) {
                    console.log(`Found NFIRS code ${mapping.nfirsCode} for specific type ${specificType}`);
                    nfirsCodeSelect.value = mapping.nfirsCode;
                    
                    // Trigger change event
                    const event = new Event('change');
                    nfirsCodeSelect.dispatchEvent(event);
                    break;
                }
            }
        }
    }
}

/**
 * NFIRS code mappings for specific types
 * This provides a way to map our custom specific types to standard NFIRS codes
 */
const specificTypeMappings = {
    // Structure fire mappings
    "STRUCTURE": [
        { value: "Single_Family", text: "Single Family Dwelling", nfirsCode: "111" },
        { value: "Multi_Family", text: "Multi-Family Dwelling", nfirsCode: "111" },
        { value: "Commercial", text: "Commercial Building", nfirsCode: "111" },
        { value: "Industrial", text: "Industrial Building", nfirsCode: "111" },
        { value: "Storage", text: "Storage Building", nfirsCode: "112" },
        { value: "Outbuilding", text: "Shed/Outbuilding", nfirsCode: "112" },
        { value: "Kitchen", text: "Kitchen Fire", nfirsCode: "113" },
        { value: "Chimney", text: "Chimney Fire", nfirsCode: "114" },
        { value: "Trash", text: "Trash/Rubbish Fire", nfirsCode: "118" }
    ],
    
    // Vehicle fire mappings
    "VEHICLE": [
        { value: "Passenger", text: "Passenger Vehicle", nfirsCode: "131" },
        { value: "Commercial", text: "Commercial Vehicle", nfirsCode: "132" },
        { value: "RV", text: "RV/Camper", nfirsCode: "136" },
        { value: "Aircraft", text: "Aircraft", nfirsCode: "135" },
        { value: "Boat", text: "Boat/Watercraft", nfirsCode: "134" }
    ],
    
    // Wildland fire mappings
    "WILDLAND": [
        { value: "Forest", text: "Forest/Woods", nfirsCode: "141" },
        { value: "Brush", text: "Brush", nfirsCode: "142" },
        { value: "Grass", text: "Grass", nfirsCode: "143" }
    ],
    
    // EMS mappings
    "MEDICAL": [
        { value: "General", text: "General Medical", nfirsCode: "321" },
        { value: "Cardiac", text: "Cardiac Emergency", nfirsCode: "321" },
        { value: "Respiratory", text: "Respiratory Emergency", nfirsCode: "321" },
        { value: "Diabetic", text: "Diabetic Emergency", nfirsCode: "321" },
        { value: "Allergic", text: "Allergic Reaction", nfirsCode: "321" },
        { value: "Seizure", text: "Seizure", nfirsCode: "321" },
        { value: "Poisoning", text: "Poisoning/Drug Overdose", nfirsCode: "321" }
    ],
    
    "TRAUMA": [
        { value: "Fall", text: "Fall", nfirsCode: "321" },
        { value: "Laceration", text: "Laceration/Bleeding", nfirsCode: "321" },
        { value: "MVA", text: "Motor Vehicle Accident", nfirsCode: "322" },
        { value: "Assault", text: "Assault", nfirsCode: "321" },
        { value: "Burns", text: "Burns", nfirsCode: "321" },
        { value: "Shooting", text: "Shooting", nfirsCode: "321" },
        { value: "Stabbing", text: "Stabbing", nfirsCode: "321" }
    ],
    
    // HAZMAT mappings
    "SPILL": [
        { value: "Gasoline", text: "Gasoline Spill", nfirsCode: "411" },
        { value: "Diesel", text: "Diesel Spill", nfirsCode: "411" },
        { value: "Oil", text: "Oil Spill", nfirsCode: "413" },
        { value: "Chemical", text: "Chemical Spill", nfirsCode: "422" }
    ],
    
    "LEAK": [
        { value: "Natural_Gas", text: "Natural Gas Leak", nfirsCode: "412" },
        { value: "Propane", text: "Propane Leak", nfirsCode: "412" },
        { value: "CO", text: "Carbon Monoxide", nfirsCode: "424" },
        { value: "Chemical", text: "Chemical Leak", nfirsCode: "422" }
    ]
};

function validateTimeSequence() {
    console.log("Validating time sequence");
    // Implementation would go here
}

function setupAutosave() {
    console.log("Setting up autosave");
    // Implementation would go here
}

function loadIncidents() {
    console.log("Loading incidents");
    // Implementation would go here
}

function addUnitEntry() {
    console.log("Adding unit entry");
    // Implementation would go here
}

function addPatientEntry() {
    console.log("Adding patient entry");
    // Implementation would go here
}

function addVitalSigns(patientIndex) {
    console.log("Adding vital signs for patient", patientIndex);
    // Implementation would go here
}

function addTreatment(patientIndex) {
    console.log("Adding treatment for patient", patientIndex);
    // Implementation would go here
}

function addPersonnel(unitIndex) {
    console.log("Adding personnel for unit", unitIndex);
    // Implementation would go here
}

function updatePatientCount(count) {
    console.log("Updating patient count to", count);
    // Implementation would go here
}

function geocodeAddress() {
    console.log("Main geocodeAddress function called");
    // We'll use the implementation from incident-map.js
    if (typeof window.mapGeocode === 'function') {
        window.mapGeocode();
        return;
    } else {
        console.log("mapGeocode function not found, using fallback implementation");
        const addressInput = document.getElementById('location-address');
        const latInput = document.getElementById('location-latitude');
        const lngInput = document.getElementById('location-longitude');
        
        if (!addressInput || !addressInput.value) {
            showToast("Please enter an address to geocode", "error");
            return;
        }
        
        // Show loading state
        const geocodeBtn = document.getElementById('geocode-btn');
        if (geocodeBtn) {
            geocodeBtn.disabled = true;
            geocodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        try {
            // Create a geocoding service
            const geocoder = new google.maps.Geocoder();
            
            // Geocode the address
            geocoder.geocode({ 'address': addressInput.value }, function(results, status) {
                // Reset button state
                if (geocodeBtn) {
                    geocodeBtn.disabled = false;
                    geocodeBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Geocode';
                }
                
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    // Get the coordinates
                    const location = results[0].geometry.location;
                    
                    // Update the inputs
                    latInput.value = location.lat();
                    lngInput.value = location.lng();
                    
                    console.log("Geocoding successful. Lat:", location.lat(), "Lng:", location.lng());
                    
                    // Update the map if available
                    if (typeof updateMap === 'function') {
                        updateMap();
                    }
                    
                    showToast("Address geocoded successfully", "success");
                } else {
                    console.error("Geocoding failed:", status);
                    showToast("Failed to geocode address. Please check and try again.", "error");
                }
            });
        } catch (error) {
            console.error("Error in geocoding:", error);
            if (geocodeBtn) {
                geocodeBtn.disabled = false;
                geocodeBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Geocode';
            }
            showToast("Error geocoding address: " + error.message, "error");
        }
    }
}

function getCurrentLocation() {
    console.log("Getting current location");
    const latInput = document.getElementById('location-latitude');
    const lngInput = document.getElementById('location-longitude');
    
    // Show loading state
    const locationBtn = document.getElementById('current-location-btn');
    if (locationBtn) {
        locationBtn.disabled = true;
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                // Reset button state
                if (locationBtn) {
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
                }
                
                // Get coordinates
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Update inputs
                latInput.value = lat.toFixed(6);
                lngInput.value = lng.toFixed(6);
                
                // Try to reverse geocode to get address using Nominatim
                const timestamp = new Date().getTime();
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&_=${timestamp}`;
                
                fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'FireEMS-Tool/1.0' // Nominatim requires a user agent
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.display_name) {
                        // Update address field
                        const addressInput = document.getElementById('location-address');
                        if (addressInput) {
                            addressInput.value = data.display_name;
                            console.log("Address field updated with:", data.display_name);
                        }
                    }
                })
                .catch(error => {
                    console.error("Error in reverse geocoding:", error);
                });
                
                // Update the map if available
                if (typeof updateMap === 'function') {
                    updateMap();
                } else if (typeof setLocationFromMap === 'function') {
                    setLocationFromMap(lat, lng);
                }
                
                showToast("Current location detected", "success");
            },
            // Error callback
            function(error) {
                // Reset button state
                if (locationBtn) {
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
                }
                
                console.error("Geolocation error:", error);
                let errorMsg = "Unable to retrieve your location. ";
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg += "Please allow location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg += "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMsg += "The request to get your location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMsg += "An unknown error occurred.";
                        break;
                }
                
                showToast(errorMsg, "error");
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        // Reset button state
        if (locationBtn) {
            locationBtn.disabled = false;
            locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
        }
        
        showToast("Geolocation is not supported by your browser", "error");
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    console.log("Form submitted");
    // Implementation would go here
}

function saveDraft() {
    console.log("Saving draft");
    // Implementation would go here
}

function showIncidentList() {
    console.log("Showing incident list");
    
    // Hide other containers
    document.getElementById("incident-form-container").style.display = "none";
    document.getElementById("export-container").style.display = "none";
    document.getElementById("settings-container").style.display = "none";
    document.getElementById("cad-import-container").style.display = "none";
    
    // Show incident list container
    document.getElementById("incident-list-container").style.display = "block";
    
    // Refresh the list (placeholder for full implementation)
    const tbody = document.getElementById("incident-list");
    tbody.innerHTML = '<tr><td colspan="6">No incidents found. Click "New Incident" to create one.</td></tr>';
}

function showExportOptions() {
    console.log("Showing export options");
    
    // Hide other containers
    document.getElementById("incident-form-container").style.display = "none";
    document.getElementById("incident-list-container").style.display = "none";
    document.getElementById("settings-container").style.display = "none";
    document.getElementById("cad-import-container").style.display = "none";
    
    // Show export container
    document.getElementById("export-container").style.display = "block";
}

function showSettings() {
    console.log("Showing settings");
    
    // Hide other containers
    document.getElementById("incident-form-container").style.display = "none";
    document.getElementById("incident-list-container").style.display = "none";
    document.getElementById("export-container").style.display = "none";
    document.getElementById("cad-import-container").style.display = "none";
    
    // Show settings container
    document.getElementById("settings-container").style.display = "block";
}

function showNewIncidentForm() {
    console.log("Showing new incident form");
    
    // Hide other containers
    document.getElementById("incident-list-container").style.display = "none";
    document.getElementById("export-container").style.display = "none";
    document.getElementById("settings-container").style.display = "none";
    document.getElementById("cad-import-container").style.display = "none";
    
    // Show form container
    document.getElementById("incident-form-container").style.display = "block";
    
    // Reset form to initial state
    resetForm();
    
    // Initialize the form with default values
    initializeForm();
}

function updateSettings() {
    console.log("Updating settings");
    // Implementation would go here
}

function resetSettings() {
    console.log("Resetting settings");
    // Implementation would go here
}

function confirmClearData() {
    console.log("Confirming data clear");
    // Implementation would go here
}

function exportSettings() {
    console.log("Exporting settings");
    // Implementation would go here
}

function importSettings() {
    console.log("Importing settings");
    // Implementation would go here
}

function handleFileUpload() {
    console.log("Handling file upload");
    // Implementation would go here
}

function activateCamera() {
    console.log("Activating camera");
    // Implementation would go here
}

function searchIncidents() {
    console.log("Searching incidents");
    // Implementation would go here
}

function filterIncidents() {
    console.log("Filtering incidents");
    // Implementation would go here
}

function resetFilters() {
    console.log("Resetting filters");
    // Implementation would go here
}

function previousPage() {
    console.log("Going to previous page");
    // Implementation would go here
}

function nextPage() {
    console.log("Going to next page");
    // Implementation would go here
}

function generateExport() {
    console.log("Generating export");
    // Implementation would go here
}

function formatDate(date) {
    return date ? date.toLocaleDateString() : '';
}

// Log when the IIFE completes
console.log("incident-logger.js IIFE executed");

})(); // End of IIFE
