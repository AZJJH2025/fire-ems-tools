/**
 * FireEMS.ai Incident Logger - NFIRS UI Integration
 * 
 * This file handles the UI integration of NFIRS functionality with the Incident Logger.
 */

// Initialize NFIRS UI components once the DOM is loaded and NFIRS_CODES is available
document.addEventListener('DOMContentLoaded', function() {
    // Check if NFIRS_CODES is available
    if (typeof NFIRS_CODES === 'undefined') {
        console.error("NFIRS_CODES is not defined. Loading the NFIRS codes module...");
        
        // Dynamically import the NFIRS codes
        import('./nfirs-codes.js')
            .then(module => {
                // Assign the imported codes to a global variable
                window.NFIRS_CODES = module.default;
                console.log("NFIRS_CODES loaded successfully");
                
                // Now initialize the components
                initNFIRSComponents();
            })
            .catch(error => {
                console.error("Failed to load NFIRS codes:", error);
            });
    } else {
        // NFIRS_CODES is already available, initialize directly
        initNFIRSComponents();
    }
});

/**
 * Initialize all NFIRS-related UI components
 */
function initNFIRSComponents() {
    console.log("Initializing NFIRS UI components");
    
    // Initialize NFIRS incident type selector
    initNFIRSIncidentTypeSelect();
    
    // Initialize NFIRS property use selector
    initNFIRSPropertyUseSelect();
    
    // Initialize NFIRS action taken selectors
    initNFIRSActionSelectors();
    
    // Initialize fire module UI (hidden by default)
    initFireModuleUI();
    
    // Add event listeners for NFIRS-related interactions
    addNFIRSEventListeners();
    
    // Register this component as loaded
    if (window.registerComponent) {
        window.registerComponent('nfirs');
    }
    
    console.log("NFIRS UI components initialized successfully");
}

/**
 * Initialize the NFIRS incident type dropdown with code options
 */
function initNFIRSIncidentTypeSelect() {
    const nfirsSelect = document.getElementById('nfirs-incident-type');
    if (!nfirsSelect) return;
    
    // Clear existing options except the placeholder
    while (nfirsSelect.options.length > 1) {
        nfirsSelect.remove(1);
    }
    
    // Group codes by series
    const codeGroups = {};
    
    // Process all incident type codes
    Object.entries(NFIRS_CODES.incidentTypes).forEach(([code, description]) => {
        // Determine the series (first digit of the code)
        const series = code.charAt(0);
        
        // Create the group if it doesn't exist
        if (!codeGroups[series]) {
            codeGroups[series] = [];
        }
        
        // Add this code to its group
        codeGroups[series].push({
            code: code,
            description: description
        });
    });
    
    // Series labels
    const seriesLabels = {
        '1': 'Fire (100s)',
        '2': 'Explosion/Overpressure (200s)',
        '3': 'Rescue & EMS (300s)',
        '4': 'Hazardous Condition (400s)',
        '5': 'Service Call (500s)',
        '6': 'Good Intent (600s)',
        '7': 'False Alarm (700s)',
        '8': 'Weather/Disaster (800s)',
        '9': 'Special Incident (900s)'
    };
    
    // Add options grouped by series
    Object.keys(codeGroups).sort().forEach(series => {
        // Create optgroup
        const optgroup = document.createElement('optgroup');
        optgroup.label = seriesLabels[series] || `${series}00 Series`;
        
        // Sort codes within the group
        codeGroups[series].sort((a, b) => parseInt(a.code) - parseInt(b.code));
        
        // Add each code to the group
        codeGroups[series].forEach(item => {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = `${item.code} - ${item.description}`;
            optgroup.appendChild(option);
        });
        
        // Add the group to the select
        nfirsSelect.appendChild(optgroup);
    });
}

/**
 * Initialize the NFIRS property use dropdown with code options
 */
