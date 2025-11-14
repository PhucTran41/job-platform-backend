// controllers/cartController.js
import prisma from "../config/prisma.js";

import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get user's cart with products
// @route   GET /api/cart/:userId
// @access  Public (should be protected)
export const getCart = catchAsync(async (req, res, next) => {
  // Get userId from authenticated user
  const userId = req.user.userId; // ← From token, not URL!

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              thumbnail: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    // Create new cart
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                thumbnail: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  // Calculate totals
  const enrichedItems = cart.items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
    subtotal: Number(item.product.price) * item.quantity,
  }));

  const totalItems = enrichedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = enrichedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.json({
    status: "success",
    data: {
      cart: {
        ...cart,
        items: enrichedItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/:userId/items
// @access  Public (should be protected)
export const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.userId; // ← From token!
  const { productId, quantity = 1 } = req.body;

  // Validate
  if (isNaN(userId) || userId < 1) {
    throw new ValidationError("Invalid user ID");
  }

  // Check product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.isActive) {
    throw new BadRequestError("Product is not available");
  }

  if (product.stock < 1) {
    throw new BadRequestError("Product is out of stock");
  }

  if (product.stock < quantity) {
    throw new BadRequestError(`Only ${product.stock} items available`);
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  }

  // Check if item already in cart
  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestError(
        `Cannot add ${quantity} more. Only ${
          product.stock - existingItem.quantity
        } available`
      );
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  // Fetch updated cart with products
  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              thumbnail: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  // Calculate totals
  const enrichedItems = updatedCart.items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
    subtotal: Number(item.product.price) * item.quantity,
  }));

  const totalItems = enrichedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = enrichedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.status(201).json({
    status: "success",
    message: "Item added to cart",
    data: {
      cart: {
        ...updatedCart,
        items: enrichedItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    },
  });
});

// @desc    Update item quantity
// @route   PUT /api/cart/:userId/items/:productId
// @access  Public (should be protected)
export const updateCartItem = catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  // Validate
  if (isNaN(userId) || userId < 1) {
    throw new ValidationError("Invalid user ID");
  }
  if (isNaN(productId) || productId < 1) {
    throw new ValidationError("Invalid product ID");
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  // Find cart item
  const cartItem = cart.items.find((item) => item.productId === productId);
  if (!cartItem) {
    throw new NotFoundError("Cart item");
  }

  // Check stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (quantity > product.stock) {
    throw new BadRequestError(`Only ${product.stock} items available`);
  }

  // Update or remove
  if (quantity < 1) {
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  // Fetch updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              thumbnail: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  // Calculate totals
  const enrichedItems = updatedCart.items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
    subtotal: Number(item.product.price) * item.quantity,
  }));

  const totalItems = enrichedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = enrichedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.json({
    status: "success",
    message: "Cart updated",
    data: {
      cart: {
        ...updatedCart,
        items: enrichedItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:userId/items/:productId
// @access  Public (should be protected)
export const removeFromCart = catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  // Validate
  if (isNaN(userId) || userId < 1) {
    throw new ValidationError("Invalid user ID");
  }
  if (isNaN(productId) || productId < 1) {
    throw new ValidationError("Invalid product ID");
  }

  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  // Find and delete item
  const cartItem = cart.items.find((item) => item.productId === productId);
  if (!cartItem) {
    throw new NotFoundError("Cart item");
  }

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });

  // Fetch updated cart
  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              thumbnail: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  // Calculate totals
  const enrichedItems = updatedCart.items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
    subtotal: Number(item.product.price) * item.quantity,
  }));

  const totalItems = enrichedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = enrichedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  res.json({
    status: "success",
    message: "Item removed from cart",
    data: {
      cart: {
        ...updatedCart,
        items: enrichedItems,
        totalItems,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
      },
    },
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart/:userId
// @access  Public (should be protected)
export const clearCart = catchAsync(async (req, res, next) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId) || userId < 1) {
    throw new ValidationError("Invalid user ID");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new NotFoundError("Cart");
  }

  // Delete all cart items (cascade will handle this, but explicit is clearer)
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  // Fetch empty cart
  const emptyCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  res.json({
    status: "success",
    message: "Cart cleared",
    data: {
      cart: {
        ...emptyCart,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    },
  });
});
