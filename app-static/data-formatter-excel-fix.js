/**
 * Excel Encoding Fix for Data Formatter
 * 
 * Fixes the issue with Excel files showing strange characters like "=�qԂ��ʹ�/2��"
 * This script adds proper encoding detection and handling for Excel files
 */

(function() {
    console.log("🛠️ Applying Excel encoding fixes to Data Formatter");
    
    // 1. Helper function to sanitize Excel values
    function sanitizeExcelValue(value) {
        if (value === undefined || value === null) return '';
        
        // Handle dates
        if (value instanceof Date) {
            return value.toISOString().split('T')[0];
        }
        
        // Convert to string and handle special characters
        let strValue = String(value);
        // Replace problematic character sequences
        strValue = strValue.replace(/[\uFFFD\uFFFE\uFFFF]/g, '');
        // Handle other strange character combinations that might appear in Excel files
        return strValue;
    }
    
    // 2. Override the Excel sheet loading function
    const originalLoadExcelSheet = window.loadExcelSheet;
    window.loadExcelSheet = function(sheetName) {
        if (!window.excelWorkbook) return;
        
        try {
            console.log("Using enhanced Excel sheet loading with encoding fixes");
            const worksheet = window.excelWorkbook.Sheets[sheetName];
            
            // Convert to JSON with enhanced options
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                dateNF: 'yyyy-mm-dd',
                defval: ''
            });
            
            // Transform with proper sanitization
            if (rawData.length > 1) {
                const headers = rawData[0];
                window.originalData = rawData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        if (header) { // Skip empty headers
                            obj[header] = sanitizeExcelValue(row[i]);
                        }
                    });
                    return obj;
                });
                
                // Filter out entirely empty rows
                window.originalData = window.originalData.filter(row => 
                    Object.values(row).some(val => val !== ''));
                
                console.log(`Enhanced Excel loader: Loaded sheet "${sheetName}" with ${window.originalData.length} records`);
                
                // Update store if available
                if (window.DataFormatterStore) {
                    window.DataFormatterStore.actions.setOriginalData(window.originalData);
                }
                
                // Show preview with sanitized data
                window.showInputPreview(window.originalData);
                window.appendLog(`Loaded Excel sheet "${sheetName}" with ${window.originalData.length} records using enhanced encoding support`);
            } else {
                // Empty or only headers
                window.appendLog(`Excel sheet "${sheetName}" has no data rows`, 'warning');
                window.originalData = [];
                
                // Show empty preview
                document.getElementById('input-preview').innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No data found in selected sheet</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Enhanced Excel loader error:', error);
            window.appendLog(`Error parsing Excel sheet: ${error.message}`, 'error');
            
            // Try original function as fallback
            if (originalLoadExcelSheet) {
                console.log("Falling back to original Excel loader");
                return originalLoadExcelSheet(sheetName);
            }
            
            // Reset data if all fails
            window.originalData = null;
        }
    };
    
    // 3. Override the FileReader for Excel files
    const originalFileInput = document.getElementById('data-file');
    if (originalFileInput) {
        const originalChangeHandler = originalFileInput.onchange;
        
        originalFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const fileName = file.name || '';
            const fileExt = fileName.split('.').pop().toLowerCase();
            
            // Only apply our enhanced handler for Excel files
            if (fileExt === 'xlsx' || fileExt === 'xls') {
                console.log("🔍 Excel file detected, using enhanced reader");
                
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Update file name display
                const fileNameElement = document.getElementById('file-name');
                if (fileNameElement) fileNameElement.textContent = fileName;
                
                // Set file type
                window.fileType = 'excel';
                
                // Show Excel options
                const excelOptions = document.getElementById('excel-options');
                if (excelOptions) excelOptions.style.display = 'block';
                
                // Read the Excel file with enhanced options
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const arrayBuffer = e.target.result;
                        
                        // First try with UTF-8 encoding
                        window.excelWorkbook = XLSX.read(arrayBuffer, {
                            type: 'array',
                            codepage: 65001, // UTF-8
                            cellDates: true,
                            dateNF: 'yyyy-mm-dd',
                            WTF: true, // More verbose errors for debugging
                            cellText: false
                        });
                        
                        // Check for encoding issues in first few cells
                        let hasEncodingIssues = false;
                        if (window.excelWorkbook && window.excelWorkbook.SheetNames.length > 0) {
                            const sheet = window.excelWorkbook.Sheets[window.excelWorkbook.SheetNames[0]];
                            let cellsChecked = 0;
                            
                            for (let cell in sheet) {
                                if (cell[0] !== '!' && cellsChecked < 10) { // Skip metadata, check first 10 cells
                                    cellsChecked++;
                                    const value = sheet[cell].v;
                                    if (typeof value === 'string' && 
                                        (/\uFFFD/.test(value) || /�/.test(value) || /\u0000/.test(value))) {
                                        hasEncodingIssues = true;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // If encoding issues detected, try other encodings
                        if (hasEncodingIssues) {
                            console.log("Encoding issues detected, trying alternative encoding");
                            window.appendLog("Excel file has encoding issues, trying alternative encoding methods", "warning");
                            
                            // Try Windows-1252 encoding
                            window.excelWorkbook = XLSX.read(arrayBuffer, {
                                type: 'array',
                                codepage: 1252,  // Windows-1252
                                cellDates: true,
                                raw: true
                            });
                        }
                        
                        // Populate sheet select dropdown
                        const excelSheet = document.getElementById('excel-sheet');
                        if (excelSheet) {
                            excelSheet.innerHTML = '';
                            window.excelWorkbook.SheetNames.forEach(sheet => {
                                const option = document.createElement('option');
                                option.value = sheet;
                                option.textContent = sheet;
                                excelSheet.appendChild(option);
                            });
                            
                            // Load the first sheet by default
                            if (window.loadExcelSheet) {
                                window.loadExcelSheet(window.excelWorkbook.SheetNames[0]);
                            }
                        }
                        
                        // Enable buttons
                        const mapFieldsBtn = document.getElementById('map-fields-btn');
                        const clearBtn = document.getElementById('clear-btn');
                        if (mapFieldsBtn) mapFieldsBtn.disabled = false;
                        if (clearBtn) clearBtn.disabled = false;
                        
                    } catch (error) {
                        console.error('Enhanced Excel reader error:', error);
                        
                        if (error.message && (
                            error.message.includes('encoding') || 
                            error.message.includes('character') ||
                            error.message.includes('UTF')
                        )) {
                            window.appendLog(`Excel encoding issue detected. Try saving as CSV first.`, 'error');
                        } else {
                            window.appendLog(`Error reading Excel file: ${error.message}. Try converting to CSV.`, 'error');
                        }
                    }
                };
                
                reader.onerror = function(event) {
                    window.appendLog('Error reading Excel file', 'error');
                };
                
                // Read the file as ArrayBuffer (required for binary Excel files)
                reader.readAsArrayBuffer(file);
                
                // Don't call other handlers
                return false;
            }
        }, true); // Use capturing to intercept before other handlers
    }
    
    console.log("✅ Excel encoding fixes applied to Data Formatter");
})();