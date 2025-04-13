/**
 * FireEMS.ai Data Display Components
 * 
 * A collection of standardized UI components for consistent data visualization,
 * filtering, and exporting across Fire-EMS tools. These components build on the
 * DataStandardizer to present data in a uniform way regardless of source format.
 * 
 * Key features:
 * - Standardized data tables with sorting, filtering, and pagination
 * - Consistent export functionality (CSV, Excel, PDF)
 * - Universal search and filter components
 * - Time period selectors and date range filters
 * - Military time formatting consistency
 * 
 * This library provides both vanilla JavaScript components and wrapper functions
 * for integration with various frameworks. All components use the FireEMS
 * DataStandardizer for field mapping and data format normalization.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Components = window.FireEMS.Components || {};

/**
 * FireEMS DataTable Component
 * A standardized data table with consistent styling and functionality
 */
FireEMS.Components.DataTable = (function() {
  // Dependencies
  const DataStandardizer = window.FireEMS.Utils.DataStandardizer;
  const ErrorHandler = window.FireEMS.Utils.ErrorHandler;
  
  // Default styling
  const DEFAULT_STYLES = {
    table: 'width: 100%; border-collapse: collapse; font-size: 14px;',
    header: 'padding: 10px; text-align: left; border-bottom: 2px solid #ddd; position: sticky; top: 0; background-color: #f0f0f0; font-weight: bold; color: #333;',
    row: 'border-bottom: 1px solid #ddd;',
    evenRow: 'background-color: #f9f9f9;',
    cell: 'padding: 8px; text-align: left;',
    container: 'position: relative; margin: 15px 0; overflow: auto;',
    pagination: 'display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-size: 14px;',
    button: 'background-color: #4CAF50; color: white; border: none; padding: 5px 10px; text-align: center; cursor: pointer; border-radius: 3px; margin: 0 5px;',
    buttonDisabled: 'background-color: #cccccc; cursor: not-allowed;',
    searchContainer: 'margin-bottom: 15px; display: flex; align-items: center;',
    searchInput: 'padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex-grow: 1; max-width: 300px;',
    searchLabel: 'margin-right: 8px; font-weight: bold;',
    exportButton: 'background-color: #2196F3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-left: 10px;'
  };
  
  // Column type formatters
  const COLUMN_FORMATTERS = {
    date: (value) => {
      if (!value) return '';
      if (DataStandardizer) {
        const date = DataStandardizer.parseDate(value);
        return date ? DataStandardizer.formatDate(date, 'MM/DD/YYYY') : value;
      }
      // Fallback date formatting
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
        }
      } catch (e) {}
      return value;
    },
    time: (value) => {
      if (!value) return '';
      if (DataStandardizer) {
        const time = DataStandardizer.parseTime(value);
        return time ? DataStandardizer.formatTime(time, 'HH:MM:SS') : value;
      }
      // Fallback time formatting
      return value;
    },
    datetime: (value) => {
      if (!value) return '';
      if (DataStandardizer) {
        const date = DataStandardizer.parseDate(value);
        if (date) {
          const dateStr = DataStandardizer.formatDate(date, 'MM/DD/YYYY');
          const timeStr = DataStandardizer.formatTime({
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds()
          }, 'HH:MM:SS');
          return `${dateStr} ${timeStr}`;
        }
      }
      // Fallback datetime formatting
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      } catch (e) {}
      return value;
    },
    number: (value) => {
      if (value === null || value === undefined || value === '') return '';
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    },
    coordinate: (value) => {
      if (value === null || value === undefined || value === '') return '';
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(6);
    },
    text: (value) => {
      return value === null || value === undefined ? '' : String(value);
    }
  };
  
  /**
   * Creates a DataTable component
   * @param {string|Element} container - Container element or ID
   * @param {Array} data - Array of data objects to display
   * @param {Object} options - Configuration options
   * @returns {Object} - DataTable API
   */
  function create(container, data = [], options = {}) {
    // Get container element
    const containerElement = typeof container === 'string' ? 
      document.getElementById(container) : container;
    
    if (!containerElement) {
      console.error('DataTable: Container element not found');
      return null;
    }
    
    // Merge options with defaults
    const config = {
      pageSize: options.pageSize || 25,
      pageSizeOptions: options.pageSizeOptions || [10, 25, 50, 100, 'All'],
      visibleColumns: options.visibleColumns || null,
      columnOrder: options.columnOrder || null,
      columnTypes: options.columnTypes || {},
      columnLabels: options.columnLabels || {},
      initialSortColumn: options.initialSortColumn || null,
      initialSortDirection: options.initialSortDirection || 'asc',
      showSearch: options.showSearch !== false,
      showExport: options.showExport !== false,
      showPagination: options.showPagination !== false,
      styles: { ...DEFAULT_STYLES, ...(options.styles || {}) },
      exportFilename: options.exportFilename || 'data-export',
      onRowClick: options.onRowClick || null,
      standardizeData: options.standardizeData !== false,
      highlightSearch: options.highlightSearch !== false,
      customFormatters: options.customFormatters || {}
    };
    
    // Internal state
    const state = {
      data: config.standardizeData && DataStandardizer ? 
        DataStandardizer.standardize(data) : [...data],
      filteredData: [],
      visibleData: [],
      columns: [],
      currentPage: 0,
      pageSize: config.pageSize,
      sortColumn: config.initialSortColumn,
      sortDirection: config.initialSortDirection,
      searchTerm: '',
      tableElement: null,
      paginationElement: null,
      searchElement: null
    };
    
    // Determine table columns
    function determineColumns() {
      if (state.data.length === 0) {
        state.columns = [];
        return;
      }
      
      // Get all unique fields from data
      const uniqueFields = new Set();
      state.data.forEach(item => {
        Object.keys(item).forEach(key => uniqueFields.add(key));
      });
      
      // If columnOrder is provided, use it to order the columns
      if (config.columnOrder && Array.isArray(config.columnOrder)) {
        state.columns = config.columnOrder.filter(col => uniqueFields.has(col));
        
        // Add any remaining fields not in columnOrder
        uniqueFields.forEach(field => {
          if (!state.columns.includes(field)) {
            state.columns.push(field);
          }
        });
      } else {
        state.columns = [...uniqueFields];
      }
      
      // Filter to only visible columns if specified
      if (config.visibleColumns && Array.isArray(config.visibleColumns)) {
        state.columns = state.columns.filter(col => config.visibleColumns.includes(col));
      }
    }
    
    // Apply search filter to data
    function applySearchFilter() {
      if (!state.searchTerm) {
        state.filteredData = [...state.data];
        return;
      }
      
      const term = state.searchTerm.toLowerCase();
      state.filteredData = state.data.filter(item => {
        return Object.values(item).some(value => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(term);
        });
      });
    }
    
    // Apply sorting to filtered data
    function applySorting() {
      if (!state.sortColumn) {
        return;
      }
      
      state.filteredData.sort((a, b) => {
        const aValue = a[state.sortColumn];
        const bValue = b[state.sortColumn];
        
        // Handle null/undefined values
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        // Determine column type
        let columnType = config.columnTypes[state.sortColumn] || 'text';
        
        // Try to detect type if not specified
        if (columnType === 'text' && DataStandardizer) {
          columnType = DataStandardizer.detectFieldType(state.sortColumn, aValue);
        }
        
        // Compare based on type
        let comparison = 0;
        
        switch (columnType) {
          case 'number':
          case 'coordinate':
            comparison = parseFloat(aValue) - parseFloat(bValue);
            break;
          case 'date':
          case 'datetime':
            const dateA = new Date(aValue);
            const dateB = new Date(bValue);
            comparison = dateA - dateB;
            break;
          default:
            comparison = String(aValue).localeCompare(String(bValue));
        }
        
        return state.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    // Apply pagination to get visible data
    function applyPagination() {
      // If page size is 'All', show all data
      if (state.pageSize === 'All') {
        state.visibleData = [...state.filteredData];
        return;
      }
      
      const startIndex = state.currentPage * state.pageSize;
      state.visibleData = state.filteredData.slice(startIndex, startIndex + state.pageSize);
    }
    
    // Render the table
    function renderTable() {
      // Clear container and create wrapper
      containerElement.innerHTML = '';
      containerElement.style.cssText = config.styles.container;
      
      // Create search box if enabled
      if (config.showSearch) {
        renderSearchBox();
      }
      
      // Create table element
      const table = document.createElement('table');
      table.className = 'fireems-datatable';
      table.style.cssText = config.styles.table;
      state.tableElement = table;
      
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      state.columns.forEach(column => {
        const th = document.createElement('th');
        th.style.cssText = config.styles.header;
        
        // Use custom column label if provided
        const columnLabel = config.columnLabels[column] || 
          (DataStandardizer ? DataStandardizer.getStandardFieldName(column) || column : column);
        
        th.textContent = columnLabel;
        
        // Add sort indicators and click handler
        if (column === state.sortColumn) {
          th.textContent += state.sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        
        th.addEventListener('click', () => {
          // Toggle direction if already sorting by this column
          if (column === state.sortColumn) {
            state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            state.sortColumn = column;
            state.sortDirection = 'asc';
          }
          
          // Re-render the table
          applySorting();
          applyPagination();
          renderTable();
        });
        
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      if (state.visibleData.length === 0) {
        // Show "No data" message
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = state.columns.length;
        noDataCell.textContent = 'No data to display';
        noDataCell.style.textAlign = 'center';
        noDataCell.style.padding = '20px';
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
      } else {
        // Add data rows
        state.visibleData.forEach((item, rowIndex) => {
          const row = document.createElement('tr');
          row.style.cssText = config.styles.row;
          
          // Add alternating row colors
          if (rowIndex % 2 === 0) {
            row.style.backgroundColor = config.styles.evenRow.replace('background-color: ', '');
          }
          
          // Add row click handler if provided
          if (config.onRowClick) {
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => config.onRowClick(item, rowIndex));
          }
          
          // Add cells
          state.columns.forEach(column => {
            const cell = document.createElement('td');
            cell.style.cssText = config.styles.cell;
            
            // Get cell value
            let value = item[column];
            
            // Determine column type
            let columnType = config.columnTypes[column] || 'text';
            
            // Try to detect type if not specified
            if (columnType === 'text' && DataStandardizer) {
              columnType = DataStandardizer.detectFieldType(column, value);
            }
            
            // Format value based on column type
            const formatter = config.customFormatters[column] || COLUMN_FORMATTERS[columnType] || COLUMN_FORMATTERS.text;
            const formattedValue = formatter(value);
            
            // Apply search term highlighting if enabled
            if (config.highlightSearch && state.searchTerm && formattedValue) {
              const searchTerm = state.searchTerm.toLowerCase();
              const valueStr = String(formattedValue);
              const lowerValue = valueStr.toLowerCase();
              
              if (lowerValue.includes(searchTerm)) {
                // Create a highlighted version
                let html = '';
                let lastIndex = 0;
                
                // Find all occurrences and highlight them
                let searchIndex = lowerValue.indexOf(searchTerm);
                while (searchIndex !== -1) {
                  // Add text before match
                  html += valueStr.substring(lastIndex, searchIndex);
                  
                  // Add highlighted match
                  html += `<span style="background-color: yellow; color: black;">${valueStr.substring(searchIndex, searchIndex + state.searchTerm.length)}</span>`;
                  
                  // Move to next match
                  lastIndex = searchIndex + state.searchTerm.length;
                  searchIndex = lowerValue.indexOf(searchTerm, lastIndex);
                }
                
                // Add remaining text
                html += valueStr.substring(lastIndex);
                
                cell.innerHTML = html;
              } else {
                cell.textContent = formattedValue;
              }
            } else {
              cell.textContent = formattedValue;
            }
            
            row.appendChild(cell);
          });
          
          tbody.appendChild(row);
        });
      }
      
      table.appendChild(tbody);
      containerElement.appendChild(table);
      
      // Add pagination if enabled
      if (config.showPagination) {
        renderPagination();
      }
      
      // Add export button if enabled
      if (config.showExport) {
        renderExportButton();
      }
    }
    
    // Render search box
    function renderSearchBox() {
      const searchContainer = document.createElement('div');
      searchContainer.style.cssText = config.styles.searchContainer;
      
      const searchLabel = document.createElement('label');
      searchLabel.textContent = 'Search:';
      searchLabel.style.cssText = config.styles.searchLabel;
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search all columns...';
      searchInput.value = state.searchTerm;
      searchInput.style.cssText = config.styles.searchInput;
      
      // Add search input event handler
      searchInput.addEventListener('input', () => {
        state.searchTerm = searchInput.value;
        state.currentPage = 0; // Reset to first page
        
        // Re-filter and render
        applySearchFilter();
        applySorting();
        applyPagination();
        renderTable();
      });
      
      searchContainer.appendChild(searchLabel);
      searchContainer.appendChild(searchInput);
      containerElement.appendChild(searchContainer);
      state.searchElement = searchInput;
    }
    
    // Render pagination controls
    function renderPagination() {
      const paginationContainer = document.createElement('div');
      paginationContainer.style.cssText = config.styles.pagination;
      
      // Page size selector
      const pageSizeSelector = document.createElement('div');
      
      const pageSizeLabel = document.createElement('label');
      pageSizeLabel.textContent = 'Rows per page:';
      pageSizeLabel.style.marginRight = '5px';
      
      const pageSizeSelect = document.createElement('select');
      
      config.pageSizeOptions.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        option.selected = state.pageSize === size;
        pageSizeSelect.appendChild(option);
      });
      
      pageSizeSelect.addEventListener('change', () => {
        state.pageSize = pageSizeSelect.value === 'All' ? 'All' : parseInt(pageSizeSelect.value, 10);
        state.currentPage = 0; // Reset to first page
        
        // Re-apply pagination and render
        applyPagination();
        renderTable();
      });
      
      pageSizeSelector.appendChild(pageSizeLabel);
      pageSizeSelector.appendChild(pageSizeSelect);
      
      // Page navigation
      const pageNavigation = document.createElement('div');
      
      // Page info
      const pageInfo = document.createElement('span');
      
      const totalPages = state.pageSize === 'All' ? 
        1 : Math.ceil(state.filteredData.length / state.pageSize);
      
      const startItem = state.pageSize === 'All' ? 
        1 : state.currentPage * state.pageSize + 1;
      
      const endItem = state.pageSize === 'All' ? 
        state.filteredData.length : 
        Math.min((state.currentPage + 1) * state.pageSize, state.filteredData.length);
      
      pageInfo.textContent = `${startItem}-${endItem} of ${state.filteredData.length} items`;
      pageInfo.style.marginRight = '10px';
      
      // Previous page button
      const prevButton = document.createElement('button');
      prevButton.textContent = '←';
      prevButton.style.cssText = config.styles.button;
      
      if (state.currentPage === 0) {
        prevButton.disabled = true;
        prevButton.style.cssText += config.styles.buttonDisabled;
      }
      
      prevButton.addEventListener('click', () => {
        if (state.currentPage > 0) {
          state.currentPage--;
          applyPagination();
          renderTable();
        }
      });
      
      // Next page button
      const nextButton = document.createElement('button');
      nextButton.textContent = '→';
      nextButton.style.cssText = config.styles.button;
      
      if (state.currentPage >= totalPages - 1) {
        nextButton.disabled = true;
        nextButton.style.cssText += config.styles.buttonDisabled;
      }
      
      nextButton.addEventListener('click', () => {
        if (state.currentPage < totalPages - 1) {
          state.currentPage++;
          applyPagination();
          renderTable();
        }
      });
      
      pageNavigation.appendChild(pageInfo);
      pageNavigation.appendChild(prevButton);
      pageNavigation.appendChild(nextButton);
      
      paginationContainer.appendChild(pageSizeSelector);
      paginationContainer.appendChild(pageNavigation);
      
      containerElement.appendChild(paginationContainer);
      state.paginationElement = paginationContainer;
    }
    
    // Render export button
    function renderExportButton() {
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = 'text-align: right; margin-top: 10px;';
      
      const exportButton = document.createElement('button');
      exportButton.textContent = 'Export to CSV';
      exportButton.style.cssText = config.styles.exportButton;
      
      exportButton.addEventListener('click', () => {
        exportToCSV();
      });
      
      exportContainer.appendChild(exportButton);
      containerElement.appendChild(exportContainer);
    }
    
    // Export data to CSV
    function exportToCSV() {
      // Use all data, not just filtered/paginated data
      const dataToExport = state.filteredData;
      
      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }
      
      try {
        // Create CSV content
        let csv = state.columns.map(col => {
          // Use custom column label if provided, otherwise use column name
          const label = config.columnLabels[col] || col;
          // Escape quotes and wrap in quotes
          return `"${String(label).replace(/"/g, '""')}"`;
        }).join(',') + '\n';
        
        // Add data rows
        dataToExport.forEach(item => {
          const row = state.columns.map(column => {
            // Get value
            let value = item[column];
            
            // Determine column type and use appropriate formatter
            let columnType = config.columnTypes[column] || 'text';
            
            // Try to detect type if not specified
            if (columnType === 'text' && DataStandardizer) {
              columnType = DataStandardizer.detectFieldType(column, value);
            }
            
            // Format value
            const formatter = config.customFormatters[column] || COLUMN_FORMATTERS[columnType] || COLUMN_FORMATTERS.text;
            const formattedValue = formatter(value);
            
            // Escape quotes and wrap in quotes
            return `"${String(formattedValue).replace(/"/g, '""')}"`;
          }).join(',');
          
          csv += row + '\n';
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${config.exportFilename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting data:', error);
        if (ErrorHandler) {
          ErrorHandler.reportError({
            message: 'Failed to export data',
            error,
            component: 'DataTable',
            action: 'exportToCSV'
          });
        }
        alert('Failed to export data. See console for details.');
      }
    }
    
    // Initialize and render
    function initialize() {
      try {
        determineColumns();
        applySearchFilter();
        applySorting();
        applyPagination();
        renderTable();
      } catch (error) {
        console.error('Error initializing DataTable:', error);
        if (ErrorHandler) {
          ErrorHandler.reportError({
            message: 'Failed to initialize DataTable',
            error,
            component: 'DataTable'
          });
        }
        
        // Show error message in container
        containerElement.innerHTML = `
          <div style="color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 4px; margin: 10px 0;">
            <strong>Error:</strong> Failed to initialize data table. See console for details.
          </div>
        `;
      }
    }
    
    // Public API
    const api = {
      // Refresh the table with new data
      refresh: function(newData) {
        state.data = config.standardizeData && DataStandardizer ? 
          DataStandardizer.standardize(newData) : [...newData];
        state.currentPage = 0;
        
        determineColumns();
        applySearchFilter();
        applySorting();
        applyPagination();
        renderTable();
        
        return api;
      },
      
      // Update config options
      setOptions: function(newOptions) {
        Object.assign(config, newOptions);
        renderTable();
        return api;
      },
      
      // Get current state
      getState: function() {
        return { ...state };
      },
      
      // Set search term
      search: function(term) {
        state.searchTerm = term;
        state.currentPage = 0;
        
        if (state.searchElement) {
          state.searchElement.value = term;
        }
        
        applySearchFilter();
        applySorting();
        applyPagination();
        renderTable();
        
        return api;
      },
      
      // Set sort column and direction
      sort: function(column, direction = 'asc') {
        state.sortColumn = column;
        state.sortDirection = direction;
        
        applySorting();
        applyPagination();
        renderTable();
        
        return api;
      },
      
      // Set page
      goToPage: function(page) {
        const totalPages = state.pageSize === 'All' ? 
          1 : Math.ceil(state.filteredData.length / state.pageSize);
        
        state.currentPage = Math.max(0, Math.min(page, totalPages - 1));
        applyPagination();
        renderTable();
        
        return api;
      },
      
      // Get current data
      getData: function() {
        return {
          all: state.data,
          filtered: state.filteredData,
          visible: state.visibleData
        };
      },
      
      // Export current data
      export: function(format = 'csv') {
        if (format.toLowerCase() === 'csv') {
          exportToCSV();
        }
        // Other formats could be added here
        
        return api;
      },
      
      // Destroy the table
      destroy: function() {
        containerElement.innerHTML = '';
      }
    };
    
    // Initialize the table
    initialize();
    
    return api;
  }
  
  // Return the public API
  return {
    create
  };
})();

/**
 * FireEMS SearchFilter Component
 * A standardized search and filter component for data filtering
 */
FireEMS.Components.SearchFilter = (function() {
  // Dependencies
  const DataStandardizer = window.FireEMS.Utils.DataStandardizer;
  
  // Default styling
  const DEFAULT_STYLES = {
    container: 'margin: 15px 0;',
    searchContainer: 'display: flex; margin-bottom: 10px;',
    searchInput: 'flex-grow: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; max-width: 300px;',
    filterContainer: 'margin-top: 10px;',
    filterGroup: 'margin-bottom: 10px;',
    filterLabel: 'display: block; margin-bottom: 5px; font-weight: bold;',
    filterSelect: 'padding: 6px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;',
    button: 'background-color: #4CAF50; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; margin-left: 10px;',
    clearButton: 'background-color: #f44336;'
  };
  
  /**
   * Creates a SearchFilter component
   * @param {string|Element} container - Container element or ID
   * @param {Object} options - Configuration options
   * @returns {Object} - SearchFilter API
   */
  function create(container, options = {}) {
    // Get container element
    const containerElement = typeof container === 'string' ? 
      document.getElementById(container) : container;
    
    if (!containerElement) {
      console.error('SearchFilter: Container element not found');
      return null;
    }
    
    // Merge options with defaults
    const config = {
      fields: options.fields || [], // Fields to create filters for
      onFilterChange: options.onFilterChange || null,
      showSearch: options.showSearch !== false,
      standardizedFields: options.standardizedFields !== false,
      styles: { ...DEFAULT_STYLES, ...(options.styles || {}) },
      placeholderText: options.placeholderText || 'Search...',
      searchDelay: options.searchDelay || 300, // Delay in ms
      filterTypes: options.filterTypes || {} // Custom filter types by field
    };
    
    // Internal state
    const state = {
      searchTerm: '',
      filters: {},
      searchTimeout: null,
      elements: {
        searchInput: null,
        filterInputs: {}
      }
    };
    
    // Detect filter type for a field
    function detectFilterType(field) {
      // Use configured type if available
      if (config.filterTypes[field]) {
        return config.filterTypes[field];
      }
      
      // Try to detect from field name if DataStandardizer is available
      if (DataStandardizer) {
        const fieldType = DataStandardizer.detectFieldType(field);
        
        switch (fieldType) {
          case 'date':
          case 'datetime':
            return 'date-range';
          case 'time':
            return 'time-range';
          case 'number':
          case 'coordinate':
            return 'number-range';
          default:
            return 'select';
        }
      }
      
      // Default to select
      return 'select';
    }
    
    // Trigger filter change callback
    function triggerFilterChange() {
      if (config.onFilterChange) {
        const filterState = {
          searchTerm: state.searchTerm,
          filters: { ...state.filters }
        };
        
        config.onFilterChange(filterState);
      }
    }
    
    // Handle search input change
    function handleSearchChange() {
      // Clear previous timeout
      if (state.searchTimeout) {
        clearTimeout(state.searchTimeout);
      }
      
      // Set a timeout to reduce frequency of updates during typing
      state.searchTimeout = setTimeout(() => {
        state.searchTerm = state.elements.searchInput.value;
        triggerFilterChange();
      }, config.searchDelay);
    }
    
    // Handle filter change
    function handleFilterChange(field, value) {
      state.filters[field] = value;
      triggerFilterChange();
    }
    
    // Render search box
    function renderSearchBox() {
      const searchContainer = document.createElement('div');
      searchContainer.style.cssText = config.styles.searchContainer;
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = config.placeholderText;
      searchInput.style.cssText = config.styles.searchInput;
      searchInput.value = state.searchTerm;
      
      // Add input event handler
      searchInput.addEventListener('input', handleSearchChange);
      
      // Add clear button
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear';
      clearButton.style.cssText = `${config.styles.button} ${config.styles.clearButton}`;
      clearButton.addEventListener('click', () => {
        searchInput.value = '';
        state.searchTerm = '';
        triggerFilterChange();
      });
      
      searchContainer.appendChild(searchInput);
      searchContainer.appendChild(clearButton);
      containerElement.appendChild(searchContainer);
      
      state.elements.searchInput = searchInput;
    }
    
    // Render filters
    function renderFilters() {
      // Skip if no fields provided
      if (!config.fields || config.fields.length === 0) {
        return;
      }
      
      const filterContainer = document.createElement('div');
      filterContainer.style.cssText = config.styles.filterContainer;
      
      // Create a filter for each field
      config.fields.forEach(field => {
        const filterType = detectFilterType(field);
        const fieldName = config.standardizedFields && DataStandardizer ? 
          DataStandardizer.getStandardFieldName(field) || field : field;
        
        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = fieldName;
        fieldLabel.style.cssText = config.styles.filterLabel;
        
        const filterGroup = document.createElement('div');
        filterGroup.style.cssText = config.styles.filterGroup;
        filterGroup.appendChild(fieldLabel);
        
        // Create appropriate filter input based on type
        switch (filterType) {
          case 'select':
            renderSelectFilter(filterGroup, field);
            break;
          case 'date-range':
            renderDateRangeFilter(filterGroup, field);
            break;
          case 'number-range':
            renderNumberRangeFilter(filterGroup, field);
            break;
          case 'time-range':
            renderTimeRangeFilter(filterGroup, field);
            break;
          // Add more filter types as needed
        }
        
        filterContainer.appendChild(filterGroup);
      });
      
      containerElement.appendChild(filterContainer);
    }
    
    // Render select filter
    function renderSelectFilter(container, field) {
      const select = document.createElement('select');
      select.style.cssText = config.styles.filterSelect;
      
      // Add "All" option
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = 'All';
      select.appendChild(allOption);
      
      // Add change handler
      select.addEventListener('change', () => {
        handleFilterChange(field, select.value);
      });
      
      container.appendChild(select);
      state.elements.filterInputs[field] = select;
    }
    
    // Render date range filter
    function renderDateRangeFilter(container, field) {
      const rangeContainer = document.createElement('div');
      rangeContainer.style.cssText = 'display: flex; align-items: center;';
      
      const fromLabel = document.createElement('span');
      fromLabel.textContent = 'From:';
      fromLabel.style.marginRight = '5px';
      
      const fromInput = document.createElement('input');
      fromInput.type = 'date';
      fromInput.style.cssText = 'margin-right: 10px;';
      
      const toLabel = document.createElement('span');
      toLabel.textContent = 'To:';
      toLabel.style.marginRight = '5px';
      
      const toInput = document.createElement('input');
      toInput.type = 'date';
      
      // Add change handlers
      const updateDateFilter = () => {
        handleFilterChange(field, {
          from: fromInput.value,
          to: toInput.value
        });
      };
      
      fromInput.addEventListener('change', updateDateFilter);
      toInput.addEventListener('change', updateDateFilter);
      
      rangeContainer.appendChild(fromLabel);
      rangeContainer.appendChild(fromInput);
      rangeContainer.appendChild(toLabel);
      rangeContainer.appendChild(toInput);
      
      container.appendChild(rangeContainer);
      state.elements.filterInputs[field] = {
        from: fromInput,
        to: toInput
      };
    }
    
    // Render number range filter
    function renderNumberRangeFilter(container, field) {
      const rangeContainer = document.createElement('div');
      rangeContainer.style.cssText = 'display: flex; align-items: center;';
      
      const fromLabel = document.createElement('span');
      fromLabel.textContent = 'Min:';
      fromLabel.style.marginRight = '5px';
      
      const fromInput = document.createElement('input');
      fromInput.type = 'number';
      fromInput.style.cssText = 'margin-right: 10px; width: 80px;';
      
      const toLabel = document.createElement('span');
      toLabel.textContent = 'Max:';
      toLabel.style.marginRight = '5px';
      
      const toInput = document.createElement('input');
      toInput.type = 'number';
      toInput.style.width = '80px';
      
      // Add change handlers
      const updateNumberFilter = () => {
        handleFilterChange(field, {
          min: fromInput.value !== '' ? parseFloat(fromInput.value) : null,
          max: toInput.value !== '' ? parseFloat(toInput.value) : null
        });
      };
      
      fromInput.addEventListener('change', updateNumberFilter);
      toInput.addEventListener('change', updateNumberFilter);
      
      rangeContainer.appendChild(fromLabel);
      rangeContainer.appendChild(fromInput);
      rangeContainer.appendChild(toLabel);
      rangeContainer.appendChild(toInput);
      
      container.appendChild(rangeContainer);
      state.elements.filterInputs[field] = {
        min: fromInput,
        max: toInput
      };
    }
    
    // Render time range filter
    function renderTimeRangeFilter(container, field) {
      const rangeContainer = document.createElement('div');
      rangeContainer.style.cssText = 'display: flex; align-items: center;';
      
      const fromLabel = document.createElement('span');
      fromLabel.textContent = 'From:';
      fromLabel.style.marginRight = '5px';
      
      const fromInput = document.createElement('input');
      fromInput.type = 'time';
      fromInput.style.cssText = 'margin-right: 10px;';
      
      const toLabel = document.createElement('span');
      toLabel.textContent = 'To:';
      toLabel.style.marginRight = '5px';
      
      const toInput = document.createElement('input');
      toInput.type = 'time';
      
      // Add change handlers
      const updateTimeFilter = () => {
        handleFilterChange(field, {
          from: fromInput.value,
          to: toInput.value
        });
      };
      
      fromInput.addEventListener('change', updateTimeFilter);
      toInput.addEventListener('change', updateTimeFilter);
      
      rangeContainer.appendChild(fromLabel);
      rangeContainer.appendChild(fromInput);
      rangeContainer.appendChild(toLabel);
      rangeContainer.appendChild(toInput);
      
      container.appendChild(rangeContainer);
      state.elements.filterInputs[field] = {
        from: fromInput,
        to: toInput
      };
    }
    
    // Initialize component
    function initialize() {
      // Clear container
      containerElement.innerHTML = '';
      containerElement.style.cssText = config.styles.container;
      
      // Render search box if enabled
      if (config.showSearch) {
        renderSearchBox();
      }
      
      // Render filters
      renderFilters();
    }
    
    // Public API
    const api = {
      // Get current filter state
      getState: function() {
        return {
          searchTerm: state.searchTerm,
          filters: { ...state.filters }
        };
      },
      
      // Set search term
      setSearch: function(term) {
        state.searchTerm = term;
        
        if (state.elements.searchInput) {
          state.elements.searchInput.value = term;
        }
        
        return api;
      },
      
      // Set a filter value
      setFilter: function(field, value) {
        state.filters[field] = value;
        
        // Update UI if filter input exists
        const input = state.elements.filterInputs[field];
        
        if (input) {
          if (typeof value === 'object') {
            // Handle range filters
            if (input.from && input.to) {
              if (value.from) input.from.value = value.from;
              if (value.to) input.to.value = value.to;
            } else if (input.min && input.max) {
              if (value.min !== null) input.min.value = value.min;
              if (value.max !== null) input.max.value = value.max;
            }
          } else {
            // Handle simple select filters
            input.value = value;
          }
        }
        
        return api;
      },
      
      // Reset all filters
      reset: function() {
        state.searchTerm = '';
        state.filters = {};
        
        // Reset UI
        if (state.elements.searchInput) {
          state.elements.searchInput.value = '';
        }
        
        Object.entries(state.elements.filterInputs).forEach(([field, input]) => {
          if (typeof input === 'object' && input.from && input.to) {
            input.from.value = '';
            input.to.value = '';
          } else if (typeof input === 'object' && input.min && input.max) {
            input.min.value = '';
            input.max.value = '';
          } else if (input && input.value !== undefined) {
            input.value = '';
          }
        });
        
        triggerFilterChange();
        
        return api;
      },
      
      // Update options
      setOptions: function(newOptions) {
        Object.assign(config, newOptions);
        initialize();
        return api;
      },
      
      // Update available values for a select filter
      updateSelectOptions: function(field, options) {
        const select = state.elements.filterInputs[field];
        
        if (select && select.nodeName === 'SELECT') {
          // Save current value
          const currentValue = select.value;
          
          // Clear options except "All"
          while (select.options.length > 1) {
            select.remove(1);
          }
          
          // Add new options
          options.forEach(option => {
            const optionElement = document.createElement('option');
            
            if (typeof option === 'object') {
              optionElement.value = option.value;
              optionElement.textContent = option.label;
            } else {
              optionElement.value = option;
              optionElement.textContent = option;
            }
            
            select.appendChild(optionElement);
          });
          
          // Restore value if it still exists
          if (Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
          }
        }
        
        return api;
      },
      
      // Destroy the component
      destroy: function() {
        containerElement.innerHTML = '';
      }
    };
    
    // Initialize the component
    initialize();
    
    return api;
  }
  
  // Return the public API
  return {
    create
  };
})();

/**
 * FireEMS DataExporter Component
 * A utility for exporting data in various formats
 */
FireEMS.Components.DataExporter = (function() {
  // Dependencies
  const DataStandardizer = window.FireEMS.Utils.DataStandardizer;
  
  /**
   * Export data to CSV
   * @param {Array} data - Array of data objects
   * @param {Object} options - Export options
   * @returns {string} - CSV content
   */
  function exportToCSV(data, options = {}) {
    const config = {
      columns: options.columns || null,
      columnLabels: options.columnLabels || {},
      includeHeader: options.includeHeader !== false,
      filename: options.filename || 'export.csv',
      delimiter: options.delimiter || ',',
      formatters: options.formatters || {},
      download: options.download !== false,
      standardizeData: options.standardizeData !== false
    };
    
    // Standardize data if requested
    const processedData = config.standardizeData && DataStandardizer ? 
      DataStandardizer.standardize(data) : [...data];
    
    if (processedData.length === 0) {
      throw new Error('No data to export');
    }
    
    try {
      // Determine columns to export
      const columns = config.columns || 
        Object.keys(processedData.reduce((acc, row) => {
          Object.keys(row).forEach(key => {
            acc[key] = true;
          });
          return acc;
        }, {}));
      
      // Start with header if requested
      let csv = '';
      
      if (config.includeHeader) {
        csv = columns.map(col => {
          // Use custom label if provided, otherwise use column name
          const label = config.columnLabels[col] || col;
          // Escape quotes and wrap in quotes
          return `"${String(label).replace(/"/g, '""')}"`;
        }).join(config.delimiter) + '\n';
      }
      
      // Add data rows
      processedData.forEach(item => {
        const row = columns.map(column => {
          // Get value and apply formatter if available
          let value = item[column];
          const formatter = config.formatters[column];
          
          if (formatter && typeof formatter === 'function') {
            value = formatter(value, item);
          }
          
          // Handle null/undefined
          if (value === null || value === undefined) {
            return '""';
          }
          
          // Convert to string, escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(config.delimiter);
        
        csv += row + '\n';
      });
      
      // Download file if requested
      if (config.download) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', config.filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return csv;
    } catch (error) {
      console.error('Error exporting data to CSV:', error);
      throw error;
    }
  }
  
  /**
   * Create an export button
   * @param {string|Element} container - Container element or ID
   * @param {Function} dataProvider - Function that returns data to export
   * @param {Object} options - Button options
   * @returns {Object} - Button API
   */
  function createExportButton(container, dataProvider, options = {}) {
    // Get container element
    const containerElement = typeof container === 'string' ? 
      document.getElementById(container) : container;
    
    if (!containerElement) {
      console.error('DataExporter: Container element not found');
      return null;
    }
    
    // Merge options with defaults
    const config = {
      format: options.format || 'csv',
      buttonText: options.buttonText || 'Export Data',
      filename: options.filename || 'export',
      buttonClass: options.buttonClass || '',
      buttonStyle: options.buttonStyle || 'background-color: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;',
      exportOptions: options.exportOptions || {},
      onExport: options.onExport || null,
      onError: options.onError || null
    };
    
    // Create button element
    const button = document.createElement('button');
    button.textContent = config.buttonText;
    
    if (config.buttonClass) {
      button.className = config.buttonClass;
    } else {
      button.style.cssText = config.buttonStyle;
    }
    
    // Add click handler
    button.addEventListener('click', () => {
      try {
        // Get data from provider
        const data = typeof dataProvider === 'function' ? dataProvider() : dataProvider;
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
          throw new Error('No data to export');
        }
        
        // Set filename with format extension if not already present
        let filename = config.filename;
        if (!filename.endsWith(`.${config.format}`)) {
          filename += `.${config.format}`;
        }
        
        // Export based on format
        let result;
        switch (config.format.toLowerCase()) {
          case 'csv':
            result = exportToCSV(data, {
              ...config.exportOptions,
              filename,
              download: true
            });
            break;
          // Add other formats as needed
          default:
            throw new Error(`Unsupported export format: ${config.format}`);
        }
        
        // Call onExport callback if provided
        if (config.onExport && typeof config.onExport === 'function') {
          config.onExport(result, data);
        }
      } catch (error) {
        console.error('Export error:', error);
        
        // Call onError callback if provided
        if (config.onError && typeof config.onError === 'function') {
          config.onError(error);
        } else {
          alert(`Export failed: ${error.message || 'Unknown error'}`);
        }
      }
    });
    
    // Add button to container
    containerElement.appendChild(button);
    
    // Return API
    return {
      // Update button text
      setText: function(text) {
        button.textContent = text;
      },
      
      // Enable/disable button
      setEnabled: function(enabled) {
        button.disabled = !enabled;
        if (enabled) {
          button.style.cursor = 'pointer';
          button.style.opacity = '1';
        } else {
          button.style.cursor = 'not-allowed';
          button.style.opacity = '0.6';
        }
      },
      
      // Update options
      setOptions: function(newOptions) {
        Object.assign(config, newOptions);
        button.textContent = config.buttonText;
      },
      
      // Get the button element
      getElement: function() {
        return button;
      },
      
      // Remove the button
      destroy: function() {
        containerElement.removeChild(button);
      }
    };
  }
  
  // Return the public API
  return {
    exportToCSV,
    createExportButton
  };
})();

// Register availability for feature detection
window.FireEMS.dataDisplayAvailable = true;

// Immediate invocation to register availability in FireEMS global object
(function() {
  try {
    // Set feature flags
    if (!window.FireEMS.features) window.FireEMS.features = {};
    window.FireEMS.features.dataDisplayAvailable = true;
    
    // Log successful registration for debugging
    console.log("Data Display Components registered feature availability flag");
  } catch (e) {
    console.error("Failed to register Data Display Components availability:", e);
  }
})();