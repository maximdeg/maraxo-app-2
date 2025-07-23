// Simple test script for cancellation token system
// Run with: node test-cancellation.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

function generateCancellationToken(appointmentData) {
    const payload = {
        ...appointmentData,
    };

    // Calculate expiration time: 12 hours before appointment
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}:00`);
    const expirationTime = new Date(appointmentDateTime.getTime() - (12 * 60 * 60 * 1000)); // 12 hours before
    const now = new Date();
    
    // If the expiration time is in the past, set it to 1 hour from now
    const finalExpirationTime = expirationTime > now ? expirationTime : new Date(now.getTime() + (60 * 60 * 1000));
    
    const expiresIn = Math.floor((finalExpirationTime.getTime() - now.getTime()) / 1000);

    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyCancellationToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

// Test the system
console.log('🧪 Testing Cancellation Token System\n');

// Test data
const testAppointment = {
    appointmentId: '12345',
    patientId: '67890',
    patientPhone: '+1234567890',
    appointmentDate: '2024-01-15',
    appointmentTime: '14:30'
};

console.log('📝 Test Appointment Data:');
console.log(JSON.stringify(testAppointment, null, 2));

// Generate token
console.log('\n🔐 Generating cancellation token...');
const token = generateCancellationToken(testAppointment);
console.log('Token:', token);

// Verify token
console.log('\n✅ Verifying token...');
const decoded = verifyCancellationToken(token);
if (decoded) {
    console.log('Token is valid!');
    console.log('Decoded data:', JSON.stringify(decoded, null, 2));
} else {
    console.log('Token verification failed!');
}

// Test cancellation timing logic
console.log('\n⏰ Testing cancellation timing logic...');
const futureAppointment = {
    appointmentId: '12345',
    patientId: '67890',
    patientPhone: '+1234567890',
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    appointmentTime: '14:30'
};

const futureToken = generateCancellationToken(futureAppointment);
console.log('Future appointment token generated successfully');

const pastAppointment = {
    appointmentId: '12345',
    patientId: '67890',
    patientPhone: '+1234567890',
    appointmentDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 hours ago
    appointmentTime: '14:30'
};

const pastToken = generateCancellationToken(pastAppointment);
console.log('Past appointment token generated (should expire in 1 hour)');

console.log('\n�� Test completed!'); 