/**
 * SessionStorage Debugger
 * 
 * This script helps debug sessionStorage issues between the Data Formatter and other tools.
 * Copy and paste this into the browser console to see what's happening with sessionStorage.
 */

function debugSessionStorage() {
    // Add CSS to document
    const style = document.createElement('style');
    style.textContent = `
        #session-storage-debugger {
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
        }
        #session-storage-debugger button {
            cursor: pointer;
            border: none;
            border-radius: 3px;
            padding: 2px 5px;
            color: white;
        }
        #session-storage-debugger .close {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #ff3333;
        }
        #session-storage-debugger .refresh {
            background-color: #3399ff;
            margin-left: 5px;
        }
        #session-storage-debugger .clear {
            background-color: #ff9900;
            margin-left: 5px;
        }
    `;
    document.head.appendChild(style);

    // Create debugger container
    const debugElement = document.createElement('div');
    debugElement.id = 'session-storage-debugger';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.className = 'close';
    closeButton.onclick = () => {
        document.body.removeChild(debugElement);
    };
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.innerText = 'Clear SessionStorage';
    clearButton.className = 'clear';
    clearButton.onclick = () => {
        sessionStorage.clear();
        updateDebugInfo();
    };
    
    // Add refresh button
    const refreshButton = document.createElement('button');
    refreshButton.innerText = 'Refresh';
    refreshButton.className = 'refresh';
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
    
    // Function to update the debug info
    function updateDebugInfo() {
        const contentElement = document.getElementById('session-storage-content');
        if (!contentElement) return;
        
        contentElement.innerHTML = '';
        
        // Check if sessionStorage is available
        if (typeof sessionStorage === 'undefined') {
            contentElement.innerHTML = '<p style="color: red;">SessionStorage not available!</p>';
            return;
        }
        
        // Get all items from sessionStorage
        const items = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            let value = sessionStorage.getItem(key);
            
            // Try to parse JSON
            try {
                const parsed = JSON.parse(value);
                if (typeof parsed === 'object' && parsed !== null) {
                    // Simplify display for large arrays
                    if (Array.isArray(parsed)) {
                        value = `Array(${parsed.length}) ${JSON.stringify(parsed[0]).substring(0, 100)}...`;
                    } else {
                        // Show object summary
                        value = `Object ${JSON.stringify(parsed).substring(0, 100)}...`;
                    }
                }
            } catch (e) {
                // Not JSON, leave as is
            }
            
            items[key] = value;
        }
        
        // Display items
        Object.entries(items).forEach(([key, value]) => {
            const itemElement = document.createElement('div');
            itemElement.style.marginBottom = '10px';
            itemElement.style.wordBreak = 'break-all';
            
            itemElement.innerHTML = `<strong>${key}:</strong> `;
            
            // Color code based on content
            if (value && value.includes('error')) {
                itemElement.innerHTML += `<span style="color: #ff6666">${value}</span>`;
            } else {
                itemElement.innerHTML += `<span style="color: #66ff66">${value}</span>`;
            }
            
            contentElement.appendChild(itemElement);
        });
    }
    
    // Update the debug info initially
    updateDebugInfo();
    
    // Set up a timer to check for changes
    setInterval(updateDebugInfo, 2000);
}

// Run the debugger
debugSessionStorage();

// Instructions on how to use
console.log("%c SessionStorage Debugger Loaded", "background: #222; color: #bada55; font-size: 14px;");
console.log("%c This tool will help debug sessionStorage issues between the Data Formatter and other tools", "color: #3399ff");