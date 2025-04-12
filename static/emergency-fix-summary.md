# Emergency Mode URL Construction Fix

## Problem
The 'Send to Tool' functionality in emergency mode was failing with 404 errors when transferring data between tools. This happened because URLs were not always being constructed correctly:

1. Some URLs had double slashes (e.g., `origin//targetRoute`) due to inconsistent handling of leading slashes
2. The route normalization wasn't comprehensive enough to handle all variations
3. URLs didn't have a source parameter to help with debugging

## Solution
We implemented the following improvements:

1. **Improved URL Path Normalization**:
   - Added explicit handling to remove leading slashes from route paths before combining with origin
   - Used consistent URL construction across all emergency mode components

2. **Added Diagnostic Parameters**:
   - Added a `source` parameter to identify which component initiated the transfer
   - Maintained the existing timestamp parameter for cache busting

3. **Consistent URL Construction**:
   - Created and reused the constructed URL variable instead of rebuilding it
   - Applied the same URL construction pattern across all components

## Affected Files
- `static/js/emergency-mode.js`: Fixed URL construction in `sendToTool()` function
- `static/js/fireems-framework.js`: Improved URL construction in Data Formatter's send functionality
- `static/js/data-formatter-emergency-test.js`: Updated the emergency test to use the same URL pattern

## Testing
To test this fix:
1. Go to the Data Formatter page
2. Load or create some data
3. Use the 'Send to Tool' feature to send data to the Response Time Analyzer
4. Verify the data transfers successfully

The URL should now be constructed properly with no double slashes, and should include source information for easier debugging.
