/**
 * NFIRS Bundle
 * 
 * This is a bundled entry point for all NFIRS-related modules
 */

// Import NFIRS modules
import { NFIRSCodes } from './nfirs/nfirs-codes.js';
import { NFIRSValidator } from './nfirs/nfirs-validator.js';
import { NFIRSExport } from './nfirs/nfirs-export.js';
import { NFIRSUI } from './nfirs/nfirs-ui.js';

// Export the NFIRS namespace for use in the application
export const NFIRS = {
  Codes: NFIRSCodes,
  Validator: NFIRSValidator,
  Export: NFIRSExport,
  UI: NFIRSUI
};

// For backward compatibility, also expose these modules on the window
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.NFIRS = NFIRS;

// Expose individual functions for backwards compatibility
window.validateNFIRSCompliance = function(incident) {
  return NFIRS.Validator.validate(incident);
};

window.isNFIRSReadyForExport = function(incident) {
  return NFIRS.Validator.isReadyForExport(incident);
};

window.getMissingNFIRSFields = function(incident) {
  return NFIRS.Validator.getMissingFields(incident);
};

window.convertToNFIRSXML = function(incident) {
  return NFIRS.Export.toXML(incident);
};

window.convertToNFIRSCSV = function(incident) {
  return NFIRS.Export.toCSV(incident);
};

window.convertToNFIRSJSON = function(incident) {
  return NFIRS.Export.toJSON(incident);
};

// Log when bundle is loaded
console.log('NFIRS bundle loaded successfully');