const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston'); // Basic logger setup
const { connectGlobalDB } = require('./src/config/db.js');
const tenantMiddleware = require('./src/middlewares/tenant.middleware.js');

// Import Routes
const authRouter = require('./src/routes/auth.route.js');
const hospitalRouter = require('./src/routes/hospital.route.js');
const userRouter = require('./src/routes/user.route.js');
const patientRouter = require('./src/routes/patient.route.js');
const prescriptionRouter = require('./src/routes/prescription.route.js');
const appointmentRouter = require('./src/routes/appointment.route.js');
const dashboardRouter = require('./src/routes/dashboard.route.js');


// Import Middleware
const errorHandler = require('./src/middlewares/error.middleware.js');


// 1. Load Environment Variables
dotenv.config();
// console.log("JWT_SECRET is:", process.env.JWT_SECRET); // Should print your secret key

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Essential Middleware
// Security headers
app.use(helmet()); 

// Cross-Origin Resource Sharing
app.use(cors({
  origin: ['https://prime-health-one.vercel.app/','http://localhost:5173'],
  credentials: true
}));


// Body Parsing
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging (using morgan for HTTP traffic) [cite: 149]
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Database Connection (Standard connection for now)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};


// Mount Routers
app.use('/api/auth', authRouter);
app.use('/api/hospitals', hospitalRouter);
// User Management Routes
app.use('/api/users', userRouter);
app.use('/api/patients', patientRouter);
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/dashboard', dashboardRouter);


// Global Error Handler (MUST be the last middleware)
app.use(errorHandler);

// 4. API Routes
// Root Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'HMS Global Platform Running...',
    database: 'Connected to MongoDB',
    endpoints: {
      health: '/api/health'
    }
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date(), 
    uptime: process.uptime() 
  });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 6. Start Server
const startServer = async () => {
  await connectGlobalDB();
  app.listen(PORT, () => {
    console.log(`HMS Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`);
  });
};
startServer();










