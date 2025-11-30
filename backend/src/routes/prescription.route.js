const express = require('express');
const prescriptionRouter = express.Router();
const { createPrescription, getPrescriptions, downloadPrescription } = require('../controllers/prescription.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// Base Route: /api/prescriptions

// Protect all routes
prescriptionRouter.use(protect);

// GET / - Get All Prescriptions
// Allowed for Doctors, Nurses, Receptionists, and Admins
prescriptionRouter.get(
  '/', 
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'NURSE', 'RECEPTIONIST'), 
  getPrescriptions
);

// POST / - Create Prescription
// Only Doctors (and Admins for management) can write prescriptions
prescriptionRouter.post(
  '/', 
  authorize('DOCTOR', 'HOSPITAL_ADMIN'), 
  createPrescription
);

// GET /:id/download - Download PDF (New Route)
// Allowed for Doctors, Nurses, and Admins
prescriptionRouter.get(
  '/:id/download',
  authorize('DOCTOR', 'HOSPITAL_ADMIN', 'NURSE'),
  downloadPrescription
);

module.exports = prescriptionRouter;