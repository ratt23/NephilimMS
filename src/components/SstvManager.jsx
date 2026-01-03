import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Helper API function
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

// Component for a single doctor row
function DoctorSstvRow({ doctor, currentImageUrl, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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
      // 1. Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formDataApi,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const secureUrl = data.secure_url;

      // 2. Save URL to our database via API
      await fetchApi('/.netlify/functions/api/sstv_images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctor.id,
          image_url: secureUrl
        })
      });

      // 3. Notify parent component to refresh UI
      onUploadSuccess(doctor.id, secureUrl);

    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <tr className="hover:bg-blue-50 transition-colors group border-b border-gray-100">
      <td className="p-3 text-sm font-semibold text-gray-800 border-l border-r border-gray-100">{doctor.name}</td>
      <td className="p-3 text-sm text-gray-600 border-r border-gray-100">{doctor.specialty}</td>
      <td className="p-3 text-center border-r border-gray-100 bg-gray-50">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Preview" className="w-20 h-20 object-cover rounded border border-gray-300 mx-auto shadow-sm" />
        ) : (
          <span className="text-xs text-gray-400 italic">No image yet</span>
        )}
      </td>
      <td className="p-3 text-sm text-center border-r border-gray-100">
        <div className="flex flex-col items-center">
          <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded shadow-sm text-white ${currentImageUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
            {isUploading ? "Uploading..." : (currentImageUrl ? "Change Photo" : "Upload Photo")}
            <input
              type="file"
              onChange={handleImageUpload}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              disabled={isUploading}
            />
          </label>
          {uploadError && <p className="text-red-600 text-[10px] mt-1">{uploadError}</p>}
        </div>
      </td>
    </tr>
  );
}

// Main Component
export default function SstvManager() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [sstvImages, setSstvImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch all doctors and sstv map
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

  // Function to update state locally after upload
  const handleUploadSuccess = (doctorId, imageUrl) => {
    setSstvImages(prev => ({
      ...prev,
      [doctorId]: imageUrl
    }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white border border-gray-200 shadow-sm rounded-none">
        {/* TOOLBAR */}
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <span>Slideshow Manager (SSTV)</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{allDoctors.length}</span>
          </h2>
        </div>

        <div className="bg-blue-50 border-b border-blue-100 p-4 text-sm text-blue-800">
          <p>Upload photos here to be displayed on the TV Slideshow. These photos are separate from the public website profile photos.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f0f2f5]">
              <tr>
                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Doctor Name</th>
                <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Specialty</th>
                <th className="p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">SSTV Preview</th>
                <th className="p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider">Actions</th>
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
    </div>
  );
}