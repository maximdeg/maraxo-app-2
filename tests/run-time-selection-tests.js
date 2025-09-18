#!/usr/bin/env node

/**
 * Test Runner for Time Selection Tests
 * Executes all time selection related tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  // Vitest tests
  vitestTests: [
    'tests/time-selection-logic.test.ts'
  ],
  
  // Node.js stress test
  stressTest: 'tests/time-selection-stress-simple.js',
  
  // Test output directory
  outputDir: 'test-results',
  
  // Test timeout (in milliseconds)
  timeout: 300000 // 5 minutes
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to run command and capture output
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: options.timeout || TEST_CONFIG.timeout,
      ...options 
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr || '' 
    };
  }
}

// Helper function to create output directory
function createOutputDir() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
  }
}

// Helper function to save test results
function saveTestResults(testName, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}-${timestamp}.json`;
  const filepath = path.join(TEST_CONFIG.outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  log(`Test results saved to: ${filepath}`, 'cyan');
}

// Run Vitest tests
async function runVitestTests() {
  log('🧪 Running Vitest Tests...', 'blue');
  
  const results = {
    testSuite: 'vitest',
    startTime: new Date().toISOString(),
    tests: []
  };
  
  for (const testFile of TEST_CONFIG.vitestTests) {
    if (!fs.existsSync(testFile)) {
      log(`⚠️  Test file not found: ${testFile}`, 'yellow');
      continue;
    }
    
    log(`  Running ${testFile}...`, 'cyan');
    
    const command = `npx vitest run ${testFile} --reporter=json`;
    const result = runCommand(command);
    
    const testResult = {
      file: testFile,
      success: result.success,
      output: result.output,
      error: result.error
    };
    
    results.tests.push(testResult);
    
    if (result.success) {
      log(`    ✅ ${testFile} passed`, 'green');
    } else {
      log(`    ❌ ${testFile} failed`, 'red');
      log(`    Error: ${result.error}`, 'red');
    }
  }
  
  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);
  
  saveTestResults('vitest-results', results);
  return results;
}

// Run stress test
async function runStressTest() {
  log('🚀 Running Stress Test...', 'blue');
  
  const results = {
    testSuite: 'stress',
    startTime: new Date().toISOString(),
    success: false,
    output: '',
    error: ''
  };
  
  if (!fs.existsSync(TEST_CONFIG.stressTest)) {
    log(`⚠️  Stress test file not found: ${TEST_CONFIG.stressTest}`, 'yellow');
    return results;
  }
  
  const command = `node ${TEST_CONFIG.stressTest}`;
  const result = runCommand(command);
  
  results.success = result.success;
  results.output = result.output;
  results.error = result.error;
  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);
  
  if (result.success) {
    log('✅ Stress test completed successfully', 'green');
  } else {
    log('❌ Stress test failed', 'red');
    log(`Error: ${result.error}`, 'red');
  }
  
  saveTestResults('stress-test-results', results);
  return results;
}

// Generate test report
function generateReport(vitestResults, stressResults) {
  log('\n📊 Test Report', 'bright');
  log('='.repeat(50), 'blue');
  
  // Vitest results
  log('\n🧪 Vitest Tests:', 'blue');
  const vitestPassed = vitestResults.tests.filter(t => t.success).length;
  const vitestTotal = vitestResults.tests.length;
  log(`  Passed: ${vitestPassed}/${vitestTotal}`, vitestPassed === vitestTotal ? 'green' : 'yellow');
  
  vitestResults.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    const color = test.success ? 'green' : 'red';
    log(`  ${status} ${test.file}`, color);
  });
  
  // Stress test results
  log('\n🚀 Stress Test:', 'blue');
  const stressStatus = stressResults.success ? '✅' : '❌';
  const stressColor = stressResults.success ? 'green' : 'red';
  log(`  ${stressStatus} Stress test`, stressColor);
  
  if (stressResults.success) {
    // Parse stress test output for summary
    const output = stressResults.output;
    if (output.includes('Overall Success Rate:')) {
      const successRateMatch = output.match(/Overall Success Rate: (\d+\.?\d*)%/);
      if (successRateMatch) {
        const successRate = parseFloat(successRateMatch[1]);
        const rateColor = successRate >= 95 ? 'green' : successRate >= 80 ? 'yellow' : 'red';
        log(`  Success Rate: ${successRate}%`, rateColor);
      }
    }
  }
  
  // Overall summary
  log('\n📈 Overall Summary:', 'bright');
  const allTestsPassed = vitestPassed === vitestTotal && stressResults.success;
  const summaryColor = allTestsPassed ? 'green' : 'yellow';
  log(`  Status: ${allTestsPassed ? 'All tests passed!' : 'Some tests failed'}`, summaryColor);
  
  if (!allTestsPassed) {
    log('\n🔍 Issues to investigate:', 'yellow');
    vitestResults.tests.forEach(test => {
      if (!test.success) {
        log(`  - ${test.file}: ${test.error}`, 'red');
      }
    });
    if (!stressResults.success) {
      log(`  - Stress test: ${stressResults.error}`, 'red');
    }
  }
  
  log('\n' + '='.repeat(50), 'blue');
}

// Main function
async function main() {
  log('🎯 Time Selection Test Suite', 'bright');
  log('='.repeat(50), 'blue');
  
  // Create output directory
  createOutputDir();
  
  // Run tests
  const vitestResults = await runVitestTests();
  const stressResults = await runStressTest();
  
  // Generate report
  generateReport(vitestResults, stressResults);
  
  // Exit with appropriate code
  const allTestsPassed = vitestResults.tests.every(t => t.success) && stressResults.success;
  process.exit(allTestsPassed ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`💥 Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(error => {
    log(`💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runVitestTests,
  runStressTest,
  generateReport
};
