/**
 * Patient Section Fix
 * This script addresses issues with inserting medical sections in the patient info area
 */

console.log("Patient section fix script loaded");

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the form to be fully loaded
    setTimeout(function() {
        // Fix the "phiSection is not defined" error
        try {
            // The error occurs in the inline script at line 2050 in incident-logger.html
            // Find any script that tries to use phiSection and ensure it's defined
            const patientEntries = document.querySelectorAll('.patient-entry');
            
            if (patientEntries.length > 0) {
                console.log(`Found ${patientEntries.length} patient entries, adding PHI sections`);
                
                patientEntries.forEach((entry, index) => {
                    const patientNum = index + 1;
                    const basicInfoContainer = entry.querySelector('.basic-info-container');
                    
                    if (basicInfoContainer) {
                        // Create PHI section if missing
                        let phiSection = entry.querySelector('.phi-section');
                        
                        if (!phiSection) {
                            console.log(`Creating PHI section for patient ${patientNum}`);
                            phiSection = document.createElement('div');
                            phiSection.className = 'form-section phi-section';
                            phiSection.innerHTML = `
                                <h5>Protected Health Information</h5>
                                <div class="hipaa-warning">
                                    <div class="warning-icon"><i class="fas fa-shield-alt"></i></div>
                                    <div class="warning-text">This section contains Protected Health Information (PHI) subject to HIPAA regulations.</div>
                                </div>
                            `;
                            
                            // Insert after basic info
                            basicInfoContainer.insertAdjacentElement('afterend', phiSection);
                        }
                        
                        // Make phiSection globally available for any scripts that need it
                        window.phiSection = phiSection;
                    }
                });
            }
        } catch (error) {
            console.error("Error in patient section fix:", error);
        }
    }, 1000); // Wait a second for other scripts to run
});