const express = require('express');
const patientRouter = express.Router();
const { registerPatient, getPatients } = require('../controllers/patient.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// Base Route: /api/patients

// All routes here require login and tenant context
patientRouter.use(protect);

// GET /api/patients - Search & List Patients
// Allowed: Admin, Doctor, Receptionist, Nurse
patientRouter.get(
  '/', 
  authorize('SUPER_ADMIN','HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'), 
  getPatients
);

// POST /api/patients/register
// Allowed Roles: Hospital Admin, Receptionist, Doctor
patientRouter.post(
  '/register',
  authorize('SUPER_ADMIN','HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR'),
  registerPatient
);

module.exports = patientRouter;