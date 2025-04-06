/**
 * Settings Utility
 * 
 * Handles application settings management
 */

import { Storage } from './storage.js';

// Default settings
const DEFAULT_SETTINGS = {
  defaultStatus: 'draft',
  autoSaveInterval: 5, // minutes
  defaultLocation: '',
  itemsPerPage: 25,
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12', // 12 or 24 hour
  storageMode: 'local', // local, server, both
  lastSyncTime: null
};

export const Settings = {
  // Settings cache
  _settings: null,

  /**
   * Load settings from storage
   * @returns {Object} - The current settings
   */
  load() {
    this._settings = Storage.load('incident_logger_settings', DEFAULT_SETTINGS);
    console.log('Settings loaded from storage:', this._settings);
    return this._settings;
  },

  /**
   * Save settings to storage
   * @returns {boolean} - Whether the save was successful
   */
  save() {
    const result = Storage.save('incident_logger_settings', this._settings);
    console.log('Settings saved to storage');
    return result;
  },

  /**
   * Get a setting value
   * @param {string} key - The setting key to get
   * @param {*} defaultValue - Default value if setting is not found
   * @returns {*} - The setting value
   */
  get(key, defaultValue = null) {
    // Ensure settings are loaded
    if (!this._settings) {
      this.load();
    }
    
    // Return the setting or default
    return this._settings.hasOwnProperty(key) 
      ? this._settings[key] 
      : (defaultValue !== null ? defaultValue : DEFAULT_SETTINGS[key]);
  },

  /**
   * Set a setting value
   * @param {string} key - The setting key to set
   * @param {*} value - The value to set
   * @param {boolean} autoSave - Whether to automatically save settings
   * @returns {boolean} - Whether the operation was successful
   */
  set(key, value, autoSave = true) {
    // Ensure settings are loaded
    if (!this._settings) {
      this.load();
    }
    
    // Update the setting
    this._settings[key] = value;
    
    // Save if requested
    return autoSave ? this.save() : true;
  },

  /**
   * Reset settings to defaults
   * @param {boolean} autoSave - Whether to automatically save settings
   * @returns {boolean} - Whether the operation was successful
   */
  reset(autoSave = true) {
    this._settings = {...DEFAULT_SETTINGS};
    return autoSave ? this.save() : true;
  },

  /**
   * Update multiple settings at once
   * @param {Object} newSettings - Object with setting key/value pairs
   * @param {boolean} autoSave - Whether to automatically save settings
   * @returns {boolean} - Whether the operation was successful
   */
  update(newSettings, autoSave = true) {
    // Ensure settings are loaded
    if (!this._settings) {
      this.load();
    }
    
    // Update settings
    this._settings = {...this._settings, ...newSettings};
    
    // Save if requested
    return autoSave ? this.save() : true;
  },

  /**
   * Get all settings
   * @returns {Object} - All settings
   */
  getAll() {
    // Ensure settings are loaded
    if (!this._settings) {
      this.load();
    }
    
    return {...this._settings};
  }
};