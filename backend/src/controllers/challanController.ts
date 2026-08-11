import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/authMiddleware';

const generateChallanNumber = async () => {
  const count = await prisma.challan.count();
  return `CHL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

export const getChallans = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = status ? { status: String(status) as any } : {};

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.challan.count({ where: whereClause }),
    ]);

    res.json({
      challans,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getChallanById = async (req: Request, res: Response) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        user: { select: { name: true } },
      },
    });

    if (challan) {
      res.json(challan);
    } else {
      res.status(404);
      throw new Error('Challan not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createChallan = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, status } = req.body; // items: { productId, quantity, unitPrice }[]

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No items provided for the challan');
    }

    if (!req.user || !req.user.id) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const challanNumber = await generateChallanNumber();
    let totalQuantity = 0;

    // Validate products and check stock if confirmed
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      res.status(400);
      throw new Error('One or more products not found');
    }

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.id, p));

    const challanItemsData = items.map((item: any) => {
      const product = productMap.get(item.productId);
      totalQuantity += Number(item.quantity);

      if (status === 'CONFIRMED' && product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}`);
      }

      return {
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice || product.unitPrice),
        productSnapshot: JSON.stringify({
          name: product.name,
          sku: product.sku,
          category: product.category,
        }),
      };
    });

    // Use transaction for Confirmed status to reduce stock and log movement
    if (status === 'CONFIRMED') {
      const transactionOperations = [];
      
      const challan = await prisma.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status,
          createdBy: req.user.id,
          items: {
            create: challanItemsData,
          },
        },
        include: { items: true },
      });

      for (const item of challanItemsData) {
        transactionOperations.push(
          prisma.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          })
        );
        transactionOperations.push(
          prisma.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan ${challanNumber}`,
              createdBy: req.user.id,
            },
          })
        );
      }
      
      await prisma.$transaction(transactionOperations);
      res.status(201).json(challan);

    } else {
      // Draft mode
      const challan = await prisma.challan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status: 'DRAFT',
          createdBy: req.user.id,
          items: {
            create: challanItemsData,
          },
        },
        include: { items: true },
      });
      res.status(201).json(challan);
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const confirmDraftChallan = async (req: AuthRequest, res: Response) => {
  try {
    const challanId = req.params.id;
    if (!req.user || !req.user.id) throw new Error('Not authorized');

    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      res.status(404);
      throw new Error('Challan not found');
    }
    
    if (challan.status === 'CONFIRMED') {
      res.status(400);
      throw new Error('Challan is already confirmed');
    }

    const transactionOperations = [];
    
    for (const item of challan.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }

      transactionOperations.push(
        prisma.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        })
      );
      transactionOperations.push(
        prisma.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber}`,
            createdBy: req.user.id,
          },
        })
      );
    }

    transactionOperations.push(
      prisma.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' },
      })
    );

    await prisma.$transaction(transactionOperations);
    res.json({ message: 'Challan confirmed successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteChallan = async (req: AuthRequest, res: Response) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!challan) {
      res.status(404);
      throw new Error('Challan not found');
    }

    if (challan.status === 'CONFIRMED') {
      res.status(400);
      throw new Error('Cannot delete a confirmed challan.');
    }

    // Delete items first, then challan
    await prisma.$transaction([
      prisma.challanItem.deleteMany({ where: { challanId: challan.id } }),
      prisma.challan.delete({ where: { id: challan.id } })
    ]);

    res.json({ message: 'Challan deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
