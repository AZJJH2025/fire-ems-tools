/**
 * FireEMS.ai UI Component Library
 * 
 * This file contains reusable UI components that follow the FireEMS.ai design system.
 * These components provide a unified look and feel across all tools and applications.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.UI = window.FireEMS.UI || {};

/**
 * Button Component
 * Creates a styled button element based on the specified type and options
 */
FireEMS.UI.Button = {
  /**
   * Create a button element
   * @param {Object} options - Button configuration options
   * @param {string} options.text - Button text
   * @param {string} [options.type='primary'] - Button type (primary, secondary, danger, text)
   * @param {string} [options.size='medium'] - Button size (small, medium, large)
   * @param {string} [options.icon] - Optional Font Awesome icon name
   * @param {Function} [options.onClick] - Click event handler
   * @param {boolean} [options.disabled=false] - Whether the button is disabled
   * @param {string} [options.id] - Optional ID for the button
   * @param {string} [options.className] - Optional additional class names
   * @returns {HTMLButtonElement} The created button element
   */
  create: function({ text, type = 'primary', size = 'medium', icon, onClick, disabled = false, id, className = '' }) {
    // Create button element
    const button = document.createElement('button');
    
    // Set button type class
    button.className = `${type}-btn ${size}-btn`;
    
    // Add custom class if provided
    if (className) {
      button.className += ` ${className}`;
    }
    
    // Set ID if provided
    if (id) {
      button.id = id;
    }
    
    // Add icon if provided
    if (icon) {
      button.innerHTML = `<i class="fas fa-${icon}"></i> `;
    }
    
    // Add text
    button.innerHTML += text;
    
    // Set disabled state
    button.disabled = disabled;
    
    // Add click handler if provided
    if (onClick && typeof onClick === 'function') {
      button.addEventListener('click', onClick);
    }
    
    return button;
  }
};

/**
 * Card Component
 * Creates a styled card container for content
 */
FireEMS.UI.Card = {
  /**
   * Create a card element
   * @param {Object} options - Card configuration options
   * @param {string} [options.title] - Card title
   * @param {HTMLElement|string} [options.content] - Card content (HTML element or string)
   * @param {string} [options.icon] - Optional icon for the title
   * @param {string} [options.className] - Additional class names
   * @param {Object} [options.actions] - Card actions configuration
   * @param {boolean} [options.collapsible=false] - Whether the card is collapsible
   * @param {boolean} [options.collapsed=false] - Whether the card is initially collapsed
   * @returns {HTMLElement} The created card element
   */
  create: function({ title, content, icon, className = '', actions, collapsible = false, collapsed = false }) {
    // Create card container
    const card = document.createElement('div');
    card.className = `card ${className}`;
    
    // Create card header if title is provided
    if (title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      
      // Create title element
      const titleEl = document.createElement('h3');
      
      // Add icon if provided
      if (icon) {
        titleEl.innerHTML = `<i class="fas fa-${icon}"></i> `;
      }
      
      titleEl.innerHTML += title;
      header.appendChild(titleEl);
      
      // Add collapse button if collapsible
      if (collapsible) {
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        
        collapseBtn.addEventListener('click', function() {
          const body = card.querySelector('.card-body');
          const icon = this.querySelector('i');
          
          if (body.style.display === 'none') {
            body.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
          } else {
            body.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
          }
        });
        
        header.appendChild(collapseBtn);
      }
      
      card.appendChild(header);
    }
    
    // Create card body
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // Set initial collapsed state
    if (collapsible && collapsed) {
      body.style.display = 'none';
      if (title) {
        const icon = card.querySelector('.collapse-btn i');
        if (icon) icon.className = 'fas fa-chevron-down';
      }
    }
    
    // Add content
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    
    card.appendChild(body);
    
    // Add card actions if provided
    if (actions) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';
      
      // Add action buttons
      if (actions.buttons && Array.isArray(actions.buttons)) {
        actions.buttons.forEach(button => {
          if (typeof button === 'object') {
            const btn = FireEMS.UI.Button.create(button);
            footer.appendChild(btn);
          }
        });
      }
      
      card.appendChild(footer);
    }
    
    return card;
  }
};