function initNFIRSPropertyUseSelect() {
    const propertySelect = document.getElementById('nfirs-property-use');
    if (!propertySelect) return;
    
    // Clear existing options except the placeholder
    while (propertySelect.options.length > 1) {
        propertySelect.remove(1);
    }
    
    // Group codes by series
    const codeGroups = {};
    
    // Process all property use codes
    Object.entries(NFIRS_CODES.propertyUse).forEach(([code, description]) => {
        // Skip special codes like NNN
        if (!/^\d/.test(code)) return;
        
        // Determine the series (first digit of the code)
        const series = code.charAt(0);
        
        // Create the group if it doesn't exist
        if (!codeGroups[series]) {
            codeGroups[series] = [];
        }
        
        // Add this code to its group
        codeGroups[series].push({
            code: code,
            description: description
        });
    });
    
    // Series labels
    const seriesLabels = {
        '1': 'Assembly (100s)',
        '2': 'Educational (200s)',
        '3': 'Healthcare/Detention (300s)',
        '4': 'Residential (400s)',
        '5': 'Mercantile/Business (500s)',
        '6': 'Industrial/Utility (600s)',
        '7': 'Manufacturing (700s)',
        '8': 'Storage (800s)',
        '9': 'Outside/Special (900s)'
    };
    
    // Add options grouped by series
    Object.keys(codeGroups).sort().forEach(series => {
        // Create optgroup
        const optgroup = document.createElement('optgroup');
        optgroup.label = seriesLabels[series] || `${series}00 Series`;
        
        // Sort codes within the group
        codeGroups[series].sort((a, b) => parseInt(a.code) - parseInt(b.code));
        
        // Add each code to the group
        codeGroups[series].forEach(item => {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = `${item.code} - ${item.description}`;
            optgroup.appendChild(option);
        });
        
        // Add the group to the select
        propertySelect.appendChild(optgroup);
    });
    
    // Add None option at the end
    const noneOption = document.createElement('option');
    noneOption.value = "NNN";
    noneOption.textContent = "NNN - None";
    propertySelect.appendChild(noneOption);
}

/**
 * Initialize action taken selector and add event listeners
 */
function initNFIRSActionSelectors() {
    // Initialize the first action selector
    const firstActionSelect = document.getElementById('action-code-1');
    if (!firstActionSelect) return;
    
    // Populate the action selector
    populateActionSelect(firstActionSelect);
    
    // Add event listener for the add action button
    const addActionBtn = document.getElementById('add-action-btn');
    if (addActionBtn) {
        addActionBtn.addEventListener('click', addNewAction);
    }
    
    // Add event listeners for any existing remove action buttons
    document.querySelectorAll('.remove-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            removeAction(this);
        });
    });
    
    // Add event listeners for any existing search buttons
    document.querySelectorAll('.action-search-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openActionSearch(this.previousElementSibling);
        });
    });
}

/**
 * Populate an action select element with NFIRS action codes
 * @param {HTMLSelectElement} selectElement - The select element to populate
 */
function populateActionSelect(selectElement) {
    // Clear existing options except the placeholder
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    
    // Group codes by tens (10s, 20s, etc.)
    const codeGroups = {};
    
    // Process all action taken codes
    Object.entries(NFIRS_CODES.actionTaken).forEach(([code, description]) => {
        // Determine the group (first digit of the code)
        const group = code.charAt(0);
        
        // Create the group if it doesn't exist
        if (!codeGroups[group]) {
            codeGroups[group] = [];
        }
        
        // Add this code to its group
        codeGroups[group].push({
            code: code,
            description: description
        });
    });
    
    // Group labels
    const groupLabels = {
        '1': 'Fire Control (10-19)',
        '2': 'Search & Rescue (20-29)',
        '3': 'EMS & Transport (30-39)',
        '4': 'Hazardous Condition (40-49)',
        '5': 'Public Assistance (50-59)',
        '6': 'Systems & Services (60-69)',
        '7': 'Assistance (70-79)',
        '8': 'Information & Investigation (80-89)',
        '9': 'Fill Out Reports (90-99)'
    };
    
    // Add options grouped by category
    Object.keys(codeGroups).sort().forEach(group => {
        // Create optgroup
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupLabels[group] || `${group}0s`;
        
        // Sort codes within the group
        codeGroups[group].sort((a, b) => parseInt(a.code) - parseInt(b.code));
        
        // Add each code to the group
        codeGroups[group].forEach(item => {
            const option = document.createElement('option');
            option.value = item.code;
            option.textContent = `${item.code} - ${item.description}`;
            optgroup.appendChild(option);
        });
        
        // Add the group to the select
        selectElement.appendChild(optgroup);
    });
}

