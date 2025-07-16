/**
 * Common components barrel export
 * 
 * This file provides centralized exports for all common components,
 * especially error boundaries and utilities.
 */

// Error boundary components
export { ErrorBoundary } from './ErrorBoundary';
export { AsyncErrorBoundary } from './AsyncErrorBoundary';
export { default as RouteErrorBoundary } from './RouteErrorBoundary';
export { default as ErrorBoundaryProvider, useErrorBoundary } from './ErrorBoundaryProvider';

// Higher-order components
export { 
  withErrorBoundary, 
  withAsyncErrorBoundary, 
  errorBoundary, 
  asyncErrorBoundary 
} from './withErrorBoundary';

// Types and interfaces
export type { 
  ErrorInfo as ErrorBoundaryErrorInfo,
  ErrorHandlerOptions,
} from '../../hooks/useErrorHandler';

// Re-export the error handler hook
export { useErrorHandler } from '../../hooks/useErrorHandler';

// Common error boundary configurations
export const commonErrorBoundaryConfigs = {
  // For page-level components
  page: {
    level: 'page' as const,
    showErrorDetails: false,
  },
  
  // For critical system components
  critical: {
    level: 'critical' as const,
    showErrorDetails: true,
  },
  
  // For regular components
  component: {
    level: 'component' as const,
    showErrorDetails: false,
  },
  
  // For async operations
  async: {
    maxRetries: 3,
    retryDelay: 1000,
  },
  
  // For development environments
  development: {
    showErrorDetails: true,
    level: 'component' as const,
  },
  
  // For production environments
  production: {
    showErrorDetails: false,
    level: 'component' as const,
  },
};

// Utility functions
export const createErrorBoundaryConfig = (
  environment: 'development' | 'production' = 'production',
  level: 'page' | 'component' | 'critical' = 'component'
) => {
  const baseConfig = commonErrorBoundaryConfigs[environment];
  const levelConfig = commonErrorBoundaryConfigs[level];
  
  return {
    ...baseConfig,
    ...levelConfig,
  };
};

export default {
  ErrorBoundary,
  AsyncErrorBoundary,
  RouteErrorBoundary,
  ErrorBoundaryProvider,
  useErrorBoundary,
  withErrorBoundary,
  withAsyncErrorBoundary,
  useErrorHandler,
  commonErrorBoundaryConfigs,
  createErrorBoundaryConfig,
};