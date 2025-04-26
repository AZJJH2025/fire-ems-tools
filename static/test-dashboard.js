/**
 * Test Dashboard JavaScript
 * This file contains all the logic for the test results visualization dashboard.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the dashboard
  initializeDashboard();

  // Set up event listeners
  setupEventListeners();
});

/**
 * Initializes the dashboard by loading the data and rendering the UI
 */
function initializeDashboard() {
  // Load test data from the API
  fetchDashboardData()
    .then(data => {
      // Render all dashboard components with the fetched data
      renderSummaryStats(data.summary);
      renderTestHistoryChart(data.history);
      renderTestTypeDistribution(data.typeDistribution);
      renderTestDurationChart(data.durationsByType);
      renderTestRunsTable(data.latestRuns);
      renderAlertRulesTable(data.alertRules);
    })
    .catch(error => {
      console.error('Error loading dashboard data:', error);
      displayErrorMessage('Failed to load dashboard data. Please try again later.');
    });
}

/**
 * Sets up event listeners for interactive elements
 */
function setupEventListeners() {
  // New alert rule button
  const newAlertRuleBtn = document.getElementById('new-alert-rule-btn');
  if (newAlertRuleBtn) {
    newAlertRuleBtn.addEventListener('click', openAlertRuleForm);
  }

  // Close modal buttons
  const closeButtons = document.querySelectorAll('.close-modal, .cancel-button');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModals);
  });

  // Alert rule form submission
  const newRuleForm = document.getElementById('new-rule-form');
  if (newRuleForm) {
    newRuleForm.addEventListener('submit', handleAlertRuleSubmission);
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

/**
 * Fetches dashboard data from the API
 * @returns {Promise<Object>} The dashboard data
 */
async function fetchDashboardData() {
  try {
    const response = await fetch('/api/test-dashboard/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // For development/testing, return mock data if API call fails
    return getMockDashboardData();
  }
}

/**
 * Renders the summary statistics section
 * @param {Object} summaryData - Summary data for the stats cards
 */
function renderSummaryStats(summaryData) {
  // Update total runs
  const totalRunsElement = document.querySelector('#total-runs .stat-value');
  if (totalRunsElement) {
    totalRunsElement.textContent = summaryData.totalRuns.toLocaleString();
  }
  
  // Update success rate
  const successRateElement = document.querySelector('#success-rate .stat-value');
  if (successRateElement) {
    successRateElement.textContent = `${summaryData.successRate.toFixed(1)}%`;
  }
  
  // Update test count
  const testCountElement = document.querySelector('#test-count .stat-value');
  if (testCountElement) {
    testCountElement.textContent = summaryData.totalTests.toLocaleString();
  }
  
  // Update alert count
  const alertCountElement = document.querySelector('#alert-count .stat-value');
  if (alertCountElement) {
    alertCountElement.textContent = summaryData.activeAlerts.toLocaleString();
    
    // Add visual indicator for alerts
    const alertCard = document.getElementById('alert-count');
    if (summaryData.activeAlerts > 0) {
      alertCard.style.borderLeft = '4px solid #dc3545';
    } else {
      alertCard.style.borderLeft = '4px solid #28a745';
    }
  }
}

/**
 * Renders the test history chart
 * @param {Object} historyData - Data for the test history chart
 */
function renderTestHistoryChart(historyData) {
  const ctx = document.getElementById('test-history-chart').getContext('2d');
  
  // Create the chart
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: historyData.dates,
      datasets: [
        {
          label: 'Passed Tests',
          data: historyData.passed,
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Failed Tests',
          data: historyData.failed,
          backgroundColor: 'rgba(220, 53, 69, 0.2)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Tests'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  });
}

/**
 * Renders the test type distribution chart
 * @param {Object} distributionData - Data for the test type distribution
 */
function renderTestTypeDistribution(distributionData) {
  const ctx = document.getElementById('test-type-chart').getContext('2d');
  
  // Define color scheme
  const colors = [
    'rgba(54, 162, 235, 0.8)',  // Blue
    'rgba(255, 99, 132, 0.8)',   // Red
    'rgba(255, 206, 86, 0.8)',   // Yellow
    'rgba(75, 192, 192, 0.8)',   // Green
    'rgba(153, 102, 255, 0.8)',  // Purple
    'rgba(255, 159, 64, 0.8)'    // Orange
  ];
  
  // Create the chart
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(distributionData),
      datasets: [{
        data: Object.values(distributionData),
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%'
    }
  });
}

/**
 * Renders the test duration chart
 * @param {Object} durationData - Data for the test duration chart
 */
function renderTestDurationChart(durationData) {
  const ctx = document.getElementById('test-duration-chart').getContext('2d');
  
  // Create the chart
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(durationData),
      datasets: [{
        label: 'Average Duration (seconds)',
        data: Object.values(durationData),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duration (seconds)'
          }
        }
      }
    }
  });
}

