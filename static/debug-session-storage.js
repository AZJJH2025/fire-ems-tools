/**
 * SessionStorage Debugger
 * 
 * This script helps debug sessionStorage issues between the Data Formatter and other tools.
 * Copy and paste this into the browser console to see what's happening with sessionStorage.
 */

function debugSessionStorage() {
    const debugElement = document.createElement('div');
    debugElement.id = 'session-storage-debugger';
    debugElement.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 350px;
        max-height: 400px;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.8);
        color: #00ff00;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        z-index: 10000;
        font-size: 12px;
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: #ff3333;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        cursor: pointer;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(debugElement);
    };
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.innerText = 'Clear SessionStorage';
    clearButton.style.cssText = `
        background-color: #ff9900;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        margin-left: 5px;
        cursor: pointer;
    `;
    clearButton.onclick = () => {
        sessionStorage.clear();
        updateDebugInfo();
    };
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.innerText = 'Refresh';
    refreshButton.style.cssText = `
        background-color: #3399ff;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        margin-left: 5px;
        cursor: pointer;
    `;
    refreshButton.onclick = updateDebugInfo;
    
    // Add title
    const titleElement = document.createElement('h3');
    titleElement.innerText = 'SessionStorage Debugger';
    titleElement.style.marginTop = '0';
    
    // Create content container
    const contentElement = document.createElement('div');
    contentElement.id = 'session-storage-content';
    
    // Assemble elements
    debugElement.appendChild(closeButton);
    debugElement.appendChild(titleElement);
    debugElement.appendChild(refreshButton);
    debugElement.appendChild(clearButton);
    debugElement.appendChild(document.createElement('hr'));
    debugElement.appendChild(contentElement);
    
    // Add to body
    document.body.appendChild(debugElement);
    
    // Update the debug info
    updateDebugInfo();
    
    // Set up a timer to check for changes
    setInterval(updateDebugInfo, 2000);
}

