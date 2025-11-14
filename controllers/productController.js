// controllers/productController.js
import prisma from "../config/prisma.js";

import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all products with pagination and filters
// @route   GET /api/products
// @access  Public
export const getProducts = catchAsync(async (req, res, next) => {
  // Get query parameters
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;
  const category = req.query.category;
  const sortBy = req.query.sortBy; // e.g., 'price', 'rating'
  const order = req.query.order || "desc"; // 'asc' or 'desc'

  // Validate pagination
  if (limit < 1 || limit > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }
  if (skip < 0) {
    throw new ValidationError("Skip cannot be negative");
  }

  // Build where clause
  const where = { isActive: true };
  if (category) {
    where.category = category.toLowerCase();
  }

  // Build orderBy clause
  const orderBy = {};
  if (sortBy) {
    orderBy[sortBy] = order;
  } else {
    orderBy.createdAt = "desc"; // Default: newest first
  }

  // Execute query
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: skip,
    }),
    prisma.product.count({ where }),
  ]);

  // Convert Decimal to number for JSON response
  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    discountPercentage: Number(p.discountPercentage),
    rating: Number(p.rating),
  }));

  res.json({
    status: "success",
    results: formattedProducts.length,
    data: {
      products: formattedProducts,
      total,
      skip,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid product ID");
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Increment views
  await prisma.product.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  // Format response
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    discountPercentage: Number(product.discountPercentage),
    rating: Number(product.rating),
  };

  res.json({
    status: "success",
    data: { product: formattedProduct },
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = catchAsync(async (req, res, next) => {
  const query = req.query.q?.trim();
  const limit = parseInt(req.query.limit) || 20;

  if (!query) {
    throw new ValidationError("Search query is required");
  }

  // PostgreSQL full-text search
  const products = await prisma.product.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: limit,
  });

  // Format response
  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    discountPercentage: Number(p.discountPercentage),
    rating: Number(p.rating),
  }));

  res.json({
    status: "success",
    results: formattedProducts.length,
    data: {
      products: formattedProducts,
      total: formattedProducts.length,
      query,
    },
  });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getAllCategories = catchAsync(async (req, res, next) => {
  // Get distinct categories
  const products = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["category"],
    select: { category: true },
  });

  const categories = products.map((p) => p.category);

  res.json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only - will add auth later)
export const createProduct = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    price,
    discountPercentage = 0,
    rating = 0,
    stock,
    brand,
    category,
    thumbnail = "",
    images = [],
  } = req.body;

  // Create product
  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      category: category.toLowerCase(), // Store lowercase for consistency
      thumbnail,
      images,
      isActive: true,
      views: 0,
    },
  });

  // Format response
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    discountPercentage: Number(product.discountPercentage),
    rating: Number(product.rating),
  };

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: { product: formattedProduct },
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
export const updateProduct = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new NotFoundError("Product");
  }

  // Build update data (only include fields that were provided)
  const updateData = {};

  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.description !== undefined)
    updateData.description = req.body.description;
  if (req.body.price !== undefined) updateData.price = req.body.price;
  if (req.body.discountPercentage !== undefined)
    updateData.discountPercentage = req.body.discountPercentage;
  if (req.body.rating !== undefined) updateData.rating = req.body.rating;
  if (req.body.stock !== undefined) updateData.stock = req.body.stock;
  if (req.body.brand !== undefined) updateData.brand = req.body.brand;
  if (req.body.category !== undefined)
    updateData.category = req.body.category.toLowerCase();
  if (req.body.thumbnail !== undefined)
    updateData.thumbnail = req.body.thumbnail;
  if (req.body.images !== undefined) updateData.images = req.body.images;
  if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

  // Update product
  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  // Format response
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    discountPercentage: Number(product.discountPercentage),
    rating: Number(product.rating),
  };

  res.json({
    status: "success",
    message: "Product updated successfully",
    data: { product: formattedProduct },
  });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Soft delete (set isActive to false)
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    status: "success",
    message: "Product deleted successfully",
    data: { productId: id },
  });
});
