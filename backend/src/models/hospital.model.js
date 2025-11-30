const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      // Basic validation for phone numbers (allows +, -, and spaces)
      match: [/^\+?[0-9\s-]{10,15}$/, 'Please add a valid contact number'],
    },
    adminEmail: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Standard email regex validation
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true, // Critical for FR-1: Ensures license uniqueness
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
      unique: true,
      // Auto-generates a UUID (e.g., '123e4567-e89b-12d3-a456-426614174000')
      default: uuidv4,
      immutable: true, // Tenant ID should never change once created
      index: true,     // Indexed for fast lookups during request interception
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Optional: Indexing for performance
// hospitalSchema.index({ licenseNumber: 1 }); // Already indexed by unique: true
// hospitalSchema.index({ tenantId: 1 });      // Already indexed by unique: true

module.exports = mongoose.model('Hospital', hospitalSchema);