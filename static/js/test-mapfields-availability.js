/**
 * MapFieldsManager Availability Test
 * 
 * This script tests the MapFieldsManager availability detection mechanisms
 * to verify that emergency mode won't be accidentally triggered.
 */

// Create a test container on the page
function createTestContainer() {
  const container = document.createElement('div');
  container.id = 'mapfields-test-container';
  container.style.cssText = 'position: fixed; top: 20px; left: 20px; z-index: 10000; background: #fff; padding: 15px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; font-family: monospace; font-size: 12px;';
  
  container.innerHTML = `
    <h3>MapFieldsManager Availability Test</h3>
    <div id="test-status">Running tests...</div>
    <div id="test-results"></div>
    <div style="margin-top: 10px;">
      <button id="run-tests-btn">Run Tests</button>
      <button id="test-emergency-btn">Test Emergency Mode</button>
      <button id="close-test-btn">Close</button>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Add event listeners
  document.getElementById('run-tests-btn').addEventListener('click', runAllTests);
  document.getElementById('test-emergency-btn').addEventListener('click', testEmergencyMode);
  document.getElementById('close-test-btn').addEventListener('click', () => container.remove());
  
  return container;
}

// Run all availability tests
function runAllTests() {
  const resultsContainer = document.getElementById('test-results');
  resultsContainer.innerHTML = '';
  
  // Define test cases
  const tests = [
    { name: "Global window.checkMapFieldsManager", test: testCheckFunction },
    { name: "FireEMS.features flag", test: testFeaturesFlag },
    { name: "FireEMS.Utils.mapFieldsAvailable flag", test: testLegacyFlag },
    { name: "Direct utility availability", test: testDirectUtility },
    { name: "Check emergency mode detection", test: testEmergencyDetection }
  ];
  
  // Run each test
  let allPassed = true;
  tests.forEach(testCase => {
    const result = testCase.test();
    const status = result.pass ? '✅ PASS' : '❌ FAIL';
    const color = result.pass ? 'green' : 'red';
    
    resultsContainer.innerHTML += `
      <div style="margin: 5px 0; padding: 5px; border-bottom: 1px solid #eee;">
        <strong style="color: ${color}">${status}</strong> ${testCase.name}
        <div style="margin-left: 20px; font-size: 11px; color: #666;">${result.message}</div>
      </div>
    `;
    
    if (!result.pass) allPassed = false;
  });
  
  // Update overall status
  const statusElement = document.getElementById('test-status');
  if (allPassed) {
    statusElement.innerHTML = '✅ All tests passed! Emergency mode should not trigger.';
    statusElement.style.color = 'green';
  } else {
    statusElement.innerHTML = '⚠️ Some tests failed. Emergency mode may still trigger.';
    statusElement.style.color = 'orange';
  }
}

// Test the global check function
function testCheckFunction() {
  if (typeof window.checkMapFieldsManager !== 'function') {
    return { 
      pass: false,
      message: 'Function not found: window.checkMapFieldsManager'
    };
  }
  
  try {
    const result = window.checkMapFieldsManager();
    const isValid = result && 
                   typeof result === 'object' && 
                   typeof result.available === 'boolean';
    
    if (!isValid) {
      return {
        pass: false,
        message: `Invalid result structure: ${JSON.stringify(result)}`
      };
    }
    
    return {
      pass: result.available === true,
      message: `Check function returned: available=${result.available}, status=${result.status || 'unknown'}`
    };
  } catch (e) {
    return {
      pass: false,
      message: `Error executing check function: ${e.message}`
    };
  }
}

// Test the features flag
function testFeaturesFlag() {
  if (!window.FireEMS || !window.FireEMS.features) {
    return {
      pass: false,
      message: 'FireEMS.features object not found'
    };
  }
  
  const flag = window.FireEMS.features.mapFieldsManagerAvailable;
  return {
    pass: flag === true,
    message: `Feature flag value: ${flag}`
  };
}

// Test the legacy availability flag
function testLegacyFlag() {
  if (!window.FireEMS || !window.FireEMS.Utils) {
    return {
      pass: false,
      message: 'FireEMS.Utils object not found'
    };
  }
  
  const flag = window.FireEMS.Utils.mapFieldsAvailable;
  return {
    pass: flag === true,
    message: `Legacy flag value: ${flag}`
  };
}

// Test direct utility availability
function testDirectUtility() {
  if (!window.FireEMS || !window.FireEMS.Utils || !window.FireEMS.Utils.MapFieldsManager) {
    return {
      pass: false,
      message: 'FireEMS.Utils.MapFieldsManager not found'
    };
  }
  
  const hasFunction = typeof window.FireEMS.Utils.MapFieldsManager.applyMappings === 'function';
  return {
    pass: hasFunction,
    message: hasFunction 
      ? 'MapFieldsManager.applyMappings is available' 
      : 'MapFieldsManager exists but applyMappings function is missing'
  };
}

// Test emergency mode detection logic
function testEmergencyDetection() {
  // Try to access the emergency function if it exists
  let shouldUseEmergencyMode = true;
  let message = 'Could not test emergency detection function';
  
  // First, try to get it from global space if exposed
  if (typeof window.checkShouldUseEmergencyMode === 'function') {
    try {
      shouldUseEmergencyMode = window.checkShouldUseEmergencyMode();
      message = `Emergency detection function returned: ${shouldUseEmergencyMode}`;
    } catch (e) {
      message = `Error in global emergency detection function: ${e.message}`;
    }
  } 
  // Otherwise try to find it in emergency library
  else if (window.FireEMS && window.FireEMS.EmergencyMode) {
    const em = window.FireEMS.EmergencyMode;
    if (typeof em.checkShouldUseEmergencyMode === 'function') {
      try {
        shouldUseEmergencyMode = em.checkShouldUseEmergencyMode();
        message = `FireEMS.EmergencyMode.checkShouldUseEmergencyMode returned: ${shouldUseEmergencyMode}`;
      } catch (e) {
        message = `Error in EmergencyMode.checkShouldUseEmergencyMode: ${e.message}`;
      }
    }
  }
  // Try to recreate the logic ourselves
  else {
    const manualCheck = checkManually();
    shouldUseEmergencyMode = manualCheck.result;
    message = manualCheck.details;
  }
  
  return {
    pass: !shouldUseEmergencyMode, // We pass if emergency mode should NOT be used
    message: message
  };
}

// Manual recreation of emergency detection logic
function checkManually() {
  const checks = [];
  
  // 1. Check feature flag
  if (window.FireEMS && 
      window.FireEMS.features && 
      window.FireEMS.features.mapFieldsManagerAvailable === true) {
    checks.push('✅ FireEMS.features.mapFieldsManagerAvailable is true');
    return { result: false, details: checks.join('<br>') + '<br>➡️ Emergency mode not needed' };
  } else {
    checks.push('❌ FireEMS.features.mapFieldsManagerAvailable check failed');
  }
  
  // 2. Check global function
  if (typeof window.checkMapFieldsManager === 'function') {
    try {
      const status = window.checkMapFieldsManager();
      if (status && status.available === true) {
        checks.push('✅ checkMapFieldsManager() reports available=true');
        return { result: false, details: checks.join('<br>') + '<br>➡️ Emergency mode not needed' };
      } else {
        checks.push(`❌ checkMapFieldsManager() reports available=${status?.available}`);
      }
    } catch (e) {
      checks.push(`❌ Error in checkMapFieldsManager(): ${e.message}`);
    }
  } else {
    checks.push('❌ window.checkMapFieldsManager is not a function');
  }
  
  // 3. Check direct utility
  if (window.FireEMS && 
      window.FireEMS.Utils && 
      window.FireEMS.Utils.MapFieldsManager &&
      typeof window.FireEMS.Utils.MapFieldsManager.applyMappings === 'function') {
    checks.push('✅ Direct utility check passes');
    return { result: false, details: checks.join('<br>') + '<br>➡️ Emergency mode not needed' };
  } else {
    checks.push('❌ Direct utility check failed');
  }
  
  // 4. Check legacy flag
  if (window.FireEMS && 
      window.FireEMS.Utils && 
      window.FireEMS.Utils.mapFieldsAvailable === true) {
    checks.push('✅ Legacy flag check passes');
    return { result: false, details: checks.join('<br>') + '<br>➡️ Emergency mode not needed' };
  } else {
    checks.push('❌ Legacy flag check failed');
  }
  
  return { 
    result: true, 
    details: checks.join('<br>') + '<br>➡️ All checks failed, emergency mode IS needed' 
  };
}

// Test the emergency mode by creating mock data
function testEmergencyMode() {
  // Create some sample test data
  const testData = Array.from({ length: 10 }, (_, i) => ({
    incident_id: `TEST-${i+1000}`,
    incident_date: '2023-12-25',
    incident_time: '08:30:00',
    latitude: 40.7128 + (Math.random() * 0.1 - 0.05),
    longitude: -74.0060 + (Math.random() * 0.1 - 0.05),
    incident_type: ['FIRE', 'EMS', 'RESCUE'][i % 3],
    address: `${1000 + i} Main St, New York, NY`
  }));
  
  // Store in localStorage for emergency mode to find
  const dataId = `emergency_data_test_${Date.now()}`;
  localStorage.setItem(dataId, JSON.stringify(testData));
  
  // Create URL with emergency parameter
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('emergency_data', dataId);
  currentUrl.searchParams.set('test', 'true');
  
  // Show confirmation dialog
  const confirmation = confirm(
    `This will open a new tab with emergency mode test:\n${currentUrl.toString()}\n\nContinue?`
  );
  
  if (confirmation) {
    window.open(currentUrl.toString(), '_blank');
  }
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Create the test container
  const container = createTestContainer();
  
  // Automatically run tests
  setTimeout(runAllTests, 500);
});