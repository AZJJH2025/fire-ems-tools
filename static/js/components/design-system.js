/**
 * FireEMS.ai Design System
 * 
 * This file defines core design tokens, themes, and utility functions
 * that implement the FireEMS.ai design language across applications.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Design = window.FireEMS.Design || {};

/**
 * Colors - Design tokens for consistent color usage
 */
FireEMS.Design.Colors = {
  // Primary brand colors
  primary: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrast: '#ffffff'
  },
  
  // Secondary colors
  secondary: {
    main: '#ff6b4a',
    light: '#ff8a65',
    dark: '#e64a19',
    contrast: '#ffffff'
  },
  
  // Semantic colors
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrast: '#ffffff'
  },
  
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrast: '#000000'
  },
  
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrast: '#ffffff'
  },
  
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrast: '#ffffff'
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    grey50: '#fafafa',
    grey100: '#f5f5f5',
    grey200: '#eeeeee',
    grey300: '#e0e0e0',
    grey400: '#bdbdbd',
    grey500: '#9e9e9e',
    grey600: '#757575',
    grey700: '#616161',
    grey800: '#424242',
    grey900: '#212121'
  },
  
  // Background colors
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
    dark: '#202830'
  },
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9e9e9e',
    hint: '#9e9e9e',
    onDark: '#ffffff',
    onLight: '#000000'
  }
};

/**
 * Typography - Design tokens for consistent typography
 */
FireEMS.Design.Typography = {
  // Font families
  fontFamily: {
    primary: 'Arial, sans-serif',
    secondary: 'Helvetica, Arial, sans-serif',
    code: 'monospace'
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  // Text styles
  styles: {
    h1: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.2,
      marginTop: '0',
      marginBottom: '0.5em'
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      marginTop: '0',
      marginBottom: '0.5em'
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginTop: '0',
      marginBottom: '0.5em'
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
      marginTop: '0',
      marginBottom: '0.5em'
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase'
    }
  }
};

/**
 * Spacing - Design tokens for consistent spacing
 */
FireEMS.Design.Spacing = {
  // Base spacing unit (in pixels)
  unit: 8,
  
  // Named spacing values
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  
  /**
   * Get spacing by multiplier
   * @param {number} multiplier - Number of units
   * @returns {string} CSS size value
   */
  get: function(multiplier) {
    return `${multiplier * (this.unit / 16)}rem`;
  }
};

/**
 * Shadows - Design tokens for consistent shadows
 */
FireEMS.Design.Shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

/**
 * Border Radius - Design tokens for consistent border radius
 */
FireEMS.Design.BorderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: '0.25rem',   // 4px
  lg: '0.5rem',    // 8px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px'
};

/**
 * Z-Index - Design tokens for consistent z-index layers
 */
FireEMS.Design.ZIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 50,
  fixed: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600
};

/**
 * Breakpoints - Design tokens for responsive design
 */
FireEMS.Design.Breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
  
  /**
   * Check if viewport matches media query
   * @param {string} breakpoint - Breakpoint name
   * @param {string} [direction='up'] - Direction ('up' or 'down')
   * @returns {boolean} Whether the media query matches
   */
  matches: function(breakpoint, direction = 'up') {
    if (!window.matchMedia) return false;
    
    const value = this[breakpoint] || this.md;
    const query = direction === 'up' 
      ? `(min-width: ${value})`
      : `(max-width: ${value})`;
      
    return window.matchMedia(query).matches;
  }
};

/**
 * Transitions - Design tokens for consistent animations
 */
FireEMS.Design.Transitions = {
  duration: {
    shortest: '100ms',
    short: '200ms',
    standard: '300ms',
    complex: '500ms'
  },
  
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

/**
 * Theme - Complete theme configuration
 */
FireEMS.Design.Theme = {
  light: {
    colors: {
      ...FireEMS.Design.Colors,
      mode: 'light'
    },
    typography: FireEMS.Design.Typography,
    spacing: FireEMS.Design.Spacing,
    shadows: FireEMS.Design.Shadows,
    borderRadius: FireEMS.Design.BorderRadius,
    zIndex: FireEMS.Design.ZIndex
  },
  
  dark: {
    colors: {
      ...FireEMS.Design.Colors,
      background: {
        default: '#121212',
        paper: '#1e1e1e',
        dark: '#0a0a0a'
      },
      text: {
        primary: '#ffffff',
        secondary: '#aaaaaa',
        disabled: '#777777',
        hint: '#777777',
        onDark: '#ffffff',
        onLight: '#000000'
      },
      mode: 'dark'
    },
    typography: FireEMS.Design.Typography,
    spacing: FireEMS.Design.Spacing,
    shadows: FireEMS.Design.Shadows,
    borderRadius: FireEMS.Design.BorderRadius,
    zIndex: FireEMS.Design.ZIndex
  },
  
  // Current active theme
  current: 'light',
  
  /**
   * Get current theme object
   * @returns {Object} Current theme object
   */
  get: function() {
    return this[this.current];
  },
  
  /**
   * Switch between themes
   * @param {string} mode - Theme mode ('light' or 'dark')
   */
  switch: function(mode) {
    if (mode && (mode === 'light' || mode === 'dark')) {
      this.current = mode;
      
      // Update CSS variables
      this.applyTheme();
      
      // Store preference
      if (localStorage) {
        localStorage.setItem('fireems-theme', mode);
      }
      
      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('themeModeChange', {
        detail: { mode }
      }));
    }
  },
  
  /**
   * Initialize theme
   */
  init: function() {
    // Check for saved preference
    if (localStorage) {
      const savedMode = localStorage.getItem('fireems-theme');
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        this.current = savedMode;
      } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.current = 'dark';
        }
      }
    }
    
    // Apply theme
    this.applyTheme();
    
    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          if (!localStorage.getItem('fireems-theme')) {
            this.switch(e.matches ? 'dark' : 'light');
          }
        });
    }
  },
  
  /**
   * Apply current theme to CSS variables
   */
  applyTheme: function() {
    const theme = this.get();
    
    // Create CSS variables
    let cssVars = '';
    
    // Colors
    cssVars += `--color-primary: ${theme.colors.primary.main};\n`;
    cssVars += `--color-primary-light: ${theme.colors.primary.light};\n`;
    cssVars += `--color-primary-dark: ${theme.colors.primary.dark};\n`;
    cssVars += `--color-primary-contrast: ${theme.colors.primary.contrast};\n`;
    
    cssVars += `--color-secondary: ${theme.colors.secondary.main};\n`;
    cssVars += `--color-secondary-light: ${theme.colors.secondary.light};\n`;
    cssVars += `--color-secondary-dark: ${theme.colors.secondary.dark};\n`;
    cssVars += `--color-secondary-contrast: ${theme.colors.secondary.contrast};\n`;
    
    cssVars += `--color-success: ${theme.colors.success.main};\n`;
    cssVars += `--color-warning: ${theme.colors.warning.main};\n`;
    cssVars += `--color-error: ${theme.colors.error.main};\n`;
    cssVars += `--color-info: ${theme.colors.info.main};\n`;
    
    cssVars += `--color-background: ${theme.colors.background.default};\n`;
    cssVars += `--color-surface: ${theme.colors.background.paper};\n`;
    cssVars += `--color-header: ${theme.colors.background.dark};\n`;
    
    cssVars += `--color-text-primary: ${theme.colors.text.primary};\n`;
    cssVars += `--color-text-secondary: ${theme.colors.text.secondary};\n`;
    cssVars += `--color-text-disabled: ${theme.colors.text.disabled};\n`;
    cssVars += `--color-text-hint: ${theme.colors.text.hint};\n`;
    
    // Typography
    cssVars += `--font-family: ${theme.typography.fontFamily.primary};\n`;
    cssVars += `--font-size-small: ${theme.typography.fontSize.sm};\n`;
    cssVars += `--font-size-body: ${theme.typography.fontSize.md};\n`;
    cssVars += `--font-size-large: ${theme.typography.fontSize.lg};\n`;
    cssVars += `--font-size-h1: ${theme.typography.styles.h1.fontSize};\n`;
    cssVars += `--font-size-h2: ${theme.typography.styles.h2.fontSize};\n`;
    cssVars += `--font-size-h3: ${theme.typography.styles.h3.fontSize};\n`;
    
    // Spacing
    cssVars += `--spacing-unit: ${theme.spacing.unit}px;\n`;
    cssVars += `--spacing-xs: ${theme.spacing.xs};\n`;
    cssVars += `--spacing-sm: ${theme.spacing.sm};\n`;
    cssVars += `--spacing-md: ${theme.spacing.md};\n`;
    cssVars += `--spacing-lg: ${theme.spacing.lg};\n`;
    cssVars += `--spacing-xl: ${theme.spacing.xl};\n`;
    
    // Shapes
    cssVars += `--border-radius-sm: ${theme.borderRadius.sm};\n`;
    cssVars += `--border-radius-md: ${theme.borderRadius.md};\n`;
    cssVars += `--border-radius-lg: ${theme.borderRadius.lg};\n`;
    
    // Shadows
    cssVars += `--shadow-sm: ${theme.shadows.sm};\n`;
    cssVars += `--shadow-md: ${theme.shadows.md};\n`;
    cssVars += `--shadow-lg: ${theme.shadows.lg};\n`;
    
    // Transitions
    cssVars += `--transition-standard: ${theme.transitions.duration.standard} ${theme.transitions.easing.easeInOut};\n`;
    
    // Create or update style element
    let styleEl = document.getElementById('fireems-theme-vars');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'fireems-theme-vars';
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `:root {\n${cssVars}}`;
    
    // Add theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${this.current}`);
  }
};

