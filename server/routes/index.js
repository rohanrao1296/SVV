import express from 'express';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import staffRoutes from './staffRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import settingRoutes from './settingRoutes.js';
import reportRoutes from './reportRoutes.js';

import classRoutes from './classRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SVV Backend API root endpoint',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SVV Backend API Server is healthy and running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/announcements', announcementRoutes);
router.use('/settings', settingRoutes);
router.use('/reports', reportRoutes);


export default router;
