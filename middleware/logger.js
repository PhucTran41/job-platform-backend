// middleware/logger.js

// Color codes for terminal
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Get color based on status code
const getStatusColor = (status) => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
};

// Main logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = getStatusColor(res.statusCode);

    console.log(
      `${colors.gray}[${new Date().toLocaleTimeString()}]${colors.reset} ` +
        `${req.method} ${req.originalUrl} ` +
        `${statusColor}${res.statusCode}${colors.reset} ` +
        `${colors.gray}${duration}ms${colors.reset}`
    );
  });

  next();
};

// Detailed logger for debugging (optional)
export const detailedLogger = (req, res, next) => {
  console.log("\n📨 Incoming Request:");
  console.log("  Method:", req.method);
  console.log("  URL:", req.originalUrl);
  console.log("  Headers:", req.headers);
  console.log("  Query:", req.query);
  console.log("  Body:", req.body);
  console.log("  IP:", req.ip);
  next();
};
