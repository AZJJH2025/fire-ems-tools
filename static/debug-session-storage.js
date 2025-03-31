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
                        keyElement.innerHTML += `<span style="color: #66ff66">[${recordCount} records]</span>`;
                    } catch (e) {
                        keyElement.innerHTML += `<span style="color: #ff6666">[Invalid JSON: ${e.message}]</span>`;
                    }
                } else {
                    keyElement.innerHTML += `<span style="color: #66ff66">${value}</span>`;
                }
                
                formatterInfo.appendChild(keyElement);
            }
        });
        
        contentElement.appendChild(formatterInfo);
        contentElement.appendChild(document.createElement('hr'));
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