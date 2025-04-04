/**
 * Database Adapter for Fire-EMS Incident Logger
 * 
 * This module provides functions to interface with the backend database API
 * for storing and retrieving incident data. It detects if we're in department mode
 * and uses the appropriate API endpoints.
 */

// Detect if we're in department mode by checking the URL
function getDepartmentCode() {
    const path = window.location.pathname;
    const match = path.match(/\/dept\/([^\/]+)/);
    return match ? match[1] : null;
}

// Build API URL with department code if available
function buildApiUrl(endpoint) {
    const deptCode = getDepartmentCode();
    if (deptCode) {
        return `/api/dept/${deptCode}${endpoint}`;
    }
    // Fallback to local storage mode if not in department mode
    return null;
}

// Incident Storage API
const IncidentStorage = {
    /**
     * Save incident data to database or localStorage
     * @param {Object} incident - The incident data to save
     * @returns {Promise} - Resolves with the saved incident or rejects with error
     */
    saveIncident: function(incident) {
        return new Promise((resolve, reject) => {
            const apiUrl = buildApiUrl('/incidents');
            
            // If we have an API URL, use it
            if (apiUrl) {
                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(incident)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to save incident');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Saved incident to database:', data);
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error saving incident to database:', error);
                    reject(error);
                });
            } 
            // Otherwise use localStorage (fallback)
            else {
                try {
                    // Get existing incidents or initialize empty array
                    let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
                    
                    // Add id and timestamps if not present
                    if (!incident.id) {
                        incident.id = Date.now().toString();
                    }
                    if (!incident.created_at) {
                        incident.created_at = new Date().toISOString();
                    }
                    incident.updated_at = new Date().toISOString();
                    
                    // Add incident to array
                    incidents.push(incident);
                    
                    // Save back to localStorage
                    localStorage.setItem('incidents', JSON.stringify(incidents));
                    console.log('Saved incident to localStorage:', incident);
                    
                    // Resolve with the saved incident
                    resolve({
                        success: true,
                        message: 'Incident saved to localStorage',
                        incident_id: incident.id
                    });
                } catch (error) {
                    console.error('Error saving incident to localStorage:', error);
                    reject(error);
                }
            }
        });
    },
    
    /**
     * Get all incidents from database or localStorage
     * @returns {Promise} - Resolves with array of incidents or rejects with error
     */
    getIncidents: function() {
        return new Promise((resolve, reject) => {
            const apiUrl = buildApiUrl('/incidents');
            
            // If we have an API URL, use it
            if (apiUrl) {
                fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch incidents');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Fetched incidents from database:', data);
                    resolve(data.incidents || []);
                })
                .catch(error => {
                    console.error('Error fetching incidents from database:', error);
                    reject(error);
                });
            } 
            // Otherwise use localStorage (fallback)
            else {
                try {
                    // Get existing incidents or initialize empty array
                    let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
                    console.log('Fetched incidents from localStorage:', incidents);
                    resolve(incidents);
                } catch (error) {
                    console.error('Error fetching incidents from localStorage:', error);
                    reject(error);
                }
            }
        });
    },
    
    /**
     * Get a specific incident by ID
     * @param {string} incidentId - The ID of the incident to retrieve
     * @returns {Promise} - Resolves with the incident data or rejects with error
     */
    getIncidentById: function(incidentId) {
        return new Promise((resolve, reject) => {
            const apiUrl = buildApiUrl(`/incidents/${incidentId}`);
            
            // If we have an API URL, use it
            if (apiUrl) {
                fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch incident');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Fetched incident from database:', data);
                    resolve(data.incident);
                })
                .catch(error => {
                    console.error('Error fetching incident from database:', error);
                    reject(error);
                });
            } 
            // Otherwise use localStorage (fallback)
            else {
                try {
                    // Get existing incidents
                    let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
                    
                    // Find the incident with the matching ID
                    const incident = incidents.find(inc => inc.id === incidentId);
                    if (incident) {
                        console.log('Fetched incident from localStorage:', incident);
                        resolve(incident);
                    } else {
                        reject(new Error('Incident not found'));
                    }
                } catch (error) {
                    console.error('Error fetching incident from localStorage:', error);
                    reject(error);
                }
            }
        });
    },
    
    /**
     * Update an existing incident
     * @param {Object} incident - The incident data to update
     * @returns {Promise} - Resolves with the updated incident or rejects with error
     */
    updateIncident: function(incident) {
        return new Promise((resolve, reject) => {
            const apiUrl = buildApiUrl(`/incidents/${incident.id}`);
            
            // If we have an API URL, use it
            if (apiUrl) {
                fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(incident)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update incident');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Updated incident in database:', data);
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error updating incident in database:', error);
                    reject(error);
                });
            } 
            // Otherwise use localStorage (fallback)
            else {
                try {
                    // Get existing incidents
                    let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
                    
                    // Find the index of the incident with the matching ID
                    const index = incidents.findIndex(inc => inc.id === incident.id);
                    if (index !== -1) {
                        // Update timestamp
                        incident.updated_at = new Date().toISOString();
                        
                        // Replace the incident at that index
                        incidents[index] = incident;
                        
                        // Save back to localStorage
                        localStorage.setItem('incidents', JSON.stringify(incidents));
                        console.log('Updated incident in localStorage:', incident);
                        
                        // Resolve with the updated incident
                        resolve({
                            success: true,
                            message: 'Incident updated in localStorage',
                            incident_id: incident.id
                        });
                    } else {
                        reject(new Error('Incident not found'));
                    }
                } catch (error) {
                    console.error('Error updating incident in localStorage:', error);
                    reject(error);
                }
            }
        });
    },
    
    /**
     * Delete an incident
     * @param {string} incidentId - The ID of the incident to delete
     * @returns {Promise} - Resolves on success or rejects with error
     */
    deleteIncident: function(incidentId) {
        return new Promise((resolve, reject) => {
            const apiUrl = buildApiUrl(`/incidents/${incidentId}`);
            
            // If we have an API URL, use it
            if (apiUrl) {
                fetch(apiUrl, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete incident');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Deleted incident from database:', data);
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error deleting incident from database:', error);
                    reject(error);
                });
            } 
            // Otherwise use localStorage (fallback)
            else {
                try {
                    // Get existing incidents
                    let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
                    
                    // Filter out the incident with the matching ID
                    incidents = incidents.filter(inc => inc.id !== incidentId);
                    
                    // Save back to localStorage
                    localStorage.setItem('incidents', JSON.stringify(incidents));
                    console.log('Deleted incident from localStorage:', incidentId);
                    
                    // Resolve with success message
                    resolve({
                        success: true,
                        message: 'Incident deleted from localStorage'
                    });
                } catch (error) {
                    console.error('Error deleting incident from localStorage:', error);
                    reject(error);
                }
            }
        });
    }
};

// Export the IncidentStorage object
window.IncidentStorage = IncidentStorage;