/**
 * Alert Component
 * Creates styled alert messages
 */
FireEMS.UI.Alert = {
  /**
   * Create an alert element
   * @param {Object} options - Alert configuration options
   * @param {string} options.message - Alert message
   * @param {string} [options.type='info'] - Alert type (success, info, warning, error)
   * @param {boolean} [options.dismissible=false] - Whether the alert can be dismissed
   * @param {string} [options.icon] - Optional icon name
   * @param {string} [options.title] - Optional alert title
   * @returns {HTMLElement} The created alert element
   */
  create: function({ message, type = 'info', dismissible = false, icon, title }) {
    // Create alert container
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    // Determine default icon based on type if not provided
    if (!icon) {
      switch (type) {
        case 'success': icon = 'check-circle'; break;
        case 'info': icon = 'info-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
        case 'error': icon = 'times-circle'; break;
      }
    }
    
    // Create alert content
    let alertContent = '';
    
    // Add icon if provided
    if (icon) {
      alertContent += `<i class="fas fa-${icon}"></i> `;
    }
    
    // Add title if provided
    if (title) {
      alertContent += `<strong>${title}:</strong> `;
    }
    
    // Add message
    alertContent += message;
    
    // Add dismiss button if dismissible
    if (dismissible) {
      alertContent += '<button type="button" class="close-alert"><i class="fas fa-times"></i></button>';
    }
    
    alert.innerHTML = alertContent;
    
    // Add event listener for dismiss button
    if (dismissible) {
      const closeBtn = alert.querySelector('.close-alert');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          alert.remove();
        });
      }
    }
    
    return alert;
  },
  
  /**
   * Show an alert as a toast notification
   * @param {Object} options - Toast configuration options
   * @param {string} options.message - Toast message
   * @param {string} [options.type='info'] - Toast type (success, info, warning, error)
   * @param {number} [options.duration=5000] - Duration to show toast in milliseconds
   * @param {string} [options.position='top-right'] - Position (top-right, top-left, bottom-right, bottom-left)
   */
  showToast: function({ message, type = 'info', duration = 5000, position = 'top-right' }) {
    // Create the alert element
    const toast = this.create({ message, type, dismissible: true });
    toast.className += ' toast';
    
    // Set position class
    toast.className += ` position-${position}`;
    
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = `toast-container ${position}`;
      document.body.appendChild(container);
    }
    
    // Add toast to container
    container.appendChild(toast);
    
    // Add animation class
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
          toast.remove();
          
          // Remove container if empty
          if (container.childNodes.length === 0) {
            container.remove();
          }
        }, 300);
      }, duration);
    }
  }
};

/**
 * Form Component
 * Creates form elements with consistent styling
 */
