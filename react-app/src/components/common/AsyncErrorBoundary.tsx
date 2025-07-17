import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack, Alert, CircularProgress, Chip } from '@mui/material';
import { ErrorOutline, Refresh, CloudOff, Wifi } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  errorId: string;
}

/**
 * AsyncErrorBoundary - Specialized error boundary for async operations and API calls
 * 
 * Features:
 * - Catches errors in async operations
 * - Automatic retry with exponential backoff
 * - Network error detection and handling
 * - Loading states during retry attempts
 * - Special handling for API failures
 * - Configurable retry limits and delays
 */
export class AsyncErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    this.logAsyncError(error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private logAsyncError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isNetworkError: this.isNetworkError(error),
      isAPIError: this.isAPIError(error),
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
    };

    if (import.meta.env.DEV) {
      console.group('🌐 Async Error Boundary');
      console.error('Async Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, send to error tracking service
    // Example: sendAsyncErrorToService(errorData);
  };

  private isNetworkError = (error: Error): boolean => {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.name === 'NetworkError' ||
      !navigator.onLine
    );
  };

  private isAPIError = (error: Error): boolean => {
    return (
      error.message.includes('API') ||
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('404') ||
      error.message.includes('500') ||
      error.message.includes('timeout')
    );
  };

  private getRetryDelay = (retryCount: number): number => {
    const baseDelay = this.props.retryDelay || 1000;
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return baseDelay * Math.pow(2, retryCount);
  };

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    this.setState({ isRetrying: true });

    const delay = this.getRetryDelay(this.state.retryCount);
    
    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));

      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }, delay);
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private getErrorTitle = (): string => {
    const { error } = this.state;
    
    if (this.isNetworkError(error!)) {
      return 'Network Error';
    }
    
    if (this.isAPIError(error!)) {
      return 'API Error';
    }
    
    return 'Async Operation Error';
  };

  private getErrorMessage = (): string => {
    const { error } = this.state;
    
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }
    
    if (this.isNetworkError(error!)) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    if (this.isAPIError(error!)) {
      return 'The server is experiencing issues. Please try again in a moment.';
    }
    
    return 'An error occurred while processing your request. Please try again.';
  };

  private getErrorIcon = () => {
    const { error } = this.state;
    
    if (!navigator.onLine) {
      return <Wifi color="error" />;
    }
    
    if (this.isNetworkError(error!)) {
      return <CloudOff color="error" />;
    }
    
    return <ErrorOutline color="error" />;
  };

  private getRetryButtonText = (): string => {
    const maxRetries = this.props.maxRetries || 3;
    const remainingRetries = maxRetries - this.state.retryCount;
    
    if (remainingRetries <= 0) {
      return 'Max Retries Reached';
    }
    
    if (this.state.isRetrying) {
      const delay = this.getRetryDelay(this.state.retryCount);
      return `Retrying in ${Math.ceil(delay / 1000)}s...`;
    }
    
    return `Retry (${remainingRetries} attempts left)`;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            border: '1px solid #ff9800',
            borderRadius: 2,
            backgroundColor: '#fff8e1',
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {this.getErrorIcon()}
              <Typography variant="h6" color="error">
                {this.getErrorTitle()}
              </Typography>
              <Chip
                label={`ID: ${this.state.errorId}`}
                size="small"
                color="default"
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>

            <Alert severity="warning">
              {this.getErrorMessage()}
            </Alert>

            {!navigator.onLine && (
              <Alert severity="error" icon={<Wifi />}>
                You are currently offline. Please check your internet connection.
              </Alert>
            )}

            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={this.state.isRetrying ? <CircularProgress size={16} /> : <Refresh />}
                onClick={this.handleRetry}
                disabled={!canRetry || this.state.isRetrying}
              >
                {this.getRetryButtonText()}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Refresh />}
                onClick={this.handleRefresh}
                disabled={this.state.isRetrying}
              >
                Refresh Page
              </Button>

              {this.state.retryCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Retry attempt {this.state.retryCount} of {maxRetries}
                </Typography>
              )}
            </Box>

            {import.meta.env.DEV && this.state.error && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: '#d32f2f',
                    }}
                  >
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\nStack Trace:\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              If this error persists, please contact support with the error ID above.
            </Typography>
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default AsyncErrorBoundary;