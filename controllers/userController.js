// controllers/userController.js
import prisma from "../config/prisma.js";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { hashPassword } from "../utils/password.js";

// @desc    Get own profile (detailed view)
// @route   GET /api/users/me
// @access  Private (All authenticated users)
export const getMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      fullName: true,
      phone: true,
      // Candidate fields
      skills: true,
      experience: true,
      education: true,
      resume: true,
      // Recruiter fields
      companyName: true,
      companyInfo: true,
      // Metadata
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Counts
      _count: {
        select: {
          jobPostings: true, // For recruiters
          applications: true, // For candidates
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  res.json({
    status: "success",
    data: { user },
  });
});

// @desc    Update own profile
// @route   PUT /api/users/me
// @access  Private (All authenticated users)
export const updateMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;
  const {
    fullName,
    phone,
    // Candidate fields
    skills,
    experience,
    education,
    resume,
    // Recruiter fields
    companyName,
    companyInfo,
  } = req.body;

  // Get current user to check role
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!currentUser) {
    throw new NotFoundError("User");
  }

  // Build update data based on what was provided
  const updateData = {};

  // Common fields (all roles can update)
  if (fullName !== undefined) updateData.fullName = fullName;
  if (phone !== undefined) updateData.phone = phone;

  // Role-specific fields
  if (currentUser.role === "CANDIDATE") {
    if (skills !== undefined) updateData.skills = skills;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (resume !== undefined) updateData.resume = resume;
  } else if (currentUser.role === "RECRUITER") {
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyInfo !== undefined) updateData.companyInfo = companyInfo;
  }

  // Prevent updating to empty object
  if (Object.keys(updateData).length === 0) {
    throw new ValidationError("No valid fields provided for update");
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      fullName: true,
      phone: true,
      skills: true,
      experience: true,
      education: true,
      resume: true,
      companyName: true,
      companyInfo: true,
      updatedAt: true,
    },
  });

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: { user: updatedUser },
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;
  const role = req.query.role;
  const isActive = req.query.isActive;

  // Build where clause
  const where = {};
  if (role) {
    where.role = role.toUpperCase();
  }
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    status: "success",
    results: users.length,
    data: {
      users,
      total,
      skip,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
export const getUserById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          reviews: true,
          cart: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  res.json({
    status: "success",
    data: { user },
  });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const { role } = req.body;

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid user ID");
  }

  // Validate role
  const validRoles = ["USER", "MODERATOR", "ADMIN"];
  if (!role || !validRoles.includes(role.toUpperCase())) {
    throw new ValidationError(`Role must be one of: ${validRoles.join(", ")}`);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Prevent admin from demoting themselves
  if (id === req.user.userId && role.toUpperCase() !== "ADMIN") {
    throw new BadRequestError("You cannot change your own admin role");
  }

  // Update role
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: role.toUpperCase() },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.json({
    status: "success",
    message: "User role updated successfully",
    data: { user: updatedUser },
  });
});

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin only)
export const deactivateUser = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid user ID");
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Prevent admin from deactivating themselves
  if (id === req.user.userId) {
    throw new BadRequestError("You cannot deactivate your own account");
  }

  // Deactivate user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
    },
  });

  res.json({
    status: "success",
    message: "User deactivated successfully",
    data: { user: updatedUser },
  });
});

// @desc    Reactivate user
// @route   PUT /api/users/:id/activate
// @access  Private (Admin only)
export const activateUser = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
    },
  });

  res.json({
    status: "success",
    message: "User activated successfully",
    data: { user: updatedUser },
  });
});

// @desc    Delete user (hard delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    throw new ValidationError("Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  // Prevent admin from deleting themselves
  if (id === req.user.userId) {
    throw new BadRequestError("You cannot delete your own account");
  }

  // Delete user (cascade will delete cart, reviews, etc.)
  await prisma.user.delete({
    where: { id },
  });

  res.json({
    status: "success",
    message: "User deleted successfully",
  });
});
