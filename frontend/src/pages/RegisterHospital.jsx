import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';

const RegisterHospital = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    adminEmail: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API Call to Register Hospital
      const response = await axiosInstance.post('/hospitals/register', formData);
      
      // Success Logic
      toast.success('Registration Successful! Please check your email/login credentials.');
      
      // Navigate to Login after a short delay so user sees the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      const msg = error.response?.data?.message || 'Registration Failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-teal-600 p-8 text-center relative">
          <Link to="/login" className="absolute left-6 top-8 text-teal-100 hover:text-white transition">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Building2 className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Register Hospital</h2>
          <p className="text-teal-100 mt-2">Join Prime Health Network</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                    placeholder="e.g. City General Hospital"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="adminEmail"
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="admin@hospital.com"
                    value={formData.adminEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="+1 234 567 890"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="LIC-2025-XXX"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="address"
                    required
                    rows="2"
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Full street address..."
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Registering Hospital...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHospital;