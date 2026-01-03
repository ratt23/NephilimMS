// src/components/DoctorManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import LoadingSpinner from './LoadingSpinner';
import { IconSearch, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'; // Assuming you have these or similar

Modal.setAppElement('#root');

// --- Helper API Function ---
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

// --- Initial State, Consts ---
const initialState = { id: null, name: '', specialty: '', image_url: '', schedule: {} };
const DOCTORS_PER_PAGE = 30;
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const displayDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; // Keep Indonesian for display if preferred, or change to English. User asked for English UI, so I will switch to English Days.
const daysOfWeekEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Mapping for DB keys (indonesian) to Display keys (english) if needed, 
// but assuming the DB keys are fixed as 'senin', 'selasa' etc? 
// Waiting, looking at previous code: `const daysOfWeek = ['senin', 'selasa', ...]`
// The DB likely stores keys in Indonesian. I must map them for display.
const dbDays = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const dayLabels = {
  senin: 'Monday', selasa: 'Tuesday', rabu: 'Wednesday', kamis: 'Thursday', jumat: 'Friday', sabtu: 'Saturday'
};


// --- Modal Style ---
const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '600px', maxHeight: '90vh',
    overflowY: 'auto', padding: '0', borderRadius: '4px', // ZERO padding for custom header
    border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50
  },
};

// --- SearchInput Component ---
function SearchInput({ value, onChange }) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => { onChange(internalValue); }, 300);
    return () => clearTimeout(timer);
  }, [internalValue, onChange]);

  useEffect(() => {
    if (value !== internalValue) { setInternalValue(value); }
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text" value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder="Search..."
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 text-sm"
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
    </div>
  );
}


