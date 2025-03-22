// ✅ script.js is loaded!
console.log("✅ script.js is loaded!");

// ✅ Upload function
async function uploadFile() {
    console.log("🚀 uploadFile() function triggered!");  // Debugging log
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading') || resultDiv; // Fallback if no loading div
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    const validTypes = ["text/csv", "application/vnd.ms-excel", 
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type)) {
        resultDiv.innerHTML = '<p style="color: red;">Invalid file type. Only CSV & Excel allowed.</p>';
        return;
    }
    
    // Show loading message
    if (loadingDiv !== resultDiv) {
        loadingDiv.style.display = 'block';
    }
    resultDiv.innerHTML = '<p>Uploading file... please wait.</p>';
    
    try {
        console.log("📤 Sending file to /api/upload...");  // Debugging log
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        // Hide loading
        if (loadingDiv !== resultDiv) {
            loadingDiv.style.display = 'none';
        }
        
        if (!response.ok) {
            console.error("❌ Server error:", data.error);
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error || response.statusText}</p>`;
            return;
        }
        
        console.log("✅ File uploaded successfully:", data.filename);
        console.log("📊 Data received:", data);
        
        // Success message with file info
        resultDiv.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p style="color: green;">File uploaded successfully: ${data.filename}</p>
                <p>Rows: ${data.rows || data.data.length}</p>
                <p>First reported date: ${data.first_reported_date || 'N/A'}</p>
            </div>
        `;
        
        // Create and render the table
        renderTable(data, resultDiv);
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
        if (loadingDiv !== resultDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

// Function to render table from API data
function renderTable(data, container) {
    console.log("🔨 Rendering table with data:", data);
    
    // Create table element
    const table = document.createElement("table");
    table.className = "data-table";
    
    // Create header row
    const headerRow = document.createElement("tr");
    
    // Add column headers
    if (data.columns && Array.isArray(data.columns)) {
        data.columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });
    } else {
        console.warn("⚠️ No columns found in API response");
        // If no columns, try to get them from first data row
        if (data.data && data.data.length > 0) {
            Object.keys(data.data[0]).forEach(key => {
                const th = document.createElement("th");
                th.textContent = key;
                headerRow.appendChild(th);
            });
        }
    }
    
    table.appendChild(headerRow);
    
    // Add data rows
    if (data.data && Array.isArray(data.data)) {
        // If data is array of objects
        data.data.forEach(row => {
            const tr = document.createElement("tr");
            
            // Check if row is an object or array
            if (Array.isArray(row)) {
                // Handle array rows
                row.forEach(cell => {
                    const td = document.createElement("td");
                    td.textContent = cell !== null ? cell : '';
                    tr.appendChild(td);
                });
            } else {
                // Handle object rows
                data.columns.forEach(column => {
                    const td = document.createElement("td");
                    td.textContent = row[column] !== null ? row[column] : '';
                    tr.appendChild(td);
                });
            }
            
            table.appendChild(tr);
        });
    } else if (data.rows && Array.isArray(data.rows)) {
        // Alternative: if data is in rows property
        data.rows.forEach(row => {
            const tr = document.createElement("tr");
            
            // Check if row is an object or array
            if (Array.isArray(row)) {
                row.forEach(cell => {
                    const td = document.createElement("td");
                    td.textContent = cell !== null ? cell : '';
                    tr.appendChild(td);
                });
            } else {
                data.columns.forEach(column => {
                    const td = document.createElement("td");
                    td.textContent = row[column] !== null ? row[column] : '';
                    tr.appendChild(td);
                });
            }
            
            table.appendChild(tr);
        });
    } else {
        console.error("❌ No data property found in API response");
        container.innerHTML += '<p style="color: red;">Error: Unable to render table. Invalid data format.</p>';
        return;
    }
    
    // Add table to container
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// Set up event listener when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM loaded, setting up event listeners...");
    
    // Check if upload button exists
    const uploadButton = document.getElementById('uploadButton');
    if (uploadButton) {
        uploadButton.addEventListener('click', uploadFile);
        console.log("🔗 Event listener attached to upload button");
    } else {
        console.warn("⚠️ Upload button not found in the DOM");
    }
    
    // Alternative: Set up form submit event if it exists
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            uploadFile();
        });
        console.log("🔗 Event listener attached to upload form");
    }
});

// Make function globally accessible
window.uploadFile = uploadFile;
