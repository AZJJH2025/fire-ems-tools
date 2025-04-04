// Script to add medical history, medications, and allergies sections to patient entries
document.addEventListener("DOMContentLoaded", function() {
    console.log("Medical sections script loaded");
    
    // Wait for the DOM to fully load and any other scripts to run
    setTimeout(function() {
        console.log("Starting medical sections insertion");
        
        // Define the HTML for medical sections
        const medicalHistoryHTML = `
            <div class="form-section">
                <h5>Medical History</h5>
                <div class="medical-history-container">
                    <div class="form-group">
                        <label for="medical-history">Past Medical History</label>
                        <select id="medical-history" name="medical-history" class="medical-history-select" multiple>
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
        
        const medicationsHTML = `
            <div class="form-section">
                <h5>Medications</h5>
                <div class="medications-container">
                    <div class="form-group">
                        <label for="medications">Current Medications</label>
                        <select id="medications" name="medications" class="medications-select" multiple>
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
        
        const allergiesHTML = `
            <div class="form-section">
                <h5>Allergies</h5>
                <div class="allergies-container">
                    <div class="form-group">
                        <div class="form-row">
                            <div class="form-col">
                                <input type="checkbox" id="nkda" name="nkda">
                                <label for="nkda" style="display: inline;">No Known Drug Allergies (NKDA)</label>
                            </div>
                        </div>
                        <div class="form-group" id="allergies-list">
                            <label for="allergies">Known Allergies</label>
                            <select id="allergies" name="allergies" class="allergies-select" multiple>
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
            const nkdaCheckboxes = document.querySelectorAll('input[name="nkda"]');
            nkdaCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const allergiesList = this.closest('.allergies-container').querySelector('#allergies-list');
                    if (this.checked) {
                        allergiesList.style.display = 'none';
                    } else {
                        allergiesList.style.display = 'block';
                    }
                });
            });
        }
        
        // Insert medical sections for each patient entry
        function insertMedicalSections() {
            // Get all patient entries
            const patientEntries = document.querySelectorAll('.patient-entry');
            console.log(`Found ${patientEntries.length} patient entries`);
            
            patientEntries.forEach((patientEntry, index) => {
                console.log(`Processing patient entry #${index + 1}`);
                
                // First, check if the sections already exist in this patient entry
                const existingMedHistory = patientEntry.querySelector('.medical-history-container');
                if (existingMedHistory) {
                    console.log(`Medical history already exists in patient #${index + 1}, skipping insertion`);
                    return; // Skip this patient entry
                }
                
                // Look for a good insertion point
                // Strategy 1: Find after Personal Information (PHI) section
                let inserted = false;
                const phiSection = Array.from(patientEntry.querySelectorAll('.form-section h5')).find(h5 => 
                    h5.textContent.includes('Personal Information') || h5.textContent.includes('PHI')
                );
                
                if (phiSection) {
                    console.log(`Found PHI section in patient #${index + 1}`);
                    const phiFormSection = phiSection.closest('.form-section');
                    if (phiFormSection) {
                        // Insert after PHI section
                        phiFormSection.insertAdjacentHTML('afterend', medicalHistoryHTML);
                        patientEntry.querySelector('.medical-history-container').closest('.form-section').insertAdjacentHTML('afterend', medicationsHTML);
                        patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('afterend', allergiesHTML);
                        inserted = true;
                        console.log(`Inserted medical sections after PHI in patient #${index + 1}`);
                    }
                } 
                
                // Strategy 2: Find position before Vitals or Assessment section
                if (!inserted) {
                    const vitalsSection = Array.from(patientEntry.querySelectorAll('.form-section h5')).find(h5 => 
                        h5.textContent.includes('Vitals') || h5.textContent.includes('Assessment')
                    );
                    
                    if (vitalsSection) {
                        console.log(`Found Vitals/Assessment section in patient #${index + 1}`);
                        const vitalsFormSection = vitalsSection.closest('.form-section');
                        if (vitalsFormSection) {
                            // Insert before Vitals section
                            vitalsFormSection.insertAdjacentHTML('beforebegin', allergiesHTML);
                            patientEntry.querySelector('.allergies-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicationsHTML);
                            patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicalHistoryHTML);
                            inserted = true;
                            console.log(`Inserted medical sections before Vitals in patient #${index + 1}`);
                        }
                    }
                }
                
                // Strategy 3: Last resort - insert at the beginning of patient entry
                if (!inserted) {
                    console.log(`Using fallback insertion strategy for patient #${index + 1}`);
                    // Find the first form-section
                    const firstFormSection = patientEntry.querySelector('.form-section');
                    if (firstFormSection) {
                        // Insert before first form section
                        firstFormSection.insertAdjacentHTML('beforebegin', allergiesHTML);
                        patientEntry.querySelector('.allergies-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicationsHTML);
                        patientEntry.querySelector('.medications-container').closest('.form-section').insertAdjacentHTML('beforebegin', medicalHistoryHTML);
                        inserted = true;
                        console.log(`Inserted medical sections at beginning of patient #${index + 1}`);
                    } else {
                        // If no form-section, append to the end of patient entry
                        patientEntry.insertAdjacentHTML('beforeend', medicalHistoryHTML);
                        patientEntry.insertAdjacentHTML('beforeend', medicationsHTML);
                        patientEntry.insertAdjacentHTML('beforeend', allergiesHTML);
                        inserted = true;
                        console.log(`Inserted medical sections at end of patient #${index + 1}`);
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
        
    }, 1000); // Initial delay to ensure the page is fully loaded
});