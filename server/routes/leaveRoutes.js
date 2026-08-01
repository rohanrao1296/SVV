import express from 'express';
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus
} from '../controllers/leaveController.js';

const router = express.Router();

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest);
router.patch('/:id/status', updateLeaveStatus);

export default router;
