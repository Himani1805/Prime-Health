import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig'
import { toast } from 'react-toastify';
import { X, Loader2, Plus, Trash2, Pill, User, FileText } from 'lucide-react';

const CreatePrescriptionModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [patients, setPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
  
  // Dynamic Medicines Array
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  // Fetch Patients on Load
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingData(true);
      try {
        const response = await axiosInstance.get('/patients');
        setPatients(response.data.data);
      } catch (error) {
        toast.error('Failed to load patients');
      } finally {
        setLoadingData(false);
      }
    };
    fetchPatients();
  }, []);

  // Handle Medicine Field Change
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  // Add New Medicine Row
  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  // Remove Medicine Row
  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return; // Prevent deleting the last row
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        patientId,
        medicines,
        notes
      };

      await axiosInstance.post('/prescriptions', payload);
      toast.success('Prescription created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Creation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl md:max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-teal-600 p-4 md:p-6 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Write Prescription
          </h2>
          <button onClick={onClose} className="text-teal-100 hover:text-white transition">
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {loadingData ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Select Patient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    required
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.patientId} value={p._id}>
                        {p.name} (ID: {p.patientId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Medicines Section (Dynamic) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Pill className="h-4 w-4" /> Medicines
                  </h3>
                  <button 
                    type="button" 
                    onClick={addMedicineRow}
                    className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded hover:bg-teal-200 flex items-center gap-1 font-medium transition"
                  >
                    <Plus className="h-3 w-3" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-start">
                      <div className="md:col-span-3">
                        <input
                          placeholder="Medicine Name"
                          required
                          className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-teal-500"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          placeholder="Dosage (500mg)"
                          required
                          className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-teal-500"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          placeholder="Freq (1-0-1)"
                          required
                          className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-teal-500"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          placeholder="Duration (5 Days)"
                          required
                          className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-teal-500"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          placeholder="Instructions"
                          className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-teal-500"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-center pt-2">
                        {medicines.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeMedicineRow(index)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Notes</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Additional advice, diet restrictions, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                  {submitting ? 'Save Prescription' : 'Save Prescription'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePrescriptionModal;