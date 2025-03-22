},
                subtitle: {
                    display: true,
                    text: `Avg: ${averageResponseTime} min | Median: ${median} min | 90th %: ${p90} min`,
                    position: 'bottom',
                    font: {
                        size: 12
                    },
                    padding: {
                        top: 10,
                        bottom: 0
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to render table from API data
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");
    
    // Create table element
    const table = document.createElement("table");
    
    // Create header row
    const headerRow = document.createElement("tr");
    
    // Add column headers
    if (data.columns && Array.isArray(data.columns)) {
        data.columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    } else {
        console.warn("⚠️ No columns found in API response");
        container.innerHTML = '<p class="error-message">No column data available</p>';
        return;
    }
    
    // Add data rows
    if (data.data && Array.isArray(data.data)) {
        // Handle data as array of objects (your API format)
        data.data.forEach(row => {
            const tr = document.createElement("tr");
            
            data.columns.forEach(column => {
                const td = document.createElement("td");
                td.textContent = row[column] !== undefined && row[column] !== null 
                    ? row[column] 
                    : '';
                tr.appendChild(td);
            });
            
            table.appendChild(tr);
        });
    } else {
        console.error("❌ No data property found in API response");
        container.innerHTML = '<p class="error-message">No data available</p>';
        return;
    }
    
    // Clear container and add table
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// Make uploadFile globally accessible
window.uploadFile = uploadFile;
