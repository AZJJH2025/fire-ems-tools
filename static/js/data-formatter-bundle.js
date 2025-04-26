// Fire EMS Data Formatter Bundle
console.log("✅ data-formatter-bundle.js loaded successfully");

// Add data formatting functionality here
const dataFormatter = {
  formatCSV: function(csvData) {
    console.log("Formatting CSV data...");
    return csvData;
  },
  
  formatExcel: function(excelData) {
    console.log("Formatting Excel data...");
    return excelData;
  }
};

// Make available globally
window.dataFormatter = dataFormatter;