export default function DoctorManager() {
  // --- State ---
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyList, setSpecialtyList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // --- Fetch Function ---
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage,
        limit: DOCTORS_PER_PAGE,
        search: searchQuery,
      });

      const fetches = [
        fetchApi(`/.netlify/functions/api/doctors?${params.toString()}`),
      ];
      if (specialtyList.length === 0) {
        fetches.push(fetchApi('/.netlify/functions/api/specialties'));
      }
      const [data, specialties] = await Promise.all(fetches);

      setDoctors(data.doctors);
      setTotalDoctors(data.total);
      setTotalPages(Math.ceil(data.total / DOCTORS_PER_PAGE));
      if (specialties) {
        setSpecialtyList(specialties);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, specialtyList.length]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // --- Refresh Specialties ---
  const refreshSpecialties = useCallback(async () => {
    try {
      const specialties = await fetchApi('/.netlify/functions/api/specialties');
      setSpecialtyList(specialties);
    } catch (err) {
      console.error("Failed to refresh specialties:", err);
    }
  }, []);

  // --- Handle Search ---
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // --- Handle Form ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // --- Handle Schedule Form ---
  const handleScheduleChange = useCallback((day, value) => {
    setFormData((prev) => ({ ...prev, schedule: { ...prev.schedule, [day]: value } }));
  }, []);

  // --- Handle Image Upload ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError("Cloudinary credentials missing.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formDataApi = new FormData();
    formDataApi.append('file', file);
    formDataApi.append('upload_preset', UPLOAD_PRESET);
    formDataApi.append('cloud_name', CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataApi,
      });

      const data = await response.json();

      if (response.ok) {
        const secureUrl = data.secure_url;
        setFormData((prev) => ({ ...prev, image_url: secureUrl }));
      } else {
        throw new Error(data.error.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message);
      console.error("Cloudinary upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Modal Helpers ---
  const closeModalAndRefresh = useCallback(() => {
    setIsModalOpen(false);
    refreshSpecialties();
    if (searchQuery !== '') setSearchQuery('');
    if (currentPage !== 1) setCurrentPage(1);
    else fetchDoctors();
  }, [searchQuery, currentPage, fetchDoctors, refreshSpecialties]);

  // --- Submit Handler ---
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    const cleanSchedule = {};
    for (const day in formData.schedule) {
      if (formData.schedule[day] && formData.schedule[day].trim() !== '') {
        cleanSchedule[day] = formData.schedule[day];
      }
    }
    const dataToSend = { ...formData, schedule: cleanSchedule };
    try {
      if (editMode) {
        await fetchApi(`/.netlify/functions/api/doctors?id=${formData.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      } else {
        await fetchApi('/.netlify/functions/api/doctors', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      }
      closeModalAndRefresh();
    } catch (err) {
      setError(err.message);
    }
  }, [formData, editMode, closeModalAndRefresh]);

  // --- Delete Handler ---
  const handleDelete = useCallback(async (doctor) => {
    if (window.confirm(`Are you sure you want to delete ${doctor.name}?`)) {
      try {
        setError(null);
        await fetchApi(`/.netlify/functions/api/doctors?id=${doctor.id}`, { method: 'DELETE' });
        if (doctors.length === 1 && currentPage > 1) {
          setCurrentPage(p => p - 1);
        } else {
          fetchDoctors();
        }
        refreshSpecialties();
      } catch (err) {
        setError(err.message);
      }
    }
  }, [doctors.length, currentPage, fetchDoctors, refreshSpecialties]);

  // --- Modal Visibility ---
  const openAddNewModal = useCallback(() => {
    setEditMode(false); setFormData(initialState);
    setError(null); setUploadError(null); setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((doctor) => {
    setEditMode(true);
    const normalizedSchedule = {};
    const rawSchedule = doctor.schedule || {};
    // Iterate over dbDays to fill form
    for (const day of dbDays) {
      const scheduleData = rawSchedule[day];
      if (typeof scheduleData === 'string') {
        normalizedSchedule[day] = scheduleData;
      } else if (typeof scheduleData === 'object' && scheduleData !== null && scheduleData.jam) {
        normalizedSchedule[day] = scheduleData.jam;
      } else {
        normalizedSchedule[day] = '';
      }
    }
    setFormData({ ...doctor, schedule: normalizedSchedule });
    setError(null); setUploadError(null); setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setUploadError(null);
  }, []);

  // --- Render ---
  return (
    <div className="space-y-6 animate-fade-in font-sans">

      {/* --- MODAL --- */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Doctor Form">
        <div className="bg-[#1a3e6e] text-white px-6 py-4 flex justify-between items-center rounded-t">
          <h2 className="text-xl font-bold uppercase tracking-wide">{editMode ? 'Edit Doctor' : 'New Doctor'}</h2>
          <button onClick={closeModal} className="text-white hover:text-gray-300 text-2xl">&times;</button>
        </div>

        <div className="p-6 bg-white overflow-y-auto max-h-[75vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 uppercase mb-1">Doctor Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required />
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-bold text-gray-700 uppercase mb-1">Specialty</label>
              <input
                type="text"
                name="specialty"
                id="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
                list="specialties-list"
              />
              <datalist id="specialties-list">
                {specialtyList.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>

            {/* --- Image Upload --- */}
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-1">Profile Image</label>
              {formData.image_url && (
                <div className="mb-2 flex items-center gap-4 p-2 border rounded bg-gray-50">
                  <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded object-cover border bg-white" />
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={handleChange}
                    name="image_url"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-sm text-xs text-gray-500"
                    placeholder="Image URL"
                  />
                </div>
              )}
              <label className="block w-full cursor-pointer rounded-sm border-2 border-dashed border-gray-300 p-4 text-center text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-400 transition-colors">
                {isUploading ? "Uploading..." : (formData.image_url ? "Change Image" : "Upload Image")}
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                />
              </label>
              {uploadError && <p className="text-red-600 text-xs mt-1">{uploadError}</p>}
            </div>

            {/* --- Schedule Input --- */}
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase mb-3 border-b pb-1">Practice Schedule</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbDays.map((day) => (
                  <div key={day} className="flex flex-col">
                    <label htmlFor={`modal-${day}`} className="text-xs font-bold text-gray-500 uppercase mb-1">{dayLabels[day]}</label>
                    <input
                      type="text"
                      id={`modal-${day}`}
                      name={day}
                      value={formData.schedule[day] || ''}
                      onChange={(e) => handleScheduleChange(day, e.target.value)}
                      placeholder="e.g., 09:00 - 12:00"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}

            {/* --- Form Buttons --- */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button type="button" onClick={closeModal} className="py-2 px-4 bg-gray-100 text-gray-700 font-bold uppercase text-xs rounded-sm hover:bg-gray-200 border border-gray-300">
                Cancel
              </button>
              <button type="submit" className="py-2 px-4 bg-green-600 text-white font-bold uppercase text-xs rounded-sm hover:bg-green-700 shadow-sm">
                {editMode ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* === DOCTOR MANAGER MAIN CONTENT --- */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-none">

        {/* TOLBAR */}
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <span>Doctor Manager</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{totalDoctors}</span>
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddNewModal}
              className="flex items-center gap-1 py-1.5 px-3 bg-green-600 text-white font-bold uppercase text-xs rounded-sm shadow-sm hover:bg-green-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              New
            </button>
          </div>
        </div>

        {/* SEARCH & PAGINATION BAR */}
        <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />

          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            {totalPages > 1 && (
              <>
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 px-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="p-1 px-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">
                  Next
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- Sticky Table --- */}
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="p-6 text-red-600">Error: {error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f2f5]">
                <tr>
                  <th className="sticky left-0 z-10 bg-[#f0f2f5] p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200"><span className="pl-2">Name</span></th>
                  <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">Specialty</th>
                  {dbDays.map((day) => (
                    <th key={day} className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider">{dayLabels[day]}</th>
                  ))}
                  <th className="sticky right-0 z-10 bg-[#f0f2f5] p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider border-l border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={dbDays.length + 3} className="p-8 text-center text-gray-500 italic">
                      No doctors found matching "{searchQuery}".
                    </td>
                  </tr>
                )}
                {doctors.map((doctor) => {
                  return (
                    <tr key={doctor.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50 p-3 whitespace-nowrap text-sm font-semibold text-gray-800 border-r border-gray-100">
                        <span className="pl-2">{doctor.name}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-gray-600">{doctor.specialty}</td>
                      {dbDays.map((day) => {
                        const scheduleData = doctor.schedule?.[day];
                        let displayTime = '-';
                        if (typeof scheduleData === 'string') {
                          displayTime = scheduleData;
                        } else if (typeof scheduleData === 'object' && scheduleData !== null && scheduleData.jam) {
                          displayTime = scheduleData.jam;
                        }
                        return (
                          <td key={day} className="p-3 whitespace-nowrap text-xs text-gray-500">
                            {displayTime}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-white group-hover:bg-blue-50 p-2 whitespace-nowrap text-center text-sm border-l border-gray-100">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => openEditModal(doctor)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(doctor)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}