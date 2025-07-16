import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface ErrorNotification {
  id: string;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
  action?: React.ReactNode;
}

interface ErrorBoundaryContextType {
  showErrorNotification: (message: string, severity?: AlertColor, duration?: number) => void;
  hideErrorNotification: (id: string) => void;
  handleError: (error: Error, context?: Record<string, any>) => void;
  handleAsyncError: (error: Error, context?: Record<string, any>) => void;
  handleValidationError: (message: string, context?: Record<string, any>) => void;
  handleNetworkError: (error: Error, context?: Record<string, any>) => void;
  handleApiError: (error: Error, statusCode?: number, context?: Record<string, any>) => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextType | undefined>(undefined);

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

/**
 * Error Boundary Provider - Provides centralized error handling context
 * 
 * Features:
 * - Centralized error handling across the app
 * - User-friendly error notifications
 * - Integration with error tracking services
 * - Context-aware error handling
 * - Automatic error categorization
 */
export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  
  const errorHandler = useErrorHandler({
    enableGlobalHandler: true,
    enableUnhandledRejectionHandler: true,
    logToConsole: import.meta.env.DEV,
    reportToService: import.meta.env.PROD,
    showUserNotification: false, // We'll handle notifications ourselves
  });

  const showErrorNotification = useCallback((
    message: string,
    severity: AlertColor = 'error',
    duration?: number
  ) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: ErrorNotification = {
      id,
      message,
      severity,
      autoHideDuration: duration || (severity === 'error' ? 10000 : 5000),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-hide after duration
    if (notification.autoHideDuration) {
      setTimeout(() => {
        hideErrorNotification(id);
      }, notification.autoHideDuration);
    }
  }, []);

  const hideErrorNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorInfo = errorHandler.handleError(error, 'error', context);
    
    // Show user-friendly notification
    let userMessage = error.message;
    
    // Customize message based on error category
    if (errorInfo.category === 'network') {
      userMessage = 'Network error occurred. Please check your connection and try again.';
    } else if (errorInfo.category === 'api') {
      userMessage = 'Server error occurred. Please try again in a moment.';
    } else if (errorInfo.category === 'validation') {
      userMessage = `Validation error: ${error.message}`;
    }
    
    showErrorNotification(userMessage, 'error');
  }, [errorHandler, showErrorNotification]);

  const handleAsyncError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorInfo = errorHandler.handleAsyncError(error, context);
    
    let userMessage = 'An async operation failed. Please try again.';
    
    if (errorInfo.category === 'network') {
      userMessage = 'Network request failed. Please check your connection and retry.';
    } else if (errorInfo.category === 'api') {
      userMessage = 'Server request failed. Please try again in a moment.';
    }
    
    showErrorNotification(userMessage, 'error');
  }, [errorHandler, showErrorNotification]);

  const handleValidationError = useCallback((message: string, context?: Record<string, any>) => {
    errorHandler.handleValidationError(message, context);
    showErrorNotification(message, 'warning');
  }, [errorHandler, showErrorNotification]);

  const handleNetworkError = useCallback((error: Error, context?: Record<string, any>) => {
    errorHandler.handleNetworkError(error, context);
    showErrorNotification('Network error. Please check your connection and try again.', 'error');
  }, [errorHandler, showErrorNotification]);

  const handleApiError = useCallback((error: Error, statusCode?: number, context?: Record<string, any>) => {
    errorHandler.handleApiError(error, statusCode, context);
    
    let userMessage = 'Server error occurred. Please try again.';
    
    if (statusCode === 401) {
      userMessage = 'Authentication required. Please log in again.';
    } else if (statusCode === 403) {
      userMessage = 'Access denied. You do not have permission to perform this action.';
    } else if (statusCode === 404) {
      userMessage = 'Resource not found. Please check the URL and try again.';
    } else if (statusCode === 429) {
      userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (statusCode && statusCode >= 500) {
      userMessage = 'Server error. Please try again later.';
    }
    
    showErrorNotification(userMessage, 'error');
  }, [errorHandler, showErrorNotification]);

  const contextValue: ErrorBoundaryContextType = {
    showErrorNotification,
    hideErrorNotification,
    handleError,
    handleAsyncError,
    handleValidationError,
    handleNetworkError,
    handleApiError,
  };

  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      {children}
      
      {/* Error Notification Snackbars */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => hideErrorNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 8 }} // Offset for app bar
        >
          <Alert
            onClose={() => hideErrorNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
            action={notification.action}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </ErrorBoundaryContext.Provider>
  );
};

/**
 * Hook to use error boundary context
 */
export const useErrorBoundary = (): ErrorBoundaryContextType => {
  const context = useContext(ErrorBoundaryContext);
  
  if (context === undefined) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundaryProvider');
  }
  
  return context;
};

export default ErrorBoundaryProvider;