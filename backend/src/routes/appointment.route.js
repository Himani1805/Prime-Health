const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// Base Route: /api/appointments

router.use(protect);

// POST /book
// Allowed: Admin, Receptionist, Doctor
router.post(
  '/book',
  authorize('HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  bookAppointment
);

// GET /
// List appointments with filters
router.get(
  '/',
  authorize('HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'),
  getAppointments
);

module.exports = router;