const User = require('../models/user.model.js');
const sendEmail = require('../utils/sendEmail');
const { uploadToCloudinary } = require('../config/cloudinary.js');

/**
 * @desc    Create a new User (Staff)
 * @route   POST /api/users
 * @access  Private (Hospital Admin Only)
 */
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, department } = req.body;

    if (!firstName || !lastName || !email || !role) {
      const error = new Error('Please provide all required fields');
      error.statusCode = 400;
      throw error;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1@";

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: tempPassword,
      role,
      tenantId: req.user.tenantId,
      status: 'ACTIVE',
      ...(department && { department }),
    });

    // SEND EMAIL TO NEW STAFF
    const message = `
      Hello ${firstName},
      
      You have been added to the Prime Health HMS by your administrator.
      
      Your Login Credentials:
      -----------------------
      Role: ${role}
      Email: ${email}
      Password: ${tempPassword}
      -----------------------
      
      Please login and update your profile.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Prime Health - Account Created',
        message,
      });
    } catch (err) {
      console.error('Email failed:', err);
    }

    res.status(201).json({
      success: true,
      message: `User ${role} created successfully. Credentials sent to email.`,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      // Password removed from response
    });

  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Update User Profile Picture
 * @route   PUT /api/users/:id/photo
 * @access  Private
 */
exports.updateProfilePicture = async (req, res, next) => {
  try {
    // 1. Check if file was uploaded
    // Multer places the file info in req.file (in memory buffer)
    if (!req.file) {
      const error = new Error('Please upload a file');
      error.statusCode = 400;
      throw error;
    }

    // 2. Upload to Cloudinary
    const result = await uploadToCloudinary(req.file);
    const imageUrl = result.secure_url;

    // 3. Update User Record in DB
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: imageUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    next(error);
  }
};

// Get All Users (Doctors/Staff)
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    // Query build karo: Tenant ID zaroori hai
    const query = { tenantId: req.user.tenantId };
    
    // Agar frontend se ?role=DOCTOR aaya hai, to filter add karo
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password'); // Password mat bhejna
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};