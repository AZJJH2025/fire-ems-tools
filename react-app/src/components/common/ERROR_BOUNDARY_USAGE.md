# Error Boundary Usage Guide

This guide explains how to use the error boundary system in the Fire EMS Tools application.

## Overview

The error boundary system provides comprehensive error handling throughout the application:

- **ErrorBoundary**: Basic error boundary for component-level errors
- **AsyncErrorBoundary**: Specialized for async operations with retry logic
- **RouteErrorBoundary**: Route-level error handling with navigation options
- **ErrorBoundaryProvider**: Global error handling context and notifications

## Quick Start

### 1. Basic Error Boundary

```tsx
import { ErrorBoundary } from '../components/common';

const MyComponent = () => {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
};
```

### 2. Async Error Boundary

```tsx
import { AsyncErrorBoundary } from '../components/common';

const MyAsyncComponent = () => {
  return (
    <AsyncErrorBoundary maxRetries={3} retryDelay={1000}>
      <ComponentThatMakesAPIRequests />
    </AsyncErrorBoundary>
  );
};
```

### 3. Higher-Order Component

```tsx
import { withErrorBoundary } from '../components/common';

const MyComponent = () => {
  return <div>My content</div>;
};

export default withErrorBoundary(MyComponent, {
  level: 'component',
  showErrorDetails: true,
});
```

### 4. Using Error Context

```tsx
import { useErrorBoundary } from '../components/common';

const MyComponent = () => {
  const { handleError, handleApiError, showErrorNotification } = useErrorBoundary();

  const handleSubmit = async () => {
    try {
      await api.submitData();
    } catch (error) {
      handleApiError(error, 500, { component: 'MyComponent', action: 'submit' });
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

## Error Boundary Types

### ErrorBoundary

Basic error boundary for catching component-level errors.

**Props:**
- `children`: React nodes to wrap
- `fallback`: Custom fallback UI
- `showErrorDetails`: Show error details (default: dev mode only)
- `level`: Error level ('page', 'component', 'critical')
- `onError`: Error callback function

**Use Cases:**
- Wrapping individual components
- Preventing component crashes from breaking the entire app
- Providing user-friendly error messages

### AsyncErrorBoundary

Specialized error boundary for async operations with automatic retry.

**Props:**
- `children`: React nodes to wrap
- `fallback`: Custom fallback UI
- `onError`: Error callback function
- `onRetry`: Retry callback function
- `maxRetries`: Maximum retry attempts (default: 3)
- `retryDelay`: Delay between retries in ms (default: 1000)

**Features:**
- Automatic retry with exponential backoff
- Network error detection
- API error handling
- Loading states during retries

**Use Cases:**
- Components that make API calls
- Network-dependent operations
- File uploads/downloads
- Data synchronization

### RouteErrorBoundary

Route-level error boundary with navigation options.

**Props:**
- `children`: React nodes to wrap

**Features:**
- Route-specific error messages
- Navigation buttons (Home, Back, Refresh)
- Context-aware error suggestions
- Route path display

**Use Cases:**
- Wrapping entire routes
- Providing navigation options on errors
- Route-specific error handling

### ErrorBoundaryProvider

Global error handling context and notification system.

**Features:**
- Centralized error handling
- User-friendly notifications
- Error categorization
- Integration with error tracking services

**Methods:**
- `handleError(error, context)`: Handle general errors
- `handleAsyncError(error, context)`: Handle async errors
- `handleValidationError(message, context)`: Handle validation errors
- `handleNetworkError(error, context)`: Handle network errors
- `handleApiError(error, statusCode, context)`: Handle API errors
- `showErrorNotification(message, severity, duration)`: Show notifications

## Configuration Options

### Error Levels

- **page**: Page-level errors, shows navigation options
- **component**: Component-level errors, shows retry options
- **critical**: Critical system errors, shows detailed information

### Error Categories

Errors are automatically categorized:
- **ui**: User interface errors
- **api**: API and server errors
- **network**: Network connectivity errors
- **validation**: Data validation errors
- **system**: General system errors

### Environment Configurations

```tsx
import { createErrorBoundaryConfig } from '../components/common';

// Development configuration
const devConfig = createErrorBoundaryConfig('development', 'component');

// Production configuration
const prodConfig = createErrorBoundaryConfig('production', 'page');
```

## Best Practices

### 1. Error Boundary Placement

```tsx
// ✅ Good: Wrap individual components
<ErrorBoundary>
  <DataTable />
</ErrorBoundary>

// ✅ Good: Wrap route components
<RouteErrorBoundary>
  <DataFormatterPage />
</RouteErrorBoundary>

// ❌ Bad: Wrapping too broadly
<ErrorBoundary>
  <EntireApplication />
