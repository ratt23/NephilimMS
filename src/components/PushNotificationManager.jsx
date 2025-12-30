import React, { useState, useEffect } from 'react';

// Fungsi helper API
async function fetchApi(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
    }
    return response.json();
}

export default function PushNotificationManager() {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeaves, setSelectedLeaves] = useState([]);
    const [formData, setFormData] = useState({
        heading: 'Info Dokter Cuti',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Format tanggal: 24 Des (Senin)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    useEffect(() => {
        // Ambil data cuti
        fetchApi('/.netlify/functions/api/leaves')
            .then(data => setLeaves(data))
            .catch(err => console.error("Gagal ambil cuti:", err));
    }, []);

    const handleCheckboxChange = (leave) => {
        const isSelected = selectedLeaves.some(l => l.id === leave.id);
        let newSelected;

        if (isSelected) {
            newSelected = selectedLeaves.filter(l => l.id !== leave.id);
        } else {
            // BATAS MAKSIMAL 5 DOKTER
            if (selectedLeaves.length >= 5) {
                alert("Maksimal pilih 5 dokter agar notifikasi tidak terlalu panjang.");
                return;
            }
            newSelected = [...selectedLeaves, leave];
        }

        setSelectedLeaves(newSelected);
        generateMessage(newSelected);
    };

    const generateMessage = (selectedList) => {
        if (selectedList.length === 0) {
            setFormData(prev => ({ ...prev, content: '' }));
            return;
        }

        // Kelompokkan pesan dengan format yang lebih rapi (Bullet points)
        const header = "📅 INFO CUTI DOKTER:";
        const details = selectedList.map(l => {
            // Gunakan - untuk bullet point sesuai request
            return `- ${l.doctor_name} (s.d ${formatDate(l.end_date)})`;
        }).join('\n'); // Pindah baris

        // Footer dihapus sesuai request

        const message = `${header}\n${details}`;
        setFormData(prev => ({ ...prev, content: message }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await fetchApi('/.netlify/functions/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heading: formData.heading,
                    content: formData.content
                })
            });
            setStatus({ type: 'success', message: 'Notifikasi berhasil dikirim!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Gagal mengirim: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Kirim Notifikasi Cuti</h2>

            {status.message && (
                <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* List Checkbox Cuti */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Dokter yang Sedang Cuti (Maks. 5):
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-gray-50">
                        {leaves.length === 0 ? (
                            <p className="text-gray-500 text-sm p-2">Tidak ada data cuti aktif.</p>
                        ) : (
                            leaves.map(leave => (
                                <div key={leave.id} className="flex items-start">
                                    <input
                                        id={`leave-${leave.id}`}
                                        type="checkbox"
                                        checked={selectedLeaves.some(l => l.id === leave.id)}
                                        onChange={() => handleCheckboxChange(leave)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                    />
                                    <label htmlFor={`leave-${leave.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer">
                                        <span className="font-semibold">{leave.doctor_name}</span>
                                        <br />
                                        <span className="text-gray-500 text-xs">
                                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                        </span>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        Terpilih: {selectedLeaves.length}/5
                    </p>
                </div>

                {/* Heading */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Notifikasi</label>
                    <input
                        type="text"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pesan (Otomatis / Edit Manual)</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">* Anda bisa mengedit pesan di atas sebelum dikirim.</p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
                    >
                        {loading ? 'Mengirim...' : 'Kirim Notifikasi ke Semua User'}
                    </button>
                </div>
            </form>
        </div>
    );
}
