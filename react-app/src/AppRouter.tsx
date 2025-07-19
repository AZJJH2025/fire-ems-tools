import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Container, CssBaseline, CircularProgress, Box } from '@mui/material';

// Error boundary components
import ErrorBoundaryProvider from './components/common/ErrorBoundaryProvider';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import { AsyncErrorBoundary } from './components/common/AsyncErrorBoundary';

// AI Chat Widget
import AIChatWidget from './components/common/AIChatWidget';

// Authentication route guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

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

// Context-aware AI Chat Wrapper
const ContextAwareAIChat: React.FC = () => {
  const location = useLocation();
  
  // Determine context based on current route
  const getContextFromPath = (pathname: string): string | undefined => {
    if (pathname.includes('data-formatter')) return 'data-formatter';
    if (pathname.includes('response-time-analyzer')) return 'response-time-analyzer';
    if (pathname.includes('fire-map-pro')) return 'fire-map-pro';
    if (pathname.includes('water-supply-coverage')) return 'water-supply-coverage';
    if (pathname.includes('iso-credit-calculator')) return 'iso-credit-calculator';
    if (pathname.includes('station-coverage-optimizer')) return 'station-coverage-optimizer';
    return undefined;
  };
  
  const context = getContextFromPath(location.pathname);
  
  // Only show AI chat widget on tool routes (not on auth/admin pages)
  if (!context) {
    return null;
  }
  
  return <AIChatWidget context={context} position="bottom-right" />;
};

/**
 * Main router component that handles routing between different tools
 */
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <ErrorBoundaryProvider>
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            {/* Homepage as default route - public */}
            <Route path="/" element={
              <PublicRoute>
                <FireEMSHomepage />
              </PublicRoute>
            } />
            
            {/* Authentication routes - public only for non-authenticated users */}
            <Route path="/signup" element={
              <PublicRoute restrictWhenAuthenticated={true}>
                <SignUpPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute restrictWhenAuthenticated={true}>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute restrictWhenAuthenticated={true}>
                <ResetPasswordPage />
              </PublicRoute>
            } />
            
            {/* Admin routes - require admin role */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Data Formatter routes - protected */}
            <Route path="/data-formatter" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <App />
                  </Container>
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/data-formatter-react" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <App />
                  </Container>
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Response Time Analyzer route - protected */}
            <Route path="/response-time-analyzer" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <ResponseTimeAnalyzerContainer />
                  </Container>
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Fire Map Pro routes - protected, full screen */}
            <Route path="/fire-map-pro" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <FireMapProContainer mode="create" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/fire-map-pro-react" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <FireMapProContainer mode="create" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Water Supply Coverage route - protected, full implementation */}
            <Route path="/water-supply-coverage" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <WaterSupplyCoverageContainer mode="analysis" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* ISO Credit Calculator route - protected, full screen */}
            <Route path="/iso-credit-calculator" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <ISOCreditContainer mode="assessment" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Station Coverage Optimizer route - protected, full screen */}
            <Route path="/station-coverage-optimizer" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <StationCoverageContainer mode="analysis" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Legacy Tank Zone Coverage route - protected, redirect to new tool */}
            <Route path="/tank-zone-coverage" element={
              <ProtectedRoute>
                <AsyncErrorBoundary>
                  <WaterSupplyCoverageContainer mode="analysis" />
                </AsyncErrorBoundary>
              </ProtectedRoute>
            } />
            
            {/* Fallback route for 404s - public */}
            <Route path="*" element={
              <PublicRoute>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                  <div>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                </Container>
              </PublicRoute>
            } />
            </Routes>
            {/* AI Chat Widget - appears on all tool pages */}
            <ContextAwareAIChat />
          </Suspense>
        </RouteErrorBoundary>
      </ErrorBoundaryProvider>
    </BrowserRouter>
  );
};

export default AppRouter;