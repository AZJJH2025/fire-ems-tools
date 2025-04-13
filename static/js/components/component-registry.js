/**
 * FireEMS.ai Component Registry
 * 
 * This module provides a central registry for UI components and
 * handles component lifecycle, rendering, and state management.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};

/**
 * Component Registry - Core functionality for component management
 */
FireEMS.ComponentRegistry = (function() {
  // Private registry of components
  const _components = {};
  
  // Track mounted component instances
  const _instances = {};
  
  // Counter for generating unique IDs
  let _idCounter = 0;
  
  /**
   * Register a component with the registry
   * @param {string} name - Component name
   * @param {Function} componentFn - Component factory function
   */
  function register(name, componentFn) {
    if (_components[name]) {
      console.warn(`Component "${name}" is already registered. Overwriting...`);
    }
    
    _components[name] = componentFn;
  }
  
  /**
   * Get a registered component
   * @param {string} name - Component name
   * @returns {Function|null} Component factory function or null if not found
   */
  function get(name) {
    return _components[name] || null;
  }
  
  /**
   * Check if a component is registered
   * @param {string} name - Component name
   * @returns {boolean} Whether the component is registered
   */
  function isRegistered(name) {
    return !!_components[name];
  }
  
  /**
   * Create an instance of a component
   * @param {string} name - Component name
   * @param {Object} props - Component props
   * @returns {Object} Component instance
   */
  function create(name, props = {}) {
    const componentFn = get(name);
    
    if (!componentFn) {
      throw new Error(`Component "${name}" is not registered`);
    }
    
    // Generate instance ID
    const instanceId = `${name}_${_idCounter++}`;
    
    // Create instance
    const instance = componentFn({
      ...props,
      id: instanceId
    });
    
    // Store instance
    _instances[instanceId] = instance;
    
    return instance;
  }
  
  /**
   * Render a component to a DOM element
   * @param {string} name - Component name
   * @param {string|HTMLElement} container - Container element or selector
   * @param {Object} props - Component props
   * @returns {Object} Component instance
   */
  function render(name, container, props = {}) {
    // Find container element
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    
    if (!containerEl) {
      throw new Error(`Container not found: ${container}`);
    }
    
    // Create component instance
    const instance = create(name, props);
    
    // Get component element
    const element = instance.element || instance;
    
    // Render to container
    if (element instanceof HTMLElement) {
      containerEl.innerHTML = '';
      containerEl.appendChild(element);
    } else if (typeof element === 'string') {
      containerEl.innerHTML = element;
    } else {
      throw new Error(`Component "${name}" did not return a valid element`);
    }
    
    // Call mount lifecycle method if available
    if (instance.mount && typeof instance.mount === 'function') {
      instance.mount(containerEl);
    }
    
    return instance;
  }
  
  /**
   * Destroy a component instance
   * @param {string} instanceId - Component instance ID
   */
  function destroy(instanceId) {
    const instance = _instances[instanceId];
    
    if (!instance) return;
    
    // Call destroy lifecycle method if available
    if (instance.destroy && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    
    // Remove from registry
    delete _instances[instanceId];
  }
  
  /**
   * Create a component factory
   * @param {Function} renderFn - Render function that returns an element
   * @param {Object} options - Component options
   * @returns {Function} Component factory function
   */
  function createComponent(renderFn, options = {}) {
    if (typeof renderFn !== 'function') {
      throw new Error('Render function is required');
    }
    
    return function(props = {}) {
      // Create state
      let state = { ...options.initialState };
      
      // Create element
      let element = renderFn(props, state);
      
      // Component instance
      const instance = {
        element,
        
        /**
         * Get the component's state
         * @returns {Object} Current state
         */
        getState() {
          return { ...state };
        },
        
        /**
         * Update the component's state and re-render
         * @param {Object} newState - New state
         */
        setState(newState) {
          const prevState = { ...state };
          
          // Merge new state
          state = { ...state, ...newState };
          
          // Call state change handler if available
          if (options.onStateChange && typeof options.onStateChange === 'function') {
            options.onStateChange(state, prevState, props);
          }
          
          // Re-render
          this.render();
        },
        
        /**
         * Update the component's props and re-render
         * @param {Object} newProps - New props
         */
        update(newProps) {
          if (!newProps) return;
          
          // Update props
          Object.assign(props, newProps);
          
          // Re-render
          this.render();
        },
        
        /**
         * Re-render the component
         */
        render() {
          const newElement = renderFn(props, state);
          
          if (element && element.parentNode) {
            // Replace existing element
            element.parentNode.replaceChild(newElement, element);
          }
          
          element = newElement;
          instance.element = element;
        },
        
        /**
         * Mount the component to a container
         * @param {HTMLElement} container - Container element
         */
        mount(container) {
          if (options.onMount && typeof options.onMount === 'function') {
            options.onMount(props, state, container);
          }
        },
        
        /**
         * Clean up the component
         */
        destroy() {
          if (options.onDestroy && typeof options.onDestroy === 'function') {
            options.onDestroy(props, state);
          }
        }
      };
      
      // Set element property
      instance.element = element;
      
      return instance;
    };
  }
  
  /**
   * Create a Higher-Order Component (HOC)
   * @param {Function} enhancer - Function that enhances a component
   * @returns {Function} HOC function
   */
  function createHOC(enhancer) {
    return function(BaseComponent) {
      return function(props) {
        return enhancer(BaseComponent, props);
      };
    };
  }
  
  /**
   * Connect a component to the FireEMS.Store
   * @param {Function} mapStateToProps - Function to map state to props
   * @param {Function} mapDispatchToProps - Function to map dispatch to props
   * @returns {Function} HOC function
   */
  function connect(mapStateToProps, mapDispatchToProps) {
    return function(BaseComponent) {
      return function(props) {
        // Check if store exists
        if (!FireEMS.Store) {
          console.warn('FireEMS.Store is not available. Component will not be connected to store.');
          return BaseComponent(props);
        }
        
        // Get state from store
        const state = FireEMS.Store.getState();
        
        // Map state to props
        const stateProps = mapStateToProps ? mapStateToProps(state) : {};
        
        // Map dispatch to props
        const dispatchProps = mapDispatchToProps ? mapDispatchToProps(FireEMS.Store.dispatch) : {};
        
        // Merge props
        const mergedProps = {
          ...stateProps,
          ...dispatchProps,
          ...props
        };
        
        // Create component instance
        const instance = BaseComponent(mergedProps);
        
        // Subscribe to store
        if (mapStateToProps) {
          const unsubscribe = FireEMS.Store.subscribe(() => {
            // Get updated state
            const newState = FireEMS.Store.getState();
            
            // Map state to props
            const newStateProps = mapStateToProps(newState);
            
            // Check if props have changed
            const hasChanged = Object.keys(newStateProps).some(key => {
              return newStateProps[key] !== stateProps[key];
            });
            
            // Update component if props have changed
            if (hasChanged && instance.update) {
              instance.update({
                ...newStateProps,
                ...dispatchProps,
                ...props
              });
            }
          });
          
          // Store unsubscribe function
          if (instance.destroy) {
            const originalDestroy = instance.destroy;
            instance.destroy = function() {
              unsubscribe();
              originalDestroy.call(instance);
            };
          } else {
            instance.destroy = unsubscribe;
          }
        }
        
        return instance;
      };
    };
  }
  
  // Public API
  return {
    register,
    get,
    isRegistered,
    create,
    render,
    destroy,
    createComponent,
    createHOC,
    connect
  };
})();

/**
 * Built-in components
 */

// Button Component
FireEMS.ComponentRegistry.register('Button', function(props) {
  const {
    text = 'Button',
    type = 'primary',
    size = 'medium',
    icon,
    onClick,
    disabled = false,
    className = ''
  } = props;
  
  // Create button element
  const button = document.createElement('button');
  button.className = `${type}-btn ${size}-btn`;
  
  if (className) {
    button.className += ` ${className}`;
  }
  
  if (icon) {
    button.innerHTML = `<i class="fas fa-${icon}"></i> `;
  }
  
  button.innerHTML += text;
  button.disabled = disabled;
  
  // Add event listener
  if (onClick && typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }
  
  // Component instance
  return {
    element: button,
    
    // Update props
    update(newProps) {
      // Update text
      if (newProps.text) {
        button.innerHTML = '';
        
        if (newProps.icon || icon) {
          button.innerHTML = `<i class="fas fa-${newProps.icon || icon}"></i> `;
        }
        
        button.innerHTML += newProps.text;
      }
      
      // Update disabled state
      if (newProps.disabled !== undefined) {
        button.disabled = newProps.disabled;
      }
      
      // Update class
      if (newProps.type || newProps.size || newProps.className) {
        button.className = `${newProps.type || type}-btn ${newProps.size || size}-btn`;
        
        if (newProps.className || className) {
          button.className += ` ${newProps.className || className}`;
        }
      }
      
      // Update event listener
      if (newProps.onClick && typeof newProps.onClick === 'function') {
        // Remove old listener
        if (onClick) {
          button.removeEventListener('click', onClick);
        }
        
        // Add new listener
        button.addEventListener('click', newProps.onClick);
      }
    }
  };
});

// Card Component
FireEMS.ComponentRegistry.register('Card', function(props) {
  const {
    title,
    content,
    icon,
    className = '',
    collapsible = false,
    collapsed = false
  } = props;
  
  // Create card element
  const card = document.createElement('div');
  card.className = `card ${className}`;
  
  // Create header if title is provided
  if (title) {
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const titleEl = document.createElement('h3');
    
    if (icon) {
      titleEl.innerHTML = `<i class="fas fa-${icon}"></i> `;
    }
    
    titleEl.innerHTML += title;
    header.appendChild(titleEl);
    
    // Add collapse button if collapsible
    if (collapsible) {
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'collapse-btn';
      collapseBtn.innerHTML = collapsed
        ? '<i class="fas fa-chevron-down"></i>'
        : '<i class="fas fa-chevron-up"></i>';
      
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
  
  // Create body
  const body = document.createElement('div');
  body.className = 'card-body';
  
  // Set initial collapsed state
  if (collapsible && collapsed) {
    body.style.display = 'none';
  }
  
  // Add content
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  
  card.appendChild(body);
  
  // Component instance
  return {
    element: card,
    
    // Update content
    update(newProps) {
      // Update title
      if (newProps.title && title) {
        const titleEl = card.querySelector('.card-header h3');
        if (titleEl) {
          titleEl.innerHTML = '';
          
          if (newProps.icon || icon) {
            titleEl.innerHTML = `<i class="fas fa-${newProps.icon || icon}"></i> `;
          }
          
          titleEl.innerHTML += newProps.title;
        }
      }
      
      // Update content
      if (newProps.content) {
        const body = card.querySelector('.card-body');
        
        if (body) {
          body.innerHTML = '';
          
          if (typeof newProps.content === 'string') {
            body.innerHTML = newProps.content;
          } else if (newProps.content instanceof HTMLElement) {
            body.appendChild(newProps.content);
          }
        }
      }
      
      // Update class
      if (newProps.className) {
        card.className = `card ${newProps.className}`;
      }
    }
  };
});

// Alert Component
FireEMS.ComponentRegistry.register('Alert', function(props) {
  const {
    message,
    type = 'info',
    dismissible = false,
    icon,
    title
  } = props;
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  // Determine default icon based on type if not provided
  const iconName = icon || (() => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'info': return 'info-circle';
      case 'warning': return 'exclamation-triangle';
      case 'error': return 'times-circle';
      default: return 'info-circle';
    }
  })();
  
  // Create alert content
  let alertContent = `<i class="fas fa-${iconName}"></i> `;
  
  if (title) {
    alertContent += `<strong>${title}:</strong> `;
  }
  
  alertContent += message;
  
  if (dismissible) {
    alertContent += '<button type="button" class="close-alert"><i class="fas fa-times"></i></button>';
  }
  
  alert.innerHTML = alertContent;
  
  // Add event listener for dismiss button
  if (dismissible) {
    const closeBtn = alert.querySelector('.close-alert');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (alert.parentNode) {
          alert.parentNode.removeChild(alert);
        }
      });
    }
  }
  
  // Component instance
  return {
    element: alert,
    
    // Update alert
    update(newProps) {
      // Create new alert with updated props
      const updatedProps = { ...props, ...newProps };
      const newAlert = FireEMS.ComponentRegistry.create('Alert', updatedProps).element;
      
      // Replace old alert with new one
      if (alert.parentNode) {
        alert.parentNode.replaceChild(newAlert, alert);
      }
    }
  };
});

