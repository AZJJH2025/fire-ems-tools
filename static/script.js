document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let formData = new FormData();
    let fileInput = document.getElementById("file");
    formData.append("file", fileInput.files[0]);

    let result = document.getElementById("result");
    result.innerHTML = "<p>Uploading file...</p>"; // Display loading message

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            result.innerHTML = `<p style="color:red;">Upload error: ${data.error}</p>`;
            return;
        }

        let table = document.createElement("table");
        let headerRow = document.createElement("tr");

        // Generate table headers
        data.columns.forEach(col => {
            let th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Use `data.rows` (backend changed to return `rows`)
        data.rows.forEach(row => {
            let tr = document.createElement("tr");
            data.columns.forEach(col => {
                let td = document.createElement("td");
                td.textContent = row[col]; // Retrieve value using column name
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        result.innerHTML = `<p><strong>File uploaded successfully:</strong> ${data.filename}</p>`;
        result.appendChild(table);
    })
    .catch(error => {
        result.innerHTML = `<p style="color:red;">Error: ${error}</p>`;
    });
});