FireEMS.UI.Form = {
  /**
   * Create a form group element (label + input)
   * @param {Object} options - Form group configuration
   * @param {string} options.id - Input ID
   * @param {string} options.label - Label text
   * @param {string} [options.type='text'] - Input type
   * @param {string} [options.placeholder] - Input placeholder
   * @param {string} [options.value] - Input value
   * @param {boolean} [options.required=false] - Whether the input is required
   * @param {Function} [options.onChange] - Change event handler
   * @param {string} [options.helpText] - Optional help text
   * @param {Object} [options.validation] - Validation rules
   * @returns {HTMLElement} The form group element
   */
  createFormGroup: function({ id, label, type = 'text', placeholder, value, required = false, onChange, helpText, validation }) {
    // Create form group container
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    // Create label
    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    
    // Add required indicator
    if (required) {
      const requiredSpan = document.createElement('span');
      requiredSpan.className = 'required-indicator';
      requiredSpan.textContent = '*';
      labelEl.appendChild(requiredSpan);
    }
    
    formGroup.appendChild(labelEl);
    
    // Create input element based on type
    let inputEl;
    
    if (type === 'textarea') {
      inputEl = document.createElement('textarea');
    } else if (type === 'select') {
      inputEl = document.createElement('select');
    } else {
      inputEl = document.createElement('input');
      inputEl.type = type;
    }
    
    // Set common attributes
    inputEl.id = id;
    inputEl.name = id;
    
    if (placeholder) {
      inputEl.placeholder = placeholder;
    }
    
    if (value !== undefined) {
      if (type === 'checkbox' || type === 'radio') {
        inputEl.checked = Boolean(value);
      } else {
        inputEl.value = value;
      }
    }
    
    if (required) {
      inputEl.required = true;
    }
    
    // Add validation attributes
    if (validation) {
      if (validation.min !== undefined) inputEl.min = validation.min;
      if (validation.max !== undefined) inputEl.max = validation.max;
      if (validation.minLength !== undefined) inputEl.minLength = validation.minLength;
      if (validation.maxLength !== undefined) inputEl.maxLength = validation.maxLength;
      if (validation.pattern !== undefined) inputEl.pattern = validation.pattern;
    }
    
    // Add event handler
    if (onChange && typeof onChange === 'function') {
      inputEl.addEventListener('change', onChange);
    }
    
    formGroup.appendChild(inputEl);
    
    // Add help text if provided
    if (helpText) {
      const helpTextEl = document.createElement('small');
      helpTextEl.className = 'form-help-text';
      helpTextEl.textContent = helpText;
      formGroup.appendChild(helpTextEl);
    }
    
    // Add validation error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'form-error-message';
    errorContainer.id = `${id}-error`;
    formGroup.appendChild(errorContainer);
    
    return formGroup;
  },
  
  /**
   * Create a select dropdown with options
   * @param {Object} options - Select configuration
   * @param {string} options.id - Select ID
   * @param {string} options.label - Label text
   * @param {Array} options.options - Array of options {value, text}
   * @param {string} [options.value] - Selected value
   * @param {boolean} [options.required=false] - Whether the select is required
   * @param {Function} [options.onChange] - Change event handler
   * @returns {HTMLElement} The form group element with select
   */
  createSelect: function({ id, label, options = [], value, required = false, onChange }) {
    // Create base form group
    const formGroup = this.createFormGroup({ 
      id, 
      label, 
      type: 'select', 
      required, 
      onChange 
    });
    
    // Get the select element
    const select = formGroup.querySelector('select');
    
    // Add options
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text || opt.value;
      
      // Set selected if matches value
      if (value !== undefined && opt.value === value) {
        option.selected = true;
      }
      
      select.appendChild(option);
    });
    
    return formGroup;
  },
  
  /**
   * Create a form section with title and multiple form groups
   * @param {Object} options - Form section configuration
   * @param {string} options.title - Section title
   * @param {Array} options.fields - Array of form field configurations
   * @returns {HTMLElement} The form section element
   */
  createSection: function({ title, fields = [] }) {
    // Create section container
    const section = document.createElement('div');
    section.className = 'form-section';
    
    // Add title if provided
    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'form-section-title';
      titleEl.textContent = title;
      section.appendChild(titleEl);
    }
    
    // Add form fields
    fields.forEach(field => {
      let formGroup;
      
      if (field.type === 'select') {
        formGroup = this.createSelect(field);
      } else {
        formGroup = this.createFormGroup(field);
      }
      
      section.appendChild(formGroup);
    });
    
    return section;
  },
  
  /**
   * Validate a form and show error messages
   * @param {HTMLFormElement} form - The form element to validate
   * @returns {boolean} Whether the form is valid
   */
  validateForm: function(form) {
    // Reset previous validation messages
    const errorElements = form.querySelectorAll('.form-error-message');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    
    // Get all required inputs
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
      // Skip elements that aren't form controls
      if (!input.name) return;
      
      const errorContainer = document.getElementById(`${input.name}-error`);
      
      // Validate required fields
      if (input.required && !input.value.trim()) {
        isValid = false;
        
        if (errorContainer) {
          errorContainer.textContent = 'This field is required';
          errorContainer.style.display = 'block';
        }
        
        input.classList.add('invalid');
        return;
      }
      
      // Skip empty optional fields
      if (!input.required && !input.value.trim()) {
        return;
      }
      
      // Validate based on type
      let typeValid = true;
      let errorMessage = '';
      
      switch (input.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          typeValid = emailRegex.test(input.value);
          errorMessage = 'Please enter a valid email address';
          break;
        
        case 'number':
          const num = Number(input.value);
          
          if (isNaN(num)) {
            typeValid = false;
            errorMessage = 'Please enter a valid number';
          } else if (input.min && num < parseFloat(input.min)) {
            typeValid = false;
            errorMessage = `Value must be at least ${input.min}`;
          } else if (input.max && num > parseFloat(input.max)) {
            typeValid = false;
            errorMessage = `Value must be at most ${input.max}`;
          }
          break;
        
        case 'text':
          if (input.minLength && input.value.length < parseInt(input.minLength)) {
            typeValid = false;
            errorMessage = `Must be at least ${input.minLength} characters`;
          } else if (input.maxLength && input.value.length > parseInt(input.maxLength)) {
            typeValid = false;
            errorMessage = `Cannot exceed ${input.maxLength} characters`;
          } else if (input.pattern) {
            const pattern = new RegExp(input.pattern);
            typeValid = pattern.test(input.value);
            errorMessage = input.title || 'Please match the requested format';
          }
          break;
          
        // Add other types as needed
      }
      
      if (!typeValid) {
        isValid = false;
        
        if (errorContainer) {
          errorContainer.textContent = errorMessage;
          errorContainer.style.display = 'block';
        }
        
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });
    
    return isValid;
  }
};

