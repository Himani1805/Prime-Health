const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');
const { getTenantDB } = require('../config/tenantDb.js');

/**
 * Protect Route Middleware
 * 1. Verifies JWT Token
 * 2. Attaches User to request
 * 3. Switches context to Tenant DB
 */
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get User from Global DB (Exclude password)
      // We need the tenantId to switch database contexts
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        throw error;
      }

      // 4. MULTI-TENANCY: Switch to Tenant-Specific Database
      if (req.user.tenantId) {
        // Get or Create the connection for this specific hospital
        const tenantDB = await getTenantDB(req.user.tenantId);
        
        // Attach the connection to the request object
        // Controllers will use req.tenantDB.model(...) instead of global require(...)
        req.tenantDB = tenantDB;
      } else {
        const error = new Error('User is not associated with any hospital tenant');
        error.statusCode = 403; // Forbidden
        throw error;
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      const err = new Error('Not authorized, token failed');
      err.statusCode = 401;
      next(err);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    next(error);
  }
};

/**
 * @desc    Role-Based Access Control (RBAC)
 * @param   {...String} roles - List of allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error(
        `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route`
      );
      error.statusCode = 403; // Forbidden
      next(error);
    } else {
      next();
    }
  };
};