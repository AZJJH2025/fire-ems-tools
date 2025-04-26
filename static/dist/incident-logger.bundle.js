/**
 * Incident Logger Bundle (Manual Build)
 * 
 * This is a manually built bundle for the incident logger application
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function() {
  /**
   * Main Incident Logger application module
   */
  console.log('Initializing Incident Logger application');
  
  // Application namespace
  const IncidentLoggerApp = {
    /**
     * Initialize the application
     */
    initialize() {
      console.log('Incident Logger application initializing');
      
      // Ensure dependencies are available
      if (!window.FireEMS || !window.FireEMS.Components) {
        console.error('FireEMS.Components namespace not available. Make sure components-bundle.js is loaded first.');
        return;
      }
      
      if (!window.NFIRS) {
        console.warn('NFIRS namespace not available. NFIRS functionality will not be available.');
      }
      
      // Set up the application
      this.setupEventListeners();
      this.initializeComponents();
      
      console.log('Incident Logger application initialized');
    },
    
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
      // Form navigation
      this.setupFormNavigation();
      
      // Listen for medical sections issues
      this.setupMedicalSectionsMonitoring();
    },
    
    /**
     * Initialize required components
     */
    initializeComponents() {
      // Initialize form component
      if (window.FireEMS.Components.Form) {
        window.FireEMS.Components.Form.initialize();
      }
      
      // Initialize medical sections component
      if (window.FireEMS.Components.Medical) {
        window.FireEMS.Components.Medical.initialize();
      }
      
      // Initialize map component if on a page with map
      if (window.FireEMS.Components.Map && document.getElementById('incident-map')) {
        window.FireEMS.Components.Map.initialize();
      }
      
      // Initialize HIPAA component
      if (window.FireEMS.Components.HIPAA) {
        // Check for patient PHI and request consent if needed
        this.checkHIPAAConsent();
      }
      
      // Initialize CAD integration if available
      if (window.FireEMS.Components.CAD) {
        window.FireEMS.Components.CAD.initialize();
      }
    },
    
    /**
     * Set up form navigation
     */
    setupFormNavigation() {
      // Form next/prev buttons
      document.addEventListener('click', event => {
        if (event.target.classList.contains('next-step')) {
          const currentStep = parseInt(event.target.closest('.form-step').dataset.step);
          this.navigateToStep(currentStep + 1);
        } else if (event.target.classList.contains('prev-step')) {
          const currentStep = parseInt(event.target.closest('.form-step').dataset.step);
          this.navigateToStep(currentStep - 1);
        }
      });
      
      // Step indicators
      document.addEventListener('click', event => {
        if (event.target.classList.contains('step-indicator')) {
          const step = parseInt(event.target.dataset.step);
          this.navigateToStep(step);
        }
      });
    },
    
    /**
     * Navigate to a specific form step
     */
    navigateToStep(stepNumber) {
      // Get all form steps
      const formSteps = document.querySelectorAll('.form-step');
      if (!formSteps.length) return;
      
      // Hide all steps
      formSteps.forEach(step => {
        step.style.display = 'none';
      });
      
      // Show the selected step
      const selectedStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
      if (selectedStep) {
        selectedStep.style.display = 'block';
        
        // Update step indicators
        const stepIndicators = document.querySelectorAll('.step-indicator');
        stepIndicators.forEach(indicator => {
          const indicatorStep = parseInt(indicator.dataset.step);
          
          if (indicatorStep < stepNumber) {
            indicator.className = 'step-indicator completed';
          } else if (indicatorStep === stepNumber) {
            indicator.className = 'step-indicator current';
          } else {
            indicator.className = 'step-indicator';
          }
        });
        
        // Scroll to top of the form
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
          formContainer.scrollTop = 0;
        }
      }
    },
    
    /**
     * Set up monitoring for medical sections issues
     */
    setupMedicalSectionsMonitoring() {
      // Monitor for patient additions
      document.addEventListener('click', event => {
        if (event.target.id === 'add-patient-btn') {
          console.log('Patient added - checking medical sections after delay');
          
          // Check medical sections after a delay
          setTimeout(() => {
            if (window.FireEMS.Components.Medical) {
              window.FireEMS.Components.Medical.checkAndFixMedicalSections();
            }
          }, 500);
        }
      });
      
      // Also listen for the custom patient added event
      document.addEventListener('patientAdded', () => {
        console.log('Patient added event detected');
        
        // Check medical sections after a delay
        setTimeout(() => {
          if (window.FireEMS.Components.Medical) {
            window.FireEMS.Components.Medical.checkAndFixMedicalSections();
          }
        }, 500);
      });
    },
    
    /**
     * Check for HIPAA consent
     */
    checkHIPAAConsent() {
      if (window.FireEMS.Components.HIPAA) {
        // Only check consent on pages with patient info
        const hasPatientInfo = !!document.querySelector('#patients-container, .patient-entry');
        
        if (hasPatientInfo) {
          // Get consent if not already provided
          if (!window.FireEMS.Components.HIPAA.hasConsent()) {
            window.FireEMS.Components.HIPAA.getPatientConsent()
              .then(consent => {
                if (!consent) {
                  console.log('HIPAA consent not provided - restricting PHI collection');
                  this.disablePHICollection();
                }
              });
          }
        }
      }
    },
    
    /**
     * Disable PHI collection if no HIPAA consent
     */
    disablePHICollection() {
      // Disable PHI fields
      const phiFields = document.querySelectorAll('.phi-field, .phi-section');
      phiFields.forEach(field => {
        const inputs = field.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          input.disabled = true;
        });
        
        field.classList.add('disabled');
        field.insertAdjacentHTML('beforeend', '<div class="phi-disabled-notice">PHI collection disabled - consent required</div>');
      });
    }
  };
  
  // Initialize the application when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IncidentLoggerApp.initialize());
  } else {
    IncidentLoggerApp.initialize();
  }
  
  // Fix for medical sections if needed
  document.addEventListener('DOMContentLoaded', () => {
    // Check for medical sections after a delay
    setTimeout(() => {
      if (window.FireEMS && window.FireEMS.Components && window.FireEMS.Components.Medical) {
        window.FireEMS.Components.Medical.checkAndFixMedicalSections();
      } else if (window.fixMissingMedicalSections) {
        // Fallback to legacy function if available
        window.fixMissingMedicalSections();
      }
    }, 1000);
  });
  
  // Export IncidentLoggerApp to window namespace
  window.IncidentLoggerApp = IncidentLoggerApp;
  
  console.log('Incident Logger bundle loaded successfully');
})();