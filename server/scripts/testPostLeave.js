async function testApiPost() {
  try {
    console.log('📡 Sending POST request to http://localhost:5000/api/leaves...');
    const response = await fetch('http://localhost:5000/api/leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: 'st_test_101',
        studentName: 'Aarav Test Student',
        classId: 'c_8',
        sectionId: 's_a',
        startDate: '2026-08-10',
        endDate: '2026-08-15',
        reason: 'Testing API leave submission to MongoDB'
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Data:', data);
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

testApiPost();
