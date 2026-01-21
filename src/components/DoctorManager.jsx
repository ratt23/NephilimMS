// src/components/DoctorManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import LoadingSpinner from './LoadingSpinner';
import { IconSearch, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'; // Assuming you have these or similar

Modal.setAppElement('#root');

// --- Helper API Function ---
// --- Helper API Function ---
import { getApiBaseUrl } from '../utils/apiConfig';

async function fetchApi(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  let cleanPath = endpoint;

  // Strip Netlify prefixes to match Hono routes
  if (cleanPath.startsWith('/.netlify/functions/api')) {
    cleanPath = cleanPath.replace('/.netlify/functions/api', '');
  } else if (cleanPath.startsWith('/.netlify/functions')) {
    cleanPath = cleanPath.replace('/.netlify/functions', '');
  }

  const url = `${baseUrl}${cleanPath}`;
  console.log(`[DoctorManager] Fetching: ${url}, Method: ${options.method || 'GET'}`);
  const response = await fetch(url, { ...options, credentials: 'include' });
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
        className="pl-10 pr-4 py-2 border border-[#8C7A3E]/30 rounded-sm shadow-2xl-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64 text-sm"
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-[#a0a4ab]/60" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
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

  // Custom Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

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
    console.log('[DoctorManager] Submitting form...', formData);

    // Manual Validation
    if (!formData.name || !formData.name.trim()) {
      alert('Doctor Name is required');
      return;
    }
    if (!formData.specialty || !formData.specialty.trim()) {
      alert('Specialty is required');
      return;
    }

    const cleanSchedule = {};
    for (const day in formData.schedule) {
      if (formData.schedule[day] && formData.schedule[day].trim() !== '') {
        cleanSchedule[day] = formData.schedule[day];
      }
    }
    const dataToSend = { ...formData, schedule: cleanSchedule };
    console.log('[DoctorManager] Data to send:', dataToSend);

    try {
      let result;
      if (editMode) {
        console.log(`[DoctorManager] Sending PUT request for ID: ${formData.id}`);
        result = await fetchApi(`/.netlify/functions/api/doctors?id=${formData.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      } else {
        console.log('[DoctorManager] Sending POST request');
        result = await fetchApi('/.netlify/functions/api/doctors', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSend),
        });
      }
      console.log('[DoctorManager] Success:', result);
      closeModalAndRefresh();
    } catch (err) {
      console.error('[DoctorManager] Submit Error:', err);
      setError(err.message);
      alert(`Failed to save doctor: ${err.message}`);
    }
  }, [formData, editMode, closeModalAndRefresh]);

  // --- Delete Handler ---
  const handleDelete = useCallback(async (doctor) => {
    console.log('[DoctorManager] handleDelete CLICKED. Doctor:', doctor);
    if (!doctor) {
      alert('Error: No doctor data found for delete');
      return;
    }
    // Open custom modal instead of window.confirm
    setDoctorToDelete(doctor);
    setDeleteModalOpen(true);
  }, []);

  // --- Execute Delete (NEW - called by modal) ---
  const executeDelete = useCallback(async () => {
    if (!doctorToDelete) return;

    try {
      setError(null);
      console.log(`[DoctorManager] Executing delete for doctor ID: ${doctorToDelete.id}`);
      await fetchApi(`/.netlify/functions/api/doctors?id=${doctorToDelete.id}`, { method: 'DELETE' });
      console.log('[DoctorManager] Delete success');

      setDeleteModalOpen(false);
      setDoctorToDelete(null);

      if (doctors.length === 1 && currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else {
        fetchDoctors();
      }
      refreshSpecialties();
    } catch (err) {
      console.error('[DoctorManager] Delete Error:', err);
      setError(err.message);
      alert(`Failed to delete doctor: ${err.message}`);
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
    }
  }, [doctorToDelete, doctors.length, currentPage, fetchDoctors, refreshSpecialties]);

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

        <div className="p-6 bg-[#1a1d21] overflow-y-auto max-h-[75vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Doctor Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required />
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Specialty</label>
              <input
                type="text"
                name="specialty"
                id="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Profile Image</label>
              {formData.image_url && (
                <div className="mb-2 flex items-center gap-4 p-2 border rounded bg-[#0B0B0C]">
                  <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded object-cover border bg-[#1a1d21]" />
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={handleChange}
                    name="image_url"
                    className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm text-xs text-[#a0a4ab]"
                    placeholder="Image URL"
                  />
                </div>
              )}
              <label className="block w-full cursor-pointer rounded-sm border-2 border-dashed border-[#8C7A3E]/30 p-4 text-center text-sm font-medium text-[#a0a4ab] hover:bg-[#0B0B0C] hover:border-blue-400 transition-colors">
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
              <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-3 border-b pb-1">Practice Schedule</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbDays.map((day) => (
                  <div key={day} className="flex flex-col">
                    <label htmlFor={`modal-${day}`} className="text-xs font-bold text-[#a0a4ab] uppercase mb-1">{dayLabels[day]}</label>
                    <input
                      type="text"
                      id={`modal-${day}`}
                      name={day}
                      value={formData.schedule[day] || ''}
                      onChange={(e) => handleScheduleChange(day, e.target.value)}
                      placeholder="e.g., 09:00 - 12:00"
                      className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm bg-red-900/20 p-2 rounded border border-red-200">{error}</p>}

            {/* --- Form Buttons --- */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
              <button type="button" onClick={closeModal} className="py-2 px-4 bg-[#0B0B0C] text-[#E6E6E3] font-bold uppercase text-xs rounded-sm hover:bg-gray-200 border border-[#8C7A3E]/30">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="py-2 px-4 bg-green-600 text-white font-bold uppercase text-xs rounded-sm hover:bg-green-700 shadow-2xl-sm"
              >
                {editMode ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE MODAL --- */}
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        style={{
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '400px', padding: '0', borderRadius: '8px',
            border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 60 }
        }}
        contentLabel="Confirm Delete"
      >
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Confirm Delete
          </h2>
        </div>
        <div className="p-6 bg-[#1a1d21]">
          <p className="text-[#E6E6E3] mb-6 font-medium">
            Are you sure you want to delete <span className="font-bold text-red-600">{doctorToDelete?.name}</span>?
            <br /><span className="text-sm text-[#a0a4ab] font-normal">This action cannot be undone.</span>
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-[#0B0B0C] text-[#E6E6E3] rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-2xl-md transition-colors"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* --- DOCTOR MANAGER MAIN CONTENT --- */}
      <div className="bg-[#1a1d21] border border-[#8C7A3E]/20 shadow-2xl-sm rounded-none">

        {/* TOLBAR */}
        <div className="bg-[#1a1d21] p-4 border-b border-[#8C7A3E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#E6E6E3] uppercase tracking-wide flex items-center gap-2">
              <span>Doctor Manager</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{totalDoctors}</span>
            </h2>
            <div className="text-[10px] text-[#a0a4ab]/60 font-mono mt-1">
              API: {getApiBaseUrl()}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddNewModal}
              className="flex items-center gap-1 py-1.5 px-3 bg-green-600 text-white font-bold uppercase text-xs rounded-sm shadow-2xl-sm hover:bg-green-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              New
            </button>
          </div>
        </div>

        {/* SEARCH & PAGINATION BAR */}
        <div className="bg-[#0B0B0C] p-3 border-b border-[#8C7A3E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />

          <div className="flex items-center gap-2 text-xs text-[#a0a4ab] font-medium">
            {totalPages > 1 && (
              <>
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 px-2 border rounded bg-[#1a1d21] hover:bg-[#0B0B0C] disabled:opacity-50">
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="p-1 px-2 border rounded bg-[#1a1d21] hover:bg-[#0B0B0C] disabled:opacity-50">
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
                  <th className="sticky left-0 z-10 bg-[#f0f2f5] p-3 text-left text-[11px] font-bold text-[#a0a4ab] uppercase tracking-wider border-r border-[#8C7A3E]/20"><span className="pl-2">Name</span></th>
                  <th className="p-3 text-left text-[11px] font-bold text-[#a0a4ab] uppercase tracking-wider">Specialty</th>
                  {dbDays.map((day) => (
                    <th key={day} className="p-3 text-left text-[11px] font-bold text-[#a0a4ab] uppercase tracking-wider">{dayLabels[day]}</th>
                  ))}
                  <th className="sticky right-0 z-10 bg-[#f0f2f5] p-3 text-center text-[11px] font-bold text-[#a0a4ab] uppercase tracking-wider border-l border-[#8C7A3E]/20">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1a1d21] divide-y divide-gray-200">
                {doctors.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={dbDays.length + 3} className="p-8 text-center text-[#a0a4ab] italic">
                      No doctors found matching "{searchQuery}".
                    </td>
                  </tr>
                )}
                {doctors.map((doctor) => {
                  return (
                    <tr key={doctor.id} className="hover:bg-blue-900/20 transition-colors group">
                      <td className="sticky left-0 z-10 bg-[#1a1d21] group-hover:bg-blue-900/20 p-3 whitespace-nowrap text-sm font-semibold text-[#E6E6E3] border-r border-[#8C7A3E]/10">
                        <span className="pl-2">{doctor.name}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-sm text-[#a0a4ab]">{doctor.specialty}</td>
                      {dbDays.map((day) => {
                        const scheduleData = doctor.schedule?.[day];
                        let displayTime = '-';
                        if (typeof scheduleData === 'string') {
                          displayTime = scheduleData;
                        } else if (typeof scheduleData === 'object' && scheduleData !== null && scheduleData.jam) {
                          displayTime = scheduleData.jam;
                        }
                        return (
                          <td key={day} className="p-3 whitespace-nowrap text-xs text-[#a0a4ab]">
                            {displayTime}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-[#1a1d21] group-hover:bg-blue-900/20 p-2 whitespace-nowrap text-center text-sm border-l border-[#8C7A3E]/10">
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