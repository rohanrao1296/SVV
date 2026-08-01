import express from 'express';
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/classController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all classes (Public/Authenticated)
router.get('/', getClasses);

// Admin-only management endpoints
router.post('/', authMiddleware, roleMiddleware(['admin']), createClass);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateClass);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteClass);

export default router;
