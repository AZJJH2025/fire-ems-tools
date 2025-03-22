// Define the uploadFile function to handle file uploads
function uploadFile() {
    // Get the file input element and verify a file is selected
    const fileInput = document.getElementById("fileInput");
    if (!fileInput || fileInput.files.length === 0) {
        console.error("No file selected.");
        alert("Please select a file to upload.");
        return;
    }
    
    // Show a loading message
    const loadingDiv = document.getElementById("loading");
    loadingDiv.style.display = "block";

    // Create a FormData object and append the selected file
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    // Make a POST request to the /api/upload endpoint
    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log("File uploaded and processed:", data);
        // Hide the loading message
        loadingDiv.style.display = "none";

        // Check if the API returned an error
        if (data.error) {
            alert("Error: " + data.error);
            return;
        }
        
        // Process the response data, e.g., update the UI with the results.
        // For example, render the data table:
        const resultDiv = document.getElementById("result");
        renderDataTable(data, resultDiv);
        
        // Optionally, display the dashboard if data processing is successful.
        const dashboard = document.getElementById("dashboard");
        dashboard.style.display = "block";
    })
    .catch(error => {
        console.error("Upload error:", error);
        loadingDiv.style.display = "none";
        alert("An error occurred during file upload.");
    });
}

// Function to render table from API data
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");
    
    // Create table element
    const table = document.createElement("table");
    table.classList.add("data-table");

    // Create header row
    const headerRow = document.createElement("tr");
    
    // Add column headers
    if (data.columns && Array.isArray(data.columns) && data.columns.length > 0) {
        data.columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    } else {
        console.warn("⚠️ No columns found in API response");
        container.innerHTML = '<p class="error-message">No column data available</p>';
        return;
    }
    
    // Add data rows
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Handle data as array of objects (your API format)
        data.data.forEach(row => {
            const tr = document.createElement("tr");
            
            data.columns.forEach(column => {
                const td = document.createElement("td");
                td.textContent = row[column] !== undefined && row[column] !== null 
                    ? row[column] 
                    : '';
                tr.appendChild(td);
            });
            
            table.appendChild(tr);
        });
    } else {
        console.error("❌ No data property found in API response");
        container.innerHTML = '<p class="error-message">No data available</p>';
        return;
    }
    
    // Clear container and add table
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// Make uploadFile globally accessible
window.uploadFile = uploadFile;
