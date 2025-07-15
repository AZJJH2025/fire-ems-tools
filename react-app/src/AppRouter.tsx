import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, CircularProgress, Box } from '@mui/material';

// Direct import to force App into main bundle (fixes lazy loading cache issue)
import App from './App';
const ResponseTimeAnalyzerContainer = React.lazy(() => import('./components/analyzer/ResponseTimeAnalyzerContainer'));
const FireMapProContainer = React.lazy(() => import('./components/fireMapPro/FireMapProContainer'));
const WaterSupplyCoverageContainer = React.lazy(() => import('./components/waterSupplyCoverage/WaterSupplyCoverageContainer'));
const ISOCreditContainer = React.lazy(() => import('./components/isoCredit/ISOCreditContainer'));
const StationCoverageContainer = React.lazy(() => import('./components/stationCoverage/StationCoverageContainer'));
const FireEMSHomepage = React.lazy(() => import('./components/homepage/FireEMSHomepage'));

// Authentication components
const SignUpPage = React.lazy(() => import('./components/auth/SignUpPage'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const ResetPasswordPage = React.lazy(() => import('./components/auth/ResetPasswordPage'));

// Admin components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));

// Loading component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

/**
 * Main router component that handles routing between different tools
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
            {/* Homepage as default route */}
            <Route path="/" element={<FireEMSHomepage />} />
            
            {/* Authentication routes */}
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
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
            
            {/* Water Supply Coverage route - full implementation */}
            <Route path="/water-supply-coverage" element={<WaterSupplyCoverageContainer mode="analysis" />} />
            
            {/* ISO Credit Calculator route - full screen */}
            <Route path="/iso-credit-calculator" element={<ISOCreditContainer mode="assessment" />} />
            
            {/* Station Coverage Optimizer route - full screen */}
            <Route path="/station-coverage-optimizer" element={<StationCoverageContainer mode="analysis" />} />
            
            {/* Legacy Tank Zone Coverage route - redirect to new tool */}
            <Route path="/tank-zone-coverage" element={<WaterSupplyCoverageContainer mode="analysis" />} />
            
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;