/**
 * Add a new action entry to the actions container
 */
function addNewAction() {
    const actionsContainer = document.getElementById('actions-container');
    const actionEntries = actionsContainer.querySelectorAll('.action-entry');
    const newIndex = actionEntries.length + 1;
    
    // Create new action entry
    const newEntry = document.createElement('div');
    newEntry.className = 'action-entry';
    newEntry.innerHTML = `
        <div class="code-select-container">
            <select id="action-code-${newIndex}" name="action-code-${newIndex}" class="action-code">
                <option value="">Select Action Taken</option>
            </select>
            <button type="button" class="action-search-btn secondary-btn small-btn">
                <i class="fas fa-search"></i>
            </button>
            <button type="button" class="remove-action-btn secondary-btn small-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add to container
    actionsContainer.appendChild(newEntry);
    
    // Initialize the select
    const select = newEntry.querySelector('select');
    populateActionSelect(select);
    
    // Add event listeners
    newEntry.querySelector('.remove-action-btn').addEventListener('click', function() {
        removeAction(this);
    });
    
    newEntry.querySelector('.action-search-btn').addEventListener('click', function() {
        openActionSearch(this.previousElementSibling);
    });
}

/**
 * Remove an action entry
 * @param {HTMLElement} button - The remove button that was clicked
 */
function removeAction(button) {
    // Find the parent action entry
    const actionEntry = button.closest('.action-entry');
    
    // Check if this is the only action entry
    const actionsContainer = document.getElementById('actions-container');
    if (actionsContainer.querySelectorAll('.action-entry').length <= 1) {
        // Reset the select instead of removing
        const select = actionEntry.querySelector('select');
        select.value = "";
        return;
    }
    
    // Remove the entry if there are others
    actionEntry.remove();
    
    // Renumber remaining action entries
    const remainingEntries = actionsContainer.querySelectorAll('.action-entry');
    remainingEntries.forEach((entry, index) => {
        const select = entry.querySelector('select');
        select.id = `action-code-${index + 1}`;
        select.name = `action-code-${index + 1}`;
    });
}

/**
 * Initialize Fire Module-specific UI components
 */
function initFireModuleUI() {
    // Fire module container starts hidden
    const fireModule = document.getElementById('fire-module-container');
    if (fireModule) {
        fireModule.style.display = 'none';
    }
}

/**
 * Add event listeners for NFIRS-related interactions
 */
function addNFIRSEventListeners() {
    // NFIRS incident type change listener
    const nfirsIncidentType = document.getElementById('nfirs-incident-type');
    if (nfirsIncidentType) {
        nfirsIncidentType.addEventListener('change', handleIncidentTypeChange);
    }
    
    // NFIRS validation button
    const validateBtn = document.getElementById('validate-nfirs-btn');
    if (validateBtn) {
        validateBtn.addEventListener('click', validateNFIRSForm);
    }
    
    // NFIRS code search buttons
    const codeSearchBtn = document.getElementById('nfirs-code-search-btn');
    if (codeSearchBtn) {
        codeSearchBtn.addEventListener('click', function() {
            openIncidentTypeSearch();
        });
    }
    
    const propertySearchBtn = document.getElementById('nfirs-property-search-btn');
    if (propertySearchBtn) {
        propertySearchBtn.addEventListener('click', function() {
            openPropertyUseSearch();
        });
    }
}

/**
 * Handle change of the NFIRS incident type
 */
function handleIncidentTypeChange() {
    const incidentTypeSelect = document.getElementById('nfirs-incident-type');
    const fireModule = document.getElementById('fire-module-container');
    
    if (!incidentTypeSelect || !fireModule) return;
    
    const selectedCode = incidentTypeSelect.value;
    
    // Show fire module for fire-related incident types (100-199)
    if (selectedCode && parseInt(selectedCode) >= 100 && parseInt(selectedCode) <= 199) {
        fireModule.style.display = 'block';
    } else {
        fireModule.style.display = 'none';
    }
    
    // Update the type hierarchy dropdowns based on the selected NFIRS code
    updateTypeHierarchyFromNFIRSCode(selectedCode);
}

/**
 * Update the incident type hierarchy dropdowns based on the selected NFIRS code
 * @param {string} nfirsCode - The selected NFIRS incident type code
 */
function updateTypeHierarchyFromNFIRSCode(nfirsCode) {
    console.log(`Updating type hierarchy from NFIRS code: ${nfirsCode}`);
    
    // Only proceed if we have a valid NFIRS code
    if (!nfirsCode) return;
    
    const primaryTypeSelect = document.getElementById('incident-primary-type');
    const secondaryTypeSelect = document.getElementById('incident-secondary-type');
    const specificTypeSelect = document.getElementById('incident-specific-type');
    
    // Skip if any of the dropdowns don't exist
    if (!primaryTypeSelect || !secondaryTypeSelect || !specificTypeSelect) {
        console.warn("Cannot update type hierarchy: one or more dropdown elements not found");
        return;
    }
    
    // Map NFIRS code to primary, secondary, and specific types
    let primaryType = "";
    let secondaryType = "";
    let specificType = "";
    
    // Map fire codes (100-199)
    if (nfirsCode >= 100 && nfirsCode <= 199) {
        primaryType = "FIRE";
        
        if (nfirsCode >= 111 && nfirsCode <= 123) {
            secondaryType = "STRUCTURE";
        } else if (nfirsCode >= 130 && nfirsCode <= 138) {
            secondaryType = "VEHICLE";
        } else if (nfirsCode >= 140 && nfirsCode <= 143) {
            secondaryType = "WILDLAND";
        } else {
            secondaryType = "OTHER_FIRE";
        }
    }
    // Map rescue & EMS codes (300-399)
    else if (nfirsCode >= 300 && nfirsCode <= 399) {
        primaryType = "EMS";
        
        if (nfirsCode === 321) {
            secondaryType = "MEDICAL";
        } else if ([322, 323, 324, 351, 352, 357].includes(parseInt(nfirsCode))) {
            secondaryType = "TRAUMA";
        } else if (nfirsCode >= 360 && nfirsCode <= 365) {
            secondaryType = "RESCUE";
            secondaryType = "WATER";
        } else {
            secondaryType = "OTHER_EMS";
        }
    }
    // Map hazmat codes (400-499)
    else if (nfirsCode >= 400 && nfirsCode <= 499) {
        primaryType = "HAZMAT";
        
        if ([411, 413].includes(parseInt(nfirsCode))) {
            secondaryType = "SPILL";
        } else if ([412, 422, 423].includes(parseInt(nfirsCode))) {
            secondaryType = "LEAK";
        } else if (nfirsCode === 424) {
            secondaryType = "GAS";
        } else {
            secondaryType = "OTHER_HAZMAT";
        }
    }
    // Map service calls (500-599)
    else if (nfirsCode >= 500 && nfirsCode <= 599) {
        primaryType = "SERVICE";
        
        if ([510, 551, 553, 554].includes(parseInt(nfirsCode))) {
            secondaryType = "ASSIST";
        } else if (nfirsCode === 511) {
            secondaryType = "LOCKOUT";
        } else if ([520, 521, 522].includes(parseInt(nfirsCode))) {
            secondaryType = "WATER_PROBLEM";
        } else {
            secondaryType = "OTHER_SERVICE";
        }
    }
    // Default to OTHER for any other codes
    else {
        primaryType = "OTHER";
        secondaryType = "OTHER_INCIDENT";
    }
    
    // Update primary type if we found a match
    if (primaryType) {
        console.log(`Setting primary type to ${primaryType}`);
        primaryTypeSelect.value = primaryType;
        
        // Trigger change event to update secondary type options
        const event = new Event('change');
        primaryTypeSelect.dispatchEvent(event);
        
        // After secondary options are updated, set the secondary type
        if (secondaryType) {
            console.log(`Setting secondary type to ${secondaryType}`);
            secondaryTypeSelect.value = secondaryType;
            
            // Trigger change event to update specific type options
            secondaryTypeSelect.dispatchEvent(new Event('change'));
            
            // After specific options are updated, find the one with the matching NFIRS code
            // Give a slight delay to ensure the options are populated
            setTimeout(() => {
                for (let i = 0; i < specificTypeSelect.options.length; i++) {
                    const option = specificTypeSelect.options[i];
                    
                    // Check if this option matches the NFIRS code
                    if (option.value === nfirsCode || 
                        option.textContent.includes(`(${nfirsCode})`)) {
                        console.log(`Setting specific type to ${option.value}`);
                        specificTypeSelect.value = option.value;
                        break;
                    }
                }
            }, 100);
        }
    }
}

/**
 * Validate the form for NFIRS compliance
 */
function validateNFIRSForm() {
    // Clear existing errors/warnings
    clearValidationErrors();
    
    // Collect current form data
    const incident = collectFormData();
    
    // Validate against NFIRS requirements
    try {
        const validationResult = validateNFIRSCompliance(incident);
        
        if (validationResult.isValid) {
            // Show success message
            showToast("Incident data meets NFIRS requirements", "success");
        } else {
            // Display errors and warnings
            if (validationResult.errors.length > 0) {
                // Show the errors container
                const errorsContainer = document.getElementById('nfirs-errors-container');
                if (errorsContainer) {
                    errorsContainer.innerHTML = `<h5>NFIRS Validation Errors</h5>`;
                    errorsContainer.style.display = 'block';
                    
                    // Add each error
                    validationResult.errors.forEach(error => {
                        const errorItem = document.createElement('div');
                        errorItem.className = 'nfirs-error-item';
                        errorItem.textContent = `${error.field}: ${error.message}`;
                        errorsContainer.appendChild(errorItem);
                    });
                }
            }
            
            if (validationResult.warnings.length > 0) {
                // Show the warnings container
                const warningsContainer = document.getElementById('nfirs-warnings-container');
                if (warningsContainer) {
                    warningsContainer.innerHTML = `<h5>NFIRS Validation Warnings</h5>`;
                    warningsContainer.style.display = 'block';
                    
                    // Add each warning
                    validationResult.warnings.forEach(warning => {
                        const warningItem = document.createElement('div');
                        warningItem.className = 'nfirs-warning-item';
                        warningItem.textContent = `${warning.field}: ${warning.message}`;
                        warningsContainer.appendChild(warningItem);
                    });
                }
            }
            
            // Show toast with summary
            const errorCount = validationResult.errors.length;
            const warningCount = validationResult.warnings.length;
            
            let message = "NFIRS validation: ";
            if (errorCount > 0) {
                message += `${errorCount} error${errorCount > 1 ? 's' : ''}`;
                if (warningCount > 0) {
                    message += `, ${warningCount} warning${warningCount > 1 ? 's' : ''}`;
                }
            } else if (warningCount > 0) {
                message += `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
            }
            
            showToast(message, errorCount > 0 ? "error" : "warning");
        }
    } catch (error) {
        console.error("NFIRS validation error:", error);
        showToast("Error during NFIRS validation", "error");
    }
}

