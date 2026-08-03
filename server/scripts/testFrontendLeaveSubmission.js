async function testFrontendSubmit() {
  console.log('🚀 Simulating Student Dashboard leave application submission...');

  const frontendPayload = {
    studentId: 'st_anshika_102',
    studentName: 'Anshika (Student User)',
    classId: 'c_10',
    sectionId: 's_b',
    startDate: '2026-08-15',
    endDate: '2026-08-20',
    reason: 'Family function in hometown'
  };

  try {
    const res = await fetch('http://localhost:5000/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frontendPayload)
    });

    console.log('HTTP Status Code:', res.status);
    const json = await res.json();
    console.log('API Server Response JSON:', json);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testFrontendSubmit();
