import React, { useState } from 'react';
import axios from 'axios'; // Changed: Import axios directly
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { X, Loader2, User, Phone, Calendar, Activity } from 'lucide-react';

// --- LOCAL AXIOS CONFIGURATION (Fix for missing file) ---
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// -------------------------------------------------------

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  // Don't render if not open
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    contactNumber: '',
    patientType: 'OPD',
    address: '', // Optional
    bloodGroup: '' // Optional
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API Call using the local instance
      // await axiosInstance.post('/patients/register', formData);
      await api.post('/patients/register', formData);

      toast.success('Patient registered successfully!');

      // Reset Form
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        contactNumber: '',
        patientType: 'OPD',
        address: '',
        bloodGroup: ''
      });

      // Notify parent & close
      onSuccess();
      onClose();

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl overflow-hidden transform transition-all scale-100 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-teal-600 p-4 md:p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5" /> Register New Patient
          </h2>
          <button
            onClick={onClose}
            className="text-teal-100 hover:text-white hover:bg-teal-700 rounded-full p-1 transition"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="9876543210"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Patient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="patientType"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  value={formData.patientType}
                  onChange={handleChange}
                >
                  <option value="OPD">OPD (Outpatient)</option>
                  <option value="IPD">IPD (Inpatient)</option>
                </select>
              </div>
            </div>

            {/* Optional Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Street address, City..."
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 md:px-6 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center transition text-sm md:text-base ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {loading ? 'Saving...' : 'Register Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;