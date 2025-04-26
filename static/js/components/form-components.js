/**
 * FireEMS.ai Form Components
 * 
 * Reusable form components for building consistent forms across the application.
 * These components are built on top of the component registry and follow the design system.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Forms = window.FireEMS.Forms || {};

/**
 * Create a form with standard structure and validation
 * @param {Object} options - Form options
 * @returns {Object} Form component instance
 */
FireEMS.Forms.createForm = function(options = {}) {
  const {
    id,
    sections = [],
    onSubmit,
    submitText = 'Submit',
    cancelText = 'Cancel',
    onCancel,
    showCancel = true,
    initialValues = {},
    validateOnChange = false,
    autoComplete = 'off'
  } = options;
  
  // Track form fields and values
  const fields = {};
  let values = { ...initialValues };
  
  // Create form element
  const form = document.createElement('form');
  form.id = id || `form-${Date.now()}`;
  form.className = 'form';
  form.autocomplete = autoComplete;
  
  // Add sections
  sections.forEach(section => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'form-section';
    
    // Add section title if provided
    if (section.title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'form-section-title';
      titleEl.textContent = section.title;
      sectionEl.appendChild(titleEl);
    }
    
    // Add section description if provided
    if (section.description) {
      const descEl = document.createElement('p');
      descEl.className = 'form-section-description';
      descEl.textContent = section.description;
      sectionEl.appendChild(descEl);
    }
    
    // Add fields
    section.fields.forEach(fieldConfig => {
      // Create field component
      let fieldComponent;
      
      if (fieldConfig.type === 'select') {
        fieldComponent = FireEMS.ComponentRegistry.create('FormGroup', {
          ...fieldConfig,
          value: values[fieldConfig.id] !== undefined ? values[fieldConfig.id] : fieldConfig.value,
          onChange: (value) => {
            // Update value
            values[fieldConfig.id] = value;
            
            // Call custom onChange handler if provided
            if (fieldConfig.onChange) {
              fieldConfig.onChange(value);
            }
            
            // Validate if required
            if (validateOnChange) {
              fieldComponent.validate();
            }
          }
        });
      } else {
        fieldComponent = FireEMS.ComponentRegistry.create('FormGroup', {
          ...fieldConfig,
          value: values[fieldConfig.id] !== undefined ? values[fieldConfig.id] : fieldConfig.value,
          onChange: (value) => {
            // Update value
            values[fieldConfig.id] = value;
            
            // Call custom onChange handler if provided
            if (fieldConfig.onChange) {
              fieldConfig.onChange(value);
            }
            
            // Validate if required
            if (validateOnChange) {
              fieldComponent.validate();
            }
          }
        });
      }
      
      // Store field component
      fields[fieldConfig.id] = fieldComponent;
      
      // Add field to section
      sectionEl.appendChild(fieldComponent.element);
    });
    
    form.appendChild(sectionEl);
  });
  
  // Add form actions
  const actionsEl = document.createElement('div');
  actionsEl.className = 'form-actions';
  
  // Add submit button
  const submitBtn = FireEMS.ComponentRegistry.create('Button', {
    text: submitText,
    type: 'primary',
    icon: 'check',
    onClick: (e) => {
      e.preventDefault();
      
      // Validate form
      if (validateForm()) {
        // Call onSubmit handler
        if (onSubmit) {
          onSubmit(values);
        }
      }
    }
  });
  
  actionsEl.appendChild(submitBtn.element);
  
  // Add cancel button if enabled
  if (showCancel) {
    const cancelBtn = FireEMS.ComponentRegistry.create('Button', {
      text: cancelText,
      type: 'secondary',
      icon: 'times',
      onClick: (e) => {
        e.preventDefault();
        
        // Call onCancel handler
        if (onCancel) {
          onCancel();
        }
      }
    });
    
    actionsEl.appendChild(cancelBtn.element);
  }
  
  form.appendChild(actionsEl);
  
  // Validate all form fields
  function validateForm() {
    let isValid = true;
    
    // Validate each field
    Object.values(fields).forEach(field => {
      if (!field.validate()) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  // Component instance
  return {
    element: form,
    
    /**
     * Get form values
     * @returns {Object} Form values
     */
    getValues() {
      return { ...values };
    },
    
    /**
     * Set form values
     * @param {Object} newValues - New form values
     */
    setValues(newValues) {
      // Update values
      values = { ...values, ...newValues };
      
      // Update field values
      Object.entries(newValues).forEach(([id, value]) => {
        if (fields[id]) {
          fields[id].setValue(value);
        }
      });
    },
    
    /**
     * Reset form to initial values
     */
    reset() {
      values = { ...initialValues };
      
      // Reset field values
      Object.entries(fields).forEach(([id, field]) => {
        const initialValue = initialValues[id];
        if (initialValue !== undefined) {
          field.setValue(initialValue);
        } else {
          field.setValue('');
        }
      });
    },
    
    /**
     * Validate form
     * @returns {boolean} Whether the form is valid
     */
    validate() {
      return validateForm();
    },
    
    /**
     * Get a field component
     * @param {string} id - Field ID
     * @returns {Object} Field component
     */
    getField(id) {
      return fields[id];
    },
    
    /**
     * Add a field to the form
     * @param {Object} fieldConfig - Field configuration
     * @param {string} sectionIndex - Section index
     */
    addField(fieldConfig, sectionIndex = 0) {
      // Get section element
      const sectionEl = form.querySelectorAll('.form-section')[sectionIndex];
      
      if (!sectionEl) {
        console.error(`Section at index ${sectionIndex} not found`);
        return;
      }
      
      // Create field component
      const fieldComponent = FireEMS.ComponentRegistry.create('FormGroup', {
        ...fieldConfig,
        value: values[fieldConfig.id] !== undefined ? values[fieldConfig.id] : fieldConfig.value,
        onChange: (value) => {
          // Update value
          values[fieldConfig.id] = value;
          
          // Call custom onChange handler if provided
          if (fieldConfig.onChange) {
            fieldConfig.onChange(value);
          }
          
          // Validate if required
          if (validateOnChange) {
            fieldComponent.validate();
          }
        }
      });
      
      // Store field component
      fields[fieldConfig.id] = fieldComponent;
      
      // Add field to section (before form actions)
      sectionEl.appendChild(fieldComponent.element);
    },
    
    /**
     * Remove a field from the form
     * @param {string} id - Field ID
     */
    removeField(id) {
      const field = fields[id];
      
      if (field) {
        // Remove field element
        field.element.remove();
        
        // Remove from fields object
        delete fields[id];
        
        // Remove from values
        delete values[id];
      }
    }
  };
};

/**
 * Create a search form component
 * @param {Object} options - Search form options
 * @returns {Object} Search form component instance
 */
FireEMS.Forms.createSearchForm = function(options = {}) {
  const {
    id,
    placeholder = 'Search...',
    onSearch,
    advancedSearch = false,
    advancedFields = [],
    searchButtonText = 'Search',
    clearButtonText = 'Clear'
  } = options;
  
  // Create search form container
  const container = document.createElement('div');
  container.className = 'search-form-container';
  
  // Create simple search form
  const simpleSearch = document.createElement('div');
  simpleSearch.className = 'simple-search';
  
  // Create search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = id ? `${id}-input` : 'search-input';
  searchInput.placeholder = placeholder;
  searchInput.className = 'search-input';
  
  // Create search button
  const searchButton = FireEMS.ComponentRegistry.create('Button', {
    text: '',
    type: 'primary',
    icon: 'search',
    className: 'search-button',
    onClick: () => {
      if (onSearch) {
        onSearch(getSearchValues());
      }
    }
  });
  
  simpleSearch.appendChild(searchInput);
  simpleSearch.appendChild(searchButton.element);
  
  // Add advanced search toggle if enabled
  if (advancedSearch) {
    const advancedToggle = document.createElement('button');
    advancedToggle.type = 'button';
    advancedToggle.className = 'advanced-search-toggle';
    advancedToggle.innerHTML = 'Advanced <i class="fas fa-chevron-down"></i>';
    
    advancedToggle.addEventListener('click', () => {
      const advancedPanel = container.querySelector('.advanced-search');
      const icon = advancedToggle.querySelector('i');
      
      if (advancedPanel.style.display === 'none') {
        advancedPanel.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
      } else {
        advancedPanel.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
      }
    });
    
    simpleSearch.appendChild(advancedToggle);
  }
  
  container.appendChild(simpleSearch);
  
  // Create advanced search form if enabled
  let advancedForm;
  if (advancedSearch && advancedFields.length > 0) {
    const advancedPanel = document.createElement('div');
    advancedPanel.className = 'advanced-search';
    advancedPanel.style.display = 'none';
    
    // Create advanced search form
    advancedForm = FireEMS.Forms.createForm({
      id: id ? `${id}-advanced` : 'advanced-search-form',
      sections: [
        {
          fields: advancedFields
        }
      ],
      submitText: searchButtonText,
      cancelText: clearButtonText,
      showCancel: true,
      onSubmit: (values) => {
        if (onSearch) {
          onSearch({
            ...values,
            query: searchInput.value
          });
        }
      },
      onCancel: () => {
        // Clear advanced form
        advancedForm.reset();
        
        // Clear search input
        searchInput.value = '';
        
        // Trigger search with empty values
        if (onSearch) {
          onSearch({});
        }
      }
    });
    
    advancedPanel.appendChild(advancedForm.element);
    container.appendChild(advancedPanel);
  }
  
  // Handle simple search form submission
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      if (onSearch) {
        onSearch(getSearchValues());
      }
    }
  });
  
  // Get all search values
  function getSearchValues() {
    const values = {
      query: searchInput.value
    };
    
    // Add advanced form values if available
    if (advancedForm) {
      Object.assign(values, advancedForm.getValues());
    }
    
    return values;
  }
  
  // Component instance
  return {
    element: container,
    
    /**
     * Get search values
     * @returns {Object} Search values
     */
    getValues() {
      return getSearchValues();
    },
    
    /**
     * Set search values
     * @param {Object} values - Search values
     */
    setValues(values) {
      // Set search input value
      if (values.query !== undefined) {
        searchInput.value = values.query;
      }
      
      // Set advanced form values if available
      if (advancedForm) {
        advancedForm.setValues(values);
      }
    },
    
    /**
     * Reset the search form
     */
    reset() {
      // Clear search input
      searchInput.value = '';
      
      // Reset advanced form if available
      if (advancedForm) {
        advancedForm.reset();
      }
    },
    
    /**
     * Focus the search input
     */
    focus() {
      searchInput.focus();
    }
  };
};

