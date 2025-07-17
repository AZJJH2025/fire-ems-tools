import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Stack, Alert, Chip } from '@mui/material';
import { ErrorOutline, Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * ErrorBoundary - Catches and displays component-level errors gracefully
 * 
 * Features:
 * - Catches JavaScript errors in component tree
 * - Displays user-friendly error messages
 * - Provides recovery options (refresh, retry)
 * - Logs error details for debugging
 * - Supports different error levels (page, component, critical)
 * - Prevents entire app crashes
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    this.logError(error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      retryCount: this.retryCount,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Boundary - ${this.props.level || 'Component'} Level`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }

    // In production, you might want to send to error tracking service
    // Example: sendErrorToService(errorData);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      // Max retries reached, suggest page refresh
      this.handleRefresh();
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    const errorReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please paste it when reporting this issue.');
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(errorReport, null, 2);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Error report copied to clipboard. Please paste it when reporting this issue.');
      });
  };

  private getErrorTitle = (): string => {
    const { level } = this.props;
    switch (level) {
      case 'page':
        return 'Page Error';
      case 'critical':
        return 'Critical System Error';
      default:
        return 'Component Error';
    }
  };

  private getErrorMessage = (): string => {
    const { level } = this.props;
    switch (level) {
      case 'page':
        return 'This page encountered an error and cannot be displayed properly.';
      case 'critical':
        return 'A critical system error occurred. Please refresh the page or contact support.';
      default:
        return 'This component encountered an error and cannot be displayed properly.';
    }
  };

  private getErrorSeverity = (): 'error' | 'warning' => {
    return this.props.level === 'critical' ? 'error' : 'warning';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            border: '1px solid #f44336',
            borderRadius: 2,
            backgroundColor: '#ffeaa7',
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorOutline color="error" />
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

            <Alert severity={this.getErrorSeverity()}>
              {this.getErrorMessage()}
            </Alert>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                disabled={this.retryCount >= this.maxRetries}
              >
                {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Try Again'}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Refresh />}
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>

              <Button
                variant="outlined"
                color="info"
                startIcon={<BugReport />}
                onClick={this.handleReportError}
              >
                Report Error
              </Button>
            </Box>

            {this.props.showErrorDetails && this.state.error && (
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

export default ErrorBoundary;