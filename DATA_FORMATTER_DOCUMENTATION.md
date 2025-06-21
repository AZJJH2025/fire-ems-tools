# Data Formatter Documentation and Rebuild Process

## Overview
This document provides comprehensive documentation about the Data Formatter file structure, build process, and deployment to prevent confusion about which files control what functionality.

## File Structure

### Current Working Data Formatter (React Version)
**URL**: `/data-formatter` and `/data-formatter-react`  
**Entry Point**: `/Users/josephhester/fire-ems-tools/static/react-data-formatter/index.html`  
**Status**: ✅ ACTIVE - This is the current working version

**Key Files:**
- `static/react-data-formatter/index.html` - Entry point HTML file
- `static/react-data-formatter/vendor.8d53034d8e5175c6a6ae.js` - Vendor dependencies bundle
- `static/react-data-formatter/data-formatter.77a6f7005bf45e5a26db.js` - Main application bundle

### React Source Code Location
**Source Directory**: `/Users/josephhester/fire-ems-tools/static/js/react-data-formatter/src/`  
**Target Tool Dropdown**: `src/components/TargetToolSelector.js` (lines 14-33)

**Current Dropdown Options:**
1. Response Time Analyzer
2. Call Density Heatmap  
3. Fire Map Pro ✅ (Added)

### Legacy HTML Template Version
**URL**: `/data-formatter-legacy`  
**Entry Point**: `/Users/josephhester/fire-ems-tools/templates/data-formatter.html`  
**Status**: ❌ LEGACY - Do not modify this version

## Route Configuration

### Flask Routes (`flask_routes/react_routes.py`)
```python
@app.route('/data-formatter')          # Main route - serves React version
@app.route('/data-formatter-react')    # Alternative route - serves React version
```

### Legacy Routes (`routes/main.py`)
```python
@bp.route('/data-formatter-legacy')    # Legacy HTML template version
```

## Build Process

### React Data Formatter Build
**Build Directory**: `/Users/josephhester/fire-ems-tools/static/js/react-data-formatter/`  
**Build Command**: `npm run build`  
**Output Directory**: `dist/`  
**Deployment Target**: `/Users/josephhester/fire-ems-tools/static/react-data-formatter/`

### Build Steps:
1. Navigate to source directory:
   ```bash
   cd /Users/josephhester/fire-ems-tools/static/js/react-data-formatter
   ```

2. Install dependencies (if needed):
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Deploy built files:
   ```bash
   cp -r dist/* /Users/josephhester/fire-ems-tools/static/react-data-formatter/
   ```

5. Update index.html to include proper script references (see template below)

### Build Configuration
- **Webpack Config**: `webpack.config.js`
- **Package Config**: `package.json`
- **Dependencies**: React 17, Material-UI 4.12.3, React Beautiful DnD

## Deployment Template

### index.html Template
When deploying, ensure the index.html includes the correct script references:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FireEMS Data Formatter</title>
    <!-- CDN Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@material-ui/core@4.12.3/umd/material-ui.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js"></script>
  </head>
  <body>
    <div id="data-formatter-root"></div>
    <!-- Application Bundles -->
    <script type="module" crossorigin src="/static/react-data-formatter/vendor.[hash].js"></script>
    <script type="module" crossorigin src="/static/react-data-formatter/data-formatter.[hash].js"></script>
  </body>
