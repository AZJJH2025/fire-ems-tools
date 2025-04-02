/**
 * FireEMS.ai Incident Logger - Export Component
 * 
 * This component handles exporting incident data in various formats.
 */

// Import NFIRS export functions
import { convertToNFIRSXML, convertToNFIRSCSV, convertToNFIRSJSON } from '../nfirs/nfirs-export.js';
import { isNFIRSReadyForExport, getMissingNFIRSFields } from '../nfirs/nfirs-validator.js';

/**
 * Generate an export based on user selections
 */
function generateExport() {
    // Get export format
    const formatElements = document.getElementsByName("export-format");
    let format = "csv"; // Default
    for (const element of formatElements) {
        if (element.checked) {
            format = element.value;
            break;
        }
    }
    
    // Get data selection
    const selectionElements = document.getElementsByName("export-selection");
    let selection = "all"; // Default
    for (const element of selectionElements) {
        if (element.checked) {
            selection = element.value;
            break;
        }
    }
    
    // Get date range
    const dateFrom = document.getElementById("export-date-from").value;
    const dateTo = document.getElementById("export-date-to").value;
    
    // Get HIPAA compliance option
    const hipaaCompliant = document.getElementById("export-hipaa-compliant").checked;
    
    // Get NFIRS compliance option
    const nfirsCompliant = document.getElementById("export-nfirs-compliant")?.checked || false;
    
    // Filter incidents based on selection
    let incidents = [];
    
    switch (selection) {
        case "all":
            incidents = [...incidentList];
            break;
        case "filtered":
            incidents = [...filteredIncidents];
            break;
        case "selected":
            // This would be implemented for multi-select functionality
            showToast("Selected incidents export not implemented yet", "warning");
            return;
    }
    
    // Apply date filter if specified
    if (dateFrom || dateTo) {
        incidents = incidents.filter(incident => {
            if (!incident.timestamp) return false;
            
            const incidentDate = new Date(incident.timestamp);
            
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (incidentDate < fromDate) return false;
            }
            
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (incidentDate > toDate) return false;
            }
            
            return true;
        });
    }
    
    // Check if we have any incidents to export
    if (incidents.length === 0) {
        showToast("No incidents to export", "warning");
        return;
    }
    
    // Apply HIPAA de-identification if selected
    if (hipaaCompliant) {
        incidents = incidents.map(incident => deidentifyIncident(incident));
    }
    
    // If NFIRS format is requested, use those specialized export functions
    if (nfirsCompliant) {
        // Check NFIRS compliance for each incident
        const nfirsCompliantIncidents = [];
        const nonCompliantIncidents = [];
        
        incidents.forEach(incident => {
            if (isNFIRSReadyForExport(incident)) {
                nfirsCompliantIncidents.push(incident);
            } else {
                nonCompliantIncidents.push({
                    id: incident.id,
                    missingFields: getMissingNFIRSFields(incident)
                });
            }
        });
        
        // If any incidents don't meet NFIRS requirements, show a warning
        if (nonCompliantIncidents.length > 0) {
            // Create warning message
            let warningMessage = "The following incidents do not meet NFIRS requirements:";
            nonCompliantIncidents.forEach(item => {
                warningMessage += `\n- ${item.id}: Missing ${item.missingFields.join(', ')}`;
            });
            warningMessage += "\n\nOnly NFIRS-compliant incidents will be exported.";
            
            // Only proceed with export if there are compliant incidents
            if (nfirsCompliantIncidents.length === 0) {
                showModal("NFIRS Export Error", 
                    `<p>None of the selected incidents meet NFIRS requirements. Please complete the required fields before exporting.</p>`, 
                    null, null);
                return;
            }
            
            // Show warning but continue with export of compliant incidents
            showModal("NFIRS Export Warning", 
                `<p>${warningMessage}</p>
                <p>Would you like to continue with exporting only the ${nfirsCompliantIncidents.length} NFIRS-compliant incidents?</p>`, 
                null, 
                () => {
                    // Continue with export of compliant incidents
                    exportNFIRSData(nfirsCompliantIncidents, format);
                    closeModal();
                });
            
            return;
        }
        
        // If all incidents are compliant, proceed with export
        exportNFIRSData(incidents, format);
        return;
    }
    
    // Generate standard export based on format
    switch (format) {
        case "csv":
            exportCSV(incidents, hipaaCompliant);
            break;
        case "pdf":
            exportPDF(incidents, hipaaCompliant);
            break;
        case "json":
            exportJSON(incidents, hipaaCompliant);
            break;
        case "nfirs-xml":
        case "nfirs-csv":
        case "nfirs-json":
            // Show error if NFIRS compliant wasn't checked but NFIRS format was selected
            showToast("Please check 'NFIRS Compliant' checkbox for NFIRS exports", "error");
            break;
        default:
            showToast("Unsupported export format", "error");
    }
}

