const mongoose = require('mongoose');

// Cache to store active tenant connections
const tenantConnections = {};

/**
 * Gets or Creates a Database Connection for a specific Tenant
 * @param {string} tenantId - The UUID of the tenant
 * @returns {Promise<mongoose.Connection>}
 */
const getTenantDB = async (tenantId) => {
  // 1. Check if connection already exists in cache
  if (tenantConnections[tenantId]) {
    const conn = tenantConnections[tenantId];
    if (conn.readyState === 1) {
      return conn;
    }
  }

  // 2. Create a new connection if none exists
  // FIX: Shortened DB name to satisfy Windows 38-byte limit
  // Old: hms_tenant_<uuid> (47 chars) -> New: t_<uuid_no_dashes> (34 chars)
  const safeId = tenantId.replace(/-/g, '');
  const dbName = `t_${safeId}`;
  
  // Use the same URI but switch the DB name
  const dbUrl = process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);

  try {
    const conn = await mongoose.createConnection(dbUrl).asPromise();
    
    // 3. Cache the connection
    tenantConnections[tenantId] = conn;
    
    console.log(`[Multi-Tenancy] Connected to Tenant DB: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`[Multi-Tenancy] Error connecting to ${dbName}:`, error);
    throw error;
  }
};

module.exports = { getTenantDB };