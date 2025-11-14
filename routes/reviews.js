// routes/reviews.js
import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
} from "../controllers/reviewController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get user's own reviews
router.get("/my-reviews", authenticate, getMyReviews);

// Review CRUD
router.get("/products/:productId/reviews", getProductReviews); // Public
router.post("/products/:productId/reviews", authenticate, createReview); // Authenticated
router.put("/:id", authenticate, updateReview); // Owner or Admin
router.delete("/:id", authenticate, deleteReview); // Owner, Moderator, or Admin

export default router;
