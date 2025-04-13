/**
 * Script Loader Utility
 * Provides safe loading of external JavaScript with error handling
 */

(function() {
    "use strict";
    
    // Global script loader object
    window.ScriptLoader = {
        // Load a script with error handling
        loadScript: function(url, callback, errorCallback) {
            console.log("ScriptLoader: Loading script from " + url);
            
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;
            
            // Success handler
            script.onload = function() {
                console.log("ScriptLoader: Successfully loaded " + url);
                if (callback && typeof callback === 'function') {
                    callback();
                }
            };
            
            // Error handler
            script.onerror = function() {
                console.error("ScriptLoader: Failed to load " + url);
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback(new Error("Failed to load script: " + url));
                }
            };
            
            // Add to document
            document.head.appendChild(script);
            
            return script;
        },
        
        // Load multiple scripts in sequence
        loadScripts: function(urls, finalCallback, errorCallback) {
            let index = 0;
            
            function loadNext() {
                if (index >= urls.length) {
                    if (finalCallback && typeof finalCallback === 'function') {
                        finalCallback();
                    }
                    return;
                }
                
                ScriptLoader.loadScript(
                    urls[index++], 
                    loadNext, 
                    function(error) {
                        if (errorCallback && typeof errorCallback === 'function') {
                            errorCallback(error);
                        } else {
                            console.error("ScriptLoader: Error loading script", error);
                            // Continue loading next script despite error
                            loadNext();
                        }
                    }
                );
            }
            
            loadNext();
        }
    };
})();