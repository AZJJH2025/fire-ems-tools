async function uploadFile() {
    let input = document.getElementById("fileInput");
    let file = input.files[0];

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    try {
        let response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        let data = await response.json();

        if (data.error) {
            document.getElementById("result").innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
            return;
        }

        let resultHTML = `<p><strong>File uploaded successfully:</strong> ${data.filename}</p>`;
        resultHTML += `<p><strong>Rows:</strong> ${data.rows}</p>`;

        // ✅ Ensure `data.columns` is an array before using .forEach
        if (Array.isArray(data.columns)) {
            resultHTML += `<p><strong>Columns:</strong> ${data.columns.length}</p>`;
            resultHTML += `<p><strong>Column Names:</strong> ${data.columns.join(", ")}</p>`;
        } else {
            resultHTML += `<p style="color:red;">Error: Columns data is missing</p>`;
        }

        document.getElementById("result").innerHTML = resultHTML;
    } catch (error) {
        document.getElementById("result").innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}
