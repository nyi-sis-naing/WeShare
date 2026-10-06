import express from 'express';
import {
  createSettlement,
  getSettlements,
} from '../controllers/settlementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All settlement routes require auth

router.route('/')
  .get(getSettlements)
  .post(createSettlement);

export default router;
