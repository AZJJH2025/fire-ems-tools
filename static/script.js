// --- Chart.js Configuration Snippet ---
// Ensure this snippet is part of a larger chart configuration.
// For example:
//
// const chartConfig = {
//     type: 'bar',
//     data: { /* your data here */ },
//     options: {
//         plugins: {
//             title: { display: true, text: "Your Chart Title" },
//             subtitle: {
//                 display: true,
//                 text: `Avg: ${averageResponseTime} min | Median: ${median} min | 90th %: ${p90} min`,
//                 position: 'bottom',
//                 font: { size: 12 },
//                 padding: { top: 10, bottom: 0 }
//             }
//         },
//         responsive: true,
//         maintainAspectRatio: false
//     }
// };
// new Chart(ctx, chartConfig);

// --- Table Rendering Function ---
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");

    // Validate that columns are provided and non-empty
    if (!data.columns || !Array.isArray(data.columns) || data.columns.length === 0) {
        console.warn("⚠️ No valid columns found in API response");
        container.innerHTML = '<p class="error-message">No column data available</p>';
        return;
    }

    // Create table element and optionally add a CSS class for styling
    const table = document.createElement("table");
    table.classList.add("data-table");

    // Create and append the header row
    const headerRow = document.createElement("tr");
    data.columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Validate that data rows are provided and non-empty
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.error("❌ No valid data rows found in API response");
        container.innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Create table rows for each data object
    data.data.forEach(row => {
        const tr = document.createElement("tr");
        data.columns.forEach(column => {
            const td = document.createElement("td");
            td.textContent = (row[column] !== undefined && row[column] !== null) ? row[column] : '';
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    // Clear any existing content and append the newly created table
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// --- Expose uploadFile Globally ---
// Ensure that uploadFile is defined somewhere in your script before this line.
if (typeof uploadFile === "function") {
    window.uploadFile = uploadFile;
} else {
    console.error("uploadFile function is not defined.");
}
