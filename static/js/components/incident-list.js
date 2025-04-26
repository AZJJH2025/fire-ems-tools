/**
 * FireEMS.ai Incident Logger - List Component
 * 
 * This component handles the listing and management of incidents.
 */

// Pagination variables
let currentPage = 1;
let itemsPerPage = 25;
let filteredIncidents = [];

/**
 * Load incidents from storage
 */
function loadIncidents() {
    // Try to load from localStorage
    const storedIncidents = localStorage.getItem("incidents");
    
    if (storedIncidents) {
        try {
            incidentList = JSON.parse(storedIncidents);
            console.log(`Loaded ${incidentList.length} incidents from storage`);
        } catch (error) {
            console.error("Error parsing incidents:", error);
            incidentList = [];
        }
    } else {
        console.log("No incidents found in storage");
        incidentList = [];
    }
    
    // Also load from server if in that mode
    if (settings.storageMode === "server" || settings.storageMode === "both") {
        fetchIncidentsFromServer();
    }
}

/**
 * Save incidents to storage
 */
function saveIncidents() {
    // Save to localStorage
    localStorage.setItem("incidents", JSON.stringify(incidentList));
    console.log(`Saved ${incidentList.length} incidents to storage`);
    
    // Also save to server if in that mode
    if (settings.storageMode === "server" || settings.storageMode === "both") {
        saveIncidentsToServer();
    }
}

/**
 * Fetch incidents from the server
 */
function fetchIncidentsFromServer() {
    // This would be implemented to fetch from the API
    // For now we'll simulate a server call
    
    if (isOffline) {
        console.log("Cannot fetch from server while offline");
        return;
    }
    
    console.log("Fetching incidents from server...");
    
    // Simulated server response
    setTimeout(() => {
        console.log("Incidents fetched from server");
        // In a real implementation, we would merge with local incidents
        // refreshIncidentList();
    }, 500);
}

/**
 * Save incidents to the server
 */
function saveIncidentsToServer() {
    // This would be implemented to save to the API
    // For now we'll simulate a server call
    
    if (isOffline) {
        console.log("Cannot save to server while offline");
        showToast("Changes saved locally. Will sync when online.", "info");
        return;
    }
    
    console.log("Saving incidents to server...");
    
    // Simulated server response
    setTimeout(() => {
        console.log("Incidents saved to server");
    }, 500);
}

/**
 * Refresh the incident list display
 */
function refreshIncidentList() {
    // Apply filters
    filterIncidents();
    
    // Update pagination
    updatePagination();
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedIncidents = filteredIncidents.slice(startIndex, endIndex);
    
    // Clear the list
    const incidentListElement = document.getElementById("incident-list");
    incidentListElement.innerHTML = "";
    
    // Check if there are any incidents
    if (displayedIncidents.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="6" class="empty-list">No incidents found</td>
        `;
        incidentListElement.appendChild(emptyRow);
        return;
    }
    
    // Add each incident to the list
    displayedIncidents.forEach(incident => {
        const row = document.createElement("tr");
        
        // Format date based on settings
        let formattedDate = "";
        if (incident.timestamp) {
            const date = new Date(incident.timestamp);
            formattedDate = formatDate(date);
        }
        
        // Create status indicator with different styling based on status
        let statusClass = "";
        switch (incident.status) {
            case "draft":
                statusClass = "status-draft";
                break;
            case "active":
                statusClass = "status-active";
                break;
            case "completed":
                statusClass = "status-completed";
                break;
            case "cancelled":
                statusClass = "status-cancelled";
                break;
        }
        
        row.innerHTML = `
            <td>${incident.id}</td>
            <td>${formattedDate}</td>
            <td>${incident.incident_type?.primary || ""} - ${incident.incident_type?.secondary || ""}</td>
            <td>${incident.location?.address || ""}</td>
            <td><span class="status-indicator ${statusClass}">${incident.status || ""}</span></td>
            <td class="incident-actions">
                <button type="button" class="action-btn view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button type="button" class="action-btn edit-btn" title="Edit Incident">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="action-btn delete-btn" title="Delete Incident">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Add event listeners for action buttons
        row.querySelector(".view-btn").addEventListener("click", () => viewIncident(incident.id));
        row.querySelector(".edit-btn").addEventListener("click", () => editIncident(incident.id));
        row.querySelector(".delete-btn").addEventListener("click", () => confirmDeleteIncident(incident.id));
        
        incidentListElement.appendChild(row);
    });
}

