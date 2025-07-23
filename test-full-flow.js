// Test script to verify the complete appointment flow
// This simulates the full flow from appointment creation to confirmation

console.log('🧪 Testing Complete Appointment Flow\n');

// Simulate appointment creation response
const mockAppointmentResponse = {
    message: "Appointment created successfully",
    appointment_info: {
        id: "12345",
        patient_name: "Doe, John",
        phone_number: "+1234567890",
        appointment_date: "2024-01-15",
        appointment_time: "14:30",
        consult_type_name: "Initial Consultation",
        visit_type_name: "Consulta",
        practice_type_name: null,
        health_insurance: "IAPOS",
        cancellation_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBvaW50bWVudElkIjoiMTIzNDUiLCJwYXRpZW50SWQiOiI2Nzg5MCIsInBhdGllbnRQaG9uZSI6IisxMjM0NTY3ODkwIiwiYXBwb2ludG1lbnREYXRlIjoiMjAyNC0wMS0xNSIsImFwcG9pbnRtZW50VGltZSI6IjE0OjMwIiwiaWF0IjoxNzUzMjEzNzUwLCJleHAiOjE3NTMyMTczNTB9.YfTz10oOaZKE7OfcihsIJMbIAEqbPY5RkOyZDTig_XQ"
    }
};

console.log('📝 Mock Appointment Response:');
console.log(JSON.stringify(mockAppointmentResponse, null, 2));

// Simulate redirectToConfirmation function
function redirectToConfirmation(values) {
    const params = new URLSearchParams({
        patient_name: values.patient_name,
        phone_number: values.phone_number,
        visit_type_name: values.visit_type_name,
        appointment_date: values.appointment_date,
        appointment_time: values.appointment_time,
        appointment_id: values.id || "",
    });

    if (values.consult_type_name) {
        params.append("consult_type_name", values.consult_type_name);
    }

    if (values.practice_type_name) {
        params.append("practice_type_name", values.practice_type_name);
    }

    // Add cancellation token if available
    if (values.cancellation_token) {
        params.append("cancellation_token", values.cancellation_token);
    }

    const confirmationUrl = `/confirmation?${params.toString()}`;
    console.log('\n🔗 Generated Confirmation URL:');
    console.log(confirmationUrl);
    
    return confirmationUrl;
}

// Test the flow
const appointmentInfo = mockAppointmentResponse.appointment_info;
const confirmationUrl = redirectToConfirmation(appointmentInfo);

// Parse the URL to verify all parameters
const urlParams = new URLSearchParams(confirmationUrl.split('?')[1]);
console.log('\n📋 URL Parameters:');
for (const [key, value] of urlParams.entries()) {
    console.log(`${key}: ${value}`);
}

// Check if cancellation token is present
const hasCancellationToken = urlParams.has('cancellation_token');
console.log(`\n✅ Cancellation Token Present: ${hasCancellationToken ? 'YES' : 'NO'}`);

if (hasCancellationToken) {
    console.log('🎉 The cancellation link should appear on the confirmation page!');
} else {
    console.log('❌ The cancellation link will NOT appear on the confirmation page.');
}

console.log('\n�� Test completed!'); 