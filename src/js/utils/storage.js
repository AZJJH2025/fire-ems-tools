/**
 * Storage Utility
 * 
 * Handles data storage and retrieval for the application
 */

export const Storage = {
  /**
   * Save data to storage
   * @param {string} key - The key to store the data under
   * @param {*} data - The data to store
   * @param {boolean} isTemporary - Whether this is temporary data (sessionStorage vs localStorage)
   * @returns {boolean} - Whether the save was successful
   */
  save(key, data, isTemporary = false) {
    try {
      const serialized = JSON.stringify(data);
      if (isTemporary) {
        sessionStorage.setItem(key, serialized);
      } else {
        localStorage.setItem(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Error saving data to ${isTemporary ? 'session' : 'local'} storage:`, error);
      return false;
    }
  },

  /**
   * Load data from storage
   * @param {string} key - The key to retrieve data from
   * @param {*} defaultValue - The default value if no data is found
   * @param {boolean} isTemporary - Whether this is temporary data (sessionStorage vs localStorage)
   * @returns {*} - The retrieved data or defaultValue if not found
   */
  load(key, defaultValue = null, isTemporary = false) {
    try {
      const storage = isTemporary ? sessionStorage : localStorage;
      const serialized = storage.getItem(key);
      
      if (serialized === null) {
        return defaultValue;
      }
      
      return JSON.parse(serialized);
    } catch (error) {
      console.error(`Error loading data from ${isTemporary ? 'session' : 'local'} storage:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove data from storage
   * @param {string} key - The key to remove
   * @param {boolean} isTemporary - Whether this is temporary data (sessionStorage vs localStorage)
   * @returns {boolean} - Whether the removal was successful
   */
  remove(key, isTemporary = false) {
    try {
      if (isTemporary) {
        sessionStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error(`Error removing data from ${isTemporary ? 'session' : 'local'} storage:`, error);
      return false;
    }
  },

  /**
   * Check if a key exists in storage
   * @param {string} key - The key to check
   * @param {boolean} isTemporary - Whether this is temporary data (sessionStorage vs localStorage)
   * @returns {boolean} - Whether the key exists
   */
  exists(key, isTemporary = false) {
    const storage = isTemporary ? sessionStorage : localStorage;
    return storage.getItem(key) !== null;
  },

  /**
   * Clear all data from storage
   * @param {boolean} isTemporary - Whether to clear temporary data (sessionStorage vs localStorage)
   * @returns {boolean} - Whether the clear was successful
   */
  clear(isTemporary = false) {
    try {
      if (isTemporary) {
        sessionStorage.clear();
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error(`Error clearing ${isTemporary ? 'session' : 'local'} storage:`, error);
      return false;
    }
  },

  /**
   * Get all keys matching a pattern
   * @param {RegExp} pattern - The pattern to match keys against
   * @param {boolean} isTemporary - Whether to check temporary data (sessionStorage vs localStorage)
   * @returns {string[]} - Array of matching keys
   */
  getKeysMatching(pattern, isTemporary = false) {
    const storage = isTemporary ? sessionStorage : localStorage;
    const keys = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (pattern.test(key)) {
        keys.push(key);
      }
    }
    
    return keys;
  },

  /**
   * Get all stored incidents
   * @returns {Object[]} - Array of incident objects
   */
  getAllIncidents() {
    const incidents = [];
    const draftKeys = this.getKeysMatching(/^incident_draft_/);
    const submittedKeys = this.getKeysMatching(/^incident_submitted_/);
    
    // Add draft incidents
    draftKeys.forEach(key => {
      const incident = this.load(key);
      if (incident) {
        incidents.push({...incident, is_draft: true});
      }
    });
    
    // Add submitted incidents
    submittedKeys.forEach(key => {
      const incident = this.load(key);
      if (incident) {
        incidents.push({...incident, is_draft: false});
      }
    });
    
    return incidents;
  }
};