/**
 * Format a date according to user settings
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let formattedDate = "";
    
    switch (settings.dateFormat) {
        case "MM/DD/YYYY":
            formattedDate = `${month}/${day}/${year}`;
            break;
        case "DD/MM/YYYY":
            formattedDate = `${day}/${month}/${year}`;
            break;
        case "YYYY-MM-DD":
            formattedDate = `${year}-${month}-${day}`;
            break;
        default:
            formattedDate = `${month}/${day}/${year}`;
    }
    
    // Add time based on 12h or 24h format
    const hours24 = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (settings.timeFormat === "24") {
        formattedDate += ` ${String(hours24).padStart(2, '0')}:${minutes}`;
    } else {
        const hours12 = hours24 % 12 || 12;
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        formattedDate += ` ${hours12}:${minutes} ${ampm}`;
    }
    
    return formattedDate;
}

/**
 * Update pagination controls and info
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
    
    // Ensure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    // Update page info text
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable pagination buttons
    document.getElementById("prev-page").disabled = currentPage <= 1;
    document.getElementById("next-page").disabled = currentPage >= totalPages;
}

/**
 * Go to the previous page
 */
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        refreshIncidentList();
    }
}

/**
 * Go to the next page
 */
function nextPage() {
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        refreshIncidentList();
    }
}

/**
 * Filter incidents based on search and filter criteria
 */
