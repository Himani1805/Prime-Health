const express = require('express');
const dashboardRouter = express.Router();
const { getDashboardStats, getChartData } = require('../controllers/dashboard.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');


// Base: /api/dashboard

// Protect all routes
dashboardRouter.use(protect);

// GET /stats
dashboardRouter.get('/stats', protect, authorize('HOSPITAL_ADMIN', 'DOCTOR', 'SUPER_ADMIN'), getDashboardStats);

// GET /chart
dashboardRouter.get('/chart', protect, authorize('HOSPITAL_ADMIN', 'DOCTOR', 'SUPER_ADMIN'), getChartData);

module.exports = dashboardRouter;