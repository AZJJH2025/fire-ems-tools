// This is a minimal version of incident-logger.js for testing
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    // Wait for all elements to be available
    setTimeout(() => {
        // Minimal functionality for testing
        try {
            const newIncidentBtn = document.getElementById('new-incident-btn');
            if (newIncidentBtn) {
                console.log('Found new-incident-btn');
                newIncidentBtn.addEventListener('click', () => {
                    console.log('New incident button clicked');
                });
            } else {
                console.error('Could not find new-incident-btn');
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }, 1000);
});