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

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        let data = await response.json();
        console.log("Server Response:", data);

        document.getElementById("result").innerHTML = `
            <p><strong>Server Response:</strong> ${data.message}</p>
            <p><strong>Uploaded File:</strong> ${data.filename}</p>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("result").innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}