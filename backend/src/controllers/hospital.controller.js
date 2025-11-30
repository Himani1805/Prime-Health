const Hospital = require('../models/hospital.model.js');
const User = require('../models/user.model.js');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Register a new hospital (Tenant) and auto-create Admin
 * @route   POST /api/hospitals/register
 * @access  Public
 */
exports.registerHospital = async (req, res, next) => {
  try {
    const { name, address, contactNumber, adminEmail, licenseNumber } = req.body;

    // 1. Validation & Duplicate Check
    if (!name || !address || !contactNumber || !adminEmail || !licenseNumber) {
      const error = new Error('Please provide all required fields: name, address, contactNumber, adminEmail, licenseNumber');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      const error = new Error('A user with this email address already exists.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Check for Duplicates (Hospital Level)
    const existingHospital = await Hospital.findOne({
      $or: [{ licenseNumber }, { adminEmail }],
    });

    if (existingHospital) {
      const error = new Error('Hospital with this License Number or Admin Email already exists.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Create Tenant (Hospital)
    const hospital = await Hospital.create({
      name,
      address,
      contactNumber,
      adminEmail,
      licenseNumber,
    });

    // 4. Auto-Create Hospital Admin User
    const tempPassword = 'Admin@123'; 
    // const tempPassword = Math.random().toString(36).slice(-8) + "Aa1@";

    try {
      // This line caused the error because 'User' was not imported
      await User.create({
        firstName: 'Admin',
        lastName: hospital.name, 
        email: adminEmail,
        password: tempPassword, 
        role: 'HOSPITAL_ADMIN',
        tenantId: hospital.tenantId,
        status: 'ACTIVE',
      });

      // 4. SEND EMAIL WITH CREDENTIALS (Async - don't block registration)
      const message = `
        Welcome to Prime Health Hospital Management System!
        
        Your Hospital has been successfully registered.
        
        Here are your Admin Login Credentials:
        --------------------------------------
        Hospital/Tenant ID: ${hospital.tenantId}
        Email: ${adminEmail}
        Password: ${tempPassword}
        --------------------------------------
        
        Please login and change your password immediately.
      `;

      // Send email asynchronously without blocking
      sendEmail({
        email: adminEmail,
        subject: 'Prime Health - Hospital Registration Successful',
        message,
      }).catch(emailError => {
        console.error('Email sending failed:', emailError);
      });

    } catch (userError) {
      // ROLLBACK: If user creation fails, delete the hospital to prevent orphans
      await Hospital.findByIdAndDelete(hospital._id);
      
      // Propagate the specific user creation error
      const error = new Error(`Failed to create Admin User: ${userError.message}`);
      error.statusCode = 500;
      throw error;
    }

    // 5. Success Response
    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Login credentials sent to Admin Email.',
      data: {
        hospital,
        adminCredentials: {
          email: adminEmail,
          password: tempPassword, 
        },
      },
    });

  } catch (error) {
    // Pass error to the global error handler middleware
    next(error);
  }
};