/**
 * Utility functions for working with the design system
 */
FireEMS.Design.Utils = {
  /**
   * Apply a text style to an element
   * @param {HTMLElement} element - Element to style
   * @param {string} styleName - Name of the text style
   */
  applyTextStyle: function(element, styleName) {
    const style = FireEMS.Design.Typography.styles[styleName];
    
    if (!style || !element) return;
    
    Object.assign(element.style, {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight
    });
    
    if (style.marginTop !== undefined) {
      element.style.marginTop = style.marginTop;
    }
    
    if (style.marginBottom !== undefined) {
      element.style.marginBottom = style.marginBottom;
    }
    
    if (style.textTransform !== undefined) {
      element.style.textTransform = style.textTransform;
    }
  },
  
  /**
   * Get a CSS hex or rgba color value
   * @param {string} colorPath - Path to color (e.g. 'primary.main', 'text.primary')
   * @param {number} [opacity] - Optional opacity value between 0 and 1
   * @returns {string} CSS color value
   */
  getColor: function(colorPath, opacity) {
    const theme = FireEMS.Design.Theme.get();
    
    // Split path into parts
    const parts = colorPath.split('.');
    
    // Navigate through object
    let color = theme.colors;
    for (const part of parts) {
      if (color[part] === undefined) {
        return '';
      }
      color = color[part];
    }
    
    // Return with opacity if specified
    if (opacity !== undefined && typeof opacity === 'number') {
      // Convert hex to rgba if needed
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } 
      // If already rgba, replace opacity
      else if (color.startsWith('rgba')) {
        return color.replace(/[\d.]+\)$/, `${opacity})`);
      }
      // If rgb, convert to rgba
      else if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      }
    }
    
    return color;
  },
  
  /**
   * Apply color theme to an element
   * @param {HTMLElement} element - Element to style
   * @param {Object} colorConfig - Color configuration
   */
  applyColorTheme: function(element, colorConfig) {
    if (!element) return;
    
    const {
      background,
      text,
      border,
      hoverBackground,
      hoverText,
      hoverBorder
    } = colorConfig;
    
    if (background) {
      element.style.backgroundColor = this.getColor(background);
    }
    
    if (text) {
      element.style.color = this.getColor(text);
    }
    
    if (border) {
      element.style.borderColor = this.getColor(border);
    }
    
    // Store hover styles as data attributes
    if (hoverBackground) {
      element.dataset.hoverBg = this.getColor(hoverBackground);
    }
    
    if (hoverText) {
      element.dataset.hoverText = this.getColor(hoverText);
    }
    
    if (hoverBorder) {
      element.dataset.hoverBorder = this.getColor(hoverBorder);
    }
    
    // Add mouseenter/leave event listeners if hover styles exist
    if (hoverBackground || hoverText || hoverBorder) {
      element.addEventListener('mouseenter', function() {
        if (this.dataset.hoverBg) {
          this.style.backgroundColor = this.dataset.hoverBg;
        }
        
        if (this.dataset.hoverText) {
          this.style.color = this.dataset.hoverText;
        }
        
        if (this.dataset.hoverBorder) {
          this.style.borderColor = this.dataset.hoverBorder;
        }
      });
      
      element.addEventListener('mouseleave', function() {
        if (this.dataset.hoverBg) {
          this.style.backgroundColor = background ? FireEMS.Design.Utils.getColor(background) : '';
        }
        
        if (this.dataset.hoverText) {
          this.style.color = text ? FireEMS.Design.Utils.getColor(text) : '';
        }
        
        if (this.dataset.hoverBorder) {
          this.style.borderColor = border ? FireEMS.Design.Utils.getColor(border) : '';
        }
      });
    }
  }
};

// Initialize the theme when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  FireEMS.Design.Theme.init();
});