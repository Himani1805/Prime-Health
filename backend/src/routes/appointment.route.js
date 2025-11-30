const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// Base Route: /api/appointments

router.use(protect);

// POST /book
// Allowed: Admin, Receptionist, Doctor
router.post(
  '/book',
  authorize('SUPER_ADMIN','HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  bookAppointment
);

// GET /
// List appointments with filters
router.get(
  '/',
  authorize('SUPER_ADMIN','HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'),
  getAppointments
);

// PUT /:id/status
// Update status (Cancel/Complete)
router.put(
  '/:id/status',
  authorize('SUPER_ADMIN','HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  updateAppointmentStatus
);

module.exports = router;