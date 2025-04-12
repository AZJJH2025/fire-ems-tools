# FireEMS.ai Resilience Framework

The FireEMS.ai Resilience Framework is a comprehensive solution for ensuring reliable operation of web applications in emergency and degraded modes, particularly focused on supporting emergency services applications where reliability is critical.

## Overview

The Resilience Framework consists of several core components that work together to provide a robust application architecture:

1. **Core Service** - The foundation that manages service registration, discovery, and lifecycle
2. **State Service** - Manages application state and data persistence across different operation modes
3. **Resilience Service** - Handles operation mode detection, fallbacks, and emergency modes
4. **Chart Manager Service** - Ensures stable visualization rendering in all operation conditions

## Chart Manager

The Chart Manager is a critical component that handles Chart.js instance lifecycle management to prevent common issues like "canvas is already in use" errors that can break visualizations during emergency mode or degraded operations.

### Features

- Centralized management of all Chart.js instances
- Canvas element regeneration to prevent reuse errors
- Memory leak prevention through proper cleanup
- Support for resilience framework integration
- Automatic cleanup during page navigation
- Integration with FireEMS Core framework

### Usage

```javascript
// Create a new chart with error protection
const chart = FireEMS.ChartManager.create('chart-id', 'bar', chartData, chartOptions);

// Update a chart without recreating it
FireEMS.ChartManager.update('chart-id', newData, newOptions);

// Destroy a chart when finished
FireEMS.ChartManager.destroy('chart-id');

// Destroy all charts (e.g., during page transitions)
FireEMS.ChartManager.destroyAll();
```

### Error Handling

The Chart Manager includes multiple layers of error protection:

1. Each chart creation includes canvas regeneration to prevent reuse
2. Deep copying of data to prevent reference issues
3. Fallback mechanisms when chart creation fails
4. Automatic cleanup during emergency mode
5. Attribute preservation during canvas recreation

## Operation Modes

The Resilience Framework supports four primary operation modes:

1. **Normal Mode** - All services functioning normally
2. **Degraded Mode** - Some services limited but core functionality available
3. **Emergency Mode** - Critical failures with emergency fallbacks active
4. **Offline Mode** - No network connectivity, using only local capabilities

During mode changes, the framework automatically adapts by:
- Activating appropriate fallbacks
- Cleaning up resources
- Adjusting UI to reflect current capabilities
- Enabling offline-compatible features

## Emergency Data Transfer

For emergency situations, the framework provides robust data transfer mechanisms between tools:

```javascript
// Store emergency data
const dataId = FireEMS.EmergencyMode.storeData(data, {
  expiration: 24 * 60 * 60 * 1000, // 24 hours
  compress: false
});

// Navigate to another tool with the data
FireEMS.EmergencyMode.sendToTool(data, 'fire-ems-dashboard');

// Retrieve emergency data
const data = FireEMS.EmergencyMode.retrieveData(dataId);
```

## Integration with App Architecture

The Resilience Framework integrates with the broader application architecture:

1. The framework initializes early in the page lifecycle
2. Core services are registered with dependency management
3. Operation mode is detected automatically
4. Event listeners for mode changes update UI appropriately
5. Canvas management is handled transparently

## Canvas Error Prevention Strategy

The primary source of rendering errors in emergency mode is improper Chart.js canvas handling. Our approach solves this with:

1. **Canvas Regeneration** - Creating fresh canvas elements before each chart
2. **Attribute Preservation** - Ensuring styles and data attributes persist
3. **Proper Cleanup** - Complete chart destruction with context clearing
4. **Fallback Creation** - Multiple fallback strategies when primary fails
5. **Framework Integration** - Automatic cleanup during mode switches