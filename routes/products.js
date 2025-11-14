// routes/products.js
import express from "express";
import {
  getProducts,
  getProductById,
  searchProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js"; // ← ADD THIS
import {
  validateProductId,
  validateSearch,
  validatePagination,
  validateProductCreate,
  validateProductUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes (anyone can access)
router.get("/search", validateSearch, searchProducts);
router.get("/categories", getAllCategories);
router.get("/", validatePagination, getProducts);
router.get("/:id", validateProductId, getProductById);

// Protected routes (ADMIN only)
router.post(
  "/",
  authenticate, // Must be logged in
  authorize("ADMIN"), // Must be ADMIN
  validateProductCreate,
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateProductId,
  validateProductUpdate,
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateProductId,
  deleteProduct
);

export default router;
