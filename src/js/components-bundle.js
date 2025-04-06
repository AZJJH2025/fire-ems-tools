/**
 * Components Bundle
 * 
 * This is a bundled entry point for all component modules
 */

// Import components
import { HIPAACompliance } from './components/hipaa-compliance.js';
import { CADIntegration } from './components/cad-integration.js';
import { IncidentValidator } from './components/incident-validator.js';
import { IncidentExport } from './components/incident-export.js';
import { IncidentMap } from './components/incident-map.js';
import { IncidentList } from './components/incident-list.js';
import { IncidentForm } from './components/incident-form.js';
import { MedicalSections } from './components/medical-sections.js';

// Export the components namespace for use in the application
export const Components = {
  HIPAA: HIPAACompliance,
  CAD: CADIntegration,
  Validator: IncidentValidator,
  Export: IncidentExport,
  Map: IncidentMap,
  List: IncidentList,
  Form: IncidentForm,
  Medical: MedicalSections
};

// For backward compatibility, also expose these components on the window
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.HIPAA = Components.HIPAA;
window.IncidentLogger.CAD = Components.CAD;
window.IncidentLogger.Validator = Components.Validator;
window.IncidentLogger.Export = Components.Export;
window.IncidentLogger.Map = Components.Map;
window.IncidentLogger.List = Components.List;
window.IncidentLogger.Form = Components.Form;
window.IncidentLogger.Medical = Components.Medical;

// Log when bundle is loaded
console.log('Components bundle loaded successfully');