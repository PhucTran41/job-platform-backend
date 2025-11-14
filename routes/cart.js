// routes/cart.js
import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import {
  validateCartItem,
  validateQuantityUpdate,
} from "../middleware/validators.js";
import { authenticate } from "../middleware/auth.js"; // ← ADD THIS

const router = express.Router();

// Apply authentication to ALL cart routes
router.use(authenticate); // ← ADD THIS LINE

// Cart routes (remove :userId from all routes)
router.get("/", getCart); // ← Changed from "/:userId"
router.post("/items", validateCartItem, addToCart); // ← Changed from "/:userId/items"
router.put("/items/:productId", validateQuantityUpdate, updateCartItem); // ← Changed from "/:userId/items/:productId"
router.delete("/items/:productId", removeFromCart); // ← Changed from "/:userId/items/:productId"
router.delete("/", clearCart); // ← Changed from "/:userId"

export default router; // ← MAKE SURE THIS LINE EXISTS!
