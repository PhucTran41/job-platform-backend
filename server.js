// Import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";

// Import error handler
import { errorHandler, notFound } from "./middleware/errorHandler.js"; // ← ADD notFound

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce API is running!",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      singleProduct: "/api/products/:id",
      search: "/api/products/search",
      categories: "/api/products/categories",
      cart: "/api/cart",
      auth: "/api/auth", // ← Add this for clarity
    },
  });
});

// 404 handler - MUST BE AFTER ALL ROUTES
app.use(notFound); // ← REPLACE the custom 404 handler with this

// Error handling middleware - MUST BE LAST
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
