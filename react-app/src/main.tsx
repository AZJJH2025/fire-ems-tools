import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import AppRouter from './AppRouter';
import { store } from './state/redux/store';
import { theme } from './theme';

// AGGRESSIVE CACHE BUST - FORCE RENDER TO SERVE LATEST BUILD
console.log('🔥🔥🔥 MAIN.TSX CACHE BUST JULY 12 2025 22:50 - FORCE NEW BUILD');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);