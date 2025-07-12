# Cache Bust File

This file forces new deployments when Render cache is stuck.

Last updated: July 12, 2025 at 8:45 PM - TARGETED ROUTING FIX

RENDER SELECTIVE CACHING ISSUE DISCOVERED:
- Some July 12 code IS working (data transformation, compatibility checking)  
- Routing logic ExportContainer.tsx STILL serving from June 13 build
- Missing our added debug logs proves routing code not updated
- This is selective caching where different app parts serve from different builds

TARGETED FIX STRATEGY - ATTEMPT #5:
✅ Added "CACHE BUST JUL 12 20:45" timestamps to routing debug logs
✅ Enhanced error messages with specific available tools list  
✅ Strategic code changes to force routing logic refresh
✅ Should bypass selective caching and serve updated routing code

Evidence of selective caching:
- ✅ Data transformation working (July 12 code)
- ✅ Compatibility checking working (July 12 code) 
- ❌ Routing debug logs missing (June 13 code)
- ❌ Tool recognition failing (June 13 code)

TIMESTAMP: 2025-07-12T20:45:30Z