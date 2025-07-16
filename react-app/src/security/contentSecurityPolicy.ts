/**
 * Content Security Policy (CSP) configuration
 * 
 * Provides protection against:
 * - Cross-Site Scripting (XSS) attacks
 * - Data injection attacks
 * - Clickjacking attacks
 * - Code execution attacks
 */

/**
 * CSP directive configuration
 */
export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'frame-src': string[];
  'worker-src': string[];
  'child-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'manifest-src': string[];
  'upgrade-insecure-requests': boolean;
  'block-all-mixed-content': boolean;
}

/**
 * Development CSP configuration (more permissive)
 */
export const developmentCSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Needed for Vite dev server
    "'unsafe-inline'", // Needed for development
    "http://localhost:*",
    "http://127.0.0.1:*",
    "ws://localhost:*",
    "ws://127.0.0.1:*"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Needed for Material-UI
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "http:"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "http://localhost:*",
    "http://127.0.0.1:*",
    "ws://localhost:*",
    "ws://127.0.0.1:*",
    "https://api.openstreetmap.org",
    "https://*.tile.openstreetmap.org"
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'self'"],
  'worker-src': ["'self'", "blob:"],
  'child-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': false,
  'block-all-mixed-content': false
};

/**
 * Production CSP configuration (strict)
 */
export const productionCSP: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'strict-dynamic'", // For dynamically loaded scripts
    // Add nonce or hash for specific scripts if needed
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Material-UI
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://api.openstreetmap.org",
    "https://*.tile.openstreetmap.org"
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", "blob:"],
  'child-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': true,
  'block-all-mixed-content': true
};

/**
 * Convert CSP configuration to string
 */
export const generateCSPString = (config: CSPConfig): string => {
  const directives: string[] = [];
  
  for (const [directive, values] of Object.entries(config)) {
    if (directive === 'upgrade-insecure-requests') {
      if (values) {
        directives.push('upgrade-insecure-requests');
      }
    } else if (directive === 'block-all-mixed-content') {
      if (values) {
        directives.push('block-all-mixed-content');
      }
    } else if (Array.isArray(values)) {
      directives.push(`${directive} ${values.join(' ')}`);
    }
  }
  
  return directives.join('; ');
};

/**
 * Get CSP configuration based on environment
 */
export const getCSPConfig = (): CSPConfig => {
  return import.meta.env.PROD ? productionCSP : developmentCSP;
};

/**
 * Apply CSP to the current document
 */
export const applyCSP = (): void => {
  const config = getCSPConfig();
  const cspString = generateCSPString(config);
  
  // Create or update CSP meta tag
  let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', cspString);
  
  // Log CSP in development
  if (import.meta.env.DEV) {
    console.log('🔒 CSP Applied:', cspString);
  }
};

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Apply security headers where possible in the browser
 */
export const applySecurityHeaders = (): void => {
  // Note: Most security headers can only be set by the server
  // This function sets what can be controlled client-side
  
  // Prevent page from being embedded in frames
  try {
    if (window.top !== window.self) {
      window.top!.location = window.self.location;
    }
  } catch (e) {
    // Ignore errors - likely means we're already in a frame
  }
  
  // Disable autocomplete for sensitive forms
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    if (!form.hasAttribute('autocomplete')) {
      form.setAttribute('autocomplete', 'off');
    }
  });
  
  // Remove referrer information for external links
  const externalLinks = document.querySelectorAll('a[href^="http"]');
  externalLinks.forEach(link => {
    if (!link.hasAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
};

/**
 * Initialize security configuration
 */
export const initializeSecurity = (): void => {
  // Apply CSP
  applyCSP();
  
  // Apply security headers
  applySecurityHeaders();
  
  // Set up security monitoring
  if (typeof window !== 'undefined') {
    // Monitor for CSP violations
    window.addEventListener('securitypolicyviolation', (event) => {
      console.error('🚨 CSP Violation:', {
        directive: event.violatedDirective,
        blocked: event.blockedURI,
        document: event.documentURI,
        line: event.lineNumber,
        column: event.columnNumber,
        source: event.sourceFile,
        sample: event.sample
      });
      
      // In production, report to security monitoring service
      if (import.meta.env.PROD) {
        // Example: Send to security monitoring service
        /*
        fetch('/api/security/csp-violation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            directive: event.violatedDirective,
            blocked: event.blockedURI,
            document: event.documentURI,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }),
        }).catch(err => console.error('Failed to report CSP violation:', err));
        */
      }
    });
    
    // Monitor for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      
      // Prevent default handling in production
      if (import.meta.env.PROD) {
        event.preventDefault();
      }
    });
  }
};

export default {
  developmentCSP,
  productionCSP,
  generateCSPString,
  getCSPConfig,
  applyCSP,
  securityHeaders,
  applySecurityHeaders,
  initializeSecurity
};