const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g., "10:00 AM"
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast availability checks (Prevent Double Booking)
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);