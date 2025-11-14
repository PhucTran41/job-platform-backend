// controllers/jobController.js

import prisma from "../config/prisma.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors.js";
import { catchAsync } from "../middleware/errorHandler.js";

// @desc    Get all jobs (with pagination and filters)
// @route   GET /api/jobs
// @access  Public

export const getAllJobs = catchAsync(async (req, res, next) => {
  const { limit = 20, skip = 0, industry, jobType, location } = req.query;

  // Build where clause
  const where = { isActive: true };

  if (industry) where.industry = industry;
  if (jobType) where.jobType = jobType;
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      include: {
        recruiter: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(skip),
    }),
    prisma.jobPosting.count({ where }),
  ]);

  res.json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid job ID");
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      recruiter: {
        select: {
          id: true,
          companyName: true,
          companyInfo: true,
          email: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    throw new NotFoundError("Job posting");
  }

  // Increment views
  await prisma.jobPosting.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  res.json({
    status: "success",
    data: { job },
  });
});

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
export const searchJobs = catchAsync(async (req, res, next) => {
  const {
    q, // Search query
    location, // Job location
    industry, // Industry filter
    jobType, // Full-time, Part-time, etc.
    limit = 20,
    skip = 0,
  } = req.query;

  const where = { isActive: true };

  // Text search in title, description, requirements
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { requirements: { contains: q, mode: "insensitive" } },
    ];
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (industry) {
    where.industry = industry;
  }

  if (jobType) {
    where.jobType = jobType;
  }

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      include: {
        recruiter: {
          select: { companyName: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(skip),
    }),
    prisma.jobPosting.count({ where }),
  ]);

  res.json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all unique industries
// @route   GET /api/jobs/industries
// @access  Public
export const getAllIndustries = catchAsync(async (req, res, next) => {
  const industries = await prisma.jobPosting.findMany({
    where: { isActive: true },
    select: { industry: true },
    distinct: ["industry"],
  });

  const industryList = industries.map((item) => item.industry);

  res.json({
    status: "success",
    data: { industries: industryList },
  });
});

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter, Admin)
export const createJobPosting = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    requirements,
    salary,
    location,
    industry,
    jobType,
  } = req.body;

  const recruiterId = req.user.userId;

  // Validate required fields
  if (
    !title ||
    !description ||
    !requirements ||
    !location ||
    !industry ||
    !jobType
  ) {
    throw new ValidationError("All required fields must be provided");
  }

  // Create job posting
  const job = await prisma.jobPosting.create({
    data: {
      title,
      description,
      requirements,
      salary,
      location,
      industry,
      jobType,
      recruiterId,
      isActive: true,
      views: 0,
    },
    include: {
      recruiter: {
        select: {
          companyName: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Job posting created successfully",
    data: { job },
  });
});

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Owner or Admin)

export const updateJobPosting = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid job ID");
  }

  // Check if job exists
  const existingJob = await prisma.jobPosting.findUnique({
    where: { id },
  });

  if (!existingJob) {
    throw new NotFoundError("Job posting");
  }

  // Check authorization: must be owner or admin
  if (existingJob.recruiterId !== userId && userRole !== "ADMIN") {
    throw new ForbiddenError("You can only update your own job postings");
  }

  // Build update data
  const updateData = {};
  const allowedFields = [
    "title",
    "description",
    "requirements",
    "salary",
    "location",
    "industry",
    "jobType",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError("No valid fields provided for update");
  }

  // Update job
  const job = await prisma.jobPosting.update({
    where: { id },
    data: updateData,
    include: {
      recruiter: {
        select: {
          companyName: true,
          email: true,
        },
      },
    },
  });

  res.json({
    status: "success",
    message: "Job posting updated successfully",
    data: { job },
  });
});

// @desc    Delete job posting (soft delete)
// @route   DELETE /api/jobs/:id
// @access  Private (Owner or Admin)

export const deleteJobPosting = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid job ID");
  }

  const job = await prisma.jobPosting.findUnique({
    where: { id },
  });

  if (!job) {
    throw new NotFoundError("Job posting");
  }

  // Check authorization: must be owner or admin
  if (job.recruiterId !== userId && userRole !== "ADMIN") {
    throw new ForbiddenError("You can only delete your own job postings");
  }

  // Soft delete (set isActive to false)
  await prisma.jobPosting.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({
    status: "success",
    message: "Job posting deleted successfully",
    data: { jobId: id },
  });
});

// @desc    Get recruiter's own job postings
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter)
export const getMyJobPostings = catchAsync(async (req, res, next) => {
  const recruiterId = req.user.userId;

  const jobs = await prisma.jobPosting.findMany({
    where: { recruiterId },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    status: "success",
    results: jobs.length,
    data: { jobs },
  });
});
