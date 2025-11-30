const Patient = require('../models/patient.model.js');

/**
 * @desc    Register a new Patient (Tenant Specific)
 * @route   POST /api/patients/register
 * @access  Private (Admin, Receptionist, Doctor)
 */
exports.registerPatient = async (req, res, next) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      address,
      emergencyContact,
      patientType,
      assignedDoctor,
    } = req.body;

    // 1. Basic Validation
    if (!name || !contactNumber) {
      const error = new Error('Name and Contact Number are required');
      error.statusCode = 400;
      throw error;
    }

    // 2. Generate Custom Patient ID
    // Format: P-<Timestamp>-<Random3Digits> to ensure uniqueness
    const patientId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. Multi-Tenancy: Get Model on Tenant Connection
    // CRITICAL: We bind the schema to the specific req.tenantDB connection
    const TenantPatient = req.tenantDB.model('Patient', Patient.schema);

    // 4. Create Patient in Tenant DB
    const patient = await TenantPatient.create({
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      address,
      emergencyContact,
      patientType,
      assignedDoctor,
      tenantId: req.user.tenantId, // Link to current tenant
      patientId,
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: patient,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Get all patients (Search & Filter)
 * @route   GET /api/patients
 * @access  Private
 */
exports.getPatients = async (req, res, next) => {
  try {
    const { search, patientType } = req.query;

    // 1. Base Query: STRICTLY enforce Tenant Isolation
    let query = { tenantId: req.user.tenantId };

    // 2. Search Logic (Name, Phone, or Patient ID)
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive
      query.$or = [
        { name: searchRegex },
        { contactNumber: searchRegex },
        { patientId: searchRegex },
      ];
    }

    // 3. Filter Logic (e.g., ?patientType=IPD)
    if (patientType) {
      query.patientType = patientType;
    }

    // 4. Multi-Tenancy: Execute Query on Tenant DB
    const TenantPatient = req.tenantDB.model('Patient', Patient.schema);
    
    // Sort by newest first
    const patients = await TenantPatient.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });

  } catch (error) {
    next(error);
  }
};