/**
 * Renders the test runs table
 * @param {Array} runsData - Array of test run data
 */
function renderTestRunsTable(runsData) {
  const tableBody = document.querySelector('#test-runs-table tbody');
  if (!tableBody) return;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // No data message
  if (!runsData || runsData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="8" style="text-align: center;">No test runs available</td>';
    tableBody.appendChild(row);
    return;
  }
  
  // Add new rows
  runsData.forEach(run => {
    const row = document.createElement('tr');
    
    // Format date
    const runDate = new Date(run.start_time);
    const formattedDate = runDate.toLocaleString();
    
    // Calculate duration
    const startTime = new Date(run.start_time);
    const endTime = new Date(run.end_time);
    const durationMs = endTime - startTime;
    const durationSeconds = Math.round(durationMs / 1000);
    
    // Format duration
    let durationText;
    if (durationSeconds < 60) {
      durationText = `${durationSeconds}s`;
    } else {
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      durationText = `${minutes}m ${seconds}s`;
    }
    
    // Calculate pass rate
    const passRate = run.total_tests > 0 
      ? ((run.passed_tests / run.total_tests) * 100).toFixed(1) 
      : '0.0';
    
    // Determine status class
    let statusClass = 'status-success';
    if (!run.success) {
      statusClass = 'status-failed';
    }
    
    // Build row content
    row.innerHTML = `
      <td>${run.id}</td>
      <td>${run.type}</td>
      <td>${formattedDate}</td>
      <td class="${statusClass}">${run.success ? 'Success' : 'Failed'}</td>
      <td>${run.passed_tests}/${run.total_tests}</td>
      <td>${passRate}%</td>
      <td>${durationText}</td>
      <td class="table-actions">
        <i class="fas fa-eye btn-view" title="View Details" data-run-id="${run.id}"></i>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to view buttons
  const viewButtons = document.querySelectorAll('#test-runs-table .btn-view');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const runId = this.getAttribute('data-run-id');
      viewTestRunDetails(runId);
    });
  });
}

/**
 * Renders the alert rules table
 * @param {Array} rulesData - Array of alert rule data
 */
function renderAlertRulesTable(rulesData) {
  const tableBody = document.querySelector('#alert-rules-table tbody');
  if (!tableBody) return;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // No data message
  if (!rulesData || rulesData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center;">No alert rules defined</td>';
    tableBody.appendChild(row);
    return;
  }
  
  // Add new rows
  rulesData.forEach(rule => {
    const row = document.createElement('tr');
    
    // Format last triggered date
    let lastTriggeredText = 'Never';
    if (rule.last_triggered) {
      const lastTriggeredDate = new Date(rule.last_triggered);
      lastTriggeredText = lastTriggeredDate.toLocaleString();
    }
    
    // Determine status class
    const statusClass = rule.active ? 'status-active' : 'status-inactive';
    
    // Build row content
    row.innerHTML = `
      <td>${rule.name}</td>
      <td>${rule.type}</td>
      <td><code>${rule.condition}</code></td>
      <td class="${statusClass}">${rule.active ? 'Active' : 'Inactive'}</td>
      <td>${lastTriggeredText}</td>
      <td class="table-actions">
        <i class="fas fa-edit btn-edit" title="Edit Rule" data-rule-id="${rule.id}"></i>
        <i class="fas fa-trash-alt btn-delete" title="Delete Rule" data-rule-id="${rule.id}"></i>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to edit and delete buttons
  const editButtons = document.querySelectorAll('#alert-rules-table .btn-edit');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const ruleId = this.getAttribute('data-rule-id');
      editAlertRule(ruleId);
    });
  });
  
  const deleteButtons = document.querySelectorAll('#alert-rules-table .btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const ruleId = this.getAttribute('data-rule-id');
      deleteAlertRule(ruleId);
    });
  });
}

