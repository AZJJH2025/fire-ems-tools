import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook for managing authentication-related redirects
 * 
 * Features:
 * - Handles login redirects with preserved destinations
 * - Manages logout redirects
 * - Provides utilities for role-based redirects
 */
export const useAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /**
   * Redirect to login page with current location saved
   */
  const redirectToLogin = () => {
    navigate('/login', { 
      state: { from: location },
      replace: true 
    });
  };

  /**
   * Redirect after successful login based on user role and intended destination
   */
  const redirectAfterLogin = (user: any) => {
    const from = location.state?.from?.pathname || '/';
    
    if (user.role === 'super_admin' || user.role === 'admin') {
      // For admin users, redirect to admin page or their intended destination
      navigate(from === '/' ? '/admin' : from, { replace: true });
    } else {
      // For regular users, redirect to intended page or homepage
      navigate(from, { replace: true });
    }
  };

  /**
   * Redirect after logout
   */
  const redirectAfterLogout = () => {
    navigate('/', { replace: true });
  };

  /**
   * Get the intended destination from location state
   */
  const getIntendedDestination = () => {
    return location.state?.from?.pathname || '/';
  };

  /**
   * Check if user has permission to access a route
   */
  const hasRoutePermission = (requiredRole?: string | string[]) => {
    if (!isAuthenticated) return false;
    if (!requiredRole) return true; // No role requirement
    
    const userRole = user?.role;
    if (!userRole) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  /**
   * Redirect to appropriate page based on user authentication state
   */
  const redirectBasedOnAuth = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    // If authenticated, redirect based on role
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return {
    redirectToLogin,
    redirectAfterLogin,
    redirectAfterLogout,
    redirectBasedOnAuth,
    getIntendedDestination,
    hasRoutePermission,
  };
};