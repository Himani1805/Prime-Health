import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { X, Loader2, Plus, Trash2, FileText } from 'lucide-react';

const PrescriptionTemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
    if (!isOpen) return null;

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/prescription-templates');
            setTemplates(response.data.data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await axiosInstance.delete(`/prescription-templates/${id}`);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await axiosInstance.post('/prescription-templates', newTemplate);
            toast.success('Template created');
            setShowCreateForm(false);
            setNewTemplate({ name: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to create template');
        } finally {
            setCreating(false);
        }
    };

    const handleMedicineChange = (index, field, value) => {
        const updatedMedicines = [...newTemplate.medicines];
        updatedMedicines[index][field] = value;
        setNewTemplate({ ...newTemplate, medicines: updatedMedicines });
    };

    const addMedicineRow = () => {
        setNewTemplate({
            ...newTemplate,
            medicines: [...newTemplate.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
    };

    const removeMedicineRow = (index) => {
        if (newTemplate.medicines.length === 1) return;
        const updatedMedicines = newTemplate.medicines.filter((_, i) => i !== index);
        setNewTemplate({ ...newTemplate, medicines: updatedMedicines });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-teal-600 p-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Prescription Templates
                    </h2>
                    <button onClick={onClose} className="text-teal-100 hover:text-white transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {!showCreateForm ? (
                        <>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition"
                                >
                                    <Plus className="h-4 w-4" /> Create New Template
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map((template) => (
                                        <div key={template._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800">{template.name}</h3>
                                                <button onClick={() => handleDelete(template._id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-3">
                                                {template.medicines.length} medicines
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onSelectTemplate(template.medicines);
                                                    onClose();
                                                }}
                                                className="w-full bg-teal-50 text-teal-700 py-2 rounded hover:bg-teal-100 transition text-sm font-medium"
                                            >
                                                Use Template
                                            </button>
                                        </div>
                                    ))}
                                    {templates.length === 0 && (
                                        <div className="col-span-full text-center text-gray-500 py-10">
                                            No templates found. Create one to get started.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    placeholder="e.g. Common Cold"
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-700">Medicines</h3>
                                    <button type="button" onClick={addMedicineRow} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded hover:bg-teal-200 flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {newTemplate.medicines.map((med, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-start">
                                            <div className="col-span-3">
                                                <input
                                                    placeholder="Name"
                                                    required
                                                    className="w-full px-2 py-1 text-sm border rounded"
                                                    value={med.name}
                                                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    placeholder="Dosage"
                                                    required
                                                    className="w-full px-2 py-1 text-sm border rounded"
                                                    value={med.dosage}
                                                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    placeholder="Freq"
                                                    required
                                                    className="w-full px-2 py-1 text-sm border rounded"
                                                    value={med.frequency}
                                                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    placeholder="Duration"
                                                    required
                                                    className="w-full px-2 py-1 text-sm border rounded"
                                                    value={med.duration}
                                                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    placeholder="Instructions"
                                                    className="w-full px-2 py-1 text-sm border rounded"
                                                    value={med.instructions}
                                                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center pt-1">
                                                {newTemplate.medicines.length > 1 && (
                                                    <button type="button" onClick={() => removeMedicineRow(index)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center"
                                >
                                    {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                    Save Template
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrescriptionTemplatesModal;
