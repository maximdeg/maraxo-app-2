const { execSync } = require('child_process');

console.log('🧪 Testing Time Selection Functionality...\n');

// Test 1: Check if the development server is running
console.log('1. Checking if development server is running...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  if (response.trim() === '200') {
    console.log('✅ Development server is running');
  } else {
    console.log('❌ Development server is not responding properly');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Development server is not running. Please start it with: npm run dev');
  process.exit(1);
}

// Test 2: Test available times API
console.log('\n2. Testing available times API...');
try {
  const response = execSync('curl -s http://localhost:3000/api/available-times/2024-12-25', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  const data = JSON.parse(response);
  if (data.availableSlots && data.availableSlots.start_time) {
    console.log('✅ Available times API is working');
    console.log(`   Available slot: ${data.availableSlots.start_time} - ${data.availableSlots.end_time}`);
  } else {
    console.log('❌ Available times API returned invalid data');
  }
} catch (error) {
  console.log('❌ Available times API failed:', error.message);
}

// Test 3: Test appointment creation API
console.log('\n3. Testing appointment creation API...');
try {
  const testAppointment = {
    first_name: 'Test',
    last_name: 'User',
    phone_number: '+1234567890',
    visit_type_id: 1,
    consult_type_id: 1,
    appointment_date: '2024-12-25',
    appointment_time: '10:00'
  };

  const response = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify(testAppointment)}' http://localhost:3000/api/appointments/create`, { 
    encoding: 'utf8',
    timeout: 10000 
  });
  
  const data = JSON.parse(response);
  if (data.success && data.appointment_info) {
    console.log('✅ Appointment creation API is working');
    console.log(`   Created appointment ID: ${data.appointment_info.id}`);
  } else {
    console.log('❌ Appointment creation API failed:', data.error || 'Unknown error');
  }
} catch (error) {
  console.log('❌ Appointment creation API failed:', error.message);
}

// Test 4: Test test page
console.log('\n4. Testing time selection test page...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/test-time-selection', { 
    encoding: 'utf8',
    timeout: 5000 
  });
  if (response.trim() === '200') {
    console.log('✅ Time selection test page is accessible');
  } else {
    console.log('❌ Time selection test page is not accessible');
  }
} catch (error) {
  console.log('❌ Time selection test page failed:', error.message);
}

console.log('\n🎉 Time selection functionality test completed!');
console.log('\n📋 Manual Testing Instructions:');
console.log('1. Open http://localhost:3000/agendar-visita in your browser');
console.log('2. Select a date from the calendar');
console.log('3. Verify that time slots appear in the dropdown');
console.log('4. Select a time slot');
console.log('5. Fill in the form and submit');
console.log('6. Verify that the appointment is created successfully');
console.log('\n🔧 If you encounter any issues:');
console.log('- Check the browser console for errors');
console.log('- Check the terminal for server errors');
console.log('- Try the test page at http://localhost:3000/test-time-selection');
