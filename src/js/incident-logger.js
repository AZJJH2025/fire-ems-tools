/**
 * FireEMS.ai Incident Logger - Main Application
 * 
 * This is the main entry point for the Incident Logger application.
 * It imports all necessary components and sets up the application.
 */

// Import NFIRS bundle
import { NFIRS } from './nfirs-bundle.js';

// Import components bundle
import { Components } from './components-bundle.js';

// Import utilities
import { Storage } from './utils/storage.js';
import { Settings } from './utils/settings.js';
import { Toast } from './utils/toast.js';
import { Modal } from './utils/modal.js';

// Set up the main application namespace
class IncidentLoggerApp {
  constructor() {
    this.version = '1.2.0';
    this.features = ['NFIRS integration', 'Nominatim geocoding', 'CAD import'];
    
    // Components access
    this.NFIRS = NFIRS;
    this.HIPAA = Components.HIPAA;
    this.CAD = Components.CAD;
    this.Validator = Components.Validator;
    this.Export = Components.Export;
    this.Map = Components.Map;
    this.List = Components.List;
    this.Form = Components.Form;
    
    // Utilities
    this.Storage = Storage;
    this.Settings = Settings;
    this.Toast = Toast;
    this.Modal = Modal;
    
    // Application state
    this.currentIncident = null;
    this.incidentList = [];
    this.isInitialized = false;

    console.log('Incident Logger Version:', this.version);
    console.log('Features:', this.features.join(', '));
  }

  // Initialize the application
  initialize() {
    console.log('Initializing Incident Logger...');
    
    // Load settings
    this.Settings.load();
    
    // Load incidents
    this.List.loadIncidents();
    
    // Set up autosave
    this.setupAutosave();
    
    // Set up component event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('Incident Logger initialized');
    
    return this;
  }

  // Set up autosave functionality
  setupAutosave() {
    const interval = this.Settings.get('autoSaveInterval') * 60 * 1000; // Convert minutes to milliseconds
    
    setInterval(() => {
      // Only autosave if the form is visible and has changes
      const formContainer = document.getElementById('incident-form-container');
      if (formContainer && formContainer.style.display !== 'none') {
        this.Form.saveDraft();
      }
    }, interval);
    
    console.log('Autosave set up with interval:', interval, 'ms');
  }

  // Set up all event listeners
  setupEventListeners() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMContentLoaded());
    } else {
      this.onDOMContentLoaded();
    }
  }

  // Handle DOM content loaded event
  onDOMContentLoaded() {
    console.log('DOM content loaded, setting up UI');
    
    // Navigation between containers
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        this.showContainer(target);
      });
    });
    
    // Form navigation
    document.querySelectorAll('.next-step').forEach(button => {
      button.addEventListener('click', () => {
        const currentStep = parseInt(button.closest('.form-step').dataset.step);
        this.Form.navigateToStep(currentStep + 1);
      });
    });
    
    document.querySelectorAll('.prev-step').forEach(button => {
      button.addEventListener('click', () => {
        const currentStep = parseInt(button.closest('.form-step').dataset.step);
        this.Form.navigateToStep(currentStep - 1);
      });
    });
    
    // Form saving actions
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => this.Form.saveDraft());
    }
    
    const submitBtn = document.getElementById('submit-incident-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.Form.submitIncident());
    }
    
    // Export functionality
    const exportBtn = document.getElementById('generate-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.Export.generate());
    }
    
    console.log('Event listeners set up');
  }

  // Show a specific container
  showContainer(containerId) {
    // Hide all containers
    document.querySelectorAll('.card').forEach(container => {
      container.style.display = 'none';
    });
    
    // Show the selected container
    const selectedContainer = document.getElementById(containerId);
    if (selectedContainer) {
      selectedContainer.style.display = 'block';
    }
  }
}

// Create and initialize the application
const App = new IncidentLoggerApp().initialize();

// Export for use in other modules
export default App;

// For backward compatibility, also expose the app on the window
window.IncidentLogger = App;
window.App = App;