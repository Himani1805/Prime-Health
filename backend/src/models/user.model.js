const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'SUPER_ADMIN',
        'HOSPITAL_ADMIN',
        'DOCTOR',
        'NURSE',
        'PHARMACIST',
        'RECEPTIONIST',
      ],
      default: 'HOSPITAL_ADMIN',
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * FIXED: Password Hashing Middleware
 * Issue: Mixing 'async' and 'next' callback caused "next is not a function".
 * Fix: Removed 'next'. Mongoose waits for the async function to complete.
 */
userSchema.pre('save', async function () {
  // 1. If password is not modified, return (exit function)
  if (!this.isModified('password')) {
    return;
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);