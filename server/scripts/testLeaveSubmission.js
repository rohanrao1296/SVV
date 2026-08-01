import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LeaveRequest from '../models/LeaveRequest.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/svv_db';

async function testLeaveInsertion() {
  try {
    console.log('⏳ Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('🍃 MongoDB connected successfully!');

    const leaveId = `lv_test_${Date.now()}`;
    const testLeave = {
      leaveId,
      studentId: 'st_demo_101',
      applicantName: 'Aarav Kumar (Test Student)',
      classId: 'c_8',
      sectionId: 's_a',
      role: 'student',
      leaveType: 'Medical/Casual',
      startDate: '2026-08-05',
      endDate: '2026-08-07',
      reason: 'Urgent medical checkup & doctor recommended rest',
      documentUrl: '',
      status: 'Pending',
      remarks: '',
      appliedOn: new Date().toISOString().split('T')[0]
    };

    console.log('📝 Inserting test Leave Request document into MongoDB collection "leaverequests"...');
    const created = await LeaveRequest.create(testLeave);
    console.log('✅ Document successfully inserted into MongoDB:', created.leaveId);

    console.log('🔍 Fetching all leave requests from MongoDB...');
    const allLeaves = await LeaveRequest.find().sort({ createdAt: -1 });
    console.log(`📊 Total Leave Requests in MongoDB "leaverequests" collection: ${allLeaves.length}`);
    console.log('📄 Latest Document in Database:', {
      leaveId: allLeaves[0].leaveId,
      applicantName: allLeaves[0].applicantName,
      reason: allLeaves[0].reason,
      status: allLeaves[0].status,
      appliedOn: allLeaves[0].appliedOn
    });

    await mongoose.disconnect();
    console.log('🎉 Verification Test Passed! Database storage is 100% working.');
  } catch (err) {
    console.error('❌ Database Test Error:', err);
    process.exit(1);
  }
}

testLeaveInsertion();
