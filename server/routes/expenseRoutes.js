import express from 'express';
import {
  createExpense,
  getExpenses,
  deleteExpense,
  clearHistory,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All expense routes require auth

router.delete('/clear', clearHistory);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .delete(deleteExpense);

export default router;
