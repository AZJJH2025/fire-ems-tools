/**
 * NFIRS Export - Converted from module to regular script
 */

// Create namespace if it doesn't exist
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.NFIRS = window.IncidentLogger.NFIRS || {};

/**
 * Convert an incident to NFIRS XML format
 * @param {Object} incident - The incident data to convert
 * @returns {string} - XML string in NFIRS format
 */
function convertToNFIRSXML(incident) {
    // Check if the incident is valid for NFIRS export
    if (!window.IncidentLogger.NFIRS.Validator.isReadyForExport(incident)) {
        throw new Error("Incident is missing required NFIRS fields: " + 
                       window.IncidentLogger.NFIRS.Validator.getMissingFields(incident).join(", "));
    }
    
    // Create XML document
    const xmlDoc = document.implementation.createDocument(null, "NFIRSIncident", null);
    const root = xmlDoc.documentElement;
    
    // Add NFIRS namespaces and schema references
    root.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
    root.setAttribute("xsi:noNamespaceSchemaLocation", "NFIRS_Incident_v5.0.xsd");
    
    // Add basic incident information
    const basicModule = xmlDoc.createElement("BasicModule");
    
    // Add incident identification
    const incidentIdent = xmlDoc.createElement("IncidentIdent");
    addElement(xmlDoc, incidentIdent, "IncidentNumber", incident.id);
    addElement(xmlDoc, incidentIdent, "ExposureNumber", "000"); // Default exposure
    basicModule.appendChild(incidentIdent);
    
    // Add date and times
    addElement(xmlDoc, basicModule, "IncidentDate", formatDate(incident.timestamp));
    
    if (incident.dispatch) {
        if (incident.dispatch.time_dispatched) {
            addElement(xmlDoc, basicModule, "AlarmTime", formatTime(incident.dispatch.time_dispatched));
        }
        if (incident.dispatch.time_arrived) {
            addElement(xmlDoc, basicModule, "ArrivalTime", formatTime(incident.dispatch.time_arrived));
        }
        if (incident.dispatch.time_cleared) {
            addElement(xmlDoc, basicModule, "ControlledTime", formatTime(incident.dispatch.time_cleared));
        }
        if (incident.dispatch.time_cleared) {
            addElement(xmlDoc, basicModule, "LastUnitClearedTime", formatTime(incident.dispatch.time_cleared));
        }
    }
    
    // Add incident type
    addElement(xmlDoc, basicModule, "IncidentTypeCode", incident.incident_type.primary);
    
    // Add property use
    addElement(xmlDoc, basicModule, "PropertyUseCode", incident.incident_type.property_use || "NNN");
    
    // Add address information
    const address = xmlDoc.createElement("Address");
    if (incident.location) {
        addElement(xmlDoc, address, "StreetAddress", incident.location.address);
        addElement(xmlDoc, address, "City", incident.location.city);
        addElement(xmlDoc, address, "State", incident.location.state);
        addElement(xmlDoc, address, "ZIP", incident.location.zip);
    }
    basicModule.appendChild(address);
    
    // Add aid information
    addElement(xmlDoc, basicModule, "AidGivenReceivedCode", incident.aid_given_received || "N");
    
    // Add apparatus information
    if (incident.units && incident.units.length > 0) {
        const apparatus = xmlDoc.createElement("Apparatus");
        
        incident.units.forEach((unit, index) => {
            const unitElement = xmlDoc.createElement("ApparatusResource");
            addElement(xmlDoc, unitElement, "ApparatusID", unit.id);
            addElement(xmlDoc, unitElement, "UseCode", mapUnitTypeToNFIRS(unit.type));
            
            // Add personnel count
            if (unit.personnel && Array.isArray(unit.personnel)) {
                addElement(xmlDoc, unitElement, "PersonnelCount", unit.personnel.length.toString());
            }
            
            apparatus.appendChild(unitElement);
        });
        
        basicModule.appendChild(apparatus);
    }
    
    // Add personnel information
    if (incident.units) {
        const personnel = xmlDoc.createElement("Personnel");
        let personnelCount = 0;
        
        incident.units.forEach(unit => {
            if (unit.personnel && Array.isArray(unit.personnel)) {
                personnelCount += unit.personnel.length;
            }
        });
        
        addElement(xmlDoc, personnel, "TotalPersonnel", personnelCount.toString());
        basicModule.appendChild(personnel);
    }
    
    // Add actions taken
    if (incident.actions && incident.actions.length > 0) {
        const actions = xmlDoc.createElement("ActionsTaken");
        
        incident.actions.forEach(action => {
            const actionElement = xmlDoc.createElement("ActionTaken");
            addElement(xmlDoc, actionElement, "ActionTakenCode", action.code);
            actions.appendChild(actionElement);
        });
        
        basicModule.appendChild(actions);
    }
    
    // Add detector information
    if (incident.detector) {
        addElement(xmlDoc, basicModule, "DetectorPresenceCode", incident.detector);
    }
    
    // Add property and casualty values
    if (incident.property) {
        addElement(xmlDoc, basicModule, "PropertyLoss", incident.property.loss || "0");
        addElement(xmlDoc, basicModule, "ContentLoss", incident.property.content_loss || "0");
    }
    
    if (incident.casualties) {
        addElement(xmlDoc, basicModule, "CivilianDeaths", incident.casualties.civilian_deaths || "0");
        addElement(xmlDoc, basicModule, "CivilianInjuries", incident.casualties.civilian_injuries || "0");
        addElement(xmlDoc, basicModule, "FireServiceDeaths", incident.casualties.fire_deaths || "0");
        addElement(xmlDoc, basicModule, "FireServiceInjuries", incident.casualties.fire_injuries || "0");
    }
    
    // Add narrative
    if (incident.narrative) {
        addElement(xmlDoc, basicModule, "Remarks", incident.narrative);
    }
    
    // Add completed module to root
    root.appendChild(basicModule);
    
    // Add Fire Module if incident is a fire
    const isFireIncident = incident.incident_type.primary >= 100 && incident.incident_type.primary <= 199;
    
    if (isFireIncident && incident.fire_module) {
        const fireModule = xmlDoc.createElement("FireModule");
        
        // Add fire origin information
        if (incident.fire_module.area_of_origin) {
            addElement(xmlDoc, fireModule, "AreaOfFireOriginCode", incident.fire_module.area_of_origin);
        }
        
        if (incident.fire_module.heat_source) {
            addElement(xmlDoc, fireModule, "HeatSourceCode", incident.fire_module.heat_source);
        }
        
        if (incident.fire_module.item_first_ignited) {
            addElement(xmlDoc, fireModule, "ItemFirstIgnitedCode", incident.fire_module.item_first_ignited);
        }
        
        if (incident.fire_module.fire_spread !== undefined) {
            addElement(xmlDoc, fireModule, "FireSpreadCode", incident.fire_module.fire_spread.toString());
        }
        
        // Add fire module to root
        root.appendChild(fireModule);
    }
    
    // Add EMS Module if incident is an EMS call
    const isEMSIncident = incident.incident_type.primary >= 300 && incident.incident_type.primary <= 399;
    
    if (isEMSIncident && incident.patient_info && incident.patient_info.details && incident.patient_info.details.length > 0) {
        const emsModule = xmlDoc.createElement("EMSModule");
        
        // Add patient information
        incident.patient_info.details.forEach((patient, index) => {
            const patientElement = xmlDoc.createElement("EMS_Patient");
            
            // Add patient number
            addElement(xmlDoc, patientElement, "PatientNumber", (index + 1).toString());
            
            // Add patient age
            if (patient.age) {
                addElement(xmlDoc, patientElement, "AgeUnits", "0"); // 0 = Years
                addElement(xmlDoc, patientElement, "Age", patient.age.toString());
            }
            
            // Add patient gender
            if (patient.gender) {
                addElement(xmlDoc, patientElement, "GenderCode", mapGenderToNFIRS(patient.gender));
            }
            
            // Add chief complaint
            if (patient.chief_complaint) {
                addElement(xmlDoc, patientElement, "SymptomsTakenFromPatient", patient.chief_complaint);
            }
            
            // Add vitals if available
            if (patient.vitals && patient.vitals.length > 0) {
                const vitalsSet = xmlDoc.createElement("EMS_Vitals");
                const latestVitals = patient.vitals[patient.vitals.length - 1];
                
                if (latestVitals.time) {
                    addElement(xmlDoc, vitalsSet, "VitalsDateTime", formatDateTime(latestVitals.time));
                }
                
                if (latestVitals.bp) {
                    const bpParts = latestVitals.bp.split('/');
                    if (bpParts.length === 2) {
                        addElement(xmlDoc, vitalsSet, "SystolicBloodPressure", bpParts[0]);
                        addElement(xmlDoc, vitalsSet, "DiastolicBloodPressure", bpParts[1]);
                    }
                }
                
                if (latestVitals.pulse) {
                    addElement(xmlDoc, vitalsSet, "PulseRate", latestVitals.pulse.toString());
                }
                
                if (latestVitals.respiration) {
                    addElement(xmlDoc, vitalsSet, "RespiratoryRate", latestVitals.respiration.toString());
                }
                
                patientElement.appendChild(vitalsSet);
            }
            
            emsModule.appendChild(patientElement);
        });
        
        // Add disposition information
        if (incident.disposition) {
            if (incident.disposition.transported) {
                addElement(xmlDoc, emsModule, "PatientTransportCode", "1"); // 1 = Transported by Fire Department
                
                if (incident.disposition.destination) {
                    const destinationText = incident.disposition.destination;
                    addElement(xmlDoc, emsModule, "TransportDestination", destinationText);
                }
            } else {
                addElement(xmlDoc, emsModule, "PatientTransportCode", "4"); // 4 = Not transported
            }
        }
        
        // Add EMS module to root
        root.appendChild(emsModule);
    }
    
    // Serialize the XML document to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}

/**
 * Convert an incident to NFIRS CSV format
 * @param {Object} incident - The incident data to convert
 * @returns {string} - CSV string in NFIRS format
 */
function convertToNFIRSCSV(incident) {
    // Check if the incident is valid for NFIRS export
    if (!window.IncidentLogger.NFIRS.Validator.isReadyForExport(incident)) {
        throw new Error("Incident is missing required NFIRS fields: " + 
                       window.IncidentLogger.NFIRS.Validator.getMissingFields(incident).join(", "));
    }
    
    // Build the header and data rows
    const headers = [
        "FDID", "State", "IncidentNumber", "ExposureNumber", "IncidentDate", 
        "AlarmTime", "ArrivalTime", "IncidentTypeCode", "PropertyUseCode",
        "StreetAddress", "City", "ZipCode", "AidGivenReceived",
        "DetectorPresence", "PropertyLoss", "ContentLoss", "CivilianDeaths",
        "CivilianInjuries", "FireServiceDeaths", "FireServiceInjuries",
        "AreaOfFireOrigin", "HeatSource", "ItemFirstIgnited", "FireSpread"
    ];
    
    // Build the data row
    const data = [];
    
    // Add FDID and State (these would come from agency settings)
    data.push(incident.fdid || "00000"); // Default FDID
    data.push(incident.location?.state || "");
    
    // Add incident identification
    data.push(incident.id || "");
    data.push("000"); // Default exposure
    
    // Add date and times
    data.push(formatDate(incident.timestamp) || "");
    data.push(formatTime(incident.dispatch?.time_dispatched) || "");
    data.push(formatTime(incident.dispatch?.time_arrived) || "");
    
    // Add incident type and property use
    data.push(incident.incident_type?.primary || "");
    data.push(incident.incident_type?.property_use || "NNN");
    
    // Add address
    data.push(incident.location?.address || "");
    data.push(incident.location?.city || "");
    data.push(incident.location?.zip || "");
    
    // Add aid given/received
    data.push(incident.aid_given_received || "N");
    
    // Add detector presence
    data.push(incident.detector || "U");
    
    // Add property and casualty data
    data.push(incident.property?.loss || "0");
    data.push(incident.property?.content_loss || "0");
    data.push(incident.casualties?.civilian_deaths || "0");
    data.push(incident.casualties?.civilian_injuries || "0");
    data.push(incident.casualties?.fire_deaths || "0");
    data.push(incident.casualties?.fire_injuries || "0");
    
    // Add fire module data
    data.push(incident.fire_module?.area_of_origin || "UU");
    data.push(incident.fire_module?.heat_source || "UU");
    data.push(incident.fire_module?.item_first_ignited || "UU");
    data.push(incident.fire_module?.fire_spread?.toString() || "U");
    
    // Join data into CSV format
    const csvData = data.map(escapeCSVField).join(",");
    return headers.join(",") + "\n" + csvData;
}

/**
 * Convert an incident to NFIRS JSON format
 * @param {Object} incident - The incident data to convert
 * @returns {Object} - JSON object in NFIRS format
 */
function convertToNFIRSJSON(incident) {
    // Check if the incident is valid for NFIRS export
    if (!window.IncidentLogger.NFIRS.Validator.isReadyForExport(incident)) {
        throw new Error("Incident is missing required NFIRS fields: " + 
                       window.IncidentLogger.NFIRS.Validator.getMissingFields(incident).join(", "));
    }
    
    // Create NFIRS JSON structure
    const nfirsData = {
        meta: {
            format: "NFIRS_JSON",
            version: "1.0",
            exported_at: new Date().toISOString(),
            fdid: incident.fdid || "00000", // Default FDID
            state: incident.location?.state || ""
        },
        basic: {
            identification: {
                incident_number: incident.id || "",
                exposure_number: "000" // Default exposure
            },
            dates_times: {
                incident_date: formatDate(incident.timestamp) || "",
                alarm_time: formatTime(incident.dispatch?.time_dispatched) || "",
                arrival_time: formatTime(incident.dispatch?.time_arrived) || "",
                controlled_time: formatTime(incident.dispatch?.time_cleared) || "",
                last_unit_cleared: formatTime(incident.dispatch?.time_cleared) || ""
            },
            incident_type: {
                code: incident.incident_type?.primary || "",
                description: window.NFIRS_CODES.incidentTypes[incident.incident_type?.primary] || ""
            },
            property: {
                property_use: {
                    code: incident.incident_type?.property_use || "NNN",
                    description: window.NFIRS_CODES.propertyUse[incident.incident_type?.property_use] || "None"
                }
            },
            address: {
                street: incident.location?.address || "",
                city: incident.location?.city || "",
                state: incident.location?.state || "",
                zip: incident.location?.zip || ""
            },
            aid: {
                code: incident.aid_given_received || "N",
                description: window.NFIRS_CODES.aidGivenReceived[incident.aid_given_received] || "None"
            },
            actions_taken: []
        }
    };
    
    // Add actions taken
    if (incident.actions && incident.actions.length > 0) {
        incident.actions.forEach(action => {
            nfirsData.basic.actions_taken.push({
                code: action.code,
                description: window.NFIRS_CODES.actionTaken[action.code] || ""
            });
        });
    }
    
    // Add resources
    if (incident.units && incident.units.length > 0) {
        nfirsData.basic.resources = {
            apparatus: [],
            personnel_count: 0
        };
        
        incident.units.forEach(unit => {
            const apparatusEntry = {
                id: unit.id,
                use_code: mapUnitTypeToNFIRS(unit.type)
            };
            
            if (unit.personnel && Array.isArray(unit.personnel)) {
                apparatusEntry.personnel_count = unit.personnel.length;
                nfirsData.basic.resources.personnel_count += unit.personnel.length;
            }
            
            nfirsData.basic.resources.apparatus.push(apparatusEntry);
        });
    }
    
    // Add detector information
    if (incident.detector) {
        nfirsData.basic.detector = {
            code: incident.detector,
            description: window.NFIRS_CODES.detector[incident.detector] || ""
        };
    }
    
    // Add casualties and property loss
    nfirsData.basic.casualties = {
        civilian_deaths: parseInt(incident.casualties?.civilian_deaths || "0"),
        civilian_injuries: parseInt(incident.casualties?.civilian_injuries || "0"),
        fire_deaths: parseInt(incident.casualties?.fire_deaths || "0"),
        fire_injuries: parseInt(incident.casualties?.fire_injuries || "0")
    };
    
    nfirsData.basic.property_loss = {
        property: parseInt(incident.property?.loss || "0"),
        contents: parseInt(incident.property?.content_loss || "0")
    };
    
    // Add remarks/narrative
    if (incident.narrative) {
        nfirsData.basic.remarks = incident.narrative;
    }
    
    // Add Fire Module if incident is a fire
    const isFireIncident = incident.incident_type.primary >= 100 && incident.incident_type.primary <= 199;
    
    if (isFireIncident && incident.fire_module) {
        nfirsData.fire = {
            origin: incident.fire_module.area_of_origin || "UU",
            heat_source: incident.fire_module.heat_source || "UU",
            item_first_ignited: incident.fire_module.item_first_ignited || "UU",
            fire_spread: incident.fire_module.fire_spread?.toString() || "U"
        };
    }
    
    // Add EMS Module if incident is an EMS call
    const isEMSIncident = incident.incident_type.primary >= 300 && incident.incident_type.primary <= 399;
    
    if (isEMSIncident && incident.patient_info && incident.patient_info.details && incident.patient_info.details.length > 0) {
        nfirsData.ems = {
            patients: []
        };
        
        incident.patient_info.details.forEach((patient, index) => {
            const patientEntry = {
                number: index + 1,
                demographics: {}
            };
            
            if (patient.age) {
                patientEntry.demographics.age = parseInt(patient.age);
                patientEntry.demographics.age_units = "Years";
            }
            
            if (patient.gender) {
                patientEntry.demographics.gender = mapGenderToNFIRS(patient.gender);
            }
            
            if (patient.chief_complaint) {
                patientEntry.chief_complaint = patient.chief_complaint;
            }
            
            // Add vitals if available
            if (patient.vitals && patient.vitals.length > 0) {
                const latestVitals = patient.vitals[patient.vitals.length - 1];
                patientEntry.vitals = {
                    time: formatDateTime(latestVitals.time) || ""
                };
                
                if (latestVitals.bp) {
                    const bpParts = latestVitals.bp.split('/');
                    if (bpParts.length === 2) {
                        patientEntry.vitals.systolic = parseInt(bpParts[0]);
                        patientEntry.vitals.diastolic = parseInt(bpParts[1]);
                    }
                }
                
                if (latestVitals.pulse) {
                    patientEntry.vitals.pulse = parseInt(latestVitals.pulse);
                }
                
                if (latestVitals.respiration) {
                    patientEntry.vitals.respiration = parseInt(latestVitals.respiration);
                }
                
                if (latestVitals.spo2) {
                    patientEntry.vitals.spo2 = parseInt(latestVitals.spo2);
                }
            }
            
            nfirsData.ems.patients.push(patientEntry);
        });
        
        // Add disposition information
        if (incident.disposition) {
            nfirsData.ems.disposition = {
                transported: incident.disposition.transported
            };
            
            if (incident.disposition.transported && incident.disposition.destination) {
                nfirsData.ems.disposition.destination = incident.disposition.destination;
            }
        }
    }
    
    return nfirsData;
}

/**
 * Add an XML element with text content to a parent element
 * @param {Document} doc - The XML document
 * @param {Element} parent - The parent element
 * @param {string} name - The name of the element to create
 * @param {string} text - The text content of the element
 */
function addElement(doc, parent, name, text) {
    const element = doc.createElement(name);
    
    if (text !== undefined && text !== null) {
        element.textContent = text;
    }
    
    parent.appendChild(element);
    return element;
}

/**
 * Format a date string to NFIRS format (YYYYMMDD)
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateStr) {
    if (!dateStr) return "";
    
    try {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}${month}${day}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "";
    }
}

/**
 * Format a time string to NFIRS format (HHMM)
 * @param {string} timeStr - ISO date-time string
 * @returns {string} - Formatted time string
 */
function formatTime(timeStr) {
    if (!timeStr) return "";
    
    try {
        const date = new Date(timeStr);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${hours}${minutes}`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return "";
    }
}

/**
 * Format a datetime string to NFIRS format (YYYYMMDD HHMM)
 * @param {string} datetimeStr - ISO date-time string
 * @returns {string} - Formatted date-time string
 */
function formatDateTime(datetimeStr) {
    if (!datetimeStr) return "";
    
    try {
        const date = new Date(datetimeStr);
        const formattedDate = formatDate(datetimeStr);
        const formattedTime = formatTime(datetimeStr);
        
        return `${formattedDate} ${formattedTime}`;
    } catch (error) {
        console.error("Error formatting datetime:", error);
        return "";
    }
}

/**
 * Map application unit type to NFIRS apparatus type code
 * @param {string} unitType - Unit type from the application
 * @returns {string} - NFIRS apparatus type code
 */
function mapUnitTypeToNFIRS(unitType) {
    if (!unitType) return "00";
    
    const unitTypeMap = {
        "Engine": "11",
        "Ladder": "12",
        "Ambulance": "76",
        "Rescue": "13",
        "Battalion": "92",
        "Hazmat": "40",
        "Chief": "91",
        "Squad": "17"
    };
    
    return unitTypeMap[unitType] || "00";
}

/**
 * Map gender to NFIRS gender code
 * @param {string} gender - Gender from the application
 * @returns {string} - NFIRS gender code
 */
function mapGenderToNFIRS(gender) {
    if (!gender) return "U";
    
    const genderMap = {
        "male": "M",
        "female": "F",
        "other": "O",
        "unknown": "U"
    };
    
    return genderMap[gender.toLowerCase()] || "U";
}

/**
 * Escape a field for CSV output
 * @param {string} field - The field value
 * @returns {string} - Escaped field value
 */
function escapeCSVField(field) {
    if (field === undefined || field === null) {
        return "";
    }
    
    const stringField = String(field);
    
    // If the field contains commas, quotes, or newlines, wrap it in quotes
    if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
        // Double any existing quotes
        const escapedField = stringField.replace(/"/g, '""');
        return `"${escapedField}"`;
    }
    
    return stringField;
}

// Add to the namespace
window.IncidentLogger.NFIRS.Export = {
    toXML: convertToNFIRSXML,
    toCSV: convertToNFIRSCSV,
    toJSON: convertToNFIRSJSON
};

console.log("NFIRS Export loaded successfully (fixed version)");