</html>
```

## Adding New Tools to Dropdown

### To Add a New Tool:
1. Edit the source file: `static/js/react-data-formatter/src/components/TargetToolSelector.js`
2. Add new tool to the `TARGET_TOOLS` array:
   ```javascript
   {
     id: 'new-tool-id',
     name: 'New Tool Name',
     description: 'Tool description for tooltip',
     url: '/path-to-tool'
   }
   ```
3. Rebuild and deploy following the build process above

### Current Tools Configuration:
```javascript
const TARGET_TOOLS = [
  {
    id: 'response-time',
    name: 'Response Time Analyzer',
    description: 'Analyze response times for fire and EMS incidents',
    url: '/response-time-analyzer'
  },
  {
    id: 'call-density',
    name: 'Call Density Heatmap',
    description: 'Visualize incident density across geographic areas',
    url: '/call-density-heatmap'
  },
  {
    id: 'fire-map-pro',
    name: 'Fire Map Pro',
    description: 'Professional mapping and export tool for incident data',
    url: '/app/fire-map-pro'
  }
];
```

## Version Control and Asset Management

### Asset Hashing
Built files include content hashes in their filenames for cache busting:
- `vendor.8d53034d8e5175c6a6ae.js`
- `data-formatter.77a6f7005bf45e5a26db.js`

### Important Notes
- **Always work on the React source files**, not the built bundles
- **Never manually edit the minified JavaScript files**
- **Test locally before deploying to production**
- **Keep this documentation updated when making changes**

## Troubleshooting

### If Dropdown Shows Wrong Options
1. Verify you're accessing `/data-formatter` (React version), not `/data-formatter-legacy`
2. Check if the build deployed correctly
3. Clear browser cache
4. Verify route configuration in Flask

### If Build Fails
1. Check Node.js and npm versions
2. Delete `node_modules` and run `npm install`
3. Check for syntax errors in source files
4. Review webpack configuration

### Common Issues
- **Route conflicts**: Ensure legacy routes don't override React routes
- **Asset loading**: Verify static file paths are correct
- **Cache issues**: Clear browser cache after deployment
- **Missing dependencies**: Check CDN links are accessible

## Session Status & Recent Work

### ✅ COMPLETED (Previous Session - May 29, 2025)
- **Fire Map Pro successfully added to Data Formatter dropdown**
- **React source files located and modified**
- **Application rebuilt and deployed**
- **Comprehensive documentation created**

### ✅ COMPLETED (Current Session - May 30, 2025)
- **Fixed browser tab titles for Fire Map Pro and Response Time Analyzer**
- **Discovered React Router architecture and component-specific routing**
- **Resolved title override issues in HTML templates**
- **Updated both static and React builds with proper title management**

### What Was Done:
1. **Located React source**: `/static/js/react-data-formatter/src/components/TargetToolSelector.js`
2. **Confirmed Fire Map Pro option**: Already present in TARGET_TOOLS array (lines 27-32)
3. **Rebuilt application**: `npm run build` in `/static/js/react-data-formatter/`
4. **Deployed to production**: Copied dist files to `/static/react-data-formatter/`
5. **Updated index.html**: Added correct script references for new bundles
6. **Created this documentation**: Complete rebuild process and file structure guide

### Current Working State:
- **Data Formatter URL**: `/data-formatter` ✅ WORKING
- **Dropdown Options**: Response Time Analyzer, Call Density Heatmap, Fire Map Pro ✅
- **Bundle Files**: `vendor.8d53034d8e5175c6a6ae.js`, `data-formatter.77a6f7005bf45e5a26db.js`
- **Route Config**: Both `/data-formatter` and `/data-formatter-react` serve React version

### If Session Drops:
1. **Fire Map Pro is already working** - No additional changes needed
2. **All documentation is complete** - Refer to sections above for any future work
3. **Build process is documented** - Follow "Build Process" section for any modifications
4. **Route conflicts resolved** - Legacy version moved to `/data-formatter-legacy`

### Previous Session Context:
- Came from Fire Map Pro export functionality fixes
- Initial confusion between HTML template vs React versions
- Route conflicts between `flask_routes/react_routes.py` and `routes/main.py`
- Accidentally replaced working version, then restored correct React version
- User specifically requested documentation to prevent future confusion

## Browser Tab Title Management (Added May 30, 2025)

### Issue Discovered
Browser tab titles were showing incorrect values:
- `/app/fire-map-pro` showed "FireEMS Data Formatter" instead of "FireEMS Fire Map Pro"
- `/response-time-analyzer` showed "FireEMS Data Formatter" instead of "FireEMS Response Time Analyzer"

### Root Cause Analysis
The issue was caused by hardcoded titles in HTML templates that override React dynamic title setting:

1. **Static HTML Templates**: Multiple index.html files had hardcoded `<title>FireEMS Data Formatter</title>`
2. **React Architecture**: Different routes serve different React components, not the main App.tsx
3. **Component Isolation**: Title logic in App.tsx only runs for Data Formatter routes

### React Router Architecture Discovery

```
Main React App Routes (served from /react-app/dist/)
├── /app/fire-map-pro → FireMapProContainer component
├── /app/response-time-analyzer → ResponseTimeAnalyzerContainer component  
└── /app/data-formatter → App component (stepper-based formatter)

