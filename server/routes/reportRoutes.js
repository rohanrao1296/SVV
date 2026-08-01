import express from 'express';
import { getReportsSummary } from '../controllers/reportController.js';

const router = express.Router();

router.get('/summary', getReportsSummary);

export default router;
