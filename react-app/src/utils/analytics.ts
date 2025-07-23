/**
 * Google Analytics 4 (GA4) utility functions for tracking user interactions
 * on the FireEMS.ai landing page and throughout the application.
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics 4
 * Call this once when the app loads or in the main App component
 */
export const initializeGA4 = (measurementId: string) => {
  // Create script tag for gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    // Enhanced ecommerce and conversion tracking
    send_page_view: true,
    // Allow for multiple GA4 properties if needed
    allow_ad_personalization_signals: false, // GDPR compliance
    allow_google_signals: false, // GDPR compliance
  });

  console.log('GA4 initialized with measurement ID:', measurementId);
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: eventName,
      ...parameters,
    });
  }
};

/**
 * Track beta signup form interactions
 */
export const trackBetaSignup = {
  formView: () => {
    trackEvent('form_view', {
      event_category: 'beta_signup',
      event_label: 'Beta Signup Form Viewed',
      form_name: 'beta_signup_form',
    });
  },

  formStart: () => {
    trackEvent('form_start', {
      event_category: 'beta_signup',
      event_label: 'Beta Signup Form Started',
      form_name: 'beta_signup_form',
    });
  },

  formSubmit: (departmentName?: string, state?: string) => {
    trackEvent('form_submit', {
      event_category: 'beta_signup',
      event_label: 'Beta Signup Form Submitted',
      form_name: 'beta_signup_form',
      custom_parameter_1: departmentName,
      custom_parameter_2: state,
    });
  },

  formSuccess: () => {
    trackEvent('generate_lead', {
      event_category: 'conversion',
      event_label: 'Beta Signup Completed',
      currency: 'USD',
      value: 1, // Assign value to beta signups for ROI tracking
    });
  },

  formError: (errorMessage: string) => {
    trackEvent('form_error', {
      event_category: 'beta_signup',
      event_label: 'Beta Signup Form Error',
      error_message: errorMessage,
    });
  },
};

/**
 * Track landing page CTA interactions
 */
export const trackCTA = {
  heroButton: () => {
    trackEvent('cta_click', {
      event_category: 'cta',
      event_label: 'Hero CTA - Request Beta Access',
      button_location: 'hero_section',
    });
  },

  finalButton: () => {
    trackEvent('cta_click', {
      event_category: 'cta',
      event_label: 'Final CTA - Request Access Free',
      button_location: 'final_cta_section',
    });
  },

  scrollToBeta: () => {
    trackEvent('scroll_to_form', {
      event_category: 'navigation',
      event_label: 'Scrolled to Beta Signup Form',
    });
  },
};

/**
 * Track user engagement on landing page sections
 */
export const trackEngagement = {
  sectionView: (sectionName: string) => {
    trackEvent('section_view', {
      event_category: 'engagement',
      event_label: `${sectionName} Section Viewed`,
      section_name: sectionName,
    });
  },

  timeOnPage: (timeInSeconds: number) => {
    trackEvent('timing_complete', {
      event_category: 'engagement',
      event_label: 'Time on Landing Page',
      name: 'page_time',
      value: Math.round(timeInSeconds),
    });
  },

  featureClick: (featureName: string) => {
    trackEvent('feature_interest', {
      event_category: 'engagement',
      event_label: `${featureName} Feature Clicked`,
      feature_name: featureName,
    });
  },
};

/**
 * Track conversion funnel steps
 */
export const trackFunnel = {
  landingPageView: () => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      event_label: 'Landing Page Viewed',
      funnel_step: 1,
      step_name: 'landing_view',
    });
  },

  problemSectionView: () => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      event_label: 'Problem Section Viewed',
      funnel_step: 2,
      step_name: 'problem_aware',
    });
  },

  solutionSectionView: () => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      event_label: 'Solution Section Viewed',
      funnel_step: 3,
      step_name: 'solution_aware',
    });
  },

  betaFormView: () => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      event_label: 'Beta Form Viewed',
      funnel_step: 4,
      step_name: 'form_view',
    });
  },

  betaFormSubmit: () => {
    trackEvent('funnel_step', {
      event_category: 'conversion_funnel',
      event_label: 'Beta Form Submitted',
      funnel_step: 5,
      step_name: 'form_submit',
    });
  },
};

/**
 * Initialize analytics with environment-specific configuration
 */
export const setupAnalytics = () => {
  // Only initialize in production or when explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const measurementId = process.env.REACT_APP_GA4_MEASUREMENT_ID;
  
  if (isProduction && measurementId) {
    initializeGA4(measurementId);
    console.log('Analytics initialized for production');
  } else if (measurementId) {
    initializeGA4(measurementId);
    console.log('Analytics initialized for development');
  } else {
    console.log('Analytics not initialized - missing measurement ID');
  }
};

/**
 * Enhanced conversion tracking for beta signups
 * This should be called when a beta signup is successfully completed
 */
export const trackConversion = (conversionData: {
  departmentName: string;
  state: string;
  email: string;
  source?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Standard conversion event
    window.gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual Google Ads conversion ID
      event_category: 'conversion',
      event_label: 'Beta Signup Conversion',
      value: 1,
      currency: 'USD',
      transaction_id: `beta_${Date.now()}`,
    });

    // Enhanced ecommerce event for more detailed tracking
    window.gtag('event', 'purchase', {
      transaction_id: `beta_${Date.now()}`,
      value: 1,
      currency: 'USD',
      items: [{
        item_id: 'beta_access',
        item_name: 'FireEMS.ai Beta Access',
        category: 'beta_signup',
        quantity: 1,
        price: 1,
      }],
      // Custom dimensions for segmentation
      custom_parameter_1: conversionData.departmentName,
      custom_parameter_2: conversionData.state,
      custom_parameter_3: conversionData.source || 'landing_page',
    });
  }
};