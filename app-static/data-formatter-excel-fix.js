/**
 * Excel Encoding Fix for Data Formatter
 * 
 * Fixes the issue with Excel files showing strange characters like "=�qԂ��ʹ�/2��"
 * This script adds proper encoding detection and handling for Excel files
 */

(function() {
    console.log("🛠️ Applying Excel encoding fixes to Data Formatter");
    
    // Safely call functions that might not be available yet
    function safeAppendLog(message, type) {
        if (typeof window.appendLog === 'function') {
            window.appendLog(message, type);
        } else {
            console.log(`[Excel Fix] ${type || 'info'}: ${message}`);
            
            // Try to use FireEMS logger if available
            if (window.FireEMS && window.FireEMS.Logger && typeof window.FireEMS.Logger.log === 'function') {
                window.FireEMS.Logger.log(message, type);
            }
        }
    }
    
    function safeShowPreview(data) {
        if (typeof window.showInputPreview === 'function') {
            window.showInputPreview(data);
        } else {
            console.log("[Excel Fix] Preview function not available yet");
            
            // Try a direct DOM update as fallback
            try {
                const previewContainer = document.getElementById('input-preview');
                if (previewContainer && data && data.length > 0) {
                    // Get column headers from first row
                    const headers = Object.keys(data[0]);
                    
                    // Build HTML table
                    let html = '<table class="preview-table"><thead><tr>';
                    headers.forEach(header => {
                        html += `<th>${header}</th>`;
                    });
                    html += '</tr></thead><tbody>';
                    
                    // Add up to 10 rows of data
                    const rowsToShow = Math.min(data.length, 10);
                    for (let i = 0; i < rowsToShow; i++) {
                        html += '<tr>';
                        headers.forEach(header => {
                            html += `<td>${data[i][header] || ''}</td>`;
                        });
                        html += '</tr>';
                    }
                    html += '</tbody></table>';
                    
                    previewContainer.innerHTML = html;
                    
                    if (data.length > 10) {
                        const message = document.createElement('div');
                        message.className = 'info-message';
                        message.innerHTML = `<p>Showing 10 of ${data.length} rows...</p>`;
                        previewContainer.appendChild(message);
                    }
                }
            } catch (err) {
                console.error("Failed to manually update preview:", err);
            }
        }
    }
    
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
    
    // 2. Create a robust loadExcelSheet function that doesn't depend on external functions
    function enhancedLoadExcelSheet(sheetName) {
        if (!window.excelWorkbook) {
            console.warn("[Excel Fix] No workbook available");
            return;
        }
        
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
                const processedData = rawData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        if (header) { // Skip empty headers
                            obj[header] = sanitizeExcelValue(row[i]);
                        }
                    });
                    return obj;
                });
                
                // Filter out entirely empty rows
                const filteredData = processedData.filter(row => 
                    Object.values(row).some(val => val !== ''));
                
                console.log(`Enhanced Excel loader: Loaded sheet "${sheetName}" with ${filteredData.length} records`);
                
                // Update global state
                window.originalData = filteredData;
                
                // Update store if available
                if (window.DataFormatterStore) {
                    window.DataFormatterStore.actions.setOriginalData(filteredData);
                }
                
                // Store in formatter state if available
                if (window.formatterState) {
                    window.formatterState.sourceColumns = headers;
                    window.formatterState.sampleData = filteredData;
                    window.formatterState.originalData = true;
                }
                
                // Show preview with sanitized data
                safeShowPreview(filteredData);
                safeAppendLog(`Loaded Excel sheet "${sheetName}" with ${filteredData.length} records using enhanced encoding support`);
                
                return filteredData;
            } else {
                // Empty or only headers
                safeAppendLog(`Excel sheet "${sheetName}" has no data rows`, 'warning');
                window.originalData = [];
                
                // Show empty preview
                const previewContainer = document.getElementById('input-preview');
                if (previewContainer) {
                    previewContainer.innerHTML = `
                        <div class="placeholder-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>No data found in selected sheet</p>
                        </div>
                    `;
                }
                
                return [];
            }
        } catch (error) {
            console.error('Enhanced Excel loader error:', error);
            safeAppendLog(`Error parsing Excel sheet: ${error.message}`, 'error');
            
            // Reset data if all fails
            window.originalData = null;
            return null;
        }
    }
    
    // Wait for DOM content to be fully loaded
    function initializeExcelFix() {
        // Override the Excel sheet loading function if it exists
        if (typeof window.loadExcelSheet === 'function') {
            const originalLoadExcelSheet = window.loadExcelSheet;
            window.loadExcelSheet = function(sheetName) {
                try {
                    // Try our enhanced version first
                    const result = enhancedLoadExcelSheet(sheetName);
                    if (result) return result;
                    
                    // Fall back to original if ours fails
                    console.log("Falling back to original Excel loader");
                    return originalLoadExcelSheet(sheetName);
                } catch (err) {
                    console.error("Both Excel loaders failed:", err);
                    return null;
                }
            };
        } else {
            // Just define our function if the original doesn't exist
            window.loadExcelSheet = enhancedLoadExcelSheet;
        }
        
        // 3. Set up the FileReader for Excel files
        const fileInput = document.getElementById('data-file');
        if (fileInput) {
            // Store the original change handler for fallback
            const originalChangeHandler = fileInput.onchange;
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                const fileName = file.name || '';
                const fileExt = fileName.split('.').pop().toLowerCase();
                
                // Only apply our enhanced handler for Excel files
                if (fileExt === 'xlsx' || fileExt === 'xls') {
                    console.log("🔍 Excel file detected, using enhanced reader");
                    
                    // Update file name display
                    const fileNameElement = document.getElementById('file-name');
                    if (fileNameElement) fileNameElement.textContent = fileName;
                    
                    // Set file type and store filename for future reference
                    window.fileType = 'excel';
                    
                    // Store in sessionStorage for persistence
                    try {
                        sessionStorage.setItem('currentFileName', fileName);
                        sessionStorage.setItem('lastFileSize', file.size);
                    } catch (err) {
                        console.warn("Failed to store file info in sessionStorage:", err);
                    }
                    
                    // Store in formatter state if available
                    if (window.formatterState) {
                        window.formatterState.originalFileName = fileName;
                        window.formatterState.fileSize = file.size;
                    }
                    
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
                                safeAppendLog("Excel file has encoding issues, trying alternative encoding methods", "warning");
                                
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
                                
                                // Set up sheet change handler
                                excelSheet.addEventListener('change', function() {
                                    if (typeof window.loadExcelSheet === 'function') {
                                        window.loadExcelSheet(this.value);
                                    }
                                });
                                
                                // Load the first sheet by default
                                if (window.excelWorkbook.SheetNames.length > 0) {
                                    const firstSheet = window.excelWorkbook.SheetNames[0];
                                    // Directly use our enhanced function to avoid timing issues
                                    enhancedLoadExcelSheet(firstSheet);
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
                                safeAppendLog(`Excel encoding issue detected. Try saving as CSV first.`, 'error');
                            } else {
                                safeAppendLog(`Error reading Excel file: ${error.message}. Try converting to CSV.`, 'error');
                            }
                            
                            // If our reader fails, try to call the original handler as fallback
                            if (typeof originalChangeHandler === 'function') {
                                try {
                                    console.log("Trying original handler as fallback");
                                    originalChangeHandler.call(fileInput, e);
                                } catch (fallbackError) {
                                    console.error("Original handler also failed:", fallbackError);
                                }
                            }
                        }
                    };
                    
                    reader.onerror = function(event) {
                        safeAppendLog('Error reading Excel file', 'error');
                        
                        // Try original handler as fallback
                        if (typeof originalChangeHandler === 'function') {
                            try {
                                originalChangeHandler.call(fileInput, e);
                            } catch (err) {
                                console.error("Original handler failed on error fallback:", err);
                            }
                        }
                    };
                    
                    // Read the file as ArrayBuffer (required for binary Excel files)
                    reader.readAsArrayBuffer(file);
                    
                    // Prevent default behavior but allow other handlers to run
                    // (this is safer than stopping propagation completely)
                    return true;
                }
            });
        }
    }
    
    // Initialize immediately if DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeExcelFix();
    } else {
        // Otherwise wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', initializeExcelFix);
    }
    
    // Also add a delayed initialization as a safety measure
    setTimeout(initializeExcelFix, 1000);
    
    console.log("✅ Excel encoding fixes applied to Data Formatter");
})();