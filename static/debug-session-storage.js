/**
 * SessionStorage and LocalStorage Debugger
 * 
 * This script helps debug storage issues between the Data Formatter and other tools.
 * Specifically designed to assist with emergency mode data transfer troubleshooting.
 */

function debugStorage() {
    // Add CSS to document
    const style = document.createElement('style');
    style.textContent = `
        #storage-debugger {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 600px;
            overflow-y: auto;
            background-color: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 10000;
            font-size: 12px;
        }
        #storage-debugger button {
            cursor: pointer;
            border: none;
            border-radius: 3px;
            padding: 4px 8px;
            color: white;
            margin: 0 3px;
        }
        #storage-debugger .close {
            position: absolute;
            top: 5px;
            right: 5px;
            background-color: #ff3333;
        }
        #storage-debugger .refresh {
            background-color: #3399ff;
        }
        #storage-debugger .clear {
            background-color: #ff9900;
        }
        #storage-debugger .tabs {
            display: flex;
            margin-bottom: 10px;
        }
        #storage-debugger .tab {
            padding: 5px 10px;
            background-color: #333;
            cursor: pointer;
            border-radius: 3px 3px 0 0;
            margin-right: 2px;
        }
        #storage-debugger .tab.active {
            background-color: #444;
            font-weight: bold;
        }
        #storage-debugger .tab-content {
            display: none;
            max-height: 400px;
            overflow-y: auto;
            background-color: #222;
            padding: 10px;
            border-radius: 0 3px 3px 3px;
        }
        #storage-debugger .tab-content.active {
            display: block;
        }
        #storage-debugger .storage-item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #444;
            word-break: break-word;
        }
        #storage-debugger .item-key {
            font-weight: bold;
            color: #ff9;
        }
        #storage-debugger .item-value {
            color: #6f6;
            margin-top: 3px;
            max-height: 100px;
            overflow-y: auto;
        }
        #storage-debugger .count {
            background-color: #555;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            margin-left: 5px;
        }
        #storage-debugger .error {
            color: #f66;
        }
        #storage-debugger .warning {
            color: #fc6;
        }
        #storage-debugger .success {
            color: #6f6;
        }
        #storage-debugger .tools {
            margin-bottom: 10px;
        }
        #storage-debugger .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        #storage-debugger .url-info {
            background: #333;
            padding: 5px;
            border-radius: 3px;
            margin-bottom: 10px;
            font-size: 11px;
        }
        #storage-debugger .item-actions {
            margin-top: 5px;
        }
        #storage-debugger .item-actions button {
            font-size: 10px;
            padding: 2px 5px;
        }
    `;
    document.head.appendChild(style);

    // Create debugger container
    const debugElement = document.createElement('div');
    debugElement.id = 'storage-debugger';
    
    // Add header with title and close button
    const headerElement = document.createElement('div');
    headerElement.className = 'header';
    
    const titleElement = document.createElement('h3');
    titleElement.innerText = 'FireEMS.ai Storage Debugger';
    titleElement.style.marginTop = '0';
    titleElement.style.marginBottom = '0';
    headerElement.appendChild(titleElement);
    
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.className = 'close';
    closeButton.onclick = () => {
        document.body.removeChild(debugElement);
    };
    headerElement.appendChild(closeButton);
    
    // Add URL info section
    const urlInfo = document.createElement('div');
    urlInfo.className = 'url-info';
    const url = new URL(window.location.href);
    urlInfo.innerHTML = `
        <div><strong>Current Path:</strong> ${url.pathname}</div>
        <div><strong>Emergency Data:</strong> ${url.searchParams.get('emergency_data') || 'none'}</div>
        <div><strong>Other Params:</strong> ${Array.from(url.searchParams.entries())
            .filter(([key]) => key !== 'emergency_data')
            .map(([key, value]) => `${key}=${value}`)
            .join(', ') || 'none'}</div>
    `;
    
    // Add tab navigation
    const tabsElement = document.createElement('div');
    tabsElement.className = 'tabs';
    
    const tabs = [
        { id: 'emergency', label: 'Emergency Data' },
        { id: 'localStorage', label: 'localStorage' },
        { id: 'sessionStorage', label: 'sessionStorage' },
        { id: 'diagnostics', label: 'Diagnostics' }
    ];
    
    tabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${index === 0 ? 'active' : ''}`;
        tabElement.dataset.tab = tab.id;
        tabElement.innerText = tab.label;
        tabElement.onclick = () => {
            document.querySelectorAll('#storage-debugger .tab').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('#storage-debugger .tab-content').forEach(el => el.classList.remove('active'));
            tabElement.classList.add('active');
            document.getElementById(`tab-${tab.id}`).classList.add('active');
        };
        tabsElement.appendChild(tabElement);
    });
    
    // Add tools section
    const toolsElement = document.createElement('div');
    toolsElement.className = 'tools';
    
    const refreshButton = document.createElement('button');
    refreshButton.innerText = 'Refresh';
    refreshButton.className = 'refresh';
    refreshButton.onclick = updateDebugInfo;
    toolsElement.appendChild(refreshButton);
    
    const clearLocalStorageButton = document.createElement('button');
    clearLocalStorageButton.innerText = 'Clear localStorage';
    clearLocalStorageButton.className = 'clear';
    clearLocalStorageButton.onclick = () => {
        if (confirm('Are you sure you want to clear all localStorage items?')) {
            localStorage.clear();
            updateDebugInfo();
        }
    };
    toolsElement.appendChild(clearLocalStorageButton);
    
    const clearSessionStorageButton = document.createElement('button');
    clearSessionStorageButton.innerText = 'Clear sessionStorage';
    clearSessionStorageButton.className = 'clear';
    clearSessionStorageButton.onclick = () => {
        if (confirm('Are you sure you want to clear all sessionStorage items?')) {
            sessionStorage.clear();
            updateDebugInfo();
        }
    };
    toolsElement.appendChild(clearSessionStorageButton);
    
    // Create tab content containers
    const tabContentContainer = document.createElement('div');
    tabContentContainer.className = 'tab-content-container';
    
    tabs.forEach(tab => {
        const tabContent = document.createElement('div');
        tabContent.id = `tab-${tab.id}`;
        tabContent.className = `tab-content ${tab.id === 'emergency' ? 'active' : ''}`;
        tabContentContainer.appendChild(tabContent);
    });
    
    // Assemble elements
    debugElement.appendChild(headerElement);
    debugElement.appendChild(urlInfo);
    debugElement.appendChild(tabsElement);
    debugElement.appendChild(toolsElement);
    debugElement.appendChild(tabContentContainer);
    
    // Add to body
    document.body.appendChild(debugElement);
    
    // Function to update the debug info
    function updateDebugInfo() {
        updateEmergencyTab();
        updateLocalStorageTab();
        updateSessionStorageTab();
        updateDiagnosticsTab();
    }
    
    // Update the Emergency Data tab
    function updateEmergencyTab() {
        const tabContent = document.getElementById('tab-emergency');
        if (!tabContent) return;
        
        tabContent.innerHTML = '';
        
        // Get emergency data ID from URL
        const url = new URL(window.location.href);
        const emergencyDataId = url.searchParams.get('emergency_data');
        
        if (!emergencyDataId) {
            tabContent.innerHTML = '<p class="warning">No emergency data ID in URL</p>';
            return;
        }
        
        // Try to retrieve the data
        let emergencyData = localStorage.getItem(emergencyDataId);
        let storageType = 'localStorage';
        
        if (!emergencyData) {
            // Try sessionStorage
            emergencyData = sessionStorage.getItem(emergencyDataId);
            storageType = 'sessionStorage';
        }
        
        if (!emergencyData) {
            // Try backup key
            emergencyData = localStorage.getItem('emergency_data_latest');
            storageType = 'localStorage (backup)';
            
            if (!emergencyData) {
                emergencyData = sessionStorage.getItem('emergency_data_latest');
                storageType = 'sessionStorage (backup)';
            }
        }
        
        if (!emergencyData) {
            tabContent.innerHTML = `
                <p class="error">⚠️ No data found for ID: ${emergencyDataId}</p>
                <p>Also checked backup ID: emergency_data_latest</p>
                <p>Possible causes:</p>
                <ul>
                    <li>The data was not correctly stored during send</li>
                    <li>The data expired or was cleared</li>
                    <li>Browser storage limitations</li>
                </ul>
            `;
            return;
        }
        
        // Try to parse the data
        try {
            const parsed = JSON.parse(emergencyData);
            
            // Determine data structure
            let actualData, metadata;
            
            if (parsed.metadata && parsed.data) {
                // Standard format with metadata
                actualData = parsed.data;
                metadata = parsed.metadata;
            } else {
                // Just data without metadata
                actualData = parsed;
                metadata = null;
            }
            
            // Show basic information
            const infoHtml = `
                <div>
                    <p class="success">✅ Emergency data found in ${storageType}</p>
                    <p><strong>ID:</strong> ${emergencyDataId}</p>
                    <p><strong>Type:</strong> ${Array.isArray(actualData) ? 'Array' : typeof actualData}</p>
                    <p><strong>Size:</strong> ${(emergencyData.length / 1024).toFixed(2)} KB</p>
                    ${Array.isArray(actualData) ? `<p><strong>Items:</strong> ${actualData.length}</p>` : ''}
                    ${metadata ? `
                        <div style="margin-top: 10px;">
                            <p><strong>Metadata:</strong></p>
                            <ul>
                                ${Object.entries(metadata).map(([key, value]) => 
                                    `<li><strong>${key}:</strong> ${value}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
            
            tabContent.innerHTML = infoHtml;
            
            // Add a preview of the data
            const previewContainer = document.createElement('div');
            previewContainer.innerHTML = '<h4>Data Preview:</h4>';
            
            const preview = document.createElement('pre');
            preview.style.maxHeight = '200px';
            preview.style.overflow = 'auto';
            preview.style.backgroundColor = '#333';
            preview.style.padding = '5px';
            preview.style.borderRadius = '3px';
            preview.style.fontSize = '11px';
            
            if (Array.isArray(actualData)) {
                // Show just the first item for arrays
                preview.innerText = JSON.stringify(actualData[0], null, 2);
            } else {
                // Show beginning of the data for objects
                preview.innerText = JSON.stringify(actualData, null, 2).substring(0, 1000);
            }
            
            previewContainer.appendChild(preview);
            tabContent.appendChild(previewContainer);
            
            // Add actions for the data
            const actionsContainer = document.createElement('div');
            actionsContainer.style.marginTop = '10px';
            
            const viewFullDataBtn = document.createElement('button');
            viewFullDataBtn.innerText = 'View Full Data in Console';
            viewFullDataBtn.onclick = () => {
                console.log('Emergency Data Full Content:', actualData);
                alert('Data printed to browser console. Open developer tools to view it.');
            };
            actionsContainer.appendChild(viewFullDataBtn);
            
            const downloadDataBtn = document.createElement('button');
            downloadDataBtn.innerText = 'Download as JSON';
            downloadDataBtn.onclick = () => {
                downloadJson(actualData, 'emergency-data.json');
            };
            actionsContainer.appendChild(downloadDataBtn);
            
            tabContent.appendChild(actionsContainer);
        } catch (e) {
            tabContent.innerHTML = `
                <p class="error">⚠️ Error parsing emergency data: ${e.message}</p>
                <p>Raw data size: ${emergencyData.length} bytes</p>
                <p>First 100 characters:</p>
                <pre style="background: #333; padding: 5px; font-size: 11px; overflow: auto;">${emergencyData.substring(0, 100)}...</pre>
            `;
        }
    }
    
    // Update the localStorage tab
    function updateLocalStorageTab() {
        const tabContent = document.getElementById('tab-localStorage');
        if (!tabContent) return;
        
        tabContent.innerHTML = '';
        
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
            tabContent.innerHTML = '<p class="error">localStorage not available!</p>';
            return;
        }
        
        // Get all items from localStorage
        const itemsContainer = document.createElement('div');
        
        if (localStorage.length === 0) {
            itemsContainer.innerHTML = '<p class="warning">No items in localStorage</p>';
            tabContent.appendChild(itemsContainer);
            return;
        }
        
        const countElement = document.createElement('div');
        countElement.innerHTML = `<p><strong>Items:</strong> ${localStorage.length}</p>`;
        tabContent.appendChild(countElement);
        
        // Filter input
        const filterContainer = document.createElement('div');
        filterContainer.style.margin = '10px 0';
        
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter by key...';
        filterInput.style.width = '100%';
        filterInput.style.padding = '5px';
        filterInput.style.backgroundColor = '#333';
        filterInput.style.border = '1px solid #555';
        filterInput.style.borderRadius = '3px';
        filterInput.style.color = '#fff';
        
        filterInput.addEventListener('input', () => {
            const filter = filterInput.value.toLowerCase();
            document.querySelectorAll('#localStorage-items .storage-item').forEach(item => {
                const key = item.querySelector('.item-key').innerText.toLowerCase();
                item.style.display = key.includes(filter) ? 'block' : 'none';
            });
        });
        
        filterContainer.appendChild(filterInput);
        tabContent.appendChild(filterContainer);
        
        // Create items container
        const items = document.createElement('div');
        items.id = 'localStorage-items';
        
        // Sort keys, putting emergency_data keys first
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        
        keys.sort((a, b) => {
            const aIsEmergency = a.startsWith('emergency_data_');
            const bIsEmergency = b.startsWith('emergency_data_');
            
            if (aIsEmergency && !bIsEmergency) return -1;
            if (!aIsEmergency && bIsEmergency) return 1;
            return a.localeCompare(b);
        });
        
        // Add items
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'storage-item';
            
            // Highlight emergency data keys
            const isEmergencyData = key.startsWith('emergency_data_');
            
            const keyElement = document.createElement('div');
            keyElement.className = 'item-key';
            keyElement.innerHTML = `${key} ${isEmergencyData ? '<span style="color:#ffcc00">⚡</span>' : ''}`;
            if (isEmergencyData) {
                keyElement.style.color = '#ffcc00';
            }
            itemElement.appendChild(keyElement);
            
            const valueElement = document.createElement('div');
            valueElement.className = 'item-value';
            
            // Try to format as JSON
            try {
                const parsedValue = JSON.parse(value);
                // Pretty print for small values, summarize for large ones
                if (value.length < 1000) {
                    valueElement.innerHTML = `<pre>${JSON.stringify(parsedValue, null, 2)}</pre>`;
                } else {
                    // Summarize based on type
                    if (Array.isArray(parsedValue)) {
                        valueElement.innerHTML = `<strong>Array</strong> with ${parsedValue.length} items. First item:<pre>${JSON.stringify(parsedValue[0], null, 2)}</pre>`;
                    } else if (typeof parsedValue === 'object') {
                        const keys = Object.keys(parsedValue);
                        valueElement.innerHTML = `<strong>Object</strong> with keys: ${keys.join(', ')}`;
                    } else {
                        valueElement.innerText = value.substring(0, 100) + '...';
                    }
                }
            } catch (e) {
                // Not valid JSON, show as text
                valueElement.innerText = value.substring(0, 200) + (value.length > 200 ? '...' : '');
            }
            
            itemElement.appendChild(valueElement);
            
            // Add item actions
            const actionsElement = document.createElement('div');
            actionsElement.className = 'item-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.innerText = 'View in Console';
            viewBtn.style.backgroundColor = '#3399ff';
            viewBtn.onclick = () => {
                try {
                    console.log(`localStorage["${key}"]`, JSON.parse(value));
                } catch (e) {
                    console.log(`localStorage["${key}"]`, value);
                }
                alert(`Item "${key}" printed to console`);
            };
            actionsElement.appendChild(viewBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'Delete';
            deleteBtn.style.backgroundColor = '#ff3333';
            deleteBtn.onclick = () => {
                if (confirm(`Are you sure you want to delete "${key}"?`)) {
                    localStorage.removeItem(key);
                    updateLocalStorageTab();
                }
            };
            actionsElement.appendChild(deleteBtn);
            
            itemElement.appendChild(actionsElement);
            
            items.appendChild(itemElement);
        });
        
        tabContent.appendChild(items);
    }
    
    // Update the sessionStorage tab
    function updateSessionStorageTab() {
        const tabContent = document.getElementById('tab-sessionStorage');
        if (!tabContent) return;
        
        tabContent.innerHTML = '';
        
        // Check if sessionStorage is available
        if (typeof sessionStorage === 'undefined') {
            tabContent.innerHTML = '<p class="error">sessionStorage not available!</p>';
            return;
        }
        
        // Get all items from sessionStorage
        const itemsContainer = document.createElement('div');
        
        if (sessionStorage.length === 0) {
            itemsContainer.innerHTML = '<p class="warning">No items in sessionStorage</p>';
            tabContent.appendChild(itemsContainer);
            return;
        }
        
        const countElement = document.createElement('div');
        countElement.innerHTML = `<p><strong>Items:</strong> ${sessionStorage.length}</p>`;
        tabContent.appendChild(countElement);
        
        // Filter input
        const filterContainer = document.createElement('div');
        filterContainer.style.margin = '10px 0';
        
        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter by key...';
        filterInput.style.width = '100%';
        filterInput.style.padding = '5px';
        filterInput.style.backgroundColor = '#333';
        filterInput.style.border = '1px solid #555';
        filterInput.style.borderRadius = '3px';
        filterInput.style.color = '#fff';
        
        filterInput.addEventListener('input', () => {
            const filter = filterInput.value.toLowerCase();
            document.querySelectorAll('#sessionStorage-items .storage-item').forEach(item => {
                const key = item.querySelector('.item-key').innerText.toLowerCase();
                item.style.display = key.includes(filter) ? 'block' : 'none';
            });
        });
        
        filterContainer.appendChild(filterInput);
        tabContent.appendChild(filterContainer);
        
        // Create items container
        const items = document.createElement('div');
        items.id = 'sessionStorage-items';
        
        // Sort keys, putting emergency_data and formatter keys first
        const keys = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            keys.push(sessionStorage.key(i));
        }
        
        keys.sort((a, b) => {
            const aIsEmergency = a.startsWith('emergency_');
            const bIsEmergency = b.startsWith('emergency_');
            const aIsFormatter = a.includes('formatter') || a.includes('data');
            const bIsFormatter = b.includes('formatter') || b.includes('data');
            
            if (aIsEmergency && !bIsEmergency) return -1;
            if (!aIsEmergency && bIsEmergency) return 1;
            if (aIsFormatter && !bIsFormatter) return -1;
            if (!aIsFormatter && bIsFormatter) return 1;
            return a.localeCompare(b);
        });
        
        // Add items
        keys.forEach(key => {
            const value = sessionStorage.getItem(key);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'storage-item';
            
            // Highlight emergency and formatter keys
            const isEmergencyData = key.startsWith('emergency_');
            const isFormatterData = key.includes('formatter') || key.includes('formatted');
            
            const keyElement = document.createElement('div');
            keyElement.className = 'item-key';
            keyElement.innerHTML = `${key} 
                ${isEmergencyData ? '<span style="color:#ffcc00">⚡</span>' : ''}
                ${isFormatterData ? '<span style="color:#66ccff">🔄</span>' : ''}`;
            
            if (isEmergencyData) {
                keyElement.style.color = '#ffcc00';
            } else if (isFormatterData) {
                keyElement.style.color = '#66ccff';
            }
            
            itemElement.appendChild(keyElement);
            
            const valueElement = document.createElement('div');
            valueElement.className = 'item-value';
            
            // Try to format as JSON
            try {
                const parsedValue = JSON.parse(value);
                // Pretty print for small values, summarize for large ones
                if (value.length < 1000) {
                    valueElement.innerHTML = `<pre>${JSON.stringify(parsedValue, null, 2)}</pre>`;
                } else {
                    // Summarize based on type
                    if (Array.isArray(parsedValue)) {
                        valueElement.innerHTML = `<strong>Array</strong> with ${parsedValue.length} items. First item:<pre>${JSON.stringify(parsedValue[0], null, 2)}</pre>`;
                    } else if (typeof parsedValue === 'object') {
                        const keys = Object.keys(parsedValue);
                        valueElement.innerHTML = `<strong>Object</strong> with keys: ${keys.join(', ')}`;
                    } else {
                        valueElement.innerText = value.substring(0, 100) + '...';
                    }
                }
            } catch (e) {
                // Not valid JSON, show as text
                valueElement.innerText = value.substring(0, 200) + (value.length > 200 ? '...' : '');
            }
            
            itemElement.appendChild(valueElement);
            
            // Add item actions
            const actionsElement = document.createElement('div');
            actionsElement.className = 'item-actions';
            
            const viewBtn = document.createElement('button');
            viewBtn.innerText = 'View in Console';
            viewBtn.style.backgroundColor = '#3399ff';
            viewBtn.onclick = () => {
                try {
                    console.log(`sessionStorage["${key}"]`, JSON.parse(value));
                } catch (e) {
                    console.log(`sessionStorage["${key}"]`, value);
                }
                alert(`Item "${key}" printed to console`);
            };
            actionsElement.appendChild(viewBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'Delete';
            deleteBtn.style.backgroundColor = '#ff3333';
            deleteBtn.onclick = () => {
                if (confirm(`Are you sure you want to delete "${key}"?`)) {
                    sessionStorage.removeItem(key);
                    updateSessionStorageTab();
                }
            };
            actionsElement.appendChild(deleteBtn);
            
            itemElement.appendChild(actionsElement);
            
            items.appendChild(itemElement);
        });
        
        tabContent.appendChild(items);
    }
    
    // Update the diagnostics tab
    function updateDiagnosticsTab() {
        const tabContent = document.getElementById('tab-diagnostics');
        if (!tabContent) return;
        
        tabContent.innerHTML = '';
        
        // Browser info
        const browserInfo = document.createElement('div');
        browserInfo.innerHTML = `
            <h4>Browser Information</h4>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
            <p><strong>Platform:</strong> ${navigator.platform}</p>
            <p><strong>Storage Limits:</strong></p>
            <ul>
                <li>localStorage size: ${estimateStorageSize('localStorage')} KB (based on current usage)</li>
                <li>sessionStorage size: ${estimateStorageSize('sessionStorage')} KB (based on current usage)</li>
                <li>Theoretical limit: ~5-10 MB (varies by browser)</li>
            </ul>
        `;
        tabContent.appendChild(browserInfo);
        
        // Check for storage errors and debug info
        const diagnosticData = document.createElement('div');
        diagnosticData.innerHTML = `<h4>Diagnostic Information</h4>`;
        
        // Check for emergency diagnostic info
        let emergencyDiagnostic = sessionStorage.getItem('emergency_diagnostic');
        let diagnosticHtml = '';
        
        if (emergencyDiagnostic) {
            try {
                const diagnostic = JSON.parse(emergencyDiagnostic);
                diagnosticHtml += `
                    <div class="success">✅ Emergency diagnostic information found</div>
                    <p><strong>Data ID:</strong> ${diagnostic.dataId || 'Unknown'}</p>
                    <p><strong>Target URL:</strong> ${diagnostic.targetUrl || 'Unknown'}</p>
                    <p><strong>Target Route:</strong> ${diagnostic.targetRoute || 'Unknown'}</p>
                    <p><strong>Target Tool:</strong> ${diagnostic.targetTool || 'Unknown'}</p>
                    <p><strong>Normalized Tool:</strong> ${diagnostic.normalizedTool || 'Unknown'}</p>
                    <p><strong>Timestamp:</strong> ${new Date(parseInt(diagnostic.timestamp || 0)).toLocaleString()}</p>
                `;
            } catch (e) {
                diagnosticHtml += `
                    <div class="error">❌ Error parsing emergency diagnostic: ${e.message}</div>
                    <p>Raw value: ${emergencyDiagnostic}</p>
                `;
            }
        } else {
            diagnosticHtml += `<div class="warning">⚠️ No emergency diagnostic information found</div>`;
        }
        
        // Check for framework navigation info
        let navigationInfo = sessionStorage.getItem('last_framework_navigation');
        if (navigationInfo) {
            try {
                const navigation = JSON.parse(navigationInfo);
                diagnosticHtml += `
                    <h4>Last Framework Navigation</h4>
                    <p><strong>Data ID:</strong> ${navigation.dataId || 'Unknown'}</p>
                    <p><strong>Target Tool:</strong> ${navigation.targetTool || 'Unknown'}</p>
                    <p><strong>Target Route:</strong> ${navigation.targetRoute || 'Unknown'}</p>
                    <p><strong>Timestamp:</strong> ${new Date(parseInt(navigation.timestamp || 0)).toLocaleString()}</p>
                    <p><strong>Full URL:</strong> ${navigation.fullUrl || 'Unknown'}</p>
                `;
            } catch (e) {
                diagnosticHtml += `
                    <div class="error">❌ Error parsing navigation info: ${e.message}</div>
                    <p>Raw value: ${navigationInfo}</p>
                `;
            }
        }
        
        // Add browser console logs section
        diagnosticHtml += `
            <h4>Testing Tools</h4>
            <button id="test-storage-limits" style="background-color: #3399ff;">Test Storage Limits</button>
            <button id="test-storage-persistence" style="background-color: #3399ff; margin-left: 5px;">Test Storage Persistence</button>
            <div id="test-results" style="margin-top: 10px; padding: 5px; background: #333; display: none;"></div>
        `;
        
        diagnosticData.innerHTML += diagnosticHtml;
        tabContent.appendChild(diagnosticData);
        
        // Add event listeners for test buttons
        document.getElementById('test-storage-limits').addEventListener('click', testStorageLimits);
        document.getElementById('test-storage-persistence').addEventListener('click', testStoragePersistence);
    }
    
    // Test browser storage limits
    function testStorageLimits() {
        const testResults = document.getElementById('test-results');
        testResults.style.display = 'block';
        testResults.innerHTML = 'Testing localStorage limits. This may take a moment...';
        
        setTimeout(() => {
            try {
                // Create test data of increasingly large sizes
                const testSizes = [10, 100, 500, 1000, 2000, 4000, 5000];
                const results = [];
                
                // Clean up any existing test data
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('storage_test_')) {
                        localStorage.removeItem(key);
                    }
                }
                
                // Test each size
                for (let i = 0; i < testSizes.length; i++) {
                    const sizeKB = testSizes[i];
                    const testString = 'A'.repeat(sizeKB * 1024); // Convert KB to bytes
                    const testKey = `storage_test_${sizeKB}kb`;
                    
                    try {
                        localStorage.setItem(testKey, testString);
                        results.push({
                            size: sizeKB,
                            success: true,
                            message: `Successfully stored ${sizeKB} KB`
                        });
                    } catch (e) {
                        results.push({
                            size: sizeKB,
                            success: false,
                            message: `Failed at ${sizeKB} KB: ${e.message}`
                        });
                        break; // Stop testing after first failure
                    }
                }
                
                // Clean up test data
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('storage_test_')) {
                        localStorage.removeItem(key);
                    }
                }
                
                // Display results
                let resultsHtml = '<h4>Storage Limit Test Results</h4>';
                
                resultsHtml += '<table style="width: 100%; border-collapse: collapse;">';
                resultsHtml += '<tr><th style="text-align: left; padding: 5px; border-bottom: 1px solid #555;">Size</th><th style="text-align: left; padding: 5px; border-bottom: 1px solid #555;">Result</th></tr>';
                
                results.forEach(result => {
                    resultsHtml += `
                        <tr>
                            <td style="padding: 5px; border-bottom: 1px solid #333;">${result.size} KB</td>
                            <td style="padding: 5px; border-bottom: 1px solid #333; color: ${result.success ? '#6f6' : '#f66'}">
                                ${result.success ? '✅ ' : '❌ '}${result.message}
                            </td>
                        </tr>
                    `;
                });
                
                resultsHtml += '</table>';
                
                // Maximum successful size
                const maxSuccessSize = results.filter(r => r.success).reduce((max, r) => Math.max(max, r.size), 0);
                resultsHtml += `<p style="margin-top: 10px;"><strong>Maximum tested storage size:</strong> ${maxSuccessSize} KB</p>`;
                
                testResults.innerHTML = resultsHtml;
            } catch (e) {
                testResults.innerHTML = `<p class="error">❌ Error testing storage limits: ${e.message}</p>`;
            }
        }, 100);
    }
    
    // Test browser storage persistence
    function testStoragePersistence() {
        const testResults = document.getElementById('test-results');
        testResults.style.display = 'block';
        
        // Create test data
        const testKey = 'storage_persistence_test';
        const testData = {
            message: 'This is a persistence test',
            timestamp: Date.now(),
            randomId: Math.random().toString(36).substring(2)
        };
        
        try {
            // Store in both storage types
            localStorage.setItem(testKey, JSON.stringify(testData));
            sessionStorage.setItem(testKey, JSON.stringify(testData));
            
            testResults.innerHTML = `
                <h4>Storage Persistence Test</h4>
                <p>Test data has been stored with key: <code>${testKey}</code></p>
                <p>To complete this test:</p>
                <ol>
                    <li>Note the random ID: <strong>${testData.randomId}</strong></li>
                    <li>Reload this page</li>
                    <li>Return to this debugger (run the debugger script again)</li>
                    <li>Check if the data is still present</li>
                </ol>
                <p>localStorage should persist after page reload, while sessionStorage should only persist during the same session.</p>
            `;
        } catch (e) {
            testResults.innerHTML = `<p class="error">❌ Error setting up persistence test: ${e.message}</p>`;
        }
    }
    
    // Helper function to estimate storage usage
    function estimateStorageSize(storageType) {
        let totalSize = 0;
        const storage = window[storageType];
        
        if (!storage) return 'N/A';
        
        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                const value = storage.getItem(key);
                totalSize += (key.length + value.length) * 2; // Approximate UTF-16 encoding (2 bytes per character)
            }
            
            return (totalSize / 1024).toFixed(2);
        } catch (e) {
            return 'Error';
        }
    }
    
    // Helper function to download JSON data
    function downloadJson(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.style.display = 'none';
        
        document.body.appendChild(exportLink);
        exportLink.click();
        document.body.removeChild(exportLink);
    }
    
    // Update the debug info initially
    updateDebugInfo();
    
    // Set up a timer to check for changes
    setInterval(updateDebugInfo, 5000);
}

