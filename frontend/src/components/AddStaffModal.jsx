import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { X, Loader2, UserPlus, Mail, Phone, Briefcase, User, Camera, Edit } from 'lucide-react';

const AddStaffModal = ({ isOpen, onClose, onSuccess, userToEdit = null }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'DOCTOR',
    gender: 'Male'
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [existingProfilePicture, setExistingProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName || '',
        lastName: userToEdit.lastName || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        department: userToEdit.department || '',
        role: userToEdit.role || 'DOCTOR',
        gender: userToEdit.gender || 'Male'
      });
      setExistingProfilePicture(userToEdit.profilePicture);
    } else {
      // Reset form for new user
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        role: 'DOCTOR',
        gender: 'Male'
      });
      setExistingProfilePicture(null);
    }
    setProfilePicture(null);
    setCreatedUser(null);
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (profilePicture) {
        data.append('profilePicture', profilePicture);
      }

      let response;
      if (userToEdit) {
        response = await axiosInstance.put(`/users/${userToEdit._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Staff member updated!');
      } else {
        response = await axiosInstance.post('/users', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCreatedUser(response.data.data);
        toast.success('Staff member added!');
      }

      onSuccess();
      if (userToEdit) {
        onClose();
      }

    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save staff';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedUser(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      department: '', role: 'DOCTOR', gender: 'Male'
    });
    setProfilePicture(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        <div className="bg-teal-600 p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {userToEdit ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {userToEdit ? 'Edit Staff' : (createdUser ? 'Staff Created' : 'Add New Staff')}
          </h2>
          <button onClick={handleClose} className="text-teal-100 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {createdUser && !userToEdit ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                <p className="font-medium text-lg">User Created Successfully!</p>
                <p className="text-sm mt-1">Please copy the credentials below.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left space-y-3">
                <div className="flex justify-center mb-4">
                  {createdUser.profilePicture ? (
                    <img src={createdUser.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-2xl font-bold border-4 border-white shadow-md">
                      {createdUser.firstName[0]}{createdUser.lastName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</span>
                  <p className="text-lg font-mono text-gray-800 select-all">{createdUser.email}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Temporary Password</span>
                  <p className="text-lg font-mono text-teal-600 font-bold select-all bg-white p-2 rounded border border-gray-200">
                    {createdUser.tempPassword}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</span>
                  <p className="text-sm text-gray-700">{createdUser.role}</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition shadow-lg shadow-teal-200"
              >
                Done & Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Profile Picture Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-teal-500 transition">
                    {profilePicture ? (
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : existingProfilePicture ? (
                      <img
                        src={existingProfilePicture}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400 group-hover:text-teal-500 transition" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Upload Profile Picture"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 shadow-sm border border-gray-100 whitespace-nowrap">
                    {profilePicture || existingProfilePicture ? 'Change Photo' : 'Upload Photo'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="department"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. Cardiology"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white font-medium text-gray-700"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="HOSPITAL_ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center transition ${loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {loading ? (userToEdit ? 'Updating...' : 'Creating User...') : (userToEdit ? 'Update Staff' : 'Add Staff Member')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;