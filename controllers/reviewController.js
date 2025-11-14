// controllers/reviewController.js
import prisma from "../config/prisma.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  BadRequestError,
} from "../utils/errors.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = catchAsync(async (req, res, next) => {
  const productId = parseInt(req.params.productId);

  if (isNaN(productId) || productId < 1) {
    throw new ValidationError("Invalid product ID");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  // Get reviews with user info
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  res.json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: reviews.length,
    },
  });
});

// @desc    Create review for a product
// @route   POST /api/products/:productId/reviews
// @access  Private (Authenticated users)
export const createReview = catchAsync(async (req, res, next) => {
  const productId = parseInt(req.params.productId);
  const userId = req.user.userId;
  const { rating, comment } = req.body;

  // Validate product ID
  if (isNaN(productId) || productId < 1) {
    throw new ValidationError("Invalid product ID");
  }

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    throw new ValidationError("Rating must be between 1 and 5");
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundError("Product");
  }

  if (!product.isActive) {
    throw new BadRequestError("Cannot review inactive product");
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: {
      productId,
      userId,
    },
  });

  if (existingReview) {
    throw new BadRequestError("You have already reviewed this product");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      comment: comment || null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Update product's average rating
  const allReviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: { rating: avgRating },
  });

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: { review },
  });
});

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
export const updateReview = catchAsync(async (req, res, next) => {
  const reviewId = parseInt(req.params.id);
  const userId = req.user.userId;
  const { rating, comment } = req.body;

  // Validate review ID
  if (isNaN(reviewId) || reviewId < 1) {
    throw new ValidationError("Invalid review ID");
  }

  // Find review
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError("Review");
  }

  // Check ownership (users can only update their own reviews)
  if (review.userId !== userId && req.user.role !== "ADMIN") {
    throw new ForbiddenError("You can only update your own reviews");
  }

  // Build update data
  const updateData = {};
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5");
    }
    updateData.rating = rating;
  }
  if (comment !== undefined) {
    updateData.comment = comment;
  }

  // Update review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Recalculate product rating if rating changed
  if (rating !== undefined) {
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avgRating },
    });
  }

  res.json({
    status: "success",
    message: "Review updated successfully",
    data: { review: updatedReview },
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner, Moderator, or Admin)
export const deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = parseInt(req.params.id);
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Validate review ID
  if (isNaN(reviewId) || reviewId < 1) {
    throw new ValidationError("Invalid review ID");
  }

  // Find review
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError("Review");
  }

  // Check permissions:
  // 1. Review owner can delete their own
  // 2. Moderators can delete any review
  // 3. Admins can delete any review
  const isOwner = review.userId === userId;
  const isModerator = userRole === "MODERATOR";
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isModerator && !isAdmin) {
    throw new ForbiddenError(
      "You do not have permission to delete this review"
    );
  }

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Recalculate product rating
  const remainingReviews = await prisma.review.findMany({
    where: { productId: review.productId },
    select: { rating: true },
  });

  const avgRating =
    remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) /
        remainingReviews.length
      : 0;

  await prisma.product.update({
    where: { id: review.productId },
    data: { rating: avgRating },
  });

  res.json({
    status: "success",
    message: "Review deleted successfully",
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;

  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    status: "success",
    results: reviews.length,
    data: { reviews },
  });
});