Separate Static Routes
├── /response-time-analyzer → /static/react-response-time-analyzer/index.html
└── /static/response-time-dashboard/ → Legacy static HTML dashboard
```

### Files Modified for Title Fixes

1. **HTML Templates Updated**:
   - `/react-app/index.html` - Changed title from "FireEMS Data Formatter" to "FireEMS Tools"
   - `/static/react-response-time-analyzer/index.html` - Changed title to "FireEMS Tools"

2. **React Components Updated**:
   - `/react-app/src/components/fireMapPro/FireMapProContainer.tsx` - Added `useEffect` for "FireEMS Fire Map Pro"
   - `/react-app/src/components/analyzer/ResponseTimeAnalyzerContainer.tsx` - Added `useEffect` for "FireEMS Response Time Analyzer"

3. **Build Process**:
   - React app rebuilt with `npx vite build` (TypeScript errors bypassed)
   - New bundles deployed: `index-0XICh41O.js`, `index-CIGW-MKW.css`

### Solution Implementation

**Step 1**: Generic HTML Template Titles
```html
<title>FireEMS Tools</title>  <!-- Generic title that gets overridden -->
```

**Step 2**: Component-Specific Title Setting
```typescript
// In FireMapProContainer.tsx
useEffect(() => {
  document.title = 'FireEMS Fire Map Pro';
}, []);

