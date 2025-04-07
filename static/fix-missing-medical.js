/**
 * Fix Missing Medical Sections
 * 
 * This script creates missing medical history, medications and allergy sections
 * for patient entries that don't have them.
 */

console.log("Fix Missing Medical Sections script loaded");

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        console.log("Starting fix for missing medical sections");
        
        try {
            // Define medical history options
            const medicalHistoryOptions = `
                <option value="hypertension">Hypertension</option>
                <option value="diabetes">Diabetes</option>
                <option value="asthma">Asthma</option>
                <option value="copd">COPD</option>
                <option value="chf">Congestive Heart Failure</option>
                <option value="cad">Coronary Artery Disease</option>
                <option value="mi">Prior MI</option>
                <option value="stroke">Prior Stroke</option>
                <option value="seizure">Seizure Disorder</option>
                <option value="cancer">Cancer</option>
                <option value="renal">Renal Disease</option>
                <option value="psychiatric">Psychiatric Disorder</option>
                <option value="alzheimers">Alzheimer's/Dementia</option>
                <option value="substance">Substance Use Disorder</option>
            `;
            
            // Define medication options
            const medicationOptions = `
                <option value="aspirin">Aspirin</option>
                <option value="plavix">Plavix (Clopidogrel)</option>
                <option value="warfarin">Warfarin (Coumadin)</option>
                <option value="xarelto">Xarelto (Rivaroxaban)</option>
                <option value="eliquis">Eliquis (Apixaban)</option>
                <option value="metoprolol">Metoprolol</option>
                <option value="atenolol">Atenolol</option>
                <option value="lisinopril">Lisinopril</option>
                <option value="losartan">Losartan</option>
                <option value="amlodipine">Amlodipine</option>
                <option value="hydrochlorothiazide">Hydrochlorothiazide</option>
                <option value="furosemide">Furosemide (Lasix)</option>
                <option value="metformin">Metformin</option>
                <option value="insulin">Insulin</option>
                <option value="albuterol">Albuterol</option>
                <option value="prednisone">Prednisone</option>
                <option value="levothyroxine">Levothyroxine (Synthroid)</option>
                <option value="acetaminophen">Acetaminophen (Tylenol)</option>
                <option value="ibuprofen">Ibuprofen (Advil, Motrin)</option>
                <option value="omeprazole">Omeprazole (Prilosec)</option>
                <option value="gabapentin">Gabapentin (Neurontin)</option>
                <option value="oxycodone">Oxycodone</option>
            `;
            
            // Define allergy options
            const allergyOptions = `
                <option value="penicillin">Penicillin</option>
                <option value="sulfa">Sulfa Drugs</option>
                <option value="cephalosporins">Cephalosporins</option>
                <option value="nsaids">NSAIDs</option>
                <option value="aspirin">Aspirin</option>
                <option value="morphine">Morphine</option>
                <option value="codeine">Codeine</option>
                <option value="iodine">Iodine/Contrast Dye</option>
                <option value="latex">Latex</option>
                <option value="eggs">Eggs</option>
                <option value="nuts">Tree Nuts</option>
                <option value="peanuts">Peanuts</option>
                <option value="shellfish">Shellfish</option>
                <option value="soy">Soy</option>
                <option value="wheat">Wheat</option>
            `;
            
            // Create the HTML for medical sections
            function createMedicalSectionsHTML(patientId) {
                return `
                    <!-- Medical History Section -->
                    <div class="form-section medical-section-added" data-patient="${patientId}">
                        <h5>Medical History</h5>
                        <div class="medical-history-container">
                            <div class="form-group">
                                <label for="medical-history-${patientId}">Past Medical History</label>
                                <select id="medical-history-${patientId}" name="patient-medical-history-${patientId}" class="medical-history-select" multiple>
                                    ${medicalHistoryOptions}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Medications Section -->
                    <div class="form-section medical-section-added" data-patient="${patientId}">
                        <h5>Medications</h5>
                        <div class="medications-container">
                            <div class="form-group">
                                <label for="medications-${patientId}">Current Medications</label>
                                <select id="medications-${patientId}" name="patient-medications-${patientId}" class="medications-select" multiple>
                                    ${medicationOptions}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Allergies Section -->
                    <div class="form-section medical-section-added" data-patient="${patientId}">
                        <h5>Allergies</h5>
                        <div class="allergies-container">
                            <div class="form-group">
                                <div class="nkda-checkbox">
                                    <input type="checkbox" id="nkda-${patientId}" name="patient-nkda-${patientId}">
                                    <label for="nkda-${patientId}">NKDA (No Known Drug Allergies)</label>
                                </div>
                            </div>
                            <div class="form-group allergy-select-group">
                                <label for="allergies-${patientId}">Allergies</label>
                                <select id="allergies-${patientId}" name="patient-allergies-${patientId}" class="allergies-select" multiple>
                                    ${allergyOptions}
                                </select>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Find all patient entries
            const patientEntries = document.querySelectorAll('.patient-entry');
            console.log(`Found ${patientEntries.length} patient entries`);
            
            let needsSelect2Init = false;
            
            // Process each patient entry
            patientEntries.forEach((patientEntry, index) => {
                const patientId = index + 1;
                console.log(`Checking patient #${patientId} for missing medical sections`);
                
                // Check if already fixed or has sections
                if (patientEntry.querySelector('.medical-section-added') || 
                    patientEntry.querySelector('.medical-history-container')) {
                    console.log(`Patient #${patientId} already has medical sections`);
                    return;
                }
                
                console.log(`Adding medical sections to patient #${patientId}`);
                
                // Create the sections HTML
                const sectionsHTML = createMedicalSectionsHTML(patientId);
                
                // Find the insertion point
                const phiSection = patientEntry.querySelector('.phi-section');
                const basicInfo = patientEntry.querySelector('.patient-basic-info');
                const vitalsSection = patientEntry.querySelector('.vitals-section');
                
                let insertionPoint;
                let insertMethod = 'afterend';
                
                if (phiSection) {
                    insertionPoint = phiSection;
                    console.log(`Using PHI section as insertion point for patient #${patientId}`);
                } else if (basicInfo) {
                    insertionPoint = basicInfo;
                    console.log(`Using basic info as insertion point for patient #${patientId}`);
                } else if (vitalsSection) {
                    insertionPoint = vitalsSection;
                    insertMethod = 'beforebegin';
                    console.log(`Using vitals section as insertion point for patient #${patientId}`);
                } else {
                    // Fallback - just add to the end
                    insertionPoint = patientEntry;
                    insertMethod = 'beforeend';
                    console.log(`No insertion point found, appending to patient #${patientId}`);
                }
                
                // Insert the sections
                insertionPoint.insertAdjacentHTML(insertMethod, sectionsHTML);
                console.log(`Added medical sections to patient #${patientId}`);
                
                needsSelect2Init = true;
            });
            
            // Initialize Select2 if needed
            if (needsSelect2Init && typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                console.log("Initializing Select2 for medical selects");
                
                try {
                    $('.medical-history-select, .medications-select, .allergies-select').select2({
                        placeholder: 'Select or type here...',
                        tags: true,
                        width: '100%'
                    });
                    
                    // Add NKDA checkbox functionality
                    $('input[id^="nkda-"]').each(function() {
                        $(this).on('change', function() {
                            const patientId = this.id.split('-')[1];
                            const allergySelect = $(`#allergies-${patientId}`);
                            
                            if (this.checked) {
                                allergySelect.val(null).trigger('change');
                                allergySelect.prop('disabled', true);
                                allergySelect.closest('.allergy-select-group').css('opacity', '0.5');
                            } else {
                                allergySelect.prop('disabled', false);
                                allergySelect.closest('.allergy-select-group').css('opacity', '1');
                            }
                        });
                    });
                } catch (error) {
                    console.error("Error initializing Select2:", error);
                }
            }
            
            // Expose function to allow other scripts to trigger fixing
            window.fixMissingMedicalSections = function() {
                const patientEntries = document.querySelectorAll('.patient-entry');
                patientEntries.forEach((patientEntry, index) => {
                    const patientId = index + 1;
                    
                    // Only fix if not already fixed
                    if (!patientEntry.querySelector('.medical-section-added') && 
                        !patientEntry.querySelector('.medical-history-container')) {
                        console.log(`Fixing missing medical sections for patient #${patientId}`);
                        
                        // Create the sections HTML
                        const sectionsHTML = createMedicalSectionsHTML(patientId);
                        
                        // Find the insertion point using the same logic as above
                        const phiSection = patientEntry.querySelector('.phi-section');
                        const basicInfo = patientEntry.querySelector('.patient-basic-info');
                        const vitalsSection = patientEntry.querySelector('.vitals-section');
                        
                        let insertionPoint;
                        let insertMethod = 'afterend';
                        
                        if (phiSection) {
                            insertionPoint = phiSection;
                        } else if (basicInfo) {
                            insertionPoint = basicInfo;
                        } else if (vitalsSection) {
                            insertionPoint = vitalsSection;
                            insertMethod = 'beforebegin';
                        } else {
                            insertionPoint = patientEntry;
                            insertMethod = 'beforeend';
                        }
                        
                        // Insert the sections
                        insertionPoint.insertAdjacentHTML(insertMethod, sectionsHTML);
                    }
                });
                
                // Initialize Select2 if available
                if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
                    $('.medical-history-select, .medications-select, .allergies-select').select2({
                        placeholder: 'Select or type here...',
                        tags: true,
                        width: '100%'
                    });
                }
            };
            
            console.log("Fix Missing Medical Sections completed");
        } catch (error) {
            console.error("Error in Fix Missing Medical Sections:", error);
        }
    }, 1000);
});