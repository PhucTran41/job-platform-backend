// middleware/authorize.js
import { ForbiddenError } from "../utils/errors.js";

/**
 * Authorization middleware - checks if user has required role
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'MODERATOR')
 *
 * @param {...string} roles - Allowed roles (e.g., 'ADMIN', 'MODERATOR')
 * @returns {Function} Express middleware
 */
export function authorize(...roles) {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You do not have permission to perform this action",
        requiredRole: roles.length === 1 ? roles[0] : roles,
        yourRole: req.user.role,
      });
    }

    // User has required role, proceed
    next();
  };
}

/**
 * Check if user owns the resource
 * Usage: checkOwnership((req) => req.params.userId === req.user.userId)
 *
 * @param {Function} ownershipCheck - Function that returns true if user owns resource
 * @returns {Function} Express middleware
 */
export function checkOwnership(ownershipCheck) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check ownership
    if (!ownershipCheck(req)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You can only access your own resources",
      });
    }

    next();
  };
}

/**
 * Authorize admin or resource owner
 * Useful for operations where admin can manage all, but users can manage their own
 *
 * @param {Function} ownershipCheck - Function to check if user owns resource
 * @returns {Function} Express middleware
 */
export function authorizeAdminOrOwner(ownershipCheck) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Admin can do anything
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Check if user owns the resource
    if (ownershipCheck(req)) {
      return next();
    }

    // Neither admin nor owner
    return res.status(403).json({
      status: "error",
      message: "Forbidden: You can only manage your own resources",
    });
  };
}