/**
 * Collect current form data into an incident object
 * @returns {Object} - Collected incident data
 */
function collectFormData() {
    // This is a simplified version - in production,
    // would need to grab all form fields comprehensively
    const incident = {
        id: document.getElementById('incident-id')?.value || "",
        timestamp: document.getElementById('incident-timestamp')?.value || "",
        status: document.getElementById('incident-status')?.value || "",
        
        // NFIRS specific fields
        incident_type: {
            primary: document.getElementById('nfirs-incident-type')?.value || "",
            property_use: document.getElementById('nfirs-property-use')?.value || ""
        },
        
        // Location
        location: {
            address: document.getElementById('location-address')?.value || "",
            city: "Unknown", // Would need to be added to form
            state: "Unknown", // Would need to be added to form
            zip: "00000" // Would need to be added to form
        },
        
        // Aid Given or Received
        aid_given_received: document.getElementById('nfirs-aid')?.value || "",
        
        // Actions Taken
        actions: getActionsFromForm(),
        
        // Fire Module
        fire_module: getFireModuleData()
    };
    
    return incident;
}

/**
 * Get action taken values from the form
 * @returns {Array} - Array of action objects
 */
function getActionsFromForm() {
    const actions = [];
    
    // Get all action selects
    const actionSelects = document.querySelectorAll('.action-code');
    
    actionSelects.forEach(select => {
        if (select.value) {
            actions.push({
                code: select.value
            });
        }
    });
    
    return actions;
}