// Run the debugger
debugStorage();

// Instructions on how to use
console.log("%c FireEMS.ai Storage Debugger Loaded (V2.1)", "background: #222; color: #bada55; font-size: 14px;");
console.log("%c This tool will help debug storage issues between the Data Formatter and other tools", "color: #3399ff");
console.log("%c Use it to investigate emergency mode data transfer issues", "color: #ff9966");

// Check for diagnostic info and display if available
setTimeout(() => {
  try {
    // Check for data transfer diagnostic
    const transferDiagnostic = sessionStorage.getItem('data_transfer_diagnostic');
    if (transferDiagnostic) {
      console.log("%c 📊 DATA TRANSFER DIAGNOSTIC ", "background: #9C27B0; color: white; font-size: 14px;");
      console.log(JSON.parse(transferDiagnostic));
    }
    
    // Check for formatter diagnostic
    const formatterDiagnostic = sessionStorage.getItem('formatter_diagnostic');
    if (formatterDiagnostic) {
      console.log("%c 📊 FORMATTER DIAGNOSTIC ", "background: #4CAF50; color: white; font-size: 14px;");
      console.log(JSON.parse(formatterDiagnostic));
    }
    
    // Add button to page to show the debugger if not already visible
    const debugButton = document.createElement('button');
    debugButton.style.cssText = "position: fixed; bottom: 10px; left: 10px; background: #333; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; z-index: 9999;";
    debugButton.innerText = "Show Storage Debug";
    debugButton.onclick = () => {
      if (document.getElementById('storage-debugger')) {
        document.getElementById('storage-debugger').style.display = 'block';
      } else {
        debugStorage();
      }
    };
    document.body.appendChild(debugButton);
  } catch (e) {
    console.error("Error checking diagnostics:", e);
  }
}, 1000);
console.log("%c FireEMS.ai Storage Debugger Loaded", "background: #222; color: #bada55; font-size: 14px;");
console.log("%c This tool will help debug storage issues between the Data Formatter and other tools", "color: #3399ff");
console.log("%c Use it to investigate emergency mode data transfer issues", "color: #ff9966");