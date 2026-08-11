import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = search
      ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' as const } },
            { sku: { contains: String(search), mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;

    const productExists = await prisma.product.findUnique({ where: { sku } });
    if (productExists) {
      res.status(400);
      throw new Error('Product with this SKU already exists');
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        unitPrice: Number(unitPrice),
        currentStock: Number(currentStock) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        location,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        unitPrice: req.body.unitPrice ? Number(req.body.unitPrice) : product.unitPrice,
        minStockAlert: req.body.minStockAlert ? Number(req.body.minStockAlert) : product.minStockAlert,
      },
    });

    res.json(updatedProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { quantityChanged, movementType, reason } = req.body;
    const productId = req.params.id;

    if (!req.user || !req.user.id) {
      res.status(401);
      throw new Error('User not found in request');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const qty = Number(quantityChanged);
    if (movementType === 'OUT' && product.currentStock < qty) {
      res.status(400);
      throw new Error('Insufficient stock for OUT movement');
    }

    const newStock = movementType === 'IN' ? product.currentStock + qty : product.currentStock - qty;

    const [updatedProduct, stockMovement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          quantityChanged: qty,
          movementType,
          reason,
          createdBy: req.user.id,
        },
      }),
    ]);

    res.json({ product: updatedProduct, movement: stockMovement });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { productId, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = productId ? { productId: String(productId) } : {};

    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      skip,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
    });

    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ message: 'Cannot delete product because it has associated stock movements or challan items.' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