/**
 * Modal Component
 * Creates modal dialogs
 */
FireEMS.UI.Modal = {
  /**
   * Create and show a modal dialog
   * @param {Object} options - Modal configuration options
   * @param {string} options.title - Modal title
   * @param {HTMLElement|string} options.content - Modal content
   * @param {string} [options.size='medium'] - Modal size (small, medium, large)
   * @param {Object} [options.buttons] - Modal buttons configuration
   * @param {Function} [options.onClose] - Close event handler
   * @returns {HTMLElement} The modal element
   */
  show: function({ title, content, size = 'medium', buttons, onClose }) {
    // Remove any existing modals
    this.removeExisting();
    
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = `modal modal-${size}`;
    
    // Create modal header
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    header.appendChild(titleEl);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    header.appendChild(closeBtn);
    
    modal.appendChild(header);
    
    // Create modal body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    // Add content
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    
    modal.appendChild(body);
    
    // Create modal footer with buttons
    if (buttons) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      
      // Add buttons
      Object.entries(buttons).forEach(([key, config]) => {
        const button = FireEMS.UI.Button.create({
          text: config.text || key,
          type: config.type || 'secondary',
          onClick: config.onClick,
          disabled: config.disabled || false
        });
        
        footer.appendChild(button);
      });
      
      modal.appendChild(footer);
    }
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listener for close button
    closeBtn.addEventListener('click', () => {
      this.close();
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    });
    
    // Add event listener for backdrop click
    backdrop.addEventListener('click', () => {
      this.close();
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    });
    
    // Prevent propagation from modal to backdrop
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Add animation class after a short delay
    setTimeout(() => {
      backdrop.classList.add('show');
      modal.classList.add('show');
    }, 10);
    
    return modal;
  },
  
  /**
   * Close the current modal
   */
  close: function() {
    const backdrop = document.querySelector('.modal-backdrop');
    const modal = document.querySelector('.modal');
    
    if (backdrop) {
      backdrop.classList.remove('show');
      setTimeout(() => {
        backdrop.remove();
      }, 300);
    }
    
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  },
  
  /**
   * Remove any existing modals
   */
  removeExisting: function() {
    const existingBackdrop = document.querySelector('.modal-backdrop');
    const existingModal = document.querySelector('.modal');
    
    if (existingBackdrop) existingBackdrop.remove();
    if (existingModal) existingModal.remove();
  },
  
  /**
   * Show a confirmation dialog
   * @param {Object} options - Confirmation options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Confirmation message
   * @param {string} [options.confirmText='Confirm'] - Confirm button text
   * @param {string} [options.cancelText='Cancel'] - Cancel button text
   * @param {Function} [options.onConfirm] - Confirm callback function
   * @param {Function} [options.onCancel] - Cancel callback function
   */
  confirm: function({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
    // Create content element
    const content = document.createElement('div');
    content.className = 'confirm-dialog';
    content.textContent = message;
    
    // Show modal with custom buttons
    this.show({
      title,
      content,
      size: 'small',
      buttons: {
        cancel: {
          text: cancelText,
          type: 'secondary',
          onClick: () => {
            this.close();
            if (onCancel && typeof onCancel === 'function') {
              onCancel();
            }
          }
        },
        confirm: {
          text: confirmText,
          type: 'primary',
          onClick: () => {
            this.close();
            if (onConfirm && typeof onConfirm === 'function') {
              onConfirm();
            }
          }
        }
      },
      onClose: onCancel
    });
  },
  
  /**
   * Show an alert dialog
   * @param {Object} options - Alert options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Alert message
   * @param {string} [options.buttonText='OK'] - Button text
   * @param {Function} [options.onClose] - Close callback function
   */
  alert: function({ title, message, buttonText = 'OK', onClose }) {
    // Create content element
    const content = document.createElement('div');
    content.className = 'alert-dialog';
    content.textContent = message;
    
    // Show modal with single button
    this.show({
      title,
      content,
      size: 'small',
      buttons: {
        ok: {
          text: buttonText,
          type: 'primary',
          onClick: () => {
            this.close();
            if (onClose && typeof onClose === 'function') {
              onClose();
            }
          }
        }
      },
      onClose
    });
  }
};

