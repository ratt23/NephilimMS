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

// Komponen Modal Kecil untuk Edit
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
      console.error("Gagal menyimpan alt text:", err);
      // Anda bisa menambahkan state error di sini jika mau
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Alt Text</h3>
        <form onSubmit={handleSubmit}>
          <img src={item.image_url} alt="Preview" className="w-full h-48 object-cover rounded mb-4" />
          <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700">
            Alt Text (Deskripsi Gambar)
          </label>
          <input
            type="text"
            id="alt_text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="cth: Promo Paket MCU"
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-md shadow hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
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
  
  // State untuk Modal Edit
  const [editingItem, setEditingItem] = useState(null);

  // Fungsi ambil data
  const fetchData = useCallback(async () => {
    try {
      // Kita set isLoading true hanya jika promos kosong
      // agar tabel tidak berkedip saat reorder
      if (promos.length === 0) setIsLoading(true);
      setError(null);
      const data = await fetchApi('/.netlify/functions/api/promos');
      setPromos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [promos.length]); // dependensi

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Hanya panggil sekali saat mount

  // Fungsi upload gambar
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

  // Fungsi hapus
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus gambar promo ini?')) {
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

  // Fungsi edit alt text
  const handleSaveAltText = async (id, altText) => {
    try {
        await fetchApi(`/.netlify/functions/api/promos?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alt_text: altText })
        });
        fetchData(); // Refresh data
    } catch (err) {
        setError(err.message);
        throw err; // Lempar error agar modal tahu
    }
  };

  // Fungsi reorder (naik/turun)
  const handleReorder = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= promos.length) return;

    // 1. Buat array baru dan tukar posisi
    const newPromos = [...promos];
    [newPromos[index], newPromos[swapIndex]] = [newPromos[swapIndex], newPromos[index]];

    // 2. Buat array ID baru
    const orderedIds = newPromos.map(p => p.id);

    // 3. Update UI secara optimis (langsung)
    setPromos(newPromos); 

    try {
      // 4. Kirim urutan baru ke API
      await fetchApi('/.netlify/functions/api/promos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
      // 5. Jika berhasil, tidak perlu refresh (UI sudah update)
      //    Jika gagal, panggil fetchData() untuk kembali ke state server
    } catch (err) {
      setError("Gagal menyimpan urutan. Memuat ulang.");
      fetchData(); // Revert ke state server jika gagal
    }
  };

  // Helper format tanggal
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manajemen Gambar Promo</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload atau hapus gambar promo yang akan ditampilkan di SSTV. Klik panah untuk mengubah urutan.
      </p>

      {/* Tombol Upload */}
      <div className="mb-6">
        <label className="w-full md:w-auto inline-flex items-center justify-center cursor-pointer rounded-md border border-gray-400 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {isUploading ? "Mengupload..." : "✚ Upload Promo Baru"}
          <input
            type="file"
            onChange={handleImageUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            disabled={isUploading}
          />
        </label>
        {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Tabel Promo */}
      {isLoading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-200">
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Alt Text</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Tgl Upload</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promos.map((promo, index) => (
                <tr key={promo.id} className="divide-x divide-gray-200">
                  <td className="p-3 text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={() => handleReorder(index, 'up')} 
                        disabled={index === 0}
                        className="text-blue-600 disabled:text-gray-300"
                        title="Naik"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM5.22 6.22a.75.75 0 011.06 0L10 9.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" transform="rotate(180 10 10)"/></svg>
                      </button>
                      <button 
                        onClick={() => handleReorder(index, 'down')} 
                        disabled={index === promos.length - 1}
                        className="text-blue-600 disabled:text-gray-300"
                        title="Turun"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM5.22 6.22a.75.75 0 011.06 0L10 9.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 7.28a.75.75 0 010-1.06z"/></svg>
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    <img src={promo.image_url} alt={promo.alt_text} className="h-20 w-32 object-cover rounded" />
                  </td>
                  <td className="p-3 text-sm text-gray-700">{promo.alt_text || "-"}</td>
                  <td className="p-3 text-sm text-gray-700">{formatDate(promo.uploaded_at)}</td>
                  <td className="p-3 text-sm text-gray-700 space-x-2">
                    <button
                      onClick={() => setEditingItem(promo)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit */}
      {editingItem && (
        <EditModal 
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveAltText}
        />
      )}
    </div>
  );
}