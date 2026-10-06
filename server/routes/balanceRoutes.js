import express from 'express';
import { getBalances } from '../controllers/balanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getBalances);

export default router;
