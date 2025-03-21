document.getElementById("uploadForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let formData = new FormData();
    let fileInput = document.getElementById("file");
    let result = document.getElementById("result");

    if (fileInput.files.length === 0) {
        result.innerHTML = `<p style="color:red;">Error: No file selected</p>`;
        return;
    }

    formData.append("file", fileInput.files[0]);

    // Show loading message
    result.innerHTML = "<p>Uploading file, please wait...</p>";

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

            let table = document.createElement("table");
            let headerRow = document.createElement("tr");

            // Generate table headers
            data.columns.forEach((col) => {
                let th = document.createElement("th");
                th.textContent = col;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Fix: Use `data.data` instead of `data.rows`
            data.data.forEach((row) => {
                let tr = document.createElement("tr");
                data.columns.forEach((col) => {
                    let td = document.createElement("td");
                    td.textContent = row[col] || ""; // Handle missing values
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });

            result.innerHTML = ""; // Clear previous messages
            result.appendChild(table);
        })
        .catch((error) => {
            console.error("Error:", error);
            result.innerHTML = `<p style="color:red;">Upload error: ${error.message}</p>`;
        });
});
