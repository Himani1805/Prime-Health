import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { X, Loader2, Calendar, Clock, User, Stethoscope, FileText } from 'lucide-react';

const BookAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: ''
  });

  // Fetch Patients and Doctors when modal opens
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch Patients
        const patientsRes = await axiosInstance.get('/patients');
        setPatients(patientsRes.data.data);

        // Fetch Doctors 
        // Note: Ideally backend should support filtering: /users?role=DOCTOR
        // Here we fetch all and filter client-side just to be safe
        const usersRes = await axiosInstance.get('/users'); 
        const docList = usersRes.data.data ? usersRes.data.data.filter(u => u.role === 'DOCTOR') : [];
        setDoctors(docList);

      } catch (error) {
        toast.error('Failed to load patients or doctors list');
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.post('/appointments/book', formData);
      toast.success('Appointment booked successfully!');
      onSuccess(); // Refresh list
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Booking failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-teal-600 p-4 md:p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Book Appointment
          </h2>
          <button onClick={onClose} className="text-teal-100 hover:text-white transition">
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {loadingData ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Patient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    name="patientId"
                    required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.patientId}
                    onChange={handleChange}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.patientId} value={p.patientId}>
                        {p.name} (ID: {p.patientId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    name="doctorId"
                    required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    value={formData.doctorId}
                    onChange={handleChange}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.firstName} {d.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="timeSlot"
                      required
                      placeholder="e.g. 10:00 AM"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={formData.timeSlot}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="reason"
                    rows="3"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Symptoms..."
                    value={formData.reason}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              {/* Buttons */}
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
                  disabled={submitting}
                  className={`px-4 md:px-6 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center transition text-sm md:text-base ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {submitting ? 'Confirm Booking' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;