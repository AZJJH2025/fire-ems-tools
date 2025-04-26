// Debug script for medical sections
console.log("Debug script loaded");

// Function to check patient entries and log their structure
function debugPatientEntries() {
    console.log("===== DEBUGGING PATIENT ENTRIES =====");
    
    const patientEntries = document.querySelectorAll('.patient-entry');
    console.log(`Found ${patientEntries.length} patient entries`);
    
    patientEntries.forEach((patientEntry, index) => {
        // Check for patient heading
        const heading = patientEntry.querySelector('h3, h4');
        console.log(`Patient ${index + 1} heading: ${heading ? heading.textContent : 'None'}`);
        
        // Check for medical sections
        const medHistory = patientEntry.querySelector('.medical-history-container');
        const meds = patientEntry.querySelector('.medications-container');
        const allergies = patientEntry.querySelector('.allergies-container');
        
        console.log(`Patient ${index + 1} medical history: ${medHistory ? 'Found' : 'Not found'}`);
        console.log(`Patient ${index + 1} medications: ${meds ? 'Found' : 'Not found'}`);
        console.log(`Patient ${index + 1} allergies: ${allergies ? 'Found' : 'Not found'}`);
        
        // Check for ID attributes
        if (medHistory) {
            const select = medHistory.querySelector('select');
            console.log(`Medical history select ID: ${select ? select.id : 'None'}`);
        }
        
        if (allergies) {
            const nkda = allergies.querySelector('input[type="checkbox"]');
            console.log(`NKDA checkbox ID: ${nkda ? nkda.id : 'None'}`);
        }
    });
    
    console.log("===== END DEBUGGING =====");
}

// Run debug check after a delay
setTimeout(debugPatientEntries, 3000);

// Attach to Add Patient button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const addPatientBtn = document.querySelector('button[id="add-patient-btn"]');
    if (addPatientBtn) {
        console.log("Found Add Patient button, attaching debugger");
        addPatientBtn.addEventListener('click', function() {
            console.log("Add Patient button clicked");
            setTimeout(debugPatientEntries, 1000);
        });
    }
});