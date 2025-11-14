// middleware/validators.js
import { body, param, query, validationResult } from "express-validator";
import { ValidationError } from "../utils/errors.js";

//Helper function to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    throw new ValidationError(errorMessages);
  }
  next();
};

// Product ID validation
export const validateProductId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  validate,
];

// Search query validation
export const validateSearch = [
  query("q")
    .trim()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Search query cannot be empty"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validate,
];

// Pagination validation
export const validatePagination = [
  query("lmit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("skip")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Skip cannot be negative"),
  validate,
];

//Cart item validation
export const validateCartItem = [
  body("productId")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
  validate,
];

//update quantity validation
export const validateQuantityUpdate = [
  body("quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
  validate,
];

// Product creation validation
export const validateProductCreate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage("Price must be between 0.01 and 999999"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isLength({ max: 100 })
    .withMessage("Brand must be less than 100 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category must be less than 50 characters"),

  body("thumbnail")
    .optional()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),

  validate,
];

// Product update validation (all fields optional)
export const validateProductUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage("Price must be between 0.01 and 999999"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand must be less than 100 characters"),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category must be less than 50 characters"),

  body("thumbnail")
    .optional()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  validate,
];
