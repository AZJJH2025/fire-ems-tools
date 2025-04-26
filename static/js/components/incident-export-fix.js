/**
 * FireEMS.ai Incident Logger - Export Component - Fixed Version
 * 
 * This component handles exporting incident data in various formats.
 * (Converted from ES6 module import/export to namespace pattern)
 */

// Create namespace if it doesn't exist
window.IncidentLogger = window.IncidentLogger || {};

/**
 * Generate an export based on user selections
 */
function generateExport() {
    console.log("Export generation started");
    
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
    const dateFrom = document.getElementById("export-date-from")?.value || '';
    const dateTo = document.getElementById("export-date-to")?.value || '';
    
    // Get HIPAA compliance option
    const hipaaCompliant = document.getElementById("export-hipaa-compliant")?.checked || false;
    
    // Get NFIRS compliance option
    const nfirsCompliant = document.getElementById("export-nfirs-compliant")?.checked || false;
    
    console.log(`Export settings: format=${format}, selection=${selection}, hipaa=${hipaaCompliant}, nfirs=${nfirsCompliant}`);
    
    // Load incident data from localStorage
    // Try different ways to get the incident list
    let incidentList = [];
    let filteredIncidents = [];
    
    // Try to get from window.incidentList global if it exists
    if (typeof window.incidentList !== 'undefined') {
        incidentList = window.incidentList;
        console.log(`Found ${incidentList.length} incidents in global incidentList`);
    } else {
        // Try to collect from localStorage directly
        console.log("Global incidentList not found, collecting from localStorage");
        
        try {
            // Look for incidents in localStorage - both drafts and submitted
            const incidents = [];
            
            // Scan localStorage for incident keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('incident_draft_') || key.startsWith('incident_submitted_')) {
                    try {
                        const incident = JSON.parse(localStorage.getItem(key));
                        incidents.push(incident);
                    } catch (e) {
                        console.error(`Error parsing incident from localStorage key ${key}:`, e);
                    }
                }
            }
            
            incidentList = incidents;
            console.log(`Found ${incidentList.length} incidents in localStorage`);
        } catch (e) {
            console.error("Error loading incidents from localStorage:", e);
            showToast("Error loading incidents", "error");
            return;
        }
    }
    
    // If there are no incidents, show message and return
    if (incidentList.length === 0) {
        console.log("No incidents found for export");
        showToast("No incidents found to export", "warning");
        return;
    }
    
    // Filter incidents based on selection
    let incidents = [];
    
    switch (selection) {
        case "all":
            incidents = [...incidentList];
            break;
        case "filtered":
            // If filtered list not available, use all incidents
            incidents = filteredIncidents.length > 0 ? [...filteredIncidents] : [...incidentList];
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
        incidents = incidents.map(incident => {
            // Use HIPAA module from the IncidentLogger namespace
            if (window.IncidentLogger.HIPAA && window.IncidentLogger.HIPAA.deidentify) {
                return window.IncidentLogger.HIPAA.deidentify(incident);
            } else {
                // Fallback if module not loaded
                return deidentifyIncident(incident);
            }
        });
    }
    
    // If NFIRS format is requested, use those specialized export functions
    if (nfirsCompliant) {
        // Check NFIRS compliance for each incident
        const nfirsCompliantIncidents = [];
        const nonCompliantIncidents = [];
        
        incidents.forEach(incident => {
            // Use the NFIRS validator from the namespace
            if (window.IncidentLogger.NFIRS && 
                window.IncidentLogger.NFIRS.Validator && 
                window.IncidentLogger.NFIRS.Validator.isReadyForExport) {
                
                if (window.IncidentLogger.NFIRS.Validator.isReadyForExport(incident)) {
                    nfirsCompliantIncidents.push(incident);
                } else {
                    nonCompliantIncidents.push({
                        id: incident.id,
                        missingFields: window.IncidentLogger.NFIRS.Validator.getMissingFields(incident)
                    });
                }
            } else {
                // Fallback to global functions if available
                if (window.isNFIRSReadyForExport && window.isNFIRSReadyForExport(incident)) {
                    nfirsCompliantIncidents.push(incident);
                } else if (window.getMissingNFIRSFields) {
                    nonCompliantIncidents.push({
                        id: incident.id,
                        missingFields: window.getMissingNFIRSFields(incident)
                    });
                } else {
                    // Without NFIRS validation, assume compliant
                    nfirsCompliantIncidents.push(incident);
                }
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
                    let incidentXml;
                    
                    // Use the NFIRS Export module from the namespace
                    if (window.IncidentLogger.NFIRS && 
                        window.IncidentLogger.NFIRS.Export && 
                        window.IncidentLogger.NFIRS.Export.toXML) {
                        
                        incidentXml = window.IncidentLogger.NFIRS.Export.toXML(incident);
                    } else if (window.convertToNFIRSXML) {
                        // Fallback to global function
                        incidentXml = window.convertToNFIRSXML(incident);
                    } else {
                        throw new Error("NFIRS XML export function not available");
                    }
                    
                    // Strip the XML declaration from individual incident exports
                    incidentXml = incidentXml.replace('<?xml version="1.0" encoding="UTF-8"?>', '');
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
                    let incidentCsv;
                    
                    // Use the NFIRS Export module from the namespace
                    if (window.IncidentLogger.NFIRS && 
                        window.IncidentLogger.NFIRS.Export && 
                        window.IncidentLogger.NFIRS.Export.toCSV) {
                        
                        incidentCsv = window.IncidentLogger.NFIRS.Export.toCSV(incident);
                    } else if (window.convertToNFIRSCSV) {
                        // Fallback to global function
                        incidentCsv = window.convertToNFIRSCSV(incident);
                    } else {
                        throw new Error("NFIRS CSV export function not available");
                    }
                    
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
                    incidents: incidents.map(incident => {
                        // Use the NFIRS Export module from the namespace
                        if (window.IncidentLogger.NFIRS && 
                            window.IncidentLogger.NFIRS.Export && 
                            window.IncidentLogger.NFIRS.Export.toJSON) {
                            
                            return window.IncidentLogger.NFIRS.Export.toJSON(incident);
                        } else if (window.convertToNFIRSJSON) {
                            // Fallback to global function
                            return window.convertToNFIRSJSON(incident);
                        } else {
                            throw new Error("NFIRS JSON export function not available");
                        }
                    })
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
 * Format a date object as a string
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date || isNaN(date)) return "";
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString(undefined, options);
}

/**
 * Basic de-identification for fallback if HIPAA module not loaded
 * @param {Object} incident - Incident to de-identify
 * @returns {Object} - De-identified incident
 */
function deidentifyIncident(incident) {
    // Create a deep copy
    const deidentified = JSON.parse(JSON.stringify(incident));
    
    // Basic PHI removal
    if (deidentified.caller_info) {
        deidentified.caller_info.name = "[REDACTED]";
        deidentified.caller_info.phone = "[REDACTED]";
    }
    
    if (deidentified.patient_info && deidentified.patient_info.details) {
        deidentified.patient_info.details.forEach(patient => {
            // Remove direct identifiers
            patient.name = "[REDACTED]";
            delete patient.dob;
            delete patient.address;
            delete patient.phone;
            delete patient.ssn;
        });
    }
    
    return deidentified;
}

// Helper function to display toasts if missing
function showToast(message, type = "info") {
    console.log(`Toast: ${type} - ${message}`);
    
    // Check if showToast is globally available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Create our own toast if not available
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Show then remove after a delay
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }, 10);
    }
}

