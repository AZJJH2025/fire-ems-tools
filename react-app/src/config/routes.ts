/**
 * Route configuration for Fire EMS Tools
 * 
 * Defines all application routes with their protection requirements
 * This centralized configuration makes it easy to manage route access control
 */

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth: boolean;
  requiredRole?: string | string[];
  title: string;
  description: string;
  isPublic?: boolean;
  restrictWhenAuthenticated?: boolean;
}

/**
 * Route definitions with protection requirements
 */
export const routes: RouteConfig[] = [
  // Public routes - accessible to everyone
  {
    path: '/',
    component: 'FireEMSHomepage',
    requiresAuth: false,
    title: 'Fire EMS Tools - Professional Analytics for Fire Departments',
    description: 'Homepage with authentication-aware content',
    isPublic: true,
  },
  
  // Authentication routes - only for non-authenticated users
  {
    path: '/signup',
    component: 'SignUpPage',
    requiresAuth: false,
    title: 'Sign Up - Fire EMS Tools',
    description: 'Create new fire department account',
    isPublic: true,
    restrictWhenAuthenticated: true,
  },
  {
    path: '/login',
    component: 'LoginPage',
    requiresAuth: false,
    title: 'Sign In - Fire EMS Tools',
    description: 'Sign in to your fire department account',
    isPublic: true,
    restrictWhenAuthenticated: true,
  },
  {
    path: '/reset-password',
    component: 'ResetPasswordPage',
    requiresAuth: false,
    title: 'Reset Password - Fire EMS Tools',
    description: 'Reset your account password',
    isPublic: true,
    restrictWhenAuthenticated: true,
  },

  // Protected tool routes - require authentication
  {
    path: '/data-formatter',
    component: 'App',
    requiresAuth: true,
    title: 'Data Formatter - Fire EMS Tools',
    description: 'Universal CAD data formatting and field mapping',
  },
  {
    path: '/data-formatter-react',
    component: 'App',
    requiresAuth: true,
    title: 'Data Formatter - Fire EMS Tools',
    description: 'Universal CAD data formatting and field mapping (legacy route)',
  },
  {
    path: '/response-time-analyzer',
    component: 'ResponseTimeAnalyzerContainer',
    requiresAuth: true,
    title: 'Response Time Analyzer - Fire EMS Tools',
    description: 'NFPA 1710 compliance analysis and professional reporting',
  },
  {
    path: '/fire-map-pro',
    component: 'FireMapProContainer',
    requiresAuth: true,
    title: 'Fire Map Pro - Fire EMS Tools',
    description: 'Advanced mapping and spatial analysis for fire departments',
  },
  {
    path: '/fire-map-pro-react',
    component: 'FireMapProContainer',
    requiresAuth: true,
    title: 'Fire Map Pro - Fire EMS Tools',
    description: 'Advanced mapping and spatial analysis (legacy route)',
  },
  {
    path: '/water-supply-coverage',
    component: 'WaterSupplyCoverageContainer',
    requiresAuth: true,
    title: 'Water Supply Coverage - Fire EMS Tools',
    description: 'Water supply coverage analysis and compliance reporting',
  },
  {
    path: '/iso-credit-calculator',
    component: 'ISOCreditContainer',
    requiresAuth: true,
    title: 'ISO Credit Calculator - Fire EMS Tools',
    description: 'ISO fire suppression rating calculation and improvement planning',
  },
  {
    path: '/station-coverage-optimizer',
    component: 'StationCoverageContainer',
    requiresAuth: true,
    title: 'Station Coverage Optimizer - Fire EMS Tools',
    description: 'Fire station placement optimization and coverage analysis',
  },
  {
    path: '/tank-zone-coverage',
    component: 'WaterSupplyCoverageContainer',
    requiresAuth: true,
    title: 'Tank Zone Coverage - Fire EMS Tools',
    description: 'Legacy route - redirects to Water Supply Coverage',
  },

  // Admin routes - require admin roles
  {
    path: '/admin',
    component: 'AdminDashboard',
    requiresAuth: true,
    requiredRole: ['admin', 'super_admin'],
    title: 'Admin Dashboard - Fire EMS Tools',
    description: 'Administrative dashboard for system management',
  },
];

/**
 * Helper functions for route management
 */
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

export const getProtectedRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.requiresAuth);
};

export const getPublicRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.isPublic);
};

export const getAdminRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.requiredRole);
};

export const isRouteProtected = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requiresAuth || false;
};

export const getRequiredRole = (path: string): string | string[] | undefined => {
  const route = getRouteConfig(path);
  return route?.requiredRole;
};