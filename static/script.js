function uploadFile() {
    let fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("🚨 No file selected! Please choose a file.");
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);

    let result = document.getElementById("result");
    let loading = document.getElementById("loading");

    result.innerHTML = ""; // Clear previous result
    loading.style.display = "block"; // Show loading indicator

    fetch("/api/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loading.style.display = "none"; // Hide loading indicator

        if (data.error) {
            result.innerHTML = `<p style="color:red;">🚨 Upload error: ${data.error}</p>`;
            return;
        }

        displayTable(data);
    })
    .catch(error => {
        loading.style.display = "none";
        console.error("🚨 Error:", error);
        result.innerHTML = `<p style="color:red;">🚨 Error uploading file</p>`;
    });
}

function displayTable(data) {
    let result = document.getElementById("result");
    result.innerHTML = ""; // Clear previous results

    let table = document.createElement("table");
    let headerRow = document.createElement("tr");

    // Add table headers
    data.columns.forEach(col => {
        let th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add table rows
    data.rows.forEach(row => {
        let tr = document.createElement("tr");
        data.columns.forEach(col => {
            let td = document.createElement("td");
            td.textContent = row[col] || "N/A"; // Handle missing values
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    result.appendChild(table);
}
