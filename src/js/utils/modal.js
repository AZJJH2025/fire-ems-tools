/**
 * Modal Utility
 * 
 * Handles displaying modal dialogs in the application
 */

export const Modal = {
  /**
   * Show a modal dialog
   * @param {string} title - The title of the modal
   * @param {string|HTMLElement} content - The content to show (string or DOM element)
   * @param {Function} cancelCallback - Callback for when cancel is clicked
   * @param {Function} confirmCallback - Callback for when confirm is clicked
   * @param {Object} options - Additional options for the modal
   * @returns {HTMLElement} - The modal element
   */
  show(title, content, cancelCallback = null, confirmCallback = null, options = {}) {
    // Default options
    const defaultOptions = {
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      showCancel: true,
      showConfirm: true,
      size: 'medium', // small, medium, large
      closeOnBackdrop: true
    };
    
    // Merge options
    const modalOptions = {...defaultOptions, ...options};
    
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'modal-backdrop';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = `modal-container modal-${modalOptions.size}`;
    modal.id = 'modal-container';
    
    // Create modal header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleElement = document.createElement('h3');
    titleElement.className = 'modal-title';
    titleElement.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-btn';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.id = 'modal-close';
    closeButton.addEventListener('click', () => this.close());
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // Create modal body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    // Add content to body
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    if (modalOptions.showCancel) {
      const cancelButton = document.createElement('button');
      cancelButton.className = 'secondary-btn';
      cancelButton.textContent = modalOptions.cancelText;
      cancelButton.id = 'modal-cancel';
      cancelButton.addEventListener('click', () => {
        if (cancelCallback) cancelCallback();
        this.close();
      });
      
      footer.appendChild(cancelButton);
    }
    
    if (modalOptions.showConfirm) {
      const confirmButton = document.createElement('button');
      confirmButton.className = 'primary-btn';
      confirmButton.textContent = modalOptions.confirmText;
      confirmButton.id = 'modal-confirm';
      confirmButton.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        if (options.closeOnConfirm !== false) this.close();
      });
      
      footer.appendChild(confirmButton);
    }
    
    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    
    // Add backdrop and modal to document
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Add backdrop click handler if enabled
    if (modalOptions.closeOnBackdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });
    }
    
    // Animate in
    setTimeout(() => {
      backdrop.classList.add('show');
      modal.classList.add('show');
    }, 10);
    
    return modal;
  },

  /**
   * Close the current modal
   */
  close() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('modal-container');
    
    if (backdrop && modal) {
      // Animate out
      backdrop.classList.remove('show');
      modal.classList.remove('show');
      
      // Remove after animation
      setTimeout(() => {
        if (backdrop.parentNode) {
          document.body.removeChild(backdrop);
        }
      }, 300); // Wait for transition to complete
    }
  },

  /**
   * Show a confirmation modal
   * @param {string} title - The title of the modal
   * @param {string} message - The message to show
   * @param {Function} confirmCallback - Callback for when confirm is clicked
   * @param {string} confirmText - Text for the confirm button
   * @param {string} cancelText - Text for the cancel button
   * @returns {HTMLElement} - The modal element
   */
  confirm(title, message, confirmCallback, confirmText = 'Confirm', cancelText = 'Cancel') {
    return this.show(
      title,
      `<p>${message}</p>`,
      null,
      confirmCallback,
      {
        confirmText,
        cancelText
      }
    );
  },

  /**
   * Show an alert modal
   * @param {string} title - The title of the modal
   * @param {string} message - The message to show
   * @param {Function} callback - Callback for when OK is clicked
   * @returns {HTMLElement} - The modal element
   */
  alert(title, message, callback = null) {
    return this.show(
      title,
      `<p>${message}</p>`,
      null,
      callback,
      {
        showCancel: false,
        confirmText: 'OK'
      }
    );
  },

  /**
   * Show a form modal
   * @param {string} title - The title of the modal
   * @param {HTMLElement} formElement - The form element
   * @param {Function} submitCallback - Callback for when form is submitted
   * @returns {HTMLElement} - The modal element
   */
  form(title, formElement, submitCallback) {
    const modal = this.show(
      title,
      formElement,
      null,
      () => {
        const formData = new FormData(formElement);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        submitCallback(data);
      },
      {
        confirmText: 'Submit',
        size: 'medium',
        closeOnConfirm: false
      }
    );
    
    // Add submit handler to form
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(formElement);
      const data = {};
      
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      const result = submitCallback(data);
      
      // Close modal if the callback returns true
      if (result) {
        this.close();
      }
    });
    
    return modal;
  }
};