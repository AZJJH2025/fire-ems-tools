// Force patient info step to be visible
document.addEventListener("DOMContentLoaded", function() {
    console.log("Step fix script loaded");
    
    // Wait for page to fully initialize
    setTimeout(function() {
        console.log("Attempting to force Step 5 (Patient Info) to be visible");
        
        // Find Step 5 (Patient Info)
        var patientInfoStep = document.querySelector('.form-step[data-step="5"]');
        
        if (patientInfoStep) {
            console.log("Found Patient Info step, making it visible");
            
            // Force display of Step 5
            patientInfoStep.style.display = "block";
            
            // Also set it as active step
            var allSteps = document.querySelectorAll('.progress-step');
            allSteps.forEach(function(step) {
                step.classList.remove('active');
            });
            
            var patientInfoStepIndicator = document.querySelector('.progress-step[data-step="5"]');
            if (patientInfoStepIndicator) {
                patientInfoStepIndicator.classList.add('active');
            }
            
            // Check if medical history is visible now
            var medHistory = document.querySelector('.medical-history-container');
            if (medHistory) {
                console.log("✅ Medical History Container found after making step visible");
            } else {
                console.log("❌ Medical History Container still not found, something else is wrong");
            }
        } else {
            console.log("❌ Could not find Patient Info step (Step 5)");
        }
    }, 1000);
});