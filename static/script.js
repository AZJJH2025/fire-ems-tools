function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const result = document.getElementById("result");
    const file = fileInput.files[0];

    if (!file) {
        result.innerHTML = `<p style="color:red;">No file selected.</p>`;
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    result.innerHTML = "⏳ Uploading and analyzing...";

    fetch("/api/upload", {
        method: "POST",
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            result.innerHTML = `<p style="color:red;">Upload error: ${data.error}</p>`;
            return;
        }

        result.innerHTML = `
            <div style="background:#eee;padding:10px;">
                <p><strong>File uploaded successfully:</strong> ${data.filename}</p>
                <p><strong>Rows:</strong> ${data.rows.length}</p>
                <p><strong>Columns:</strong> ${data.columns.length}</p>
                <p><strong>Column Names:</strong> ${data.columns.join(", ")}</p>
                <p><strong>First Reported Date:</strong> ${data.first_reported_date || "N/A"}</p>
            </div>
        `;

        // Optional: Build a table
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        data.columns.forEach((col) => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        data.rows.forEach((row) => {
            const tr = document.createElement("tr");
            row.forEach((cell) => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        result.appendChild(table);
    })
    .catch((error) => {
        console.error("Upload failed:", error);
        result.innerHTML = `<p style="color:red;">Upload failed. ${error.message}</p>`;
    });
}
