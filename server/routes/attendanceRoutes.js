import express from 'express';
import { getAttendance, submitAttendance, updateAttendanceRecord } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAttendance);
router.post('/submit', submitAttendance);
router.put('/:id', updateAttendanceRecord);

export default router;