/**
 * Get fire module data from the form
 * @returns {Object} - Fire module data
 */
function getFireModuleData() {
    // Check if fire module is visible
    const fireModule = document.getElementById('fire-module-container');
    if (!fireModule || fireModule.style.display === 'none') {
        return null;
    }
    
    return {
        area_of_origin: document.getElementById('fire-area-origin')?.value || "",
        heat_source: document.getElementById('fire-heat-source')?.value || "",
        item_first_ignited: document.getElementById('fire-item-ignited')?.value || "",
        fire_spread: document.getElementById('fire-spread')?.value || "",
        detector: document.getElementById('detector-presence')?.value || ""
    };
}

/**
 * Open the search modal for NFIRS incident types
 */
function openIncidentTypeSearch() {
    // Create search modal content
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <div class="search-container">
            <input type="text" id="nfirs-type-search" placeholder="Search incident types..." autofocus>
            <div id="nfirs-type-results" class="search-results"></div>
        </div>
    `;
    
    // Show modal
    showModal("NFIRS Incident Type Search", modalContent, null, null);
    
    // Add event listener for search input
    const searchInput = document.getElementById('nfirs-type-search');
    searchInput.addEventListener('input', function() {
        searchNFIRSIncidentTypes(this.value);
    });
    
    // Initial search (show all)
    searchNFIRSIncidentTypes('');
}

/**
 * Open the search modal for NFIRS property use codes
 */
function openPropertyUseSearch() {
    // Create search modal content
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <div class="search-container">
            <input type="text" id="nfirs-property-search" placeholder="Search property use codes..." autofocus>
            <div id="nfirs-property-results" class="search-results"></div>
        </div>
    `;
    
    // Show modal
    showModal("NFIRS Property Use Search", modalContent, null, null);
    
    // Add event listener for search input
    const searchInput = document.getElementById('nfirs-property-search');
    searchInput.addEventListener('input', function() {
        searchNFIRSPropertyUses(this.value);
    });
    
    // Initial search (show all)
    searchNFIRSPropertyUses('');
}

