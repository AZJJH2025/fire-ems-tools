// Script to add medical history, medications, and allergies sections to patient entries
document.addEventListener("DOMContentLoaded", function() {
    console.log("Medical sections script loaded");
    
    // Wait for the DOM to fully load and any other scripts to run
    setTimeout(function() {
        console.log("Starting medical sections insertion");
        
        // Function to generate HTML with proper IDs based on patient index
        function generateMedicalHistoryHTML(patientIndex) {
            return `
                <div class="form-section">
                    <h5>Medical History</h5>
                    <div class="medical-history-container">
                        <div class="form-group">
                            <label for="medical-history-${patientIndex}">Past Medical History</label>
                            <select id="medical-history-${patientIndex}" name="medical-history-${patientIndex}" class="medical-history-select" multiple>
                                <option value="hypertension">Hypertension</option>
                                <option value="diabetes">Diabetes</option>
                                <option value="coronary-artery-disease">Coronary Artery Disease</option>
                                <option value="congestive-heart-failure">Congestive Heart Failure</option>
                                <option value="copd">COPD</option>
                                <option value="asthma">Asthma</option>
                                <option value="cancer">Cancer</option>
                                <option value="stroke">Stroke</option>
                                <option value="seizure-disorder">Seizure Disorder</option>
                                <option value="alzheimers">Alzheimer's</option>
                                <option value="parkinsons">Parkinson's</option>
                                <option value="renal-disease">Renal Disease</option>
                                <option value="liver-disease">Liver Disease</option>
                                <option value="psychiatric">Psychiatric</option>
                                <option value="other">Other</option>
                            </select>
                            <span class="field-help">Select all that apply</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function generateMedicationsHTML(patientIndex) {
            return `
                <div class="form-section">
                    <h5>Medications</h5>
                    <div class="medications-container">
                        <div class="form-group">
                            <label for="medications-${patientIndex}">Current Medications</label>
                            <select id="medications-${patientIndex}" name="medications-${patientIndex}" class="medications-select" multiple>
                                <option value="aspirin">Aspirin</option>
                                <option value="lisinopril">Lisinopril</option>
                                <option value="metoprolol">Metoprolol</option>
                                <option value="atorvastatin">Atorvastatin</option>
                                <option value="metformin">Metformin</option>
                                <option value="levothyroxine">Levothyroxine</option>
                                <option value="albuterol">Albuterol</option>
                                <option value="insulin">Insulin</option>
                                <option value="furosemide">Furosemide</option>
                                <option value="warfarin">Warfarin</option>
                                <option value="other">Other</option>
                            </select>
                            <span class="field-help">Select all that apply</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function generateAllergiesHTML(patientIndex) {
            return `
                <div class="form-section">
                    <h5>Allergies</h5>
                    <div class="allergies-container">
                        <div class="form-group">
                            <div class="form-row">
                                <div class="form-col">
                                    <input type="checkbox" id="nkda-${patientIndex}" name="nkda-${patientIndex}">
                                    <label for="nkda-${patientIndex}" style="display: inline;">No Known Drug Allergies (NKDA)</label>
                                </div>
                            </div>
                            <div class="form-group" id="allergies-list-${patientIndex}">
                                <label for="allergies-${patientIndex}">Known Allergies</label>
                                <select id="allergies-${patientIndex}" name="allergies-${patientIndex}" class="allergies-select" multiple>
                                    <option value="penicillin">Penicillin</option>
                                    <option value="sulfa">Sulfa</option>
                                    <option value="nsaids">NSAIDs</option>
                                    <option value="aspirin">Aspirin</option>
                                    <option value="morphine">Morphine</option>
                                    <option value="codeine">Codeine</option>
                                    <option value="contrast">Contrast</option>
                                    <option value="latex">Latex</option>
                                    <option value="other">Other</option>
                                </select>
                                <span class="field-help">Select all that apply</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Function to initialize Select2 on the newly added select elements
        function initializeSelect2() {
            if (typeof $ !== 'undefined' && $.fn.select2) {
                console.log("Initializing Select2 for medical selects");
                $('.medical-history-select, .medications-select, .allergies-select').select2({
                    placeholder: "Select items",
                    allowClear: true,
                    tags: true
                });
            } else {
                console.warn("jQuery or Select2 not available, medical selects will use native interface");
            }
        }

        // Function to toggle allergies list based on NKDA checkbox
        function setupNKDAToggle() {
            const nkdaCheckboxes = document.querySelectorAll('input[id^="nkda-"]');
            nkdaCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    // Extract patient index from the NKDA checkbox ID
                    const patientIndex = this.id.split('-')[1];
                    const allergiesList = document.getElementById(`allergies-list-${patientIndex}`);
                    
                    if (this.checked) {
                        allergiesList.style.display = 'none';
                    } else {
                        allergiesList.style.display = 'block';
                    }
                });
            });
        }
        
        // Extract patient number from heading or ID
        function getPatientNumber(patientEntry) {
            // Try to find the patient number from the heading
            const heading = patientEntry.querySelector('h3, h4');
            if (heading) {
                const match = heading.textContent.match(/Patient\s+#(\d+)/i);
                if (match && match[1]) {
                    return match[1];
                }
            }
            
            // Try to find by looking at input IDs
            const inputs = patientEntry.querySelectorAll('input[id], select[id]');
            for (const input of inputs) {
                const match = input.id.match(/[a-zA-Z-]+(\d+)$/);
                if (match && match[1]) {
                    return match[1];
                }
            }
            
            // Default to index+1 if nothing else works
            const allPatients = document.querySelectorAll('.patient-entry');
            for (let i = 0; i < allPatients.length; i++) {
                if (allPatients[i] === patientEntry) {
                    return i + 1;
                }
            }
            
            return 1; // Fallback to 1 if we can't determine
        }
        
        // Insert medical sections for each patient entry
        function insertMedicalSections() {
            // Get all patient entries
            const patientEntries = document.querySelectorAll('.patient-entry');
            console.log(`Found ${patientEntries.length} patient entries`);
            
            patientEntries.forEach((patientEntry, index) => {
                // Get patient number
                const patientNumber = getPatientNumber(patientEntry);
                console.log(`Processing patient entry #${patientNumber}`);
                
                // First, check if the sections already exist in this patient entry
                const existingMedHistory = patientEntry.querySelector('.medical-history-container');
                if (existingMedHistory) {
                    console.log(`Medical history already exists in patient #${patientNumber}, skipping insertion`);
                    return; // Skip this patient entry
                }
                
                // Generate the HTML with proper patient index
                const medicalHistoryHTML = generateMedicalHistoryHTML(patientNumber);
                const medicationsHTML = generateMedicationsHTML(patientNumber);
                const allergiesHTML = generateAllergiesHTML(patientNumber);
                
                // Look for a good insertion point
                // Strategy 1: Find after Personal Information (PHI) section
                let inserted = false;
                const phiSection = Array.from(patientEntry.querySelectorAll('.form-section h5')).find(h5 => 
                    h5.textContent.includes('Personal Information') || h5.textContent.includes('PHI')
                );
                
                if (phiSection) {
                    console.log(`Found PHI section in patient #${patientNumber}`);
                    const phiFormSection = phiSection.closest('.form-section');
                    if (phiFormSection) {
                        // Insert after PHI section
                        phiFormSection.insertAdjacentHTML('afterend', medicalHistoryHTML);
                        patientEntry.querySelector('.medical-history-container').closest('.form-section').insertAdjacentHTML('afterend', medicationsHTML);
                        patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('afterend', allergiesHTML);
                        inserted = true;
                        console.log(`Inserted medical sections after PHI in patient #${patientNumber}`);
                    }
                } 
                
                // Strategy 2: Find position before Vitals or Assessment section
                if (!inserted) {
                    const vitalsSection = Array.from(patientEntry.querySelectorAll('.form-section h5')).find(h5 => 
                        h5.textContent.includes('Vitals') || h5.textContent.includes('Assessment')
                    );
                    
                    if (vitalsSection) {
                        console.log(`Found Vitals/Assessment section in patient #${patientNumber}`);
                        const vitalsFormSection = vitalsSection.closest('.form-section');
                        if (vitalsFormSection) {
                            // Insert before Vitals section
                            vitalsFormSection.insertAdjacentHTML('beforebegin', allergiesHTML);
                            patientEntry.querySelector('.allergies-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicationsHTML);
                            patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicalHistoryHTML);
                            inserted = true;
                            console.log(`Inserted medical sections before Vitals in patient #${patientNumber}`);
                        }
                    }
                }
                
                // Strategy 3: Last resort - insert at the beginning of patient entry
                if (!inserted) {
                    console.log(`Using fallback insertion strategy for patient #${patientNumber}`);
                    // Find the first form-section
                    const firstFormSection = patientEntry.querySelector('.form-section');
                    if (firstFormSection) {
                        // Insert before first form section
                        firstFormSection.insertAdjacentHTML('beforebegin', allergiesHTML);
                        patientEntry.querySelector('.allergies-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicationsHTML);
                        patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicalHistoryHTML);
                        inserted = true;
                        console.log(`Inserted medical sections at beginning of patient #${patientNumber}`);
                    } else {
                        // If no form-section, append to the end of patient entry
                        patientEntry.insertAdjacentHTML('beforeend', medicalHistoryHTML);
                        patientEntry.insertAdjacentHTML('beforeend', medicationsHTML);
                        patientEntry.insertAdjacentHTML('beforeend', allergiesHTML);
                        inserted = true;
                        console.log(`Inserted medical sections at end of patient #${patientNumber}`);
                    }
                }
            });
            
            // After inserting all sections, initialize select2 and setup NKDA toggle
            setTimeout(() => {
                initializeSelect2();
                setupNKDAToggle();
                console.log("Medical sections setup complete");
            }, 500);
        }
        
        // First insertion attempt
        insertMedicalSections();
        
        // Re-run after a delay to catch any dynamically added patients
        setTimeout(insertMedicalSections, 2000);
        
        // Set up a mutation observer to detect when new patients are added
        const patientsContainer = document.getElementById("patients-container");
        if (patientsContainer) {
            console.log("Setting up mutation observer for patient additions");
            const observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log("Patient container changed, checking for new patients");
                        // Run with a slight delay to ensure DOM is fully updated
                        setTimeout(insertMedicalSections, 500);
                        break;
                    }
                }
            });
            
            observer.observe(patientsContainer, { childList: true, subtree: false });
        }
        
    }, 1000); // Initial delay to ensure the page is fully loaded
});