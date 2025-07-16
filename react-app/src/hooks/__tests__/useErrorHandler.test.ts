import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should categorize network errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const networkError = new Error('Network request failed');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(networkError);
    });

    expect(categorizedError.category).toBe('network');
  });

  it('should categorize API errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const apiError = new Error('API returned 401 unauthorized');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(apiError);
    });

    expect(categorizedError.category).toBe('api');
  });

  it('should categorize system errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const systemError = new Error('Unexpected system error');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(systemError);
    });

    expect(categorizedError.category).toBe('system');
  });

  it('should handle user errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const userError = new Error('Invalid input provided');
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(userError, { userTriggered: true });
    });

    expect(categorizedError.category).toBe('user');
  });

  it('should generate unique error IDs', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error1 = new Error('Test error 1');
    const error2 = new Error('Test error 2');
    
    let result1: any, result2: any;
    
    act(() => {
      result1 = result.current.handleError(error1);
      result2 = result.current.handleError(error2);
    });

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toBe(result2.id);
  });

  it('should include context in error info', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Test error');
    const context = { userId: '123', action: 'file-upload' };
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error, context);
    });

    expect(categorizedError.context).toEqual(context);
  });

  it('should format error messages for display', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Network request failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.userMessage).toBe('Unable to connect to the server. Please check your internet connection and try again.');
  });

  it('should suggest recovery actions', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('fetch failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error);
    });

    expect(categorizedError.recoveryActions).toContain('refresh');
    expect(categorizedError.recoveryActions).toContain('retry');
  });

  it('should report errors when enabled', () => {
    const mockReportError = vi.fn();
    const { result } = renderHook(() => useErrorHandler({ 
      enableReporting: true,
      reportError: mockReportError 
    }));
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });

    expect(mockReportError).toHaveBeenCalledWith(expect.objectContaining({
      originalError: error,
      category: 'system',
    }));
  });

  it('should not report errors when disabled', () => {
    const mockReportError = vi.fn();
    const { result } = renderHook(() => useErrorHandler({ 
      enableReporting: false,
      reportError: mockReportError 
    }));
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });

    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('should handle global errors when enabled', () => {
    const mockGlobalHandler = vi.fn();
    window.addEventListener = vi.fn();
    
    renderHook(() => useErrorHandler({ 
      enableGlobalHandler: true,
      onGlobalError: mockGlobalHandler 
    }));
    
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('should clear error history when requested', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Test error');
    
    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.errorHistory).toHaveLength(1);
    
    act(() => {
      result.current.clearErrorHistory();
    });

    expect(result.current.errorHistory).toHaveLength(0);
  });

  it('should maintain error history with limits', () => {
    const { result } = renderHook(() => useErrorHandler({ maxHistorySize: 3 }));
    
    // Add 5 errors
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.handleError(new Error(`Error ${i}`));
      });
    }

    // Should only keep the last 3
    expect(result.current.errorHistory).toHaveLength(3);
    expect(result.current.errorHistory[0].originalError.message).toBe('Error 2');
    expect(result.current.errorHistory[2].originalError.message).toBe('Error 4');
  });

  it('should handle retry functionality', () => {
    const mockRetryAction = vi.fn();
    const { result } = renderHook(() => useErrorHandler());
    
    const error = new Error('Network request failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(error, { retryAction: mockRetryAction });
    });

    expect(categorizedError.retryAction).toBe(mockRetryAction);
    
    act(() => {
      categorizedError.retryAction();
    });

    expect(mockRetryAction).toHaveBeenCalled();
  });

  it('should handle async errors', async () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const asyncError = Promise.reject(new Error('Async error'));
    
    let categorizedError: any;
    
    await act(async () => {
      categorizedError = await result.current.handleAsyncError(asyncError);
    });

    expect(categorizedError.category).toBe('system');
    expect(categorizedError.originalError.message).toBe('Async error');
  });

  it('should provide error statistics', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    // Generate different types of errors
    act(() => {
      result.current.handleError(new Error('Network error'));
      result.current.handleError(new Error('API 401 error'));
      result.current.handleError(new Error('System error'));
      result.current.handleError(new Error('Another network error'));
    });

    const stats = result.current.getErrorStatistics();
    expect(stats.total).toBe(4);
    expect(stats.byCategory.network).toBe(2);
    expect(stats.byCategory.api).toBe(1);
    expect(stats.byCategory.system).toBe(1);
  });

  it('should handle validation errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const validationError = new Error('Validation failed');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(validationError, { 
        validationErrors: ['Field is required', 'Invalid format'] 
      });
    });

    expect(categorizedError.category).toBe('validation');
    expect(categorizedError.validationErrors).toEqual(['Field is required', 'Invalid format']);
  });

  it('should handle file upload errors', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    const fileError = new Error('File too large');
    
    let categorizedError: any;
    
    act(() => {
      categorizedError = result.current.handleError(fileError, { 
        fileName: 'test.csv',
        fileSize: 5000000 
      });
    });

    expect(categorizedError.category).toBe('file');
    expect(categorizedError.context.fileName).toBe('test.csv');
    expect(categorizedError.context.fileSize).toBe(5000000);
  });
});