function updateDebugInfo() {
    const contentElement = document.getElementById('session-storage-content');
    if (!contentElement) return;
    
    // Clear current content
    contentElement.innerHTML = '';
    
    // Get all sessionStorage items
    const items = {};
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        items[key] = value;
    }
    
    // Display storage size
    const totalSize = new TextEncoder().encode(
        Object.entries(items).map(([k, v]) => k + v).join('')
    ).length;
    
    const sizeInfo = document.createElement('div');
    sizeInfo.innerHTML = `<strong>Total Size:</strong> ${(totalSize / 1024).toFixed(2)} KB`;
    contentElement.appendChild(sizeInfo);
    contentElement.appendChild(document.createElement('hr'));
    
    // Check for browser storage limits
    const storageLimit = getStorageLimit();
    const limitInfo = document.createElement('div');
    limitInfo.innerHTML = `<strong>Browser Storage Limit:</strong> ~${storageLimit} MB`;
    contentElement.appendChild(limitInfo);
    
    const usagePercentage = (totalSize / (storageLimit * 1024 * 1024)) * 100;
    const usageInfo = document.createElement('div');
    usageInfo.innerHTML = `<strong>Usage:</strong> ${usagePercentage.toFixed(2)}% of available storage`;
    contentElement.appendChild(usageInfo);
    
    contentElement.appendChild(document.createElement('hr'));
    
    // Check for formatter-specific data
    const formatterKeys = ['formattedData', 'dataSource', 'formatterToolId', 'formatterTarget', 'formatterTimestamp'];
    const hasFormatterData = formatterKeys.some(key => sessionStorage.getItem(key));
    
    if (hasFormatterData) {
        const formatterInfo = document.createElement('div');
        formatterInfo.innerHTML = '<strong>Formatter Data Found:</strong>';
        
        formatterKeys.forEach(key => {
            const value = sessionStorage.getItem(key);
            if (value) {
                const keyElement = document.createElement('div');
                keyElement.innerHTML = `<span style="color: #ffcc00">${key}:</span> `;
                
                if (key === 'formattedData') {
                    try {
                        const parsed = JSON.parse(value);
                        const recordCount = Array.isArray(parsed) ? parsed.length : 
                                          (parsed.data && Array.isArray(parsed.data)) ? parsed.data.length : 'unknown';
                        
                        // Show more detailed information about the parsed data
                        let dataStructure = 'Unknown format';
                        if (Array.isArray(parsed)) {
                            dataStructure = 'Array of records';
                        } else if (parsed.data && Array.isArray(parsed.data)) {
                            dataStructure = 'Object with data array';
                        } else if (typeof parsed === 'object' && parsed !== null) {
                            dataStructure = 'Single object record';
                        }
                        
                        // Get a sample of what fields are available in the first record
                        let sampleFields = '';
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            sampleFields = Object.keys(parsed[0] || {}).slice(0, 5).join(', ') + 
                                (Object.keys(parsed[0] || {}).length > 5 ? '...' : '');
                        } else if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
                            sampleFields = Object.keys(parsed.data[0] || {}).slice(0, 5).join(', ') + 
                                (Object.keys(parsed.data[0] || {}).length > 5 ? '...' : '');
                        }
                        
                        keyElement.innerHTML += `<span style="color: #66ff66">[${recordCount} records, ${dataStructure}]</span>`;
                        
                        // Add a way to see more details
                        const detailsButton = document.createElement('button');
                        detailsButton.innerText = 'Show Sample';
                        detailsButton.style.cssText = 'background-color: #00aa00; color: white; border: none; border-radius: 3px; padding: 1px 5px; margin-left: 5px; cursor: pointer; font-size: 10px;';
                        detailsButton.onclick = () => {
                            const sampleElement = document.createElement('pre');
                            sampleElement.style.cssText = 'background-color: #111; color: #aaffaa; padding: 8px; max-height: 150px; overflow: auto; font-size: 11px; margin-top: 5px; border-radius: 3px;';
                            
                            // Show sample of first record
                            let sampleData;
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                sampleData = parsed[0];
                            } else if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
                                sampleData = parsed.data[0];
                            } else {
                                sampleData = parsed;
                            }
                            
                            sampleElement.textContent = `Sample Record:\n${JSON.stringify(sampleData, null, 2).slice(0, 500)}${JSON.stringify(sampleData, null, 2).length > 500 ? '...' : ''}`;
                            
                            // Add field list to see if required fields are present
                            const fieldList = document.createElement('div');
                            fieldList.style.cssText = 'margin-top: 5px; font-size: 11px;';
                            fieldList.innerHTML = `<strong>Fields:</strong> ${sampleFields || 'None found'}`;
                            
                            const requiredFields = ['Incident ID', 'Unit', 'Reported', 'Unit Dispatched', 'Unit Onscene', 'Latitude', 'Longitude'];
                            const missingFields = [];
                            
                            // Check for required fields
                            if (sampleData) {
                                requiredFields.forEach(field => {
                                    if (sampleData[field] === undefined) {
                                        missingFields.push(field);
                                    }
                                });
                            }
                            
                            if (missingFields.length > 0) {
                                const missingEl = document.createElement('div');
                                missingEl.style.cssText = 'color: #ff7777; margin-top: 5px; font-size: 11px;';
                                missingEl.innerHTML = `<strong>Missing Required Fields:</strong> ${missingFields.join(', ')}`;
                                fieldList.appendChild(missingEl);
                            }
                            
                            // Add a close button for the sample
                            const closeSampleBtn = document.createElement('button');
                            closeSampleBtn.innerText = 'Close Sample';
                            closeSampleBtn.style.cssText = 'background-color: #aa0000; color: white; border: none; border-radius: 3px; padding: 1px 5px; margin-top: 5px; cursor: pointer; font-size: 10px;';
                            closeSampleBtn.onclick = () => {
                                sampleElement.remove();
                                fieldList.remove();
                                closeSampleBtn.remove();
                            };
                            
                            keyElement.appendChild(sampleElement);
                            keyElement.appendChild(fieldList);
                            keyElement.appendChild(closeSampleBtn);
                        };
                        keyElement.appendChild(detailsButton);
                        
                    } catch (e) {
                        keyElement.innerHTML += `<span style="color: #ff6666">[Invalid JSON: ${e.message}]</span>`;
                        
                        // Add a button to help regenerate the data
                        const fixButton = document.createElement('button');
                        fixButton.innerText = 'Fix Data Transfer';
                        fixButton.style.cssText = 'background-color: #ff3300; color: white; border: none; border-radius: 3px; padding: 2px 5px; margin-left: 5px; cursor: pointer; font-size: 10px;';
                        fixButton.onclick = () => {
                            if (confirm('This will clear the current session storage and redirect you to the Data Formatter. Continue?')) {
                                sessionStorage.clear();
                                window.location.href = '/data-formatter';
                            }
                        };
                        keyElement.appendChild(fixButton);
                    }
                } else {
                    keyElement.innerHTML += `<span style="color: #66ff66">${value}</span>`;
                }
                
                formatterInfo.appendChild(keyElement);
            }
        });
        
        contentElement.appendChild(formatterInfo);
        contentElement.appendChild(document.createElement('hr'));
    } else {
        const noFormatterData = document.createElement('div');
        noFormatterData.innerHTML = '<strong style="color: #ff6666">No Formatter Data Found</strong>';
        noFormatterData.style.marginBottom = '15px';
        contentElement.appendChild(noFormatterData);
        
        // Add a button to go to the Data Formatter
        const formatterButton = document.createElement('button');
        formatterButton.innerText = 'Go to Data Formatter';
        formatterButton.style.cssText = 'background-color: #0066cc; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer; margin-bottom: 15px;';
        formatterButton.onclick = () => {
            window.location.href = '/data-formatter';
        };
        contentElement.appendChild(formatterButton);
        contentElement.appendChild(document.createElement('hr'));
    }
}