function filterIncidents() {
    const searchTerm = document.getElementById("search-incidents").value.toLowerCase();
    const statusFilter = document.getElementById("status-filter").value;
    const typeFilter = document.getElementById("type-filter").value;
    const dateFilter = document.getElementById("date-filter").value;
    
    // Apply filters
    filteredIncidents = incidentList.filter(incident => {
        // Search term filter (checks multiple fields)
        const matchesSearch = !searchTerm || 
            (incident.id && incident.id.toLowerCase().includes(searchTerm)) ||
            (incident.location?.address && incident.location.address.toLowerCase().includes(searchTerm)) ||
            (incident.incident_type?.primary && incident.incident_type.primary.toLowerCase().includes(searchTerm)) ||
            (incident.incident_type?.secondary && incident.incident_type.secondary.toLowerCase().includes(searchTerm)) ||
            (incident.narrative && incident.narrative.toLowerCase().includes(searchTerm));
        
        // Status filter
        const matchesStatus = !statusFilter || incident.status === statusFilter;
        
        // Type filter
        const matchesType = !typeFilter || incident.incident_type?.primary === typeFilter;
        
        // Date filter
        let matchesDate = true;
        if (dateFilter && incident.timestamp) {
            const incidentDate = new Date(incident.timestamp);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            
            switch (dateFilter) {
                case "today":
                    matchesDate = incidentDate >= today;
                    break;
                case "yesterday":
                    matchesDate = incidentDate >= yesterday && incidentDate < today;
                    break;
                case "week":
                    matchesDate = incidentDate >= lastWeek;
                    break;
                case "month":
                    matchesDate = incidentDate >= lastMonth;
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
    
    // Sort incidents by timestamp (newest first)
    filteredIncidents.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Refresh the display
    refreshIncidentList();
}

/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById("search-incidents").value = "";
    document.getElementById("status-filter").value = "";
    document.getElementById("type-filter").value = "";
    document.getElementById("date-filter").value = "";
    
    filterIncidents();
}

/**
 * Search incidents based on search input
 */
function searchIncidents() {
    filterIncidents();
}

/**
 * View incident details
 * @param {string} incidentId - The ID of the incident to view
 */
function viewIncident(incidentId) {
    const incident = incidentList.find(inc => inc.id === incidentId);
    
    if (!incident) {
        showToast("Incident not found", "error");
        return;
    }
    
    // Create modal content with incident details
    const modalContent = document.createElement("div");
    modalContent.className = "incident-details";
    
    // Format incident data for display
    const formattedDate = incident.timestamp ? formatDate(new Date(incident.timestamp)) : "Unknown";
    const incidentType = [
        incident.incident_type?.primary,
        incident.incident_type?.secondary,
        incident.incident_type?.specific
    ].filter(Boolean).join(" - ");
    
    // Calculate response times
    let totalResponseTime = "N/A";
    if (incident.dispatch?.time_received && incident.dispatch?.time_arrived) {
        const received = new Date(incident.dispatch.time_received);
        const arrived = new Date(incident.dispatch.time_arrived);
        const diffMs = arrived - received;
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        totalResponseTime = `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
    }
    
    modalContent.innerHTML = `
        <div class="incident-detail-header">
            <div class="detail-id">${incident.id}</div>
            <div class="detail-status status-${incident.status || 'unknown'}">${incident.status || 'Unknown'}</div>
        </div>
        
        <div class="detail-section">
            <h4>Basic Information</h4>
            <div class="detail-row">
                <div class="detail-label">Date/Time:</div>
                <div class="detail-value">${formattedDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Type:</div>
                <div class="detail-value">${incidentType || 'Unknown'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Location:</div>
                <div class="detail-value">${incident.location?.address || 'Unknown'}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Response Information</h4>
            <div class="detail-row">
                <div class="detail-label">Total Response Time:</div>
                <div class="detail-value">${totalResponseTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Units Responded:</div>
                <div class="detail-value">${incident.units?.map(u => u.id).join(', ') || 'None'}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Patient Information</h4>
            <div class="detail-row">
                <div class="detail-label">Patient Count:</div>
                <div class="detail-value">${incident.patient_info?.count || '0'}</div>
            </div>
            ${incident.patient_info?.details?.map((patient, index) => `
                <div class="detail-subsection">
                    <h5>Patient #${index + 1}</h5>
                    <div class="detail-row">
                        <div class="detail-label">Age/Gender:</div>
                        <div class="detail-value">${patient.age || 'Unknown'} ${patient.gender || ''}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Chief Complaint:</div>
                        <div class="detail-value">${patient.chief_complaint || 'None reported'}</div>
                    </div>
                </div>
            `).join('') || '<div class="detail-value">No patient details recorded</div>'}
        </div>
        
        <div class="detail-section">
            <h4>Disposition</h4>
            <div class="detail-row">
                <div class="detail-label">Transported:</div>
                <div class="detail-value">${incident.disposition?.transported ? 'Yes' : 'No'}</div>
            </div>
            ${incident.disposition?.transported ? `
                <div class="detail-row">
                    <div class="detail-label">Destination:</div>
                    <div class="detail-value">${incident.disposition.destination || 'Unknown'}</div>
                </div>
            ` : `
                <div class="detail-row">
                    <div class="detail-label">Reason:</div>
                    <div class="detail-value">${incident.disposition?.reason || 'Unknown'}</div>
                </div>
            `}
        </div>
        
        <div class="detail-section">
            <h4>Narrative</h4>
            <div class="detail-narrative">
                ${incident.narrative || 'No narrative provided'}
            </div>
        </div>
        
        <div class="detail-footer">
            <div class="detail-row">
                <div class="detail-label">Created By:</div>
                <div class="detail-value">${incident.created_by || 'Unknown'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Last Modified:</div>
                <div class="detail-value">${incident.last_modified ? formatDate(new Date(incident.last_modified)) : 'Unknown'}</div>
            </div>
        </div>
    `;
    
    // Show modal with incident details
    showModal(`Incident ${incident.id}`, modalContent, null, 
        // Confirm callback (will be edit)
        () => {
            editIncident(incidentId);
        }
    );
    
    // Change confirm button text
    document.getElementById("modal-confirm").textContent = "Edit Incident";
}

/**
 * Edit an incident
 * @param {string} incidentId - The ID of the incident to edit
 */
function editIncident(incidentId) {
    const incident = incidentList.find(inc => inc.id === incidentId);
    
    if (!incident) {
        showToast("Incident not found", "error");
        return;
    }
    
    // Close modal if open
    closeModal();
    
    // Show form container
    showNewIncidentForm();
    
    // Load incident data into form
    loadIncidentIntoForm(incident);
}

/**
 * Confirm deletion of an incident
 * @param {string} incidentId - The ID of the incident to delete
 */
function confirmDeleteIncident(incidentId) {
    const incident = incidentList.find(inc => inc.id === incidentId);
    
    if (!incident) {
        showToast("Incident not found", "error");
        return;
    }
    
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <p>Are you sure you want to delete incident <strong>${incident.id}</strong>?</p>
        <p>This action cannot be undone.</p>
    `;
    
    showModal("Confirm Deletion", modalContent, null, 
        // Confirm callback
        () => {
            deleteIncident(incidentId);
        }
    );
    
    // Change confirm button to danger style
    const confirmBtn = document.getElementById("modal-confirm");
    confirmBtn.className = "warning-btn";
    confirmBtn.textContent = "Delete Incident";
}

/**
 * Delete an incident
 * @param {string} incidentId - The ID of the incident to delete
 */
function deleteIncident(incidentId) {
    // Find the index of the incident
    const index = incidentList.findIndex(inc => inc.id === incidentId);
    
    if (index === -1) {
        showToast("Incident not found", "error");
        return;
    }
    
    // Remove the incident from the list
    incidentList.splice(index, 1);
    
    // Save the updated list
    saveIncidents();
    
    // Refresh the display
    refreshIncidentList();
    
    // Close modal
    closeModal();
    
    // Show success message
    showToast("Incident deleted successfully", "success");
}

/**
 * Setup autosave functionality
 */
function setupAutosave() {
    const interval = settings.autoSaveInterval * 60 * 1000; // Convert minutes to milliseconds
    
    setInterval(() => {
        // Only autosave if the form is visible and has changes
        const formContainer = document.getElementById("incident-form-container");
        if (formContainer.style.display !== "none") {
            saveDraft();
        }
    }, interval);
}
