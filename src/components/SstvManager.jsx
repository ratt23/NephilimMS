import React, { useState, useEffect, useCallback } from 'react';

// Fungsi helper API
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

// Komponen untuk satu baris dokter
function DoctorSstvRow({ doctor, currentImageUrl, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
      // 1. Upload ke Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataApi,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const secureUrl = data.secure_url;

      // 2. Simpan URL ke database kita via API
      await fetchApi('/.netlify/functions/api/sstv_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctor.id,
          image_url: secureUrl
        })
      });

      // 3. Beri tahu parent component untuk refresh UI
      onUploadSuccess(doctor.id, secureUrl);

    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <tr className="divide-x divide-gray-200">
      <td className="p-3 text-sm font-medium text-gray-900">{doctor.name}</td>
      <td className="p-3 text-sm text-gray-700">{doctor.specialty}</td>
      <td className="p-3 text-center">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded border mx-auto" />
        ) : (
          <span className="text-xs text-gray-400">Belum ada foto</span>
        )}
      </td>
      <td className="p-3 text-sm text-center">
        <label className="cursor-pointer rounded-md border border-gray-400 p-2 text-sm text-gray-700 hover:bg-gray-50">
          {isUploading ? "Mengupload..." : (currentImageUrl ? "Ganti" : "Upload")}
          <input
            type="file"
            onChange={handleImageUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={isUploading}
          />
        </label>
        {uploadError && <p className="text-red-600 text-xs mt-1">{uploadError}</p>}
      </td>
    </tr>
  );
}

// Komponen Utama
export default function SstvManager() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [sstvImages, setSstvImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Ambil semua dokter dan map gambar sstv
      const [doctorsData, imagesData] = await Promise.all([
        fetchApi('/.netlify/functions/api/doctors/all'), 
        fetchApi('/.netlify/functions/api/sstv_images')
      ]);
      setAllDoctors(doctorsData);
      setSstvImages(imagesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fungsi untuk update state secara lokal setelah upload
  const handleUploadSuccess = (doctorId, imageUrl) => {
    setSstvImages(prev => ({
      ...prev,
      [doctorId]: imageUrl
    }));
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manajemen Foto Slideshow (SSTV)</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload foto yang akan ditampilkan di TV Slideshow. Foto ini terpisah dari foto di website publik.
      </p>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="divide-x divide-gray-200">
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Dokter</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Preview Foto SSTV</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allDoctors.map((doctor) => (
              <DoctorSstvRow
                key={doctor.id}
                doctor={doctor}
                currentImageUrl={sstvImages[doctor.id]}
                onUploadSuccess={handleUploadSuccess}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}