// Helper function to estimate the browser's storage limit
function getStorageLimit() {
    // Default estimate based on common browser limits
    let estimatedLimit = 5; // 5MB is common
    
    // Try to guess based on browser
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) {
        estimatedLimit = 10; // Chrome usually has higher limits
    } else if (ua.includes('Firefox')) {
        estimatedLimit = 10; // Firefox has similar limits
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        estimatedLimit = 5; // Safari can be more restrictive
    } else if (ua.includes('Edge')) {
        estimatedLimit = 10; // Edge is based on Chromium
    }
    
    return estimatedLimit;
}
    
    // List all items
    const itemsTitle = document.createElement('div');
    itemsTitle.innerHTML = '<strong>All SessionStorage Items:</strong>';
    contentElement.appendChild(itemsTitle);
    
    if (Object.keys(items).length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.innerText = 'No items in sessionStorage';
        emptyElement.style.color = '#ff6666';
        contentElement.appendChild(emptyElement);
    } else {
        Object.entries(items).forEach(([key, value]) => {
            if (key === 'formattedData') return; // Skip showing the full data
            
            const itemElement = document.createElement('div');
            itemElement.innerHTML = `<span style="color: #ffcc00">${key}:</span> `;
            
            if (value && value.length > 100) {
                itemElement.innerHTML += `<span style="color: #66ff66">${value.substring(0, 100)}...</span>`;
            } else {
                itemElement.innerHTML += `<span style="color: #66ff66">${value}</span>`;
            }
            
            contentElement.appendChild(itemElement);
        });
    }
}

// Run the debugger
debugSessionStorage();

// Instructions on how to use
console.log("%c SessionStorage Debugger Loaded", "background: #222; color: #bada55; font-size: 14px;");
console.log("%c This tool will help debug sessionStorage issues between the Data Formatter and other tools", "color: #3399ff");
console.log("%c A floating window should appear in the top-right corner of the page", "color: #3399ff");
console.log("%c Instructions:", "color: #ffcc00");
console.log("%c - The debugger shows the current state of sessionStorage", "color: #fff");
console.log("%c - Click 'Refresh' to update the display", "color: #fff");
console.log("%c - Click 'Clear SessionStorage' to remove all items", "color: #fff");
console.log("%c - Click 'Close' to remove the debugger", "color: #fff");