/**
 * Form Validation Fix for Incident Logger
 * 
 * This script enhances form validation by only validating fields that are visible
 * in the current step, fixing issues with hidden required fields.
 */

(function() {
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Form validation fix loaded");
        
        // Fix hidden required fields validation
        fixFormValidation();
        
        // Fix navigation buttons
        fixNavigationButtons();
        
        // Fix save and submit buttons
        fixSaveButtons();
    });
    
    // Fix form validation for step-based forms
    function fixFormValidation() {
        const form = document.getElementById('incident-form');
        if (!form) return;
        
        // Prevent the browser's default validation
        form.setAttribute('novalidate', 'true');
        
        // Add custom validation on submit
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get the current step
            const currentStep = document.querySelector('.form-step:not([style*="display: none"])');
            if (!currentStep) return;
            
            // Only validate inputs in the current step
            const inputs = currentStep.querySelectorAll('input, select, textarea');
            let isValid = true;
            
            inputs.forEach(input => {
                // Remove any existing error styling
                input.classList.remove('error');
                const errorElement = document.getElementById(`${input.id}-error`);
                if (errorElement) errorElement.remove();
                
                // Skip validation if the input isn't required
                if (!input.hasAttribute('required')) return;
                
                // Validate the input
                if (!input.value.trim()) {
                    isValid = false;
                    
                    // Add error styling
                    input.classList.add('error');
                    
                    // Add error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.id = `${input.id}-error`;
                    errorMessage.textContent = `${input.getAttribute('data-label') || input.id} is required.`;
                    input.parentNode.insertBefore(errorMessage, input.nextSibling);
                }
            });
            
            // If the current step is valid, proceed
            if (isValid) {
                const stepNumber = parseInt(currentStep.dataset.step);
                const totalSteps = document.querySelectorAll('.form-step').length;
                
                if (stepNumber < totalSteps) {
                    navigateToStep(stepNumber + 1);
                } else {
                    // On last step, actually submit the form if using real form submission
                    // For this fix, we'll use the save functionality
                    if (window.IncidentLogger && window.IncidentLogger.Form) {
                        window.IncidentLogger.Form.save(true);
                    } else {
                        // Fallback
                        console.log("Form is valid, but IncidentLogger.Form is not available for submission");
                        alert("Form validation passed! (This is a demo)");
                    }
                }
            }
        });
    }
    
    // Fix navigation buttons
    function fixNavigationButtons() {
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function(event) {
                // Prevent default action
                event.preventDefault();
                
                // Get the current step
                const currentStepElement = this.closest('.form-step');
                if (!currentStepElement) return;
                
                const currentStep = parseInt(currentStepElement.dataset.step);
                
                // Validate only the visible inputs in this step
                const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    // Remove any existing error styling
                    input.classList.remove('error');
                    const errorElement = document.getElementById(`${input.id}-error`);
                    if (errorElement) errorElement.remove();
                    
                    // Validate the input
                    if (!input.value.trim()) {
                        isValid = false;
                        
                        // Add error styling
                        input.classList.add('error');
                        
                        // Add error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.id = `${input.id}-error`;
                        errorMessage.textContent = `${input.getAttribute('data-label') || input.name || input.id} is required.`;
                        input.parentNode.insertBefore(errorMessage, input.nextSibling);
                    }
                });
                
                // If valid, go to next step
                if (isValid) {
                    navigateToStep(currentStep + 1);
                }
            });
        });
        
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', function(event) {
                // Prevent default action
                event.preventDefault();
                
                // Get the current step
                const currentStepElement = this.closest('.form-step');
                if (!currentStepElement) return;
                
                const currentStep = parseInt(currentStepElement.dataset.step);
                
                // Go to previous step without validation
                navigateToStep(currentStep - 1);
            });
        });
    }
    
    // Fix save and submit buttons
    function fixSaveButtons() {
        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Save without strict validation
                if (window.IncidentLogger && window.IncidentLogger.Form) {
                    window.IncidentLogger.Form.save(false);
                } else {
                    // Fallback - save to localStorage
                    saveDraftFallback();
                }
            });
        }
        
        const submitBtn = document.getElementById('submit-incident-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Do a full validation before submitting
                if (validateFullForm()) {
                    if (window.IncidentLogger && window.IncidentLogger.Form) {
                        window.IncidentLogger.Form.save(true);
                    } else {
                        // Fallback - save to localStorage as submitted
                        saveFinalFallback();
                    }
                }
            });
        }
    }
    
    // Fallback save functions
    function saveDraftFallback() {
        try {
            // Basic form serialization
            const formData = {};
            document.querySelectorAll('#incident-form input, #incident-form select, #incident-form textarea').forEach(input => {
                if (input.id) {
                    formData[input.id] = input.value;
                }
            });
            
            // Save to localStorage
            const incidentId = document.getElementById('incident-id')?.value || `INC-${Date.now()}`;
            localStorage.setItem(`incident_draft_${incidentId}`, JSON.stringify({
                ...formData,
                updated_at: new Date().toISOString(),
                is_draft: true
            }));
            
            alert("Draft saved successfully!");
        } catch (error) {
            console.error("Error saving draft:", error);
            alert("Error saving draft: " + error.message);
        }
    }
    
    function saveFinalFallback() {
        try {
            // Basic form serialization
            const formData = {};
            document.querySelectorAll('#incident-form input, #incident-form select, #incident-form textarea').forEach(input => {
                if (input.id) {
                    formData[input.id] = input.value;
                }
            });
            
            // Save to localStorage as submitted
            const incidentId = document.getElementById('incident-id')?.value || `INC-${Date.now()}`;
            localStorage.setItem(`incident_submitted_${incidentId}`, JSON.stringify({
                ...formData,
                submitted_at: new Date().toISOString(),
                is_draft: false
            }));
            
            alert("Incident submitted successfully!");
            
            // Reset form
            document.getElementById('incident-form')?.reset();
            navigateToStep(1);
        } catch (error) {
            console.error("Error submitting incident:", error);
            alert("Error submitting incident: " + error.message);
        }
    }
    
    // Validate the entire form
    function validateFullForm() {
        let isValid = true;
        
        // Clear all existing error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Validate all required fields
        document.querySelectorAll('#incident-form input[required], #incident-form select[required], #incident-form textarea[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                
                // Add error styling
                input.classList.add('error');
                
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.id = `${input.id}-error`;
                errorMessage.textContent = `${input.getAttribute('data-label') || input.name || input.id} is required.`;
                input.parentNode.insertBefore(errorMessage, input.nextSibling);
                
                // Ensure the step containing this field is visible
                const stepElement = input.closest('.form-step');
                if (stepElement) {
                    navigateToStep(parseInt(stepElement.dataset.step));
                }
            }
        });
        
        return isValid;
    }
    
    // Navigate to a specific step
    function navigateToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });
        
        // Show the selected step
        const selectedStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (selectedStep) {
            selectedStep.style.display = 'block';
        }
        
        // Update step indicators if they exist
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            if (index + 1 < stepNumber) {
                indicator.className = 'step-indicator completed';
            } else if (index + 1 === stepNumber) {
                indicator.className = 'step-indicator current';
            } else {
                indicator.className = 'step-indicator';
            }
        });
        
        // Scroll to top of the step
        window.scrollTo(0, 0);
    }
})();