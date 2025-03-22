// Basic script to test functionality
console.log("Script loaded successfully!");

// Simple test function for upload button
function uploadFile() {
    console.log("Upload button clicked!");
    
    // Get DOM elements
    const fileInput = document.getElementById('fileInput');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const dashboardDiv = document.getElementById('dashboard');
    
    // Check if file is selected
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }
    
    // Show loading
    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';
    
    // Mock API call (to test without actual server)
    setTimeout(() => {
        // Hide loading
        loadingDiv.style.display = 'none';
        
        // Show result
        resultDiv.innerHTML = '<p style="color: green;">File processed successfully!</p>';
        
        // Show dashboard with test content
        dashboardDiv.style.display = 'block';
        
        // Add test content to each panel
        document.getElementById('incident-map').innerHTML = '<div style="padding: 20px; background-color: #f0f0f0; height: 200px;">Map would display here</div>';
        
        document.getElementById('time-chart').innerHTML = '<div style="padding: 20px; background-color: #f0f0f0; height: 200px;">Time chart would display here</div>';
        
        document.getElementById('unit-chart').parentNode.innerHTML = '<div style="padding: 20px; background-color: #f0f0f0; height: 200px;">Unit chart would display here</div>';
        
        document.getElementById('location-chart').parentNode.innerHTML = '<div style="padding: 20px; background-color: #f0f0f0; height: 200px;">Location chart would display here</div>';
        
        document.getElementById('data-table').innerHTML = `
            <table border="1" style="width: 100%;">
                <tr>
                    <th>Run No</th>
                    <th>Date</th>
                    <th>Unit</th>
                </tr>
                <tr>
                    <td>123456</td>
                    <td>2023-01-01</td>
                    <td>Unit A</td>
                </tr>
                <tr>
                    <td>123457</td>
                    <td>2023-01-02</td>
                    <td>Unit B</td>
                </tr>
            </table>
        `;
    }, 1500); // 1.5 seconds delay to simulate processing
}

// Make function accessible
window.uploadFile = uploadFile;
