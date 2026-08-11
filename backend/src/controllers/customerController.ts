import { Request, Response } from 'express';
import prisma from '../config/database';
import { getQueryString } from '../utils/query';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const search = getQueryString(req, 'search');
    const page = getQueryString(req, 'page') || '1';
    const limit = getQueryString(req, 'limit') || '10';
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { mobile: { contains: search } },
            { businessName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    res.json({
      customers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
    });

    if (customer) {
      res.json(customer);
    } else {
      res.status(404);
      throw new Error('Customer not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email,
        businessName,
        gstNumber,
        customerType,
        address,
        status: status || 'LEAD',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes,
      },
    });

    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
    });

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: req.params.id as string },
      data: {
        ...req.body,
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : customer.followUpDate,
      },
    });

    res.json(updatedCustomer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id as string },
    });
    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }
    await prisma.customer.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      res.status(400).json({ message: 'Cannot delete customer because they have associated challans.' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
