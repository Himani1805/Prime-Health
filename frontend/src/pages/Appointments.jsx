import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { Calendar, Plus, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/appointments');
      setAppointments(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this appointment as ${status}?`)) return;
    try {
      await axiosInstance.put(`/appointments/${id}/status`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
          <p className="text-gray-500 text-sm">Manage patient visits and doctor schedules</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center text-teal-600">
                      <Loader2 className="animate-spin h-8 w-8" />
                      <span className="ml-2 font-medium">Loading Schedule...</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No appointments scheduled yet.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {appt.timeSlot}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appt.patient?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{appt.patient?.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold mr-2">
                          Dr
                        </div>
                        <span className="text-sm text-gray-700">
                          {appt.doctor?.firstName} {appt.doctor?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 truncate max-w-xs block" title={appt.reason}>
                        {appt.reason || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${appt.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                          appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {appt.status === 'Scheduled' && <CheckCircle className="h-3 w-3" />}
                          {appt.status === 'Cancelled' && <XCircle className="h-3 w-3" />}
                          {appt.status}
                        </span>

                        {appt.status === 'Scheduled' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200"
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                              className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-200"
                              title="Cancel Appointment"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BookAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchAppointments();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Appointments;