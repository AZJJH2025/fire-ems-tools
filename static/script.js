async function uploadFile() {
    console.log("🚀 Upload started!");

    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }

    const file = fileInput.files[0];

    // Show loading message
    resultDiv.innerHTML = '<p>Uploading file... please wait.</p>';

    try {
        console.log("📤 Sending file to /api/upload...");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ File uploaded successfully:", data);

            // ✅ Display results
            resultDiv.innerHTML = `
                <p style="color: green;">File uploaded successfully: ${data.filename}</p>
                <p><strong>Rows:</strong> ${data.num_rows}</p>
                <p><strong>Columns:</strong> ${data.num_columns}</p>
                <p><strong>Column Names:</strong> ${data.column_names.join(", ")}</p>
                <p><strong>First Reported Date:</strong> ${data.first_reported_date}</p>
            `;
        } else {
            console.error("❌ Server error:", data.error);
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        }
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
    }
}