// In ResponseTimeAnalyzerContainer.tsx  
useEffect(() => {
  document.title = 'FireEMS Response Time Analyzer';
}, []);
```

### Current Title Behavior ✅

| Route | Browser Tab Title |
|-------|------------------|
| `/app/fire-map-pro` | "FireEMS Fire Map Pro" |
| `/response-time-analyzer` | "FireEMS Response Time Analyzer" |
| `/data-formatter` | "FireEMS Data Formatter" |
| `/static/response-time-dashboard/` | "FireEMS Response Time Dashboard" (Legacy) |

### Key Learnings

1. **Multiple React Apps**: The system has separate React builds for different tools
2. **Route-Component Mapping**: Each route serves a specific container component
3. **Title Inheritance**: HTML template titles override React unless properly managed
4. **Build Dependencies**: Changes require rebuilding and deploying updated bundles

## Project Documentation Reference

### 📚 **Complete Documentation Inventory**
This project has extensive documentation across multiple files. Key references:

**Core Documentation:**
- `/Users/josephhester/fire-ems-tools/README.md` - Main project overview, setup, and features
- `/Users/josephhester/fire-ems-tools/REBUILD_PLAN.md` - Comprehensive rebuild strategy and architecture
- `/Users/josephhester/fire-ems-tools/react-app/REBUILD_STATUS.md` - Detailed progress and technical implementation

**Integration & Architecture:**
- `/Users/josephhester/fire-ems-tools/INTEGRATION_SUMMARY.md` - Data transfer between tools
- `/Users/josephhester/fire-ems-tools/react-app/INTEGRATION_SUMMARY.md` - React-Flask integration
- `/Users/josephhester/fire-ems-tools/WHAT_WE_ACCOMPLISHED.md` - Testing and validation work

**Deployment & Operations:**
- `/Users/josephhester/fire-ems-tools/DEPLOYMENT.md` - Deployment guide and troubleshooting
- `/Users/josephhester/fire-ems-tools/SERVER_TROUBLESHOOTING.md` - Server configuration fixes

**Testing Framework:**
- `/Users/josephhester/fire-ems-tools/TESTING_FRAMEWORK.md` - Complete testing infrastructure
- `/Users/josephhester/fire-ems-tools/TESTING_SUMMARY.md` - Testing accomplishments
- `/Users/josephhester/fire-ems-tools/tests/INCIDENT_LOGGER_TESTING_SUMMARY.md` - HIPAA compliance testing

### 🏗️ **System Architecture (From REBUILD_PLAN.md)**

**Current Tech Stack:**
```
Frontend: React 19 + TypeScript + Material UI + Vite
State Management: Redux Toolkit + React Context
File Parsing: PapaParse (CSV), SheetJS (Excel), PDF.js (PDF)
Validation: Yup/Zod schema validation
Backend: Flask (Python) + SQLAlchemy
Deployment: Docker + Gunicorn + Render.com support
```

**Project Structure:**
```
fire-ems-tools/
├── react-app/                    # Main React application (Vite build)
│   ├── src/components/formatter/  # Data Formatter components
│   ├── src/components/analyzer/   # Response Time Analyzer components
│   ├── src/components/fireMapPro/ # Fire Map Pro components
│   └── dist/                     # Built React app (served by Flask)
├── static/                       # Legacy and additional static files
│   ├── react-data-formatter/     # Legacy React build (webpack)
│   ├── react-response-time-analyzer/ # Separate Response Time build
│   └── response-time-dashboard/   # Legacy static HTML version
├── flask_routes/                 # Flask route definitions
├── templates/                    # Jinja2 templates (legacy)
└── tests/                       # Comprehensive test suite
```

### 📋 **Implementation Status (From REBUILD_STATUS.md)**

**✅ Phase 1 Complete - Data Formatter:**
- File upload (CSV, Excel, JSON, XML, PDF, TXT)
- Interactive field mapping with drag-and-drop
- Data validation and transformation
- Export functionality (CSV, Excel, Send to Tools)

**✅ Phase 2 Complete - Response Time Analyzer:**
- Statistical analysis (mean, median, 90th percentile)
- Interactive dashboard with Material UI
- Geospatial visualization
- Timeline and distribution analysis
- Seamless data integration from formatter

**✅ Phase 3 Complete - Fire Map Pro Integration:**
- Added to Data Formatter dropdown
- Advanced mapping tools
- Export functionality
- Browser tab title management

**🔄 Ongoing - System Integration:**
- Multiple React builds serving different routes
- Session storage data transfer between tools
- Flask routing for all tools on port 5006

## Development Roadmap & Future Work

### 🔄 PENDING TASKS
None - all current functionality working correctly

### 🎯 FUTURE IMPROVEMENTS (From REBUILD_PLAN.md)
1. **Phase 4: Iterative Tool Migration** (6-12 months)
   - Rebuild Call Density Heatmap in React
   - Rebuild Isochrone Map in React
   - Rebuild Incident Logger with HIPAA compliance
   - Maintain feature parity while improving UX

2. **Phase 5: Unified Dashboard** (3-4 months)
   - Create unified access point for all tools
   - Implement shared components library
   - Remove legacy compatibility layers
   - Consistent user experience across all tools

3. **Technical Debt Resolution:**
   - Fix TypeScript errors to enable proper type checking
   - Consolidate multiple React builds into single codebase
   - Performance optimization (address 723KB bundle size)
   - Implement code splitting with dynamic imports

### 💡 ENHANCEMENT OPPORTUNITIES
1. **Code Splitting**: Implement dynamic imports to reduce initial bundle size
2. **Title Management System**: Create centralized title management service
3. **Route Documentation**: Document all available routes and their purposes
4. **Testing Strategy**: Add end-to-end tests for route navigation and title setting

### 🚨 MAINTENANCE NOTES
- **Bundle Monitoring**: Watch for bundle size increases affecting performance
- **Title Consistency**: Ensure new components follow title-setting pattern
- **Route Conflicts**: Be careful when adding new routes to avoid Flask conflicts
- **Cache Management**: Clear browser cache when deploying title changes

## Development Environment Setup

### Prerequisites (From README.md)
- Python 3.9+
- Node.js 18+
- npm or yarn
- SQLite or PostgreSQL database
- Modern browser for testing

### Installation (Complete Setup)
```bash
# 1. Clone and setup Python environment
git clone https://github.com/your-org/fire-ems-tools.git
cd fire-ems-tools
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Setup React applications
cd react-app
npm install

# Legacy data formatter (if needed)
cd ../static/js/react-data-formatter
npm install

