/**
 * Toast Utility
 * 
 * Handles displaying toast notifications in the application
 */

export const Toast = {
  /**
   * Show a toast notification
   * @param {string} message - The message to show
   * @param {string} type - The type of toast (success, error, warning, info)
   * @param {number} duration - How long to show the toast in ms
   */
  show(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Create toast content
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${this._getIconForType(type)}"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Animate out and remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300); // Wait for transition to complete
    }, duration);
    
    // Log to console as well
    this._logToConsole(message, type);
    
    return toast;
  },

  /**
   * Show a success toast
   * @param {string} message - The message to show
   * @param {number} duration - How long to show the toast in ms
   */
  success(message, duration = 3000) {
    return this.show(message, 'success', duration);
  },

  /**
   * Show an error toast
   * @param {string} message - The message to show
   * @param {number} duration - How long to show the toast in ms
   */
  error(message, duration = 4000) {
    return this.show(message, 'error', duration);
  },

  /**
   * Show a warning toast
   * @param {string} message - The message to show
   * @param {number} duration - How long to show the toast in ms
   */
  warning(message, duration = 3500) {
    return this.show(message, 'warning', duration);
  },

  /**
   * Show an info toast
   * @param {string} message - The message to show
   * @param {number} duration - How long to show the toast in ms
   */
  info(message, duration = 3000) {
    return this.show(message, 'info', duration);
  },

  /**
   * Get the appropriate icon for toast type
   * @private
   * @param {string} type - The type of toast
   * @returns {string} - The icon name
   */
  _getIconForType(type) {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'exclamation-circle';
      case 'warning': return 'exclamation-triangle';
      case 'info': return 'info-circle';
      default: return 'info-circle';
    }
  },

  /**
   * Log toast message to console
   * @private
   * @param {string} message - The message to log
   * @param {string} type - The type of toast
   */
  _logToConsole(message, type) {
    const prefix = `[${type.toUpperCase()}]`;
    
    switch (type) {
      case 'success': console.log(prefix, message); break;
      case 'error': console.error(prefix, message); break;
      case 'warning': console.warn(prefix, message); break;
      case 'info': console.info(prefix, message); break;
      default: console.log(prefix, message);
    }
  }
};