</ErrorBoundary>
```

### 2. Async Operations

```tsx
// ✅ Good: Use AsyncErrorBoundary for API calls
<AsyncErrorBoundary maxRetries={3}>
  <UserProfileComponent />
</AsyncErrorBoundary>

// ✅ Good: Handle errors in context
const { handleApiError } = useErrorBoundary();

const loadData = async () => {
  try {
    const data = await api.getData();
    setData(data);
  } catch (error) {
    handleApiError(error, error.status, { component: 'UserProfile' });
  }
};
```

### 3. Error Context

```tsx
// ✅ Good: Provide meaningful context
handleError(error, {
  component: 'DataFormatter',
  action: 'fileUpload',
  fileName: file.name,
  fileSize: file.size,
});

// ❌ Bad: No context
handleError(error);
```

### 4. Custom Fallback UI

```tsx
// ✅ Good: Custom fallback for specific components
const CustomFallback = () => (
  <Box p={2}>
    <Typography>Unable to load data table</Typography>
    <Button onClick={() => window.location.reload()}>
      Retry
    </Button>
  </Box>
);

<ErrorBoundary fallback={<CustomFallback />}>
  <DataTable />
</ErrorBoundary>
```

## Integration with Application

### 1. App Router Integration

The error boundary system is integrated at the router level:

```tsx
// AppRouter.tsx
<ErrorBoundaryProvider>
  <RouteErrorBoundary>
    <Routes>
      <Route path="/data-formatter" element={
        <AsyncErrorBoundary>
          <DataFormatterPage />
        </AsyncErrorBoundary>
      } />
    </Routes>
  </RouteErrorBoundary>
</ErrorBoundaryProvider>
```

### 2. Component-Level Integration

Individual components can use error boundaries:

```tsx
// DataFormatterPage.tsx
import { withErrorBoundary } from '../components/common';

const DataFormatterPage = () => {
  // Component logic
};

export default withErrorBoundary(DataFormatterPage, {
  level: 'component',
  showErrorDetails: process.env.NODE_ENV === 'development',
});
```

### 3. Service Integration

Services can use the error context:

```tsx
// apiService.ts
import { useErrorBoundary } from '../components/common';

export const useApiService = () => {
  const { handleApiError } = useErrorBoundary();
  
  const makeRequest = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      handleApiError(error, response?.status);
      throw error;
    }
  };
  
  return { makeRequest };
};
```

## Error Reporting

### Development

In development mode:
- Errors are logged to console with full details
- Error boundaries show detailed error information
- Stack traces are displayed

### Production

In production mode:
- Errors are sent to error tracking services
- User-friendly error messages are displayed
- Sensitive information is hidden

### Error Tracking Integration

```tsx
// Example Sentry integration
const errorHandler = useErrorHandler({
  reportToService: true,
  enableGlobalHandler: true,
});

// Errors are automatically reported to configured services
```

## Testing Error Boundaries

### 1. Error Simulation

```tsx
// TestErrorComponent.tsx
const TestErrorComponent = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test usage
<ErrorBoundary>
  <TestErrorComponent shouldError={true} />
</ErrorBoundary>
```

### 2. Async Error Testing

```tsx
// Test async errors
const TestAsyncComponent = () => {
  React.useEffect(() => {
    // Simulate async error
    setTimeout(() => {
      throw new Error('Async error');
    }, 1000);
  }, []);
  
  return <div>Loading...</div>;
};
```

### 3. Network Error Testing

```tsx
// Test network errors
const TestNetworkComponent = () => {
  const { handleNetworkError } = useErrorBoundary();
  
  const testNetworkError = () => {
    handleNetworkError(new Error('Network timeout'), {
      component: 'TestNetwork',
      url: 'https://api.example.com',
    });
  };
  
  return <button onClick={testNetworkError}>Test Network Error</button>;
};
```

## Troubleshooting

### Common Issues

1. **Error boundaries not catching errors**
   - Error boundaries only catch errors in child components
   - They don't catch errors in event handlers, async code, or during SSR

2. **Async errors not being caught**
   - Use try/catch in async functions
   - Use AsyncErrorBoundary for components with async operations

3. **Error notifications not showing**
   - Ensure ErrorBoundaryProvider is wrapping your app
   - Check that useErrorBoundary is called within the provider

### Debug Mode

Enable debug mode to see detailed error information:

```tsx
// Add to your development environment
const errorHandler = useErrorHandler({
  logToConsole: true,
  showErrorDetails: true,
});
```

## Performance Considerations

- Error boundaries have minimal performance impact
- Use specific error boundaries rather than wrapping everything
- Async error boundaries include retry logic - configure appropriately
- Error notifications are automatically cleaned up

## Security Considerations

- Error details are hidden in production by default
- Stack traces are not exposed to users in production
- Error reporting includes sanitization of sensitive data
- Error IDs are generated for tracking without exposing system details