/**
 * Create a file upload component
 * @param {Object} options - File upload options
 * @returns {Object} File upload component instance
 */
FireEMS.Forms.createFileUpload = function(options = {}) {
  const {
    id,
    label = 'Upload File',
    accept = '*/*',
    multiple = false,
    dropZone = true,
    onFileSelect,
    onFileRemove,
    maxFileSize,
    maxFiles
  } = options;
  
  // Track selected files
  let selectedFiles = [];
  
  // Create component container
  const container = document.createElement('div');
  container.className = 'file-upload-component';
  
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = id || `file-upload-${Date.now()}`;
  fileInput.accept = accept;
  fileInput.multiple = multiple;
  fileInput.style.display = 'none';
  
  container.appendChild(fileInput);
  
  // Create upload button
  const uploadButton = document.createElement('button');
  uploadButton.type = 'button';
  uploadButton.className = 'upload-button';
  uploadButton.innerHTML = `<i class="fas fa-upload"></i> ${label}`;
  
  uploadButton.addEventListener('click', () => {
    fileInput.click();
  });
  
  container.appendChild(uploadButton);
  
  // Create drop zone if enabled
  if (dropZone) {
    const dropZoneEl = document.createElement('div');
    dropZoneEl.className = 'drop-zone';
    dropZoneEl.innerHTML = `
      <div class="drop-zone-message">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Drag and drop files here</p>
        <p class="drop-zone-hint">or click the upload button above</p>
      </div>
    `;
    
    // Add drag and drop event listeners
    dropZoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZoneEl.classList.add('active');
    });
    
    dropZoneEl.addEventListener('dragleave', () => {
      dropZoneEl.classList.remove('active');
    });
    
    dropZoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneEl.classList.remove('active');
      
      // Handle dropped files
      handleFiles(e.dataTransfer.files);
    });
    
    container.appendChild(dropZoneEl);
  }
  
  // Create files list
  const filesList = document.createElement('div');
  filesList.className = 'files-list';
  
  container.appendChild(filesList);
  
  // Handle file selection
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });
  
  // Process selected files
  function handleFiles(files) {
    if (!files || files.length === 0) return;
    
    // Convert FileList to array
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (maxFiles && selectedFiles.length + fileArray.length > maxFiles) {
      showError(`You can only upload up to ${maxFiles} files`);
      return;
    }
    
    // Process each file
    fileArray.forEach(file => {
      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        showError(`File "${file.name}" exceeds the maximum file size of ${formatFileSize(maxFileSize)}`);
        return;
      }
      
      // Add file to selected files
      selectedFiles.push(file);
      
      // Create file item
      const fileItem = createFileItem(file);
      filesList.appendChild(fileItem);
    });
    
    // Clear file input
    fileInput.value = '';
    
    // Call onFileSelect callback
    if (onFileSelect) {
      onFileSelect(selectedFiles);
    }
  }
  
  // Create file item element
  function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Determine file icon
    let iconClass = 'fas fa-file';
    
    if (file.type.startsWith('image/')) {
      iconClass = 'fas fa-file-image';
    } else if (file.type.startsWith('video/')) {
      iconClass = 'fas fa-file-video';
    } else if (file.type.startsWith('audio/')) {
      iconClass = 'fas fa-file-audio';
    } else if (file.type.includes('pdf')) {
      iconClass = 'fas fa-file-pdf';
    } else if (file.type.includes('word')) {
      iconClass = 'fas fa-file-word';
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      iconClass = 'fas fa-file-excel';
    }
    
    // Create file item content
    fileItem.innerHTML = `
      <div class="file-item-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="file-item-info">
        <div class="file-item-name">${file.name}</div>
        <div class="file-item-size">${formatFileSize(file.size)}</div>
      </div>
      <button type="button" class="file-item-remove">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add event listener for remove button
    const removeButton = fileItem.querySelector('.file-item-remove');
    removeButton.addEventListener('click', () => {
      // Remove file from selected files
      const index = selectedFiles.indexOf(file);
      if (index !== -1) {
        selectedFiles.splice(index, 1);
      }
      
      // Remove file item from DOM
      fileItem.remove();
      
      // Call onFileRemove callback
      if (onFileRemove) {
        onFileRemove(file, selectedFiles);
      }
    });
    
    // Create image preview for image files
    if (file.type.startsWith('image/')) {
      createImagePreview(file, fileItem);
    }
    
    return fileItem;
  }
  
  // Create image preview
  function createImagePreview(file, fileItem) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const preview = document.createElement('div');
      preview.className = 'file-item-preview';
      preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}">`;
      
      fileItem.querySelector('.file-item-icon').style.display = 'none';
      fileItem.insertBefore(preview, fileItem.querySelector('.file-item-info'));
    };
    
    reader.readAsDataURL(file);
  }
  
  // Show error message
  function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'file-upload-error';
    errorEl.textContent = message;
    
    container.appendChild(errorEl);
    
    // Remove error after 5 seconds
    setTimeout(() => {
      errorEl.remove();
    }, 5000);
  }
  
  // Format file size
  function formatFileSize(size) {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
  
  // Component instance
  return {
    element: container,
    
    /**
     * Get selected files
     * @returns {Array} Selected files
     */
    getFiles() {
      return [...selectedFiles];
    },
    
    /**
     * Clear selected files
     */
    clear() {
      selectedFiles = [];
      filesList.innerHTML = '';
      fileInput.value = '';
    },
    
    /**
     * Programmatically open file selection dialog
     */
    openFileDialog() {
      fileInput.click();
    }
  };
};

/**
 * Create a date picker component
 * @param {Object} options - Date picker options
 * @returns {Object} Date picker component instance
 */
FireEMS.Forms.createDatePicker = function(options = {}) {
  const {
    id,
    label,
    value,
    required = false,
    onChange,
    min,
    max,
    helpText,
    includeTime = false
  } = options;
  
  // Type based on whether to include time
  const type = includeTime ? 'datetime-local' : 'date';
  
  // Create form group for date picker
  const datePicker = FireEMS.ComponentRegistry.create('FormGroup', {
    id,
    label,
    type,
    value,
    required,
    onChange,
    helpText,
    validation: {
      min,
      max
    }
  });
  
  // Component instance
  return datePicker;
};

/**
 * Initialize form components
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('FireEMS Forms: Initializing form components');
  
  // Initialize any declarative form components here
});