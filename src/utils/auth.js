const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Store in .env for security
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; // Default to 1 hour if not specified

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN, // Token expires based on environment variable
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
