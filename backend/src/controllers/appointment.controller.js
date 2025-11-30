const Appointment = require('../models/appointment.model.js');
const Patient = require('../models/patient.model.js');
const User = require('../models/user.model.js');

/**
 * @desc    Book a new Appointment
 * @route   POST /api/appointments/book
 * @access  Private (Receptionist, Admin, Doctor)
 */
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, timeSlot, reason } = req.body;

    // 1. Validation
    if (!doctorId || !patientId || !date || !timeSlot) {
      const error = new Error('Doctor, Patient, Date, and Time Slot are required');
      error.statusCode = 400;
      throw error;
    }

    // 2. Determine Models (Multi-Tenancy)
    // Use the tenant-specific model if available, otherwise global
    const TenantAppointment = req.tenantDB 
        ? req.tenantDB.model('Appointment', Appointment.schema) 
        : Appointment;

    const TenantPatient = req.tenantDB 
        ? req.tenantDB.model('Patient', Patient.schema) 
        : Patient;

    // 3. Resolve Patient ID (Handle Custom ID 'P-...' vs Mongo ID)
    let finalPatientId = patientId;
    
    // If patientId is NOT a valid Mongo ObjectId, assume it's a Custom ID (e.g., P-123)
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
        const patientRecord = await TenantPatient.findOne({ 
            patientId: patientId,
            ...(req.user.tenantId && { tenantId: req.user.tenantId })
        });
        
        if (!patientRecord) {
            const error = new Error(`Patient with ID '${patientId}' not found.`);
            error.statusCode = 404;
            throw error;
        }
        finalPatientId = patientRecord._id;
    }

    // 4. Availability Check (Prevent Double Booking)
    const existingAppointment = await TenantAppointment.findOne({
      tenantId: req.user.tenantId,
      doctor: doctorId,
      appointmentDate: new Date(date), // Ensure date format match
      timeSlot: timeSlot,
      status: 'Scheduled', // Only check active appointments
    });

    if (existingAppointment) {
      const error = new Error('This time slot is already booked for the selected doctor.');
      error.statusCode = 400;
      throw error;
    }

    // 5. Create Appointment
    const appointment = await TenantAppointment.create({
      tenantId: req.user.tenantId,
      doctor: doctorId,
      patient: finalPatientId,
      appointmentDate: new Date(date),
      timeSlot,
      reason,
      status: 'Scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Appointments (Filter by Date/Doctor)
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { date, doctorId } = req.query;

    const TenantAppointment = req.tenantDB 
        ? req.tenantDB.model('Appointment', Appointment.schema) 
        : Appointment;

    // 1. Build Query (Strictly scoped to Tenant)
    let query = { tenantId: req.user.tenantId };

    if (date) {
      // Simple date match (Assuming YYYY-MM-DD passed in query matches DB storage)
      // For more robustness, you might want to use range query for full day
      query.appointmentDate = new Date(date); 
    }
    if (doctorId) {
      query.doctor = doctorId;
    }

    // 2. Fetch Appointments & Populate Local Patient
    let appointments = await TenantAppointment.find(query)
      .populate('patient', 'name contactNumber') 
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .lean(); 

    // 3. Manual Populate for Doctor (Global DB)
    // Extract unique doctor IDs
    const doctorIds = Array.from(new Set(appointments.map(function(app) { 
        return app.doctor ? app.doctor.toString() : null; 
    })));

    if (doctorIds.length > 0) {
        // Fetch doctors from Global User Collection
        const doctors = await User.find({ _id: { $in: doctorIds } }, 'firstName lastName');
        
        // Create lookup map
        const doctorMap = doctors.reduce((acc, doc) => {
            acc[doc._id.toString()] = doc;
            return acc;
        }, {});

        // Merge doctor info into appointments
        appointments = appointments.map(app => {
            const doctorId = app.doctor ? app.doctor.toString() : null;
            const doctorInfo = doctorMap[doctorId] || { firstName: 'Unknown', lastName: 'Doctor' };
            return Object.assign({}, app, { doctor: doctorInfo });
        });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Appointment Status (Cancel/Complete)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Doctor, Admin, Receptionist)
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
      const error = new Error('Invalid status');
      error.statusCode = 400;
      throw error;
    }

    const TenantAppointment = req.tenantDB 
        ? req.tenantDB.model('Appointment', Appointment.schema) 
        : Appointment;

    const appointment = await TenantAppointment.findOne({ _id: id, tenantId: req.user.tenantId });

    if (!appointment) {
      const error = new Error('Appointment not found');
      error.statusCode = 404;
      throw error;
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
    });

  } catch (error) {
    next(error);
  }
};