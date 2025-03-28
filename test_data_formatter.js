/**
 * Data Formatter Test Script for FireEMS.ai
 * 
 * This script tests the Data Formatter's ability to handle various CAD system data formats
 * and properly transform them for the Isochrone Map Generator and other tools.
 * 
 * How to use:
 * 1. Open browser dev tools on the Data Formatter page
 * 2. Copy and paste this entire script into the console
 * 3. Run the test(s) you want to verify
 */

const DataFormatterTests = {
    // Test data sources
    testFiles: {
        stations: {
            motorola: '/data/stations/test_motorola_stations.csv',
            tyler: '/data/stations/test_tyler_stations.csv',
            hexagon: '/data/stations/test_hexagon_stations.csv',
            centralsquare: '/data/stations/test_centralsquare_stations.csv'
        },
        incidents: {
            motorola: '/data/incidents/test_motorola_incidents.csv',
            tyler: '/data/incidents/test_tyler_incidents.csv',
            hexagon: '/data/incidents/test_hexagon_incidents.csv',
            centralsquare: '/data/incidents/test_centralsquare_incidents.csv'
        }
    },
    
    // Load a test file and return its contents
    async loadTestFile(path) {
        console.log(`Loading test file: ${path}`);
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading test file:', error);
            throw error;
        }
    },
    
    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/["']/g, ''));
        const results = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            // Handle quoted values properly
            let row = [];
            let inQuote = false;
            let currentValue = '';
            
            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                
                if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    row.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            row.push(currentValue.trim());
            
            // Create object from headers and values
            const obj = {};
            headers.forEach((header, index) => {
                if (index < row.length) {
                    // Clean up quoted values
                    let value = row[index];
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    obj[header] = value;
                }
            });
            
            results.push(obj);
        }
        
        return results;
    },
    
    // Test the data transformer for a specific CAD system's station data
    async testStationTransformation(cadSystem) {
        console.group(`Testing ${cadSystem} Station Data for Isochrone Map`);
        
        try {
            const filePath = this.testFiles.stations[cadSystem];
            const csvData = await this.loadTestFile(filePath);
            const parsedData = this.parseCSV(csvData);
            
            console.log(`Loaded ${parsedData.length} station records`);
            console.log('First record:', parsedData[0]);
            
            // Check for required fields directly
            const requiredFields = ['Latitude', 'Longitude', 'Station Name'];
            const fieldMapping = this.detectStationFields(parsedData[0]);
            
            console.log('Field mapping detected:', fieldMapping);
            
            // Check if we have mappings for all required fields
            const missingFields = requiredFields.filter(field => !fieldMapping[field]);
            if (missingFields.length > 0) {
                console.warn(`Missing field mappings for: ${missingFields.join(', ')}`);
            } else {
                console.log('All required field mappings detected ✓');
            }
            
            // Create transformed data simulation
            const transformedData = parsedData.map(item => {
                const transformed = {};
                
                // Map each required field
                for (const [targetField, sourceFields] of Object.entries(fieldMapping)) {
                    const sourceField = sourceFields.find(field => item[field] !== undefined);
                    if (sourceField) {
                        transformed[targetField] = item[sourceField];
                    }
                }
                
                return transformed;
            });
            
            console.log(`Transformed ${transformedData.length} records for Isochrone Map`);
            console.log('First transformed record:', transformedData[0]);
            
            // Check for any missing required fields in transformed data
            const incompleteRecords = transformedData.filter(item => 
                requiredFields.some(field => !item[field])
            );
            
            if (incompleteRecords.length > 0) {
                console.warn(`${incompleteRecords.length} records missing required fields after transformation`);
            } else {
                console.log('All records have required fields after transformation ✓');
            }
            
            return {
                success: incompleteRecords.length === 0,
                original: parsedData,
                transformed: transformedData,
                fieldMapping
            };
        } catch (error) {
            console.error('Test failed:', error);
            return { success: false, error };
        } finally {
            console.groupEnd();
        }
    },
    
    // Test the data transformer for a specific CAD system's incident data
    async testIncidentTransformation(cadSystem) {
        console.group(`Testing ${cadSystem} Incident Data for Isochrone Map`);
        
        try {
            const filePath = this.testFiles.incidents[cadSystem];
            const csvData = await this.loadTestFile(filePath);
            const parsedData = this.parseCSV(csvData);
            
            console.log(`Loaded ${parsedData.length} incident records`);
            console.log('First record:', parsedData[0]);
            
            // Check for required fields directly
            const requiredFields = ['Latitude', 'Longitude', 'Incident Type'];
            const fieldMapping = this.detectIncidentFields(parsedData[0]);
            
            console.log('Field mapping detected:', fieldMapping);
            
            // Check if we have mappings for all required fields
            const missingFields = requiredFields.filter(field => !fieldMapping[field]);
            if (missingFields.length > 0) {
                console.warn(`Missing field mappings for: ${missingFields.join(', ')}`);
            } else {
                console.log('All required field mappings detected ✓');
            }
            
            // Create transformed data simulation
            const transformedData = parsedData.map(item => {
                const transformed = {};
                
                // Map each required field
                for (const [targetField, sourceFields] of Object.entries(fieldMapping)) {
                    const sourceField = sourceFields.find(field => item[field] !== undefined);
                    if (sourceField) {
                        transformed[targetField] = item[sourceField];
                    }
                }
                
                return transformed;
            });
            
            console.log(`Transformed ${transformedData.length} records for Isochrone Map`);
            console.log('First transformed record:', transformedData[0]);
            
            // Check for any missing required fields in transformed data
            const incompleteRecords = transformedData.filter(item => 
                requiredFields.some(field => !item[field])
            );
            
            if (incompleteRecords.length > 0) {
                console.warn(`${incompleteRecords.length} records missing required fields after transformation`);
            } else {
                console.log('All records have required fields after transformation ✓');
            }
            
            return {
                success: incompleteRecords.length === 0,
                original: parsedData,
                transformed: transformedData,
                fieldMapping
            };
        } catch (error) {
            console.error('Test failed:', error);
            return { success: false, error };
        } finally {
            console.groupEnd();
        }
    },
    
    // Detect field mappings for station data
    detectStationFields(sampleRecord) {
        const fieldMappings = {
            'Station Name': [],
            'Station ID': [],
            'Latitude': [],
            'Longitude': [],
            'Address': []
        };
        
        // Map Station Name
        const nameFields = ['STATION_NAME', 'FACILITY_NAME', 'STATION_DESC', 'STATION_TITLE'];
        nameFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Station Name'].push(field);
            }
        });
        
        // Map Station ID
        const idFields = ['STATION_ID', 'FACILITY_ID', 'STATION_NUMBER', 'STATION_CODE'];
        idFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Station ID'].push(field);
            }
        });
        
        // Map Latitude
        const latFields = ['STATION_LAT', 'LAT', 'Y_COORDINATE', 'GEOY'];
        latFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Latitude'].push(field);
            }
        });
        
        // Map Longitude
        const lngFields = ['STATION_LONG', 'LON', 'X_COORDINATE', 'GEOX'];
        lngFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Longitude'].push(field);
            }
        });
        
        // Map Address
        const addrFields = ['STATION_ADDRESS', 'FACILITY_ADDRESS', 'STREET_ADDRESS', 'FULL_ADDRESS'];
        addrFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Address'].push(field);
            }
        });
        
        return fieldMappings;
    },
    
    // Detect field mappings for incident data
    detectIncidentFields(sampleRecord) {
        const fieldMappings = {
            'Incident ID': [],
            'Incident Type': [],
            'Latitude': [],
            'Longitude': [],
            'Incident Date': [],
            'Incident Time': [],
            'Priority': []
        };
        
        // Map Incident ID
        const idFields = ['INCIDENT_NO', 'CAD_CALL_ID', 'EVENT_NUMBER', 'CAD_INCIDENT_ID'];
        idFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Incident ID'].push(field);
            }
        });
        
        // Map Incident Type
        const typeFields = ['INCIDENT_TYPE_DESC', 'NATURE_DESC', 'PROBLEM_DESCRIPTION', 'CALL_DESCRIPTION'];
        typeFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Incident Type'].push(field);
            }
        });
        
        // Map Latitude
        const latFields = ['LAT', 'LATITUDE', 'EVENT_Y_COORDINATE', 'GEOY'];
        latFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Latitude'].push(field);
            }
        });
        
        // Map Longitude
        const lngFields = ['LON', 'LONGITUDE', 'EVENT_X_COORDINATE', 'GEOX'];
        lngFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Longitude'].push(field);
            }
        });
        
        // Map Date fields
        const dateFields = ['CALL_RECEIVED_DATE', 'CALL_DATE_TIME', 'EVENT_OPEN_DATETIME', 'REPORTED_DT'];
        dateFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Incident Date'].push(field);
            }
        });
        
        // Map Time fields
        const timeFields = ['CALL_RECEIVED_TIME', 'CALL_DATE_TIME', 'EVENT_OPEN_DATETIME', 'REPORTED_DT'];
        timeFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Incident Time'].push(field);
            }
        });
        
        // Map Priority
        const priorityFields = ['PRIORITY_CD', 'PRIORITY_NBR', 'EVENT_PRIORITY', 'PRIORITY'];
        priorityFields.forEach(field => {
            if (sampleRecord[field] !== undefined) {
                fieldMappings['Priority'].push(field);
            }
        });
        
        return fieldMappings;
    },
    
    // Run all tests
    async runAllTests() {
        console.group('FireEMS.ai Data Formatter Compatibility Tests');
        
        const results = {
            stations: {},
            incidents: {}
        };
        
        // Test all station data formats
        for (const cadSystem of Object.keys(this.testFiles.stations)) {
            results.stations[cadSystem] = await this.testStationTransformation(cadSystem);
        }
        
        // Test all incident data formats
        for (const cadSystem of Object.keys(this.testFiles.incidents)) {
            results.incidents[cadSystem] = await this.testIncidentTransformation(cadSystem);
        }
        
        // Summary
        console.group('Test Summary');
        
        let stationTestsPassed = 0;
        let incidentTestsPassed = 0;
        
        console.log('Station Data Tests:');
        for (const [system, result] of Object.entries(results.stations)) {
            console.log(`- ${system}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
            if (result.success) stationTestsPassed++;
        }
        
        console.log('Incident Data Tests:');
        for (const [system, result] of Object.entries(results.incidents)) {
            console.log(`- ${system}: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
            if (result.success) incidentTestsPassed++;
        }
        
        console.log(`\nOverall: ${stationTestsPassed + incidentTestsPassed}/${Object.keys(results.stations).length + Object.keys(results.incidents).length} tests passed`);
        
        console.groupEnd();
        console.groupEnd();
        
        return results;
    }
};

// Function to run from console
async function testDataFormatter() {
    const results = await DataFormatterTests.runAllTests();
    console.log('Test completed. Use the returned results object for more details.');
    return results;
}

// Automatically run if this script is pasted directly into the console
if (typeof window !== 'undefined') {
    console.log('Data Formatter Test Script loaded. Run testDataFormatter() to execute all tests.');
}