async function uploadFile() {
    console.log("🚀 uploadFile() function triggered!");

    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const table = document.getElementById("dataTable");
    const headerRow = document.getElementById("headerRow");
    const tableBody = document.getElementById("tableBody");

    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
        console.log("📤 Sending file to /api/upload...");
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ File uploaded successfully:", data.filename);
            resultDiv.innerHTML = `<p style="color: green;">File uploaded successfully: ${data.filename}</p>`;

            // ✅ Populate Table
            table.style.display = "table";  // Show table
            headerRow.innerHTML = "";  // Clear old headers
            tableBody.innerHTML = "";  // Clear old data

            // Add column headers
            data.columns.forEach(col => {
                let th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });

            // Add row data
            data.rows.forEach(row => {
                let tr = document.createElement("tr");
                row.forEach(cell => {
                    let td = document.createElement("td");
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        } else {
            console.error("❌ Server error:", data.error);
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
    }
}

// ✅ Make function globally accessible
window.uploadFile = uploadFile;
