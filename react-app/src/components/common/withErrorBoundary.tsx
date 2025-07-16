import React, { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AsyncErrorBoundary } from './AsyncErrorBoundary';

interface ErrorBoundaryOptions {
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface AsyncErrorBoundaryOptions {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRetry?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Higher-order component that wraps a component with ErrorBoundary
 * 
 * @param Component - The component to wrap
 * @param options - Error boundary configuration options
 * @returns Wrapped component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: ErrorBoundaryOptions = {}
): ComponentType<P> {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        showErrorDetails={options.showErrorDetails ?? import.meta.env.DEV}
        level={options.level}
        onError={options.onError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // Preserve component name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * Higher-order component that wraps a component with AsyncErrorBoundary
 * 
 * @param Component - The component to wrap
 * @param options - Async error boundary configuration options
 * @returns Wrapped component with async error boundary
 */
export function withAsyncErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: AsyncErrorBoundaryOptions = {}
): ComponentType<P> {
  const WrappedComponent = (props: P) => {
    return (
      <AsyncErrorBoundary
        fallback={options.fallback}
        onError={options.onError}
        onRetry={options.onRetry}
        maxRetries={options.maxRetries}
        retryDelay={options.retryDelay}
      >
        <Component {...props} />
      </AsyncErrorBoundary>
    );
  };

  // Preserve component name for debugging
  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * Decorator function for class components
 * 
 * @param options - Error boundary configuration options
 */
export function errorBoundary(options: ErrorBoundaryOptions = {}) {
  return function <T extends ComponentType<any>>(target: T): T {
    return withErrorBoundary(target, options) as T;
  };
}

/**
 * Decorator function for async class components
 * 
 * @param options - Async error boundary configuration options
 */
export function asyncErrorBoundary(options: AsyncErrorBoundaryOptions = {}) {
  return function <T extends ComponentType<any>>(target: T): T {
    return withAsyncErrorBoundary(target, options) as T;
  };
}

export default withErrorBoundary;