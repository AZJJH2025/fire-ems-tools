/**
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
    
    // Form submission
    document.getElementById("incident-form").addEventListener("submit", handleFormSubmit);
    document.getElementById("save-draft-btn").addEventListener("click", saveDraft);
    
    // Location related functionality
    document.getElementById("geocode-btn").addEventListener("click", geocodeAddress);
    document.getElementById("current-location-btn").addEventListener("click", getCurrentLocation);
    
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
