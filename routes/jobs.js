// routes/jobs.js
import express from "express";
import {
  getAllJobs,
  getJobById,
  searchJobs,
  getAllIndustries,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getMyJobPostings,
} from "../controllers/jobController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validateJobCreate, validateJobUpdate } from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/search", searchJobs);
router.get("/industries", getAllIndustries);
router.get("/", getAllJobs);

// Protected routes - Recruiter only
router.post(
  "/",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  validateJobCreate,  // ← Add this
  createJobPosting
);

// IMPORTANT: /my-jobs MUST come BEFORE /:id
router.get("/my-jobs", authenticate, authorize("RECRUITER"), getMyJobPostings);

// Dynamic routes (with :id) come last
router.get("/:id", getJobById);

router.put(
  "/:id",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  validateJobUpdate,  // ← Add this
  updateJobPosting
);

router.delete(
  "/:id",
  authenticate,
  authorize("RECRUITER", "ADMIN"),
  deleteJobPosting
);

export default router;
