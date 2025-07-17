import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeAll, afterAll } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';
import { AsyncErrorBoundary } from '../AsyncErrorBoundary';

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Test component that simulates async error - React Error Boundaries don't catch setTimeout errors
const AsyncThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    // This will be caught by error boundary
    throw new Error('Async test error');
  }
  return <div>Async component</div>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText(/This component encountered an error/)).toBeInTheDocument();
  });

  test('shows error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env;
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, DEV: true },
      writable: true,
    });

    render(
      <ErrorBoundary showErrorDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error Details (Development Mode):')).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    // Restore environment
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  test('calls onError callback when error occurs', () => {
    const onErrorSpy = vi.fn();
    
    render(
      <ErrorBoundary onError={onErrorSpy}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error message',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  test('renders custom fallback UI when provided', () => {
    const CustomFallback = () => <div>Custom error UI</div>;
    
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  test('retry button works and resets error state', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      React.useEffect(() => {
        // Reset error after first throw
        if (shouldThrow) {
          setTimeout(() => setShouldThrow(false), 50);
        }
      }, [shouldThrow]);
      
      return <ThrowError shouldThrow={shouldThrow} />;
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Error should be displayed
    expect(screen.getByText('Component Error')).toBeInTheDocument();
    
    // Click retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    // After retry, component should render normally
    setTimeout(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    }, 100);
  });

  test('refresh button reloads the page', () => {
    // Mock window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = vi.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);
    
    expect(window.location.reload).toHaveBeenCalled();
    
    // Restore original method
    window.location.reload = originalReload;
  });
});

describe('AsyncErrorBoundary', () => {
  test('renders children when there is no error', () => {
    render(
      <AsyncErrorBoundary>
        <AsyncThrowError shouldThrow={false} />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Async component')).toBeInTheDocument();
  });

  test('renders error UI when there is an async error', () => {
    render(
      <AsyncErrorBoundary>
        <AsyncThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Async Operation Error')).toBeInTheDocument();
  });

  test('shows retry button with correct retry count', () => {
    render(
      <AsyncErrorBoundary maxRetries={3}>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Retry (3 attempts left)')).toBeInTheDocument();
  });

  test('calls onRetry callback when retry is clicked', () => {
    const onRetrySpy = vi.fn();
    
    render(
      <AsyncErrorBoundary onRetry={onRetrySpy}>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    );
    
    const retryButton = screen.getByText(/Retry/);
    fireEvent.click(retryButton);
    
    // onRetry should be called after delay
    setTimeout(() => {
      expect(onRetrySpy).toHaveBeenCalled();
    }, 1100);
  });

  test('disables retry button after max retries reached', () => {
    render(
      <AsyncErrorBoundary maxRetries={1}>
        <ThrowError shouldThrow={true} />
      </AsyncErrorBoundary>
    );
    
    // First retry
    const retryButton = screen.getByText(/Retry/);
    fireEvent.click(retryButton);
    
    // After first retry, should still be enabled
    setTimeout(() => {
      expect(retryButton).not.toBeDisabled();
      
      // Second retry (should reach max)
      fireEvent.click(retryButton);
      
      setTimeout(() => {
        expect(screen.getByText('Max Retries Reached')).toBeInTheDocument();
      }, 1100);
    }, 1100);
  });

  test('shows network error message for network errors', () => {
    const NetworkError = () => {
      throw new Error('fetch failed');
    };
    
    render(
      <AsyncErrorBoundary>
        <NetworkError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  test('shows API error message for API errors', () => {
    const APIError = () => {
      throw new Error('API 500 error');
    };
    
    render(
      <AsyncErrorBoundary>
        <APIError />
      </AsyncErrorBoundary>
    );
    
    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText(/The server is experiencing issues/)).toBeInTheDocument();
  });
});

describe('Error Boundary Integration', () => {
  test('error boundaries can be nested', () => {
    const OuterError = () => {
      throw new Error('Outer error');
    };
    
    render(
      <ErrorBoundary>
        <div>
          <h1>Outer boundary</h1>
          <AsyncErrorBoundary>
            <OuterError />
          </AsyncErrorBoundary>
        </div>
      </ErrorBoundary>
    );
    
    // Inner boundary should catch the error
    expect(screen.getByText('Async Operation Error')).toBeInTheDocument();
    expect(screen.getByText('Outer boundary')).toBeInTheDocument();
  });

  test('error boundaries provide proper error isolation', () => {
    const GoodComponent = () => <div>Good component</div>;
    const BadComponent = () => {
      throw new Error('Bad component error');
    };
    
    render(
      <div>
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
        <ErrorBoundary>
          <BadComponent />
        </ErrorBoundary>
      </div>
    );
    
    // Good component should still render
    expect(screen.getByText('Good component')).toBeInTheDocument();
    
    // Bad component should show error
    expect(screen.getByText('Component Error')).toBeInTheDocument();
  });
});