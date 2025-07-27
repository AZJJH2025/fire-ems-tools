import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department_id: number;
  department_name: string | null;
  has_temp_password?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Set a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('/auth/api/me', {
        method: 'GET',
        credentials: 'include', // Include cookies for session management
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse JSON response regardless of status code (both 200 and 401 return JSON)
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        // User is authenticated (HTTP 200 with user data)
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // User is not authenticated (HTTP 401 or HTTP 200 with success: false)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      // Only log errors if they're not network/endpoint related (to avoid console spam on landing pages)
      if (error instanceof Error && !error.message.includes('AbortError') && !error.message.includes('Failed to fetch')) {
        console.error('Error checking auth status:', error);
      }
      // Always set loading to false to prevent hanging UI
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return authState;
};