/**
 * Tab Component
 * Creates tabbed interfaces
 */
FireEMS.UI.Tabs = {
  /**
   * Create a tabbed interface
   * @param {Object} options - Tabs configuration options
   * @param {string} options.id - Container ID
   * @param {Array} options.tabs - Array of tab configurations { id, title, content, icon }
   * @param {number} [options.activeTab=0] - Index of the initially active tab
   * @returns {HTMLElement} The tabs container element
   */
  create: function({ id, tabs = [], activeTab = 0 }) {
    // Create tabs container
    const container = document.createElement('div');
    container.className = 'tabs-container';
    container.id = id;
    
    // Create tab navigation
    const tabNav = document.createElement('ul');
    tabNav.className = 'tabs-nav';
    
    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tabs-content';
    
    // Add tabs
    tabs.forEach((tab, index) => {
      // Create tab nav item
      const tabItem = document.createElement('li');
      tabItem.className = 'tab-item';
      tabItem.setAttribute('data-tab', tab.id);
      
      if (index === activeTab) {
        tabItem.classList.add('active');
      }
      
      // Add icon if provided
      if (tab.icon) {
        tabItem.innerHTML = `<i class="fas fa-${tab.icon}"></i> `;
      }
      
      tabItem.innerHTML += tab.title;
      
      // Add click handler
      tabItem.addEventListener('click', function() {
        // Remove active class from all tabs
        const allTabs = container.querySelectorAll('.tab-item');
        allTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all content panels
        const allPanels = container.querySelectorAll('.tab-panel');
        allPanels.forEach(p => p.style.display = 'none');
        
        // Show corresponding panel
        const panel = container.querySelector(`.tab-panel[data-tab="${tab.id}"]`);
        if (panel) {
          panel.style.display = 'block';
        }
      });
      
      tabNav.appendChild(tabItem);
      
      // Create content panel
      const panel = document.createElement('div');
      panel.className = 'tab-panel';
      panel.setAttribute('data-tab', tab.id);
      
      // Set initial visibility
      panel.style.display = index === activeTab ? 'block' : 'none';
      
      // Add content
      if (typeof tab.content === 'string') {
        panel.innerHTML = tab.content;
      } else if (tab.content instanceof HTMLElement) {
        panel.appendChild(tab.content);
      }
      
      tabContent.appendChild(panel);
    });
    
    // Assemble the tabs component
    container.appendChild(tabNav);
    container.appendChild(tabContent);
    
    return container;
  }
};

