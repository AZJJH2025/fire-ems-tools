import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import AppRouter from './AppRouter';
import { store } from './state/redux/store';
import { theme } from './theme';

// Initialize security configuration
import { initializeSecurity } from './security/contentSecurityPolicy';

// AGGRESSIVE CACHE BUST - FORCE RENDER TO SERVE LATEST BUILD - CHROME FIX JULY 27
console.log('🔥🔥🔥 MAIN.TSX CACHE BUST JULY 27 2025 - CHROME CACHING FIX - BUILD 2');

// Initialize security systems
initializeSecurity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);