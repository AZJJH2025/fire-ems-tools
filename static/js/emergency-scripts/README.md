# Emergency Mode Scripts

This directory contains scripts related to the FireEMS.ai resilience framework and emergency mode functionality.

## Purpose

The emergency mode system allows the application to continue functioning even when resources fail to load properly. These scripts handle:

- Fallback resource loading through multiple paths
- Resilient script loading with retry mechanisms
- Error recovery for key libraries like Chart.js
- Emergency data processing from localStorage
- Alternative rendering when primary display methods fail

## Scripts Overview

- **framework-initialization.js**: Loads the FireEMS framework with fallback paths
- **chartjs-loader.js**: Loads Chart.js with error handling and fallbacks
- **emergency-mode-debugging.js**: Handles emergency mode detection and diagnostics
- **emergency-mode-library.js**: Processes emergency data from localStorage
- **chart-syntax-fix.js**: Fixes Chart.js initialization problems
- **chart-manager-loader.js**: Loads the chart manager with fallback paths
- **fallback-loader.js**: Loads chart fallback scripts for resilience
- **prevent-mode-switch-loader.js**: Prevents mode switching during emergency
- **dashboard-loader.js**: Loads dashboard scripts with version control

## How It Works

1. Scripts attempt to load resources from primary paths
2. If primary loading fails, fallback paths are tried
3. If all loading attempts fail, an emergency mode is entered
4. In emergency mode, minimal functionality is provided using:
   - Inline critical CSS
   - Pure JS implementations
   - LocalStorage for data persistence
   - Simplified UI rendering

## Integration

These scripts were extracted from inline code in HTML templates and organized here for better maintainability. They are referenced in templates using appropriate script tags.

See the `TEMPLATE_GUIDE.md` in the templates directory for more information on how these scripts are integrated into the template inheritance system.

## Related Files

- `/static/emergency-mode.css`: CSS styles for emergency notifications and data displays
- `/static/js/emergency/`: Directory containing other emergency-related scripts
- `/static/js/emergency-diagnostic.js`: Diagnostic tool for emergency mode
- `/static/js/emergency-mode.js`: Core emergency mode library

## Future Improvements

- Further modularize emergency mode code
- Add better error logging and reporting
- Implement automated recovery mechanisms
- Add offline capability through service workers
- Create a comprehensive emergency mode test suite