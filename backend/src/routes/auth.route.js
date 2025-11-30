const express = require('express');
const authRouter = express.Router();
// Import Controllers
const { loginUser, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller.js');

// Import Middleware
const { protect } = require('../middlewares/auth.middleware.js');

// Route: POST /api/auth/login(Public Routes)
authRouter.post('/login', loginUser);
authRouter.post('/forgotpassword', forgotPassword);
authRouter.put('/resetpassword/:resettoken', resetPassword);

// Protected Routes
// This route is protected. It validates the token and switches DB context before running getMe
authRouter.get('/me', protect, getMe);

module.exports = authRouter;