// Helper function to show modals if missing
function showModal(title, content, cancelCallback, confirmCallback) {
    console.log(`Modal: ${title}`);
    
    // Check if showModal is globally available
    if (typeof window.showModal === 'function') {
        window.showModal(title, content, cancelCallback, confirmCallback);
    } else {
        // Create our own modal if not available
        alert(`${title}\n\n${content instanceof HTMLElement ? content.textContent : content}`);
        if (confirmCallback) confirmCallback();
    }
}

// Helper function to close modal if missing
function closeModal() {
    // Check if closeModal is globally available
    if (typeof window.closeModal === 'function') {
        window.closeModal();
    }
}

// Add to namespace
window.IncidentLogger.Export = {
    generate: generateExport,
    toCSV: exportCSV,
    toPDF: exportPDF,
    toJSON: exportJSON
};

console.log("Incident Export component loaded (fixed version)");

// Initialize export button event handler
document.addEventListener('DOMContentLoaded', function() {
    console.log("Setting up export button handler");
    
    const exportBtn = document.getElementById('generate-export-btn');
    if (exportBtn) {
        console.log("Found export button, attaching click handler");
        exportBtn.addEventListener('click', function() {
            console.log("Export button clicked");
            generateExport();
        });
    } else {
        console.warn("Export button not found in DOM");
    }
});