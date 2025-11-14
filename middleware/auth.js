import { verifyToken } from "../utils/jwt.js";
import prisma from "../config/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";

export async function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("No authorization token provided");
    }

    // Check format: "Bearer <token>"
    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Invalid authorization format. Use: Bearer <token>"
      );
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      throw new UnauthorizedError(error.message);
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
