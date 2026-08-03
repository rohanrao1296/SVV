import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import LeaveRequest from '../models/LeaveRequest.js';

async function checkDatabaseLeaves() {
  try {
    console.log('⏳ Connecting to MongoDB using server config...');
    await connectDB();

    console.log('🔍 Fetching all leave requests from MongoDB...');
    const allLeaves = await LeaveRequest.find().sort({ createdAt: -1 });
    console.log(`📊 Total Leave Requests in MongoDB: ${allLeaves.length}`);
    allLeaves.forEach((l, i) => {
      console.log(`  [${i + 1}] ID: ${l.leaveId}, Name: ${l.applicantName}, Reason: ${l.reason}, Status: ${l.status}, Date: ${l.appliedOn}`);
    });

    await mongoose.disconnect();
    console.log('✅ DB Check Complete.');
  } catch (err) {
    console.error('❌ Database Query Error:', err);
  }
}

checkDatabaseLeaves();
