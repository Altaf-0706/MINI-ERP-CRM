import express from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  confirmDraftChallan,
  deleteChallan,
} from '../controllers/challanController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getChallans)
  .post(protect, authorize('ADMIN', 'SALES', 'WAREHOUSE'), createChallan);

router.route('/:id')
  .get(protect, getChallanById)
  .delete(protect, authorize('ADMIN', 'SALES', 'WAREHOUSE'), deleteChallan);

router.put('/:id/confirm', protect, authorize('ADMIN', 'SALES', 'WAREHOUSE'), confirmDraftChallan);

export default router;
