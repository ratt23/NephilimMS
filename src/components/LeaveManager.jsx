// src/components/LeaveManager.jsx
import React, { useState, useEffect, useCallback } from 'react';

// Fungsi helper API (sama seperti di DoctorManager)
async function fetchApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error ${response.status}`);
  }
  return response.json();
}

// Helper untuk format tanggal yyyy-MM-dd
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

export default function LeaveManager() {
  const [leaves, setLeaves] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]); // Untuk dropdown
  const [formData, setFormData] = useState({
    doctor_id: '',
    start_date: '',
    end_date: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data cuti & data dokter
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Ambil data cuti dan data dokter secara bersamaan
      const [leavesData, doctorsData] = await Promise.all([
        fetchApi('/.netlify/functions/api/leaves'),
        fetchApi('/.netlify/functions/api/doctors/all')
      ]);
      setLeaves(leavesData);
      setAllDoctors(doctorsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit form cuti
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
        return;
    }
    setError(null);
    try {
      await fetchApi('/.netlify/functions/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      // Reset form dan ambil data baru
      setFormData({ doctor_id: '', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle hapus data cuti
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data cuti ini?')) {
      try {
        setError(null);
        await fetchApi(`/.netlify/functions/api/leaves?id=${id}`, {
          method: 'DELETE',
        });
        fetchData(); // Ambil data terbaru
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading) return <p>Memuat data...</p>;
  if (error && !isLoading) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-8">
      {/* Form Tambah Cuti */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Tambah Data Cuti Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Dropdown Dokter */}
          <div className="md:col-span-2">
            <label htmlFor="doctor_id" className="block text-sm font-medium text-gray-700">Nama Dokter</label>
            <select
              name="doctor_id"
              id="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Pilih Dokter --</option>
              {allDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>
          {/* Tanggal Mulai */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Mulai Cuti</label>
            <input
              type="date"
              name="start_date"
              id="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* Tanggal Selesai */}
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Selesai Cuti</label>
            <input
              type="date"
              name="end_date"
              id="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {/* Tombol Submit */}
          <div className="md:col-span-4">
             {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700"
            >
              Simpan Data Cuti
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Data Cuti */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Daftar Dokter Cuti</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Mulai</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Selesai</th>
                <th className="p-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="p-2 whitespace-nowrap text-sm font-medium text-gray-900">{leave.doctor_name}</td>
                  <td className="p-2 whitespace-nowrap text-sm text-gray-700">{formatDateForInput(leave.start_date)}</td>
                  <td className="p-2 whitespace-nowrap text-sm text-gray-700">{formatDateForInput(leave.end_date)}</td>
                  <td className="p-2 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}