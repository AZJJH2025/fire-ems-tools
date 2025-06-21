import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import App from './App';
import ResponseTimeAnalyzerContainer from './components/analyzer/ResponseTimeAnalyzerContainer';
import FireMapProContainer from './components/fireMapPro/FireMapProContainer';

/**
 * Main router component that handles routing between different tools
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter basename="/app">
      <CssBaseline />
      <Routes>
          {/* Default route redirects to Data Formatter */}
          <Route path="/" element={<Navigate to="/data-formatter" replace />} />
          
          {/* Data Formatter routes */}
          <Route path="/data-formatter" element={
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <App />
            </Container>
          } />
          <Route path="/data-formatter-react" element={
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <App />
            </Container>
          } />
          
          {/* Response Time Analyzer route */}
          <Route path="/response-time-analyzer" element={
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <ResponseTimeAnalyzerContainer />
            </Container>
          } />
          
          {/* Fire Map Pro routes - full screen */}
          <Route path="/fire-map-pro" element={<FireMapProContainer mode="create" />} />
          <Route path="/fire-map-pro-react" element={<FireMapProContainer mode="create" />} />
          
          {/* Fallback route for 404s */}
          <Route path="*" element={
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <div>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </Container>
          } />
        </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;