/**
 * FireEMS.ai Incident Logger - Form Component
 * 
 * This component handles form-specific functionality for the Incident Logger.
 */

/**
 * Add a new unit entry to the form
 */
function addUnitEntry() {
    const unitsContainer = document.getElementById("units-container");
    const unitCount = unitsContainer.querySelectorAll(".unit-entry").length + 1;
    
    const unitEntry = document.createElement("div");
    unitEntry.className = "unit-entry";
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
function addPersonnel(unitIndex) {
    const unitEntry = document.querySelectorAll(".unit-entry")[unitIndex - 1];
    const personnelList = unitEntry.querySelector(".personnel-list");
    const personnelCount = personnelList.querySelectorAll(".personnel-entry").length + 1;
    
    const personnelEntry = document.createElement("div");
    personnelEntry.className = "personnel-entry";
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
function updatePatientCount(count) {
    const patientsContainer = document.getElementById("patients-container");
    const currentCount = patientsContainer.querySelectorAll(".patient-entry").length;
    
    if (count > currentCount) {
        // Add more patient entries
        for (let i = currentCount + 1; i <= count; i++) {
            addPatientEntry();
        }
    } else if (count < currentCount) {
        // Remove excess patient entries
        const entries = patientsContainer.querySelectorAll(".patient-entry");
        for (let i = count; i < currentCount; i++) {
            entries[i].remove();
        }
    }
}

/**
 * Add a new patient entry to the form
 */
function addPatientEntry() {
    const patientsContainer = document.getElementById("patients-container");
    const patientCount = patientsContainer.querySelectorAll(".patient-entry").length + 1;
    
    // Get the patient template and replace placeholders
    const template = document.getElementById("patient-template").innerHTML;
    const patientHtml = template.replace(/\{\{index\}\}/g, patientCount);
    
    // Create a temporary container to hold the HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = patientHtml;
    
    // Append the new patient entry
    patientsContainer.appendChild(tempContainer.firstElementChild);
    
    // Update the patient count input
    document.getElementById("patient-count").value = patientCount;
}

/**
 * Add a vital signs row to a patient
 * @param {number} patientIndex - The index of the patient
 */
function addVitalSigns(patientIndex) {
    const vitalsTable = document.getElementById(`vitals-rows-${patientIndex}`);
    const vitalCount = vitalsTable.querySelectorAll(".vitals-row").length + 1;
    
    const row = document.createElement("tr");
    row.className = "vitals-row";
    row.innerHTML = `
        <td>
            <input type="datetime-local" name="vital-time-${patientIndex}-${vitalCount}">
        </td>
        <td>
            <input type="text" name="vital-bp-${patientIndex}-${vitalCount}" placeholder="120/80">
        </td>
        <td>
            <input type="number" name="vital-pulse-${patientIndex}-${vitalCount}" min="20" max="250">
        </td>
        <td>
            <input type="number" name="vital-resp-${patientIndex}-${vitalCount}" min="4" max="60">
        </td>
        <td>
            <input type="number" name="vital-spo2-${patientIndex}-${vitalCount}" min="50" max="100">
        </td>
        <td>
            <input type="number" name="vital-gcs-${patientIndex}-${vitalCount}" min="3" max="15">
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
function addTreatment(patientIndex) {
    const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
    const treatmentCount = treatmentsContainer.querySelectorAll(".treatment-entry").length + 1;
    
    const treatmentEntry = document.createElement("div");
    treatmentEntry.className = "treatment-entry";
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
 * Update the character count for the narrative textarea
 */
function updateNarrativeCharCount() {
    const narrative = document.getElementById("incident-narrative");
    const charCount = document.getElementById("narrative-char-count");
    
    const count = narrative.value.length;
    charCount.textContent = `${count} ${count === 1 ? 'character' : 'characters'}`;
    
    // Add visual feedback for minimum length
    if (count < 20) {
        charCount.style.color = "#ff3b30";
    } else {
        charCount.style.color = "";
    }
}

/**
 * Insert text at the current cursor position in a textarea
 * @param {HTMLElement} textarea - The textarea element
 * @param {string} text - The text to insert
 */
function insertTextAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos);
    
    // Set cursor position after the inserted text
    textarea.selectionStart = startPos + text.length;
    textarea.selectionEnd = startPos + text.length;
    
    // Focus the textarea
    textarea.focus();
    
    // Update character count
    if (textarea.id === "incident-narrative") {
        updateNarrativeCharCount();
    }
}

/**
 * Update secondary incident types based on primary type selection
 */
function updateSecondaryTypes() {
    const primaryType = document.getElementById("incident-primary-type").value;
    const secondaryTypeSelect = document.getElementById("incident-secondary-type");
    
    // Clear existing options
    secondaryTypeSelect.innerHTML = '<option value="">Select Secondary Type</option>';
    
    // Also clear specific type
    document.getElementById("incident-specific-type").innerHTML = '<option value="">Select Specific Type</option>';
    
    // If no primary type selected, just return
    if (!primaryType) return;
    
    // Define secondary types based on primary selection
    const secondaryTypes = {
        "FIRE": [
            "Structure Fire",
            "Vehicle Fire",
            "Wildland Fire",
            "Trash Fire",
            "Explosion",
            "Fire Alarm"
        ],
        "EMS": [
            "Medical Emergency",
            "Trauma",
            "Cardiac",
            "Respiratory",
            "Stroke",
            "Psychiatric",
            "Overdose"
        ],
        "HAZMAT": [
            "Gas Leak",
            "Chemical Spill",
            "Fuel Spill",
            "Carbon Monoxide",
            "Radiation Incident"
        ],
        "RESCUE": [
            "Vehicle Extrication",
            "Water Rescue",
            "High Angle Rescue",
            "Confined Space",
            "Trench Rescue",
            "Structural Collapse"
        ],
        "SERVICE": [
            "Public Assist",
            "Lift Assist",
            "Lockout",
            "Water Problem",
            "Animal Problem"
        ],
        "OTHER": [
            "Mutual Aid",
            "Standby",
            "Investigation",
            "Cancelled",
            "False Alarm"
        ]
    };
    
    // Add options based on primary type
    if (secondaryTypes[primaryType]) {
        secondaryTypes[primaryType].forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            secondaryTypeSelect.appendChild(option);
        });
    }
}

/**
 * Update specific incident types based on secondary type selection
 */
function updateSpecificTypes() {
    const primaryType = document.getElementById("incident-primary-type").value;
    const secondaryType = document.getElementById("incident-secondary-type").value;
    const specificTypeSelect = document.getElementById("incident-specific-type");
    
    // Clear existing options
    specificTypeSelect.innerHTML = '<option value="">Select Specific Type</option>';
    
    // If no secondary type selected, just return
    if (!secondaryType) return;
    
    // Define specific types based on primary and secondary selection
    const specificTypes = {
        "FIRE": {
            "Structure Fire": [
                "Single Family Dwelling",
                "Multi-Family Dwelling",
                "Commercial Building",
                "Industrial Building",
                "High-Rise",
                "Outbuilding"
            ],
            "Vehicle Fire": [
                "Passenger Vehicle",
                "Commercial Vehicle",
                "Recreational Vehicle",
                "Marine Vessel",
                "Aircraft"
            ],
            "Wildland Fire": [
                "Brush/Grass",
                "Forest",
                "Agricultural",
                "Interface"
            ],
            "Fire Alarm": [
                "Smoke Detector",
                "Heat Detector",
                "Sprinkler Activation",
                "Pull Station",
                "Carbon Monoxide"
            ]
        },
        "EMS": {
            "Medical Emergency": [
                "Sick Person",
                "Unconscious Person",
                "Allergic Reaction",
                "Diabetic Problem",
                "Headache",
                "Seizure",
                "Abdominal Pain"
            ],
            "Trauma": [
                "Fall",
                "Assault",
                "Penetrating Trauma",
                "Blunt Trauma",
                "Burns",
                "Electrocution"
            ],
            "Cardiac": [
                "Chest Pain",
                "Cardiac Arrest",
                "Palpitations",
                "Hypertension",
                "Syncope"
            ],
            "Respiratory": [
                "Shortness of Breath",
                "Respiratory Arrest",
                "Asthma",
                "COPD",
                "Airway Obstruction"
            ],
            "Stroke": [
                "CVA",
                "TIA",
                "Facial Droop",
                "Slurred Speech",
                "Weakness"
            ]
        }
    };
    
    // Add options based on primary and secondary type
    if (specificTypes[primaryType] && specificTypes[primaryType][secondaryType]) {
        specificTypes[primaryType][secondaryType].forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            specificTypeSelect.appendChild(option);
        });
    }
}

/**
 * Handle file upload for attachments
 * @param {Event} event - The file input change event
 */
function handleFileUpload(event) {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    // Process each file
    Array.from(files).forEach(file => {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showToast(`File ${file.name} exceeds 5MB limit.`, "error");
            return;
        }
        
        // Create attachment entry
        const attachmentsList = document.getElementById("attachments-list");
        const attachment = document.createElement("div");
        attachment.className = "attachment-item";
        
        // Determine icon based on file type
        let icon = "file";
        if (file.type.startsWith("image/")) {
            icon = "image";
        } else if (file.type.startsWith("video/")) {
            icon = "video";
        } else if (file.type.startsWith("audio/")) {
            icon = "music";
        } else if (file.type.includes("pdf")) {
            icon = "file-pdf";
        }
        
        attachment.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span class="attachment-name">${file.name}</span>
            <span class="attachment-size">${formatFileSize(file.size)}</span>
            <button type="button" class="remove-attachment-btn secondary-btn small-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        attachmentsList.appendChild(attachment);
        
        // If it's an image, create a preview
        if (file.type.startsWith("image/")) {
            createImagePreview(file, attachment);
        }
    });
    
    // Clear the file input
    event.target.value = "";
}

/**
 * Create an image preview for an image attachment
 * @param {File} file - The image file
 * @param {HTMLElement} container - The attachment container
 */
function createImagePreview(file, container) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const preview = document.createElement("div");
        preview.className = "attachment-preview";
        preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
        
        container.appendChild(preview);
    };
    
    reader.readAsDataURL(file);
}

/**
 * Format file size in a human-readable format
 * @param {number} size - The file size in bytes
 * @returns {string} - Formatted file size
 */
function formatFileSize(size) {
    if (size < 1024) {
        return size + " bytes";
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + " KB";
    } else {
        return (size / (1024 * 1024)).toFixed(1) + " MB";
    }
}

/**
 * Activate device camera for photo capture
 */
function activateCamera() {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("Camera access not supported in this browser.", "error");
        return;
    }
    
    // Create camera modal content
    const modalContent = document.createElement("div");
    modalContent.className = "camera-modal";
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
    showModal("Capture Photo", modalContent, 
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
    document.getElementById("modal-confirm").style.display = "none";
    
    // Initialize camera
    let facingMode = "environment"; // Use rear camera first if available
    initCamera(facingMode);
    
    // Add event listeners
    document.getElementById("take-photo-btn").addEventListener("click", takePhoto);
    document.getElementById("switch-camera-btn").addEventListener("click", function() {
        facingMode = facingMode === "environment" ? "user" : "environment";
        initCamera(facingMode);
    });
}

/**
 * Initialize the camera stream
 * @param {string} facingMode - The camera to use ("environment" or "user")
 */
function initCamera(facingMode) {
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
    const video = document.getElementById("camera-preview");
    
    // Access the camera
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            // Store stream for later use
            window.cameraStream = stream;
            
            // Set video source
            video.srcObject = stream;
        })
        .catch(function(error) {
            console.error("Camera error:", error);
            showToast("Error accessing camera: " + error.message, "error");
        });
}

/**
 * Take a photo from the camera stream
 */
function takePhoto() {
    const video = document.getElementById("camera-preview");
    const canvas = document.getElementById("camera-canvas");
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to a data URL
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    
    // Add the image as an attachment
    addImageAttachment(imageDataUrl, "Camera Photo");
    
    // Close the modal
    closeModal();
    
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
function addImageAttachment(dataUrl, name) {
    // Create attachment entry
    const attachmentsList = document.getElementById("attachments-list");
    const attachment = document.createElement("div");
    attachment.className = "attachment-item";
    attachment.innerHTML = `
        <i class="fas fa-image"></i>
        <span class="attachment-name">${name}</span>
        <span class="attachment-size">Camera Photo</span>
        <button type="button" class="remove-attachment-btn secondary-btn small-btn">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add image preview
    const preview = document.createElement("div");
    preview.className = "attachment-preview";
    preview.innerHTML = `<img src="${dataUrl}" alt="${name}">`;
    
    attachment.appendChild(preview);
    attachmentsList.appendChild(attachment);
    
    // Store the image data (would normally be uploaded to the server)
    // For local storage demo, we would convert to a smaller size or just store the reference
    
    showToast("Photo captured and attached", "success");
}

/**
 * Load all incident data into the form for editing
 * @param {Object} incident - The incident data
 */
function loadIncidentIntoForm(incident) {
    if (!incident) return;
    
    // Store current incident ID
    currentIncident = incident.id;
    
    // Reset form first
    resetForm();
    
    // Basic info
    document.getElementById("incident-id").value = incident.id;
    document.getElementById("incident-timestamp").value = incident.timestamp || "";
    document.getElementById("incident-status").value = incident.status || "";
    
    // Incident type
    if (incident.incident_type) {
        document.getElementById("incident-primary-type").value = incident.incident_type.primary || "";
        updateSecondaryTypes();
        document.getElementById("incident-secondary-type").value = incident.incident_type.secondary || "";
        updateSpecificTypes();
        document.getElementById("incident-specific-type").value = incident.incident_type.specific || "";
    }
    
    // Caller info
    if (incident.caller_info) {
        document.getElementById("caller-name").value = incident.caller_info.name || "";
        document.getElementById("caller-phone").value = incident.caller_info.phone || "";
        document.getElementById("caller-relationship").value = incident.caller_info.relationship || "";
    }
    
    // Location
    loadLocationFromIncident(incident);
    
    // Dispatch times
    if (incident.dispatch) {
        document.getElementById("time-received").value = incident.dispatch.time_received || "";
        document.getElementById("time-dispatched").value = incident.dispatch.time_dispatched || "";
        document.getElementById("time-enroute").value = incident.dispatch.time_enroute || "";
        document.getElementById("time-arrived").value = incident.dispatch.time_arrived || "";
        document.getElementById("time-transported").value = incident.dispatch.time_transported || "";
        document.getElementById("time-at-hospital").value = incident.dispatch.time_at_hospital || "";
        document.getElementById("time-cleared").value = incident.dispatch.time_cleared || "";
        
        // Calculate response times
        calculateResponseTimes();
    }
    
    // Units
    loadUnitsFromIncident(incident);
    
    // Patients
    loadPatientsFromIncident(incident);
    
    // Narrative
    document.getElementById("incident-narrative").value = incident.narrative || "";
    updateNarrativeCharCount();
    
    // Disposition
    loadDispositionFromIncident(incident);
    
    // Created by
    document.getElementById("created-by").value = incident.created_by || "";
    
    // Attachments
    // This would typically load attachment references
    
    // Navigate to first step
    navigateToStep(1);
}

/**
 * Load units data into the form
 * @param {Object} incident - The incident data
 */
function loadUnitsFromIncident(incident) {
    if (!incident.units || !incident.units.length) return;
    
    // Clear existing units
    document.getElementById("units-container").innerHTML = "";
    
    // Add each unit
    incident.units.forEach((unit, index) => {
        // Add unit entry
        addUnitEntry();
        
        // Set unit data
        const unitIndex = index + 1;
        document.getElementById(`unit-id-${unitIndex}`).value = unit.id || "";
        document.getElementById(`unit-type-${unitIndex}`).value = unit.type || "";
        
        // Clear default personnel entry
        const unitContainer = document.querySelectorAll(".unit-entry")[index];
        unitContainer.querySelector(".personnel-list").innerHTML = "";
        
        // Add personnel entries
        if (unit.personnel && unit.personnel.length) {
            unit.personnel.forEach((person, personIndex) => {
                const personnelEntry = document.createElement("div");
                personnelEntry.className = "personnel-entry";
                personnelEntry.innerHTML = `
                    <input type="text" name="personnel-${unitIndex}-${personIndex + 1}" placeholder="Name/ID" value="${person}">
                    <button type="button" class="remove-personnel-btn secondary-btn small-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                `;
                
                unitContainer.querySelector(".personnel-list").appendChild(personnelEntry);
            });
        } else {
            // Add one empty personnel entry
            const personnelEntry = document.createElement("div");
            personnelEntry.className = "personnel-entry";
            personnelEntry.innerHTML = `
                <input type="text" name="personnel-${unitIndex}-1" placeholder="Name/ID">
                <button type="button" class="remove-personnel-btn secondary-btn small-btn">
                    <i class="fas fa-minus"></i>
                </button>
            `;
            
            unitContainer.querySelector(".personnel-list").appendChild(personnelEntry);
        }
    });
}

/**
 * Load patients data into the form
 * @param {Object} incident - The incident data
 */
function loadPatientsFromIncident(incident) {
    if (!incident.patient_info || !incident.patient_info.details || !incident.patient_info.details.length) return;
    
    // Set patient count
    document.getElementById("patient-count").value = incident.patient_info.count || incident.patient_info.details.length;
    
    // Clear patients container
    document.getElementById("patients-container").innerHTML = "";
    
    // Add each patient
    incident.patient_info.details.forEach((patient, index) => {
        // Add patient entry
        addPatientEntry();
        
        // Set patient data
        const patientIndex = index + 1;
        document.getElementById(`patient-age-${patientIndex}`).value = patient.age || "";
        document.getElementById(`patient-gender-${patientIndex}`).value = patient.gender || "";
        document.getElementById(`patient-complaint-${patientIndex}`).value = patient.chief_complaint || "";
        
        // Clear default vitals entry
        const vitalsTable = document.getElementById(`vitals-rows-${patientIndex}`);
        vitalsTable.innerHTML = "";
        
        // Add vitals entries
        if (patient.vitals && patient.vitals.length) {
            patient.vitals.forEach((vital, vitalIndex) => {
                const vitalNum = vitalIndex + 1;
                const row = document.createElement("tr");
                row.className = "vitals-row";
                row.innerHTML = `
                    <td>
                        <input type="datetime-local" name="vital-time-${patientIndex}-${vitalNum}" value="${vital.time || ""}">
                    </td>
                    <td>
                        <input type="text" name="vital-bp-${patientIndex}-${vitalNum}" placeholder="120/80" value="${vital.bp || ""}">
                    </td>
                    <td>
                        <input type="number" name="vital-pulse-${patientIndex}-${vitalNum}" min="20" max="250" value="${vital.pulse || ""}">
                    </td>
                    <td>
                        <input type="number" name="vital-resp-${patientIndex}-${vitalNum}" min="4" max="60" value="${vital.respiration || ""}">
                    </td>
                    <td>
                        <input type="number" name="vital-spo2-${patientIndex}-${vitalNum}" min="50" max="100" value="${vital.spo2 || ""}">
                    </td>
                    <td>
                        <input type="number" name="vital-gcs-${patientIndex}-${vitalNum}" min="3" max="15" value="${vital.gcs || ""}">
                    </td>
                    <td>
                        <button type="button" class="remove-vital-btn secondary-btn small-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                vitalsTable.appendChild(row);
            });
        } else {
            // Add one empty vitals entry
            const row = document.createElement("tr");
            row.className = "vitals-row";
            row.innerHTML = `
                <td>
                    <input type="datetime-local" name="vital-time-${patientIndex}-1">
                </td>
                <td>
                    <input type="text" name="vital-bp-${patientIndex}-1" placeholder="120/80">
                </td>
                <td>
                    <input type="number" name="vital-pulse-${patientIndex}-1" min="20" max="250">
                </td>
                <td>
                    <input type="number" name="vital-resp-${patientIndex}-1" min="4" max="60">
                </td>
                <td>
                    <input type="number" name="vital-spo2-${patientIndex}-1" min="50" max="100">
                </td>
                <td>
                    <input type="number" name="vital-gcs-${patientIndex}-1" min="3" max="15">
                </td>
                <td>
                    <button type="button" class="remove-vital-btn secondary-btn small-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            vitalsTable.appendChild(row);
        }
        
        // Clear default treatments entry
        const treatmentsContainer = document.getElementById(`treatments-container-${patientIndex}`);
        treatmentsContainer.innerHTML = "";
        
        // Add treatment entries
        if (patient.treatment && patient.treatment.length) {
            patient.treatment.forEach((treatment, treatIndex) => {
                const treatNum = treatIndex + 1;
                const treatmentEntry = document.createElement("div");
                treatmentEntry.className = "treatment-entry";
                treatmentEntry.innerHTML = `
                    <div class="form-group">
                        <label for="treatment-time-${patientIndex}-${treatNum}">Time</label>
                        <input type="datetime-local" id="treatment-time-${patientIndex}-${treatNum}" name="treatment-time-${patientIndex}-${treatNum}" value="${treatment.time || ""}">
                    </div>
                    <div class="form-group">
                        <label for="treatment-procedure-${patientIndex}-${treatNum}">Procedure</label>
                        <input type="text" id="treatment-procedure-${patientIndex}-${treatNum}" name="treatment-procedure-${patientIndex}-${treatNum}" value="${treatment.procedure || ""}">
                    </div>
                    <div class="form-group">
                        <label for="treatment-notes-${patientIndex}-${treatNum}">Notes</label>
                        <textarea id="treatment-notes-${patientIndex}-${treatNum}" name="treatment-notes-${patientIndex}-${treatNum}">${treatment.notes || ""}</textarea>
                    </div>
                    <button type="button" class="remove-treatment-btn secondary-btn small-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                treatmentsContainer.appendChild(treatmentEntry);
            });
        } else {
            // Add one empty treatment entry
            const treatmentEntry = document.createElement("div");
            treatmentEntry.className = "treatment-entry";
            treatmentEntry.innerHTML = `
                <div class="form-group">
                    <label for="treatment-time-${patientIndex}-1">Time</label>
                    <input type="datetime-local" id="treatment-time-${patientIndex}-1" name="treatment-time-${patientIndex}-1">
                </div>
                <div class="form-group">
                    <label for="treatment-procedure-${patientIndex}-1">Procedure</label>
                    <input type="text" id="treatment-procedure-${patientIndex}-1" name="treatment-procedure-${patientIndex}-1">
                </div>
                <div class="form-group">
                    <label for="treatment-notes-${patientIndex}-1">Notes</label>
                    <textarea id="treatment-notes-${patientIndex}-1" name="treatment-notes-${patientIndex}-1"></textarea>
                </div>
                <button type="button" class="remove-treatment-btn secondary-btn small-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            treatmentsContainer.appendChild(treatmentEntry);
        }
    });
}

/**
 * Load disposition data into the form
 * @param {Object} incident - The incident data
 */
function loadDispositionFromIncident(incident) {
    if (!incident.disposition) return;
    
    // Set transported checkbox
    document.getElementById("transported").checked = incident.disposition.transported || false;
    
    // Show/hide relevant sections
    document.getElementById("transport-details").style.display = incident.disposition.transported ? "block" : "none";
    document.getElementById("no-transport-details").style.display = incident.disposition.transported ? "none" : "block";
    
    if (incident.disposition.transported) {
        // Set transport details
        if (incident.disposition.destination) {
            const selectElement = document.getElementById("destination");
            const destinationExists = Array.from(selectElement.options).some(option => option.value === incident.disposition.destination);
            
            if (destinationExists) {
                selectElement.value = incident.disposition.destination;
            } else {
                selectElement.value = "Other";
                document.getElementById("destination-other").style.display = "block";
                document.getElementById("destination-other-input").value = incident.disposition.destination;
            }
        }
        
        document.getElementById("transport-reason").value = incident.disposition.reason || "";
    } else {
        // Set no-transport details
        if (incident.disposition.reason) {
            const selectElement = document.getElementById("no-transport-reason");
            const reasonExists = Array.from(selectElement.options).some(option => option.value === incident.disposition.reason);
            
            if (reasonExists) {
                selectElement.value = incident.disposition.reason;
            } else {
                selectElement.value = "Other";
                document.getElementById("no-transport-other").style.display = "block";
                document.getElementById("no-transport-other-input").value = incident.disposition.reason;
            }
        }
    }
}
