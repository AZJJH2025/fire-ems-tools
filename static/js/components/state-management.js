/**
 * FireEMS.ai State Management System
 * 
 * This module provides a centralized state management solution for frontend components.
 * It implements a simple pub/sub pattern with Redux-like features including:
 * - Central application state
 * - Actions and reducers pattern
 * - Subscriptions with selective updates
 * - Middleware support
 * - DevTools integration
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};

/**
 * State Store - Core state management functionality
 */
FireEMS.Store = (function() {
  // Private state
  let _state = {};
  const _listeners = [];
  const _middleware = [];
  let _isDispatching = false;
  let _enableDevTools = false;
  
  // For tracking state changes
  let _prevState = {};
  
  /**
   * Initialize the store with default state
   * @param {Object} initialState - Initial state
   * @param {Object} options - Store configuration options
   */
  function init(initialState = {}, options = {}) {
    _state = { ...initialState };
    _prevState = { ..._state };
    
    if (options.middleware && Array.isArray(options.middleware)) {
      _middleware.push(...options.middleware);
    }
    
    // Enable DevTools if requested and available
    if (options.devTools && window.__REDUX_DEVTOOLS_EXTENSION__) {
      _enableDevTools = true;
      _devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
        name: options.name || 'FireEMS.ai Store',
        features: {
          jump: true,
          skip: false
        }
      });
      
      // Initialize DevTools
      _devTools.init(_state);
    }
  }
  
  /**
   * Get the current state or a slice of it
   * @param {string} [path] - Optional path to get specific state slice
   * @returns {*} State or state slice
   */
  function getState(path) {
    if (!path) return { ..._state };
    
    return getNestedProperty(_state, path);
  }
  
  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function
   * @param {string|Array} [paths] - Optional paths to watch for changes
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener, paths) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    
    const listenerObj = { callback: listener, paths };
    _listeners.push(listenerObj);
    
    // Return unsubscribe function
    return function unsubscribe() {
      const index = _listeners.indexOf(listenerObj);
      if (index !== -1) {
        _listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Apply middleware to actions
   * @param {Array} middleware - Array of middleware functions
   */
  function applyMiddleware(middleware) {
    if (!Array.isArray(middleware)) {
      throw new Error('Middleware must be an array');
    }
    
    _middleware.push(...middleware);
  }
  
  /**
   * Dispatch an action to update state
   * @param {Object} action - Action object with type and payload
   * @returns {Object} The action
   */
  function dispatch(action) {
    if (!action || typeof action !== 'object') {
      throw new Error('Action must be an object');
    }
    
    if (!action.type) {
      throw new Error('Action must have a type');
    }
    
    if (_isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }
    
    try {
      _isDispatching = true;
      
      // Run middleware
      const middlewareChain = _middleware.reduce((chain, middleware) => {
        return middleware({ getState, dispatch })(chain);
      }, next => action => {
        // Run reducer to get new state
        const newState = reducer(_state, action);
        
        // Update state
        _prevState = { ..._state };
        _state = newState;
        
        // Track with DevTools
        if (_enableDevTools && _devTools) {
          _devTools.send(action, _state);
        }
        
        // Notify listeners
        notifyListeners(action);
        
        return action;
      });
      
      return middlewareChain(action);
    } finally {
      _isDispatching = false;
    }
  }
  
  /**
   * Replace the current state
   * @param {Object} newState - New state
   */
  function replaceState(newState) {
    _prevState = { ..._state };
    _state = { ...newState };
    
    // Track with DevTools
    if (_enableDevTools && _devTools) {
      _devTools.send({ type: '@@REPLACE_STATE' }, _state);
    }
    
    // Notify all listeners
    _listeners.forEach(listener => {
      listener.callback(_state, _prevState);
    });
  }
  
  /**
   * Core reducer function
   * @param {Object} state - Current state
   * @param {Object} action - Action object
   * @returns {Object} New state
   */
  function reducer(state, action) {
    // Check for a registered reducer for this action type
    const actionReducer = _reducers[action.type];
    
    if (actionReducer) {
      return actionReducer(state, action);
    }
    
    // For actions without a specific reducer
    switch (action.type) {
      case 'SET_STATE': {
        if (!action.path) {
          return { ...state, ...action.payload };
        }
        
        return setNestedProperty({ ...state }, action.path, action.payload);
      }
      
      case 'MERGE_STATE': {
        if (!action.path) {
          return { ...state, ...action.payload };
        }
        
        const currentValue = getNestedProperty(state, action.path) || {};
        return setNestedProperty(
          { ...state }, 
          action.path, 
          { ...currentValue, ...action.payload }
        );
      }
      
      case 'UPDATE_STATE': {
        if (!action.path) {
          return action.updater(state);
        }
        
        const currentValue = getNestedProperty(state, action.path);
        return setNestedProperty(
          { ...state },
          action.path,
          action.updater(currentValue)
        );
      }
      
      case 'RESET_STATE': {
        if (!action.path) {
          return action.initialState || {};
        }
        
        return setNestedProperty(
          { ...state },
          action.path,
          action.initialState || {}
        );
      }
      
      default:
        return state;
    }
  }
  
  /**
   * Action creators for common state operations
   */
  const actions = {
    /**
     * Set state value (replaces current value)
     * @param {*} payload - The new value
     * @param {string} [path] - Optional state path
     * @returns {Object} Action object
     */
    setState: (payload, path) => ({
      type: 'SET_STATE',
      payload,
      path
    }),
    
    /**
     * Merge objects in state (shallow merge)
     * @param {Object} payload - The object to merge
     * @param {string} [path] - Optional state path
     * @returns {Object} Action object
     */
    mergeState: (payload, path) => ({
      type: 'MERGE_STATE',
      payload,
      path
    }),
    
    /**
     * Update state using a function
     * @param {Function} updater - Function that takes current value and returns new value
     * @param {string} [path] - Optional state path
     * @returns {Object} Action object
     */
    updateState: (updater, path) => ({
      type: 'UPDATE_STATE',
      updater,
      path
    }),
    
    /**
     * Reset state to initial values
     * @param {*} [initialState] - Optional initial state to reset to
     * @param {string} [path] - Optional state path
     * @returns {Object} Action object
     */
    resetState: (initialState, path) => ({
      type: 'RESET_STATE',
      initialState,
      path
    })
  };
  
  /**
   * Registry of reducers by action type
   */
  const _reducers = {};
  
  /**
   * Register a reducer for an action type
   * @param {string} actionType - Action type
   * @param {Function} reducerFn - Reducer function
   */
  function registerReducer(actionType, reducerFn) {
    if (typeof reducerFn !== 'function') {
      throw new Error('Reducer must be a function');
    }
    
    _reducers[actionType] = reducerFn;
  }
  
  /**
   * Register multiple reducers
   * @param {Object} reducers - Object mapping action types to reducer functions
   */
  function registerReducers(reducers) {
    Object.entries(reducers).forEach(([actionType, reducerFn]) => {
      registerReducer(actionType, reducerFn);
    });
  }
  
  /**
   * Get a nested property from an object using a path string
   * @param {Object} obj - The object
   * @param {string} path - Path to the property (e.g. "user.profile.name")
   * @returns {*} The property value
   */
  function getNestedProperty(obj, path) {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Set a nested property in an object using a path string
   * @param {Object} obj - The object to modify
   * @param {string} path - Path to the property
   * @param {*} value - New value
   * @returns {Object} The modified object
   */
  function setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    
    // Navigate to the parent of the property to set
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (current[part] === undefined) {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    // Set the property
    current[parts[parts.length - 1]] = value;
    
    return obj;
  }
  
  /**
   * Check if a path has changed between old and new state
   * @param {Object} newState - New state
   * @param {Object} oldState - Old state
   * @param {string} path - Path to check
   * @returns {boolean} Whether the path has changed
   */
  function hasPathChanged(newState, oldState, path) {
    const newValue = getNestedProperty(newState, path);
    const oldValue = getNestedProperty(oldState, path);
    
    return newValue !== oldValue;
  }
  
  /**
   * Notify listeners of state changes
   * @param {Object} action - The action that caused the change
   */
  function notifyListeners(action) {
    _listeners.forEach(listener => {
      const { callback, paths } = listener;
      
      // If no paths specified, always notify
      if (!paths) {
        callback(_state, _prevState, action);
        return;
      }
      
      // Check if any watched paths have changed
      const pathList = Array.isArray(paths) ? paths : [paths];
      const hasChanged = pathList.some(path => {
        return hasPathChanged(_state, _prevState, path);
      });
      
      if (hasChanged) {
        callback(_state, _prevState, action);
      }
    });
  }
  
  /**
   * Create a selector function to derive data from state
   * @param {Function} selectorFn - Function that takes state and returns derived data
   * @returns {Function} Selector function
   */
  function createSelector(selectorFn) {
    // Simple memoization for selectors
    let lastState;
    let lastResult;
    
    return function selector() {
      const currentState = getState();
      
      if (currentState !== lastState) {
        lastState = currentState;
        lastResult = selectorFn(currentState);
      }
      
      return lastResult;
    };
  }
  
  // Public API
  return {
    init,
    getState,
    subscribe,
    dispatch,
    applyMiddleware,
    replaceState,
    registerReducer,
    registerReducers,
    actions,
    createSelector
  };
})();

/**
 * Common middleware
 */
FireEMS.Store.Middleware = {
  /**
   * Logger middleware - Logs actions and state changes
   */
  logger: store => next => action => {
    console.group(`Action: ${action.type}`);
    console.log('Previous state:', store.getState());
    console.log('Action:', action);
    
    const result = next(action);
    
    console.log('Next state:', store.getState());
    console.groupEnd();
    
    return result;
  },
  
  /**
   * Thunk middleware - Allows dispatching functions
   */
  thunk: store => next => action => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }
    
    return next(action);
  },
  
  /**
   * Local storage middleware - Persists state to localStorage
   * @param {Object} options - Middleware options
   * @returns {Function} Middleware function
   */
  localStorage: (options = {}) => {
    const {
      key = 'fireems-state',
      paths = [],
      debounceTime = 500
    } = options;
    
    let debounceTimer;
    
    return store => {
      // Load from localStorage on startup
      try {
        const savedState = localStorage.getItem(key);
        
        if (savedState) {
          const state = JSON.parse(savedState);
          store.replaceState({ ...store.getState(), ...state });
        }
      } catch (err) {
        console.error('Error loading state from localStorage:', err);
      }
      
      return next => action => {
        const result = next(action);
        
        // Debounce saving to localStorage
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          try {
            const fullState = store.getState();
            let stateToSave;
            
            if (paths.length === 0) {
              // Save entire state
              stateToSave = fullState;
            } else {
              // Save only specified paths
              stateToSave = {};
              paths.forEach(path => {
                const parts = path.split('.');
                let current = stateToSave;
                let statePart = fullState;
                
                // Build nested structure
                for (let i = 0; i < parts.length - 1; i++) {
                  const part = parts[i];
                  statePart = statePart[part];
                  
                  if (statePart === undefined) break;
                  
                  if (!current[part]) {
                    current[part] = {};
                  }
                  
                  current = current[part];
                }
                
                // Set value
                if (statePart !== undefined) {
                  const lastPart = parts[parts.length - 1];
                  current[lastPart] = statePart[lastPart];
                }
              });
            }
            
            localStorage.setItem(key, JSON.stringify(stateToSave));
          } catch (err) {
            console.error('Error saving state to localStorage:', err);
          }
        }, debounceTime);
        
        return result;
      };
    };
  }
};

/**
 * Component connector - Connect components to the store
 */
FireEMS.Store.connect = function(component, mapStateToProps, mapDispatchToProps) {
  if (!component) {
    throw new Error('Component is required');
  }
  
  // Define connected component
  function ConnectedComponent(props = {}) {
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
    const instance = component(mergedProps);
    
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
  }
  
  return ConnectedComponent;
};

// Initialize the store with empty state
FireEMS.Store.init({}, {
  middleware: [FireEMS.Store.Middleware.thunk]
});