function uploadFile() {
    let input = document.getElementById('fileInput');
    let file = input.files[0];

    if (file) {
        document.getElementById("result").innerText = "Uploaded: " + file.name;
    } else {
        document.getElementById("result").innerText = "Please select a file first.";
    }
}