const Patient = require('../models/patient.model.js');
const { uploadToCloudinary } = require('../config/cloudinary.js');

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
      department,
    } = req.body;

    // 1. Basic Validation
    if (!name || !contactNumber) {
      const error = new Error('Name and Contact Number are required');
      error.statusCode = 400;
      throw error;
    }

    // 2. Handle File Upload (Profile Picture)
    let profilePicture = '';
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file);
        profilePicture = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Image Upload Failed:', uploadError);
        // We can choose to fail or continue without image. Let's fail for now if upload fails.
        const error = new Error('Image upload failed');
        error.statusCode = 500;
        throw error;
      }
    }

    // 3. Generate Custom Patient ID
    // Format: P-<Timestamp>-<Random3Digits> to ensure uniqueness
    const patientId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 4. Multi-Tenancy: Get Model on Tenant Connection
    // CRITICAL: We bind the schema to the specific req.tenantDB connection
    const TenantPatient = req.tenantDB.model('Patient', Patient.schema);

    // 5. Create Patient in Tenant DB
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
      department,
      profilePicture,
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

    // 2. ABAC: Attribute-Based Access Control
    // "A doctor can only view patients assigned to their department."
    if (req.user.role === 'DOCTOR') {
        if (req.user.department) {
            query.department = req.user.department;
        } else {
            // If doctor has no department, maybe they can only see patients assigned to them specifically?
            // Or fallback to empty result?
            // Let's assume they can see patients assigned to them if no department is set.
            query.assignedDoctor = req.user._id;
        }
    }

    // 3. Search Logic (Name, Phone, or Patient ID)
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive
      query.$or = [
        { name: searchRegex },
        { contactNumber: searchRegex },
        { patientId: searchRegex },
      ];
    }

    // 4. Filter Logic (e.g., ?patientType=IPD)
    if (patientType) {
      query.patientType = patientType;
    }

    // 5. Multi-Tenancy: Execute Query on Tenant DB
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