import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, deleteCustomer);

export default router;
