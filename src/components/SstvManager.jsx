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

// Live Preview Modal Component
const LivePreviewModal = ({ device, onClose, isOnline }) => {
  if (!device) return null;
  const lastSeen = new Date(device.last_heartbeat).toLocaleString();

  // Determine if we are in local development
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // If local, assume slideshow is running on port 4000 (typical for this project structure)
  // In production, assume it is served at the same origin under /slideshow
  // Added ?preview=true to prevent new device registration
  const previewUrl = isLocal ? "http://localhost:4000/slideshow?preview=true" : "/slideshow?preview=true";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        <div className="bg-[#1a3e6e] text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            LIVE MONITOR: {device.friendly_name || device.device_id}
          </h3>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-100">
          {/* Left: Mini Browser / Visual Preview */}
          <div className="flex-1 flex flex-col border-r border-gray-200 relative bg-white">
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 truncate font-mono">
                {previewUrl}
              </div>
            </div>
            <div className="flex-1 relative bg-gray-200 overflow-hidden flex items-center justify-center">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0 transform origin-top-left"
                style={{ pointerEvents: 'none', transform: 'scale(1)', width: '100%', height: '100%' }} // Simple scale, or actual iframe
                title="Mini Browser Preview"
              />
              {/* Overlay to prevent interaction if desired, or let them interact */}
              <div className="absolute inset-0 z-10 bg-transparent"></div>
            </div>
            <div className="p-2 bg-yellow-50 text-yellow-800 text-[10px] text-center border-t border-yellow-100">
              *Tampilan ini adalah simulasi halaman slideshow (Preview Mode). Tidak akan terdaftar sebagai device baru.
            </div>
          </div>

          {/* Right: Data & Stats */}
          <div className="w-full md:w-80 bg-white p-6 flex flex-col gap-6 overflow-y-auto z-20 shadow-lg">
            <div>
              <div className="text-gray-400 text-xs uppercase font-bold mb-1">Last Reported Content</div>
              <div className="font-bold text-gray-800 text-lg leading-tight p-3 bg-blue-50 rounded border border-blue-100">
                {device.current_slide || "No Active Slide Data"}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-gray-400 text-xs uppercase font-bold">Last Heartbeat</div>
                <div className="font-mono text-gray-700 text-sm">{lastSeen}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs uppercase font-bold">IP Address</div>
                <div className="font-mono text-gray-700 text-sm">{device.ip_address || 'Unknown'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs uppercase font-bold">Browser Info</div>
                <div className="font-mono text-gray-600 text-xs break-words">{device.browser_info || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function DeviceStatusCard({ device, onRefresh, onPin, onRename, onPreview, onDelete }) {
  const isOnline = device.status === 'online' && (new Date() - new Date(device.last_heartbeat)) < 60000; // Online if heartbeat within 60s
  const lastSeen = new Date(device.last_heartbeat).toLocaleString();

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all ${device.is_pinned ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200'}`}>

      {/* Decorative TV Icon Background */}
      <div className="absolute -right-4 -top-4 text-gray-100 transform rotate-12 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5l1.5-2h4l1.5 2H19zm-7 5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 11a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" /></svg>
      </div>

      <div className="flex items-center justify-between z-10 mb-2">
        {/* Left Actions: Pin, Preview & Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPin(device.device_id, !device.is_pinned)}
            className={`p-1 rounded-full transition-colors ${device.is_pinned ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}
            title={device.is_pinned ? "Unpin Device" : "Pin Device"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={device.is_pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2V5a3 3 0 0 0-3-3Z" /></svg>
          </button>
          <button
            onClick={() => onPreview(device)}
            className="p-1 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Live Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
          <button
            onClick={() => onDelete(device.device_id, device.friendly_name || device.device_id)}
            className="p-1 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Device (Re-appears on next heartbeat)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>

        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      <div className="flex items-start justify-between z-10 gap-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Small TV Icon */}
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 group/edit">
                <span className="font-bold text-gray-800 text-sm truncate" title={device.friendly_name || device.device_id}>
                  {device.friendly_name || device.device_id}
                </span>
                <button
                  onClick={() => onRename(device.device_id, device.friendly_name)}
                  className="opacity-0 group-hover/edit:opacity-100 p-0.5 text-gray-400 hover:text-blue-600 transition-opacity"
                  title="Rename Device"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                </button>
              </div>
              {(device.friendly_name && device.friendly_name !== device.device_id) &&
                <div className="text-[10px] text-gray-400 font-mono truncate">{device.device_id}</div>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="z-10 mt-3 border-t border-gray-100 pt-2">
        <div className="text-[11px] text-gray-500 truncate" title={device.browser_info}>
          {device.browser_info || 'Unknown Browser'}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          {lastSeen}
        </div>
      </div>

      <button
        onClick={() => onRefresh(device.device_id)}
        className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold py-2 rounded transition-colors z-10 shadow-sm flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
        TRIGGER REFRESH
      </button>
    </div>
  );
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

// Accordion Section Component
const AccordionSection = ({ title, children, defaultOpen = true, activeCount = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden mb-4 transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            {title}
          </h2>
          {activeCount && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out origin-top ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function SstvManager() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [sstvImages, setSstvImages] = useState({});
  const [devices, setDevices] = useState([]);
  const [refreshIntervalHours, setRefreshIntervalHours] = useState('24'); // Default string '24' 
  const [managerTitle, setManagerTitle] = useState('Slideshow & TV Manager'); // State for Title
  const [previewDevice, setPreviewDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all data including settings for interval
      const [doctorsData, imagesData, devicesData, settingsData] = await Promise.all([
        fetchApi('/.netlify/functions/api/doctors/all'),
        fetchApi('/.netlify/functions/api/sstv_images'),
        fetchApi('/.netlify/functions/device-heartbeat?action=list'),
        fetchApi('/.netlify/functions/api/settings')
      ]);
      setAllDoctors(doctorsData);
      setSstvImages(imagesData);
      setDevices(devicesData);

      // Set Settings
      if (settingsData) {
        if (settingsData.slideshow_refresh_interval) {
          setRefreshIntervalHours(settingsData.slideshow_refresh_interval.value || '24');
        }
        if (settingsData.manager_title) {
          setManagerTitle(settingsData.manager_title.value || 'Slideshow & TV Manager');
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll status every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefreshDevice = async (deviceId) => {
    try {
      await fetchApi(`/.netlify/functions/device-heartbeat?action=trigger_refresh&deviceId=${deviceId}`);
      alert(`Refresh command sent to ${deviceId}`);
      fetchData();
    } catch (err) {
      alert("Failed to trigger refresh: " + err.message);
    }
  };

  const handlePinDevice = async (deviceId, newPinStatus) => {
    try {
      await fetchApi(`/.netlify/functions/device-heartbeat`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_meta',
          deviceId: deviceId,
          isPinned: newPinStatus
        })
      });
      fetchData(); // Refresh list to update sort
    } catch (err) {
      alert("Failed to pin device: " + err.message);
    }
  };

  const handleRenameDevice = async (deviceId, currentName) => {
    const newName = prompt("Enter new name for this TV device:", currentName || "");
    if (newName === null) return; // Cancelled

    try {
      await fetchApi(`/.netlify/functions /device-heartbeat`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_meta',
          deviceId: deviceId,
          friendlyName: newName
        })
      });
      fetchData();
    } catch (err) {
      alert("Failed to rename device: " + err.message);
    }
  };

  const handleDeleteDevice = async (deviceId, deviceName) => {
    if (!confirm(`Hapus device "${deviceName}"?\n\nDevice akan muncul kembali jika online lagi (soft delete).`)) {
      return;
    }

    try {
      await fetchApi(`/.netlify/functions/device-heartbeat`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'delete',
          deviceId: deviceId
        })
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete device: " + err.message);
    }
  };

  const handleApplySettings = async () => {
    setIsSavingSettings(true);
    try {
      // Save setting to DB
      await fetch('/.netlify/functions/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideshow_refresh_interval: { value: refreshIntervalHours, enabled: true },
          manager_title: { value: managerTitle, enabled: true }
        })
      });
      alert("Pengaturan berhasil disimpan.");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUploadSuccess = (doctorId, imageUrl) => {
    setSstvImages(prev => ({ ...prev, [doctorId]: imageUrl }));
  };

  if (isLoading && allDoctors.length === 0) return <LoadingSpinner />;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      {/* HEADER & CONFIG */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{managerTitle}</h2>
          <p className="text-sm text-gray-500">Monitor status TV dan atur konten slideshow.</p>
        </div>
      </div>

      {/* SECTION 0: GENERAL & SLIDESHOW SETTINGS */}
      <AccordionSection title="General & Slideshow Settings" activeCount="Config">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="bg-gray-50 border border-gray-100 rounded p-4 space-y-4">
              {/* Setting 1: Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Manager Page Title</label>
                <input
                  type="text"
                  value={managerTitle}
                  onChange={(e) => setManagerTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="e.g. Siloam Hospitals TV Manager"
                />
              </div>

              {/* Setting 2: Refresh Interval */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Auto Refresh Interval (Client)</label>
                <div className="flex gap-2">
                  <select
                    value={refreshIntervalHours}
                    onChange={(e) => setRefreshIntervalHours(e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors"
                  >
                    <option value="1">Setiap 1 Jam</option>
                    <option value="6">Setiap 6 Jam</option>
                    <option value="12">Setiap 12 Jam</option>
                    <option value="24">Setiap 24 Jam (Default)</option>
                    <option value="48">Setiap 48 Jam</option>
                  </select>
                  <button
                    onClick={handleApplySettings}
                    disabled={isSavingSettings}
                    className={`px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 ${isSavingSettings ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSavingSettings ? 'Saving...' : 'Apply'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Pengaturan ini akan disimpan ke server dan dimuat ulang saat halaman dibuka.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded p-4 text-sm text-blue-800">
              <h4 className="font-bold mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Info Konfigurasi
              </h4>
              <p className="mb-2"><strong>Manager Title:</strong> Ubah judul halaman manager ini untuk keperluan white-labeling / branding RS.</p>
              <p><strong>Refresh Interval:</strong> Frekuensi TV melakukan refresh otomatis. Semakin lama interval, semakin hemat bandwidth.</p>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* SECTION 1: DEVICE MONITORING */}
      <AccordionSection title="TV Device Status" activeCount={`${devices.length} Devices`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.length > 0 ? devices.map(d => (
            <DeviceStatusCard
              key={d.device_id}
              device={d}
              onRefresh={handleRefreshDevice}
              onPin={handlePinDevice}
              onRename={handleRenameDevice}
              onPreview={() => setPreviewDevice(d)}
              onDelete={handleDeleteDevice}
            />
          )) : (
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center text-gray-500 col-span-full">
              No connected TV devices found. Open <b>/slideshow</b> on a device to start monitoring.
            </div>
          )}
        </div>
      </AccordionSection>

      {/* SECTION 2: TOOLS & TABLE */}
      <AccordionSection title="Slideshow Content Manager" activeCount={`${allDoctors.length} Doctors`}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 rounded">
            <p>Upload photos here to be displayed on the TV Slideshow. These photos are separate from the public website profile photos.</p>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded">
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
      </AccordionSection>

      {/* PREVIEW MODAL */}
      {previewDevice && (
        <LivePreviewModal
          device={previewDevice}
          onClose={() => setPreviewDevice(null)}
          isOnline={previewDevice.status === 'online' && (new Date() - new Date(previewDevice.last_heartbeat)) < 60000}
        />
      )}

    </div>
  );
}