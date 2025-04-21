import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import App from './components/App';
import { DataProvider } from './context/DataContext';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

/**
 * Mount the Data Formatter UI component to a container element
 * @param {HTMLElement} container - The DOM element to mount the component
 * @param {Object} data - Initial data including sourceColumns, sampleData, selectedTool
 * @param {Function} onMappingComplete - Callback function when mapping is complete
 */
function mount(container, data, onMappingComplete) {
  if (!container) {
    console.error('No container element provided for DataFormatterUI');
    return;
  }

  // Import ErrorBoundary dynamically to avoid circular dependencies
  const ErrorBoundary = require('./components/ErrorBoundary').default;
  
  ReactDOM.render(
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DataProvider initialData={data}>
          <App onMappingComplete={onMappingComplete} />
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>,
    container
  );
}

/**
 * Unmount the Data Formatter UI component
 * @param {HTMLElement} container - The DOM element where the component is mounted
 */
function unmount(container) {
  if (container) {
    ReactDOM.unmountComponentAtNode(container);
  }
}

// Expose the mount and unmount functions for external use
export { mount, unmount };

// Create a global object for non-module access
if (typeof window !== 'undefined') {
  window.DataFormatterUI = { mount, unmount };
}

// For development/testing - render directly if running standalone
if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
  const devContainer = document.getElementById('data-formatter-root');
  if (devContainer) {
    const testData = {
      sourceColumns: ['incident_number', 'call_date', 'call_time', 'dispatch_time'],
      sampleData: [
        {
          'incident_number': 'TEST-001',
          'call_date': '2023-04-15',
          'call_time': '08:24:32',
          'dispatch_time': '08:25:11'
        }
      ],
      selectedTool: 'response-time'
    };

    mount(devContainer, testData, (mappings) => console.log('Mappings:', mappings));
  }
}