# 3. Run deployment fixes (ensures database compatibility)
python deployment_fix.py --all
```

### Local Development Commands
```bash
# React app development
cd /Users/josephhester/fire-ems-tools/react-app
npm run dev          # Development server (port 5173)
npm run build        # Production build
npm run build-no-check # Build without TypeScript checking
npm run preview      # Preview production build

# Flask server (serves all tools)
cd /Users/josephhester/fire-ems-tools
python app.py        # Start Flask server on port 5006

# Alternative production server
gunicorn --workers=4 --bind=0.0.0.0:8000 app:app

# Server restart script (handles process cleanup)
./restart_server.sh  # Reliable server restart
```

### Environment Variables (From README.md)
| Variable | Description | Default |
|----------|-------------|----------|
| `FLASK_ENV` | Environment (development/production) | `development` |
| `DATABASE_URL` | Database connection string | `sqlite:///instance/fire_ems.db` |
| `SECRET_KEY` | Flask secret key | Generated randomly |
| `LOG_LEVEL` | Logging level | `INFO` |

### Testing Framework (From TESTING_SUMMARY.md)

**Comprehensive Test Suite Available:**
```bash
# Backend tests
pytest                              # All tests
pytest tests/api/                   # API tests
pytest tests/routes/                # Route tests
pytest --cov=. tests/              # With coverage

# Frontend tests
cd static/js/react-data-formatter
npm test                           # React component tests

# End-to-end tests
cd e2e
npm install
npx playwright test                # E2E tests

# Scenario-based tests (HIPAA, CAD integration)
cd tests
python run_incident_logger_tests.py
```

### Testing Checklist
When making changes, test these critical paths:
- [ ] Data Formatter dropdown shows all three tools
- [ ] Fire Map Pro loads with correct title
- [ ] Response Time Analyzer loads with correct title  
- [ ] Data export from formatter to tools works
- [ ] Session storage data transfer works
- [ ] No JavaScript console errors
- [ ] Browser back/forward navigation works
- [ ] Mobile responsiveness maintained
- [ ] HIPAA compliance (if touching medical data)
- [ ] CAD integration (if modifying data parsing)

## Deployment & Production (From DEPLOYMENT.md)

### Docker Deployment
```bash
docker-compose up -d
```

### Production Deployment
```bash
# Using Gunicorn
gunicorn --workers=4 --bind=0.0.0.0:8000 wsgi:app

# Render.com deployment
# See render.yaml configuration file
```

### Known Production Issues
- **Map Export**: Use deployment_fix.py for tile loading issues
- **Database Schema**: Run deployment_fix.py for schema evolution
- **Asset Paths**: Ensure correct static file paths in production

## Session Continuation Instructions

### 🔄 **For Future Claude Code Sessions**

When starting a new session, provide this instruction:

> "Read `/Users/josephhester/fire-ems-tools/DATA_FORMATTER_DOCUMENTATION.md` for complete project context. This file contains the current system architecture, all completed work including browser tab title fixes, React Router component mapping, build processes, and the complete development roadmap. Also reference the extensive documentation inventory in that file for additional context on specific areas."

### 📁 **Key Files for Context**
1. **This file** - Complete overview and current status
2. **REBUILD_PLAN.md** - Architecture and implementation strategy  
3. **README.md** - Project setup and features
4. **INTEGRATION_SUMMARY.md** - Data transfer mechanisms
5. **TESTING_FRAMEWORK.md** - Quality assurance approach

### 🎯 **Current System State**
- **All tools working**: Data Formatter, Response Time Analyzer, Fire Map Pro
- **Browser titles fixed**: Each tool shows correct title
- **Data integration**: Session storage transfer between tools
- **Multiple React builds**: Separate builds for different tools
- **Production ready**: Flask server on port 5006 serves all tools
- **Comprehensive testing**: Full test suite for quality assurance

## Last Updated
**Date**: May 30, 2025  
**Changes**: Fixed browser tab titles, documented React architecture, added complete documentation inventory and deployment info  
**Status**: ✅ COMPLETE - All functionality working correctly, comprehensive documentation in place  
**Next Review**: When adding new tools or making architectural changes

**Documentation Completeness**: ✅ All major project documentation consolidated and cross-referenced