/**
 * Table Component
 * Creates responsive data tables
 */
FireEMS.UI.Table = {
  /**
   * Create a data table
   * @param {Object} options - Table configuration options
   * @param {Array<string>} options.columns - Column headers
   * @param {Array<Array>} options.data - Table data (array of rows)
   * @param {string} [options.id] - Table ID
   * @param {boolean} [options.sortable=false] - Whether columns are sortable
   * @param {boolean} [options.pagination=false] - Whether to add pagination
   * @param {number} [options.pageSize=10] - Rows per page (if pagination enabled)
   * @returns {HTMLElement} The table container element
   */
  create: function({ columns, data, id, sortable = false, pagination = false, pageSize = 10 }) {
    // Create table container
    const container = document.createElement('div');
    container.className = 'table-container';
    
    // Create table element
    const table = document.createElement('table');
    table.className = 'data-table';
    
    if (id) {
      table.id = id;
    }
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach((column, index) => {
      const th = document.createElement('th');
      th.innerHTML = column;
      
      // Add sort ability if enabled
      if (sortable) {
        th.className = 'sortable';
        th.setAttribute('data-column', index);
        th.addEventListener('click', () => {
          this.sortTable(table, index);
        });
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add data rows
    data.forEach(row => {
      const tr = document.createElement('tr');
      
      row.forEach(cell => {
        const td = document.createElement('td');
        
        if (cell instanceof HTMLElement) {
          td.appendChild(cell);
        } else {
          td.textContent = cell;
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add pagination if enabled
    if (pagination && data.length > pageSize) {
      const paginationContainer = this.createPagination(table, pageSize);
      container.appendChild(paginationContainer);
      
      // Initialize pagination
      this.applyPagination(table, 1, pageSize);
    }
    
    return container;
  },
  
  /**
   * Sort a table by a specific column
   * @param {HTMLTableElement} table - The table element
   * @param {number} columnIndex - The index of the column to sort by
   */
  sortTable: function(table, columnIndex) {
    const header = table.querySelector(`th[data-column="${columnIndex}"]`);
    const sortDirection = header.classList.contains('sort-asc') ? 'desc' : 'asc';
    
    // Remove sort indicators from all headers
    const allHeaders = table.querySelectorAll('th');
    allHeaders.forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add sort indicator to current header
    header.classList.add(`sort-${sortDirection}`);
    
    // Get rows to sort
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort rows
    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim();
      const bValue = b.cells[columnIndex].textContent.trim();
      
      // Check if values are numbers
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Update table
    rows.forEach(row => {
      tbody.appendChild(row);
    });
  },
  
  /**
   * Create pagination controls
   * @param {HTMLTableElement} table - The table element
   * @param {number} pageSize - Number of rows per page
   * @returns {HTMLElement} The pagination container
   */
  createPagination: function(table, pageSize) {
    const tbody = table.querySelector('tbody');
    const rowCount = tbody.querySelectorAll('tr').length;
    const pageCount = Math.ceil(rowCount / pageSize);
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    // Add page buttons
    for (let i = 1; i <= pageCount; i++) {
      const pageButton = document.createElement('button');
      pageButton.className = 'page-btn';
      pageButton.textContent = i;
      
      if (i === 1) {
        pageButton.classList.add('active');
      }
      
      pageButton.addEventListener('click', () => {
        // Update active button
        const allButtons = paginationContainer.querySelectorAll('.page-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        pageButton.classList.add('active');
        
        // Apply pagination
        this.applyPagination(table, i, pageSize);
      });
      
      paginationContainer.appendChild(pageButton);
    }
    
    return paginationContainer;
  },
  
  /**
   * Apply pagination to a table
   * @param {HTMLTableElement} table - The table element
   * @param {number} page - The current page number
   * @param {number} pageSize - Number of rows per page
   */
  applyPagination: function(table, page, pageSize) {
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Show/hide rows based on pagination
    rows.forEach((row, index) => {
      row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });
  }
};

/**
 * Badge Component
 * Creates status badges and tags
 */
FireEMS.UI.Badge = {
  /**
   * Create a badge element
   * @param {Object} options - Badge configuration options
   * @param {string} options.text - Badge text
   * @param {string} [options.type='default'] - Badge type (default, success, warning, error, info)
   * @param {string} [options.icon] - Optional Font Awesome icon name
   * @returns {HTMLElement} The badge element
   */
  create: function({ text, type = 'default', icon }) {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    
    // Add icon if provided
    if (icon) {
      badge.innerHTML = `<i class="fas fa-${icon}"></i> `;
    }
    
    badge.innerHTML += text;
    
    return badge;
  }
};

/**
 * Initialize UI component CSS styles
 */
FireEMS.UI.initStyles = function() {
  // Check if styles already exist
  if (document.getElementById('fireems-ui-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'fireems-ui-styles';
  
  // Add component styles
  style.textContent = `
    /* Button Styles */
    .primary-btn {
      background-color: #2196f3;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .primary-btn:hover {
      background-color: #0d8aee;
    }
    .primary-btn:active {
      background-color: #0c7cd5;
    }
    .primary-btn:disabled {
      background-color: #90caf9;
      cursor: not-allowed;
    }
    
    .secondary-btn {
      background-color: #e0e0e0;
      color: #333;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .secondary-btn:hover {
      background-color: #d5d5d5;
    }
    .secondary-btn:active {
      background-color: #c7c7c7;
    }
    .secondary-btn:disabled {
      background-color: #f5f5f5;
      color: #9e9e9e;
      cursor: not-allowed;
    }
    
    .danger-btn {
      background-color: #f44336;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .danger-btn:hover {
      background-color: #e53935;
    }
    .danger-btn:active {
      background-color: #d32f2f;
    }
    .danger-btn:disabled {
      background-color: #ef9a9a;
      cursor: not-allowed;
    }
    
    .text-btn {
      background-color: transparent;
      color: #2196f3;
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }
    .text-btn:hover {
      background-color: rgba(33, 150, 243, 0.1);
    }
    .text-btn:active {
      background-color: rgba(33, 150, 243, 0.2);
    }
    .text-btn:disabled {
      color: #9e9e9e;
      cursor: not-allowed;
    }
    
    /* Button sizes */
    .small-btn {
      padding: 4px 8px;
      font-size: 0.875rem;
    }
    .medium-btn {
      padding: 8px 16px;
      font-size: 1rem;
    }
    .large-btn {
      padding: 12px 24px;
      font-size: 1.125rem;
    }
    
    /* Card Styles */
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }
    .card-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
    }
    .card-body {
      padding: 16px;
    }
    .card-footer {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .collapse-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #757575;
      padding: 4px;
      border-radius: 4px;
    }
    .collapse-btn:hover {
      background-color: #f5f5f5;
    }
    
    /* Alert Styles */
    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .alert i {
      margin-right: 8px;
    }
    .alert-success {
      background-color: #e8f5e9;
      color: #2e7d32;
      border-left: 4px solid #4caf50;
    }
    .alert-info {
      background-color: #e3f2fd;
      color: #0d47a1;
      border-left: 4px solid #2196f3;
    }
    .alert-warning {
      background-color: #fff3e0;
      color: #ef6c00;
      border-left: 4px solid #ff9800;
    }
    .alert-error {
      background-color: #ffebee;
      color: #c62828;
      border-left: 4px solid #f44336;
    }
    .close-alert {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.5;
      padding: 0;
    }
    .close-alert:hover {
      opacity: 1;
    }
    
    /* Toast notifications */
    .toast-container {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
    }
    .toast-container.top-right {
      top: 20px;
      right: 20px;
    }
    .toast-container.top-left {
      top: 20px;
      left: 20px;
    }
    .toast-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    .toast-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    .toast {
      margin-bottom: 10px;
      min-width: 250px;
      max-width: 350px;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      pointer-events: auto;
    }
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Form Styles */
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .required-indicator {
      color: #f44336;
      margin-left: 4px;
    }
    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="password"],
    .form-group input[type="number"],
    .form-group input[type="date"],
    .form-group input[type="datetime-local"],
    .form-group input[type="tel"],
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      border-color: #2196f3;
      outline: none;
    }
    .form-group input.invalid,
    .form-group select.invalid,
    .form-group textarea.invalid {
      border-color: #f44336;
    }
    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }
    .form-help-text {
      display: block;
      font-size: 0.875rem;
      color: #757575;
      margin-top: 4px;
    }
    .form-error-message {
      display: none;
      color: #f44336;
      font-size: 0.875rem;
      margin-top: 4px;
    }
    .form-section {
      margin-bottom: 24px;
    }
    .form-section-title {
      font-size: 1.125rem;
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .modal-backdrop.show {
      opacity: 1;
    }
    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .modal.show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .modal-small {
      width: 300px;
    }
    .modal-medium {
      width: 500px;
      max-width: 90vw;
    }
    .modal-large {
      width: 800px;
      max-width: 90vw;
    }
    .modal-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
    }
    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #757575;
      padding: 4px;
      border-radius: 4px;
    }
    .modal-close:hover {
      background-color: #f5f5f5;
    }
    .modal-body {
      padding: 16px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .modal-footer {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    /* Tab Styles */
    .tabs-container {
      margin-bottom: 20px;
    }
    .tabs-nav {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .tab-item {
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .tab-item:hover {
      background-color: #f5f5f5;
    }
    .tab-item.active {
      border-bottom-color: #2196f3;
      color: #2196f3;
      font-weight: 500;
    }
    .tab-panel {
      display: none;
      padding: 16px;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-top: none;
    }
    
    /* Table Styles */
    .table-container {
      overflow-x: auto;
      margin-bottom: 20px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e0e0e0;
    }
    .data-table th,
    .data-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    .data-table th {
      background-color: #f5f5f5;
      font-weight: 500;
    }
    .data-table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .data-table tbody tr:hover {
      background-color: #f5f5f5;
    }
    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
    }
    .data-table th.sortable:hover {
      background-color: #e0e0e0;
    }
    .data-table th.sort-asc::after {
      content: "▲";
      margin-left: 5px;
      font-size: 12px;
    }
    .data-table th.sort-desc::after {
      content: "▼";
      margin-left: 5px;
      font-size: 12px;
    }
    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 16px;
      gap: 5px;
    }
    .page-btn {
      padding: 5px 10px;
      border: 1px solid #ddd;
      background-color: white;
      cursor: pointer;
      border-radius: 4px;
    }
    .page-btn:hover {
      background-color: #f5f5f5;
    }
    .page-btn.active {
      background-color: #2196f3;
      color: white;
      border-color: #2196f3;
    }
    
    /* Badge Styles */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1;
    }
    .badge i {
      margin-right: 4px;
    }
    .badge-default {
      background-color: #e0e0e0;
      color: #757575;
    }
    .badge-success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .badge-warning {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    .badge-error {
      background-color: #ffebee;
      color: #c62828;
    }
    .badge-info {
      background-color: #e3f2fd;
      color: #0d47a1;
    }
  `;
  
  // Add to document head
  document.head.appendChild(style);
};

// Initialize component styles
document.addEventListener('DOMContentLoaded', FireEMS.UI.initStyles);