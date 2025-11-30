const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    bloodGroup: {
      type: String,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    address: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    patientType: {
      type: String,
      enum: ['OPD', 'IPD'],
      default: 'OPD',
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model (Doctor)
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      unique: true, // Unique per tenant
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);