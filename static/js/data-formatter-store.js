/**
 * data-formatter-store.js
 * A centralized state management module for the Data Formatter application
 * Implements a simplified Redux-like store pattern
 */

// Create an immediately invoked function expression (IIFE) to encapsulate the store
(function() {
  'use strict';

  // Initial state
  const initialState = {
    originalData: null,
    transformedData: null,
    selectedTool: null,
    fileType: null,
    uploadedFileId: null,
    isLoading: false,
    error: null,
    version: "1.0.0"
  };

  // Current state, cloned from initial state
  let state = JSON.parse(JSON.stringify(initialState));

  // Array of subscribers (callbacks)
  const subscribers = [];

  // Action types
  const ActionTypes = {
    SET_ORIGINAL_DATA: 'SET_ORIGINAL_DATA',
    SET_TRANSFORMED_DATA: 'SET_TRANSFORMED_DATA',
    SET_SELECTED_TOOL: 'SET_SELECTED_TOOL',
    SET_FILE_TYPE: 'SET_FILE_TYPE',
    SET_UPLOADED_FILE_ID: 'SET_UPLOADED_FILE_ID',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    RESET_STATE: 'RESET_STATE'
  };

  // Reducer function to update state based on actions
  function reducer(state, action) {
    switch (action.type) {
      case ActionTypes.SET_ORIGINAL_DATA:
        return { ...state, originalData: action.payload };
      
      case ActionTypes.SET_TRANSFORMED_DATA:
        return { ...state, transformedData: action.payload };
      
      case ActionTypes.SET_SELECTED_TOOL:
        return { ...state, selectedTool: action.payload };
      
      case ActionTypes.SET_FILE_TYPE:
        return { ...state, fileType: action.payload };
        
      case ActionTypes.SET_UPLOADED_FILE_ID:
        return { ...state, uploadedFileId: action.payload };
      
      case ActionTypes.SET_LOADING:
        return { ...state, isLoading: action.payload };
      
      case ActionTypes.SET_ERROR:
        return { ...state, error: action.payload };
      
      case ActionTypes.RESET_STATE:
        return JSON.parse(JSON.stringify(initialState));
      
      default:
        console.warn(`Unknown action type: ${action.type}`);
        return state;
    }
  }

  // Dispatch function to send actions to the reducer
  function dispatch(action) {
    console.log('Store: Dispatching action:', action);
    
    // Update state using the reducer
    state = reducer(state, action);
    
    // Notify all subscribers
    subscribers.forEach(callback => callback(state));
  }

  // Subscribe to store updates
  function subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('Store: Subscriber must be a function');
      return;
    }
    
    subscribers.push(callback);
    
    // Return unsubscribe function
    return function unsubscribe() {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  // Get current state (returns a copy to prevent direct mutation)
  function getState() {
    return JSON.parse(JSON.stringify(state));
  }

  // Action creators
  const actions = {
    setOriginalData: (data) => dispatch({
      type: ActionTypes.SET_ORIGINAL_DATA,
      payload: data
    }),
    
    setTransformedData: (data) => dispatch({
      type: ActionTypes.SET_TRANSFORMED_DATA,
      payload: data
    }),
    
    setSelectedTool: (tool) => dispatch({
      type: ActionTypes.SET_SELECTED_TOOL,
      payload: tool
    }),
    
    setFileType: (fileType) => dispatch({
      type: ActionTypes.SET_FILE_TYPE,
      payload: fileType
    }),
    
    setUploadedFileId: (id) => dispatch({
      type: ActionTypes.SET_UPLOADED_FILE_ID,
      payload: id
    }),
    
    setLoading: (isLoading) => dispatch({
      type: ActionTypes.SET_LOADING,
      payload: isLoading
    }),
    
    setError: (error) => dispatch({
      type: ActionTypes.SET_ERROR,
      payload: error
    }),
    
    resetState: () => dispatch({
      type: ActionTypes.RESET_STATE
    })
  };

  // Expose the store API
  window.DataFormatterStore = {
    getState,
    subscribe,
    dispatch, // Explicitly expose dispatch for custom actions
    actions,
    ActionTypes
  };

  // Log store initialization
  console.log('DataFormatterStore initialized');
})();