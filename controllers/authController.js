import prisma from "../config/prisma.js";
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { catchAsync } from "../middleware/errorHandler.js";
import {
  ValidationError,
  UnauthorizedError,
  BadRequestError,
} from "../utils/errors.js";

// Register new user
export const register = catchAsync(async (req, res, next) => {
  const {
    email,
    password,
    username,
    role = "CANDIDATE", // Default to CANDIDATE
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

  // Validate role
  if (!["CANDIDATE", "RECRUITER"].includes(role)) {
    throw new ValidationError("Role must be CANDIDATE or RECRUITER");
  }

  // Validate required fields based on role
  if (role === "RECRUITER" && !companyName) {
    throw new ValidationError("Company name is required for recruiters");
  }
  
  // Validate fields
  if (!email || !username || !password) {
    throw new ValidationError("Email, username, and password are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Validate username
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  if (!usernameRegex.test(username)) {
    throw new ValidationError(
      "Username must be 3-50 chars, alphanumeric + underscore"
    );
  }

  // Validate password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    throw new ValidationError(passwordCheck.errors.join(". "));
  }

  // Check email exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingEmail) {
    throw new BadRequestError(
      "Registration failed. Please check your information."
    );
  }

  // Check username exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new BadRequestError("Username is already taken");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Build user data object
  const userData = {
    email: email.toLowerCase(),
    username,
    password: hashedPassword,
    role, // ← FIX: Use the actual role variable!
    fullName,
    phone,
  };

  // Add role-specific fields
  if (role === "CANDIDATE") {
    userData.skills = skills || null;
    userData.experience = experience || null;
    userData.education = education || null;
    userData.resume = resume || null;
  } else if (role === "RECRUITER") {
    userData.companyName = companyName;
    userData.companyInfo = companyInfo || null;
  }

  // Create user
  const user = await prisma.user.create({
    data: userData,
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
      createdAt: true,
    },
  });

  // Generate token immediately after registration
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    status: "success",
    message: "Registration successful!",
    data: { 
      token,
      user 
    },
  });
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    status: "success",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

// Get current user
export const getMe = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  res.json({
    status: "success",
    data: { user },
  });
});