// Form Group Component
FireEMS.ComponentRegistry.register('FormGroup', function(props) {
  const {
    id,
    label,
    type = 'text',
    placeholder,
    value,
    required = false,
    onChange,
    helpText,
    options = [],
    validation
  } = props;
  
  // Create form group element
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
    
    // Add options
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text || opt.value;
      
      // Set selected if matches value
      if (value !== undefined && opt.value === value) {
        option.selected = true;
      }
      
      inputEl.appendChild(option);
    });
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
    inputEl.addEventListener('change', function(event) {
      const value = type === 'checkbox' || type === 'radio'
        ? this.checked
        : this.value;
      
      onChange(value, event);
    });
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
  
  // Component instance
  return {
    element: formGroup,
    
    /**
     * Get input value
     * @returns {*} Current input value
     */
    getValue() {
      if (type === 'checkbox' || type === 'radio') {
        return inputEl.checked;
      }
      return inputEl.value;
    },
    
    /**
     * Set input value
     * @param {*} newValue - New value
     */
    setValue(newValue) {
      if (type === 'checkbox' || type === 'radio') {
        inputEl.checked = Boolean(newValue);
      } else {
        inputEl.value = newValue;
      }
    },
    
    /**
     * Validate the input
     * @returns {boolean} Whether the input is valid
     */
    validate() {
      const errorEl = formGroup.querySelector('.form-error-message');
      
      // Reset error
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      inputEl.classList.remove('invalid');
      
      // Check required
      if (required && !inputEl.value.trim()) {
        errorEl.textContent = 'This field is required';
        errorEl.style.display = 'block';
        inputEl.classList.add('invalid');
        return false;
      }
      
      // Skip validation if field is empty and not required
      if (!required && !inputEl.value.trim()) {
        return true;
      }
      
      // Check validity
      if (!inputEl.checkValidity()) {
        errorEl.textContent = inputEl.validationMessage;
        errorEl.style.display = 'block';
        inputEl.classList.add('invalid');
        return false;
      }
      
      return true;
    },
    
    /**
     * Set custom error message
     * @param {string} message - Error message
     */
    setError(message) {
      const errorEl = formGroup.querySelector('.form-error-message');
      
      if (message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        inputEl.classList.add('invalid');
      } else {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
        inputEl.classList.remove('invalid');
      }
    },
    
    /**
     * Update form group props
     * @param {Object} newProps - New props
     */
    update(newProps) {
      // Update value
      if (newProps.value !== undefined) {
        this.setValue(newProps.value);
      }
      
      // Update placeholder
      if (newProps.placeholder) {
        inputEl.placeholder = newProps.placeholder;
      }
      
      // Update required
      if (newProps.required !== undefined) {
        inputEl.required = newProps.required;
        
        // Update required indicator
        const requiredSpan = labelEl.querySelector('.required-indicator');
        
        if (newProps.required && !requiredSpan) {
          const span = document.createElement('span');
          span.className = 'required-indicator';
          span.textContent = '*';
          labelEl.appendChild(span);
        } else if (!newProps.required && requiredSpan) {
          requiredSpan.remove();
        }
      }
      
      // Update options for select
      if (type === 'select' && newProps.options) {
        // Clear existing options
        inputEl.innerHTML = '';
        
        // Add new options
        newProps.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.text || opt.value;
          
          // Set selected if matches value
          if (newProps.value !== undefined && opt.value === newProps.value) {
            option.selected = true;
          }
          
          inputEl.appendChild(option);
        });
      }
      
      // Update onChange handler
      if (newProps.onChange && typeof newProps.onChange === 'function') {
        // Remove existing listener
        if (onChange) {
          inputEl.removeEventListener('change', onChange);
        }
        
        // Add new listener
        inputEl.addEventListener('change', function(event) {
          const value = type === 'checkbox' || type === 'radio'
            ? this.checked
            : this.value;
          
          newProps.onChange(value, event);
        });
      }
      
      // Update help text
      if (newProps.helpText !== undefined) {
        const helpTextEl = formGroup.querySelector('.form-help-text');
        
        if (helpTextEl) {
          if (newProps.helpText) {
            helpTextEl.textContent = newProps.helpText;
          } else {
            helpTextEl.remove();
          }
        } else if (newProps.helpText) {
          const newHelpTextEl = document.createElement('small');
          newHelpTextEl.className = 'form-help-text';
          newHelpTextEl.textContent = newProps.helpText;
          formGroup.insertBefore(newHelpTextEl, errorContainer);
        }
      }
    }
  };
});