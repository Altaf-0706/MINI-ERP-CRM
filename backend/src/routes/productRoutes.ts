import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('ADMIN', 'WAREHOUSE'), createProduct);

router.get('/movements', protect, getStockMovements);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('ADMIN', 'WAREHOUSE'), updateProduct)
  .delete(protect, authorize('ADMIN', 'WAREHOUSE'), deleteProduct);

router.post('/:id/adjust-stock', protect, authorize('ADMIN', 'WAREHOUSE', 'SALES'), adjustStock);

export default router;
