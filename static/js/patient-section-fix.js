/**
 * Patient Section Fix
 * This script addresses issues with inserting medical sections in the patient info area
 */

console.log("Patient section fix script loaded");

// Define a global function to fix the PHI section references
window.fixPatientSections = function() {
    try {
        // Find any script that tries to use phiSection and ensure it's defined
        const patientEntries = document.querySelectorAll('.patient-entry');
        
        if (patientEntries.length > 0) {
            console.log(`Found ${patientEntries.length} patient entries, adding PHI sections`);
            
            // Store all PHI sections in an array
            window.phiSections = [];
            
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
                        phiSection.dataset.patientIndex = patientNum;
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
                    
                    // Store in array and also make it accessible by patient number
                    window.phiSections[index] = phiSection;
                    window['phiSection' + patientNum] = phiSection;
                    
                    // Also set current phiSection for compatibility
                    window.phiSection = phiSection;
                    
                    // Create a helper for inserting medical sections
                    phiSection.addMedicalSections = function(html) {
                        this.insertAdjacentHTML('afterend', html);
                        console.log(`Added medical sections for patient ${patientNum}`);
                    };
                }
            });
            
            // Patch for the error in incident-logger.html line 2051
            if (window.insertMedicalSections) {
                window.safeInsertMedicalSections = function(html) {
                    if (window.phiSection) {
                        window.phiSection.insertAdjacentHTML('afterend', html);
                        return true;
                    }
                    return false;
                };
            }
        }
    } catch (error) {
        console.error("Error in patient section fix:", error);
    }
};

// Run immediately and also on DOMContentLoaded
window.fixPatientSections();

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the form to be fully loaded
    setTimeout(window.fixPatientSections, 1000);
});