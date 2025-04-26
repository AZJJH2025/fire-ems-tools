/**
 * CSP-compliant wrapper for Leaflet.measure 
 * Prevents 'unsafe-eval' errors by replacing the problematic parts with safe alternatives
 */

(function() {
    // Replace any usage of Function constructor or eval in Leaflet.measure
    // This runs after the original script loads and monkey-patches it for CSP compliance
    
    if (typeof L !== 'undefined' && L.Control && L.Control.Measure) {
        // Store the original Measure constructor
        const OriginalMeasure = L.Control.Measure;
        
        // Override with our CSP-compliant version
        L.Control.Measure = function(options) {
            // Call the original constructor
            const measure = new OriginalMeasure(options);
            
            // Replace any methods that use eval or Function constructor
            const safeTemplateCompile = function(templateString) {
                return function(data) {
                    // Simple template replacement without using Function or eval
                    let result = templateString;
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            const regex = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g');
                            result = result.replace(regex, data[key]);
                        }
                    }
                    return result;
                };
            };
            
            // Replace any template compilation methods
            if (measure._buildMarkup) {
                const originalBuildMarkup = measure._buildMarkup;
                measure._buildMarkup = function() {
                    // Call the original method
                    const result = originalBuildMarkup.apply(this, arguments);
                    
                    // Replace any Function constructor or eval usage in the templates
                    if (this._resultsTemplate && typeof this._resultsTemplate === 'string') {
                        this._resultsTemplate = safeTemplateCompile(this._resultsTemplate);
                    }
                    
                    return result;
                };
            }
            
            return measure;
        };
        
        // Copy prototype and properties from the original
        L.Control.Measure.prototype = OriginalMeasure.prototype;
        
        console.log('Leaflet.measure patched for CSP compliance');
    } else {
        console.error('Leaflet.measure not found, CSP fix not applied');
    }
})();