/**
 * Export incidents in NFIRS format
 * @param {Array} incidents - The incidents to export
 * @param {string} format - The export format (nfirs-xml, nfirs-csv, nfirs-json)
 */
function exportNFIRSData(incidents, format) {
    try {
        switch (format) {
            case "nfirs-xml":
                // For XML, we need to create a single XML document with all incidents
                let combinedXml = '<?xml version="1.0" encoding="UTF-8"?>\n<NFIRSIncidents>\n';
                
                incidents.forEach(incident => {
                    // Strip the XML declaration from individual incident exports
                    const incidentXml = convertToNFIRSXML(incident).replace('<?xml version="1.0" encoding="UTF-8"?>', '');
                    combinedXml += incidentXml + '\n';
                });
                
                combinedXml += '</NFIRSIncidents>';
                
                // Download the combined XML
                downloadFile(combinedXml, "nfirs-incidents.xml", "application/xml");
                showToast(`Exported ${incidents.length} incidents in NFIRS XML format`, "success");
                break;
                
            case "nfirs-csv":
                // For CSV, we can combine all incident CSVs into one file with a header
                let combinedCsv = "";
                let headerRow = "";
                
                incidents.forEach((incident, index) => {
                    const incidentCsv = convertToNFIRSCSV(incident);
                    
                    // Get header from first incident and use for all
                    if (index === 0) {
                        const rows = incidentCsv.split('\n');
                        headerRow = rows[0];
                        combinedCsv += headerRow + '\n';
                        combinedCsv += rows[1] + '\n';
                    } else {
                        // For subsequent incidents, just add the data row
                        const rows = incidentCsv.split('\n');
                        if (rows.length > 1) {
                            combinedCsv += rows[1] + '\n';
                        }
                    }
                });
                
                // Download the combined CSV
                downloadFile(combinedCsv, "nfirs-incidents.csv", "text/csv");
                showToast(`Exported ${incidents.length} incidents in NFIRS CSV format`, "success");
                break;
                
            case "nfirs-json":
                // For JSON, create an array of all incident JSON objects
                const nfirsData = {
                    meta: {
                        exportDate: new Date().toISOString(),
                        totalIncidents: incidents.length,
                        format: "NFIRS"
                    },
                    incidents: incidents.map(incident => convertToNFIRSJSON(incident))
                };
                
                // Format and download the JSON
                const jsonContent = JSON.stringify(nfirsData, null, 2);
                downloadFile(jsonContent, "nfirs-incidents.json", "application/json");
                showToast(`Exported ${incidents.length} incidents in NFIRS JSON format`, "success");
                break;
                
            default:
                // For standard formats, just export as normal
                switch (format) {
                    case "csv":
                        exportCSV(incidents, false);
                        break;
                    case "pdf":
                        exportPDF(incidents, false);
                        break;
                    case "json":
                        exportJSON(incidents, false);
                        break;
                }
        }
    } catch (error) {
        console.error("Error during NFIRS export:", error);
        showToast(`Error during NFIRS export: ${error.message}`, "error");
    }
}

/**
 * Export incidents as CSV
 * @param {Array} incidents - The incidents to export
 * @param {boolean} hipaaCompliant - Whether export is HIPAA compliant
 */
