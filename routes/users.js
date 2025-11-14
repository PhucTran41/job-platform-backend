// routes/users.js
import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Profile routes (any authenticated user)
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);

// All routes require admin authentication
router.use(authenticate);
router.use(authorize("ADMIN"));

// User management routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/role", updateUserRole);
router.put("/:id/deactivate", deactivateUser);
router.put("/:id/activate", activateUser);
router.delete("/:id", deleteUser);

export default router;
