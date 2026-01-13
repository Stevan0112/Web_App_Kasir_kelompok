import express from 'express';
import { getTransactions, getTransactionById, createTransaction } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);

export default router;
