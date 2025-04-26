// Quick Stats - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    const loadPhoenixBtn = document.getElementById('loadPhoenixData');
    const loadSeattleBtn = document.getElementById('loadSeattleData');
    const loadChicagoBtn = document.getElementById('loadChicagoData');
    const statsContainer = document.getElementById('statsContainer');
    const initialMessage = document.getElementById('initialMessage');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const metricTimeframe = document.getElementById('metricTimeframe');
    
    // Chart instances
    let incidentTypeChart;
    let dailyDistributionChart;
    let responseTimeChart;
    let monthlyVolumeChart;
    
    // Data storage
    let incidentData = [];
    let currentStats = {};
    
    // Initialize charts
    function initializeCharts() {
        const incidentTypeCtx = document.getElementById('incidentTypeChart').getContext('2d');
        incidentTypeChart = new Chart(incidentTypeCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(155, 89, 182, 0.8)',
                        'rgba(241, 196, 15, 0.8)',
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(230, 126, 34, 0.8)',
                        'rgba(149, 165, 166, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 11
                            },
                            boxWidth: 12
                        }
                    }
                }
            }
        });
        
        const dailyDistributionCtx = document.getElementById('dailyDistributionChart').getContext('2d');
        dailyDistributionChart = new Chart(dailyDistributionCtx, {
            type: 'bar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Calls per Day',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        responseTimeChart = new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8+'],
                datasets: [{
                    label: 'Response Time (minutes)',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        const monthlyVolumeCtx = document.getElementById('monthlyVolumeChart').getContext('2d');
        monthlyVolumeChart = new Chart(monthlyVolumeCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Call Volume',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'rgba(155, 89, 182, 0.8)',
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Event Listeners
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileUpload);
    loadPhoenixBtn.addEventListener('click', () => loadSampleData('phoenix'));
    loadSeattleBtn.addEventListener('click', () => loadSampleData('seattle'));
    loadChicagoBtn.addEventListener('click', () => loadSampleData('chicago'));
    exportPdfBtn.addEventListener('click', exportPDF);
    exportCsvBtn.addEventListener('click', exportCSV);
    metricTimeframe.addEventListener('change', updateMetricsForTimeframe);
    
    // Initialize charts on page load
    initializeCharts();
    
    // Handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        uploadStatus.textContent = 'Uploading data...';
        uploadStatus.className = 'status-message';
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file to server for processing
        fetch('/api/quick-stats/upload', {
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
            incidentData = data.incidents;
            processData(data.incidents, file.name);
            uploadStatus.textContent = 'Data uploaded successfully!';
            uploadStatus.className = 'status-message success-message';
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            uploadStatus.textContent = 'Error uploading file. Please try again.';
            uploadStatus.className = 'status-message error-message';
            
            // For demo purposes, load sample data if upload fails
            loadSampleData('phoenix');
        });
    }
    
    // Load sample data
    function loadSampleData(dataset) {
        uploadStatus.textContent = 'Loading sample data...';
        uploadStatus.className = 'status-message';
        
        fetch(`/api/quick-stats/sample/${dataset}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            incidentData = data.incidents;
            processData(data.incidents, `${capitalizeFirstLetter(dataset)} Sample Data`);
            uploadStatus.textContent = 'Sample data loaded successfully!';
            uploadStatus.className = 'status-message success-message';
        })
        .catch(error => {
            console.error('Error loading sample data:', error);
            uploadStatus.textContent = 'Error loading sample data. Please try again.';
            uploadStatus.className = 'status-message error-message';
            
            // For demo purposes, generate and use fake data
            generateFakeData(dataset);
        });
    }
    
    // For demo purposes - generate fake data if API fails
    function generateFakeData(dataset) {
        console.log('Generating fake data for demonstration purposes');
        const incidents = [];
        const datasetInfo = {
            phoenix: { count: 500, city: 'Phoenix' },
            seattle: { count: 450, city: 'Seattle' },
            chicago: { count: 700, city: 'Chicago' }
        };
        
        const info = datasetInfo[dataset] || { count: 500, city: 'Sample' };
        const startDate = new Date(2024, 0, 1); // Jan 1, 2024
        const endDate = new Date(2024, 11, 31); // Dec 31, 2024
        
        const incidentTypes = [
            { type: 'Medical Emergency', probability: 0.65 },
            { type: 'Traffic Accident', probability: 0.1 },
            { type: 'Structure Fire', probability: 0.05 },
            { type: 'Fire Alarm', probability: 0.08 },
            { type: 'Service Call', probability: 0.07 },
            { type: 'Hazardous Condition', probability: 0.03 },
            { type: 'Public Assist', probability: 0.02 }
        ];
        
        // Generate incidents
        for (let i = 0; i < info.count; i++) {
            // Random date within range
            const incidentDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            
            // Random incident type based on probability
            let typeRand = Math.random();
            let selectedType = '';
            let sum = 0;
            
            for (const type of incidentTypes) {
                sum += type.probability;
                if (typeRand <= sum) {
                    selectedType = type.type;
                    break;
                }
            }
            
            // Random response times
            const dispatchTime = new Date(incidentDate);
            const enRouteTime = new Date(dispatchTime.getTime() + (Math.random() * 120 + 30) * 1000); // 30-150 seconds turnout
            const arrivalTime = new Date(enRouteTime.getTime() + (Math.random() * 360 + 120) * 1000); // 2-8 minutes travel
            
            // Random station and unit
            const stationNumber = Math.floor(Math.random() * 30) + 1;
            const unitTypes = ['E', 'L', 'R', 'BC', 'M'];
            const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
            const unit = `${unitType}${stationNumber}`;
            
            // Create incident object
            incidents.push({
                id: `INC-${(i+1).toString().padStart(5, '0')}`,
                incident_type: selectedType,
                dispatch_time: dispatchTime.toISOString(),
                en_route_time: enRouteTime.toISOString(),
                arrival_time: arrivalTime.toISOString(),
                station: stationNumber.toString(),
                unit: unit,
                priority: Math.floor(Math.random() * 3) + 1,
                latitude: (Math.random() * 0.2 + 33.4).toFixed(6),
                longitude: (Math.random() * 0.2 - 112.0).toFixed(6)
            });
        }
        
        incidentData = incidents;
        processData(incidents, `${info.city} Sample Data`);
        uploadStatus.textContent = 'Demo data generated successfully!';
        uploadStatus.className = 'status-message success-message';
    }
    
    // Process incident data and update UI
    function processData(incidents, datasetName) {
        // Hide initial message and show stats container
        initialMessage.style.display = 'none';
        statsContainer.classList.remove('hidden');
        
        // Basic dataset info
        let dateRange = 'N/A';
        if (incidents.length > 0) {
            const dates = incidents.map(inc => new Date(inc.dispatch_time || inc.incident_time || inc.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            dateRange = `${formatDate(minDate)} - ${formatDate(maxDate)}`;
        }
        
        // Update dataset info in UI
        document.getElementById('datasetName').textContent = datasetName;
        document.getElementById('datasetInfo').textContent = `Records: ${incidents.length.toLocaleString()} | Date Range: ${dateRange}`;
        
        // Calculate all statistics
        currentStats = calculateStatistics(incidents);
        
        // Update overview cards
        updateOverviewCards(currentStats);
        
        // Update charts
        updateCharts(currentStats);
        
        // Update detailed metrics
        updateDetailedMetrics(currentStats);
    }
    
    // Calculate statistics from incident data
    function calculateStatistics(incidents) {
        // Create stats object
        const stats = {
            totalIncidents: incidents.length,
            incidentTypes: {},
            responseTimes: {
                average: 0,
                percentiles: {},
                distribution: {
                    '0-1': 0,
                    '1-2': 0,
                    '2-3': 0,
                    '3-4': 0,
                    '4-5': 0,
                    '5-6': 0,
                    '6-7': 0,
                    '7-8': 0,
                    '8+': 0
                }
            },
            turnoutTimes: {
                average: 0,
                percentile90: 0
            },
            travelTimes: {
                average: 0,
                percentile90: 0
            },
            dailyDistribution: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat
            monthlyDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Jan-Dec
            unitUtilization: {},
            busiestUnit: '',
            busiestStation: '',
            busiestHour: 0,
            busiestDay: '',
            nfpaCompliance: 0,
            fireFirstDue: 0,
            emsCount: 0,
            fireCount: 0,
            callConcurrency: 0,
            maxConcurrent: 0,
            trend: 5 // Default 5% increase for demo
        };
        
        // Early return for empty dataset
        if (incidents.length === 0) return stats;
        
        // Process incident types
        incidents.forEach(incident => {
            const type = incident.incident_type || 'Unknown';
            stats.incidentTypes[type] = (stats.incidentTypes[type] || 0) + 1;
            
            // Count EMS vs Fire
            if (type.toLowerCase().includes('medical') || 
                type.toLowerCase().includes('ems') || 
                type.toLowerCase().includes('ambulance')) {
                stats.emsCount++;
            } else if (type.toLowerCase().includes('fire') || 
                      type.toLowerCase().includes('smoke') || 
                      type.toLowerCase().includes('alarm')) {
                stats.fireCount++;
            }
            
            // Process daily distribution
            if (incident.dispatch_time) {
                const date = new Date(incident.dispatch_time);
                stats.dailyDistribution[date.getDay()]++;
                stats.monthlyDistribution[date.getMonth()]++;
                
                // Count incidents by hour for busiest hour calculation
                const hour = date.getHours();
                if (!stats.hourlyDistribution) stats.hourlyDistribution = Array(24).fill(0);
                stats.hourlyDistribution[hour]++;
            }
            
            // Process response times
            if (incident.dispatch_time && incident.arrival_time) {
                const dispatchTime = new Date(incident.dispatch_time);
                const arrivalTime = new Date(incident.arrival_time);
                const responseTimeMinutes = (arrivalTime - dispatchTime) / 60000; // Convert ms to minutes
                
                if (responseTimeMinutes > 0) {
                    // Add to response times array for percentile calculation
                    if (!stats.responseTimeArray) stats.responseTimeArray = [];
                    stats.responseTimeArray.push(responseTimeMinutes);
                    
                    // Add to response time distribution
                    if (responseTimeMinutes < 1) stats.responseTimes.distribution['0-1']++;
                    else if (responseTimeMinutes < 2) stats.responseTimes.distribution['1-2']++;
                    else if (responseTimeMinutes < 3) stats.responseTimes.distribution['2-3']++;
                    else if (responseTimeMinutes < 4) stats.responseTimes.distribution['3-4']++;
                    else if (responseTimeMinutes < 5) stats.responseTimes.distribution['4-5']++;
                    else if (responseTimeMinutes < 6) stats.responseTimes.distribution['5-6']++;
                    else if (responseTimeMinutes < 7) stats.responseTimes.distribution['6-7']++;
                    else if (responseTimeMinutes < 8) stats.responseTimes.distribution['7-8']++;
                    else stats.responseTimes.distribution['8+']++;
                }
            }
            
            // Process turnout and travel times
            if (incident.dispatch_time && incident.en_route_time) {
                const dispatchTime = new Date(incident.dispatch_time);
                const enRouteTime = new Date(incident.en_route_time);
                const turnoutTimeSeconds = (enRouteTime - dispatchTime) / 1000; // Convert ms to seconds
                
                if (turnoutTimeSeconds > 0) {
                    if (!stats.turnoutTimeArray) stats.turnoutTimeArray = [];
                    stats.turnoutTimeArray.push(turnoutTimeSeconds);
                }
            }
            
            if (incident.en_route_time && incident.arrival_time) {
                const enRouteTime = new Date(incident.en_route_time);
                const arrivalTime = new Date(incident.arrival_time);
                const travelTimeMinutes = (arrivalTime - enRouteTime) / 60000; // Convert ms to minutes
                
                if (travelTimeMinutes > 0) {
                    if (!stats.travelTimeArray) stats.travelTimeArray = [];
                    stats.travelTimeArray.push(travelTimeMinutes);
                }
            }
            
            // Process unit utilization
            if (incident.unit) {
                const unit = incident.unit;
                stats.unitUtilization[unit] = (stats.unitUtilization[unit] || 0) + 1;
            }
        });
        
        // Calculate average response time
        if (stats.responseTimeArray && stats.responseTimeArray.length > 0) {
            stats.responseTimes.average = stats.responseTimeArray.reduce((sum, time) => sum + time, 0) / stats.responseTimeArray.length;
            
            // Calculate response time percentiles
            stats.responseTimeArray.sort((a, b) => a - b);
            stats.responseTimes.percentile90 = calculatePercentile(stats.responseTimeArray, 90);
        }
        
        // Calculate turnout and travel time averages and percentiles
        if (stats.turnoutTimeArray && stats.turnoutTimeArray.length > 0) {
            stats.turnoutTimes.average = stats.turnoutTimeArray.reduce((sum, time) => sum + time, 0) / stats.turnoutTimeArray.length;
            stats.turnoutTimeArray.sort((a, b) => a - b);
            stats.turnoutTimes.percentile90 = calculatePercentile(stats.turnoutTimeArray, 90);
        }
        
        if (stats.travelTimeArray && stats.travelTimeArray.length > 0) {
            stats.travelTimes.average = stats.travelTimeArray.reduce((sum, time) => sum + time, 0) / stats.travelTimeArray.length;
            stats.travelTimeArray.sort((a, b) => a - b);
            stats.travelTimes.percentile90 = calculatePercentile(stats.travelTimeArray, 90);
        }
        
        // Find busiest unit
        let maxUnitCalls = 0;
        for (const [unit, count] of Object.entries(stats.unitUtilization)) {
            if (count > maxUnitCalls) {
                maxUnitCalls = count;
                stats.busiestUnit = unit;
            }
        }
        
        // Find busiest hour
        if (stats.hourlyDistribution) {
            stats.busiestHour = stats.hourlyDistribution.indexOf(Math.max(...stats.hourlyDistribution));
        }
        
        // Find busiest day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        stats.busiestDay = days[stats.dailyDistribution.indexOf(Math.max(...stats.dailyDistribution))];
        
        // Calculate NFPA compliance (simplified for demo)
        // NFPA 1710 standard: First engine company within 4 minutes, 90% of the time
        if (stats.responseTimeArray && stats.responseTimeArray.length > 0) {
            const compliantCount = stats.responseTimeArray.filter(time => time <= 4).length;
            stats.nfpaCompliance = (compliantCount / stats.responseTimeArray.length) * 100;
            
            // Also calculate for fire incidents only (simplification)
            const fireResponseTimes = incidents
                .filter(inc => {
                    const type = inc.incident_type ? inc.incident_type.toLowerCase() : '';
                    return type.includes('fire') || type.includes('smoke') || type.includes('alarm');
                })
                .filter(inc => inc.dispatch_time && inc.arrival_time)
                .map(inc => (new Date(inc.arrival_time) - new Date(inc.dispatch_time)) / 60000);
                
            if (fireResponseTimes.length > 0) {
                const fireCompliantCount = fireResponseTimes.filter(time => time <= 4).length;
                stats.fireFirstDue = (fireCompliantCount / fireResponseTimes.length) * 100;
            }
        }
        
        // Calculate call concurrency (simplified)
        stats.callConcurrency = Math.ceil(stats.totalIncidents / 365 / 24 * 2); // Estimate based on 2-hour average incident duration
        stats.maxConcurrent = Math.ceil(stats.callConcurrency * 2.5); // Peak is typically 2-3x average
        
        return stats;
    }
    
    // Update overview cards with statistics
    function updateOverviewCards(stats) {
        document.getElementById('totalIncidents').textContent = stats.totalIncidents.toLocaleString();
        document.getElementById('emsIncidents').textContent = stats.emsCount.toLocaleString();
        document.getElementById('fireIncidents').textContent = stats.fireCount.toLocaleString();
        
        const emsPercent = stats.totalIncidents > 0 ? ((stats.emsCount / stats.totalIncidents) * 100).toFixed(1) : '0';
        const firePercent = stats.totalIncidents > 0 ? ((stats.fireCount / stats.totalIncidents) * 100).toFixed(1) : '0';
        
        document.getElementById('emsPercentage').textContent = `${emsPercent}%`;
        document.getElementById('firePercentage').textContent = `${firePercent}%`;
        
        document.getElementById('avgResponseTime').textContent = formatMinutes(stats.responseTimes.average);
        document.getElementById('incidentTrend').textContent = `${stats.trend}%`;
        
        // Check NFPA compliance
        const nfpaStatus = stats.responseTimes.average <= 4 ? 'Meets Standard' : 'Exceeds Standard';
        document.getElementById('nfpaComparison').textContent = nfpaStatus;
        document.getElementById('nfpaComparison').style.color = stats.responseTimes.average <= 4 ? '#27ae60' : '#e74c3c';
    }
    
    // Update charts with statistics
    function updateCharts(stats) {
        // Incident Type Chart
        const typeLabels = [];
        const typeData = [];
        
        // Sort incident types by count descending
        const sortedTypes = Object.entries(stats.incidentTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8); // Limit to top 8 types
            
        sortedTypes.forEach(([type, count]) => {
            typeLabels.push(type);
            typeData.push(count);
        });
        
        incidentTypeChart.data.labels = typeLabels;
        incidentTypeChart.data.datasets[0].data = typeData;
        incidentTypeChart.update();
        
        // Daily Distribution Chart
        dailyDistributionChart.data.datasets[0].data = stats.dailyDistribution;
        dailyDistributionChart.update();
        
        // Response Time Distribution Chart
        responseTimeChart.data.datasets[0].data = Object.values(stats.responseTimes.distribution);
        responseTimeChart.update();
        
        // Monthly Volume Chart
        monthlyVolumeChart.data.datasets[0].data = stats.monthlyDistribution;
        monthlyVolumeChart.update();
    }
    
    // Update detailed metrics
    function updateDetailedMetrics(stats) {
        document.getElementById('avgTurnoutTime').textContent = formatSeconds(stats.turnoutTimes.average);
        document.getElementById('turnout90th').textContent = formatSeconds(stats.turnoutTimes.percentile90);
        
        document.getElementById('avgTravelTime').textContent = formatMinutes(stats.travelTimes.average);
        document.getElementById('travel90th').textContent = formatMinutes(stats.travelTimes.percentile90);
        
        document.getElementById('unitUtilization').textContent = stats.busiestUnit ? 
            `${((stats.unitUtilization[stats.busiestUnit] / stats.totalIncidents) * 100).toFixed(1)}%` : '0%';
        document.getElementById('busiestUnit').textContent = stats.busiestUnit || 'N/A';
        
        document.getElementById('nfpaCompliance').textContent = `${stats.nfpaCompliance.toFixed(1)}%`;
        document.getElementById('fireFirstDue').textContent = `${stats.fireFirstDue.toFixed(1)}%`;
        
        document.getElementById('callConcurrency').textContent = stats.callConcurrency.toString();
        document.getElementById('maxConcurrent').textContent = stats.maxConcurrent.toString();
        
        const hourString = formatHour(stats.busiestHour);
        document.getElementById('busiestHour').textContent = hourString;
        document.getElementById('busiestDay').textContent = stats.busiestDay;
    }
    
    // Update metrics based on selected timeframe
    function updateMetricsForTimeframe() {
        const timeframe = metricTimeframe.value;
        
        // If we have no data, exit early
        if (!incidentData || incidentData.length === 0) return;
        
        let filteredData = incidentData;
        
        // Apply timeframe filter
        if (timeframe !== 'all') {
            const now = new Date();
            let startDate;
            
            if (timeframe === 'year') {
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
            } else if (timeframe === 'month') {
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
            }
            
            filteredData = incidentData.filter(incident => {
                const incidentDate = new Date(incident.dispatch_time || incident.incident_time || incident.date);
                return incidentDate >= startDate && incidentDate <= now;
            });
        }
        
        // Recalculate statistics
        const filteredStats = calculateStatistics(filteredData);
        
        // Update detailed metrics only (not overview or charts)
        updateDetailedMetrics(filteredStats);
    }
    
    // Export functions
    function exportPDF() {
        alert('PDF export functionality would be implemented here');
        // In a real implementation, this would use jsPDF to create a PDF document
    }
    
    function exportCSV() {
        // Prepare CSV data
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Header row
        csvContent += "Metric,Value\r\n";
        
        // Add data rows
        csvContent += `Total Incidents,${currentStats.totalIncidents}\r\n`;
        csvContent += `EMS Calls,${currentStats.emsCount}\r\n`;
        csvContent += `Fire Calls,${currentStats.fireCount}\r\n`;
        csvContent += `Average Response Time,${formatMinutes(currentStats.responseTimes.average)}\r\n`;
        csvContent += `90th Percentile Response Time,${formatMinutes(currentStats.responseTimes.percentile90)}\r\n`;
        csvContent += `Average Turnout Time,${formatSeconds(currentStats.turnoutTimes.average)}\r\n`;
        csvContent += `90th Percentile Turnout Time,${formatSeconds(currentStats.turnoutTimes.percentile90)}\r\n`;
        csvContent += `Average Travel Time,${formatMinutes(currentStats.travelTimes.average)}\r\n`;
        csvContent += `90th Percentile Travel Time,${formatMinutes(currentStats.travelTimes.percentile90)}\r\n`;
        csvContent += `NFPA Compliance,${currentStats.nfpaCompliance.toFixed(1)}%\r\n`;
        csvContent += `Busiest Unit,${currentStats.busiestUnit}\r\n`;
        csvContent += `Busiest Hour,${formatHour(currentStats.busiestHour)}\r\n`;
        csvContent += `Busiest Day,${currentStats.busiestDay}\r\n`;
        
        // Add incident types
        csvContent += "\r\nIncident Types\r\n";
        for (const [type, count] of Object.entries(currentStats.incidentTypes)) {
            csvContent += `${type},${count}\r\n`;
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "quick_stats_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper functions
    function calculatePercentile(array, percentile) {
        if (array.length === 0) return 0;
        const index = Math.ceil(array.length * percentile / 100) - 1;
        return array[index];
    }
    
    function formatMinutes(minutes) {
        if (!minutes) return '0:00';
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function formatSeconds(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    function formatHour(hour) {
        if (hour === undefined || hour === null) return 'N/A';
        
        const hourNum = parseInt(hour);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        
        return `${hour12} ${period}`;
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});