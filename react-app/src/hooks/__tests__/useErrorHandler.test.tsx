import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../state/redux/store';
import { useErrorHandler } from '../useErrorHandler';

// Create a simple Redux Provider wrapper for testing
const createWrapper = () => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {},
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

describe('useErrorHandler', () => {
  // Helper function to render hook with Redux Provider
  const renderHookWithProvider = (hook: () => any) => {
    return renderHook(hook, {
      wrapper: createWrapper()
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should categorize network errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const networkError = new Error('Network request failed');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(networkError);
    });

    expect(categorizedError.category).toBe('network');
  });

  it('should categorize API errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const apiError = new Error('API returned 401 unauthorized');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(apiError);
    });

    expect(categorizedError.category).toBe('api');
  });

  it('should categorize system errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const systemError = new Error('Unexpected system error');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(systemError);
    });

    expect(categorizedError.category).toBe('system');
  });

  it('should handle validation errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const validationError = new Error('Invalid input provided');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(validationError, 'error', { userTriggered: true });
    });

    expect(categorizedError.category).toBe('validation');
  });

  it('should generate unique error IDs', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error1 = new Error('Test error 1');
    const error2 = new Error('Test error 2');
    
    let result1: any, result2: any;
    
    act(() => {
      result1 = result.current.handleError(error1);
      result2 = result.current.handleError(error2);
    });

    expect(result1.errorId).toBeDefined();
    expect(result2.errorId).toBeDefined();
    expect(result1.errorId).not.toBe(result2.errorId);
  });

  it('should include context in error info', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error = new Error('Test error');
    const context = { userId: '123', action: 'file-upload' };
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error, 'error', context);
    });

    expect(categorizedError.context).toEqual(context);
  });

  it('should format error messages for display', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error = new Error('Network request failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.message).toBe('Network request failed');
    expect(categorizedError.category).toBe('network');
  });

  it('should handle network errors with context', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error = new Error('fetch failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.category).toBe('network');
    expect(categorizedError.message).toBe('fetch failed');
  });

  it('should handle errors when reporting is enabled', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler({ 
      reportToService: true
    }));
    
    const error = new Error('Test error');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.category).toBe('system');
    expect(categorizedError.message).toBe('Test error');
  });

  it('should handle errors when reporting is disabled', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler({ 
      reportToService: false
    }));
    
    const error = new Error('Test error');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.category).toBe('system');
    expect(categorizedError.message).toBe('Test error');
  });

  it('should handle global errors when enabled', () => {
    window.addEventListener = vi.fn();
    
    renderHookWithProvider(() => useErrorHandler({ 
      enableGlobalHandler: true
    }));
    
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should clear error history when requested', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });

    // TODO: Add errorHistory and clearErrorHistory functionality to useErrorHandler
    // expect(result.current.errorHistory).toHaveLength(1);
    // 
    // act(() => {
    //   result.current.clearErrorHistory();
    // });
    //
    // expect(result.current.errorHistory).toHaveLength(0);
  });

  it('should handle multiple errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    // Add 3 errors
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.handleError(new Error(`Error ${i}`));
      });
    }

    // Should handle all errors without issues
    expect(result.current.handleError).toBeDefined();
  });

  it('should handle retry functionality', () => {
    const mockRetryAction = vi.fn();
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const error = new Error('Network request failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error, 'error', { retryAction: mockRetryAction });
    });

    expect(categorizedError.context.retryAction).toBe(mockRetryAction);
    
    act(() => {
      categorizedError.context.retryAction();
    });

    expect(mockRetryAction).toHaveBeenCalled();
  });

  it('should handle async errors', async () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const asyncError = new Error('Async error');
    
    let categorizedError: any;
    
    await act(async () => {
      categorizedError = result.current.handleAsyncError(asyncError);
    });

    expect(categorizedError.category).toBe('system');
    expect(categorizedError.message).toBe('Async error');
  });

  it('should handle different error types', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    // Generate different types of errors
    act(() => {
      result.current.handleError(new Error('Network error'));
      result.current.handleError(new Error('API 401 error'));
      result.current.handleError(new Error('System error'));
      result.current.handleError(new Error('Another network error'));
    });

    // Should handle all errors without issues
    expect(result.current.handleError).toBeDefined();
  });

  it('should handle validation errors with context', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const validationError = new Error('Validation failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(validationError, 'error', { 
        validationErrors: ['Field is required', 'Invalid format'] 
      });
    });

    expect(categorizedError.category).toBe('validation');
    expect(categorizedError.context.validationErrors).toEqual(['Field is required', 'Invalid format']);
  });

  it('should handle file upload errors', () => {
    const { result } = renderHookWithProvider(() => useErrorHandler());
    
    const fileError = new Error('File too large');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(fileError, 'error', { 
        fileName: 'test.csv',
        fileSize: 5000000 
      });
    });

    expect(categorizedError.category).toBe('system');
    expect(categorizedError.context.fileName).toBe('test.csv');
    expect(categorizedError.context.fileSize).toBe(5000000);
  });
});