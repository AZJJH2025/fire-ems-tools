/**
 * Error Handler Utility
 * Provides consistent error handling and reporting
 */

(function() {
    "use strict";
    
    // Global error handler object
    window.ErrorHandler = {
        /**
         * Handle an error with appropriate logging and user feedback
         * @param {Error|string} error - The error object or message
         * @param {string} context - Where the error occurred
         * @param {boolean} silent - If true, don't show user visible error
         * @returns {void}
         */
        handleError: function(error, context, silent) {
            const errorObj = (typeof error === 'string') ? new Error(error) : error;
            const errorMessage = errorObj.message || 'Unknown error';
            const errorContext = context || 'Unknown context';
            
            // Log to console
            console.error(`Error in ${errorContext}: ${errorMessage}`, errorObj);
            
            // Send to analytics if available
            if (window.FireEMS && window.FireEMS.Analytics) {
                try {
                    window.FireEMS.Analytics.trackError({
                        message: errorMessage,
                        context: errorContext,
                        stack: errorObj.stack,
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    console.error("Failed to track error:", e);
                }
            }
            
            // Show user visible error unless silent mode
            if (!silent) {
                this.showUserError(errorMessage, errorContext);
            }
        },
        
        /**
         * Show a user-visible error message
         * @param {string} message - The error message
         * @param {string} context - Where the error occurred
         */
        showUserError: function(message, context) {
            // Check if we have a container for error messages
            let errorContainer = document.getElementById('error-messages');
            
            // Create one if it doesn't exist
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'error-messages';
                errorContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; max-width: 300px; z-index: 10000;';
                document.body.appendChild(errorContainer);
            }
            
            // Create the error message element
            const errorElement = document.createElement('div');
            errorElement.style.cssText = 'background-color: #f44336; color: white; padding: 12px; margin-bottom: 10px; ' +
                                         'box-shadow: 0 2px 4px rgba(0,0,0,0.3); border-radius: 4px; position: relative;';
            
            // Create close button
            const closeButton = document.createElement('button');
            closeButton.style.cssText = 'position: absolute; top: 5px; right: 5px; border: none; background: transparent; ' +
                                        'color: white; font-size: 18px; cursor: pointer; padding: 0; line-height: 1;';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = function() {
                errorContainer.removeChild(errorElement);
            };
            
            // Add context if available
            let messageText = message;
            if (context) {
                messageText = `<strong>${context}</strong>: ${message}`;
            }
            
            errorElement.innerHTML = messageText;
            errorElement.appendChild(closeButton);
            
            // Add to container
            errorContainer.appendChild(errorElement);
            
            // Auto-remove after 10 seconds
            setTimeout(function() {
                if (errorElement.parentNode === errorContainer) {
                    errorContainer.removeChild(errorElement);
                }
            }, 10000);
        }
    };
})();