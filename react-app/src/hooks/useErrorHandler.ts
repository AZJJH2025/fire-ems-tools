import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export interface ErrorInfo {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  category: 'ui' | 'api' | 'network' | 'validation' | 'system';
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface ErrorHandlerOptions {
  enableGlobalHandler?: boolean;
  enableUnhandledRejectionHandler?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  showUserNotification?: boolean;
}

/**
 * Custom hook for centralized error handling
 * 
 * Features:
 * - Centralized error logging and reporting
 * - Automatic error categorization
 * - User notification management
 * - Integration with error tracking services
 * - Global error and promise rejection handlers
 * - Context preservation for debugging
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const dispatch = useDispatch();

  const defaultOptions: ErrorHandlerOptions = {
    enableGlobalHandler: true,
    enableUnhandledRejectionHandler: true,
    logToConsole: import.meta.env.DEV,
    reportToService: import.meta.env.PROD,
    showUserNotification: true,
    ...options,
  };

  /**
   * Generate a unique error ID
   */
  const generateErrorId = useCallback((): string => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Categorize error based on error message and context
   */
  const categorizeError = useCallback((error: Error, context?: Record<string, any>): ErrorInfo['category'] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('api') || message.includes('401') || message.includes('403') || message.includes('404') || message.includes('500')) {
      return 'api';
    }
    
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation';
    }
    
    if (context?.component || message.includes('component') || message.includes('render')) {
      return 'ui';
    }
    
    return 'system';
  }, []);

  /**
   * Create structured error info
   */
  const createErrorInfo = useCallback((
    error: Error,
    level: ErrorInfo['level'] = 'error',
    context?: Record<string, any>
  ): ErrorInfo => {
    return {
      errorId: generateErrorId(),
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      level,
      category: categorizeError(error, context),
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
    };
  }, [generateErrorId, categorizeError]);

  /**
   * Log error to console (development mode)
   */
  const logToConsole = useCallback((errorInfo: ErrorInfo) => {
    if (!defaultOptions.logToConsole) return;

    const logMethod = errorInfo.level === 'error' ? console.error : 
                     errorInfo.level === 'warning' ? console.warn : 
                     console.info;

    console.group(`🚨 Error Handler - ${errorInfo.category.toUpperCase()} (${errorInfo.level.toUpperCase()})`);
    logMethod('Error ID:', errorInfo.errorId);
    logMethod('Message:', errorInfo.message);
    logMethod('Timestamp:', errorInfo.timestamp);
    logMethod('Category:', errorInfo.category);
    
    if (errorInfo.stack) {
      logMethod('Stack:', errorInfo.stack);
    }
    
    if (errorInfo.context) {
      logMethod('Context:', errorInfo.context);
    }
    
    console.groupEnd();
  }, [defaultOptions.logToConsole]);

  /**
   * Report error to external service
   */
  const reportToService = useCallback((_errorInfo: ErrorInfo) => {
    if (!defaultOptions.reportToService) return;

    // Example integration with error tracking service
    // Replace with your actual error tracking service
    
    /*
    try {
      // Sentry example
      if (window.Sentry) {
        window.Sentry.captureException(new Error(errorInfo.message), {
          tags: {
            errorId: errorInfo.errorId,
            category: errorInfo.category,
            level: errorInfo.level,
          },
          extra: {
            ...errorInfo.context,
            timestamp: errorInfo.timestamp,
          },
        });
      }
      
      // LogRocket example
      if (window.LogRocket) {
        window.LogRocket.captureException(new Error(errorInfo.message));
      }
      
      // Custom API endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      }).catch(err => {
        console.error('Failed to report error to service:', err);
      });
    } catch (serviceError) {
      console.error('Error reporting service failed:', serviceError);
    }
    */
  }, [defaultOptions.reportToService]);

  /**
   * Show user notification
   */
  const showUserNotification = useCallback((errorInfo: ErrorInfo) => {
    if (!defaultOptions.showUserNotification) return;

    // Dispatch Redux action to show notification
    // You can customize this based on your notification system
    
    /*
    dispatch({
      type: 'notifications/addNotification',
      payload: {
        id: errorInfo.errorId,
        type: errorInfo.level,
        title: errorInfo.category === 'network' ? 'Network Error' : 
               errorInfo.category === 'api' ? 'Server Error' : 
               'Application Error',
        message: errorInfo.message,
        duration: errorInfo.level === 'error' ? 10000 : 5000,
        actions: [
          {
            label: 'Retry',
            action: () => window.location.reload(),
          },
          {
            label: 'Report',
            action: () => {
              // Copy error ID to clipboard
              navigator.clipboard.writeText(errorInfo.errorId);
            },
          },
        ],
      },
    });
    */
  }, [defaultOptions.showUserNotification, dispatch]);

  /**
   * Main error handling function
   */
  const handleError = useCallback((
    error: Error,
    level: ErrorInfo['level'] = 'error',
    context?: Record<string, any>
  ): ErrorInfo => {
    const errorInfo = createErrorInfo(error, level, context);
    
    // Log to console
    logToConsole(errorInfo);
    
    // Report to service
    reportToService(errorInfo);
    
    // Show user notification
    showUserNotification(errorInfo);
    
    return errorInfo;
  }, [createErrorInfo, logToConsole, reportToService, showUserNotification]);

  /**
   * Handle async errors (promise rejections)
   */
  const handleAsyncError = useCallback((
    error: Error | any,
    context?: Record<string, any>
  ): ErrorInfo => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    return handleError(errorObj, 'error', { ...context, async: true });
  }, [handleError]);

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback((
    message: string,
    context?: Record<string, any>
  ): ErrorInfo => {
    const error = new Error(message);
    return handleError(error, 'warning', { ...context, validation: true });
  }, [handleError]);

  /**
   * Handle network errors
   */
  const handleNetworkError = useCallback((
    error: Error,
    context?: Record<string, any>
  ): ErrorInfo => {
    return handleError(error, 'error', { ...context, network: true });
  }, [handleError]);

  /**
   * Handle API errors
   */
  const handleApiError = useCallback((
    error: Error,
    statusCode?: number,
    context?: Record<string, any>
  ): ErrorInfo => {
    return handleError(error, 'error', { ...context, api: true, statusCode });
  }, [handleError]);

  /**
   * Global error handler
   */
  const globalErrorHandler = useCallback((event: ErrorEvent) => {
    const error = new Error(event.message);
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
    
    handleError(error, 'error', {
      global: true,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }, [handleError]);

  /**
   * Unhandled promise rejection handler
   */
  const unhandledRejectionHandler = useCallback((event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    handleAsyncError(error, {
      unhandledRejection: true,
      reason: event.reason,
    });
  }, [handleAsyncError]);

  /**
   * Set up global error handlers
   */
  useEffect(() => {
    if (defaultOptions.enableGlobalHandler) {
      window.addEventListener('error', globalErrorHandler);
    }
    
    if (defaultOptions.enableUnhandledRejectionHandler) {
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    }
    
    return () => {
      window.removeEventListener('error', globalErrorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, [defaultOptions.enableGlobalHandler, defaultOptions.enableUnhandledRejectionHandler, globalErrorHandler, unhandledRejectionHandler]);

  return {
    handleError,
    handleAsyncError,
    handleValidationError,
    handleNetworkError,
    handleApiError,
    createErrorInfo,
  };
}

export default useErrorHandler;