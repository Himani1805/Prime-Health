const express = require('express');
const userRouter = express.Router();
const { createUser, updateProfilePicture, getUsers, updateUser } = require('../controllers/user.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');
const { upload } = require('../config/cloudinary.js');

// Base Route: /api/users

// Protect all routes in this file
userRouter.use(protect);

// POST /api/users - Create a new staff member
// Only HOSPITAL_ADMIN (or SUPER_ADMIN) can create new users
userRouter.post(
  '/',
  authorize('HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  upload.single('profilePicture'),
  createUser
);

// PUT /:id/photo - Upload Profile Picture
// Any logged-in user can update their own photo, or Admin can update anyone's
userRouter.put(
  '/:id/photo',
  upload.single('photo'), // Middleware to handle file upload BEFORE controller
  updateProfilePicture
);

// PUT /:id - Update User Details
userRouter.put(
  '/:id',
  authorize('HOSPITAL_ADMIN', 'SUPER_ADMIN'),
  upload.single('profilePicture'),
  updateUser
);


userRouter.get('/', protect, authorize('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST'), getUsers);

module.exports = userRouter;