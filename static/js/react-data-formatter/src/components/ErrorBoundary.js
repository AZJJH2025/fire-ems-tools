import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('React Data Formatter Error Caught:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to window for debugging
    if (window.formatterState) {
      window.formatterState.lastError = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      };
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{
          margin: '20px',
          padding: '20px',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h3 style={{ marginTop: 0 }}>Something went wrong with the Data Formatter</h3>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              <summary>Error Details (for technical support)</summary>
              <p><strong>Error:</strong> {this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
              )}
            </details>
          )}
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;