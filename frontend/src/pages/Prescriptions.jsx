import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import CreatePrescriptionModal from '../components/CreatePrescriptionModal';
import { 
  FileText, 
  Plus, 
  Loader2, 
  Download, 
  Calendar,
  User 
} from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch Prescriptions
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/prescriptions');
      setPrescriptions(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // --- PDF DOWNLOAD LOGIC ---
  const handleDownload = async (id, patientName) => {
    setDownloadingId(id); // Show spinner on specific button
    try {
      // 1. Request blob data from backend
      const response = await axiosInstance.get(`/prescriptions/${id}/download`, {
        responseType: 'blob', // CRITICAL: Tells axios to treat response as binary data
      });

      // 2. Create a hidden download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // 3. Set filename (clean spaces)
      const filename = `Prescription_${patientName.replace(/\s+/g, '_')}.pdf`;
      link.setAttribute('download', filename);
      
      // 4. Trigger click & cleanup
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF Downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Prescriptions</h2>
          <p className="text-gray-500 text-sm">Issue and manage patient medications</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Prescription
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RX ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-teal-600">
                    <div className="flex justify-center items-center">
                      <Loader2 className="animate-spin h-8 w-8 mr-2" /> Loading...
                    </div>
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No prescriptions found.</td>
                </tr>
              ) : (
                prescriptions.map((rx) => (
                  <tr key={rx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded border text-gray-700">{rx.prescriptionId}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {rx.patient?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Dr. {rx.doctor?.firstName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {rx.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDownload(rx._id, rx.patient?.name || 'Patient')}
                        disabled={downloadingId === rx._id}
                        className={`text-teal-600 hover:text-teal-800 font-medium inline-flex items-center gap-1 transition ${
                          downloadingId === rx._id ? 'opacity-50 cursor-wait' : ''
                        }`}
                      >
                        {downloadingId === rx._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreatePrescriptionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPrescriptions();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default Prescriptions;