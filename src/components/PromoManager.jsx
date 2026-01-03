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

// Edit Modal Component
function EditModal({ item, onClose, onSave }) {
  const [altText, setAltText] = useState(item.alt_text || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(item.id, altText);
      onClose();
    } catch (err) {
      console.error("Failed to save alt text:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#1a3e6e] px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">Edit Description</h3>
          <button onClick={onClose} className="text-white hover:text-gray-300 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <img src={item.image_url} alt="Preview" className="w-full h-48 object-cover rounded border border-gray-200" />
          </div>
          <div className="mb-6">
            <label htmlFor="alt_text" className="block text-sm font-bold text-gray-700 uppercase mb-1">
              Alt Text (Description)
            </label>
            <input
              type="text"
              id="alt_text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="e.g., Medical Check Up Promo"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-100 text-gray-700 font-bold uppercase text-xs rounded-sm shadow-sm hover:bg-gray-200 border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 bg-blue-600 text-white font-bold uppercase text-xs rounded-sm shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function PromoManager() {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      // Only set loading true if empty to prevent flicker
      if (promos.length === 0) setIsLoading(true);
      setError(null);
      const data = await fetchApi('/.netlify/functions/api/promos');
      setPromos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [promos.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Image Upload
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
      if (!response.ok) throw new Error(data.error.message);

      const secureUrl = data.secure_url;

      await fetchApi('/.netlify/functions/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: secureUrl,
          alt_text: file.name
        })
      });

      fetchData(); // Refresh data

    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo image?')) {
      try {
        await fetchApi(`/.netlify/functions/api/promos?id=${id}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Save Alt Text
  const handleSaveAltText = async (id, altText) => {
    try {
      await fetchApi(`/.netlify/functions/api/promos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: altText })
      });
      fetchData(); // Refresh
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reorder
  const handleReorder = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= promos.length) return;

    // 1. Swap
    const newPromos = [...promos];
    [newPromos[index], newPromos[swapIndex]] = [newPromos[swapIndex], newPromos[index]];

    // 2. Get Ordered Ids
    const orderedIds = newPromos.map(p => p.id);

    // 3. Optimistic Update
    setPromos(newPromos);

    try {
      // 4. API Call
      await fetchApi('/.netlify/functions/api/promos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      setError("Failed to save order. Reloading.");
      fetchData(); // Revert
    }
  };

  // Date Formatter
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-white border border-gray-200 shadow-sm rounded-none">

        {/* TOLBAR */}
        <div className="bg-white p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <span>Promo Manager (SSTV)</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{promos.length}</span>
          </h2>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-1 py-1.5 px-3 bg-green-600 text-white font-bold uppercase text-xs rounded-sm shadow-sm hover:bg-green-700 transition-colors">
              {isUploading ? "Uploading..." : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  <span>New Promo</span>
                </>
              )}
              <input
                type="file"
                onChange={handleImageUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border-b border-blue-100 p-4 text-sm text-blue-800">
          <p>Upload promo images to be displayed on the SSTV slideshow. Use the arrows to reorder them.</p>
        </div>

        {uploadError && <p className="px-4 pt-2 text-red-600 text-sm">{uploadError}</p>}
        {error && <p className="px-4 pt-2 text-red-600 text-sm">{error}</p>}

        {/* Promo Table */}
        {isLoading ? (
          <div className="p-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f0f2f5]">
                <tr>
                  <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-16 text-center">Order</th>
                  <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Preview</th>
                  <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Description (Alt Text)</th>
                  <th className="p-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Date Uploaded</th>
                  <th className="p-3 text-center text-[11px] font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">No promos uploaded yet.</td>
                  </tr>
                )}
                {promos.map((promo, index) => (
                  <tr key={promo.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="p-3 text-sm text-gray-500 border-r border-gray-100">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                          className="text-blue-600 disabled:text-gray-300 hover:bg-blue-100 rounded p-0.5"
                          title="Move Up"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM5.22 6.22a.75.75 0 011.06 0L10 9.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" transform="rotate(180 10 10)" /></svg>
                        </button>
                        <button
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === promos.length - 1}
                          className="text-blue-600 disabled:text-gray-300 hover:bg-blue-100 rounded p-0.5"
                          title="Move Down"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM5.22 6.22a.75.75 0 011.06 0L10 9.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 7.28a.75.75 0 010-1.06z" /></svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-500 border-r border-gray-100">
                      <img src={promo.image_url} alt={promo.alt_text} className="h-16 w-auto object-cover rounded border border-gray-200 shadow-sm" />
                    </td>
                    <td className="p-3 text-sm text-gray-700 font-medium border-r border-gray-100">{promo.alt_text || "-"}</td>
                    <td className="p-3 text-xs text-gray-500 border-r border-gray-100">{formatDate(promo.uploaded_at)}</td>
                    <td className="p-3 text-sm text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => setEditingItem(promo)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <EditModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleSaveAltText}
          />
        )}
      </div>
    </div>
  );
}