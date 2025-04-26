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
            
            const response = await fetch('/tools-api/data-formatter/upload', {
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
            // DEBUG: Log request details before sending
            console.log('TRANSFORM REQUEST DETAILS:');
            console.log('URL:', '/tools-api/data-formatter/transform');
            console.log('Method:', 'POST');
            console.log('Headers:', {'Content-Type': 'application/json'});
            console.log('FileId:', fileId);
            console.log('Mappings:', mappings);
            
            // Get processing metadata from window.formatterState if available
            const processingMetadata = (window.formatterState && window.formatterState.processingMetadata) 
                ? window.formatterState.processingMetadata 
                : {};

            const requestBody = {
                fileId: fileId,
                mappings: mappings,
                // Include processing metadata (which contains splitRules)
                processingMetadata: processingMetadata,
                // Let the server know if we have the DataTransformer utility available
                clientCapabilities: {
                    hasDataTransformer: !!(window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer)
                }
            };
            
            console.log('Full request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch('/tools-api/data-formatter/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
            .catch(error => {
                console.error('API Call Failed:', error);
                throw error;
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API returned error:', errorData);
                throw new Error(errorData.error || 'Failed to transform data');
            }
            
            // Log the successful response
            const responseData = await response.json();
            console.log('API Response:', responseData);
            
            // Check for available utilities for client-side data enhancement
            const hasDataTransformer = window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer;
            const hasMapFieldsManager = window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.MapFieldsManager;
            
            // Apply additional transformations on the client side if needed
            if ((hasDataTransformer || hasMapFieldsManager) && 
                responseData.data && Array.isArray(responseData.data)) {
                console.log('Applying client-side data enhancement to API response');
                
                // Check if there's a targetTool specified
                if (responseData.targetTool) {
                    try {
                        let enhancedData;
                        
                        // Prefer MapFieldsManager if available
                        if (hasMapFieldsManager) {
                            console.log('Using MapFieldsManager for data enhancement');
                            
                            if (responseData.mappings) {
                                // If mappings are provided, apply them with MapFieldsManager
                                enhancedData = window.FireEMS.Utils.MapFieldsManager.applyMappings(
                                    responseData.data,
                                    responseData.mappings,
                                    responseData.transformConfigs || {}
                                );
                                
                                // Validate the mapped data for the target tool
                                if (enhancedData && enhancedData.length > 0) {
                                    const validationResult = window.FireEMS.Utils.MapFieldsManager.validateMappedData(
                                        enhancedData[0],
                                        responseData.targetTool
                                    );
                                    
                                    // Add validation info to the response
                                    responseData.validation = validationResult;
                                    
                                    // Log any validation issues
                                    if (!validationResult.valid) {
                                        console.warn('Data validation issues:', validationResult);
                                    }
                                }
                            }
                        }
                        // Fall back to DataTransformer if MapFieldsManager is not available
                        else if (hasDataTransformer) {
                            console.log('Using DataTransformer for data enhancement');
                            enhancedData = window.FireEMS.Utils.DataTransformer.transformForTool(
                                responseData.data, 
                                responseData.targetTool
                            );
                        }
                        
                        if (enhancedData && enhancedData.length > 0) {
                            console.log('Enhanced data with client-side processing');
                            responseData.data = enhancedData;
                            responseData.clientEnhanced = true;
                        }
                    } catch (enhanceError) {
                        console.warn('Error enhancing data with client-side processing:', enhanceError);
                        // Continue with original data
                    }
                }
            }
            
            return responseData;
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
        return `/tools-api/data-formatter/download/${transformId}?format=${format}`;
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