function exportCSV(incidents, hipaaCompliant = false) {
    // Define CSV headers
    let headers = [
        "ID",
        "Date/Time",
        "Status",
        "Type",
        "Address",
        "Latitude",
        "Longitude",
        "Caller Name",
        "Caller Phone",
        "Time Received",
        "Time Arrived",
        "Response Time (min)",
        "Patient Count"
    ];
    
    // Add PHI fields only for non-HIPAA compliant exports
    if (!hipaaCompliant) {
        headers = headers.concat([
            "Transported",
            "Destination",
            "Narrative",
            "Created By",
            "Last Modified"
        ]);
    } else {
        // Add de-identified fields for HIPAA compliant exports
        headers = headers.concat([
            "Transported",
            "Narrative (De-identified)",
            "De-identification Date"
        ]);
    }
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    // Add each incident as a row
    incidents.forEach(incident => {
        // Calculate response time in minutes
        let responseTime = "";
        if (incident.dispatch?.time_received && incident.dispatch?.time_arrived) {
            const received = new Date(incident.dispatch.time_received);
            const arrived = new Date(incident.dispatch.time_arrived);
            const diffMs = arrived - received;
            responseTime = (diffMs / 60000).toFixed(2); // Convert ms to minutes
        }
        
        // Format incident type
        const incidentType = [
            incident.incident_type?.primary,
            incident.incident_type?.secondary,
            incident.incident_type?.specific
        ].filter(Boolean).join(" - ");
        
        // Create row array
        const rowData = [
            escapeCsvValue(incident.id),
            escapeCsvValue(incident.timestamp),
            escapeCsvValue(incident.status),
            escapeCsvValue(incidentType),
            escapeCsvValue(incident.location?.address),
            incident.location?.latitude,
            incident.location?.longitude,
            escapeCsvValue(hipaaCompliant ? "[REDACTED]" : incident.caller_info?.name),
            escapeCsvValue(hipaaCompliant ? "[REDACTED]" : incident.caller_info?.phone),
            escapeCsvValue(incident.dispatch?.time_received),
            escapeCsvValue(incident.dispatch?.time_arrived),
            responseTime,
            incident.patient_info?.count || 0
        ];
        
        // Add PHI fields only for non-HIPAA compliant exports
        if (!hipaaCompliant) {
            rowData.push(
                incident.disposition?.transported ? "Yes" : "No",
                escapeCsvValue(incident.disposition?.destination),
                escapeCsvValue(incident.narrative),
                escapeCsvValue(incident.audit?.created_by),
                escapeCsvValue(incident.audit?.last_modified)
            );
        } else {
            // Add de-identified fields for HIPAA compliant exports
            rowData.push(
                incident.disposition?.transported ? "Yes" : "No",
                escapeCsvValue(incident.narrative),  // Already de-identified
                escapeCsvValue(incident.meta?.deidentification_date)
            );
        }
        
        // Join row and add to CSV
        csvContent += rowData.join(",") + "\n";
    });
    
    // Create file name with hipaa indicator
    const fileName = hipaaCompliant ? "incidents-deidentified.csv" : "incidents.csv";
    
    // Create download link
    downloadFile(csvContent, fileName, "text/csv");
    
    showToast(`Exported ${incidents.length} incidents to CSV${hipaaCompliant ? " (HIPAA compliant)" : ""}`, "success");
}

/**
 * Escape a value for CSV format
 * @param {any} value - The value to escape
 * @returns {string} - Escaped CSV value
 */
function escapeCsvValue(value) {
    if (value === undefined || value === null) return "";
    
    value = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        // Double quotes inside the value
        value = value.replace(/"/g, '""');
        
        // Wrap in quotes
        return `"${value}"`;
    }
    
    return value;
}

/**
 * Export incidents as PDF
 * @param {Array} incidents - The incidents to export
 * @param {boolean} hipaaCompliant - Whether export is HIPAA compliant
 */
