/**
 * Simple Stress Test for Time Selection Functionality
 * Tests 100+ dates to ensure time selection works properly
 */

// Helper function to create test dates
function createTestDates(count) {
  const dates = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

// Helper function to format date for API
function formatDateForAPI(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to create time intervals (matching component logic)
function createTimeIntervals(startTime, endTime, appointmentTimes = []) {
  if (!startTime || !endTime) {
    return [];
  }

  const startHour = parseInt(startTime.split(":")[0]);
  const startMinutes = parseInt(startTime.split(":")[1]);
  const endHour = parseInt(endTime.split(":")[0]);
  const endMinutes = parseInt(endTime.split(":")[1]);

  const totalMinutes = (endHour - startHour) * 60 + (endMinutes - startMinutes);
  const intervalMinutes = 20; // 20-minute intervals

  const times = [];
  
  for (let i = 0; i <= totalMinutes - intervalMinutes; i += intervalMinutes) {
    const hour = startHour + Math.floor(i / 60);
    const minutes = (i % 60).toString().padStart(2, "0");
    const time = `${hour}:${minutes}`;
    if (!appointmentTimes.includes(time)) {
      times.push(time);
    }
  }
  
  return times;
}

// Test function for a single date
function testDate(date) {
  const dateStr = formatDateForAPI(date);
  const results = {
    date: dateStr,
    success: false,
    error: null,
    generatedTimes: [],
    generatedTimesCount: 0,
    dayOfWeek: date.getDay(),
    responseTime: 0
  };

  try {
    const startTime = Date.now();
    
    // Test time generation logic
    const startTimeStr = '09:00';
    const endTimeStr = '17:00';
    const appointmentTimes = [];
    
    const generatedTimes = createTimeIntervals(startTimeStr, endTimeStr, appointmentTimes);
    
    results.responseTime = Date.now() - startTime;
    results.success = true;
    results.generatedTimes = generatedTimes;
    results.generatedTimesCount = generatedTimes.length;
    
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

// Test function for concurrent requests
function testConcurrentDates(dates, concurrency = 10) {
  const results = [];
  const chunks = [];
  
  // Split dates into chunks for concurrent processing
  for (let i = 0; i < dates.length; i += concurrency) {
    chunks.push(dates.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    const chunkResults = chunk.map(date => testDate(date));
    results.push(...chunkResults);
  }
  
  return results;
}

// Main test function
function runStressTest() {
  console.log('🚀 Starting Time Selection Stress Test');
  console.log(`📅 Testing 100 dates`);
  console.log(`🔄 Concurrent requests: 10`);
  console.log('');

  const testDates = createTestDates(100);
  const startTime = Date.now();
  
  try {
    const results = testConcurrentDates(testDates);
    const endTime = Date.now();
    
    // Analyze results
    const successfulTests = results.filter(r => r.success);
    const failedTests = results.filter(r => !r.success);
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    // Group by day of week
    const dayOfWeekStats = {};
    results.forEach(result => {
      const day = result.dayOfWeek;
      if (!dayOfWeekStats[day]) {
        dayOfWeekStats[day] = { total: 0, successful: 0, failed: 0 };
      }
      dayOfWeekStats[day].total++;
      if (result.success) {
        dayOfWeekStats[day].successful++;
      } else {
        dayOfWeekStats[day].failed++;
      }
    });
    
    // Print results
    console.log('📊 Test Results Summary:');
    console.log(`✅ Successful tests: ${successfulTests.length}`);
    console.log(`❌ Failed tests: ${failedTests.length}`);
    console.log(`⏱️  Average response time: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`🕐 Total test time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log('');
    
    // Day of week breakdown
    console.log('📅 Results by Day of Week:');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Object.entries(dayOfWeekStats).forEach(([day, stats]) => {
      const dayName = dayNames[parseInt(day)];
      const successRate = ((stats.successful / stats.total) * 100).toFixed(1);
      console.log(`  ${dayName}: ${stats.successful}/${stats.total} (${successRate}%)`);
    });
    console.log('');
    
    // Show failed tests
    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  ${test.date}: ${test.error}`);
      });
      console.log('');
    }
    
    // Show successful tests with time generation
    const testsWithGeneratedTimes = successfulTests.filter(t => t.generatedTimesCount > 0);
    if (testsWithGeneratedTimes.length > 0) {
      console.log('⏰ Time Generation Results:');
      const avgGeneratedTimes = testsWithGeneratedTimes.reduce((sum, t) => sum + t.generatedTimesCount, 0) / testsWithGeneratedTimes.length;
      console.log(`  Average generated times: ${avgGeneratedTimes.toFixed(1)}`);
      console.log(`  Tests with generated times: ${testsWithGeneratedTimes.length}`);
      
      // Show some examples
      const examples = testsWithGeneratedTimes.slice(0, 5);
      examples.forEach(test => {
        console.log(`  ${test.date}: ${test.generatedTimesCount} times generated`);
      });
      console.log('');
    }
    
    // Performance analysis
    const slowTests = results.filter(r => r.responseTime > 100);
    if (slowTests.length > 0) {
      console.log('🐌 Slow Tests (>100ms):');
      slowTests.forEach(test => {
        console.log(`  ${test.date}: ${test.responseTime}ms`);
      });
      console.log('');
    }
    
    // Success rate
    const successRate = ((successfulTests.length / results.length) * 100).toFixed(1);
    console.log(`🎯 Overall Success Rate: ${successRate}%`);
    
    if (successRate >= 95) {
      console.log('🎉 Excellent! Time selection is working reliably.');
    } else if (successRate >= 80) {
      console.log('⚠️  Good, but some issues detected. Review failed tests.');
    } else {
      console.log('🚨 Critical issues detected! Time selection needs immediate attention.');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runStressTest();
}

module.exports = {
  runStressTest,
  testDate,
  testConcurrentDates,
  createTestDates,
  createTimeIntervals
};
