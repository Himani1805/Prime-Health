const express = require('express');
const dashboardRouter = express.Router();
const { getDashboardStats, getChartData } = require('../controllers/dashboard.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Base: /api/dashboard

// Protect all routes
dashboardRouter.use(protect);

// GET /stats
dashboardRouter.get('/stats', getDashboardStats);

// GET /chart
dashboardRouter.get('/chart', getChartData);

module.exports = dashboardRouter;