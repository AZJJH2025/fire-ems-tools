/**
 * Emergency Mode Fix Implementation
 * This file provides bug fixes and enhancements for the emergency mode
 */

console.log("Emergency data-formatter-fix.js loaded successfully");

// Set flag to indicate fix is loaded
window.emergencyFixLoaded = true;

// Emergency function to create test data with specified count
window.createBasicTestData = function(count) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      'Incident ID': `TEST-${i+1000}`,
      'Incident Date': new Date().toISOString().split('T')[0],
      'Incident Time': '08:00:00',
      'Dispatch Time': '08:01:30',
      'En Route Time': '08:02:45',
      'On Scene Time': '08:07:15',
      'Incident Type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT', 'OTHER'][i % 5],
      'Priority': `${i % 5 + 1}`,
      'Notes': 'Emergency mode test data',
      'Latitude': (33.4484 + (i * 0.01)).toFixed(4),
      'Longitude': (-112.0740 - (i * 0.01)).toFixed(4)
    });
  }
  console.log(`Created ${data.length} emergency test records`);
  return data;
};