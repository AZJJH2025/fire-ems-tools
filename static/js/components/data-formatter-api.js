/**
 * Data Formatter API Interface
 * 
 * Provides a client-side interface to the Data Formatter backend API endpoints.
 */

const DataFormatterAPI = {
    /**
     * Upload a data file to the server
     * @param {File} file - The file to upload
     * @returns {Promise<Object>} - The server response with fileId
     */
    uploadFile: async function(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/data-formatter/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }
            
            const result = await response.json();
            
            // Store the fileId in window.uploadedFileId for the React component to use
            if (result.fileId) {
                window.uploadedFileId = result.fileId;
                console.log('Stored fileId:', result.fileId);
            }
            
            return result;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },
    
    /**
     * Transform data using the provided mappings
     * @param {string} fileId - The ID of the uploaded file
     * @param {Array} mappings - The array of field mappings
     * @returns {Promise<Object>} - The server response with transformed data preview
     */
    transformData: async function(fileId, mappings) {
        try {
            const response = await fetch('/api/data-formatter/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileId: fileId,
                    mappings: mappings
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to transform data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error transforming data:', error);
            throw error;
        }
    },
    
    /**
     * Generate a download URL for transformed data
     * @param {string} transformId - The ID of the transformed data
     * @param {string} format - The desired format (csv, json, excel)
     * @returns {string} - The download URL
     */
    getDownloadUrl: function(transformId, format = 'csv') {
        return `/api/data-formatter/download/${transformId}?format=${format}`;
    },
    
    /**
     * Send transformed data to a target tool
     * @param {string} transformId - The ID of the transformed data
     * @param {string} targetTool - The target tool identifier
     * @returns {Promise<Object>} - The server response
     */
    sendToTool: async function(transformId, targetTool) {
        try {
            // For now, just construct the URL that would load the data in the target tool
            const toolUrls = {
                'response-time': '/fire-ems-dashboard',
                'isochrone': '/isochrone-map',
                'isochrone-stations': '/isochrone-map?type=stations',
                'isochrone-incidents': '/isochrone-map?type=incidents',
                'call-density': '/call-density-heatmap',
                'incident-logger': '/incident-logger',
                'coverage-gap': '/coverage-gap-finder',
                'station-overview': '/station-overview',
                'fire-map-pro': '/fire-map-pro'
            };
            
            // Store the transform ID in sessionStorage for the target tool to retrieve
            sessionStorage.setItem('formattedDataId', transformId);
            sessionStorage.setItem('dataSource', 'formatter');
            
            // Return the URL to navigate to
            return {
                success: true,
                redirect: toolUrls[targetTool] ? `${toolUrls[targetTool]}?from_formatter=true&id=${transformId}` : null
            };
        } catch (error) {
            console.error('Error in sendToTool:', error);
            throw error;
        }
    }
};

// Make the API available globally
window.DataFormatterAPI = DataFormatterAPI;