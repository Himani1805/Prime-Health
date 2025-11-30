const User = require('../models/user.model.js');
const sendEmail = require('../utils/sendEmail');
const { uploadToCloudinary } = require('../config/cloudinary.js');

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

    let profilePictureUrl = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        profilePictureUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        // Continue creating user without profile picture, or throw error?
        // Let's log it and continue, or maybe throw. 
        // For now, let's just log and proceed.
      }
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
      profilePicture: profilePictureUrl,
      ...(department && { department }),
    });

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
        tempPassword: tempPassword,
        profilePicture: user.profilePicture
      },
    });

  } catch (error) {
    next(error);
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('Please upload a file');
      error.statusCode = 400;
      throw error;
    }

    const result = await uploadToCloudinary(req.file);
    const imageUrl = result.secure_url;

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

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = { tenantId: req.user.tenantId };
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, department, role, gender } = req.body;
    
    let updateData = {
      firstName,
      lastName,
      email,
      phone,
      department,
      role,
      gender
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      updateData.profilePicture = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};