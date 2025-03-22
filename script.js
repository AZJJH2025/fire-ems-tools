// ✅ Debugging log to confirm the script is loading
console.log("✅ script.js is loaded!");

// ✅ Upload function
async function uploadFile() {
    console.log("🚀 uploadFile() function triggered!");

    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");

    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }

    const file = fileInput.files[0];

    // Validate file type
    const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type)) {
        resultDiv.innerHTML = '<p style="color: red;">Invalid file type. Only CSV & Excel allowed.</p>';
        return;
    }

    // Show loading message
    resultDiv.innerHTML = '<p>Uploading file... please wait.</p>';

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Upload successful:", data);

            // Display summary info
            resultDiv.innerHTML = `
                <p style="color: green;">File uploaded successfully: ${data.filename}</p>
                <p><strong>Rows:</strong> ${data.row_count}</p>
                <p><strong>Columns:</strong> ${data.columns.length}</p>
                <p><strong>Column Names:</strong> ${data.columns.join(", ")}</p>
                <p><strong>First Reported Date:</strong> ${data.first_reported_date}</p>
            `;

            // Build data table
            const table = document.createElement("table");
            const headerRow = document.createElement("tr");

            data.columns.forEach(col => {
                const th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            data.rows.forEach(row => {
                const tr = document.createElement("tr");
                data.columns.forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = row[col];
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });

            resultDiv.appendChild(table);

        } else {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
            console.error("❌ Upload failed:", data.error);
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
        console.error("❌ Upload error:", error);
    }
}

// ✅ Make uploadFile accessible to the global scope
window.uploadFile = uploadFile;