function exportPDF(incidents, hipaaCompliant = false) {
    // Create modal with loading message
    showModal("Generating PDF", 
        `<div class="export-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Generating ${hipaaCompliant ? "HIPAA-compliant " : ""}PDF export...</p>
        </div>`, 
        null, null);
    
    // Disable modal close button
    document.getElementById("modal-close").style.display = "none";
    document.getElementById("modal-cancel").style.display = "none";
    document.getElementById("modal-confirm").style.display = "none";
    
    // Create a temporary area to render the PDF content
    const tempContainer = document.createElement("div");
    tempContainer.className = "pdf-export-container";
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    document.body.appendChild(tempContainer);
    
    // Add title and date
    tempContainer.innerHTML = `
        <div class="pdf-header">
            <h1>Incident Report${hipaaCompliant ? " (De-identified)" : ""}</h1>
            <p>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            ${hipaaCompliant ? '<p class="hipaa-notice">This report has been de-identified according to HIPAA Safe Harbor Method</p>' : ''}
        </div>
    `;
    
    // Add summary table
    const summaryTable = document.createElement("table");
    summaryTable.className = "pdf-summary-table";
    summaryTable.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Date/Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Patient Count</th>
                <th>Response Time</th>
            </tr>
        </thead>
        <tbody>
            ${incidents.map(incident => {
                // Calculate response time
                let responseTime = "N/A";
                if (incident.dispatch?.time_received && incident.dispatch?.time_arrived) {
                    const received = new Date(incident.dispatch.time_received);
                    const arrived = new Date(incident.dispatch.time_arrived);
                    const diffMs = arrived - received;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffSecs = Math.floor((diffMs % 60000) / 1000);
                    responseTime = `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
                }
                
                // Format incident type
                const incidentType = [
                    incident.incident_type?.primary,
                    incident.incident_type?.secondary
                ].filter(Boolean).join(" - ");
                
                return `
                    <tr>
                        <td>${incident.id}</td>
                        <td>${formatDate(new Date(incident.timestamp))}</td>
                        <td>${incidentType}</td>
                        <td>${incident.status}</td>
                        <td>${incident.patient_info?.count || 0}</td>
                        <td>${responseTime}</td>
                    </tr>
                `;
            }).join("")}
        </tbody>
    `;
    
    tempContainer.appendChild(summaryTable);
    
    // Add detailed incident reports if not too many
    if (incidents.length <= 10) {
        const detailsContainer = document.createElement("div");
        detailsContainer.className = "pdf-details-container";
        
        incidents.forEach(incident => {
            const incidentDetail = document.createElement("div");
            incidentDetail.className = "pdf-incident-detail";
            
            // Format incident type
            const incidentType = [
                incident.incident_type?.primary,
                incident.incident_type?.secondary,
                incident.incident_type?.specific
            ].filter(Boolean).join(" - ");
            
            // Add basic information section
            incidentDetail.innerHTML = `
                <h2>Incident ${incident.id}</h2>
                <div class="pdf-detail-grid">
                    <div class="pdf-detail-row">
                        <div class="pdf-detail-label">Date/Time:</div>
                        <div class="pdf-detail-value">${formatDate(new Date(incident.timestamp))}</div>
                    </div>
                    <div class="pdf-detail-row">
                        <div class="pdf-detail-label">Type:</div>
                        <div class="pdf-detail-value">${incidentType}</div>
                    </div>
                    <div class="pdf-detail-row">
                        <div class="pdf-detail-label">Status:</div>
                        <div class="pdf-detail-value">${incident.status}</div>
                    </div>
                    <div class="pdf-detail-row">
                        <div class="pdf-detail-label">Location:</div>
                        <div class="pdf-detail-value">${incident.location?.address || "Unknown"}</div>
                    </div>
                    <div class="pdf-detail-row">
                        <div class="pdf-detail-label">Units:</div>
                        <div class="pdf-detail-value">${incident.units?.map(u => u.id).join(', ') || 'None'}</div>
                    </div>
                </div>
            `;
            
            // Add patient information if not HIPAA compliant, or de-identified if HIPAA compliant
            if (incident.patient_info && incident.patient_info.details && incident.patient_info.details.length > 0) {
                const patientSection = document.createElement('div');
                patientSection.className = 'pdf-patient-section';
                
                if (hipaaCompliant) {
                    patientSection.innerHTML = `
                        <h3>Patient Information (De-identified)</h3>
                        <p>This section has been de-identified in accordance with HIPAA regulations.</p>
                        <div class="pdf-patient-count">
                            <strong>Patient Count:</strong> ${incident.patient_info.count}
                        </div>
                    `;
                    
                    // Add de-identified treatment information
                    const treatments = [];
                    incident.patient_info.details.forEach(patient => {
                        if (patient.treatment && patient.treatment.length) {
                            patient.treatment.forEach(t => {
                                treatments.push(t.procedure);
                            });
                        }
                    });
                    
                    if (treatments.length > 0) {
                        patientSection.innerHTML += `
                            <div class="pdf-treatments">
                                <strong>Treatments Provided:</strong> ${treatments.join(', ')}
                            </div>
                        `;
                    }
                } else {
                    // Full patient information for non-HIPAA compliant exports
                    patientSection.innerHTML = `<h3>Patient Information</h3>`;
                    
                    incident.patient_info.details.forEach((patient, index) => {
                        patientSection.innerHTML += `
                            <div class="pdf-patient">
                                <h4>Patient #${index + 1}</h4>
                                <div class="pdf-detail-grid">
                                    <div class="pdf-detail-row">
                                        <div class="pdf-detail-label">Age/Gender:</div>
                                        <div class="pdf-detail-value">${patient.age || 'Unknown'} ${patient.gender || ''}</div>
                                    </div>
                                    <div class="pdf-detail-row">
                                        <div class="pdf-detail-label">Chief Complaint:</div>
                                        <div class="pdf-detail-value">${patient.chief_complaint || 'None reported'}</div>
                                    </div>
                                    ${patient.vitals && patient.vitals.length ? `
                                        <div class="pdf-detail-row">
                                            <div class="pdf-detail-label">Last Vitals:</div>
                                            <div class="pdf-detail-value">
                                                BP: ${patient.vitals[patient.vitals.length-1].bp || 'N/A'}, 
                                                Pulse: ${patient.vitals[patient.vitals.length-1].pulse || 'N/A'}, 
                                                Resp: ${patient.vitals[patient.vitals.length-1].respiration || 'N/A'}, 
                                                SpO2: ${patient.vitals[patient.vitals.length-1].spo2 || 'N/A'}%
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    });
                }
                
                incidentDetail.appendChild(patientSection);
            }
            
            // Add narrative section
            const narrativeSection = document.createElement('div');
            narrativeSection.innerHTML = `
                <h3>Narrative${hipaaCompliant ? ' (De-identified)' : ''}</h3>
                <div class="pdf-narrative">
                    ${incident.narrative || "No narrative provided"}
                </div>
            `;
            
            incidentDetail.appendChild(narrativeSection);
            
            detailsContainer.appendChild(incidentDetail);
        });
        
        tempContainer.appendChild(detailsContainer);
    }
    
    // Add HIPAA compliance footer if applicable
    if (hipaaCompliant) {
        const complianceFooter = document.createElement('div');
        complianceFooter.className = 'pdf-compliance-footer';
        complianceFooter.innerHTML = `
            <div class="hipaa-disclaimer">
                <h3>HIPAA Compliance Statement</h3>
                <p>This report has been de-identified in accordance with the HIPAA Privacy Rule's Safe Harbor Method, 
                removing all 18 types of identifiers. This data is no longer Protected Health Information (PHI) and 
                can be shared for operational, quality improvement, and research purposes without patient authorization.</p>
                <p>De-identification date: ${new Date().toLocaleDateString()}</p>
            </div>
        `;
        
        tempContainer.appendChild(complianceFooter);
    }
    
    // Use html2canvas and jsPDF to generate PDF
    setTimeout(() => {
        html2canvas(tempContainer).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // Save the PDF with appropriate filename
            const fileName = hipaaCompliant ? 'incidents-deidentified.pdf' : 'incidents.pdf';
            pdf.save(fileName);
            
            // Remove temp container
            document.body.removeChild(tempContainer);
            
            // Close modal
            closeModal();
            
            showToast(`Exported ${incidents.length} incidents to PDF${hipaaCompliant ? " (HIPAA compliant)" : ""}`, "success");
        }).catch(error => {
            console.error("PDF generation error:", error);
            closeModal();
            showToast("Error generating PDF", "error");
            document.body.removeChild(tempContainer);
        });
    }, 500);
}

/**
 * Export incidents as JSON
 * @param {Array} incidents - The incidents to export
 * @param {boolean} hipaaCompliant - Whether export is HIPAA compliant
 */
function exportJSON(incidents, hipaaCompliant = false) {
    // Add metadata to the export
    const exportData = {
        meta: {
            exportDate: new Date().toISOString(),
            totalIncidents: incidents.length,
            hipaaCompliant: hipaaCompliant
        },
        incidents: incidents
    };
    
    // Convert to pretty-printed JSON
    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // Create file name with hipaa indicator
    const fileName = hipaaCompliant ? "incidents-deidentified.json" : "incidents.json";
    
    // Create download link
    downloadFile(jsonContent, fileName, "application/json");
    
    showToast(`Exported ${incidents.length} incidents to JSON${hipaaCompliant ? " (HIPAA compliant)" : ""}`, "success");
}

/**
 * Create a download for a file
 * @param {string} content - The file content
 * @param {string} filename - The filename
 * @param {string} contentType - The content type
 */
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.style.display = "none";
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Update settings based on form values
 */
function updateSettings() {
    // Get values from settings form
    settings.defaultStatus = document.getElementById("default-status").value;
    settings.autoSaveInterval = parseInt(document.getElementById("auto-save").value);
    settings.defaultLocation = document.getElementById("default-location").value;
    settings.itemsPerPage = parseInt(document.getElementById("items-per-page").value);
    settings.dateFormat = document.getElementById("date-format").value;
    settings.timeFormat = document.getElementById("time-format").value;
    settings.storageMode = document.getElementById("storage-mode").value;
    
    // Save settings
    saveSettings();
    
    // Update any UI elements that depend on settings
    itemsPerPage = settings.itemsPerPage;
    refreshIncidentList();
    
    showToast("Settings saved successfully", "success");
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
    // Confirm before resetting
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <p>Are you sure you want to reset all settings to default values?</p>
    `;
    
    showModal("Reset Settings", modalContent, null, 
        // Confirm callback
        () => {
            // Default settings
            settings = {
                defaultStatus: "draft",
                autoSaveInterval: 5,
                defaultLocation: "",
                itemsPerPage: 25,
                dateFormat: "MM/DD/YYYY",
                timeFormat: "12",
                storageMode: "local",
                lastSyncTime: null
            };
            
            // Save and apply settings
            saveSettings();
            applySettings();
            
            // Update any UI elements that depend on settings
            itemsPerPage = settings.itemsPerPage;
            refreshIncidentList();
            
            showToast("Settings reset to defaults", "success");
            
            // Close modal
            closeModal();
        }
    );
}

/**
 * Confirm clearing all data
 */
function confirmClearData() {
    const modalContent = document.createElement("div");
    modalContent.innerHTML = `
        <p>Are you sure you want to clear all incident data?</p>
        <p><strong>This action cannot be undone!</strong></p>
        <p>Type "DELETE" below to confirm:</p>
        <input type="text" id="delete-confirmation" class="full-width">
    `;
    
    showModal("Clear All Data", modalContent, null, 
        // Confirm callback
        () => {
            const confirmation = document.getElementById("delete-confirmation").value;
            
            if (confirmation === "DELETE") {
                // Clear incidents
                incidentList = [];
                saveIncidents();
                
                // Refresh the display
                refreshIncidentList();
                
                showToast("All incident data has been cleared", "success");
                
                // Close modal
                closeModal();
            } else {
                // Show error if confirmation text doesn't match
                const errorMsg = document.createElement("p");
                errorMsg.className = "error-message";
                errorMsg.textContent = "Please type DELETE exactly as shown to confirm";
                
                // Check if we already added an error message
                const existingError = document.querySelector("#delete-confirmation + .error-message");
                if (existingError) {
                    existingError.remove();
                }
                
                // Add error message after input
                document.getElementById("delete-confirmation").after(errorMsg);
            }
        }
    );
    
    // Change confirm button to danger style
    const confirmBtn = document.getElementById("modal-confirm");
    confirmBtn.className = "warning-btn";
    confirmBtn.textContent = "Clear All Data";
}

/**
 * Export settings to a JSON file
 */
function exportSettings() {
    const jsonContent = JSON.stringify(settings, null, 2);
    downloadFile(jsonContent, "incident-logger-settings.json", "application/json");
    
    showToast("Settings exported successfully", "success");
}

/**
 * Import settings from a JSON file
 */
function importSettings() {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    
    // Listen for file selection
    fileInput.addEventListener("change", function() {
        if (fileInput.files.length === 0) {
            document.body.removeChild(fileInput);
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedSettings = JSON.parse(e.target.result);
                
                // Validate settings
                if (!validateSettings(importedSettings)) {
                    showToast("Invalid settings file format", "error");
                    return;
                }
                
                // Apply settings
                settings = importedSettings;
                saveSettings();
                applySettings();
                
                // Update any UI elements that depend on settings
                itemsPerPage = settings.itemsPerPage;
                refreshIncidentList();
                
                showToast("Settings imported successfully", "success");
            } catch (error) {
                console.error("Error parsing settings file:", error);
                showToast("Error parsing settings file", "error");
            } finally {
                document.body.removeChild(fileInput);
            }
        };
        
        reader.onerror = function() {
            showToast("Error reading file", "error");
            document.body.removeChild(fileInput);
        };
        
        reader.readAsText(file);
    });
    
    // Trigger file selection dialog
    fileInput.click();
}

/**
 * Validate imported settings
 * @param {Object} importedSettings - The settings to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateSettings(importedSettings) {
    // Check if it's an object
    if (typeof importedSettings !== 'object' || importedSettings === null) {
        return false;
    }
    
    // Define required fields and types
    const requiredFields = {
        defaultStatus: 'string',
        autoSaveInterval: 'number',
        defaultLocation: 'string',
        itemsPerPage: 'number',
        dateFormat: 'string',
        timeFormat: 'string',
        storageMode: 'string'
    };
    
    // Check each required field
    for (const [field, type] of Object.entries(requiredFields)) {
        if (!(field in importedSettings) || typeof importedSettings[field] !== type) {
            return false;
        }
    }
    
    return true;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, warning, info)
 */
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add event listener for close button
    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.classList.add("toast-fade-out");
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    });
    
    // Auto remove after timeout
    setTimeout(() => {
        if (toastContainer.contains(toast)) {
            toast.classList.add("toast-fade-out");
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Get icon class for toast notification
 * @param {string} type - The notification type
 * @returns {string} - The icon class
 */
function getToastIcon(type) {
    switch (type) {
        case "success": return "check-circle";
        case "error": return "exclamation-circle";
        case "warning": return "exclamation-triangle";
        case "info": return "info-circle";
        default: return "info-circle";
    }
}

/**
 * Show a modal dialog
 * @param {string} title - The modal title
 * @param {HTMLElement|string} content - The modal content
 * @param {Function} cancelCallback - Callback when cancelled
 * @param {Function} confirmCallback - Callback when confirmed
 */
function showModal(title, content, cancelCallback, confirmCallback) {
    const modalContainer = document.getElementById("modal-container");
    const modalTitle = document.getElementById("modal-title");
    const modalContent = document.getElementById("modal-content");
    const modalCancel = document.getElementById("modal-cancel");
    const modalConfirm = document.getElementById("modal-confirm");
    const modalClose = document.getElementById("modal-close");
    
    // Set title and content
    modalTitle.textContent = title;
    
    // Clear previous content
    modalContent.innerHTML = "";
    
    // Add new content
    if (typeof content === "string") {
        modalContent.innerHTML = content;
    } else {
        modalContent.appendChild(content);
    }
    
    // Set callbacks
    modalCancel.onclick = () => {
        closeModal();
        if (cancelCallback) cancelCallback();
    };
    
    modalConfirm.onclick = () => {
        if (confirmCallback) confirmCallback();
    };
    
    modalClose.onclick = () => {
        closeModal();
        if (cancelCallback) cancelCallback();
    };
    
    // Reset button styles
    modalCancel.className = "secondary-btn";
    modalConfirm.className = "primary-btn";
    modalCancel.textContent = "Cancel";
    modalConfirm.className = "primary-btn";
    modalConfirm.textContent = "Confirm";
    
    // Show modal
    modalContainer.style.display = "flex";
    
    // Add click outside to close
    modalContainer.onclick = (event) => {
        if (event.target === modalContainer) {
            closeModal();
            if (cancelCallback) cancelCallback();
        }
    };
}

/**
 * Close the modal dialog
 */
function closeModal() {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.style.display = "none";
}
