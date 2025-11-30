import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import AddStaffModal from '../components/AddStaffModal';
import {
  UserPlus,
  Search,
  Loader2,
  Mail,
  CheckCircle,
  Briefcase
} from 'lucide-react';

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      // Backend might return users in response.data or response.data.data
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'NURSE': return 'bg-pink-100 text-pink-800';
      case 'HOSPITAL_ADMIN': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
          <p className="text-gray-500 text-sm">Manage doctors, nurses, and administrative staff</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add New Staff
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            placeholder="Search staff by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No staff members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-6 flex flex-col items-center text-center relative group">

              <button
                onClick={() => handleEdit(user)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition opacity-0 group-hover:opacity-100"
                title="Edit Staff"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
              </button>

              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-100 rounded-full mb-4 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-gray-400">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  user.firstName?.charAt(0)
                )}
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h3>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRoleColor(user.role)}`}>
                {user.role}
              </span>

              {/* Details List */}
              <div className="w-full mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.department && (
                  <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{user.department}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <CheckCircle className={`h-4 w-4 mr-3 ${user.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={user.status === 'ACTIVE' ? 'text-green-700 font-medium' : ''}>
                    {user.status}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        userToEdit={userToEdit}
      />
    </div>
  );
};

export default Staff;