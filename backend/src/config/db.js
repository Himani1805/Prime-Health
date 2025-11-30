const mongoose = require('mongoose');

// Global connection (for the main database holding tenant info)
/**
 * Connects to the Global/Central MongoDB Instance.
 * This is where tenant metadata (Hospitals, Licenses, Admin Users) is stored.
 */
const connectGlobalDB = async () => {
  try {
    // strictQuery: true is recommended for Mongoose v7+ to prepare for v8 default changes
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer necessary in Mongoose 6+, 
      // but provided here for backward compatibility if you use an older version.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    // Formatting console output for readability
    console.log(`\n=================================================================`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name:     ${conn.connection.name}`);
    console.log(`=================================================================\n`);

  } catch (error) {
    console.error('\n*****************************************************************');
    console.error(`Error: ${error.message}`);
    console.error('*****************************************************************\n');
    
    // Exit process with failure
    process.exit(1);
  }
};

// Tenant connection cache to avoid reconnecting constantly
const tenantConnections = {};

// Function to switch DB based on Tenant ID
const getTenantDB = async (tenantId) => {
  if (tenantConnections[tenantId]) {
    return tenantConnections[tenantId];
  }

  // Schema-per-tenant approach: We create a specific DB for this tenant
  // Naming convention: hms_tenant_{tenantId}
  const dbName = `hms_tenant_${tenantId}`;
  
  const conn = await mongoose.createConnection(process.env.MONGO_URI, {
    dbName: dbName, 
  }).asPromise();

  tenantConnections[tenantId] = conn;
  console.log(`New Tenant DB Connected: ${dbName}`);
  return conn;
};

module.exports = { connectGlobalDB, getTenantDB };























