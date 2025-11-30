const jwt = require('jsonwebtoken');

/**
 * Generates a JWT Token
 * @param {string} id - User ID
 * @param {string} role - User Role
 * @param {string} tenantId - The Hospital/Tenant ID (Crucial for isolation)
 */
const generateToken = (id, role, tenantId) => {
  return jwt.sign(
    { id, role, tenantId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = generateToken;