/**
 * Open the search modal for NFIRS action taken codes
 * @param {HTMLSelectElement} selectElement - The select element to update after selection
 */
function openActionSearch(selectElement) {
    // Create search modal content
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <div class="search-container">
            <input type="text" id="nfirs-action-search" placeholder="Search action taken codes..." autofocus>
            <div id="nfirs-action-results" class="search-results"></div>
        </div>
    `;
    
    // Show modal
    showModal("NFIRS Action Taken Search", modalContent, null, null);
    
    // Add event listener for search input
    const searchInput = document.getElementById('nfirs-action-search');
    searchInput.addEventListener('input', function() {
        searchNFIRSActions(this.value, selectElement);
    });
    
    // Initial search (show all)
    searchNFIRSActions('', selectElement);
}

/**
 * Search for NFIRS incident types
 * @param {string} query - The search query
 */
function searchNFIRSIncidentTypes(query) {
    const resultsContainer = document.getElementById('nfirs-type-results');
    const targetSelect = document.getElementById('nfirs-incident-type');
    
    if (!resultsContainer || !targetSelect) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Make sure NFIRS_CODES is available
    if (typeof NFIRS_CODES === 'undefined') {
        console.error('NFIRS_CODES is not defined when trying to search incident types');
        resultsContainer.innerHTML = '<div class="no-results">Error: NFIRS codes not loaded</div>';
        return;
    }
    
    // Search the codes
    const results = searchNFIRSCodes(query, 'incidentTypes');
    
    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No matching incident types found</div>';
        return;
    }
    
    // Add each result
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = result.display;
        resultItem.addEventListener('click', function() {
            // Set the selected value
            targetSelect.value = result.code;
            
            // Trigger change event
            const event = new Event('change');
            targetSelect.dispatchEvent(event);
            
            // Close modal
            closeModal();
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

/**
 * Search for NFIRS property use codes
 * @param {string} query - The search query
 */
function searchNFIRSPropertyUses(query) {
    const resultsContainer = document.getElementById('nfirs-property-results');
    const targetSelect = document.getElementById('nfirs-property-use');
    
    if (!resultsContainer || !targetSelect) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Search the codes
    const results = searchNFIRSCodes(query, 'propertyUse');
    
    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No matching property use codes found</div>';
        return;
    }
    
    // Add each result
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = result.display;
        resultItem.addEventListener('click', function() {
            // Set the selected value
            targetSelect.value = result.code;
            
            // Close modal
            closeModal();
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

/**
 * Search for NFIRS action taken codes
 * @param {string} query - The search query
 * @param {HTMLSelectElement} selectElement - The select element to update after selection
 */
function searchNFIRSActions(query, selectElement) {
    const resultsContainer = document.getElementById('nfirs-action-results');
    
    if (!resultsContainer || !selectElement) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Search the codes
    const results = searchNFIRSCodes(query, 'actionTaken');
    
    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No matching action codes found</div>';
        return;
    }
    
    // Add each result
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.textContent = result.display;
        resultItem.addEventListener('click', function() {
            // Set the selected value
            selectElement.value = result.code;
            
            // Close modal
            closeModal();
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

// Add custom styles for search results
const style = document.createElement('style');
style.textContent = `
    .search-container {
        width: 100%;
    }
    
    .search-container input {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .search-results {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .search-result-item {
        padding: 8px 12px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    }
    
    .search-result-item:hover {
        background-color: #f5f5f5;
    }
    
    .no-results {
        padding: 10px;
        color: #666;
        font-style: italic;
        text-align: center;
    }
`;

// Add the style to the document
document.head.appendChild(style);

/**
 * Helper function to search through NFIRS codes
 * @param {string} query - The search string
 * @param {string} codeType - The type of code to search ('incidentTypes', 'propertyUse', etc.)
 * @returns {Array} - Array of matching code objects
 */
function searchNFIRSCodes(query, codeType) {
    // Make sure NFIRS_CODES is defined
    if (typeof NFIRS_CODES === 'undefined') {
        console.error(`NFIRS_CODES is undefined when searching for ${codeType}`);
        return [];
    }
    
    // Make sure the requested code type exists
    if (!NFIRS_CODES[codeType]) {
        console.error(`Code type "${codeType}" not found in NFIRS_CODES`);
        return [];
    }
    
    // Normalize query
    const normalizedQuery = query.trim().toLowerCase();
    
    // If query is empty, return all codes (limited to 100)
    if (!normalizedQuery) {
        return Object.entries(NFIRS_CODES[codeType])
            .slice(0, 100)
            .map(([code, description]) => ({
                code,
                description,
                display: `${code} - ${description}`
            }));
    }
    
    // Search for matches
    const results = [];
    
    Object.entries(NFIRS_CODES[codeType]).forEach(([code, description]) => {
        const codeString = code.toLowerCase();
        const descString = description.toLowerCase();
        
        // Check if the code or description contains the query
        if (codeString.includes(normalizedQuery) || descString.includes(normalizedQuery)) {
            results.push({
                code,
                description,
                display: `${code} - ${description}`
            });
        }
    });
    
    // Sort results by relevance
    results.sort((a, b) => {
        // Exact code match gets highest priority
        if (a.code.toLowerCase() === normalizedQuery) return -1;
        if (b.code.toLowerCase() === normalizedQuery) return 1;
        
        // Code starts with query gets next priority
        const aCodeStarts = a.code.toLowerCase().startsWith(normalizedQuery);
        const bCodeStarts = b.code.toLowerCase().startsWith(normalizedQuery);
        if (aCodeStarts && !bCodeStarts) return -1;
        if (!aCodeStarts && bCodeStarts) return 1;
        
        // Description starts with query gets next priority
        const aDescStarts = a.description.toLowerCase().startsWith(normalizedQuery);
        const bDescStarts = b.description.toLowerCase().startsWith(normalizedQuery);
        if (aDescStarts && !bDescStarts) return -1;
        if (!aDescStarts && bDescStarts) return 1;
        
        // Finally sort by code numerically
        return parseInt(a.code) - parseInt(b.code);
    });
    
    // Limit results
    return results.slice(0, 50);
}