import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

// --- Fungsi Helper API ---
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

// --- State Awal, Consts ---
const initialState = { id: null, name: '', specialty: '', image_url: '', schedule: {} };
const DOCTORS_PER_PAGE = 30;
const daysOfWeek = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

// --- Modal Style (dengan z-index fix) ---
const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '600px', maxHeight: '90vh',
    overflowY: 'auto', padding: '2rem', borderRadius: '8px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 50 
  },
};

// --- Komponen SearchInput ---
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
    <input
      type="text" value={internalValue}
      onChange={(e) => setInternalValue(e.target.value)}
      placeholder="Cari nama atau spesialisasi..."
      className="block w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
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

  // --- Fungsi Fetch (Ambil Dokter & Spesialisasi) ---
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
  
  // --- Fungsi Refresh Spesialisasi ---
  const refreshSpecialties = useCallback(async () => {
    try {
        const specialties = await fetchApi('/.netlify/functions/api/specialties');
        setSpecialtyList(specialties);
    } catch (err) {
        console.error("Gagal refresh specialties:", err);
    }
  }, []);

  // --- Fungsi Handle Search ---
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); 
  }, []);

  // --- Fungsi Handle Form Biasa ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);
  
  // --- Fungsi Handle Form Jadwal ---
  const handleScheduleChange = useCallback((day, value) => {
    setFormData((prev) => ({ ...prev, schedule: { ...prev.schedule, [day]: value } }));
  }, []);

  // --- Fungsi Upload Cloudinary ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ===================================
    // ===       PERUBAHAN DI SINI       ===
    // ===================================
    // Ambil variabel dari Environment, BUKAN hardcode
    // Variabel ini harus diawali VITE_ agar bisa dibaca frontend
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    // ===================================

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        setUploadError("Kredensial Cloudinary belum diatur.");
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
        throw new Error(data.error.message || 'Gagal upload ke Cloudinary');
      }
    } catch (err) {
      setUploadError(err.message);
      console.error("Cloudinary upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Fungsi Helper Modal ---
  const closeModalAndRefresh = useCallback(() => {
    setIsModalOpen(false);
    refreshSpecialties(); 
    if (searchQuery !== '') setSearchQuery(''); 
    if (currentPage !== 1) setCurrentPage(1);
    else fetchDoctors();
  }, [searchQuery, currentPage, fetchDoctors, refreshSpecialties]);

  // --- Fungsi Handle Submit (Create/Update) ---
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

  // --- Fungsi Handle Delete ---
  const handleDelete = useCallback(async (doctor) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${doctor.name}?`)) {
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

  // --- Fungsi Buka/Tutup Modal ---
  const openAddNewModal = useCallback(() => {
    setEditMode(false); setFormData(initialState);
    setError(null); setUploadError(null); setIsModalOpen(true);
  }, []);
  
  const openEditModal = useCallback((doctor) => {
    setEditMode(true);
    const normalizedSchedule = {};
    const rawSchedule = doctor.schedule || {};
    for (const day of daysOfWeek) {
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
  
  // --- Tampilan (Render) ---
  return (
    <div className="space-y-8">
      
      {/* --- MODAL --- */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Form Dokter">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{editMode ? 'Edit Dokter' : 'Tambah Dokter Baru'}</h2>
          <button onClick={closeModal} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Dokter</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Spesialisasi</label>
            <input
              type="text"
              name="specialty"
              id="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              list="specialties-list" 
            />
            <datalist id="specialties-list">
              {specialtyList.map((spec) => (
                <option key={spec} value={spec} />
              ))}
            </datalist>
          </div>
          
          {/* --- Input Upload Gambar --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL Gambar</label>
            {formData.image_url && (
              <div className="mt-1 flex items-center gap-2">
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded object-cover border" />
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={handleChange}
                  name="image_url"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            )}
            <label className="mt-2 block w-full cursor-pointer rounded-md border border-dashed border-gray-400 p-2 text-center text-sm text-gray-700 hover:bg-gray-50">
              {isUploading ? "Mengupload..." : (formData.image_url ? "Ganti Gambar" : "Upload Gambar")}
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={isUploading}
              />
            </label>
            {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
          </div>

          {/* --- Input Jadwal --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jadwal Praktik</label>
            <div className="space-y-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="grid grid-cols-3 gap-2 items-center">
                  <label htmlFor={`modal-${day}`} className="capitalize text-sm font-medium text-gray-600 col-span-1">{day}</label>
                  <input
                    type="text"
                    id={`modal-${day}`}
                    name={day}
                    value={formData.schedule[day] || ''}
                    onChange={(e) => handleScheduleChange(day, e.target.value)}
                    placeholder="Contoh: 09:00 - 12:00"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 col-span-2"
                  />
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          {/* --- Tombol Form --- */}
          <div className="flex space-x-4 pt-4">
            <button type="submit" className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700">
              {editMode ? 'Update Dokter' : 'Simpan Dokter'}
            </button>
            <button type="button" onClick={closeModal} className="py-2 px-6 bg-gray-300 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-400">
              Batal
            </button>
          </div>
        </form>
      </Modal>

      
      {/* === BAGIAN DAFTAR DOKTER (MAIN) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Daftar Dokter ({totalDoctors})</h2>
          <button
            onClick={openAddNewModal}
            className="py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
          >
            + Tambah Dokter Baru
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <SearchInput value={searchQuery} onChange={handleSearchChange} />
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="py-1 px-3 bg-gray-200 rounded disabled:opacity-50">
                &lt; Sebelumnya
              </button>
              <span className="text-sm font-medium">
                Halaman {currentPage} / {totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="py-1 px-3 bg-gray-200 rounded disabled:opacity-50">
                Berikutnya &gt;
              </button>
            </div>
          )}
        </div>

        {/* --- Tabel Sticky --- */}
        {isLoading ? (
          <p>Memuat data...</p>
        ) : error ? (
           <p className="text-red-600">Error: {error}</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg"> 
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 p-2 text-left text-xs font-medium text-gray-500 uppercase"><span className="pl-2">Nama</span></th>
                  <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="p-2 text-left text-xs font-medium text-gray-500 uppercase capitalize">{day}</th>
                  ))}
                  <th className="sticky right-0 z-10 bg-gray-50 p-2 text-left text-xs font-medium text-gray-500 uppercase"><span className="pr-2">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={daysOfWeek.length + 3} className="p-4 text-center text-gray-500">
                      Tidak ada dokter yang cocok dengan pencarian "{searchQuery}".
                    </td>
                  </tr>
                )}
                {doctors.map((doctor) => {
                  return (
                    <tr key={doctor.id}>
                      <td className="sticky left-0 z-10 bg-white p-2 whitespace-nowrap text-sm font-medium text-gray-900"><span className="pl-2">{doctor.name}</span></td>
                      <td className="p-2 whitespace-nowrap text-sm text-gray-700">{doctor.specialty}</td>
                      {daysOfWeek.map((day) => {
                        const scheduleData = doctor.schedule?.[day];
                        let displayTime = '-';
                        if (typeof scheduleData === 'string') {
                          displayTime = scheduleData;
                        } else if (typeof scheduleData === 'object' && scheduleData !== null && scheduleData.jam) {
                          displayTime = scheduleData.jam;
                        }
                        return (
                          <td key={day} className="p-2 whitespace-nowrap text-sm text-gray-600">
                            {displayTime}
                          </td>
                        );
                      })}
                      <td className="sticky right-0 z-10 bg-white p-2 whitespace-nowrap text-sm font-medium space-x-2">
                        <span className="pr-2">
                          <button onClick={() => openEditModal(doctor)} className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button onClick={() => handleDelete(doctor)} className="text-red-600 hover:text-red-900">Delete</button>
                        </span>
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