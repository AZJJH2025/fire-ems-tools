// Call Volume Forecaster - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let incidentData = null;
    let forecastData = null;
    let charts = {};
    let map = null;

    // DOM elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const forecastType = document.getElementById('forecastType');
    const forecastPeriod = document.getElementById('forecastPeriod');
    const modelType = document.getElementById('modelType');
    const confidenceInterval = document.getElementById('confidenceInterval');
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedParams = document.getElementById('advancedParams');
    const externalFactors = document.getElementById('externalFactors');
    const externalFactorsSection = document.getElementById('externalFactorsSection');
    const generateForecastBtn = document.getElementById('generateForecastBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportImageBtn = document.getElementById('exportImageBtn');
    const forecastSummary = document.getElementById('forecastSummary');
    const kpiCards = document.getElementById('kpiCards');
    const chartLoader = document.getElementById('chartLoader');
    const forecastTable = document.getElementById('forecastTable').getElementsByTagName('tbody')[0];

    // Initialize model descriptions
    const modelDescriptions = {
        'arima': 'ARIMA model is a statistical method for time series forecasting using autoregressive integrated moving averages.',
        'prophet': 'Prophet model is excellent for seasonal time series with multiple seasonality periods and holiday effects.',
        'ensemble': 'Ensemble model combines multiple forecasting models to improve prediction accuracy and reliability.',
        'ml': 'Machine Learning model uses historical patterns to predict future call volumes with advanced algorithms.'
    };

    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', () => fileInput.click());
    modelType.addEventListener('change', updateModelDescription);
    advancedToggle.addEventListener('click', toggleAdvancedParams);
    externalFactors.addEventListener('change', toggleExternalFactorsSection);
    generateForecastBtn.addEventListener('click', generateForecast);
    exportCsvBtn.addEventListener('click', () => exportData('csv'));
    exportExcelBtn.addEventListener('click', () => exportData('excel'));
    exportPdfBtn.addEventListener('click', () => exportData('pdf'));
    exportImageBtn.addEventListener('click', () => exportData('image'));

    // Initialize charts
    initializeCharts();
    initializeMap();

    // Functions

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        uploadStatus.textContent = 'Uploading...';
        uploadStatus.className = 'status-message loading';
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/api/call-volume-forecaster/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            incidentData = data;
            uploadStatus.textContent = 'Upload successful!';
            uploadStatus.className = 'status-message success';
            updateDataQualityIndicators(data.quality);
            console.log('Data uploaded successfully:', data);
        })
        .catch(error => {
            console.error('Error uploading data:', error);
            uploadStatus.textContent = 'Error uploading data. Please try again.';
            uploadStatus.className = 'status-message error';
        });
    }

    // Update data quality indicators
    function updateDataQualityIndicators(quality) {
        document.getElementById('timeRange').textContent = quality.timeRange;
        document.getElementById('recordCount').textContent = quality.recordCount.toLocaleString();
        document.getElementById('missingValues').textContent = quality.missingValues + '%';
        document.getElementById('qualityScore').textContent = quality.qualityScore + '/10';
    }

    // Update model description when selected model changes
    function updateModelDescription() {
        const selectedModel = modelType.value;
        document.getElementById('modelDescription').textContent = modelDescriptions[selectedModel];
    }

    // Toggle advanced parameters section
    function toggleAdvancedParams() {
        if (advancedParams.style.display === 'none') {
            advancedParams.style.display = 'block';
            advancedToggle.innerHTML = '<i class="fas fa-minus"></i> Hide Advanced Parameters';
        } else {
            advancedParams.style.display = 'none';
            advancedToggle.innerHTML = '<i class="fas fa-cog"></i> Advanced Parameters';
        }
    }

    // Toggle external factors section
    function toggleExternalFactorsSection() {
        externalFactorsSection.style.display = externalFactors.checked ? 'block' : 'none';
    }

    // Generate forecast
    function generateForecast() {
        if (!incidentData) {
            alert('Please upload incident data first.');
            return;
        }

        // Show loading indicator
        chartLoader.style.display = 'flex';
        
        // Get selected parameters
        const params = {
            forecastType: forecastType.value,
            forecastPeriod: forecastPeriod.value,
            modelType: modelType.value,
            confidenceInterval: confidenceInterval.value,
            holidayEffects: document.getElementById('holidayEffects')?.checked || false,
            changepoints: document.getElementById('changepoints')?.checked || false,
            externalFactors: getExternalFactors()
        };
        
        // Get selected seasonal periods if advanced params section is visible
        if (advancedParams.style.display !== 'none') {
            const seasonalSelect = document.getElementById('seasonalPeriods');
            params.seasonalPeriods = Array.from(seasonalSelect.selectedOptions).map(option => option.value);
        }
        
        // Make API request to generate forecast
        fetch('/api/call-volume-forecaster/forecast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            forecastData = data;
            console.log('Forecast generated successfully:', data);
            
            // Update UI with forecast data
            updateForecastSummary(data);
            updateCharts(data);
            updateForecastTable(data);
            updateMap(data);
            
            // Enable export buttons
            enableExportButtons();
            
            // Hide loading indicator
            chartLoader.style.display = 'none';
        })
        .catch(error => {
            console.error('Error generating forecast:', error);
            alert('Error generating forecast. Please try again.');
            
            // Hide loading indicator
            chartLoader.style.display = 'none';
        });
    }
    
    // Get selected external factors
    function getExternalFactors() {
        if (!externalFactors.checked) return [];
        
        const checkboxes = document.getElementsByName('externalFactor');
        return Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    }
    
    // Update forecast summary
    function updateForecastSummary(data) {
        // Hide empty state and show KPI cards
        forecastSummary.innerHTML = '';
        kpiCards.style.display = 'grid';
        
        // Update KPI values
        document.getElementById('peakMonth').textContent = data.summary.peakMonth;
        document.getElementById('lowestMonth').textContent = data.summary.lowestMonth;
        document.getElementById('annualTrend').textContent = data.summary.annualTrend;
        document.getElementById('forecastAccuracy').textContent = data.summary.accuracy + '%';
        
        // Update trends
        const peakTrend = document.getElementById('peakMonth').nextElementSibling;
        peakTrend.innerHTML = `<i class="fas fa-arrow-${data.summary.peakTrendDirection}"></i> <span>${data.summary.peakTrendPercent}%</span>`;
        peakTrend.className = `kpi-trend ${data.summary.peakTrendDirection === 'up' ? 'positive' : 'negative'}`;
        
        const lowestTrend = document.getElementById('lowestMonth').nextElementSibling;
        lowestTrend.innerHTML = `<i class="fas fa-arrow-${data.summary.lowestTrendDirection}"></i> <span>${data.summary.lowestTrendPercent}%</span>`;
        lowestTrend.className = `kpi-trend ${data.summary.lowestTrendDirection === 'up' ? 'positive' : 'negative'}`;
        
        const annualTrendEl = document.getElementById('annualTrend').nextElementSibling;
        annualTrendEl.innerHTML = `<i class="fas fa-arrow-${data.summary.annualTrendDirection}"></i> <span>${data.summary.annualTrendDirection === 'up' ? 'Increasing' : 'Decreasing'}</span>`;
        annualTrendEl.className = `kpi-trend ${data.summary.annualTrendDirection === 'up' ? 'positive' : 'negative'}`;
    }
    
    // Update forecast table
    function updateForecastTable(data) {
        // Clear existing rows
        forecastTable.innerHTML = '';
        
        // Add new rows
        data.forecast.forEach(item => {
            const row = forecastTable.insertRow();
            
            const periodCell = row.insertCell(0);
            periodCell.textContent = item.period;
            
            const predictedCell = row.insertCell(1);
            predictedCell.textContent = item.predicted.toLocaleString();
            
            const lowerCell = row.insertCell(2);
            lowerCell.textContent = item.lowerBound.toLocaleString();
            
            const upperCell = row.insertCell(3);
            upperCell.textContent = item.upperBound.toLocaleString();
            
            const yoyCell = row.insertCell(4);
            const yoyValue = item.yearOverYear;
            yoyCell.textContent = yoyValue > 0 ? `+${yoyValue}%` : `${yoyValue}%`;
            yoyCell.style.color = yoyValue >= 0 ? '#27ae60' : '#e74c3c';
        });
    }
    
    // Enable export buttons
    function enableExportButtons() {
        exportCsvBtn.disabled = false;
        exportExcelBtn.disabled = false;
        exportPdfBtn.disabled = false;
        exportImageBtn.disabled = false;
    }
    
    // Export data
    function exportData(format) {
        if (!forecastData) {
            alert('No forecast data available to export.');
            return;
        }
        
        fetch(`/api/call-volume-forecaster/export/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ forecastData })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            if (format === 'csv' || format === 'excel' || format === 'pdf') {
                return response.blob();
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (format === 'csv' || format === 'excel' || format === 'pdf') {
                const fileExtension = format === 'excel' ? 'xlsx' : format;
                const fileName = `call_volume_forecast.${fileExtension}`;
                
                // Create download link
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                // Handle image export (data will be a URL)
                const a = document.createElement('a');
                a.href = data.imageUrl;
                a.download = 'call_volume_forecast.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        })
        .catch(error => {
            console.error(`Error exporting data as ${format}:`, error);
            alert(`Error exporting data. Please try again.`);
        });
    }
    
    // Initialize Charts
    function initializeCharts() {
        // Main forecast chart
        const forecastCtx = document.getElementById('forecastChart').getContext('2d');
        charts.forecast = new Chart(forecastCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Historical',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }, {
                    label: 'Forecast',
                    data: [],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Upper Bound',
                    data: [],
                    borderColor: 'rgba(231, 76, 60, 0.5)',
                    backgroundColor: 'rgba(231, 76, 60, 0)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: '+1'
                }, {
                    label: 'Lower Bound',
                    data: [],
                    borderColor: 'rgba(231, 76, 60, 0.5)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Call Volume Forecast'
                    },
                    tooltip: {
                        enabled: true
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time Period'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Call Volume'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Seasonal patterns chart
        const seasonalCtx = document.getElementById('seasonalChart').getContext('2d');
        charts.seasonal = new Chart(seasonalCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Pattern',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
        
        // Day of week patterns chart
        const dowCtx = document.getElementById('dowChart').getContext('2d');
        charts.dow = new Chart(dowCtx, {
            type: 'bar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Average Calls',
                    data: [],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.6)',
                        'rgba(46, 204, 113, 0.6)',
                        'rgba(155, 89, 182, 0.6)',
                        'rgba(52, 73, 94, 0.6)',
                        'rgba(241, 196, 15, 0.6)',
                        'rgba(230, 126, 34, 0.6)',
                        'rgba(231, 76, 60, 0.6)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(52, 73, 94, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(230, 126, 34, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Call type distribution chart
        const typeCtx = document.getElementById('typeChart').getContext('2d');
        charts.type = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.6)',
                        'rgba(46, 204, 113, 0.6)',
                        'rgba(155, 89, 182, 0.6)',
                        'rgba(52, 73, 94, 0.6)',
                        'rgba(241, 196, 15, 0.6)',
                        'rgba(230, 126, 34, 0.6)',
                        'rgba(231, 76, 60, 0.6)',
                        'rgba(149, 165, 166, 0.6)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(52, 73, 94, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(230, 126, 34, 1)',
                        'rgba(231, 76, 60, 1)',
                        'rgba(149, 165, 166, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
    
    // Update charts with forecast data
    function updateCharts(data) {
        // Update main forecast chart
        charts.forecast.data.labels = [...data.historicalDates, ...data.forecastDates];
        charts.forecast.data.datasets[0].data = [...data.historicalValues, ...Array(data.forecastValues.length).fill(null)];
        charts.forecast.data.datasets[1].data = [...Array(data.historicalValues.length).fill(null), ...data.forecastValues];
        charts.forecast.data.datasets[2].data = [...Array(data.historicalValues.length).fill(null), ...data.upperBound];
        charts.forecast.data.datasets[3].data = [...Array(data.historicalValues.length).fill(null), ...data.lowerBound];
        charts.forecast.update();
        
        // Update seasonal pattern chart
        charts.seasonal.data.datasets[0].data = data.seasonalPattern;
        charts.seasonal.update();
        
        // Update day of week pattern chart
        charts.dow.data.datasets[0].data = data.dowPattern;
        charts.dow.update();
        
        // Update call type distribution chart
        charts.type.data.labels = data.callTypes.map(type => type.name);
        charts.type.data.datasets[0].data = data.callTypes.map(type => type.value);
        charts.type.update();
    }
    
    // Initialize map
    function initializeMap() {
        // Create the map
        map = L.map('geoMap').setView([33.4484, -112.0740], 10); // Phoenix, AZ as default
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
    
    // Update map with forecast data
    function updateMap(data) {
        // Clear existing layers except the base layer
        map.eachLayer(layer => {
            if (!layer._url) {
                map.removeLayer(layer);
            }
        });
        
        // Add heatmap layer if data includes geographic distribution
        if (data.geographicDistribution && data.geographicDistribution.length > 0) {
            // Get center of points to recenter map
            const avgLat = data.geographicDistribution.reduce((sum, point) => sum + point.lat, 0) / data.geographicDistribution.length;
            const avgLng = data.geographicDistribution.reduce((sum, point) => sum + point.lng, 0) / data.geographicDistribution.length;
            
            // Recenter map on points
            map.setView([avgLat, avgLng], 11);
            
            // Create heatmap points
            const heatPoints = data.geographicDistribution.map(point => {
                return [point.lat, point.lng, point.intensity];
            });
            
            // Add heatmap layer
            L.heatLayer(heatPoints, {
                radius: 15,
                blur: 25,
                maxZoom: 17,
                max: Math.max(...data.geographicDistribution.map(point => point.intensity)),
                gradient: {
                    0.0: '#3498db',
                    0.3: '#2ecc71',
                    0.5: '#f1c40f',
                    0.7: '#e67e22',
                    1.0: '#e74c3c'
                }
            }).addTo(map);
        }
    }
});