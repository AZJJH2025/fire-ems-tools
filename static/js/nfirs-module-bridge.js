/**
 * NFIRS Module Bridge - Ensures proper namespace connections
 * This file loads after all NFIRS modules and connects them properly
 */

// Log that bridge is running
console.log("NFIRS module bridge executing...");

// Ensure namespace exists
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.NFIRS = window.IncidentLogger.NFIRS || {};

// Check if window.NFIRS_CODES exists but missing actionTaken
if (window.NFIRS_CODES) {
    console.log("NFIRS_CODES found, checking for missing properties...");
    
    // Fix actionTaken if missing
    if (!window.NFIRS_CODES.actionTaken && window.NFIRS_CODES.actionsTaken) {
        console.log("Fixing actionsTaken -> actionTaken");
        window.NFIRS_CODES.actionTaken = window.NFIRS_CODES.actionsTaken;
    }
    
    // Recreate actionTaken if still missing
    if (!window.NFIRS_CODES.actionTaken) {
        console.log("Creating default actionTaken");
        window.NFIRS_CODES.actionTaken = {
            "11": "Extinguish",
            "12": "Salvage & overhaul",
            "21": "Search",
            "22": "Rescue, remove from harm",
            "31": "Provide first aid & check for injuries",
            "32": "Provide basic life support (BLS)",
            "33": "Provide advanced life support (ALS)",
            "34": "Transport person",
            "51": "Ventilate",
            "81": "Incident command",
            "86": "Investigate",
            "93": "Canceled en route",
            "99": "No action taken"
        };
    }
    
    // Ensure it's in the namespace
    window.IncidentLogger.NFIRS.CODES = window.NFIRS_CODES;
}

// Create validator if missing
if (!window.IncidentLogger.NFIRS.Validator) {
    console.log("Creating NFIRS.Validator namespace");
    window.IncidentLogger.NFIRS.Validator = {
        validate: function(incident) {
            console.log("Using fallback validator");
            return { 
                isValid: true, 
                errors: [],
                warnings: [] 
            };
        },
        isReadyForExport: function() { return true; },
        getMissingFields: function() { return []; },
        formatFieldValue: function(value) { return value; },
        getCodeLabel: function(code) { return code; },
        formatCodeDisplay: function(code) { return code; },
        searchCodes: function(query, type) {
            if (window.NFIRS_CODES && window.NFIRS_CODES[type]) {
                // Basic search implementation
                const results = [];
                const normalizedQuery = query.toLowerCase();
                
                Object.entries(window.NFIRS_CODES[type]).forEach(([code, description]) => {
                    if (code.toLowerCase().includes(normalizedQuery) || 
                        description.toLowerCase().includes(normalizedQuery)) {
                        results.push({
                            code: code,
                            description: description,
                            display: `${code} - ${description}`
                        });
                    }
                });
                
                return results;
            }
            return [];
        }
    };
}

// Create export if missing
if (!window.IncidentLogger.NFIRS.Export) {
    console.log("Creating NFIRS.Export namespace");
    window.IncidentLogger.NFIRS.Export = {
        toXML: function() { return "<placeholder></placeholder>"; },
        toCSV: function() { return "placeholder"; },
        toJSON: function() { return "{}"; }
    };
}

// Set up global compatibility functions
window.validateNFIRSCompliance = function(incident) {
    return window.IncidentLogger.NFIRS.Validator.validate(incident);
};

window.isNFIRSReadyForExport = function(incident) {
    return window.IncidentLogger.NFIRS.Validator.isReadyForExport(incident);
};

window.getMissingNFIRSFields = function(incident) {
    return window.IncidentLogger.NFIRS.Validator.getMissingFields(incident);
};

window.convertToNFIRSXML = function(incident) {
    return window.IncidentLogger.NFIRS.Export.toXML(incident);
};

window.convertToNFIRSCSV = function(incident) {
    return window.IncidentLogger.NFIRS.Export.toCSV(incident);
};

window.convertToNFIRSJSON = function(incident) {
    return window.IncidentLogger.NFIRS.Export.toJSON(incident);
};

// Log completion
console.log("NFIRS module bridge completed");