/**
 * Displays error message on the dashboard
 * @param {string} message - The error message to display
 */
function displayErrorMessage(message) {
  // Create error message element if it doesn't exist
  let errorElement = document.getElementById('dashboard-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'dashboard-error';
    errorElement.className = 'error-message';
    
    // Insert after the header
    const header = document.querySelector('.tool-header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(errorElement, header.nextSibling);
    } else {
      document.querySelector('main').prepend(errorElement);
    }
  }
  
  // Update error message
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  errorElement.style.display = 'block';
  
  // Add close button
  const closeButton = document.createElement('span');
  closeButton.className = 'close-error';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', function() {
    errorElement.style.display = 'none';
  });
  
  errorElement.appendChild(closeButton);
}

/**
 * Views the details of a specific test run
 * @param {string} runId - The ID of the test run to view
 */
async function viewTestRunDetails(runId) {
  try {
    // Fetch test run details
    const response = await fetch(`/api/test-runs/${runId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const runDetails = await response.json();
    
    // Show the details section
    const detailsSection = document.getElementById('test-details-section');
    const detailsContent = document.getElementById('test-details-content');
    
    if (!detailsSection || !detailsContent) return;
    
    // Format test results
    const passedResults = runDetails.results.filter(r => r.result === 'pass');
    const failedResults = runDetails.results.filter(r => r.result === 'fail');
    const skippedResults = runDetails.results.filter(r => r.result === 'skip');
    
    // Calculate pass rate
    const passRate = runDetails.total_tests > 0 
      ? ((runDetails.passed_tests / runDetails.total_tests) * 100).toFixed(1) 
      : '0.0';
    
    // Format times
    const startTime = new Date(runDetails.start_time).toLocaleString();
    const endTime = new Date(runDetails.end_time).toLocaleString();
    
    // Calculate duration
    const startDate = new Date(runDetails.start_time);
    const endDate = new Date(runDetails.end_time);
    const durationMs = endDate - startDate;
    const durationSeconds = Math.round(durationMs / 1000);
    
    // Format duration
    let durationText;
    if (durationSeconds < 60) {
      durationText = `${durationSeconds} seconds`;
    } else {
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      durationText = `${minutes} minutes, ${seconds} seconds`;
    }
    
    // Render details content
    detailsContent.innerHTML = `
      <div class="test-details-header">
        <h3>Test Run #${runDetails.id} (${runDetails.type})</h3>
        <span class="status-${runDetails.success ? 'success' : 'failed'}">
          ${runDetails.success ? 'Success' : 'Failed'}
        </span>
      </div>
      
      <div class="test-details-stats">
        <div class="test-details-stat">
          <div class="test-details-stat-label">Start Time</div>
          <div class="test-details-stat-value">${startTime}</div>
        </div>
        <div class="test-details-stat">
          <div class="test-details-stat-label">End Time</div>
          <div class="test-details-stat-value">${endTime}</div>
        </div>
        <div class="test-details-stat">
          <div class="test-details-stat-label">Duration</div>
          <div class="test-details-stat-value">${durationText}</div>
        </div>
        <div class="test-details-stat">
          <div class="test-details-stat-label">Pass Rate</div>
          <div class="test-details-stat-value">${passRate}%</div>
        </div>
      </div>
      
      <div class="test-results-summary">
        <h4>Results Summary</h4>
        <div class="test-results-counts">
          <span class="result-count passed">${passedResults.length} Passed</span>
          <span class="result-count failed">${failedResults.length} Failed</span>
          <span class="result-count skipped">${skippedResults.length} Skipped</span>
        </div>
      </div>
    `;
    
    // Add failed tests section if there are any
    if (failedResults.length > 0) {
      const failedTestsSection = document.createElement('div');
      failedTestsSection.className = 'failed-tests-section';
      failedTestsSection.innerHTML = '<h4>Failed Tests</h4>';
      
      const failedTestsList = document.createElement('ul');
      failedTestsList.className = 'failed-tests-list';
      
      failedResults.forEach(result => {
        const listItem = document.createElement('li');
        listItem.className = 'failed-test-item';
        
        let testInfo = result.name;
        if (result.module) {
          testInfo = `${result.module} > ${testInfo}`;
        }
        
        listItem.innerHTML = `
          <div class="failed-test-name">${testInfo}</div>
          ${result.error_message ? `<div class="failed-test-error">${result.error_message}</div>` : ''}
        `;
        
        failedTestsList.appendChild(listItem);
      });
      
      failedTestsSection.appendChild(failedTestsList);
      detailsContent.appendChild(failedTestsSection);
    }
    
    // Add environment and metadata if available
    if (runDetails.environment || runDetails.metadata) {
      const metadataSection = document.createElement('div');
      metadataSection.className = 'metadata-section';
      metadataSection.innerHTML = '<h4>Additional Information</h4>';
      
      const metadataList = document.createElement('dl');
      metadataList.className = 'metadata-list';
      
      if (runDetails.environment) {
        metadataList.innerHTML += `
          <dt>Environment</dt>
          <dd>${runDetails.environment}</dd>
        `;
      }
      
      if (runDetails.branch) {
        metadataList.innerHTML += `
          <dt>Branch</dt>
          <dd>${runDetails.branch}</dd>
        `;
      }
      
      if (runDetails.commit) {
        metadataList.innerHTML += `
          <dt>Commit</dt>
          <dd>${runDetails.commit}</dd>
        `;
      }
      
      if (runDetails.metadata && Object.keys(runDetails.metadata).length > 0) {
        for (const [key, value] of Object.entries(runDetails.metadata)) {
          metadataList.innerHTML += `
            <dt>${key}</dt>
            <dd>${typeof value === 'object' ? JSON.stringify(value) : value}</dd>
          `;
        }
      }
      
      metadataSection.appendChild(metadataList);
      detailsContent.appendChild(metadataSection);
    }
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'action-button';
    closeButton.textContent = 'Close Details';
    closeButton.addEventListener('click', function() {
      detailsSection.style.display = 'none';
    });
    
    detailsContent.appendChild(document.createElement('hr'));
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'right';
    buttonContainer.appendChild(closeButton);
    detailsContent.appendChild(buttonContainer);
    
    // Show the section
    detailsSection.style.display = 'block';
    
    // Scroll to the details section
    detailsSection.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error fetching test run details:', error);
    displayErrorMessage('Failed to load test run details. Please try again later.');
    
    // For development/testing, use mock data
    if (isDevEnvironment()) {
      viewMockTestRunDetails(runId);
    }
  }
}

/**
 * Opens the alert rule form
 */
function openAlertRuleForm() {
  const modal = document.getElementById('alert-rule-form');
  if (modal) {
    // Reset form
    const form = document.getElementById('new-rule-form');
    if (form) {
      form.reset();
    }
    
    modal.style.display = 'block';
  }
}

/**
 * Closes all modal dialogs
 */
function closeModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

/**
 * Handles alert rule form submission
 * @param {Event} event - The form submission event
 */
async function handleAlertRuleSubmission(event) {
  event.preventDefault();
  
  // Get form data
  const form = event.target;
  const formData = new FormData(form);
  
  // Convert to JSON
  const ruleData = {
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    condition: formData.get('condition'),
    recipients: formData.get('recipients').split(',').map(email => email.trim()),
    active: formData.get('active') === 'on'
  };
  
  try {
    // Submit the data
    const response = await fetch('/api/alert-rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ruleData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Close the modal
    closeModals();
    
    // Reload the dashboard data
    initializeDashboard();
  } catch (error) {
    console.error('Error creating alert rule:', error);
    alert('Failed to create alert rule. Please try again later.');
    
    // For development/testing
    if (isDevEnvironment()) {
      console.log('Would have created rule:', ruleData);
      closeModals();
      initializeDashboard();
    }
  }
}

/**
 * Edits an alert rule
 * @param {string} ruleId - The ID of the rule to edit
 */
async function editAlertRule(ruleId) {
  try {
    // Fetch rule details
    const response = await fetch(`/api/alert-rules/${ruleId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const rule = await response.json();
    
    // Open form and populate fields
    const modal = document.getElementById('alert-rule-form');
    if (!modal) return;
    
    // Update form fields
    document.getElementById('rule-name').value = rule.name;
    document.getElementById('rule-description').value = rule.description || '';
    document.getElementById('rule-type').value = rule.type;
    document.getElementById('rule-condition').value = rule.condition;
    document.getElementById('rule-recipients').value = rule.recipients.join(', ');
    document.getElementById('rule-active').checked = rule.active;
    
    // Update form title and action
    modal.querySelector('h2').textContent = 'Edit Alert Rule';
    
    // Add rule ID as data attribute to the form
    const form = document.getElementById('new-rule-form');
    form.setAttribute('data-rule-id', ruleId);
    
    // Update submission handler
    form.onsubmit = handleEditRuleSubmission;
    
    // Show the modal
    modal.style.display = 'block';
  } catch (error) {
    console.error('Error fetching alert rule details:', error);
    displayErrorMessage('Failed to load alert rule details. Please try again later.');
    
    // For development/testing
    if (isDevEnvironment()) {
      editMockAlertRule(ruleId);
    }
  }
}

/**
 * Handles edit rule form submission
 * @param {Event} event - The form submission event
 */
async function handleEditRuleSubmission(event) {
  event.preventDefault();
  
  // Get form data
  const form = event.target;
  const ruleId = form.getAttribute('data-rule-id');
  const formData = new FormData(form);
  
  // Convert to JSON
  const ruleData = {
    id: ruleId,
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    condition: formData.get('condition'),
    recipients: formData.get('recipients').split(',').map(email => email.trim()),
    active: formData.get('active') === 'on'
  };
  
  try {
    // Submit the data
    const response = await fetch(`/api/alert-rules/${ruleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ruleData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Reset the form's default submission handler
    form.onsubmit = handleAlertRuleSubmission;
    
    // Close the modal
    closeModals();
    
    // Reload the dashboard data
    initializeDashboard();
  } catch (error) {
    console.error('Error updating alert rule:', error);
    alert('Failed to update alert rule. Please try again later.');
    
    // For development/testing
    if (isDevEnvironment()) {
      console.log('Would have updated rule:', ruleData);
      form.onsubmit = handleAlertRuleSubmission;
      closeModals();
      initializeDashboard();
    }
  }
}

/**
 * Deletes an alert rule
 * @param {string} ruleId - The ID of the rule to delete
 */
async function deleteAlertRule(ruleId) {
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this alert rule?')) {
    return;
  }
  
  try {
    // Submit the delete request
    const response = await fetch(`/api/alert-rules/${ruleId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Reload the dashboard data
    initializeDashboard();
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    alert('Failed to delete alert rule. Please try again later.');
    
    // For development/testing
    if (isDevEnvironment()) {
      console.log('Would have deleted rule ID:', ruleId);
      initializeDashboard();
    }
  }
}

/**
 * Checks if we're in a development environment
 * @returns {boolean} True if in development environment
 */
function isDevEnvironment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

/**
 * Returns mock dashboard data for development/testing
 * @returns {Object} Mock dashboard data
 */
function getMockDashboardData() {
  // Get today's date and previous dates for history
  const today = new Date();
  const dates = [];
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return {
    summary: {
      totalRuns: 152,
      successRate: 87.5,
      totalTests: 2840,
      activeAlerts: 3
    },
    history: {
      dates: dates,
      passed: [120, 115, 122, 128, 130, 125, 132, 135, 129, 140, 142, 138, 145, 148, 150],
      failed: [15, 18, 12, 10, 8, 12, 8, 5, 10, 8, 5, 12, 8, 10, 5]
    },
    typeDistribution: {
      'Unit': 45,
      'Integration': 30,
      'API': 15,
      'Performance': 5,
      'Contract': 3,
      'Scenario': 2
    },
    durationsByType: {
      'Unit': 12.5,
      'Integration': 45.8,
      'API': 22.3,
      'Performance': 58.9,
      'Contract': 18.7,
      'Scenario': 75.2
    },
    latestRuns: [
      {
        id: 152,
        type: 'unit',
        start_time: new Date(today - 3600000).toISOString(),
        end_time: new Date(today - 3540000).toISOString(),
        success: true,
        total_tests: 85,
        passed_tests: 85,
        failed_tests: 0,
        skipped_tests: 2
      },
      {
        id: 151,
        type: 'integration',
        start_time: new Date(today - 7200000).toISOString(),
        end_time: new Date(today - 7000000).toISOString(),
        success: true,
        total_tests: 42,
        passed_tests: 40,
        failed_tests: 2,
        skipped_tests: 0
      },
      {
        id: 150,
        type: 'performance',
        start_time: new Date(today - 10800000).toISOString(),
        end_time: new Date(today - 10700000).toISOString(),
        success: false,
        total_tests: 10,
        passed_tests: 7,
        failed_tests: 3,
        skipped_tests: 0
      },
      {
        id: 149,
        type: 'api',
        start_time: new Date(today - 14400000).toISOString(),
        end_time: new Date(today - 14300000).toISOString(),
        success: true,
        total_tests: 25,
        passed_tests: 25,
        failed_tests: 0,
        skipped_tests: 0
      },
      {
        id: 148,
        type: 'contract',
        start_time: new Date(today - 86400000).toISOString(),
        end_time: new Date(today - 86300000).toISOString(),
        success: true,
        total_tests: 8,
        passed_tests: 8,
        failed_tests: 0,
        skipped_tests: 0
      }
    ],
    alertRules: [
      {
        id: 1,
        name: 'Failed Unit Tests',
        description: 'Alert when unit tests fail',
        type: 'unit',
        condition: 'success == False',
        recipients: ['dev-team@example.com'],
        active: true,
        created_at: new Date(today - 7776000000).toISOString(), // 90 days ago
        last_triggered: new Date(today - 432000000).toISOString() // 5 days ago
      },
      {
        id: 2,
        name: 'Performance Test Degradation',
        description: 'Alert when performance tests show degradation',
        type: 'performance',
        condition: 'success == False',
        recipients: ['performance-team@example.com', 'dev-leads@example.com'],
        active: true,
        created_at: new Date(today - 2592000000).toISOString(), // 30 days ago
        last_triggered: new Date(today - 10800000).toISOString() // 3 hours ago
      },
      {
        id: 3,
        name: 'API Contract Violation',
        description: 'Alert when API contract tests fail',
        type: 'contract',
        condition: 'failed_tests > 0',
        recipients: ['api-team@example.com'],
        active: true,
        created_at: new Date(today - 1296000000).toISOString(), // 15 days ago
        last_triggered: null
      }
    ]
  };
}

/**
 * Displays mock test run details for development/testing
 * @param {string} runId - The ID of the run to display
 */
function viewMockTestRunDetails(runId) {
  // Find the run in the mock data
  const mockData = getMockDashboardData();
  const run = mockData.latestRuns.find(r => r.id == runId);
  
  if (!run) return;
  
  // Create mock results
  const results = [];
  
  // Add passed tests
  for (let i = 0; i < run.passed_tests; i++) {
    results.push({
      name: `test_passed_${i + 1}`,
      module: `tests.${run.type}.test_module_${Math.floor(i / 5) + 1}`,
      class: `Test${run.type.charAt(0).toUpperCase() + run.type.slice(1)}Class${Math.floor(i / 10) + 1}`,
      result: 'pass',
      duration: Math.random() * 0.5 + 0.1
    });
  }
  
  // Add failed tests
  for (let i = 0; i < run.failed_tests; i++) {
    results.push({
      name: `test_failed_${i + 1}`,
      module: `tests.${run.type}.test_module_${Math.floor(i / 2) + 1}`,
      class: `Test${run.type.charAt(0).toUpperCase() + run.type.slice(1)}Class${Math.floor(i / 3) + 1}`,
      result: 'fail',
      duration: Math.random() * 0.5 + 0.1,
      error_message: `AssertionError: Expected result to be True, but got False`,
      error_type: 'AssertionError'
    });
  }
  
  // Add skipped tests
  for (let i = 0; i < run.skipped_tests; i++) {
    results.push({
      name: `test_skipped_${i + 1}`,
      module: `tests.${run.type}.test_module_${Math.floor(i / 2) + 1}`,
      class: `Test${run.type.charAt(0).toUpperCase() + run.type.slice(1)}Class${Math.floor(i / 3) + 1}`,
      result: 'skip',
      duration: 0
    });
  }
  
  // Add metadata
  const mockRunDetails = {
    ...run,
    results: results,
    branch: 'main',
    commit: 'abc123def456',
    environment: 'test',
    metadata: {
      'python_version': '3.9.7',
      'os': 'Linux 5.10.0',
      'cpu_count': 4,
      'memory': '16GB'
    }
  };
  
  // Show the details section
  const detailsSection = document.getElementById('test-details-section');
  const detailsContent = document.getElementById('test-details-content');
  
  if (!detailsSection || !detailsContent) return;
  
  // Format test results
  const passedResults = mockRunDetails.results.filter(r => r.result === 'pass');
  const failedResults = mockRunDetails.results.filter(r => r.result === 'fail');
  const skippedResults = mockRunDetails.results.filter(r => r.result === 'skip');
  
  // Calculate pass rate
  const passRate = mockRunDetails.total_tests > 0 
    ? ((mockRunDetails.passed_tests / mockRunDetails.total_tests) * 100).toFixed(1) 
    : '0.0';
  
  // Format times
  const startTime = new Date(mockRunDetails.start_time).toLocaleString();
  const endTime = new Date(mockRunDetails.end_time).toLocaleString();
  
  // Calculate duration
  const startDate = new Date(mockRunDetails.start_time);
  const endDate = new Date(mockRunDetails.end_time);
  const durationMs = endDate - startDate;
  const durationSeconds = Math.round(durationMs / 1000);
  
  // Format duration
  let durationText;
  if (durationSeconds < 60) {
    durationText = `${durationSeconds} seconds`;
  } else {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    durationText = `${minutes} minutes, ${seconds} seconds`;
  }
  
  // Render details content
  detailsContent.innerHTML = `
    <div class="test-details-header">
      <h3>Test Run #${mockRunDetails.id} (${mockRunDetails.type})</h3>
      <span class="status-${mockRunDetails.success ? 'success' : 'failed'}">
        ${mockRunDetails.success ? 'Success' : 'Failed'}
      </span>
    </div>
    
    <div class="test-details-stats">
      <div class="test-details-stat">
        <div class="test-details-stat-label">Start Time</div>
        <div class="test-details-stat-value">${startTime}</div>
      </div>
      <div class="test-details-stat">
        <div class="test-details-stat-label">End Time</div>
        <div class="test-details-stat-value">${endTime}</div>
      </div>
      <div class="test-details-stat">
        <div class="test-details-stat-label">Duration</div>
        <div class="test-details-stat-value">${durationText}</div>
      </div>
      <div class="test-details-stat">
        <div class="test-details-stat-label">Pass Rate</div>
        <div class="test-details-stat-value">${passRate}%</div>
      </div>
    </div>
    
    <div class="test-results-summary">
      <h4>Results Summary</h4>
      <div class="test-results-counts">
        <span class="result-count passed">${passedResults.length} Passed</span>
        <span class="result-count failed">${failedResults.length} Failed</span>
        <span class="result-count skipped">${skippedResults.length} Skipped</span>
      </div>
    </div>
  `;
  
  // Add failed tests section if there are any
  if (failedResults.length > 0) {
    const failedTestsSection = document.createElement('div');
    failedTestsSection.className = 'failed-tests-section';
    failedTestsSection.innerHTML = '<h4>Failed Tests</h4>';
    
    const failedTestsList = document.createElement('ul');
    failedTestsList.className = 'failed-tests-list';
    
    failedResults.forEach(result => {
      const listItem = document.createElement('li');
      listItem.className = 'failed-test-item';
      
      let testInfo = result.name;
      if (result.module) {
        testInfo = `${result.module} > ${testInfo}`;
      }
      
      listItem.innerHTML = `
        <div class="failed-test-name">${testInfo}</div>
        ${result.error_message ? `<div class="failed-test-error">${result.error_message}</div>` : ''}
      `;
      
      failedTestsList.appendChild(listItem);
    });
    
    failedTestsSection.appendChild(failedTestsList);
    detailsContent.appendChild(failedTestsSection);
  }
  
  // Add environment and metadata if available
  if (mockRunDetails.environment || mockRunDetails.metadata) {
    const metadataSection = document.createElement('div');
    metadataSection.className = 'metadata-section';
    metadataSection.innerHTML = '<h4>Additional Information</h4>';
    
    const metadataList = document.createElement('dl');
    metadataList.className = 'metadata-list';
    
    if (mockRunDetails.environment) {
      metadataList.innerHTML += `
        <dt>Environment</dt>
        <dd>${mockRunDetails.environment}</dd>
      `;
    }
    
    if (mockRunDetails.branch) {
      metadataList.innerHTML += `
        <dt>Branch</dt>
        <dd>${mockRunDetails.branch}</dd>
      `;
    }
    
    if (mockRunDetails.commit) {
      metadataList.innerHTML += `
        <dt>Commit</dt>
        <dd>${mockRunDetails.commit}</dd>
      `;
    }
    
    if (mockRunDetails.metadata && Object.keys(mockRunDetails.metadata).length > 0) {
      for (const [key, value] of Object.entries(mockRunDetails.metadata)) {
        metadataList.innerHTML += `
          <dt>${key}</dt>
          <dd>${typeof value === 'object' ? JSON.stringify(value) : value}</dd>
        `;
      }
    }
    
    metadataSection.appendChild(metadataList);
    detailsContent.appendChild(metadataSection);
  }
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'action-button';
  closeButton.textContent = 'Close Details';
  closeButton.addEventListener('click', function() {
    detailsSection.style.display = 'none';
  });
  
  detailsContent.appendChild(document.createElement('hr'));
  const buttonContainer = document.createElement('div');
  buttonContainer.style.textAlign = 'right';
  buttonContainer.appendChild(closeButton);
  detailsContent.appendChild(buttonContainer);
  
  // Show the section
  detailsSection.style.display = 'block';
  
  // Scroll to the details section
  detailsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Shows edit form with mock data for a specific rule ID
 * @param {string} ruleId - The ID of the rule to edit
 */
function editMockAlertRule(ruleId) {
  // Get mock data
  const mockData = getMockDashboardData();
  const rule = mockData.alertRules.find(r => r.id == ruleId);
  
  if (!rule) return;
  
  // Open form and populate fields
  const modal = document.getElementById('alert-rule-form');
  if (!modal) return;
  
  // Update form fields
  document.getElementById('rule-name').value = rule.name;
  document.getElementById('rule-description').value = rule.description || '';
  document.getElementById('rule-type').value = rule.type;
  document.getElementById('rule-condition').value = rule.condition;
  document.getElementById('rule-recipients').value = rule.recipients.join(', ');
  document.getElementById('rule-active').checked = rule.active;
  
  // Update form title and action
  modal.querySelector('h2').textContent = 'Edit Alert Rule';
  
  // Add rule ID as data attribute to the form
  const form = document.getElementById('new-rule-form');
  form.setAttribute('data-rule-id', ruleId);
  
  // Update submission handler
  form.onsubmit = handleEditRuleSubmission;
  
  // Show the modal
  modal.style.display = 'block';
}