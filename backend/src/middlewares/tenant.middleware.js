// src/middleware/tenant.js
const { getTenantDB } = require('../config/db.js');

const tenantMiddleware = async (req, res, next) => {
  // In a real flow, this comes from the JWT payload [cite: 37]
  // For onboarding/login, we might pass it in headers temporarily
  const tenantId = req.headers['x-tenant-id'] || req.body.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID (x-tenant-id) is missing' });
  }

  try {
    // Switch context to the specific tenant's database
    const tenantDB = await getTenantDB(tenantId);
    
    // Attach the DB connection to the request object
    req.tenantDB = tenantDB;
    req.tenantId = tenantId;
    
    next();
  } catch (error) {
    console.error('Tenant Middleware Error:', error);
    res.status(500).json({ error: 'Failed to switch tenant context' });
  }
};

module.exports = tenantMiddleware;