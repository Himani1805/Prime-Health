const PDFDocument = require('pdfkit');
const Prescription = require('../models/prescription.model.js');
const Patient = require('../models/patient.model.js');
const User = require('../models/user.model.js');

/**
 * @desc    Create a new Prescription
 * @route   POST /api/prescriptions
 * @access  Private (Doctor, Hospital Admin)
 */
exports.createPrescription = async (req, res, next) => {
  try {
    const { patientId, medicines, notes } = req.body;

    // 1. Validation
    if (!patientId || !medicines || medicines.length === 0) {
      const error = new Error('Patient ID and at least one medicine are required');
      error.statusCode = 400;
      throw error;
    }

    // 2. Tenant Context Models
    // We must use the models bound to the CURRENT tenant connection
    const TenantPatient = req.tenantDB.model('Patient', Patient.schema);
    const TenantPrescription = req.tenantDB.model('Prescription', Prescription.schema);

    // 3. Verify Patient Existence (Security & Data Integrity)
    // This check implicitly ensures the patient belongs to THIS tenant
    const patientExists = await TenantPatient.findById(patientId);
    
    if (!patientExists) {
      const error = new Error('Patient not found in this hospital records');
      error.statusCode = 404;
      throw error;
    }

    // 4. Generate Prescription ID
    // Format: RX-<Timestamp>
    const prescriptionId = `RX-${Date.now()}`;

    // 5. Create Prescription
    const prescription = await TenantPrescription.create({
      tenantId: req.user.tenantId,
      doctor: req.user._id, // The logged-in doctor
      patient: patientId,
      prescriptionId,
      medicines,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get All Prescriptions
 * @route   GET /api/prescriptions
 * @access  Private (Doctor, Hospital Admin, Nurse, Receptionist)
 */
exports.getPrescriptions = async (req, res, next) => {
  try {
    // Tenant Context Models
    const TenantPrescription = req.tenantDB.model('Prescription', Prescription.schema);
    const TenantPatient = req.tenantDB.model('Patient', Patient.schema);
    
    // Find prescriptions for this tenant
    const prescriptions = await TenantPrescription.find({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 });

    // Manually populate related data to avoid cross-DB issues
    const populatedPrescriptions = await Promise.all(
      prescriptions.map(async (prescription) => {
        // Get patient from tenant DB
        const patient = await TenantPatient.findById(prescription.patient).select('name patientId');
        
        // Get doctor from global User collection
        const doctor = await User.findById(prescription.doctor).select('firstName lastName');
        
        return {
          ...prescription.toObject(),
          patient,
          doctor,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedPrescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download Prescription PDF
 * @route   GET /api/prescriptions/:id/download
 * @access  Private
 */
exports.downloadPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Determine Correct Models (Multi-Tenancy)
    const TenantPrescription = req.tenantDB 
        ? req.tenantDB.model('Prescription', Prescription.schema) 
        : Prescription;
    
    const TenantPatient = req.tenantDB 
        ? req.tenantDB.model('Patient', Patient.schema) 
        : Patient;

    // 2. Find Prescription
    // We only find prescriptions belonging to the current tenant
    const prescription = await TenantPrescription.findOne({ 
        _id: id,
        ...(req.user.tenantId && { tenantId: req.user.tenantId })
    });

    if (!prescription) {
      const error = new Error('Prescription not found');
      error.statusCode = 404;
      throw error;
    }

    // 3. Fetch Linked Data Manually (Cross-DB safety)
    // Patient is in the SAME DB as prescription
    const patient = await TenantPatient.findById(prescription.patient);
    
    // Doctor is likely in the GLOBAL DB (users collection)
    const doctor = await User.findById(prescription.doctor);

    if (!patient || !doctor) {
        throw new Error('Patient or Doctor records missing');
    }

    // 4. Generate PDF
    const doc = new PDFDocument();

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition', 
        `attachment; filename=prescription-${patient.name.replace(/\s+/g, '_')}.pdf`
    );

    // Pipe PDF to Response
    doc.pipe(res);

    // --- PDF DESIGN ---

    // Header
    doc.fontSize(20).text('PRIME HEALTH HOSPITAL', { align: 'center' });
    doc.fontSize(10).text('123 Health Avenue, Wellness City', { align: 'center' });
    doc.moveDown();
    doc.text('--------------------------------------------------------------------------', { align: 'center' });
    doc.moveDown();

    // Doctor & Date Info
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.text(`Dr. ${doctor.firstName} ${doctor.lastName}`, { align: 'left' });
    doc.fontSize(10).text(`(Prescription ID: ${prescription.prescriptionId})`, { align: 'left' });
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Details:');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Name: ${patient.name}`);
    doc.text(`Gender: ${patient.gender}`);
    doc.text(`Contact: ${patient.contactNumber}`);
    doc.moveDown();

    // Medicines Table Header
    doc.text('--------------------------------------------------------------------------', { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').text('MEDICINES', { align: 'center' });
    doc.moveDown(0.5);
    
    // Table Columns
    let y = doc.y;
    doc.fontSize(10).text('Name', 50, y);
    doc.text('Dosage', 200, y);
    doc.text('Freq', 300, y);
    doc.text('Duration', 400, y);
    doc.moveDown();

    // Medicines List
    doc.font('Helvetica');
    prescription.medicines.forEach((med) => {
        y = doc.y;
        doc.text(med.name, 50, y);
        doc.text(med.dosage, 200, y);
        doc.text(med.frequency, 300, y);
        doc.text(med.duration, 400, y);
        
        // Add instructions if present
        if(med.instructions) {
             doc.fontSize(8).text(`  Note: ${med.instructions}`, 50, y + 15, { color: 'grey' });
             doc.fontSize(10).fillColor('black'); // Reset color
             doc.moveDown(0.5);
        }
        doc.moveDown();
    });

    // Notes
    if (prescription.notes) {
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Advice / Notes:');
        doc.font('Helvetica').text(prescription.notes);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Get Well Soon!', { align: 'center', oblique: true });
    
    // Finalize PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};